import {
  DEFAULT_WALLPAPER_CONFIG,
  type WallpaperConfig,
  type WallpaperPreset,
  type WallpaperQuality,
} from './config.ts'
import type { ZoneRect } from './reading-zone.ts'
import { PATH_VIEW_SIZE, WHALE_PATH } from './whale-path.ts'

export type ActivityState = 'idle' | 'session' | 'active'
export type WallpaperColorScheme = 'light' | 'dark'

type Point = {
  x: number
  y: number
  depth: number
  seed: number
  size: number
  kind: 0 | 1
}

const QUALITY_POINTS: Record<Exclude<WallpaperQuality, 'auto'>, number> = {
  low: 900,
  medium: 1300,
  high: 1750,
}

/** Reading zones the vertex shader can soften at once. */
export const ZONE_MAX = 16
/**
 * Zone softening is deliberately split across both axes and kept mild: a strong
 * size factor steps the grain where a band ends (the whale then reads as fine
 * above the text and coarse below it), and a strong alpha factor greys the ink
 * out. Small amounts of each calm the texture behind text while the reading
 * scrim carries the actual readability.
 */
const ZONE_SCALE = 0.86
const ZONE_ALPHA = 0.92

const vertexShader = `
  precision highp float;
  attribute vec2 aPosition;
  attribute vec4 aMeta;
  uniform vec2 uViewport;
  uniform vec2 uPointer;
  uniform vec2 uFlowPointer;
  uniform float uTime;
  uniform float uDpr;
  uniform float uScale;
  uniform float uMotion;
  uniform float uOpacity;
  uniform float uBrightness;
  uniform float uInteraction;
  uniform float uFlowStrength;
  uniform highp float uColorScheme;
  uniform vec4 uZoneRects[${ZONE_MAX}];
  uniform float uZoneCount;
  uniform float uZoneSoft;
  uniform float uZoneScale;
  uniform float uZoneAlpha;
  varying float vAlpha;
  varying float vKind;
  varying float vCool;

  /**
   * 1.0 inside a reading zone (a rectangle that carries text), fading out over a
   * wide border so the grain change reads as depth of field, not as a band edge.
   */
  float zoneMask(vec2 p) {
    float mask = 0.0;
    for (int i = 0; i < ${ZONE_MAX}; i++) {
      if (float(i) >= uZoneCount) break;
      vec4 rect = uZoneRects[i];
      float dx = max(rect.x - p.x, p.x - (rect.x + rect.z));
      float dy = max(rect.y - p.y, p.y - (rect.y + rect.w));
      mask = max(mask, 1.0 - smoothstep(-28.0, 104.0, max(dx, dy)));
    }
    return mask;
  }

  void main() {
    float depth = aMeta.x;
    float seed = aMeta.y;
    float pointSize = aMeta.z;
    float kind = aMeta.w;
    vKind = kind;

    if (kind > 0.5) {
      vec2 dust = aPosition;
      dust.x = fract(dust.x + sin(uTime * 0.028 + seed * 12.0) * 0.009 * uMotion);
      dust.y = fract(dust.y - uTime * (0.0009 + seed * 0.0013) * uMotion);
      vec2 px = dust * uViewport;
      float dustZone = zoneMask(px) * uZoneSoft;
      gl_Position = vec4(px.x / uViewport.x * 2.0 - 1.0, 1.0 - px.y / uViewport.y * 2.0, 0.8, 1.0);
      gl_PointSize = max(0.8, pointSize * uDpr) * mix(1.0, uZoneScale, dustZone);
      vAlpha = (0.055 + seed * 0.08) * uOpacity * mix(1.0, uZoneAlpha, dustZone);
      vCool = 0.2;
      return;
    }

    float compact = smoothstep(520.0, 960.0, uViewport.x);
    float sceneSize = min(uViewport.y * mix(0.46, 0.64, compact), uViewport.x * mix(0.68, 0.48, compact)) * uScale;
    vec2 center = vec2(uViewport.x * mix(0.56, 0.735, compact), uViewport.y * 0.49);
    vec2 p = aPosition;

    vec2 pointerUnit = clamp(uPointer / uViewport - 0.5, vec2(-0.5), vec2(0.5));

    // The logo starts as a flat path. A broad, deterministic depth field makes
    // the long turn legible instead of rotating an almost perfectly flat card.
    float bodyShell = max(0.0, 1.0 - length(vec2(p.x * 1.38, p.y * 1.82)));
    float z = depth * 0.11 + bodyShell * 0.15;
    float yaw = (
      sin(uTime * 0.218) * 0.17
      + pointerUnit.x * 0.23 * uInteraction
    ) * uMotion;
    float pitch = (
      sin(uTime * 0.171 + 0.8) * 0.026
      - pointerUnit.y * 0.14 * uInteraction
    ) * uMotion;
    float cy = cos(yaw);
    float sy = sin(yaw);
    float x3 = p.x * cy + z * sy;
    float z3 = -p.x * sy + z * cy;
    float cp = cos(pitch);
    float sp = sin(pitch);
    float y3 = p.y * cp - z3 * sp;
    z3 = p.y * sp + z3 * cp;

    float tailMask = smoothstep(0.08, 0.43, p.x) * (1.0 - smoothstep(0.02, 0.34, p.y));
    float finMask = smoothstep(0.04, 0.30, p.y)
      * smoothstep(-0.20, 0.16, p.x)
      * (1.0 - smoothstep(0.28, 0.46, p.x));
    float swim = sin(uTime * 0.76 - p.x * 5.2);
    float bodyWave = swim * (0.006 + tailMask * 0.030) * uMotion;
    float fin = sin(uTime * 1.06 + 0.7 + seed * 0.12) * 0.028 * finMask * uMotion;
    float breathPhase = sin(uTime * 0.56);
    vec2 breath = vec2(1.0 + breathPhase * 0.015, 1.0 + breathPhase * 0.040 * bodyShell * bodyShell);
    float perspective = 1.0 + z3 * 0.34;
    vec2 shaped = vec2(x3 * perspective, y3 + bodyWave + fin) * breath;
    vec2 parallax = vec2(pointerUnit.x * 24.0, pointerUnit.y * 15.0) * uInteraction * uMotion;
    float buoyancy = sin(uTime * 0.43 + 0.4) * 8.0 * uMotion;
    vec2 px = center + shaped * sceneSize + parallax + vec2(0.0, buoyancy);

    // Keep the base point cloud immutable. The cursor only applies a temporary,
    // shader-side liquid displacement, so every point returns exactly home.
    vec2 flowDelta = px - uFlowPointer;
    float flowDistance = length(flowDelta);
    float flowRadius = clamp(sceneSize * 0.42, 185.0, 215.0);
    vec2 radial = flowDistance > 0.01
      ? flowDelta / flowDistance
      : vec2(cos(seed * 31.0), sin(seed * 31.0));
    vec2 tangent = vec2(-radial.y, radial.x);
    float flowFalloff = pow(1.0 - smoothstep(0.0, flowRadius, flowDistance), 0.62);
    float liquidPhase = sin(uTime * 2.15 + seed * 18.0 + flowDistance * 0.045);
    float radialPhase = sin(uTime * 1.68 + seed * 27.0 - flowDistance * 0.058);
    float orbitDirection = step(0.5, fract(seed * 7.31)) * 2.0 - 1.0;
    vec2 eddyDirection = vec2(
      sin(uTime * 1.37 + seed * 41.0),
      cos(uTime * 1.19 + seed * 37.0)
    );
    float flow = flowFalloff * uFlowStrength * uInteraction * uMotion;
    vec2 disruption = tangent * (17.0 + liquidPhase * 9.0) * orbitDirection * flow
      + radial * radialPhase * 9.0 * flow
      + eddyDirection * 10.5 * flow;
    px += disruption;

    float whaleZone = zoneMask(px) * uZoneSoft;
    gl_Position = vec4(px.x / uViewport.x * 2.0 - 1.0, 1.0 - px.y / uViewport.y * 2.0, z3 * 0.05, 1.0);
    gl_PointSize = (1.30 + pointSize * 1.60)
      * uDpr * mix(1.0, 1.42, uColorScheme) * mix(1.0, uZoneScale, whaleZone);
    vAlpha = (0.62 + seed * 0.38) * uOpacity * uBrightness * mix(1.0, uZoneAlpha, whaleZone);
    vCool = clamp(0.24 + depth * 1.55, 0.0, 1.0);
  }
`

