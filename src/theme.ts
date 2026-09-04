import type { WallpaperConfig } from './config.ts'
import { WhaleRenderer, type ActivityState, type WallpaperColorScheme } from './renderer.ts'

export type ThemeTokenOverrides = Record<string, { light: string; dark: string }>

export const THEME_TOKEN_OVERRIDES: ThemeTokenOverrides = {
  '--dsw-alias-bg-base': { light: 'rgba(244, 248, 255, 0.72)', dark: 'rgba(4, 9, 18, 0.20)' },
  '--dsw-alias-bg-layer-1': { light: 'rgba(248, 251, 255, 0.78)', dark: 'rgba(6, 17, 34, 0.34)' },
  '--dsw-alias-bg-layer-2': { light: 'rgba(238, 245, 255, 0.90)', dark: 'rgba(8, 23, 45, 0.84)' },
  '--dsw-alias-bg-layer-3': { light: 'rgba(232, 241, 253, 0.96)', dark: 'rgba(10, 28, 53, 0.93)' },
  '--dsw-specific-sidebar-fill': { light: 'rgba(239, 246, 255, 0.96)', dark: 'rgba(5, 15, 30, 0.95)' },
  '--dsw-alias-label-primary': { light: '#10233d', dark: '#eef5ff' },
  '--dsw-alias-label-secondary': { light: '#526a86', dark: '#aebdd0' },
  '--dsw-alias-label-tertiary': { light: '#7186a0', dark: '#7f91a8' },
  '--dsw-alias-label-caption': { light: '#8799ae', dark: '#62758d' },
  '--dsw-alias-border-l1': { light: 'rgba(76, 105, 142, 0.10)', dark: 'rgba(153, 190, 232, 0.08)' },
  '--dsw-alias-border-l2': { light: 'rgba(76, 105, 142, 0.15)', dark: 'rgba(153, 190, 232, 0.13)' },
  '--dsw-alias-border-l3': { light: 'rgba(76, 105, 142, 0.21)', dark: 'rgba(153, 190, 232, 0.18)' },
  '--dsw-alias-border-l4': { light: 'rgba(66, 96, 134, 0.28)', dark: 'rgba(174, 207, 243, 0.24)' },
  '--dsw-alias-interactive-hover': { light: 'rgba(77, 107, 254, 0.08)', dark: 'rgba(132, 177, 229, 0.10)' },
  '--dsw-alias-interactive-pressed': { light: 'rgba(77, 107, 254, 0.13)', dark: 'rgba(132, 177, 229, 0.16)' },
  '--dsw-alias-interactive-selected': { light: 'rgba(77, 107, 254, 0.14)', dark: 'rgba(77, 107, 254, 0.17)' },
  '--dsw-specific-button-secondary-fill': { light: 'rgba(255, 255, 255, 0.62)', dark: 'rgba(145, 180, 222, 0.11)' },
  '--dsw-specific-button-secondary-fill-hover': { light: 'rgba(77, 107, 254, 0.10)', dark: 'rgba(145, 180, 222, 0.17)' },
  '--dsw-specific-button-tertiary-fill-hover': { light: 'rgba(77, 107, 254, 0.08)', dark: 'rgba(145, 180, 222, 0.11)' },
  '--dsw-alias-button-elevated-fill': { light: 'rgba(248, 251, 255, 0.96)', dark: 'rgba(12, 31, 58, 0.94)' },
  '--dsw-alias-button-floating-fill': { light: 'rgba(248, 251, 255, 0.96)', dark: 'rgba(12, 31, 58, 0.94)' },
  '--dsw-alias-bg-mask-drop': { light: 'rgba(28, 48, 75, 0.26)', dark: 'rgba(3, 9, 18, 0.76)' },
}

