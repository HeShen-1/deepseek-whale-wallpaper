import type { ActivityState } from './renderer.ts'

type UnknownRecord = Record<string, unknown>

const asRecord = (value: unknown): UnknownRecord | undefined =>
  typeof value === 'object' && value !== null ? value as UnknownRecord : undefined

const callSnapshot = (value: unknown): UnknownRecord | undefined => {
  const source = asRecord(value)
  const getter = source?.getSnapshot
  if (typeof getter !== 'function') return source
  try {
    return asRecord(getter.call(value))
  } catch {
    return source
  }
}

function hasRunningSignal(value: unknown, depth = 0): boolean {
  if (depth > 2) return false
  const record = callSnapshot(value)
  if (record === undefined) return false
  if (record.running === true || record.busy === true || record.streaming === true) return true
  if (Array.isArray(record.runningCalls) && record.runningCalls.length > 0) return true
  const status = String(record.status ?? record.phase ?? record.state ?? '').toLowerCase()
  if (['running', 'streaming', 'thinking', 'executing', 'pending'].includes(status)) return true
  return ['conversation', 'chat', 'agent', 'session'].some((key) => hasRunningSignal(record[key], depth + 1))
}

function isBlankSession(value: unknown): boolean {
  const record = callSnapshot(value)
  if (record?.blank === true) return true
  const summary = callSnapshot(record?.summary)
  if (summary?.blank === true) return true
  const chat = asRecord(record?.chat)
  const legacy = asRecord(chat?.legacy)
  const nodeLists = [record?.nodes, chat?.nodes, legacy?.nodes]
  return nodeLists.some((nodes) => Array.isArray(nodes) && nodes.length === 0)
}

function isTextInput(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement) return true
  return target.isContentEditable || target.closest('[contenteditable="true"]') !== null
}

export function watchActivity(ctx: unknown, update: (state: ActivityState) => void): () => void {
  const context = asRecord(ctx)
  const getService = context?.get
  let activeUntil = 0
  let current: ActivityState | undefined

  const markActive = (event: Event): void => {
    if (isTextInput(event.target)) activeUntil = performance.now() + 1700
  }

  const inspect = (): void => {
    let next: ActivityState = 'idle'
    try {
      const sessions = typeof getService === 'function' ? getService.call(ctx, 'sessions') : undefined
      const sessionsRecord = asRecord(sessions)
      const listSnapshot = callSnapshot(sessionsRecord?.list)
      const currentId = listSnapshot?.current ?? listSnapshot?.currentId ?? listSnapshot?.selected
      if (typeof currentId === 'string' && currentId.length > 0) {
        const getter = sessionsRecord?.get
        const session = typeof getter === 'function' ? getter.call(sessions, currentId) : undefined
        const items = Array.isArray(listSnapshot?.items) ? listSnapshot.items : []
        const summary = items.map(asRecord).find((item) =>
          item?.sessionId === currentId || item?.id === currentId,
        )
        const blank = summary?.blank === true || isBlankSession(session)
        next = blank ? 'idle' : 'session'
        if (!blank && (summary?.running === true || hasRunningSignal(session))) next = 'active'
      }
    } catch {
      // Current Harness client APIs are queried defensively during dev-preview changes.
    }
    if (performance.now() < activeUntil) next = 'active'
    if (next !== current) {
      current = next
      update(next)
    }
  }

  document.addEventListener('input', markActive, true)
  document.addEventListener('keydown', markActive, true)
  document.addEventListener('focusin', markActive, true)
  const timer = window.setInterval(inspect, 320)
  inspect()

  return () => {
    window.clearInterval(timer)
    document.removeEventListener('input', markActive, true)
    document.removeEventListener('keydown', markActive, true)
    document.removeEventListener('focusin', markActive, true)
  }
}
