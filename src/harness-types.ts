export interface HttpRequest {
  method?: string
}

export interface HttpResponse {
  writeHead(status: number, headers?: Record<string, string>): void
  end(body?: string): void
}

export interface HostContext {
  webServer: {
    register(route: {
      kind: 'exact' | 'prefix'
      path: string
      handler: (req: HttpRequest, res: HttpResponse) => void | Promise<void>
    }): () => void
  }
  effect(effect: () => void | (() => void), label?: string): void
}

export interface SlotService {
  inject(name: string, register: () => (() => void) | void): (() => void) | void
  register(
    options: { name: string; id: string },
    component: () => null,
  ): () => void
}

export interface ThemeSnapshot {
  active: { colorScheme: 'light' | 'dark' }
}

export interface ThemeService {
  getTheme(): ThemeSnapshot
  overrideTokens(
    source: string,
    tokens: Record<string, { light: string; dark: string }>,
  ): () => void
}

export interface ClientContext {
  get(name: 'slots'): SlotService | undefined
  get(name: string): unknown
  theme: ThemeService
  on(event: 'theme/change', listener: (snapshot: ThemeSnapshot) => void): void
  effect(effect: () => void | (() => void), label?: string): void
}
