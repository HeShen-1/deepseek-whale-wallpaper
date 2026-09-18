/**
 * Deterministic animation clock for the demo captures — runs in the page, not
 * in Node.
 *
 * Both halves of the wallpaper read the wall clock: the renderer animates from
 * `requestAnimationFrame` timestamps and the mist layers from CSS animations.
 * A screenshot loop costs about a second per frame, so a capture that *asks*
 * for 18 frames 100 ms apart actually spans ~20 s of animation. Assembled at
 * 50 ms per frame the README GIF then plays a ~20x time lapse, which is what
 * turns the calm breathing and turning into visible shaking, and the renderer's
 * own slow-machine guards fire while it runs (glow budget at 24 ms frames, auto
 * quality at 21 ms), so the whale also changes brightness halfway through the
 * loop and snaps back on every repeat.
 *
 * Installing this before the first captured frame hands the clock to the
 * capture script: `advance(ms)` renders exactly `ms` of animation in 60 Hz
 * slices, so the demo is reproducible frame for frame, no guard ever sees a
 * slow frame, and the CSS animations ride the same timeline instead of wall
 * time.
 *
 *   agent-browser eval --stdin < scripts/demo-clock.js
 *   window.__hwwClock.advance(100)      // 100 ms of animation
 *   window.__hwwClock.toYawTurn()       // park on the slow turn's still point
 */
;(() => {
  if (window.__hwwClock) return 'already-installed'

  /** The renderer's frame budget: below this every guard stays asleep. */
  const FRAME_MS = 1000 / 60
  const started = performance.now()
  let time = started
  let queue = []

  // CSS animations (the mist) would otherwise keep drifting on wall time, so
  // they would jump backwards at the GIF's loop seam.
  const pinAnimations = () => {
    for (const animation of document.getAnimations()) {
      if (animation.playState === 'finished') continue
      if (animation.__hwwBase === undefined) {
        animation.pause()
        animation.__hwwBase = Number(animation.currentTime) || 0
      }
      animation.currentTime = animation.__hwwBase + (time - started)
    }
  }

  // `requestAnimationFrame` is the renderer's only clock; its queue is drained
  // by `advance` instead of by the compositor.
  window.requestAnimationFrame = (callback) => queue.push(callback)
  window.cancelAnimationFrame = () => {}

  window.__hwwClock = {
    now: () => time,

    advance(ms) {
      for (let done = 0; done < ms; done += FRAME_MS) {
        time += FRAME_MS
        const pending = queue
        queue = []
        for (const callback of pending) callback(time)
        pinAnimations()
      }
      return { time, queued: queue.length }
    },

    /**
     * The whale's turn is `sin(uTime * 0.218)` — a 28.8 s sway. Starting the
     * sweep on one of its turning points leaves the loop seam where the widest
     * motion is momentarily still, which is the cheapest way to keep a
     * forward-only loop from reading as a jolt.
     */
    toYawTurn() {
      const seconds = time / 1000
      const first = Math.PI / 2 / 0.218
      const period = (2 * Math.PI) / 0.218
      const turn = first + Math.ceil((seconds - first) / period) * period
      return this.advance((turn - seconds) * 1000)
    },
  }

  return 'installed'
})()
