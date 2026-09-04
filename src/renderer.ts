import { DEFAULT_WALLPAPER_CONFIG, type WallpaperConfig, type WallpaperQuality } from './config.ts'
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
  varying float vAlpha;
  varying float vKind;
  varying float vCool;

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
      gl_Position = vec4(px.x / uViewport.x * 2.0 - 1.0, 1.0 - px.y / uViewport.y * 2.0, 0.8, 1.0);
      gl_PointSize = max(0.8, pointSize * uDpr);
      vAlpha = (0.055 + seed * 0.08) * uOpacity;
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
    float flowRadius = clamp(sceneSize * 0.35, 145.0, 175.0);
    vec2 radial = flowDistance > 0.01
      ? flowDelta / flowDistance
      : vec2(cos(seed * 31.0), sin(seed * 31.0));
    vec2 tangent = vec2(-radial.y, radial.x);
    float flowFalloff = pow(1.0 - smoothstep(0.0, flowRadius, flowDistance), 0.72);
    float liquidPhase = sin(uTime * 2.15 + seed * 18.0 + flowDistance * 0.045);
    float radialPhase = sin(uTime * 1.68 + seed * 27.0 - flowDistance * 0.058);
    float orbitDirection = step(0.5, fract(seed * 7.31)) * 2.0 - 1.0;
    vec2 eddyDirection = vec2(
      sin(uTime * 1.37 + seed * 41.0),
      cos(uTime * 1.19 + seed * 37.0)
    );
    float flow = flowFalloff * uFlowStrength * uInteraction * uMotion;
    vec2 disruption = tangent * (13.0 + liquidPhase * 7.0) * orbitDirection * flow
      + radial * radialPhase * 7.0 * flow
      + eddyDirection * 8.0 * flow;
    px += disruption;

    float pointerDistance = distance(px, uPointer);
    float localGlow = 1.0 - smoothstep(38.0, 250.0, pointerDistance);
    float waveRadius = mod(uTime * 54.0, 260.0);
    float localRing = exp(-pow((pointerDistance - waveRadius) / 34.0, 2.0))
      * (1.0 - smoothstep(220.0, 290.0, pointerDistance));
    float localWave = (localGlow * 0.50 + localRing * 0.88)
      * uInteraction * uMotion;

    gl_Position = vec4(px.x / uViewport.x * 2.0 - 1.0, 1.0 - px.y / uViewport.y * 2.0, z3 * 0.05, 1.0);
    gl_PointSize = (1.16 + pointSize * 1.45 + localWave * 1.10)
      * uDpr * mix(1.0, 1.38, uColorScheme);
    vAlpha = (0.46 + seed * 0.42 + localWave * 0.43) * uOpacity * uBrightness;
    vCool = clamp(0.24 + depth * 1.55 + localWave * 0.32, 0.0, 1.0);
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
    float lightWhaleEdge = 1.0 - smoothstep(0.40, 0.5, radius);
    if (edge <= 0.0) discard;
    vec3 darkWhale = mix(vec3(0.96, 0.985, 1.0), vec3(0.70, 0.84, 1.0), vCool * 0.42);
    vec3 lightWhale = vec3(0.019608, 0.043137, 0.078431);
    vec3 whale = mix(darkWhale, lightWhale, uColorScheme);
    vec3 darkDust = vec3(0.58, 0.75, 0.95);
    vec3 lightDust = vec3(0.28, 0.44, 0.68);
    vec3 dust = mix(darkDust, lightDust, uColorScheme);
    float darkAlpha = edge * vAlpha;
    float lightAlpha = mix(lightWhaleEdge, edge * vAlpha * 1.55, vKind);
    gl_FragColor = vec4(
      mix(whale, dust, vKind),
      mix(darkAlpha, lightAlpha, uColorScheme)
    );
  }
