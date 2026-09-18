/**
 * Re-shoot the README whale stills and animations from the standalone preview.
 *
 *   node scripts/demo-shots.mjs                    # both themes
 *   node scripts/demo-shots.mjs --theme dark
 *
 * `--url` captures an already-running page instead of the local preview (the
 * README's "inside the real Harness UI" shots do this against a throw-away
 * Harness home) and `--prefix` renames the pair, e.g.
 * `--url "$URL" --prefix harness-ui`; `--init-script <path>` rides along to the
 * browser so such a target can prepare its own page.
 *
 * The animation is driven by scripts/demo-clock.js rather than by wall time:
 * every frame advances exactly 100 ms of animation and the GIF is assembled at
 * 50 ms per frame, which is the "2x speed" the README promises. Capturing on
 * wall time does not work — one screenshot costs about a second, so a loop that
 * asks for 18 frames 100 ms apart lands them ~1 s apart instead: the assembled
 * GIF then plays a ~20x time lapse, and the renderer's slow-machine guards (glow
 * budget, auto quality) fire midway, which is how the whale came to shake and to
 * dim halfway through the shipped demo.
 *
 * Needs `agent-browser` on PATH, python3 with Pillow for the GIF/JPEG assembly
 * (the README's preview server needs python3 anyway) and a built repo
 * (`pnpm build`) so `preview.js` exists. Set `DEMO_CHROMIUM` to pin a browser
 * binary and `AGENT_BROWSER_ARGS` for launch flags the host needs, e.g.
 * `AGENT_BROWSER_ARGS=--no-sandbox` inside a container.
 */
