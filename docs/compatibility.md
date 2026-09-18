# Harness compatibility contract

The wallpaper is a fixed layer *behind* the Harness shell, so it only works while
the surfaces that carry the app paint nothing opaque over it. Two regressions
came from exactly that boundary — one colour report ("the whale is barely
visible") each time a Harness release moved a hook this plugin matched.

Everything below is verified against the shipped `lib/client.js` by
`npm run check`, and re-checked in the running page by the shell self-check.

## Hooks this plugin relies on

| Hook | Selector / API | Holds for | If it moves |
| --- | --- | --- | --- |
| Shell frame stays clear | `#root > [data-slot="root"] > *` | 0.1.2-rc.1 … 0.1.6-alpha.1 | The frame paints `--dsw-alias-bg-base` across the viewport again and dims the whole wallpaper. Harness ≤ 0.1.2 exposed the same element as `[data-details-collapsed]`; 0.1.5 dropped the attribute, so the frame is matched structurally. |
| Conversation column | `[data-slot="main.conversation"] > [data-phase]` (≥ 0.1.5) and `[data-slot="conversation"] > [data-phase]` (≤ 0.1.2) | 0.1.2-rc.1 … 0.1.6-alpha.1 | The column falls back to its own `--dsw-alias-bg-base` background: welcome screen stays fine, running text sits on the dot matrix. |
| Conversation phase | `data-phase` on that element: `hero` (welcome / blank session), `active`, `settling` | 0.1.5 … 0.1.6-alpha.1 | The scrim/clear split breaks: either the welcome screen gets scrimmed or reading loses protection. Never match bare `[data-phase]` — the composer input carries its own `plain` phase. |
| Dark palette | `body[data-ds-dark-theme]` | 0.1.2-rc.1 … 0.1.6-alpha.1 | Theme sync breaks: the canvas keeps the wrong ink curve. The plugin also reads `ctx.theme.getTheme().active.colorScheme` and `theme/change`, which are the primary signals. |
| Composer card | `[data-composer-card="true"]` | 0.1.2-rc.1 … 0.1.6-alpha.1 | The composer loses its wallpaper-matched surface and reads as a raw app default. |
| Token override layer | `ctx.theme.overrideTokens(source, tokens)` folded into the snapshot, applied by ui-layout as inline styles on `body` | 0.1.2-rc.1 … 0.1.6-alpha.1 | Surfaces stop being translucent, which is what makes the wallpaper visible through the app at all. A bare string token value throws a teaching error by design; pass `{ light, dark }`. |
| Client bundle loading | `dsh.client` manifest + `exports["./client"]` → `lib/client.js`, read at plugin activation; the HMR row stat-polls the bundle and re-issues it under a content-sha1 `rev` | 0.1.2-rc.1 … 0.1.6-alpha.1 | Rebuilding `lib/` has no effect until the plugin is re-activated or the poll notices the change; the page then needs a reload to fetch the new revision. |

## Self-check

`src/self-check.ts` re-validates the shell contract 1.5 s after mount and on every
conversation phase change. If a surface starts painting where it should not, the
console gets one warning per build/scheme/problem, for example:

```
[harness-whale 0.3.5] the Harness shell is covering the wallpaper again:
  - #root > [data-slot="root"] > * paints rgba(244, 248, 255, 0.72); the wallpaper behind it is covered
```

Run the same report on demand from the page console:

```js
window.__harnessWhale.check()
// { version, colorScheme, renderer, canvas, layerFound, surfaces: [...], problems: [...], ok }
```

What it asserts:

- the shell frame and `#root` are transparent (alpha ≤ 0.02);
- the conversation column is transparent on `hero` and carries a scrim of
  0.30–0.85 alpha in every content phase;
- the wallpaper layer and its canvas exist and have a drawing buffer;
- both conversation slot spellings are still present, so a rename is reported
  instead of silently ignored.

`npm run check` asserts the same contract on the built bundle, plus a palette
floor: the modelled dot contrast at idle / session / active must stay above
200 / 160 / 120 luma in both themes, or the build fails. That floor is the
"never pale again" tripwire.

## When a Harness update lands

1. **Before restarting the GUI** — `npm run compat` (or `node scripts/dsh-compat.mjs --dsh <dir>`).
   It greps the *installed* Harness packages for every hook above and prints what a
   missing one would break. Non-zero exit means: fix the plugin first, or roll back.
2. **After restarting** — open the GUI and run `window.__harnessWhale.check()`.
   `ok: true` plus `document.documentElement.dataset.hwwStatus === 'ok'` means the
   live contract holds. A `status: "failed"` means the plugin could not mount at
   all and deliberately left the app untouched.
3. **If a hook moved** — the whale stops being visible; nothing else breaks. Patch
   the selector in `src/theme.ts` / `src/reading-zone.ts`, add or update the hook in
   `scripts/dsh-compat.mjs`, extend `npm run check`, and add the new release to the
   table below. Or roll back: `dsh plugin --profile web add release/<last-good>.tgz`.
4. **If the plugin cannot mount** — the failure is reported once (console error plus
   `data-hww-status="failed"`) and the shell is left exactly as it was, so the GUI
   stays usable while the plugin is being fixed.

## Re-verified releases

| Harness | How it was checked |
| --- | --- |
| 0.1.2-rc.1 | bundle extraction (AppFrame carried `data-details-collapsed`, conversation slot named `conversation`) |
| 0.1.5-alpha.2 | bundle extraction (attribute gone, slot renamed `main.conversation`) |
| 0.1.5-rc.2 | bundle extraction + live DOM |
| 0.1.6-alpha.1 | live DOM (frame, column, phases, token values) |

## 中文摘要

壁纸是贴在 Harness 外壳**底下**的一层，所以它只在"上面的表面不画不透明背景"时才成立。这份文档列出它依赖的全部钩子（外壳 frame、会话列与 `data-phase`、深色属性、输入框卡片、主题 token 覆盖层、客户端 bundle 的加载与热更新方式）、每个钩子适用的版本范围，以及钩子改名时的症状。

`src/self-check.ts` 会在挂载后和每次会话相位变化时复查这套契约：一旦某个表面又开始遮挡壁纸，控制台会打印带插件版本和实际颜色值的告警；也可以在页面控制台执行 `window.__harnessWhale.check()` 拿到完整报告。`npm run check` 会在构建产物上断言同一套契约，并额外做"不发灰"的调色板下限校验（idle / session / active 三档的点对比度不得低于 200 / 160 / 120），不达标直接构建失败。