const fragmentShader = `
  precision mediump float;
  varying float vAlpha;
  varying float vKind;
  varying float vCool;
  uniform highp float uColorScheme;

  void main() {
    vec2 p = gl_PointCoord - vec2(0.5);
    float radius = length(p);
    float edge = 1.0 - smoothstep(0.31, 0.5, radius);
    float lightWhaleEdge = 1.0 - smoothstep(0.44, 0.5, radius);
    if (edge <= 0.0) discard;
    // Dark-mode ink: a pure white core, with only a faint blue depth tint left
    // so the matrix reads white instead of pale grey over the deep pool.
    vec3 darkWhale = mix(vec3(1.0, 1.0, 1.0), vec3(0.88, 0.94, 1.0), vCool * 0.20);
    vec3 lightWhale = vec3(0.019608, 0.043137, 0.078431);
    vec3 whale = mix(darkWhale, lightWhale, uColorScheme);
    vec3 darkDust = vec3(0.58, 0.75, 0.95);
    vec3 lightDust = vec3(0.28, 0.44, 0.68);
    vec3 dust = mix(darkDust, lightDust, uColorScheme);
    // Dark mode carries the brighter ink on both axes: a lifted alpha floor for
    // the whale (sparse dust keeps its proportional alpha) plus a 1.28x boost.
    // Light mode keeps its own curve, so its contrast is unchanged.
    float darkInk = vKind > 0.5 ? vAlpha : 0.20 + 0.80 * vAlpha;
    float darkAlpha = edge * darkInk * 1.28;
    float lightAlpha = vAlpha * 1.55 * mix(lightWhaleEdge, edge, vKind);
    gl_FragColor = vec4(
      mix(whale, dust, vKind),
      mix(darkAlpha, lightAlpha, uColorScheme)
    );
  }
`

