/**
 * Shell-integrity self-check.
 *
 * The wallpaper is a fixed layer *behind* the Harness shell, so it only works
 * while the surfaces that carry the app paint nothing opaque on top of it. That
 * contract already broke twice for reasons outside this plugin: Harness 0.1.5
 * dropped the `data-details-collapsed` attribute the frame was matched by, and
 * renamed the conversation slot to `main.conversation` — both times the shell
 * silently started covering the whale again.
 *
 * This module re-checks the contract in the running page and reports drift with
 * the value it actually found, so the next rename is a console warning instead
 * of a "the colours look wrong" report. `window.__harnessWhale.check()` returns
 * the same report on demand.
 */
import type { WallpaperColorScheme } from './renderer.ts'

type Rect = { width: number; height: number }

export interface SurfaceProbe {
  label: string
  selector: string
  found: boolean
  background: string
  alpha: number
  expected: string
  ok: boolean
}

export interface WhaleDiagnostics {
  version: string
  /** `ok`, or `failed` when the plugin could not mount at all. */
  status: string | null
  colorScheme: WallpaperColorScheme
  renderer: string | undefined
  canvas: Rect | null
  layerFound: boolean
  surfaces: SurfaceProbe[]
  coverage: CoverageProbe[]
  problems: string[]
  ok: boolean
}

/** One hit-tested point: how much of the wallpaper survives the stack above it. */
export interface CoverageProbe {
  at: [number, number]
  transmission: number
  blockers: string[]
  ok: boolean
}

/**
 * A reading scrim may dim the wallpaper to about half. Anything that leaves less
 * than this fraction of it visible is treated as a covering surface, which is the
 * failure this plugin keeps hitting: the whale is drawn, then something paints on
 * top of it.
 */
const MIN_TRANSMISSION = 0.3

/** Overlays that are *supposed* to cover the page: modals, menus and their masks. */
const OVERLAY_SELECTOR = [
  '[role="dialog"]',
  '[aria-modal="true"]',
  '[role="menu"]',
  '[role="listbox"]',
  '[role="tooltip"]',
  '[class*="mask"]',
  '[class*="Mask"]',
  '[class*="popover"]',
  '[class*="Popover"]',
].join(', ')

const TRANSPARENT_MAX = 0.02
const SCRIM_RANGE: readonly [number, number] = [0.30, 0.85]

/** Legacy (<= 0.1.2) and current (>= 0.1.5) hooks for the same surface. */
const FRAME_SELECTOR = '#root > [data-slot="root"] > *'
const COLUMN_SELECTORS = [
  '[data-slot="main.conversation"] > [data-phase]',
  '[data-slot="conversation"] > [data-phase]',
]

/** Compare colours the way the browser reports them, ignoring spacing/case. */
export function normalizeColor(color: string): string {
  return color.replace(/\s+/g, '').toLowerCase()
}

function alphaOf(color: string): number {
  if (color === '' || color === 'transparent') return 0
  const match = /^rgba?\(([^)]+)\)$/.exec(color.trim())
  if (match === null) return 1
  const parts = match[1].split(',').map((part) => Number.parseFloat(part))
  return parts.length > 3 && Number.isFinite(parts[3]) ? parts[3] : 1
}

function probe(
  label: string,
  selector: string,
  expected: string,
  ok: (alpha: number, element: Element) => boolean,
): SurfaceProbe {
  const element = document.querySelector(selector)
  if (element === null) {
    return { label, selector, found: false, background: '', alpha: 0, expected, ok: false }
  }
  const background = getComputedStyle(element).backgroundColor
  const alpha = alphaOf(background)
  return { label, selector, found: true, background, alpha, expected, ok: ok(alpha, element) }
}

function describeElement(element: Element): string {
  const slot = element.getAttribute('data-slot')
  const id = element.id === '' ? '' : `#${element.id}`
  const className = typeof element.className === 'string' && element.className !== ''
    ? `.${element.className.trim().split(/\s+/)[0]}`
    : ''
  return `${element.tagName.toLowerCase()}${id}${slot === null ? '' : `[data-slot="${slot}"]`}${className}`
}