import { execFileSync, spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { mkdtempSync, rmSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const VIEWPORT = { width: 1600, height: 1000 }
const GIF = { width: 960, height: 600 }
/** The wallpaper canvas — the same layer class in the preview and the shell. */
const CANVAS = 'document.querySelector(".dsh-harness-whale-wallpaper canvas")'

const argv = process.argv.slice(2)
const option = (name, fallback) => {
  const index = argv.indexOf(`--${name}`)
  return index === -1 || argv[index + 1] === undefined ? fallback : argv[index + 1]
}

const themes = option('theme', 'both') === 'both' ? ['dark', 'light'] : [option('theme')]
const frames = Number(option('frames', 18))
const step = Number(option('step', 100))
const delay = Number(option('delay', 50))
const shots = resolve(ROOT, option('out', 'docs/screenshots'))
const prefix = option('prefix', 'harness-whale')
// `--url` only names the pair: the page under capture already has its theme.
const target = option('url', null)
const runs = target === null ? themes : [option('theme', 'dark')]
const clockSource = await readFile(join(ROOT, 'scripts/demo-clock.js'), 'utf8')

if (target === null) {
  for (const file of ['index.html', 'style.css', 'favicon.svg', 'preview.js']) {
    await readFile(join(ROOT, file))
  }
}

// ---------------------------------------------------------------------------
// The preview page, served straight from the repo like the README's
// `python3 -m http.server` recipe, on a port the OS picks.
// ---------------------------------------------------------------------------

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
}

const server = createServer(async (request, response) => {
  const path = new URL(request.url, 'http://127.0.0.1').pathname
  const file = resolve(ROOT, `.${path === '/' ? '/index.html' : path}`)
  if (!file.startsWith(ROOT) || TYPES[extname(file)] === undefined) {
    response.writeHead(404).end('not found')
    return
  }
  try {
    const body = await readFile(file)
    response.writeHead(200, { 'content-type': TYPES[extname(file)], 'cache-control': 'no-store' })
    response.end(body)
  } catch {
    response.writeHead(404).end('not found')
  }
})

await new Promise((done) => server.listen(0, '127.0.0.1', done))
const origin = `http://127.0.0.1:${server.address().port}`

// ---------------------------------------------------------------------------
// agent-browser plumbing. Every child runs asynchronously on purpose: the
// preview is served from this process, so a blocking child would starve the
// page load the browser is waiting for.
// ---------------------------------------------------------------------------

const browser = [
  ...(process.env.DEMO_CHROMIUM === undefined ? [] : ['--executable-path', process.env.DEMO_CHROMIUM]),
  // `--init-script` is how a `--url` target prepares its own page (the Harness
  // shots dismiss a first-run gate that way).
  ...(option('init-script', null) === null ? [] : ['--init-script', option('init-script')]),
]

const run = (args, input) => new Promise((resolve, reject) => {
  const child = spawn('agent-browser', [...browser, ...args], { stdio: ['pipe', 'pipe', 'pipe'] })
  let stdout = ''
  let stderr = ''
  child.stdout.on('data', (chunk) => { stdout += chunk })
  child.stderr.on('data', (chunk) => { stderr += chunk })
  child.on('error', reject)
  child.on('close', (code) => {
    if (code === 0) resolve(stdout)
    else reject(new Error(`agent-browser ${args.join(' ')} failed (${code}): ${stderr.trim()}`))
  })
  if (input !== undefined) child.stdin.write(input)
  child.stdin.end()
})

const evaluate = async (expression) => {
  const lines = (await run(['eval', expression])).trim().split('\n')
  // `agent-browser eval` prints its result JSON-encoded, and a page value that
  // is itself a JSON string (every expression here) arrives double encoded.
  let value = lines[lines.length - 1].trim()
  for (let decode = 0; decode < 2; decode += 1) {
    try {
      value = JSON.parse(value)
    } catch {
      break
    }
  }
  return value
}

/** Walk the animation forward and refuse to capture a frame that took >24 ms. */
const advance = async (ms) => {
  const state = await evaluate(
    `JSON.stringify(Object.assign({advance:window.__hwwClock.advance(${ms})},` +
      `Object.assign({},${CANVAS}.dataset)))`,
  )
  if (state.advance.queued !== 1) {
    throw new Error(`the wallpaper did not re-request a frame (queued ${state.advance.queued})`)
  }
  // A slow frame lets the glow budget or the auto-quality path fire, and the
  // captured look stops matching the shipped one. `data-glow` only exists once
  // the pass is gone, so an absent attribute means it is still on.
  if (state.glow !== undefined) {
    throw new Error(`the glow pass is ${state.glow}: a frame longer than 24 ms got through`)
  }
  return state
}

const ASSEMBLE = `
import glob, os, sys
from PIL import Image

shots, work, name, delay = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4])

still = Image.open(os.path.join(work, 'still.png')).convert('RGB')
still.save(os.path.join(shots, f'{name}.jpg'), quality=88, optimize=True)

paths = sorted(glob.glob(os.path.join(work, 'frame-*.png')))
gif = [
    Image.open(path).convert('RGB').resize((${GIF.width}, ${GIF.height}), Image.LANCZOS)
    .convert('P', palette=Image.ADAPTIVE, colors=128)
    for path in paths
]
out = os.path.join(shots, f'{name}.gif')
gif[0].save(out, save_all=True, append_images=gif[1:], duration=delay, loop=0, optimize=True)
print(f'{name}.jpg {still.width}x{still.height}  |  '
      f'{name}.gif {len(gif)} frames, {os.path.getsize(out) // 1024} KiB')
`

const shoot = async () => {
  const work = mkdtempSync(join(tmpdir(), 'hww-shots-'))
  try {
    for (const theme of runs) {
      await run(['set', 'viewport', String(VIEWPORT.width), String(VIEWPORT.height)])
      await run(['open', target ?? `${origin}/?theme=${theme}&preset=calm&ui=0`])

      for (let tries = 0; ; tries += 1) {
        const dataset = await evaluate(`JSON.stringify((${CANVAS}||{dataset:{}}).dataset)`)
        if (dataset.renderer !== undefined) break
        if (tries > 120) throw new Error('the wallpaper never mounted')
        await new Promise((done) => setTimeout(done, 250))
      }

      // Hand the clock to the page, then settle opacity, pointer ease and mist
      // at a steady 60 Hz before the first captured frame.
      await run(['eval', '--stdin'], clockSource)
      await run(['mouse', 'move', '120', '900'])
      await advance(2000)
      await evaluate('JSON.stringify(window.__hwwClock.toYawTurn())')

      await run(['screenshot', join(work, 'still.png')])
      for (let n = 1; n <= frames; n += 1) {
        await run(['mouse', 'move', String(900 + n * 34), String(450 + (n % 5) * 30)])
        await advance(step)
        await run(['screenshot', join(work, `frame-${String(n).padStart(2, '0')}.png`)])
      }

      const name = `${prefix}-${theme}`
      const assembled = execFileSync(
        'python3',
        ['-c', ASSEMBLE, shots, work, name, String(delay)],
        { encoding: 'utf8' },
      )
      const span = (frames * step) / 1000
      const played = (frames * delay) / 1000
      console.log(
        `${name}: ${frames} frames, ${span.toFixed(1)} s of animation in a ${played.toFixed(1)} s loop ` +
          `(${(span / played).toFixed(1)}x), full-strength glow throughout`,
      )
      console.log(`  ${assembled.trim()}`)
    }
  } finally {
    try {
      await run(['close'])
    } catch { /* browser already gone */ }
    rmSync(work, { recursive: true, force: true })
    server.close()
  }
}

await shoot()
