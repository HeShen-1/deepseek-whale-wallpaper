declare module 'react' {
  export function useEffect(
    effect: () => void | (() => void),
    dependencies: readonly unknown[],
  ): void
}