/**
 * Measure what the page actually paints over the wallpaper, independent of any
 * hook this plugin knows by name. The canvas has `pointer-events: none`, so every
 * hit-testable element above `body`/`html` is painted on top of it; multiplying
 * `1 - alpha` over their backgrounds gives the fraction of the wallpaper that
 * survives at that point.
 *
 * Surfaces this plugin deliberately paints (`allowed`) are not drift: the reading
 * scrim, the composer card, code panels and the sidebar fill are all its own
 * decisions. Everything else that hides the wallpaper is reported, which is how a
 * *new* surface gets caught — exactly how the 0.1.5 regression arrived.
 */
function probeCoverage(
  layer: Element | null,
  allowed: ReadonlySet<string>,
  points: ReadonlyArray<readonly [number, number]>,
): CoverageProbe[] {
  const width = window.innerWidth
  const height = window.innerHeight
  return points.map(([fx, fy]) => {
    const x = Math.round(width * fx)
    const y = Math.round(height * fy)
    const blockers: string[] = []
    let transmission = 1
    for (const element of document.elementsFromPoint(x, y)) {
      if (element === document.body || element === document.documentElement) continue
      if (layer !== null && (layer.contains(element) || element.contains(layer))) continue
      if (element.closest(OVERLAY_SELECTOR) !== null) continue
      const style = getComputedStyle(element)
      const alpha = alphaOf(style.backgroundColor)
      const image = style.backgroundImage === 'none' ? '' : ' +background-image'
      if (alpha <= 0.01 && image === '') continue
      if (allowed.has(normalizeColor(style.backgroundColor))) continue
      transmission *= 1 - alpha
      blockers.push(`${describeElement(element)} ${style.backgroundColor}${image}`)
    }
    return {
      at: [x, y] as [number, number],
      transmission: Math.round(transmission * 100) / 100,
      blockers,
      ok: transmission >= MIN_TRANSMISSION,
    }
  })
}

/**
 * Read the current shell state. Never throws: a missing document or a surface
 * that cannot be measured is reported as a problem, not as an exception.
 */
export function collectDiagnostics(
  version: string,
  colorScheme: WallpaperColorScheme,
  ownSurfaces: () => readonly string[] = () => [],
): WhaleDiagnostics {
  const allowed = new Set(ownSurfaces().map(normalizeColor))
  const problems: string[] = []
  const layer = document.querySelector('.dsh-harness-whale-wallpaper')
  const canvas = layer?.querySelector('canvas') ?? null
  const canvasRect = canvas === null
    ? null
    : { width: canvas.width, height: canvas.height }

  if (layer === null) problems.push('wallpaper layer is missing from the document')
  if (canvas === null) problems.push('wallpaper canvas is missing')
  else if (canvas.width === 0 || canvas.height === 0) problems.push('wallpaper canvas has no drawing buffer')

  const surfaces: SurfaceProbe[] = []

  const frame = probe('shell frame', FRAME_SELECTOR, 'transparent', (alpha) => alpha <= TRANSPARENT_MAX)
  surfaces.push(frame)
  if (frame.found && !frame.ok) {
    problems.push(
      `${frame.selector} paints ${frame.background}; the wallpaper behind it is covered`,
    )
  }
  if (!frame.found) {
    problems.push(`${FRAME_SELECTOR} not found; the shell frame hook may have been renamed`)
  }

  const root = probe('#root', '#root', 'transparent', (alpha) => alpha <= TRANSPARENT_MAX)
  surfaces.push(root)
  if (root.found && !root.ok) problems.push(`#root paints ${root.background}`)

  const column = COLUMN_SELECTORS
    .map((selector) => probe('conversation column', selector, 'clear on hero, light scrim while reading', () => true))
    .find((entry) => entry.found)
  if (column === undefined) {
    problems.push(`${COLUMN_SELECTORS.join(' / ')} not found; the conversation slot hook may have been renamed`)
  } else {
    const element = document.querySelector(column.selector) as HTMLElement
    const phase = element.getAttribute('data-phase')
    const hero = phase === 'hero'
    const ok = hero ? column.alpha <= TRANSPARENT_MAX : column.alpha >= SCRIM_RANGE[0] && column.alpha <= SCRIM_RANGE[1]
    surfaces.push({ ...column, ok, expected: `${column.expected} (phase=${phase ?? 'unknown'})` })
    if (!ok) {
      problems.push(
        hero
          ? `${column.selector}[data-phase=hero] paints ${column.background}; the welcome screen should stay clear`
          : `${column.selector}[data-phase=${phase ?? 'unknown'}] paints ${column.background}; ` +
            `expected a reading scrim between ${SCRIM_RANGE[0]} and ${SCRIM_RANGE[1]} alpha`,
      )
    }
  }

  const coverage = probeCoverage(layer, allowed, [
    [0.16, 0.3],
    [0.5, 0.45],
    [0.84, 0.28],
    [0.78, 0.72],
    [0.35, 0.82],
  ])
  for (const entry of coverage) {
    if (entry.ok) continue
    problems.push(
      `only ${Math.round(entry.transmission * 100)}% of the wallpaper survives at ` +
        `(${entry.at[0]}, ${entry.at[1]}) — covered by ${entry.blockers.join(' | ') || 'an unmeasurable layer'}`,
    )
  }

  return {
    version,
    status: document.documentElement.getAttribute('data-hww-status'),
    colorScheme,
    renderer: canvas?.dataset.renderer,
    canvas: canvasRect,
    layerFound: layer !== null,
    surfaces,
    coverage,
    problems,
    ok: problems.length === 0,
  }
}

