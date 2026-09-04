import { DEFAULT_WALLPAPER_CONFIG } from './config.ts'
import { mountWallpaper } from './theme.ts'

const wallpaper = mountWallpaper(DEFAULT_WALLPAPER_CONFIG)
wallpaper.setActivity('idle')

window.addEventListener('pagehide', () => wallpaper.dispose(), { once: true })
