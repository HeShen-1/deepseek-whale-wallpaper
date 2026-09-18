# Changelog

## 0.3.11 — 2026-09-18

Surviving the next Harness update: preflight, live status, and dead selectors found.

- **`npm run compat`** (`scripts/dsh-compat.mjs`): greps the *installed* Harness for
  all fourteen hooks this plugin depends on (slot outlets, phases, the scroller,
  the composer card, the token API, the client-bundle protocol) and prints what each
  missing one would break. Run it after upgrading the Harness, before restarting the
  GUI; it exits non-zero on drift.
- **Live status**: the plugin writes `data-hww-status="ok"` on `<html>` when it
  mounts, `"failed"` when it cannot, and `window.__harnessWhale.check()` reports it.
  A mount failure is caught, logged once with the compatibility pointer, and leaves
  the shell untouched — a Harness change can no longer take the app down with it.
- **Dead selectors fixed**: the preflight showed `div[class*="_markdown_"]` does not
  exist in current Harness bundles, so every markdown/code rule in the plugin's theme
  was dead code (`.md-code-block` lives in another package entirely). Message theming
  is now scoped to `[data-slot="conversation.session"]` and the code-block banner hook
  ui-chat actually renders.
- `docs/compatibility.md` gains a four-step "when a Harness update lands" checklist;
  both READMEs point at the three guards instead of asking the reader to know them.

## 0.3.10 — 2026-09-18

Reading zones stop stepping the grain.

- The zone softening shrank dots to 0.62x over a 16 px border, which put a visible
  hard edge across the whale: inside a band ~48 % of the lit pixels disappeared, so
  the whale read as fine above the text and coarse below it.
- Softening is now split across both axes and kept mild — 0.86x size, 0.92x alpha
  — with a ~130 px falloff, so nothing steps: the grain stays even and the change
  reads as depth of field. The scrim (0.40/0.38) carries the readability, which is
  what it is for.

## 0.3.9 — 2026-09-18

Whale survives the glow pass on every driver, and long answers keep the light scrim.

- **Fixed: the whale could disappear once the glow pass ran.** Vertex attribute
  pointers are global context state; the glow's fullscreen quad bound its own
  attribute and the next frame's point draw then read the quad buffer wherever the
  linker had assigned `aCorner` the same index as `aPosition`. The point pointers
  are now re-established before every point draw.
- Long conversations no longer lose the soft scrim: the visible text bands are
  fused down to the shader's 16 slots (fusing the closest pair repeatedly) instead
  of giving up and applying the heavy flat scrim to the whole column — which is
  what made the pool read as flat and the wallpaper as "gone" behind a long answer.
- The active-zone scrim moves 0.36/0.34 → 0.40/0.38 so the reading column still
  reads as a panel while the pool keeps showing through.

## 0.3.8 — 2026-09-18

The pool comes back (③ finished): ambience, one preset knob, and a glow budget.

- **Ambience.** Making the shell transparent also revealed how flat the pool had
  become: 0.3.0 deepened the dark gradient until the background read as black
  (live medians 13–24 luma against 30–42 in the 0.2.0 reference), and its bright
  radial had been replaced by white in light mode. Both themes now carry a lit
  water column behind the whale, a cooler floor glow and a soft corner wash, and
  the drifting mist layers are stronger (0.32 → 0.42 light, 0.36 → 0.55 dark) with
  more saturated blues.
- **`preset: calm | vivid`** (schema, host config, preview panel, query string):
  one knob for the ambience instead of a slider per effect. `vivid` lifts the pool,
  the mist and the glow for demos; the plugin's own defaults stay `calm`.
- **Glow frame budget**: the glow pass now turns itself off after 90 consecutive
  frames above 24 ms, before the auto-quality path starts dropping point density,
  and records `data-glow="off"` on the canvas.
- The palette contract models the brighter pool (mid-gradient stop 6/19/38 →
  10/35/68) and still holds its idle/session/active floors.

## 0.3.7 — 2026-09-18

Welcome screen at full strength, and a glow pass (③ start).

- **The welcome screen is a showcase again.** Activity dimming (0.78 with a
  session open, 0.5 while running) used to apply on the welcome screen too, so the
  whale was never at full strength there even though no text needs protecting.
  The conversation phase now drives a showcase flag: `hero` (or no conversation)
  renders at opacity 1 and motion 1; content phases keep the activity curve.
