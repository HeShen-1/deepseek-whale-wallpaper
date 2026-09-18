export type WallpaperQuality = 'auto' | 'low' | 'medium' | 'high'

/**
 * One knob for the whole look instead of a slider per effect: `calm` is the
 * working default (restrained glow and mist), `vivid` turns the ambience up for
 * demos and screenshots.
 */
export type WallpaperPreset = 'calm' | 'vivid'

export interface WallpaperConfig {
  enabled: boolean
  quality: WallpaperQuality
  preset: WallpaperPreset
  brightness: number
  scale: number
  interactionStrength: number
  activeDimming: number
}

export const DEFAULT_WALLPAPER_CONFIG: WallpaperConfig = Object.freeze({
  enabled: true,
  quality: 'auto',
  preset: 'calm',
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
  const preset = ['calm', 'vivid'].includes(String(raw.preset))
    ? raw.preset as WallpaperPreset
    : DEFAULT_WALLPAPER_CONFIG.preset

  return {
    enabled: raw.enabled !== false,
    quality,
    preset,
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