/**
 * Glow pass: the same point cloud is drawn once more into a half-resolution
 * target, blurred, and composited over the sharp pass. Dark mode adds the halo
 * (screen blend) so the ink reads luminous; light mode multiplies it in, which
 * gives the dark ink a soft shadow instead of a light leak.
 */
const quadVertexShader = `
  precision highp float;
  attribute vec2 aCorner;
  varying vec2 vUv;

  void main() {
    vUv = aCorner * 0.5 + 0.5;
    gl_Position = vec4(aCorner, 0.0, 1.0);
  }
`

const blurFragmentShader = `
  precision mediump float;
  varying vec2 vUv;
  uniform sampler2D uSource;
  uniform vec2 uStep;

  void main() {
    vec4 sum = texture2D(uSource, vUv) * 0.227027;
    sum += texture2D(uSource, vUv + uStep * 1.3846) * 0.316216;
    sum += texture2D(uSource, vUv - uStep * 1.3846) * 0.316216;
    sum += texture2D(uSource, vUv + uStep * 3.2308) * 0.070270;
    sum += texture2D(uSource, vUv - uStep * 3.2308) * 0.070270;
    gl_FragColor = sum;
  }
`

const compositeFragmentShader = `
  precision mediump float;
  varying vec2 vUv;
  uniform sampler2D uSource;
  uniform float uStrength;
  uniform float uMode;
  uniform vec3 uInk;

  void main() {
    vec3 blurred = texture2D(uSource, vUv).rgb;
    // The offscreen target holds premultiplied dots, so its brightest channel is
    // how much ink this texel carries. Alpha must follow that coverage, or the
    // fullscreen composite would paint the whole canvas opaque and hide the pool.
    float coverage = clamp(max(max(blurred.r, blurred.g), blurred.b), 0.0, 1.0) * uStrength;
    vec3 added = blurred * uStrength;
    gl_FragColor = vec4(mix(added, uInk, uMode), coverage);
  }
`

/** Glow strength per colour scheme and preset (dark adds light, light shadows). */
const GLOW_STRENGTH: Record<WallpaperPreset, Record<WallpaperColorScheme, number>> = {
  calm: { light: 0.45, dark: 0.6 },
  vivid: { light: 0.68, dark: 0.9 },
}
/** Glow target resolution relative to the canvas. */
const GLOW_SCALE = 0.5
/** Frame time (ms) above which the glow pass turns itself off. */
const GLOW_BUDGET_MS = 24
/** Consecutive over-budget frames tolerated before the glow is dropped. */
const GLOW_BUDGET_FRAMES = 90

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value))

const hash = (value: number): number => {
  const x = Math.sin(value * 91.913 + 17.17) * 43758.5453
  return x - Math.floor(x)
}

function countForSpacing(path: Path2D, context: CanvasRenderingContext2D, spacing: number): number {
  let count = 0
  for (let y = spacing * 0.5; y < PATH_VIEW_SIZE; y += spacing) {
    for (let x = spacing * 0.5; x < PATH_VIEW_SIZE; x += spacing) {
      if (context.isPointInPath(path, x, y)) count += 1
    }
  }
  return count
}

function sampleWhale(target: number): Point[] {
  const probe = document.createElement('canvas')
  const context = probe.getContext('2d')
  if (context === null || typeof Path2D === 'undefined') return []

  const path = new Path2D(WHALE_PATH)
  let low = 0.35
  let high = 2.5
  for (let index = 0; index < 18; index += 1) {
    const spacing = (low + high) * 0.5
    if (countForSpacing(path, context, spacing) > target) low = spacing
    else high = spacing
  }

  const spacing = high
  const points: Point[] = []
  let id = 0
  for (let y = spacing * 0.5; y < PATH_VIEW_SIZE; y += spacing) {
    for (let x = spacing * 0.5; x < PATH_VIEW_SIZE; x += spacing) {
      if (!context.isPointInPath(path, x, y)) continue
      const seed = hash(id + 1)
      points.push({
        x: x / PATH_VIEW_SIZE - 0.5,
        y: y / PATH_VIEW_SIZE - 0.5,
        depth: hash(id * 1.73 + 9.1) - 0.5,
        seed,
        size: 0.35 + hash(id * 2.41 + 3.7) * 0.9,
        kind: 0,
      })
      id += 1
    }
  }
  return points
}

