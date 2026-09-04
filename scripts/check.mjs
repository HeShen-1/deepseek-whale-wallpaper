import { readFile } from 'node:fs/promises'

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
]) {
  if (!client.includes(marker)) throw new Error(`client bundle misses ${marker}`)
}

console.log('bundle structure OK')
