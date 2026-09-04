// Browser-test helper: emulate a device without WebGL2 before app scripts run.
const nativeGetContext = HTMLCanvasElement.prototype.getContext
HTMLCanvasElement.prototype.getContext = function getContext(type, ...args) {
  if (type === 'webgl2') return null
  return nativeGetContext.call(this, type, ...args)
}