function sampleDust(count: number): Point[] {
  return Array.from({ length: count }, (_, index) => ({
    x: hash(index * 4.17 + 1.2),
    y: hash(index * 7.31 + 8.4),
    depth: hash(index * 2.7 + 5.1),
    seed: hash(index * 8.61 + 2.9),
    size: 0.45 + hash(index * 5.27 + 1.7) * 0.75,
    kind: 1 as const,
  }))
}

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)
  if (shader === null) throw new Error('Unable to create WebGL shader')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? 'unknown shader error'
    gl.deleteShader(shader)
    throw new Error(message)
  }
  return shader
}

function createProgram(
  gl: WebGL2RenderingContext,
  vertexSource: string = vertexShader,
  fragmentSource: string = fragmentShader,
): WebGLProgram {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource)
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource)
  const program = gl.createProgram()
  if (program === null) throw new Error('Unable to create WebGL program')
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  gl.deleteShader(vertex)
  gl.deleteShader(fragment)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) ?? 'unknown program error'
    gl.deleteProgram(program)
    throw new Error(message)
  }
  return program
}

const activityOpacity = (state: ActivityState, activeDimming: number): number => {
  if (state === 'active') return Math.max(activeDimming, 0.5)
  if (state === 'session') return 0.78
  return 1
}

export class WhaleRenderer {
  private readonly canvas: HTMLCanvasElement
  private readonly config: WallpaperConfig
  private gl: WebGL2RenderingContext | null = null
  private context2d: CanvasRenderingContext2D | null = null
  private program: WebGLProgram | null = null
  private blurProgram: WebGLProgram | null = null
  private compositeProgram: WebGLProgram | null = null
  private buffer: WebGLBuffer | null = null
  private quadBuffer: WebGLBuffer | null = null
  private pointAttributes = { position: -1, meta: -1 }
  private glowTargets: { framebuffer: WebGLFramebuffer; texture: WebGLTexture }[] = []
  private glowSize = { width: 0, height: 0 }
  private pointCount = 0
  private quality: Exclude<WallpaperQuality, 'auto'>
  private activity: ActivityState = 'idle'
  /** Welcome screen: no text to read, so the whale keeps full strength there. */
  private showcase = true
  private opacity = 1
  private targetOpacity = 1
  private pointer = { x: 0, y: 0 }
  private pointerTarget = { x: 0, y: 0 }
  private flowPointer = { x: 0, y: 0 }
  private flowPointerTarget = { x: 0, y: 0 }
  private flowStrength = 0
  private flowTarget = 0
  private colorScheme: WallpaperColorScheme
  private zones: readonly ZoneRect[] = []
  private readonly zoneData = new Float32Array(ZONE_MAX * 4)
  private frame = 0
  private lastFrame = 0
  private slowFrames = 0
  private slowGlowFrames = 0
  /** Cleared once the glow pass cannot hold the frame budget on this machine. */
  private glowEnabled = false
  private reduced = false
  private destroyed = false
  private readonly resizeObserver: ResizeObserver
  private readonly reducedMotion: MediaQueryList

  constructor(
    canvas: HTMLCanvasElement,
    config: WallpaperConfig = DEFAULT_WALLPAPER_CONFIG,
    colorScheme: WallpaperColorScheme = 'dark',
  ) {
    this.canvas = canvas
    this.config = config
    this.colorScheme = colorScheme
    this.quality = config.quality === 'auto' ? 'high' : config.quality
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    this.reduced = this.reducedMotion.matches
    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(canvas)

    try {
      this.gl = canvas.getContext('webgl2', {
        alpha: true,
        antialias: false,
        depth: false,
        powerPreference: 'high-performance',
        premultipliedAlpha: true,
      })
      if (this.gl === null) throw new Error('WebGL2 unavailable')
      this.initializeWebGL()
      canvas.dataset.renderer = 'webgl2'
    } catch (error) {
      this.gl = null
      this.program = null
      this.buffer = null
      this.context2d = canvas.getContext('2d')
      canvas.dataset.renderer = 'canvas2d'
      console.info('[harness-whale] WebGL2 unavailable; using a static Canvas2D whale.', error)
    }

    this.resize()
    window.addEventListener('pointermove', this.onPointerMove, { passive: true })
    window.addEventListener('blur', this.onPointerLeave)
    document.documentElement.addEventListener('pointerleave', this.onPointerLeave)
    document.addEventListener('visibilitychange', this.onVisibilityChange)
    this.reducedMotion.addEventListener('change', this.onReducedMotion)
    if (!document.hidden && !this.reduced && this.gl !== null) this.start()
  }