`

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

function createProgram(gl: WebGL2RenderingContext): WebGLProgram {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexShader)
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShader)
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
  if (state === 'active') return Math.max(activeDimming, 0.34)
  if (state === 'session') return 0.72
  return 1
}

export class WhaleRenderer {
  private readonly canvas: HTMLCanvasElement
  private readonly config: WallpaperConfig
  private gl: WebGL2RenderingContext | null = null
  private context2d: CanvasRenderingContext2D | null = null
  private program: WebGLProgram | null = null
  private buffer: WebGLBuffer | null = null
  private pointCount = 0
  private quality: Exclude<WallpaperQuality, 'auto'>
  private activity: ActivityState = 'idle'
  private opacity = 1
  private targetOpacity = 1
  private pointer = { x: 0, y: 0 }
  private pointerTarget = { x: 0, y: 0 }
  private flowPointer = { x: 0, y: 0 }
  private flowPointerTarget = { x: 0, y: 0 }
  private flowStrength = 0
  private flowTarget = 0
  private colorScheme: WallpaperColorScheme
  private frame = 0
  private lastFrame = 0
  private slowFrames = 0
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
    this.targetOpacity = activityOpacity(state, this.config.activeDimming)
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
      if (this.program !== null) this.gl.deleteProgram(this.program)
    }
  }

  private initializeWebGL(): void {
    const gl = this.gl
    if (gl === null) return
    this.program = createProgram(gl)
    this.buffer = gl.createBuffer()
    if (this.buffer === null) throw new Error('Unable to allocate WebGL point buffer')
    gl.enable(gl.BLEND)
    gl.blendFuncSeparate(
      gl.SRC_ALPHA,
      gl.ONE_MINUS_SRC_ALPHA,
      gl.ONE,
      gl.ONE_MINUS_SRC_ALPHA,
    )
    this.uploadPoints()
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
    const position = gl.getAttribLocation(program, 'aPosition')
    const meta = gl.getAttribLocation(program, 'aMeta')
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
    const flowEase = 1 - Math.exp(-delta / (this.flowTarget > this.flowStrength ? 140 : 650))
    this.flowStrength += (this.flowTarget - this.flowStrength) * flowEase
    this.renderWebGL(now * 0.001)

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

  private renderWebGL(time: number): void {
    const gl = this.gl
    const program = this.program
    if (gl === null || program === null) return
    const dpr = this.canvas.width / Math.max(1, this.canvas.getBoundingClientRect().width)
    const width = this.canvas.width / dpr
    const height = this.canvas.height / dpr
    gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.useProgram(program)
    const uniform = (name: string): WebGLUniformLocation | null => gl.getUniformLocation(program, name)
    gl.uniform2f(uniform('uViewport'), width, height)
    gl.uniform2f(uniform('uPointer'), this.pointer.x, this.pointer.y)
    gl.uniform2f(uniform('uFlowPointer'), this.flowPointer.x, this.flowPointer.y)
    gl.uniform1f(uniform('uTime'), this.reduced ? 0 : time)
    gl.uniform1f(uniform('uDpr'), dpr)
    gl.uniform1f(uniform('uScale'), this.config.scale)
    gl.uniform1f(uniform('uMotion'), this.reduced ? 0 : this.activity === 'active' ? 0.72 : this.activity === 'session' ? 0.92 : 1)
    gl.uniform1f(uniform('uOpacity'), this.opacity)
    gl.uniform1f(uniform('uBrightness'), this.config.brightness)
    gl.uniform1f(uniform('uInteraction'), this.config.interactionStrength)
    gl.uniform1f(uniform('uFlowStrength'), this.flowStrength)
    gl.uniform1f(uniform('uColorScheme'), this.colorScheme === 'light' ? 1 : 0)
    gl.drawArrays(gl.POINTS, 0, this.pointCount)
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
    context.fillStyle = `rgba(${particle}, ${0.76 * this.targetOpacity * this.config.brightness})`
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
