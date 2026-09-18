import { readFile } from 'node:fs/promises'

/**
 * Bundle, shell-contract and palette checks.
 *
 * `check.mjs` is the tripwire for the two ways this plugin has actually broken:
 * a Harness rename that lets the shell cover the wallpaper again, and ink
 * constants drifting until the whale reads pale. The palette section models the
 * fragment shader arithmetically — it is a contract test on the constants, not a
 * pixel measurement (the preview harness and `docs/compatibility.md` cover the
 * rendered side).
 */

const required = [
  'lib/index.js',
  'lib/client.js',
  'preview.js',
  'cordis.patch.yml',
  'favicon.svg',
  'docs/screenshots/harness-whale-light.jpg',
  'docs/screenshots/harness-whale-dark.jpg',
]

for (const path of required) {
  const body = await readFile(path, 'utf8')
  if (body.length === 0) throw new Error(`${path} is empty`)
}

const client = await readFile('lib/client.js', 'utf8')

for (const marker of [
  'shell.overlay',
  'webgl2',
  'prefers-reduced-motion',
  'theme/change',
  'overrideTokens',
  'uFlowStrength',
  'uColorScheme',
  'watchShellIntegrity',
]) {
  if (!client.includes(marker)) throw new Error(`client bundle misses ${marker}`)
}

console.log('bundle structure OK')

// ---------------------------------------------------------------------------
// Shell contract: the surfaces that may cover the wallpaper, and what they may
// paint. Keep both slot spellings — Harness <= 0.1.2 used "conversation", 0.1.5+
// uses "main.conversation", and the frame lost its [data-details-collapsed]
// attribute, so it must stay matched structurally.
// ---------------------------------------------------------------------------

const CONTRACT = [
  ['shell frame stays clear', '#root > [data-slot="root"] > *'],
  ['legacy conversation hook', '[data-slot="conversation"] > [data-phase]'],
  ['current conversation hook', '[data-slot="main.conversation"] > [data-phase]'],
  ['welcome screen stays clear', '[data-phase="hero"]'],
  ['reading scrim token', 'var(--hww-reading-scrim)'],
  ['banded reading scrim', 'dsh-whale-reading-scrim'],
  ['band scrim uses the soft token', 'background: var(--hww-reading-scrim-soft)'],
  ['column scrim is the fallback only', ':not([data-hww-zones="on"])'],
  ['welcome halo', 'text-shadow: 0 0 10px var(--hww-hero-halo)'],
  ['live build marker', '.dataset.version = "'],
  ['reading-zone uniforms', 'uZoneCount'],
  ['reading-zone softening', 'zoneMask'],
  ['zone state attribute', 'data-hww-zones'],
  ['welcome-screen showcase', 'setShowcase'],
  ['showcase state attribute', 'data-hww-showcase'],
  ['half-resolution glow pass', 'renderGlow'],
  ['preset state attribute', 'data-hww-preset'],
  ['preset-driven glow', 'GLOW_STRENGTH[this.config.preset]'],
  ['glow frame budget', 'GLOW_BUDGET_MS'],
]

for (const [label, needle] of CONTRACT) {
  if (!client.includes(needle)) throw new Error(`shell contract broken (${label}): missing ${needle}`)
}

const scrims = [...client.matchAll(/--hww-reading-scrim(?:-soft)?: rgba\([^)]*?([0-9.]+)\);/g)].map((match) =>
  Number.parseFloat(match[1]),
)
if (scrims.length !== 4) throw new Error(`expected light/dark solid+soft reading scrims, found ${scrims.length}`)
for (const alpha of scrims) {
  if (!(alpha >= 0.3 && alpha <= 0.7)) {
    throw new Error(
      `reading scrim alpha ${alpha} is outside 0.35..0.7: below the floor text loses ` +
        'protection, above it the whale reads pale behind the reader',
    )
  }
}

