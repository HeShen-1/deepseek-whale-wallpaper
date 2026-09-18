#!/usr/bin/env node
/**
 * Preflight: does the *installed* Harness still expose every hook this plugin
 * depends on?
 *
 * `npm run check` validates the plugin's own bundle. This script validates the
 * other side of the contract — the Harness packages that happen to be installed —
 * so a broken update is caught before restarting the GUI, not after noticing the
 * whale went missing. Exits non-zero on drift.
 *
 *   node scripts/dsh-compat.mjs                 # auto-detect the DSH install
 *   node scripts/dsh-compat.mjs --dsh <dir>     # explicit @deepseek-ai directory
 *
 * See docs/compatibility.md for what each hook is and what breaks without it.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

/** Each hook: which package owns it, what to grep, and the symptom when it moves. */
const HOOKS = [
  {
    name: 'root slot outlet',
    pkg: 'dsh-client-ui-renderer',
    needle: '"data-slot": "root"',
    breaks: 'the wallpaper cannot tell where the shell frame is; the frame paints over it',
  },
  {
    name: 'shell frame background',
    pkg: 'dsh-client-ui-layout',
    needle: 'background:var(--dsw-alias-bg-base)',
    breaks: 'the frame no longer paints a page background — harmless, but re-check the neutraliser',
  },
  {
    name: 'conversation slot',
    pkg: 'dsh-client-ui-conversation',
    needle: 'main.conversation',
    breaks: 'the conversation column falls back to its own background and covers running text',
  },
  {
    name: 'conversation phase',
    pkg: 'dsh-client-ui-conversation',
    needle: 'data-phase',
    breaks: 'welcome/reading split breaks: either the showcase is scrimmed or reading is unprotected',
  },
  {
    name: 'conversation scroller',
    pkg: 'dsh-client-ui-conversation',
    needle: 'data-conversation-scroll',
    breaks: 'reading zones cannot be measured; the heavier fallback scrim stays on',
  },
  {
    name: 'composer card',
    pkg: 'dsh-client-ui-conversation',
    needle: 'data-composer-card',
    breaks: 'the composer loses its wallpaper-matched surface',
  },
  {
    name: 'message content slot',
    pkg: 'dsh-client-ui-conversation',
    needle: 'conversation.session',
    breaks: 'message theming and reading zones lose their scope; the plugin styles nothing inside messages',
  },
  {
    name: 'code block banner',
    pkg: 'dsh-client-ui-chat',
    needle: 'data-code-block-banner',
    breaks: 'code blocks in messages lose the wallpaper-matched panel',
  },
  {
    name: 'dark palette attribute',
    pkg: 'dsh-client-ui-theme',
    needle: 'data-ds-dark-theme',
    breaks: 'per-theme ink and pool colours stop following the app theme',
  },
  {
    name: 'token override API',
    pkg: 'dsh-client-ui-theme',
    needle: 'overrideTokens',
    breaks: 'the plugin cannot make app surfaces translucent; the wallpaper hides behind them',
  },
  {
    name: 'base surface token',
    pkg: 'dsh-client-ui-theme',
    needle: '--dsw-alias-bg-base',
    breaks: 'the token this plugin overrides no longer exists; surfaces stay opaque',
  },
  {
    name: 'sidebar fill token',
    pkg: 'dsh-client-ui-theme',
    needle: '--dsw-specific-sidebar-fill',
    breaks: 'the sidebar keeps a hard fill instead of the wallpaper-matched one',
  },
  {
    name: 'client entry export',
    pkg: 'dsh-client-modules',
    needle: './client',
    breaks: 'the Harness no longer looks for exports["./client"]; the plugin bundle never loads',
  },
  {
    name: 'module loader banner',
    pkg: 'dsh-client-modules',
    needle: '__ModuleLoader__',
    breaks: 'the bundle wrapper this plugin is built with is no longer understood',
  },
]

function candidateRoots(explicit) {
  const roots = []
  if (explicit !== undefined) roots.push(explicit)
  const home = process.env.DSH_HOME ?? join(homedir(), '.dsh')
  roots.push(join(home, 'profiles/node_modules/@deepseek-ai'))
  roots.push(join(home, 'profiles/web/node_modules/@deepseek-ai'))
  return roots
}

/** @returns the @deepseek-ai directory containing the DSH packages, or undefined. */
function locate(explicit) {
  for (const root of candidateRoots(explicit)) {
    try {
      if (statSync(root).isDirectory()) return root
    } catch {
      continue
    }
  }
  return undefined
}

function bundleText(root, pkg) {
  const dir = join(root, pkg, 'lib')
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return undefined
  }
  return entries
    .filter((name) => name.endsWith('.js'))
    .map((name) => readFileSync(join(dir, name), 'utf8'))
    .join('\n')
}

function main() {
  const flag = process.argv.indexOf('--dsh')
  const explicit = flag === -1 ? undefined : process.argv[flag + 1]
  const root = locate(explicit)
  if (root === undefined) {
    console.warn(
      'dsh-compat: no Harness installation found. Pass --dsh <dir> or set DSH_HOME.\n' +
        `  looked in: ${candidateRoots(explicit).join(', ')}`,
    )
    process.exit(0)
  }
  console.log(`dsh-compat: checking ${root}`)

  const cache = new Map()
  const missing = []
  for (const hook of HOOKS) {
    if (!cache.has(hook.pkg)) cache.set(hook.pkg, bundleText(root, hook.pkg))
    const text = cache.get(hook.pkg)
    const state = text === undefined ? 'package missing' : text.includes(hook.needle) ? 'ok' : 'CHANGED'
    if (state !== 'ok') missing.push({ hook, state })
    console.log(`  ${state.padEnd(15)} ${hook.name.padEnd(24)} ${hook.pkg}`)
  }

  if (missing.length === 0) {
    console.log('dsh-compat: every hook this plugin uses is still present.')
    return
  }
  console.error('\ndsh-compat: drift detected — update the plugin before the next restart:')
  for (const { hook, state } of missing) {
    console.error(`  - ${hook.name} (${state}): ${hook.breaks}`)
  }
  console.error('\n  Next: re-verify with a live page (window.__harnessWhale.check()), then either')
  console.error('  patch the hook in src/ or roll back: dsh plugin --profile web add release/<last-good>.tgz')
  process.exit(1)
}

main()