- **Glow pass**: the point cloud is drawn a second time into a half-resolution
  offscreen target, separable-blurred, and composited over the sharp pass —
  additive (screen) in dark mode so the ink reads luminous, soft ink shadow in
  light mode. Skipped entirely on `quality: low`; it costs one extra point draw
  plus three fullscreen quads at half resolution. The composite writes alpha from
  the halo's own coverage, so the pool behind the canvas stays untouched (the first
  build of this pass painted the whole canvas opaque and hid it — caught in the
  preview harness before it reached anything but this machine).
- **Preview page controls** (`src/preview.ts` + `style.css`): theme, brightness and
  quality, written into the query string so a tuned view can be linked or reloaded.
- `window.__harnessWhale` diagnostics and the build contract cover the new state:
  `data-hww-showcase`, `setShowcase`, the showcase marker and the glow markers.

## 0.3.6 — 2026-09-18

Per-text-block softening: the whale keeps its colour while you read.

- `src/reading-zone.ts` measures the rectangles that actually carry text (markdown
  bodies plus standalone `p/li/h*/pre/blockquote/table` inside
  `[data-conversation-scroll]`), clipped to the scroller, merged into vertical
  bands, and republished on scroll / resize / phase change / DOM settle. The
  welcome screen publishes no zones — it stays the showcase.
- The vertex shader takes up to 16 zone rectangles and, inside them, **shrinks the
  dots to 0.62× while keeping 0.95× alpha** (16 px soft border), so interference
  drops but the ink keeps its brightness and hue. Readability first: when the zones
  cannot be measured (missing hook, or more visible blocks than the shader carries)
  nothing is published and the plain scrim stays in force.
- Because the softening now does the work behind text, the reading scrim relaxes to
  0.36 light / 0.34 dark (`--hww-reading-scrim-soft`) while zones are active, and
  keeps 0.50 / 0.46 as the fallback.
- `npm run check` covers the new machinery (zone uniforms, the softening branch,
  the data-hww-zones state attribute, both scrim values inside 0.30–0.70).

## 0.3.5 — 2026-09-18

Guardrails: the two ways this plugin has actually broken are now tripwires.

- **Shell self-check** (`src/self-check.ts`): 1.5 s after mount, and again on every
  conversation phase change, the plugin re-validates that the frame and `#root`
  are transparent, that the conversation column is clear on the welcome screen and
  scrimmed while reading, and that the canvas has a drawing buffer. Drift is
  reported once per build with the value actually found, plus
  `window.__harnessWhale.check()` for the full report.
- **`npm run check` now asserts the shell contract** (both conversation slot
  spellings, the structural frame selector, the hero halo, the live build marker,
  and a reading scrim alpha inside 0.35–0.70) **and a palette floor**: the
  fragment shader is modelled arithmetically and the dot contrast must stay above
  200 / 160 / 120 luma at idle / session / active in both themes. The build fails
  instead of shipping a pale whale.
- `docs/compatibility.md` lists every DOM/API hook, the Harness range it holds
  for, the symptom when it moves, and how the checks above report it.
- Reading scrim retuned so it never washes the ink out: light 0.58 → 0.50,
  dark 0.55 → 0.46. Per-dot softening (shrink, not fade) is the next step.

## 0.3.4 — 2026-09-18

Reading legibility: the whale no longer sits naked behind running text.

- The shell frame stays transparent (the margins keep the full wallpaper), but
  the conversation column takes a **reading scrim** in every content phase
  (`active`, `settling`) instead of a transparent surface — light
  `rgba(244,248,255,0.58)`, dark `rgba(4,9,18,0.55)`. The welcome screen
  (`hero`) keeps its clear showcase, because `data-phase` is Harness's own state;
  the only DOM hook involved is the slot rename already handled in 0.3.1.
- The hero screen gets an inherited, theme-coloured `text-shadow` halo, so the
  welcome title keeps clean glyph edges where dots cross it. The halo colour
  equals the pool colour, so it is invisible on empty background and only clears
  the few pixels around each glyph.
- Composer card, sidebar fill and code panels keep their own surfaces; the scrim
  is the only new paint layer, and it never covers the margins.

## 0.3.3 — 2026-09-18

Purer, brighter dark-mode ink, and a live-build marker.

- Dark-mode depth tint softened again: `0.76/0.88/1.0` at weight `0.30` →
  `0.88/0.94/1.0` at weight `0.20`, so the dots are effectively pure white.
- Dark-mode alpha now lifts its floor for the whale (`0.20 + 0.80 × vAlpha`,
  `× 1.28`) instead of a flat multiplier, so the dimmest dots brighten most.
  Dust particles keep their proportional alpha and only take the `1.28×`.
  Light mode is untouched.