const reported = new Set<string>()

function report(
  version: string,
  colorScheme: WallpaperColorScheme,
  ownSurfaces: () => readonly string[],
): WhaleDiagnostics {
  const diagnostics = collectDiagnostics(version, colorScheme, ownSurfaces)
  const key = `${version}|${colorScheme}|${diagnostics.problems.join('|')}`
  if (!diagnostics.ok && !reported.has(key)) {
    reported.add(key)
    console.warn(
      `[harness-whale ${version}] the Harness shell is covering the wallpaper again:\n` +
      diagnostics.problems.map((problem) => `  - ${problem}`).join('\n') +
      '\n  This means a Harness DOM/CSS hook moved. Run window.__harnessWhale.check() for the\n' +
      '  full report and see docs/compatibility.md for the hook list this plugin relies on.',
    )
  }
  return diagnostics
}

export interface ShellWatch {
  check: () => WhaleDiagnostics
  dispose: () => void
}

/**
 * Re-validate the shell contract after mount and whenever the conversation
 * changes phase, which is the moment a surface can start or stop covering the
 * wallpaper.
 */
export function watchShellIntegrity(
  version: string,
  colorScheme: () => WallpaperColorScheme,
  ownSurfaces: () => readonly string[] = () => [],
): ShellWatch {
  const timers = new Set<number>()
  let observer: MutationObserver | null = null

  const later = (run: () => void, delay: number): void => {
    const timer = window.setTimeout(() => {
      timers.delete(timer)
      run()
    }, delay)
    timers.add(timer)
  }

  later(() => report(version, colorScheme(), ownSurfaces), 1500)

  const column = COLUMN_SELECTORS
    .map((selector) => document.querySelector(selector))
    .find((element) => element !== null)
  if (column !== undefined && column !== null) {
    observer = new MutationObserver(() => later(() => report(version, colorScheme(), ownSurfaces), 250))
    observer.observe(column, { attributes: true, attributeFilter: ['data-phase'] })
  }

  const check = (): WhaleDiagnostics => report(version, colorScheme(), ownSurfaces)

  const api = { version, check }
  const globals = window as unknown as { __harnessWhale?: unknown }
  globals.__harnessWhale = api

  return {
    check,
    dispose: () => {
      for (const timer of timers) window.clearTimeout(timer)
      timers.clear()
      observer?.disconnect()
      if (globals.__harnessWhale === api) delete globals.__harnessWhale
    },
  }
}
