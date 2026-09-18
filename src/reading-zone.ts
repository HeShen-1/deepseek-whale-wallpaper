/**
 * Reading zones: the rectangles that actually carry running text.
 *
 * A scrim over the whole conversation column also dims the margins of the whale
 * that no glyph ever touches, and over a bright pool a white scrim at 0.40 puts a
 * floor of 102 under everything behind it — the ink reads grey instead of
 * near-black. This module measures the text blocks themselves, so the scrim can
 * cover those bands only and the renderer can soften the dots behind text by
 * shrinking them (the ink keeps its brightness).
 *
 * `null` means "cannot measure": the caller then keeps the plain column scrim,
 * because readability outranks wallpaper presence. An empty array means the
 * column was measured and carries no text — a fresh session, or a phase that has
 * not rendered anything yet — so nothing needs protecting. Zones are also `null`
 * on the welcome screen, which is the wallpaper's showcase.
 */
export interface ZoneRect {
  x: number
  y: number
  w: number
  h: number
}

export interface ReadingZoneWatch {
  dispose: () => void
}

/** Harness hook for the conversation scroller (ui-conversation renders it). */
const SCROLL_SELECTOR = '[data-conversation-scroll]'
const COLUMN_SELECTORS = [
  '[data-slot="main.conversation"] > [data-phase]',
  '[data-slot="conversation"] > [data-phase]',
]

/** Blocks that carry text: the markdown body, plus standalone text elements. */
const BLOCK_SELECTORS = [
  'div[class*="_markdown_"]',
  ':is(p, li, h1, h2, h3, h4, h5, h6, pre, blockquote, table)',
]

const MAX_ZONES = 16
const MERGE_GAP = 8
const MIN_VISIBLE_HEIGHT = 6
const MIN_VISIBLE_WIDTH = 24
const MUTATION_SETTLE_MS = 400

function columnElement(): HTMLElement | null {
  for (const selector of COLUMN_SELECTORS) {
    const element = document.querySelector(selector)
    if (element instanceof HTMLElement) return element
  }
  return null
}

function mergeVertically(rects: ZoneRect[]): ZoneRect[] {
  const sorted = [...rects].sort((a, b) => a.y - b.y)
  const merged: ZoneRect[] = []
  for (const rect of sorted) {
    const last = merged[merged.length - 1]
    const overlaps = last !== undefined &&
      rect.y <= last.y + last.h + MERGE_GAP &&
      rect.x < last.x + last.w &&
      last.x < rect.x + rect.w
    if (!overlaps) {
      merged.push({ ...rect })
      continue
    }
    const right = Math.max(last.x + last.w, rect.x + rect.w)
    const bottom = Math.max(last.y + last.h, rect.y + rect.h)
    last.x = Math.min(last.x, rect.x)
    last.y = Math.min(last.y, rect.y)
    last.w = right - last.x
    last.h = bottom - last.y
  }
  return merged
}

/**
 * Collapse a list of bands down to `limit` by repeatedly fusing the pair with the
 * smallest vertical gap. A long answer can put thirty blocks on screen; giving up
 * on zones there would hand the reader the heavy flat scrim for the whole column,
 * so the overflow is coarsened instead of dropped.
 */
function fuseToLimit(bands: ZoneRect[], limit: number): ZoneRect[] {
  const result = [...bands].sort((a, b) => a.y - b.y)
  while (result.length > limit) {
    let best = 0
    let bestGap = Number.POSITIVE_INFINITY
    for (let index = 0; index < result.length - 1; index += 1) {
      const gap = result[index + 1].y - (result[index].y + result[index].h)
      if (gap < bestGap) {
        bestGap = gap
        best = index
      }
    }
    const [first, second] = [result[best], result[best + 1]]
    const x = Math.min(first.x, second.x)
    const right = Math.max(first.x + first.w, second.x + second.w)
    result.splice(best, 2, {
      x,
      y: first.y,
      w: right - x,
      h: Math.max(first.y + first.h, second.y + second.h) - first.y,
    })
  }
  return result
}