const THEME_STYLE = `
  body[data-dsh-harness-whale="true"] {
    --hww-page: #f4f8ff;
    --hww-text: #10233d;
    --hww-text-soft: #526a86;
    --hww-text-bright: #0a1c34;
    --hww-link: #3159d9;
    --hww-border: rgba(76, 105, 142, 0.18);
    --hww-surface: rgba(247, 251, 255, 0.90);
    --hww-surface-strong: rgba(239, 246, 255, 0.97);
    --hww-surface-hover: rgba(77, 107, 254, 0.09);
    --hww-surface-selected: rgba(77, 107, 254, 0.14);
    --hww-code: rgba(220, 232, 248, 0.82);
    --hww-code-panel: rgba(239, 246, 255, 0.97);
    --hww-shadow: rgba(47, 72, 110, 0.15);
    background: var(--hww-page) !important;
  }

  body[data-dsh-harness-whale="true"][data-ds-dark-theme] {
    --hww-page: #040912;
    --hww-text: #dbe8f7;
    --hww-text-soft: #b8c8da;
    --hww-text-bright: #f3f7ff;
    --hww-link: #8fb3ff;
    --hww-border: rgba(153, 190, 232, 0.15);
    --hww-surface: rgba(8, 24, 47, 0.88);
    --hww-surface-strong: rgba(6, 17, 34, 0.98);
    --hww-surface-hover: rgba(132, 177, 229, 0.12);
    --hww-surface-selected: rgba(77, 107, 254, 0.20);
    --hww-code: rgba(31, 62, 97, 0.72);
    --hww-code-panel: rgba(6, 20, 40, 0.96);
    --hww-shadow: rgba(0, 3, 10, 0.40);
  }

  body[data-dsh-harness-whale="true"] #root {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    background: transparent !important;
  }

  body[data-dsh-harness-whale="true"] #root > [data-slot="root"] > [data-details-collapsed],
  body[data-dsh-harness-whale="true"] [data-slot="conversation"] > [data-phase] {
    background: transparent !important;
  }

  body[data-dsh-harness-whale="true"] [data-composer-card="true"] {
    background: var(--hww-surface) !important;
    border-color: var(--hww-border) !important;
    box-shadow: 0 18px 54px var(--hww-shadow) !important;
  }

  body[data-dsh-harness-whale="true"] [data-composer-card="true"] button[aria-haspopup="listbox"][class$="_add"],
  body[data-dsh-harness-whale="true"] button[aria-label="Commands"],
  body[data-dsh-harness-whale="true"] button[aria-label="命令"] {
    background: var(--hww-surface) !important;
    border: 1px solid var(--hww-border) !important;
    box-shadow: none !important;
    color: var(--hww-text) !important;
  }

  body[data-dsh-harness-whale="true"] [data-composer-card="true"] button[aria-haspopup="listbox"][class$="_add"]:hover,
  body[data-dsh-harness-whale="true"] button[aria-label="Commands"]:hover,
  body[data-dsh-harness-whale="true"] button[aria-label="命令"]:hover {
    background: var(--hww-surface-hover) !important;
    border-color: var(--hww-border) !important;
    color: var(--hww-text-bright) !important;
  }

  body[data-dsh-harness-whale="true"] [data-composer-card="true"] button[aria-haspopup="listbox"][class$="_add"] :is(svg, path),
  body[data-dsh-harness-whale="true"] button[aria-label="Commands"] :is(svg, path),
  body[data-dsh-harness-whale="true"] button[aria-label="命令"] :is(svg, path) {
    color: currentColor !important;
    fill: currentColor !important;
    stroke: currentColor !important;
  }

  body[data-dsh-harness-whale="true"] [data-slot="sidebar.brand.name"] svg > rect {
    fill: color-mix(in srgb, var(--hww-link) 24%, transparent) !important;
  }

  body[data-dsh-harness-whale="true"] [data-slot="sidebar.brand.name"] svg > rect ~ path,
  body[data-dsh-harness-whale="true"] [data-slot="sidebar.brand.name"] svg > rect ~ g path {
    fill: var(--hww-text-bright) !important;
  }

  body[data-dsh-harness-whale="true"] [role="dialog"] {
    background: var(--hww-surface-strong) !important;
    border: 1px solid var(--hww-border) !important;
    box-shadow: 0 30px 90px var(--hww-shadow) !important;
    color: var(--hww-text) !important;
  }

  body[data-dsh-harness-whale="true"] [role="dialog"] button {
    color: var(--hww-text) !important;
  }

  body[data-dsh-harness-whale="true"] [role="dialog"] button[aria-haspopup="menu"],
  body[data-dsh-harness-whale="true"] [role="dialog"] button[aria-pressed] {
    background: var(--hww-surface) !important;
    border-color: var(--hww-border) !important;
  }

  body[data-dsh-harness-whale="true"] [role="dialog"] button[aria-current="true"],
  body[data-dsh-harness-whale="true"] [role="dialog"] button[aria-pressed="true"],
  body[data-dsh-harness-whale="true"] [role="dialog"] button[aria-haspopup="menu"][aria-expanded="true"] {
    background: var(--hww-surface-selected) !important;
    box-shadow: inset 0 0 0 1px var(--hww-border) !important;
    color: var(--hww-text-bright) !important;
  }

  body[data-dsh-harness-whale="true"] [role="dialog"] button:hover:not(:disabled) {
    background: var(--hww-surface-hover) !important;
    color: var(--hww-text-bright) !important;
  }

  body[data-dsh-harness-whale="true"] [role="dialog"] button:disabled {
    color: var(--hww-text-soft) !important;
    opacity: 0.72;
  }

  body[data-dsh-harness-whale="true"] div[class*="_markdown_"] { color: var(--hww-text) !important; }
  body[data-dsh-harness-whale="true"] div[class*="_markdown_"] :is(h1, h2, h3, h4, strong) { color: var(--hww-text-bright) !important; }

  body[data-dsh-harness-whale="true"] div[class*="_markdown_"] a {
    color: var(--hww-link) !important;
    text-decoration-color: color-mix(in srgb, var(--hww-link) 42%, transparent) !important;
  }

  body[data-dsh-harness-whale="true"] div[class*="_markdown_"] code {
    background: var(--hww-code) !important;
    color: var(--hww-text) !important;
    border: 1px solid var(--hww-border) !important;
    box-shadow: none !important;
  }

  body[data-dsh-harness-whale="true"] div[class*="_markdown_"] blockquote {
    background: var(--hww-surface) !important;
    border-color: color-mix(in srgb, var(--hww-link) 38%, transparent) !important;
    color: var(--hww-text-soft) !important;
  }

  body[data-dsh-harness-whale="true"] div[class*="_markdown_"] .md-code-block {
    overflow: hidden;
    background: var(--hww-code-panel) !important;
    border: 1px solid var(--hww-border) !important;
    box-shadow: 0 12px 34px var(--hww-shadow) !important;
  }

  body[data-dsh-harness-whale="true"] div[class*="_markdown_"] .md-code-block > div:first-child,
  body[data-dsh-harness-whale="true"] div[class*="_markdown_"] .md-code-block > div:first-child > div,
  body[data-dsh-harness-whale="true"] div[class*="_markdown_"] .md-code-block pre {
    background: var(--hww-code-panel) !important;
    border-color: var(--hww-border) !important;
  }

  body[data-dsh-harness-whale="true"] div[class*="_markdown_"] .md-code-block pre,
  body[data-dsh-harness-whale="true"] div[class*="_markdown_"] .md-code-block pre code { color: var(--hww-text) !important; }

  body[data-dsh-harness-whale="true"] div[class*="_markdown_"] .md-code-block pre code {
    background: transparent !important;
    border: 0 !important;
  }

  body[data-dsh-harness-whale="true"] div[class*="_markdown_"] .md-code-block button {
    background: var(--hww-surface-hover) !important;
    border: 1px solid var(--hww-border) !important;
    color: var(--hww-text-soft) !important;
  }

  body[data-dsh-harness-whale="true"] div[class*="_markdown_"] .md-code-block button:hover {
    background: var(--hww-surface-selected) !important;
    color: var(--hww-text-bright) !important;
  }

  .dsh-harness-whale-wallpaper {
    position: fixed;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    pointer-events: none;
    background:
      radial-gradient(ellipse 68% 78% at 79% 48%, rgba(115, 158, 222, 0.22) 0%, rgba(205, 224, 249, 0.18) 43%, transparent 73%),
      radial-gradient(ellipse 46% 36% at 64% 94%, rgba(155, 188, 229, 0.18), transparent 76%),
      linear-gradient(118deg, #f8fbff 0%, #f4f8ff 45%, #eaf2fd 72%, #e5eefc 100%);
    isolation: isolate;
    transition: background 320ms ease;
  }

  body[data-ds-dark-theme] .dsh-harness-whale-wallpaper {
    background:
      radial-gradient(ellipse 68% 78% at 79% 48%, rgba(29, 78, 143, 0.26) 0%, rgba(8, 35, 72, 0.12) 43%, transparent 73%),
      radial-gradient(ellipse 46% 36% at 64% 94%, rgba(25, 61, 111, 0.16), transparent 76%),
      linear-gradient(118deg, #03070e 0%, #061326 45%, #071c38 72%, #06162b 100%);
  }

  .dsh-harness-whale-wallpaper::before,
  .dsh-harness-whale-wallpaper::after {
    content: "";
    position: absolute;
    inset: -16%;
    opacity: 0.32;
    filter: blur(48px);
    will-change: transform;
  }

  body[data-ds-dark-theme] .dsh-harness-whale-wallpaper::before,
  body[data-ds-dark-theme] .dsh-harness-whale-wallpaper::after { opacity: 0.42; }

  .dsh-harness-whale-wallpaper::before {
    background: radial-gradient(ellipse 32% 18% at 74% 58%, rgba(76, 122, 187, 0.15), transparent 72%);
    animation: dsh-whale-mist-a 52s ease-in-out infinite alternate;
  }

  .dsh-harness-whale-wallpaper::after {
    background: radial-gradient(ellipse 28% 22% at 84% 28%, rgba(37, 90, 159, 0.12), transparent 75%);
    animation: dsh-whale-mist-b 71s ease-in-out infinite alternate;
  }

  .dsh-harness-whale-wallpaper canvas {
    position: absolute;
    inset: 0;
    z-index: 1;
    display: block;
    width: 100%;
    height: 100%;
  }

  @keyframes dsh-whale-mist-a {
    from { transform: translate3d(-1.5%, 1%, 0) scale(0.98); }
    to { transform: translate3d(2.5%, -1.5%, 0) scale(1.04); }
  }

  @keyframes dsh-whale-mist-b {
    from { transform: translate3d(2%, -1%, 0) scale(1.03); }
    to { transform: translate3d(-2%, 2%, 0) scale(0.97); }
  }

  @media (prefers-reduced-motion: reduce) {
    .dsh-harness-whale-wallpaper::before,
    .dsh-harness-whale-wallpaper::after { animation: none !important; }
  }
`

