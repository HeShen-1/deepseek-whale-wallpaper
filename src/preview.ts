/**
 * Standalone preview harness (also the GitHub Pages demo).
 *
 * Mounts the same renderer the plugin ships, plus a small dependency-free panel
 * for the axes worth trying before a rebuild: colour scheme, brightness and
 * quality. The choices live in the query string, so a tuned view can be linked or
 * reloaded; the plugin itself keeps its fixed art direction.
 */
import { DEFAULT_WALLPAPER_CONFIG, resolveConfig, type WallpaperConfig } from './config.ts'
import type { WallpaperColorScheme } from './renderer.ts'
import { mountWallpaper, type WallpaperMount } from './theme.ts'

const params = new URLSearchParams(location.search)
const quality = params.get('quality')
const brightness = Number(params.get('brightness'))

let scheme: WallpaperColorScheme = params.get('theme') === 'light' ? 'light' : 'dark'
const config: WallpaperConfig = resolveConfig({
  ...DEFAULT_WALLPAPER_CONFIG,
  quality: quality ?? DEFAULT_WALLPAPER_CONFIG.quality,
  preset: params.get('preset') ?? DEFAULT_WALLPAPER_CONFIG.preset,
  brightness: Number.isFinite(brightness) && brightness > 0 ? brightness : DEFAULT_WALLPAPER_CONFIG.brightness,
})

let wallpaper: WallpaperMount | undefined

function mount(): void {
  wallpaper?.dispose()
  document.body.toggleAttribute('data-ds-dark-theme', scheme === 'dark')
  wallpaper = mountWallpaper(config, scheme)
  wallpaper.setActivity('idle')
}

function sync(): void {
  params.set('theme', scheme)
  params.set('quality', config.quality)
  params.set('preset', config.preset)
  params.set('brightness', config.brightness.toFixed(2))
  history.replaceState(null, '', `${location.pathname}?${params}`)
  mount()
}

function button(label: string, active: () => boolean, onClick: () => void): HTMLButtonElement {
  const element = document.createElement('button')
  element.type = 'button'
  element.textContent = label
  element.setAttribute('aria-pressed', String(active()))
  element.addEventListener('click', () => {
    onClick()
    sync()
    render()
  })
  return element
}

const panel = document.createElement('div')
panel.className = 'preview-controls'

function render(): void {
  panel.replaceChildren()

  const themeRow = document.createElement('div')
  themeRow.className = 'preview-row'
  themeRow.append(
    button('Dark', () => scheme === 'dark', () => { scheme = 'dark' }),
    button('Light', () => scheme === 'light', () => { scheme = 'light' }),
  )

  const brightnessRow = document.createElement('label')
  brightnessRow.className = 'preview-row'
  const slider = document.createElement('input')
  slider.type = 'range'
  slider.min = '0.35'
  slider.max = '1.4'
  slider.step = '0.05'
  slider.value = String(config.brightness)
  slider.addEventListener('input', () => {
    config.brightness = Number(slider.value)
    sync()
    render()
  })
  const readout = document.createElement('span')
  readout.textContent = config.brightness.toFixed(2)
  brightnessRow.append('Brightness', slider, readout)

  const presetRow = document.createElement('div')
  presetRow.className = 'preview-row'
  presetRow.append(
    ...(['calm', 'vivid'] as const).map((value) =>
      button(value, () => config.preset === value, () => { config.preset = value }),
    ),
  )

  const qualityRow = document.createElement('div')
  qualityRow.className = 'preview-row'
  qualityRow.append(
    ...(['low', 'medium', 'high'] as const).map((value) =>
      button(value, () => config.quality === value, () => { config.quality = value }),
    ),
  )

  panel.append(themeRow, brightnessRow, presetRow, qualityRow)
}

render()
// `?ui=0` hides the panel: README screenshots and embeds want the bare wallpaper,
// while the GitHub Pages demo keeps the controls.
if (params.get('ui') !== '0') document.body.append(panel)
mount()

window.addEventListener('pagehide', () => wallpaper?.dispose(), { once: true })
