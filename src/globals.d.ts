/**
 * Build-time constant injected by `scripts/build.mjs` from package.json, so a
 * running page can report exactly which plugin build is live:
 * `document.querySelector('.dsh-harness-whale-wallpaper').dataset.version`.
 */
declare const __HWW_VERSION__: string
