import { useEffect } from 'react'
import { watchActivity } from './activity.ts'
import { DEFAULT_WALLPAPER_CONFIG, resolveConfig } from './config.ts'
import type { ClientContext, ThemeSnapshot } from './harness-types.ts'
import { mountWallpaper, THEME_TOKEN_OVERRIDES, type WallpaperMount } from './theme.ts'

export const name = 'harness-whale-wallpaper-client'
export const inject = ['slots', 'theme']

async function loadConfig(signal: AbortSignal): Promise<ReturnType<typeof resolveConfig>> {
  try {
    const response = await fetch('/_plugins/harness-whale/config', {
      cache: 'no-store',
      credentials: 'same-origin',
      signal,
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return resolveConfig(await response.json())
  } catch (error) {
    if (signal.aborted) throw error
    console.warn('[harness-whale] Config endpoint unavailable; using safe defaults.', error)
    return DEFAULT_WALLPAPER_CONFIG
  }
}

function createWallpaperLifecycle(
  ctx: ClientContext,
  setMount: (mount: WallpaperMount | undefined) => void,
): () => null {
  return function HarnessWhaleWallpaper(): null {
    useEffect(() => {
      const abort = new AbortController()
      let mount: WallpaperMount | undefined
      let stopActivity: (() => void) | undefined

      void loadConfig(abort.signal).then((config) => {
        if (abort.signal.aborted || !config.enabled) return
        mount = mountWallpaper(config, ctx.theme.getTheme().active.colorScheme)
        setMount(mount)
        stopActivity = watchActivity(ctx, mount.setActivity)
      }).catch((error: unknown) => {
        if (!abort.signal.aborted) console.error('[harness-whale] Failed to start wallpaper.', error)
      })

      return () => {
        abort.abort()
        stopActivity?.()
        mount?.dispose()
        setMount(undefined)
      }
    }, [])

    return null
  }
}

export function apply(ctx: ClientContext): void {
  const slots = ctx.get('slots')
  if (slots === undefined) {
    console.error('[harness-whale] Required Harness slot service is unavailable; plugin stopped safely.')
    return
  }

  ctx.effect(
    () => ctx.theme.overrideTokens('dsh-plugin-harness-whale', THEME_TOKEN_OVERRIDES),
    'harness-whale-wallpaper: theme tokens',
  )

  let activeMount: WallpaperMount | undefined
  const syncTheme = (snapshot: ThemeSnapshot): void => {
    activeMount?.setColorScheme(snapshot.active.colorScheme)
  }
  ctx.on('theme/change', syncTheme)

  const Lifecycle = createWallpaperLifecycle(ctx, (mount) => {
    activeMount = mount
  })
  ctx.effect(
    () => slots.inject('shell.overlay', () => slots.register(
      { name: 'shell.overlay', id: 'harness-whale-wallpaper' },
      Lifecycle,
    )),
    'harness-whale-wallpaper: shell lifecycle',
  )
}
