import Schema from '@deepseek-ai/schemastery'
import type { HostContext } from './harness-types.ts'

export const name = 'harness-whale-wallpaper'
export const inject = ['webServer']

export type Quality = 'auto' | 'low' | 'medium' | 'high'

export interface Config {
  enabled: boolean
  quality: Quality
  brightness: number
  scale: number
  interactionStrength: number
  activeDimming: number
}

export const Config: Schema<Config> = Schema.object({
  enabled: Schema.boolean().default(true),
  quality: Schema.union(['auto', 'low', 'medium', 'high']).default('auto'),
  brightness: Schema.number().min(0.35).max(1.4).default(0.9),
  scale: Schema.number().min(0.72).max(1.25).default(1),
  interactionStrength: Schema.number().min(0).max(1.5).default(1),
  activeDimming: Schema.number().min(0.12).max(0.6).default(0.22),
})

export function apply(ctx: HostContext, config: Config): void {
  const payload = JSON.stringify(config)

  ctx.effect(
    () => ctx.webServer.register({
      kind: 'exact',
      path: '/_plugins/harness-whale/config',
      handler: (req, res) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          res.writeHead(405, { Allow: 'GET, HEAD' })
          res.end('method not allowed')
          return
        }

        res.writeHead(200, {
          'Cache-Control': 'no-store',
          'Content-Type': 'application/json; charset=utf-8',
          'X-Content-Type-Options': 'nosniff',
        })
        res.end(req.method === 'HEAD' ? undefined : payload)
      },
    }),
    'harness-whale-wallpaper: config endpoint',
  )
}
