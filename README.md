# 🐋 Harness Whale Wallpaper

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/dsh-plugin-harness-whale)](https://www.npmjs.com/package/dsh-plugin-harness-whale)
[![Platform](https://img.shields.io/badge/platform-dsh%20web-6c7ee1.svg)](#compatibility)
[![dsh compat](https://img.shields.io/badge/dsh-0.1.1--rc.2-8da2ce.svg)](#compatibility)

**A live wallpaper plugin for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) web UI** — the dot-matrix whale you know from DeepSeek, rebuilt as ≈1,750 breathing WebGL2 particles that slowly turn in the mist and swirl around your pointer like liquid. Light and dark themes both included. No branding, no particle connection-lines, no clutter.

**[English](README.md)** | [简体中文](README.zh-CN.md)

> 📣 Listed in [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) — the curated DeepSeek Harness plugin list.

## ✨ Demo

Both themes are live wallpapers: the whale keeps breathing and turning, mist drifts, and when your pointer crosses the whale, nearby particles form a continuous liquid vortex with an outward radial glow wave, then softly settle back (~650 ms). GIFs below run at 2× speed — the real pace is calmer. **[Try the live preview →](https://heshen-1.github.io/deepseek-whale-wallpaper/)**

### Dark mode

![Dark mode: white dot-matrix whale with pointer particle vortex](https://raw.githubusercontent.com/HeShen-1/deepseek-whale-wallpaper/main/docs/screenshots/harness-whale-dark.gif)

### Light mode

![Light mode: ink-black dot-matrix whale with pointer particle vortex](https://raw.githubusercontent.com/HeShen-1/deepseek-whale-wallpaper/main/docs/screenshots/harness-whale-light.gif)

### Inside the real Harness UI

Captured from a live DeepSeek Harness web client. The wallpaper layer sits *beneath* the app frame — sidebar, conversation canvas and input area keep working, particles swirl behind the interface.

| Light UI | Dark UI |
| --- | --- |
| ![Real Harness UI, light](https://raw.githubusercontent.com/HeShen-1/deepseek-whale-wallpaper/main/docs/screenshots/harness-ui-light.jpg) | ![Real Harness UI, dark](https://raw.githubusercontent.com/HeShen-1/deepseek-whale-wallpaper/main/docs/screenshots/harness-ui-dark.jpg) |

![Real Harness UI light, animated](https://raw.githubusercontent.com/HeShen-1/deepseek-whale-wallpaper/main/docs/screenshots/harness-ui-light.gif)

![Real Harness UI dark, animated](https://raw.githubusercontent.com/HeShen-1/deepseek-whale-wallpaper/main/docs/screenshots/harness-ui-dark.gif)

## 📦 Install

Requires the DeepSeek Harness dev-preview (`@deepseek-ai/dsh`) with its `web` profile and `pnpm` on `PATH`.

### A. One line via npm (recommended)

```bash
dsh plugin --profile web add dsh-plugin-harness-whale
```

Restart `dsh web` and refresh [http://127.0.0.1:3080](http://127.0.0.1:3080) — the whale appears behind the app. The command installs the package into your profile and registers its bundle layer automatically; tweak the config in `~/.dsh/profiles/web/cordis.patch.yml` if you want non-default values.

### B. From a release tarball

1. Download `dsh-plugin-harness-whale-<version>.tgz` from [Releases](https://github.com/HeShen-1/deepseek-whale-wallpaper/releases) and extract the `package/` folder to:

   ```text
   ~/.dsh/profiles/node_modules/dsh-plugin-harness-whale
   ```

2. Register it in the `insert` list of `~/.dsh/profiles/web/cordis.patch.yml`:

   ```yaml
   - insert:
       - id: harness-whale-wallpaper
         name: dsh-plugin-harness-whale
         config:
           enabled: true
           quality: auto
           brightness: 0.9
           scale: 1
           interactionStrength: 1
           activeDimming: 0.22
   ```

3. Restart `dsh web`.

### C. Look before you leap

Open the **[online preview](https://heshen-1.github.io/deepseek-whale-wallpaper/)** — the same render kernel as the plugin, no install needed.

## ⚙️ Configuration

Override per-profile via `cordis.patch.yml`; defaults live in the plugin's own [`cordis.patch.yml`](cordis.patch.yml):

| Field | Default | Meaning |
| --- | ---: | --- |
| `enabled` | `true` | Enable wallpaper + theme overrides |
| `quality` | `auto` | `auto` / `low` / `medium` / `high` |
| `brightness` | `0.9` | Whale brightness, 0.35–1.4 |
| `scale` | `1` | Whale size, 0.72–1.25 |
| `interactionStrength` | `1` | Parallax, local glow and vortex strength, 0–1.5 |
| `activeDimming` | `0.22` | Opacity while typing/running, 0.12–0.6 |

Values are validated host-side by Schemastery and served to the client through a same-origin read-only endpoint. If public slots or required services are missing in your Harness build, the plugin logs a clear error and stops safely.

## 🌊 Behavior

- The whale outline is sampled directly from the `favicon.svg` path in this repo — WebGL2 renders ≈1,750 regular grid points.
- ~11 s vertical breathing, a ~29 s slow turn, plus tail-fin motion and gentle buoyancy; the pointer adds ~6° parallax, positional offset and an outward-spreading local brightness wave.
- Inside the whale, particles within ~160 px of the pointer form a continuous liquid vortex with a mild alternating radial wave — no hollow core forms; after the pointer leaves they settle back softly in ~650 ms. The base dot matrix is never modified.
- Follows the Harness appearance setting (light / dark / system): dark keeps white→ice-blue particles, light switches to high-contrast ink `#050b14`, with matching semantic tokens, mist layers and background.
- Both themes expose the full-screen base layer behind the app frame; sidebar, inputs, conversation content and settings windows keep their own surfaces — no full-screen veil washing out the dots.
- Full brightness with no session open; ~72 % once a session opens; at least 34 % while typing or a task runs (still honors a stronger `activeDimming`), ~600 ms transitions.
- Pauses when the page is hidden; completely still under `prefers-reduced-motion: reduce`.
- DPR capped at 1.5; `auto` steps down high → medium → low after sustained frame drops.
- Without WebGL2, a static Canvas2D dot-matrix whale is rendered automatically.
- On disable or hot-swap, every DOM node, style, listener and animation is removed and the original Harness theme is restored.

## 🧩 Architecture & ecosystem

This is one of the first third-party client plugins for DeepSeek Harness. It participates in the lifecycle through the public `shell.overlay` slot: the wallpaper canvas is prepended beneath the app frame and never blocks Harness controls.

```text
src/
├── index.ts        host entry — config route via webServer inject
├── client.tsx      client entry — mounts through shell.overlay slot
├── renderer.ts     the single WebGL2 render kernel (shared with the preview)
├── theme.ts        semantic token overrides + injected CSS
├── activity.ts     session/input/run focus dimming
├── whale-path.ts   samples the favicon.svg outline into grid points
└── config.ts       Schemastery schema + defaults
```

Zero runtime dependencies; three devDependencies (esbuild, typescript, schemastery). `lib/` and `preview.js` are build artifacts produced by `pnpm build`.

## 🔧 Development

```bash
pnpm install
pnpm build     # rebuild lib/ + preview.js
pnpm check     # schema & bundle sanity checks

# standalone preview (same renderer as the plugin)
python3 -m http.server 4173   # then open http://127.0.0.1:4173/
```

## ❓ FAQ & troubleshooting

**No whale after installing?** Restart `dsh web` (the client bundle composes at boot), then refresh. Verify with `dsh plugin --profile web why dsh-plugin-harness-whale` (npm route) or that the `insert` entry exists in `~/.dsh/profiles/web/cordis.patch.yml` (tarball route). The page body should carry `data-dsh-harness-whale="true"`.

**pnpm ≥ 10 blocked the install script?** This plugin declares no lifecycle scripts, so nothing is blocked — no `allowBuilds` entry is needed.

**Frame drops / fan noise?** Set `quality: low` or `medium`, lower `brightness`, or reduce `interactionStrength`. `auto` already steps quality down under sustained drops.

**No WebGL2 in your browser?** The static Canvas2D fallback renders automatically — you get the still dot-matrix whale instead.

**Uninstall.** npm route: `dsh plugin --profile web remove dsh-plugin-harness-whale`. Tarball route: remove the `insert` entry and delete `~/.dsh/profiles/node_modules/dsh-plugin-harness-whale`. Either way the original theme and layout come back after a restart.

**Updating.** npm route: `dsh plugin --profile web add dsh-plugin-harness-whale@latest`. Tarball route: extract the new release over the old directory. Restart `dsh web` afterwards.

## 🔭 Compatibility

Targets the browser web UI of `@deepseek-ai/dsh 0.1.1-rc.2`. The Harness is in dev-preview — if `dsh.client`, `ctx.theme` or the `shell.overlay` protocol change, compatibility needs a re-check.

## 🗒️ Changelog

See [CHANGELOG.md](CHANGELOG.md).

## 📄 License

[MIT](LICENSE)