export interface WallpaperMount {
  renderer: WhaleRenderer
  setActivity: (state: ActivityState) => void
  setColorScheme: (scheme: WallpaperColorScheme) => void
  dispose: () => void
}

export function mountWallpaper(
  config: WallpaperConfig,
  colorScheme: WallpaperColorScheme = 'dark',
): WallpaperMount {
  const previousAttribute = document.body.getAttribute('data-dsh-harness-whale')
  const style = document.createElement('style')
  style.dataset.plugin = 'dsh-plugin-harness-whale'
  style.textContent = THEME_STYLE
  document.head.append(style)

  const layer = document.createElement('div')
  layer.className = 'dsh-harness-whale-wallpaper'
  layer.setAttribute('aria-hidden', 'true')
  const canvas = document.createElement('canvas')
  layer.append(canvas)
  document.body.prepend(layer)
  document.body.setAttribute('data-dsh-harness-whale', 'true')

  const renderer = new WhaleRenderer(canvas, config, colorScheme)
  return {
    renderer,
    setActivity: (state) => renderer.setActivity(state),
    setColorScheme: (scheme) => renderer.setColorScheme(scheme),
    dispose: () => {
      renderer.destroy()
      layer.remove()
      style.remove()
      if (previousAttribute === null) document.body.removeAttribute('data-dsh-harness-whale')
      else document.body.setAttribute('data-dsh-harness-whale', previousAttribute)
    },
  }
}