/**
 * Whether the conversation is on its welcome screen (or absent entirely): the
 * wallpaper's showcase, where no text needs protecting and the whale keeps full
 * strength instead of the activity-dimmed reading look.
 */
export function isShowcasePhase(): boolean {
  const column = columnElement()
  return column === null || column.getAttribute('data-phase') === 'hero'
}

/**
 * Collect the visible text blocks of the conversation, clipped to the scroller.
 * @returns merged rectangles (empty when the column holds no text), or `null` when
 *          the conversation cannot be measured (missing hook or welcome screen);
 *          overflow bands are fused, not dropped.
 */
export function measureReadingZones(): ZoneRect[] | null {
  const column = columnElement()
  if (column === null) return null
  if (column.getAttribute('data-phase') === 'hero') return null

  const scroller = document.querySelector(SCROLL_SELECTOR)
  const clip = (scroller ?? column).getBoundingClientRect()
  if (clip.width < MIN_VISIBLE_WIDTH || clip.height < MIN_VISIBLE_HEIGHT) return null

  const selector = BLOCK_SELECTORS.map((block) => `${SCROLL_SELECTOR} ${block}`).join(', ')
  const rects: ZoneRect[] = []
  for (const element of document.querySelectorAll(selector)) {
    const box = element.getBoundingClientRect()
    const top = Math.max(box.top, clip.top)
    const bottom = Math.min(box.bottom, clip.bottom)
    const left = Math.max(box.left, clip.left)
    const right = Math.min(box.right, clip.right)
    if (bottom - top < MIN_VISIBLE_HEIGHT || right - left < MIN_VISIBLE_WIDTH) continue
    rects.push({ x: left, y: top, w: right - left, h: bottom - top })
  }
  if (rects.length === 0) return []

  const merged = fuseToLimit(mergeVertically(rects), MAX_ZONES)
  return merged.map((rect) => ({
    x: Math.round(rect.x),
    y: Math.round(rect.y),
    w: Math.round(rect.w),
    h: Math.round(rect.h),
  }))
}

/**
 * Re-measure on the events that move text: scrolling, resizing, phase changes
 * and DOM updates inside the conversation (streaming answers mutate it a lot, so
 * mutations settle before a measurement).
 */
export function watchReadingZones(
  onChange: (rects: ZoneRect[] | null, showcase: boolean) => void,
): ReadingZoneWatch {
  let frame = 0
  let timer = 0
  let disposed = false
  let signature = ''

  const push = (): void => {
    if (disposed) return
    const showcase = isShowcasePhase()
    const rects = measureReadingZones()
    const next = `${showcase ? 'showcase' : 'reading'}|${JSON.stringify(rects)}`
    if (next === signature) return
    signature = next
    onChange(rects, showcase)
  }

  const schedule = (delay: number): void => {
    if (disposed) return
    if (frame !== 0) cancelAnimationFrame(frame)
    if (timer !== 0) window.clearTimeout(timer)
    if (delay === 0) {
      frame = requestAnimationFrame(() => {
        frame = 0
        push()
      })
      return
    }
    timer = window.setTimeout(() => {
      timer = 0
      push()
    }, delay)
  }

  const scroller = document.querySelector(SCROLL_SELECTOR)
  const onScroll = (): void => schedule(0)
  const onResize = (): void => schedule(200)
  scroller?.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)

  const observer = new MutationObserver(() => schedule(MUTATION_SETTLE_MS))
  observer.observe(scroller ?? columnElement() ?? document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['data-phase'],
  })

  schedule(0)

  return {
    dispose: () => {
      disposed = true
      if (frame !== 0) cancelAnimationFrame(frame)
      if (timer !== 0) window.clearTimeout(timer)
      observer.disconnect()
      scroller?.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    },
  }
}
