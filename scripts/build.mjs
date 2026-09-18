import { build } from 'esbuild'
import { readFile } from 'node:fs/promises'

const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))

const shared = {
  bundle: true,
  sourcemap: true,
  target: ['es2022'],
  logLevel: 'info',
  // Stamped onto the wallpaper layer so a live page can report its build.
  define: { __HWW_VERSION__: JSON.stringify(pkg.version) },
}

await Promise.all([
  build({
    ...shared,
    entryPoints: ['src/index.ts'],
    outfile: 'lib/index.js',
    platform: 'node',
    format: 'esm',
    external: [
      '@deepseek-ai/cordis',
      '@deepseek-ai/dsh-host-webserver',
    ],
  }),
  build({
    ...shared,
    entryPoints: ['src/client.tsx'],
    outfile: 'lib/client.js',
    platform: 'browser',
    format: 'cjs',
    banner: {
      js: 'window.__ModuleLoader__.load({ id: "dsh-plugin-harness-whale", factory: function (require) { var module = { exports: {} }; var exports = module.exports;',
    },
    footer: {
      js: 'return module.exports; } });',
    },
    external: [
      '@deepseek-ai/dsh-client-runtime/client',
      'react',
    ],
  }),
  build({
    ...shared,
    entryPoints: ['src/preview.ts'],
    outfile: 'preview.js',
    platform: 'browser',
    format: 'esm',
  }),
])