  setActivity(state: ActivityState): void {
    this.activity = state
    this.canvas.dataset.activity = state
    this.targetOpacity = this.showcase ? 1 : activityOpacity(state, this.config.activeDimming)
    if (this.reduced || this.gl === null) this.renderStatic()
  }

  /**
   * The welcome screen has no text to read, so activity dimming does not apply
   * there: it is the wallpaper's showcase and stays at full strength.
   */
  setShowcase(value: boolean): void {
    this.canvas.dataset.showcase = value ? 'on' : 'off'
    if (this.showcase === value) return
    this.showcase = value
    this.targetOpacity = value ? 1 : activityOpacity(this.activity, this.config.activeDimming)
    if (this.reduced || this.gl === null) this.renderStatic()
  }

  /**
   * Text blocks the whale should stay out of the way of. Pass `null` when the
   * zones cannot be measured; the column then keeps its plain reading scrim.
   */
  setReadingZones(rects: readonly ZoneRect[] | null): void {
    const next = (rects ?? []).slice(0, ZONE_MAX)
    const unchanged = next.length === this.zones.length && next.every((rect, index) => {
      const current = this.zones[index]
      return current.x === rect.x && current.y === rect.y &&
        current.w === rect.w && current.h === rect.h
    })
    if (unchanged) return
    this.zones = next
    this.zoneData.fill(0)
    this.zones.forEach((rect, index) => {
      this.zoneData.set([rect.x, rect.y, rect.w, rect.h], index * 4)
    })
    if (this.reduced || this.gl === null) this.renderStatic()
  }

  setColorScheme(scheme: WallpaperColorScheme): void {
    if (this.colorScheme === scheme) return
    this.colorScheme = scheme
    this.canvas.dataset.colorScheme = scheme
    if (this.reduced || this.gl === null) this.renderStatic()
  }

  destroy(): void {
    this.destroyed = true
    cancelAnimationFrame(this.frame)
    this.resizeObserver.disconnect()
    window.removeEventListener('pointermove', this.onPointerMove)
    window.removeEventListener('blur', this.onPointerLeave)
    document.documentElement.removeEventListener('pointerleave', this.onPointerLeave)
    document.removeEventListener('visibilitychange', this.onVisibilityChange)
    this.reducedMotion.removeEventListener('change', this.onReducedMotion)
    if (this.gl !== null) {
      if (this.buffer !== null) this.gl.deleteBuffer(this.buffer)
      if (this.quadBuffer !== null) this.gl.deleteBuffer(this.quadBuffer)
      if (this.program !== null) this.gl.deleteProgram(this.program)
      if (this.blurProgram !== null) this.gl.deleteProgram(this.blurProgram)
      if (this.compositeProgram !== null) this.gl.deleteProgram(this.compositeProgram)
      for (const target of this.glowTargets) {
        this.gl.deleteFramebuffer(target.framebuffer)
        this.gl.deleteTexture(target.texture)
      }
      this.glowTargets = []
    }
  }

