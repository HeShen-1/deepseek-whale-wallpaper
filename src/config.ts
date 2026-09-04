export type WallpaperQuality = 'auto' | 'low' | 'medium' | 'high'

export interface WallpaperConfig {
  enabled: boolean
  quality: WallpaperQuality
  brightness: number
  scale: number
  interactionStrength: number
  activeDimming: number
}

export const DEFAULT_WALLPAPER_CONFIG: WallpaperConfig = Object.freeze({
  enabled: true,
  quality: 'auto',
  brightness: 0.9,
  scale: 1,
  interactionStrength: 1,
  activeDimming: 0.22,
})

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value))

export function resolveConfig(value: unknown): WallpaperConfig {
  const raw = typeof value === 'object' && value !== null
    ? value as Partial<WallpaperConfig>
    : {}
  const quality = ['auto', 'low', 'medium', 'high'].includes(String(raw.quality))
    ? raw.quality as WallpaperQuality
    : DEFAULT_WALLPAPER_CONFIG.quality

  return {
    enabled: raw.enabled !== false,
    quality,
    brightness: clamp(Number(raw.brightness) || DEFAULT_WALLPAPER_CONFIG.brightness, 0.35, 1.4),
    scale: clamp(Number(raw.scale) || DEFAULT_WALLPAPER_CONFIG.scale, 0.72, 1.25),
    interactionStrength: clamp(
      Number.isFinite(Number(raw.interactionStrength))
        ? Number(raw.interactionStrength)
        : DEFAULT_WALLPAPER_CONFIG.interactionStrength,
      0,
      1.5,
    ),
    activeDimming: clamp(Number(raw.activeDimming) || DEFAULT_WALLPAPER_CONFIG.activeDimming, 0.12, 0.6),
  }
}
