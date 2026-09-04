# Changelog

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