  private initializeWebGL(): void {
    const gl = this.gl
    if (gl === null) return
    this.program = createProgram(gl)
    this.buffer = gl.createBuffer()
    if (this.buffer === null) throw new Error('Unable to allocate WebGL point buffer')
    this.quadBuffer = gl.createBuffer()
    if (this.quadBuffer === null) throw new Error('Unable to allocate WebGL quad buffer')
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    )
    if (this.quality !== 'low') {
      // The glow is an enhancement: a driver that rejects these programs must
      // still get the sharp whale, never an empty canvas.
      try {
        this.blurProgram = createProgram(gl, quadVertexShader, blurFragmentShader)
        this.compositeProgram = createProgram(gl, quadVertexShader, compositeFragmentShader)
        this.glowEnabled = true
      } catch (error) {
        this.blurProgram = null
        this.compositeProgram = null
        this.glowEnabled = false
        this.canvas.dataset.glow = 'unavailable'
        console.warn('[harness-whale] glow pass unavailable on this driver; drawing the sharp pass only.', error)
      }
    }
    gl.enable(gl.BLEND)
    gl.blendFuncSeparate(
      gl.SRC_ALPHA,
      gl.ONE_MINUS_SRC_ALPHA,
      gl.ONE,
      gl.ONE_MINUS_SRC_ALPHA,
    )
    this.uploadPoints()
  }

  /** Half-resolution targets for the glow pass; rebuilt whenever the canvas resizes. */
  private resizeGlowTargets(): void {
    const gl = this.gl
    if (gl === null || this.blurProgram === null) return
    const width = Math.max(1, Math.round(this.canvas.width * GLOW_SCALE))
    const height = Math.max(1, Math.round(this.canvas.height * GLOW_SCALE))
    if (this.glowTargets.length === 2 && this.glowSize.width === width && this.glowSize.height === height) {
      return
    }
    this.glowSize = { width, height }
    for (const target of this.glowTargets) {
      gl.deleteFramebuffer(target.framebuffer)
      gl.deleteTexture(target.texture)
    }
    this.glowTargets = []
    for (let index = 0; index < 2; index += 1) {
      const target = gl.createTexture()
      const framebuffer = gl.createFramebuffer()
      if (target === null || framebuffer === null) return
      gl.bindTexture(gl.TEXTURE_2D, target)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target, 0)
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
        // An unusable target would make the composite sample nothing; keep the
        // sharp pass and report why the glow is missing.
        gl.deleteFramebuffer(framebuffer)
        gl.deleteTexture(target)
        for (const allocated of this.glowTargets) {
          gl.deleteFramebuffer(allocated.framebuffer)
          gl.deleteTexture(allocated.texture)
        }
        this.glowTargets = []
        this.glowEnabled = false
        this.canvas.dataset.glow = 'unavailable'
        console.warn('[harness-whale] glow target framebuffer is incomplete; drawing the sharp pass only.')
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        return
      }
      this.glowTargets.push({ framebuffer, texture: target })
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  }

  private uploadPoints(): void {
    const gl = this.gl
    const program = this.program
    const buffer = this.buffer
    if (gl === null || program === null || buffer === null) return
    const whale = sampleWhale(QUALITY_POINTS[this.quality])
    const dust = sampleDust(this.quality === 'low' ? 34 : this.quality === 'medium' ? 52 : 68)
    const points = [...whale, ...dust]
    const data = new Float32Array(points.length * 6)
    points.forEach((point, index) => {
      const offset = index * 6
      data[offset] = point.x
      data[offset + 1] = point.y
      data[offset + 2] = point.depth
      data[offset + 3] = point.seed
      data[offset + 4] = point.size
      data[offset + 5] = point.kind
    })
    this.pointCount = points.length
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
    this.pointAttributes = {
      position: gl.getAttribLocation(program, 'aPosition'),
      meta: gl.getAttribLocation(program, 'aMeta'),
    }
    this.bindPointAttributes()
  }

  /**
   * Vertex attribute bindings are global context state, and the glow pass binds
   * the quad program's own attribute in between point draws. Re-establish the
   * point pointers before every draw instead of once at upload time; otherwise a
   * driver that assigns `aCorner` to the same index as `aPosition` leaves the
   * next frame reading the quad buffer and the whale disappears.
   */
  private bindPointAttributes(): void {
    const gl = this.gl
    const buffer = this.buffer
    if (gl === null || buffer === null) return
    const { position, meta } = this.pointAttributes
    if (position < 0 || meta < 0) return
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 24, 0)
    gl.enableVertexAttribArray(meta)
    gl.vertexAttribPointer(meta, 4, gl.FLOAT, false, 24, 8)
  }

  private resize(): void {
    const rect = this.canvas.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return
    const maxDpr = this.quality === 'low' ? 1 : this.quality === 'medium' ? 1.25 : 1.5
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr)
    const width = Math.max(1, Math.round(rect.width * dpr))
    const height = Math.max(1, Math.round(rect.height * dpr))
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width
      this.canvas.height = height
    }
    this.resizeGlowTargets()
    this.pointer.x = this.pointerTarget.x = rect.width * 0.72
    this.pointer.y = this.pointerTarget.y = rect.height * 0.5
    this.flowPointer.x = this.flowPointerTarget.x = this.pointer.x
    this.flowPointer.y = this.flowPointerTarget.y = this.pointer.y
    this.canvas.dataset.colorScheme = this.colorScheme
    this.renderStatic()
  }

  private start(): void {
    cancelAnimationFrame(this.frame)
    this.lastFrame = performance.now()
    this.frame = requestAnimationFrame(this.tick)
  }

  private readonly tick = (now: number): void => {
    if (this.destroyed || document.hidden || this.reduced || this.gl === null) return
    const delta = Math.min(50, now - this.lastFrame)
    this.lastFrame = now
    const ease = 1 - Math.exp(-delta / 600)
    this.opacity += (this.targetOpacity - this.opacity) * ease
    this.pointer.x += (this.pointerTarget.x - this.pointer.x) * Math.min(1, delta / 190)
    this.pointer.y += (this.pointerTarget.y - this.pointer.y) * Math.min(1, delta / 190)
    this.flowPointer.x += (this.flowPointerTarget.x - this.flowPointer.x) * Math.min(1, delta / 120)
    this.flowPointer.y += (this.flowPointerTarget.y - this.flowPointer.y) * Math.min(1, delta / 120)
    const flowEase = 1 - Math.exp(-delta / (this.flowTarget > this.flowStrength ? 140 : 800))
    this.flowStrength += (this.flowTarget - this.flowStrength) * flowEase
    this.renderWebGL(now * 0.001)

    if (this.glowEnabled) {
      // Cheap first response to a slow machine: drop the glow before throwing
      // away point density.
      this.slowGlowFrames = delta > GLOW_BUDGET_MS
        ? this.slowGlowFrames + 1
        : Math.max(0, this.slowGlowFrames - 3)
      if (this.slowGlowFrames > GLOW_BUDGET_FRAMES) {
        this.glowEnabled = false
        this.slowGlowFrames = 0
        this.canvas.dataset.glow = 'off'
        console.info(
          `[harness-whale] glow pass disabled: ${Math.round(delta)} ms frames exceeded the ` +
            `${GLOW_BUDGET_MS} ms budget for ${GLOW_BUDGET_FRAMES} frames.`,
        )
      }
    }

    if (this.config.quality === 'auto') {
      this.slowFrames = delta > 21 ? this.slowFrames + 1 : Math.max(0, this.slowFrames - 2)
      if (this.slowFrames > 150 && this.quality !== 'low') {
        this.quality = this.quality === 'high' ? 'medium' : 'low'
        this.slowFrames = 0
        this.uploadPoints()
        this.resize()
      }
    }
    this.frame = requestAnimationFrame(this.tick)
  }

  private renderStatic(): void {
    if (this.gl !== null) {
      this.opacity = this.targetOpacity
      this.renderWebGL(0)
    } else {
      this.renderCanvas2D()
    }
  }

  /** Bind the point program, publish its uniforms and draw the cloud once. */
  private drawPoints(time: number): void {
    const gl = this.gl
    const program = this.program
    if (gl === null || program === null) return
    const dpr = this.canvas.width / Math.max(1, this.canvas.getBoundingClientRect().width)
    const width = this.canvas.width / dpr
    const height = this.canvas.height / dpr
    gl.useProgram(program)
    this.bindPointAttributes()
    const uniform = (name: string): WebGLUniformLocation | null => gl.getUniformLocation(program, name)
    gl.uniform2f(uniform('uViewport'), width, height)
    gl.uniform2f(uniform('uPointer'), this.pointer.x, this.pointer.y)
    gl.uniform2f(uniform('uFlowPointer'), this.flowPointer.x, this.flowPointer.y)
    gl.uniform1f(uniform('uTime'), this.reduced ? 0 : time)
    gl.uniform1f(uniform('uDpr'), dpr)
    gl.uniform1f(uniform('uScale'), this.config.scale)
    const motion = this.reduced
      ? 0
      : this.showcase
        ? 1
        : this.activity === 'active'
          ? 0.72
          : this.activity === 'session'
            ? 0.92
            : 1
    gl.uniform1f(uniform('uMotion'), motion)
    gl.uniform1f(uniform('uOpacity'), this.opacity)
    gl.uniform1f(uniform('uBrightness'), this.config.brightness)
    gl.uniform1f(uniform('uInteraction'), this.config.interactionStrength)
    gl.uniform1f(uniform('uFlowStrength'), this.flowStrength)
    gl.uniform1f(uniform('uColorScheme'), this.colorScheme === 'light' ? 1 : 0)
    const zoneRects = uniform('uZoneRects[0]') ?? uniform('uZoneRects')
    if (zoneRects !== null) gl.uniform4fv(zoneRects, this.zoneData)
    gl.uniform1f(uniform('uZoneCount'), this.zones.length)
    gl.uniform1f(uniform('uZoneSoft'), 1)
    gl.uniform1f(uniform('uZoneScale'), ZONE_SCALE)
    gl.uniform1f(uniform('uZoneAlpha'), ZONE_ALPHA)
    gl.drawArrays(gl.POINTS, 0, this.pointCount)
  }

  /**
   * Draw one fullscreen triangle with the quad program.
   * @param source - texture to sample
   * @param setUniforms - extra uniforms for this pass
   */
  private drawQuad(
    program: WebGLProgram,
    source: WebGLTexture,
    setUniforms: (uniform: (name: string) => WebGLUniformLocation | null) => void,
    blend: () => void,
  ): void {
    const gl = this.gl
    if (gl === null) return
    gl.useProgram(program)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, source)
    const uniform = (name: string): WebGLUniformLocation | null => gl.getUniformLocation(program, name)
    gl.uniform1i(uniform('uSource'), 0)
    setUniforms(uniform)
    const corner = gl.getAttribLocation(program, 'aCorner')
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer)
    gl.enableVertexAttribArray(corner)
    gl.vertexAttribPointer(corner, 2, gl.FLOAT, false, 0, 0)
    blend()
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  /** Half-resolution bright pass, separable blur, then composite over the sharp pass. */
  private renderGlow(time: number): void {
    const gl = this.gl
    const blur = this.blurProgram
    const composite = this.compositeProgram
    const [first, second] = this.glowTargets
    if (gl === null || blur === null || composite === null || first === undefined || second === undefined) return
    const glowWidth = Math.max(1, Math.round(this.canvas.width * GLOW_SCALE))
    const glowHeight = Math.max(1, Math.round(this.canvas.height * GLOW_SCALE))

    gl.disable(gl.BLEND)
    gl.bindFramebuffer(gl.FRAMEBUFFER, first.framebuffer)
    gl.viewport(0, 0, glowWidth, glowHeight)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.enable(gl.BLEND)
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    this.drawPoints(time)

    gl.disable(gl.BLEND)
    gl.viewport(0, 0, glowWidth, glowHeight)
    // horizontal, then vertical: first -> second -> first
    gl.bindFramebuffer(gl.FRAMEBUFFER, second.framebuffer)
    gl.clear(gl.COLOR_BUFFER_BIT)
    this.drawQuad(blur, first.texture, (uniform) => {
      gl.uniform2f(uniform('uStep'), 1 / glowWidth, 0)
    }, () => {})

    gl.bindFramebuffer(gl.FRAMEBUFFER, first.framebuffer)
    gl.clear(gl.COLOR_BUFFER_BIT)
    this.drawQuad(blur, second.texture, (uniform) => {
      gl.uniform2f(uniform('uStep'), 0, 1 / glowHeight)
    }, () => {})

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    const light = this.colorScheme === 'light'
    this.drawQuad(composite, first.texture, (uniform) => {
      gl.uniform1f(uniform('uStrength'), GLOW_STRENGTH[this.config.preset][this.colorScheme])
      gl.uniform1f(uniform('uMode'), light ? 1 : 0)
      gl.uniform3f(uniform('uInk'), 0.019608, 0.043137, 0.078431)
    }, () => {
      gl.enable(gl.BLEND)
      if (light) {
        // Soft shadow of the dark ink, ordinary alpha blending.
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
      } else {
        // Screen: the halo only adds light, and alpha follows its coverage.
        gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_COLOR, gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
      }
    })
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
  }

  private renderWebGL(time: number): void {
    const gl = this.gl
    const program = this.program
    if (gl === null || program === null) return
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    this.drawPoints(time)
    if (this.glowEnabled && this.glowTargets.length === 2) this.renderGlow(time)
  }

  private renderCanvas2D(): void {
    const context = this.context2d
    if (context === null) return
    const rect = this.canvas.getBoundingClientRect()
    const dpr = this.canvas.width / Math.max(1, rect.width)
    context.setTransform(dpr, 0, 0, dpr, 0, 0)
    context.clearRect(0, 0, rect.width, rect.height)
    const points = sampleWhale(QUALITY_POINTS.medium)
    const compact = clamp((rect.width - 520) / 440, 0, 1)
    const size = Math.min(rect.height * (0.46 + compact * 0.18), rect.width * (0.68 - compact * 0.2)) * this.config.scale
    const centerX = rect.width * (0.56 + compact * 0.175)
    const centerY = rect.height * 0.49
    const particle = this.colorScheme === 'light' ? '52, 91, 196' : '232, 244, 255'
    context.fillStyle = `rgba(${particle}, ${0.82 * this.targetOpacity * this.config.brightness})`
    for (const point of points) {
      const radius = 0.7 + point.size * 0.8
      context.beginPath()
      context.arc(centerX + point.x * size, centerY + point.y * size, radius, 0, Math.PI * 2)
      context.fill()
    }
  }

  private readonly onPointerMove = (event: PointerEvent): void => {
    if (this.reduced) return
    this.pointerTarget.x = event.clientX
    this.pointerTarget.y = event.clientY
    if (this.isNearWhale(event.clientX, event.clientY)) {
      this.flowPointerTarget.x = event.clientX
      this.flowPointerTarget.y = event.clientY
      this.flowTarget = 1
    } else {
      this.flowTarget = 0
    }
  }

  private isNearWhale(x: number, y: number): boolean {
    const rect = this.canvas.getBoundingClientRect()
    const compact = clamp((rect.width - 520) / 440, 0, 1)
    const size = Math.min(rect.height * (0.46 + compact * 0.18), rect.width * (0.68 - compact * 0.2)) * this.config.scale
    const centerX = rect.width * (0.56 + compact * 0.175)
    const centerY = rect.height * 0.49
    const nx = (x - centerX) / Math.max(1, size * 0.66)
    const ny = (y - centerY) / Math.max(1, size * 0.58)
    return nx * nx + ny * ny <= 1
  }

  private readonly onPointerLeave = (): void => {
    this.flowTarget = 0
  }

  private readonly onVisibilityChange = (): void => {
    if (document.hidden) {
      cancelAnimationFrame(this.frame)
    } else if (!this.reduced && this.gl !== null) {
      this.start()
    }
  }

  private readonly onReducedMotion = (event: MediaQueryListEvent): void => {
    this.reduced = event.matches
    if (this.reduced) {
      cancelAnimationFrame(this.frame)
      this.renderStatic()
    } else if (!document.hidden && this.gl !== null) {
      this.start()
    }
  }
}