- The wallpaper layer carries `data-version` (stamped from package.json by the
  build), so a live page can report which build it runs:
  `document.querySelector('.dsh-harness-whale-wallpaper').dataset.version`.
- Measured in the standalone preview (DPR 1, idle, dark), 0.3.0 → 0.3.3:
  brightest 0.5 % of pixels 167 → 236, mean of the brightest 0.2 % of pixels
  `rgb(205,216,226)` → `rgb(255,255,255)`, peak dot `rgb(222,232,239)` →
  `rgb(255,255,255)`; background median unchanged at 23.7.

## 0.3.2 — 2026-09-18

Brighter dark-mode ink.

- Dark-mode whale particles are now a pure white core with a gentler blue depth
  tint (`0.70/0.84/1.0` at weight `0.42` → `0.76/0.88/1.0` at weight `0.30`), so
  the matrix reads white instead of pale blue-grey over the deepened 0.3.0 pool.
- Dark-mode particle alpha gains a `1.15×` boost. Light mode keeps its own alpha
  curve, so its contrast is untouched.
- Measured in the standalone preview (DPR 1, idle, dark): peak dot luminance
  231 → 254, brightest 0.5 % of pixels 167 → 193, mean of the brightest 0.2 % of
  pixels `rgb(205,216,226)` → `rgb(241,244,247)`.

## 0.3.1 — 2026-09-18

Fix: the whale was washed out behind the Harness shell after Harness 0.1.5.

- The plugin kept the shell transparent by matching two Harness DOM hooks:
  `[data-details-collapsed]` on the ui-layout `AppFrame` and the `conversation`
  slot name. Harness 0.1.5 removed that attribute and renamed the slot to
  `main.conversation`, so both rules silently stopped matching. The `AppFrame`
  and the conversation root paint `--dsw-alias-bg-base` — translucent here, but
  stacked they transmitted only ~8 % of the wallpaper in light mode and ~64 % in
  dark mode, which is the "colours are barely visible" regression.
- The neutraliser now matches structurally (`#root > [data-slot="root"] > *`)
  and covers both conversation slot names, so the shell stays transparent on
  0.1.2 and 0.1.5+ instead of depending on a renameable attribute.
- Rebuilt `lib/` from `src/`: the shipped bundle was still the 0.2.0 build, so
  0.3.0's shader changes (alpha floor 0.62, no pointer halo, tighter vortices)
  had never actually reached `lib/client.js`.

## 0.3.0 — 2026-09-10

Visual clarity and a calmer pointer interaction.

- Higher whale contrast in both themes: darker particle alpha floor (0.46 → 0.62), larger dots, harder ink edges in light mode, and light-mode ink now honors `brightness` / activity dimming like dark mode does.
- Wallpaper backgrounds retuned: the pool behind the whale is deepened in dark mode and brightened in light mode so the dot matrix reads clearly in both.
- Removed the pointer halo: the expanding ring wave and the near-cursor brightness/size boost are gone. Hovering is now motion-only feedback.
- Stronger liquid vortex: influence radius grows to ~185–215 px with ~30 % larger displacement and a slightly softer ~800 ms settle-back, so the swirl stays legible without the glow.
- Activity dimming floor raised: at least 50 % opacity while typing or running tasks (was 34 %), ~78 % with a session open (was 72 %).

## 0.2.0 — 2026-09-04

First public release.

- Dot-matrix particle whale (≈1,750 WebGL2 points) sampled from `favicon.svg`.
- ~11 s breathing, ~29 s slow turn, tail-fin motion and buoyancy; pointer parallax, liquid vortex (~160 px radius, no hollow core) and outward radial glow wave with ~650 ms settle-back.
- Light / dark / system theme sync with semantic token overrides; light mode uses high-contrast ink `#050b14`.
- Activity dimming: full brightness without a session, ~72 % with one, ≥34 % while typing or running tasks (~600 ms transitions).
- Accessibility & efficiency: pauses on hidden pages, fully static under `prefers-reduced-motion: reduce`, DPR cap 1.5, `auto` quality steps down on sustained frame drops.
- Static Canvas2D fallback when WebGL2 is unavailable.
- Clean lifecycle: every DOM node, style, listener and animation removed on disable or hot-swap; original Harness theme restored.
- Zero runtime dependencies; npm packaging with one-line install (`dsh plugin --profile web add dsh-plugin-harness-whale`), bilingual README (EN / zh-CN) and an online preview on GitHub Pages.