// The band layer must be the one that covers text: if the column ever paints a
// background again while the zones are measured, the whole whale goes grey.
const bandedColumn = /\[data-hww-zones="on"\][^{]*\{[^}]*background:\s*transparent\s*!important/.exec(client)
if (bandedColumn === null) {
  throw new Error(
    'shell contract broken (banded scrim): the conversation column must be transparent while ' +
      'reading zones are measured, otherwise the scrim washes the whale twice',
  )
}

console.log(`shell contract OK (reading scrim ${scrims.join(' / ')}, banded)`)

// ---------------------------------------------------------------------------
// Palette contract ("never pale again"): model the dot composite for light and
// dark at the three activity levels and require a contrast floor against the
// pool behind the whale.
// ---------------------------------------------------------------------------

const groups = (source, pattern, label) => {
  const match = pattern.exec(source)
  if (match === null) throw new Error(`shader contract broken: cannot read ${label}`)
  return match.slice(1).map((raw) =>
    raw.includes(',') ? raw.split(',').map((part) => Number.parseFloat(part)) : Number.parseFloat(raw),
  )
}

// The whale's alpha curve, not the dust one (`vAlpha = (0.055 + seed * 0.08) …`).
const [alphaFloor, alphaSpread] = groups(
  client,
  /vAlpha = \(([0-9.]+) \+ seed \* ([0-9.]+)\) \* uOpacity \* uBrightness/,
  'vAlpha',
)
const [zoneAlpha] = groups(client, /ZONE_ALPHA = ([0-9.]+)/, 'zoneAlpha')
const [darkBase, darkCool, darkTint] = groups(
  client,
  /darkWhale = mix\(vec3\(([^)]*)\), vec3\(([^)]*)\), vCool \* ([0-9.]+)\);/,
  'darkWhale',
)
const [darkFloor, darkScale] = groups(
  client,
  /float darkInk = vKind > 0\.5 \? vAlpha : ([0-9.]+) \+ ([0-9.]+) \* vAlpha;/,
  'darkInk',
)
const [darkBoost] = groups(client, /float darkAlpha = edge \* darkInk \* ([0-9.]+);/, 'darkAlpha')
const [lightInk] = groups(client, /vec3 lightWhale = vec3\(([^)]*)\);/, 'lightWhale')
const [lightBoost] = groups(client, /float lightAlpha = vAlpha \* ([0-9.]+) \* mix\(/, 'lightAlpha')

const luma = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b
const mix = (a, b, t) => a.map((value, index) => value + (b[index] - value) * t)
const POOL = { light: [238, 245, 255], dark: [10, 35, 68] }
const BRIGHTNESS = 0.9
const ACTIVITY = { idle: 1, session: 0.78, active: 0.5 }
const VCOOL = 0.24 // depth 0, the middle of the cloud
const SEED = 0.5
const FLOOR = { idle: 200, session: 160, active: 120 }

const base = alphaFloor + alphaSpread * SEED

/*
 * The floors above are a promise about everything that is *not* behind text: with
 * the scrim scoped to the measured bands, the ink keeps its full strength in the
 * margins, which is the whole point of the banding. Behind text the scrim is the
 * readability lever instead, so model that state as well: it has to lower the
 * dot/pool contrast, and keep it under a ceiling — if a scrim token ever stops
 * covering the glyphs, text is back on raw dots and this is where it shows.
 */
const SCRIM = { light: [244, 248, 255, 0.4], dark: [4, 9, 18, 0.38] }
const BEHIND_TEXT_CEILING = 170

for (const scheme of ['light', 'dark']) {
  const pool = POOL[scheme]
  for (const [state, opacity] of Object.entries(ACTIVITY)) {
    const vAlpha = base * opacity * BRIGHTNESS
    const ink = scheme === 'dark' ? mix(darkBase, darkCool, VCOOL * darkTint) : lightInk
    // Worst case is inside a reading zone, where the softening also trims alpha.
    const alpha = Math.min(
      1,
      (scheme === 'dark'
        ? (darkFloor + darkScale * vAlpha) * darkBoost
        : vAlpha * lightBoost) * zoneAlpha,
    )
    if (scheme === 'dark' && Math.min(...ink) < 0.95) {
      throw new Error(`dark ink is no longer pure white: ${ink.join(', ')}`)
    }
    if (scheme === 'light' && luma(ink.map((channel) => channel * 255)) > 45) {
      throw new Error(`light ink is no longer deep navy: ${ink.join(', ')}`)
    }
    const rendered = pool.map(
      (channel, index) => ink[index] * 255 * alpha + channel * (1 - alpha),
    )
    const contrast = Math.abs(luma(rendered) - luma(pool))
    if (contrast < FLOOR[state]) {
      throw new Error(
        `${scheme} whale reads pale at "${state}": modelled dot contrast ${contrast.toFixed(0)} ` +
          `< floor ${FLOOR[state]}`,
      )
    }
    const [scrimRed, scrimGreen, scrimBlue, scrimAlpha] = SCRIM[scheme]
    const scrimColour = [scrimRed, scrimGreen, scrimBlue]
    const behind = (colour) => mix(colour, scrimColour, scrimAlpha)
    const behindText = Math.abs(luma(behind(rendered)) - luma(behind(pool)))
    if (behindText >= contrast || behindText > BEHIND_TEXT_CEILING) {
      throw new Error(
        `${scheme} reading scrim no longer protects text at "${state}": modelled contrast behind ` +
          `text ${behindText.toFixed(0)} (raw dots ${contrast.toFixed(0)}, ceiling ${BEHIND_TEXT_CEILING})`,
      )
    }
    console.log(
      `palette ${scheme.padEnd(5)} ${state.padEnd(7)} alpha=${alpha.toFixed(2)} ` +
        `ink=rgb(${ink.map((c) => Math.round(c * 255)).join(',')}) contrast=${contrast.toFixed(0)} ` +
        `behindText=${behindText.toFixed(0)}`,
    )
  }
}

console.log('palette contract OK')
