// src/config.ts
var DEFAULT_WALLPAPER_CONFIG = Object.freeze({
  enabled: true,
  quality: "auto",
  brightness: 0.9,
  scale: 1,
  interactionStrength: 1,
  activeDimming: 0.22
});

// src/whale-path.ts
var WHALE_PATH = "M48.8354 10.0479C48.3232 9.79199 48.1025 10.2798 47.8032 10.5278C47.7007 10.6079 47.6143 10.7119 47.5273 10.8076C46.7793 11.624 45.9048 12.1597 44.7622 12.0957C43.0923 12 41.666 12.5356 40.4058 13.8398C40.1377 12.2319 39.2476 11.272 37.8926 10.6558C37.1836 10.3359 36.4668 10.0156 35.9702 9.31982C35.6235 8.82373 35.5293 8.27197 35.356 7.72754C35.2456 7.3999 35.1353 7.06396 34.7651 7.00781C34.3633 6.94385 34.2056 7.2876 34.0479 7.57568C33.418 8.75195 33.1733 10.0479 33.1973 11.3599C33.2524 14.312 34.4736 16.6641 36.8999 18.3359C37.1758 18.5278 37.2466 18.7197 37.1597 19C36.9946 19.5757 36.7974 20.1357 36.624 20.7119C36.5137 21.0801 36.3486 21.1597 35.9624 21C34.6309 20.4321 33.481 19.5918 32.4644 18.5757C30.7393 16.8721 29.1792 14.9917 27.2334 13.52C26.7764 13.1758 26.3193 12.856 25.8467 12.5518C23.8618 10.584 26.1069 8.96777 26.627 8.77588C27.1704 8.57568 26.8159 7.8877 25.0591 7.896C23.3022 7.90381 21.6953 8.50391 19.647 9.30371C19.3477 9.42383 19.0322 9.51172 18.7095 9.58398C16.8501 9.22363 14.9199 9.14355 12.9033 9.37598C9.10596 9.80762 6.07275 11.6396 3.84326 14.7681C1.16455 18.5278 0.53418 22.7998 1.30664 27.2559C2.11768 31.9521 4.46582 35.8398 8.07373 38.8799C11.8159 42.0322 16.1255 43.5762 21.041 43.2803C24.0269 43.104 27.3516 42.6963 31.1016 39.4561C32.0469 39.936 33.0396 40.1279 34.686 40.272C35.9546 40.3921 37.1758 40.208 38.1211 40.0078C39.6021 39.688 39.4995 38.2881 38.9639 38.0322C34.623 35.9678 35.5762 36.8081 34.71 36.1279C36.9155 33.4639 40.2402 30.6958 41.54 21.728C41.6426 21.0161 41.5557 20.5679 41.54 19.9917C41.5322 19.6396 41.6108 19.5039 42.0049 19.4639C43.0923 19.3359 44.1479 19.0317 45.1167 18.4878C47.9292 16.9199 49.064 14.3438 49.3315 11.2559C49.3711 10.7837 49.3237 10.2959 48.8354 10.0479ZM24.3262 37.8398C20.1196 34.4639 18.0791 33.3521 17.2358 33.3999C16.4482 33.4482 16.5898 34.3682 16.7632 34.9678C16.9443 35.5601 17.1812 35.9683 17.5117 36.4878C17.7402 36.832 17.8979 37.3442 17.2832 37.728C15.9282 38.584 13.5728 37.4399 13.4624 37.3838C10.7207 35.7358 8.42822 33.5601 6.81348 30.584C5.25342 27.7197 4.34766 24.6479 4.19775 21.3677C4.1582 20.5757 4.38672 20.2959 5.15869 20.1519C6.17529 19.96 7.22314 19.9199 8.23926 20.0718C12.5327 20.7119 16.1885 22.6719 19.2529 25.7759C21.002 27.5439 22.3252 29.6558 23.6885 31.7202C25.1377 33.9121 26.6978 36 28.6831 37.7119C29.3843 38.312 29.9434 38.7681 30.479 39.104C28.8643 39.2881 26.1699 39.3281 24.3262 37.8398ZM26.3433 24.6001C26.3433 24.248 26.6191 23.9678 26.9658 23.9678C27.0444 23.9678 27.1152 23.9839 27.1782 24.0078C27.2651 24.04 27.3438 24.0879 27.4067 24.1602C27.5171 24.272 27.5801 24.4321 27.5801 24.6001C27.5801 24.9521 27.3042 25.2319 26.9575 25.2319C26.6108 25.2319 26.3433 24.9521 26.3433 24.6001ZM32.6064 27.8799C32.2046 28.0479 31.8027 28.1919 31.4165 28.208C30.8179 28.2397 30.1641 27.9922 29.8096 27.688C29.2583 27.2158 28.8643 26.9521 28.6987 26.1279C28.6279 25.7759 28.6675 25.2319 28.7305 24.9199C28.8721 24.248 28.7144 23.8159 28.2495 23.4238C27.8716 23.104 27.3911 23.0161 26.8633 23.0161C26.666 23.0161 26.4849 22.9277 26.3511 22.856C26.1304 22.7441 25.9492 22.4639 26.1226 22.1201C26.1777 22.0078 26.4458 21.7358 26.5088 21.688C27.2256 21.272 28.0527 21.4077 28.8169 21.7197C29.5259 22.0161 30.0615 22.5601 30.834 23.3281C31.6216 24.2559 31.7632 24.5117 32.2124 25.208C32.5669 25.752 32.8901 26.312 33.1104 26.9521C33.2446 27.3521 33.0713 27.6802 32.6064 27.8799Z";
var PATH_VIEW_SIZE = 50;

// src/renderer.ts
var QUALITY_POINTS = {
  low: 900,
  medium: 1300,
  high: 1750
};
var vertexShader = `
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
`;
var fragmentShader = `
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
`;
var clamp = (value, min, max) => Math.max(min, Math.min(max, value));
var hash = (value) => {
  const x = Math.sin(value * 91.913 + 17.17) * 43758.5453;
  return x - Math.floor(x);
};
function countForSpacing(path, context, spacing) {
  let count = 0;
  for (let y = spacing * 0.5; y < PATH_VIEW_SIZE; y += spacing) {
    for (let x = spacing * 0.5; x < PATH_VIEW_SIZE; x += spacing) {
      if (context.isPointInPath(path, x, y)) count += 1;
    }
  }
  return count;
}
function sampleWhale(target) {
  const probe = document.createElement("canvas");
  const context = probe.getContext("2d");
  if (context === null || typeof Path2D === "undefined") return [];
  const path = new Path2D(WHALE_PATH);
  let low = 0.35;
  let high = 2.5;
  for (let index = 0; index < 18; index += 1) {
    const spacing2 = (low + high) * 0.5;
    if (countForSpacing(path, context, spacing2) > target) low = spacing2;
    else high = spacing2;
  }
  const spacing = high;
  const points = [];
  let id = 0;
  for (let y = spacing * 0.5; y < PATH_VIEW_SIZE; y += spacing) {
    for (let x = spacing * 0.5; x < PATH_VIEW_SIZE; x += spacing) {
      if (!context.isPointInPath(path, x, y)) continue;
      const seed = hash(id + 1);
      points.push({
        x: x / PATH_VIEW_SIZE - 0.5,
        y: y / PATH_VIEW_SIZE - 0.5,
        depth: hash(id * 1.73 + 9.1) - 0.5,
        seed,
        size: 0.35 + hash(id * 2.41 + 3.7) * 0.9,
        kind: 0
      });
      id += 1;
    }
  }
  return points;
}
function sampleDust(count) {
  return Array.from({ length: count }, (_, index) => ({
    x: hash(index * 4.17 + 1.2),
    y: hash(index * 7.31 + 8.4),
    depth: hash(index * 2.7 + 5.1),
    seed: hash(index * 8.61 + 2.9),
    size: 0.45 + hash(index * 5.27 + 1.7) * 0.75,
    kind: 1
  }));
}
function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (shader === null) throw new Error("Unable to create WebGL shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? "unknown shader error";
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}
function createProgram(gl) {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexShader);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
  const program = gl.createProgram();
  if (program === null) throw new Error("Unable to create WebGL program");
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) ?? "unknown program error";
    gl.deleteProgram(program);
    throw new Error(message);
  }
  return program;
}
var activityOpacity = (state, activeDimming) => {
  if (state === "active") return Math.max(activeDimming, 0.34);
  if (state === "session") return 0.72;
  return 1;
};
var WhaleRenderer = class {
  canvas;
  config;
  gl = null;
  context2d = null;
  program = null;
  buffer = null;
  pointCount = 0;
  quality;
  activity = "idle";
  opacity = 1;
  targetOpacity = 1;
  pointer = { x: 0, y: 0 };
  pointerTarget = { x: 0, y: 0 };
  flowPointer = { x: 0, y: 0 };
  flowPointerTarget = { x: 0, y: 0 };
  flowStrength = 0;
  flowTarget = 0;
  colorScheme;
  frame = 0;
  lastFrame = 0;
  slowFrames = 0;
  reduced = false;
  destroyed = false;
  resizeObserver;
  reducedMotion;
  constructor(canvas, config = DEFAULT_WALLPAPER_CONFIG, colorScheme = "dark") {
    this.canvas = canvas;
    this.config = config;
    this.colorScheme = colorScheme;
    this.quality = config.quality === "auto" ? "high" : config.quality;
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.reduced = this.reducedMotion.matches;
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    try {
      this.gl = canvas.getContext("webgl2", {
        alpha: true,
        antialias: false,
        depth: false,
        powerPreference: "high-performance",
        premultipliedAlpha: true
      });
      if (this.gl === null) throw new Error("WebGL2 unavailable");
      this.initializeWebGL();
      canvas.dataset.renderer = "webgl2";
    } catch (error) {
      this.gl = null;
      this.program = null;
      this.buffer = null;
      this.context2d = canvas.getContext("2d");
      canvas.dataset.renderer = "canvas2d";
      console.info("[harness-whale] WebGL2 unavailable; using a static Canvas2D whale.", error);
    }
    this.resize();
    window.addEventListener("pointermove", this.onPointerMove, { passive: true });
    window.addEventListener("blur", this.onPointerLeave);
    document.documentElement.addEventListener("pointerleave", this.onPointerLeave);
    document.addEventListener("visibilitychange", this.onVisibilityChange);
    this.reducedMotion.addEventListener("change", this.onReducedMotion);
    if (!document.hidden && !this.reduced && this.gl !== null) this.start();
  }
  setActivity(state) {
    this.activity = state;
    this.canvas.dataset.activity = state;
    this.targetOpacity = activityOpacity(state, this.config.activeDimming);
    if (this.reduced || this.gl === null) this.renderStatic();
  }
  setColorScheme(scheme) {
    if (this.colorScheme === scheme) return;
    this.colorScheme = scheme;
    this.canvas.dataset.colorScheme = scheme;
    if (this.reduced || this.gl === null) this.renderStatic();
  }
  destroy() {
    this.destroyed = true;
    cancelAnimationFrame(this.frame);
    this.resizeObserver.disconnect();
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("blur", this.onPointerLeave);
    document.documentElement.removeEventListener("pointerleave", this.onPointerLeave);
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
    this.reducedMotion.removeEventListener("change", this.onReducedMotion);
    if (this.gl !== null) {
      if (this.buffer !== null) this.gl.deleteBuffer(this.buffer);
      if (this.program !== null) this.gl.deleteProgram(this.program);
    }
  }
  initializeWebGL() {
    const gl = this.gl;
    if (gl === null) return;
    this.program = createProgram(gl);
    this.buffer = gl.createBuffer();
    if (this.buffer === null) throw new Error("Unable to allocate WebGL point buffer");
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(
      gl.SRC_ALPHA,
      gl.ONE_MINUS_SRC_ALPHA,
      gl.ONE,
      gl.ONE_MINUS_SRC_ALPHA
    );
    this.uploadPoints();
  }
  uploadPoints() {
    const gl = this.gl;
    const program = this.program;
    const buffer = this.buffer;
    if (gl === null || program === null || buffer === null) return;
    const whale = sampleWhale(QUALITY_POINTS[this.quality]);
    const dust = sampleDust(this.quality === "low" ? 34 : this.quality === "medium" ? 52 : 68);
    const points = [...whale, ...dust];
    const data = new Float32Array(points.length * 6);
    points.forEach((point, index) => {
      const offset = index * 6;
      data[offset] = point.x;
      data[offset + 1] = point.y;
      data[offset + 2] = point.depth;
      data[offset + 3] = point.seed;
      data[offset + 4] = point.size;
      data[offset + 5] = point.kind;
    });
    this.pointCount = points.length;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "aPosition");
    const meta = gl.getAttribLocation(program, "aMeta");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(meta);
    gl.vertexAttribPointer(meta, 4, gl.FLOAT, false, 24, 8);
  }
  resize() {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const maxDpr = this.quality === "low" ? 1 : this.quality === "medium" ? 1.25 : 1.5;
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    this.pointer.x = this.pointerTarget.x = rect.width * 0.72;
    this.pointer.y = this.pointerTarget.y = rect.height * 0.5;
    this.flowPointer.x = this.flowPointerTarget.x = this.pointer.x;
    this.flowPointer.y = this.flowPointerTarget.y = this.pointer.y;
    this.canvas.dataset.colorScheme = this.colorScheme;
    this.renderStatic();
  }
  start() {
    cancelAnimationFrame(this.frame);
    this.lastFrame = performance.now();
    this.frame = requestAnimationFrame(this.tick);
  }
  tick = (now) => {
    if (this.destroyed || document.hidden || this.reduced || this.gl === null) return;
    const delta = Math.min(50, now - this.lastFrame);
    this.lastFrame = now;
    const ease = 1 - Math.exp(-delta / 600);
    this.opacity += (this.targetOpacity - this.opacity) * ease;
    this.pointer.x += (this.pointerTarget.x - this.pointer.x) * Math.min(1, delta / 190);
    this.pointer.y += (this.pointerTarget.y - this.pointer.y) * Math.min(1, delta / 190);
    this.flowPointer.x += (this.flowPointerTarget.x - this.flowPointer.x) * Math.min(1, delta / 120);
    this.flowPointer.y += (this.flowPointerTarget.y - this.flowPointer.y) * Math.min(1, delta / 120);
    const flowEase = 1 - Math.exp(-delta / (this.flowTarget > this.flowStrength ? 140 : 650));
    this.flowStrength += (this.flowTarget - this.flowStrength) * flowEase;
    this.renderWebGL(now * 1e-3);
    if (this.config.quality === "auto") {
      this.slowFrames = delta > 21 ? this.slowFrames + 1 : Math.max(0, this.slowFrames - 2);
      if (this.slowFrames > 150 && this.quality !== "low") {
        this.quality = this.quality === "high" ? "medium" : "low";
        this.slowFrames = 0;
        this.uploadPoints();
        this.resize();
      }
    }
    this.frame = requestAnimationFrame(this.tick);
  };
  renderStatic() {
    if (this.gl !== null) {
      this.opacity = this.targetOpacity;
      this.renderWebGL(0);
    } else {
      this.renderCanvas2D();
    }
  }
  renderWebGL(time) {
    const gl = this.gl;
    const program = this.program;
    if (gl === null || program === null) return;
    const dpr = this.canvas.width / Math.max(1, this.canvas.getBoundingClientRect().width);
    const width = this.canvas.width / dpr;
    const height = this.canvas.height / dpr;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    const uniform = (name) => gl.getUniformLocation(program, name);
    gl.uniform2f(uniform("uViewport"), width, height);
    gl.uniform2f(uniform("uPointer"), this.pointer.x, this.pointer.y);
    gl.uniform2f(uniform("uFlowPointer"), this.flowPointer.x, this.flowPointer.y);
    gl.uniform1f(uniform("uTime"), this.reduced ? 0 : time);
    gl.uniform1f(uniform("uDpr"), dpr);
    gl.uniform1f(uniform("uScale"), this.config.scale);
    gl.uniform1f(uniform("uMotion"), this.reduced ? 0 : this.activity === "active" ? 0.72 : this.activity === "session" ? 0.92 : 1);
    gl.uniform1f(uniform("uOpacity"), this.opacity);
    gl.uniform1f(uniform("uBrightness"), this.config.brightness);
    gl.uniform1f(uniform("uInteraction"), this.config.interactionStrength);
    gl.uniform1f(uniform("uFlowStrength"), this.flowStrength);
    gl.uniform1f(uniform("uColorScheme"), this.colorScheme === "light" ? 1 : 0);
    gl.drawArrays(gl.POINTS, 0, this.pointCount);
  }
  renderCanvas2D() {
    const context = this.context2d;
    if (context === null) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = this.canvas.width / Math.max(1, rect.width);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, rect.width, rect.height);
    const points = sampleWhale(QUALITY_POINTS.medium);
    const compact = clamp((rect.width - 520) / 440, 0, 1);
    const size = Math.min(rect.height * (0.46 + compact * 0.18), rect.width * (0.68 - compact * 0.2)) * this.config.scale;
    const centerX = rect.width * (0.56 + compact * 0.175);
    const centerY = rect.height * 0.49;
    const particle = this.colorScheme === "light" ? "52, 91, 196" : "232, 244, 255";
    context.fillStyle = `rgba(${particle}, ${0.76 * this.targetOpacity * this.config.brightness})`;
    for (const point of points) {
      const radius = 0.7 + point.size * 0.8;
      context.beginPath();
      context.arc(centerX + point.x * size, centerY + point.y * size, radius, 0, Math.PI * 2);
      context.fill();
    }
  }
  onPointerMove = (event) => {
    if (this.reduced) return;
    this.pointerTarget.x = event.clientX;
    this.pointerTarget.y = event.clientY;
    if (this.isNearWhale(event.clientX, event.clientY)) {
      this.flowPointerTarget.x = event.clientX;
      this.flowPointerTarget.y = event.clientY;
      this.flowTarget = 1;
    } else {
      this.flowTarget = 0;
    }
  };
  isNearWhale(x, y) {
    const rect = this.canvas.getBoundingClientRect();
    const compact = clamp((rect.width - 520) / 440, 0, 1);
    const size = Math.min(rect.height * (0.46 + compact * 0.18), rect.width * (0.68 - compact * 0.2)) * this.config.scale;
    const centerX = rect.width * (0.56 + compact * 0.175);
    const centerY = rect.height * 0.49;
    const nx = (x - centerX) / Math.max(1, size * 0.66);
    const ny = (y - centerY) / Math.max(1, size * 0.58);
    return nx * nx + ny * ny <= 1;
  }
  onPointerLeave = () => {
    this.flowTarget = 0;
  };
  onVisibilityChange = () => {
    if (document.hidden) {
      cancelAnimationFrame(this.frame);
    } else if (!this.reduced && this.gl !== null) {
      this.start();
    }
  };
  onReducedMotion = (event) => {
    this.reduced = event.matches;
    if (this.reduced) {
      cancelAnimationFrame(this.frame);
      this.renderStatic();
    } else if (!document.hidden && this.gl !== null) {
      this.start();
    }
  };
};

// src/theme.ts
var THEME_STYLE = `
  body[data-dsh-harness-whale="true"] {
    --hww-page: #f4f8ff;
    --hww-text: #10233d;
    --hww-text-soft: #526a86;
    --hww-text-bright: #0a1c34;
    --hww-link: #3159d9;
    --hww-border: rgba(76, 105, 142, 0.18);
    --hww-surface: rgba(247, 251, 255, 0.90);
    --hww-surface-strong: rgba(239, 246, 255, 0.97);
    --hww-surface-hover: rgba(77, 107, 254, 0.09);
    --hww-surface-selected: rgba(77, 107, 254, 0.14);
    --hww-code: rgba(220, 232, 248, 0.82);
    --hww-code-panel: rgba(239, 246, 255, 0.97);
    --hww-shadow: rgba(47, 72, 110, 0.15);
    background: var(--hww-page) !important;
  }

  body[data-dsh-harness-whale="true"][data-ds-dark-theme] {
    --hww-page: #040912;
    --hww-text: #dbe8f7;
    --hww-text-soft: #b8c8da;
    --hww-text-bright: #f3f7ff;
    --hww-link: #8fb3ff;
    --hww-border: rgba(153, 190, 232, 0.15);
    --hww-surface: rgba(8, 24, 47, 0.88);
    --hww-surface-strong: rgba(6, 17, 34, 0.98);
    --hww-surface-hover: rgba(132, 177, 229, 0.12);
    --hww-surface-selected: rgba(77, 107, 254, 0.20);
    --hww-code: rgba(31, 62, 97, 0.72);
    --hww-code-panel: rgba(6, 20, 40, 0.96);
    --hww-shadow: rgba(0, 3, 10, 0.40);
  }

  body[data-dsh-harness-whale="true"] #root {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    background: transparent !important;
  }

  body[data-dsh-harness-whale="true"] #root > [data-slot="root"] > [data-details-collapsed],
  body[data-dsh-harness-whale="true"] [data-slot="conversation"] > [data-phase] {
    background: transparent !important;
  }

  body[data-dsh-harness-whale="true"] [data-composer-card="true"] {
    background: var(--hww-surface) !important;
    border-color: var(--hww-border) !important;
    box-shadow: 0 18px 54px var(--hww-shadow) !important;
  }

  body[data-dsh-harness-whale="true"] [data-composer-card="true"] button[aria-haspopup="listbox"][class$="_add"],
  body[data-dsh-harness-whale="true"] button[aria-label="Commands"],
  body[data-dsh-harness-whale="true"] button[aria-label="\u547D\u4EE4"] {
    background: var(--hww-surface) !important;
    border: 1px solid var(--hww-border) !important;
    box-shadow: none !important;
    color: var(--hww-text) !important;
  }

  body[data-dsh-harness-whale="true"] [data-composer-card="true"] button[aria-haspopup="listbox"][class$="_add"]:hover,
  body[data-dsh-harness-whale="true"] button[aria-label="Commands"]:hover,
  body[data-dsh-harness-whale="true"] button[aria-label="\u547D\u4EE4"]:hover {
    background: var(--hww-surface-hover) !important;
    border-color: var(--hww-border) !important;
    color: var(--hww-text-bright) !important;
  }

  body[data-dsh-harness-whale="true"] [data-composer-card="true"] button[aria-haspopup="listbox"][class$="_add"] :is(svg, path),
  body[data-dsh-harness-whale="true"] button[aria-label="Commands"] :is(svg, path),
  body[data-dsh-harness-whale="true"] button[aria-label="\u547D\u4EE4"] :is(svg, path) {
    color: currentColor !important;
    fill: currentColor !important;
    stroke: currentColor !important;
  }

  body[data-dsh-harness-whale="true"] [data-slot="sidebar.brand.name"] svg > rect {
    fill: color-mix(in srgb, var(--hww-link) 24%, transparent) !important;
  }

  body[data-dsh-harness-whale="true"] [data-slot="sidebar.brand.name"] svg > rect ~ path,
  body[data-dsh-harness-whale="true"] [data-slot="sidebar.brand.name"] svg > rect ~ g path {
    fill: var(--hww-text-bright) !important;
  }

  body[data-dsh-harness-whale="true"] [role="dialog"] {
    background: var(--hww-surface-strong) !important;
    border: 1px solid var(--hww-border) !important;
    box-shadow: 0 30px 90px var(--hww-shadow) !important;
    color: var(--hww-text) !important;
  }

  body[data-dsh-harness-whale="true"] [role="dialog"] button {
    color: var(--hww-text) !important;
  }

  body[data-dsh-harness-whale="true"] [role="dialog"] button[aria-haspopup="menu"],
  body[data-dsh-harness-whale="true"] [role="dialog"] button[aria-pressed] {
    background: var(--hww-surface) !important;
    border-color: var(--hww-border) !important;
  }

  body[data-dsh-harness-whale="true"] [role="dialog"] button[aria-current="true"],
  body[data-dsh-harness-whale="true"] [role="dialog"] button[aria-pressed="true"],
  body[data-dsh-harness-whale="true"] [role="dialog"] button[aria-haspopup="menu"][aria-expanded="true"] {
    background: var(--hww-surface-selected) !important;
    box-shadow: inset 0 0 0 1px var(--hww-border) !important;
    color: var(--hww-text-bright) !important;
  }

  body[data-dsh-harness-whale="true"] [role="dialog"] button:hover:not(:disabled) {
    background: var(--hww-surface-hover) !important;
    color: var(--hww-text-bright) !important;
  }

  body[data-dsh-harness-whale="true"] [role="dialog"] button:disabled {
    color: var(--hww-text-soft) !important;
    opacity: 0.72;
  }

  body[data-dsh-harness-whale="true"] div[class*="_markdown_"] { color: var(--hww-text) !important; }
  body[data-dsh-harness-whale="true"] div[class*="_markdown_"] :is(h1, h2, h3, h4, strong) { color: var(--hww-text-bright) !important; }

  body[data-dsh-harness-whale="true"] div[class*="_markdown_"] a {
    color: var(--hww-link) !important;
    text-decoration-color: color-mix(in srgb, var(--hww-link) 42%, transparent) !important;
  }

  body[data-dsh-harness-whale="true"] div[class*="_markdown_"] code {
    background: var(--hww-code) !important;
    color: var(--hww-text) !important;
    border: 1px solid var(--hww-border) !important;
    box-shadow: none !important;
  }

  body[data-dsh-harness-whale="true"] div[class*="_markdown_"] blockquote {
    background: var(--hww-surface) !important;
    border-color: color-mix(in srgb, var(--hww-link) 38%, transparent) !important;
    color: var(--hww-text-soft) !important;
  }

  body[data-dsh-harness-whale="true"] div[class*="_markdown_"] .md-code-block {
    overflow: hidden;
    background: var(--hww-code-panel) !important;
    border: 1px solid var(--hww-border) !important;
    box-shadow: 0 12px 34px var(--hww-shadow) !important;
  }

  body[data-dsh-harness-whale="true"] div[class*="_markdown_"] .md-code-block > div:first-child,
  body[data-dsh-harness-whale="true"] div[class*="_markdown_"] .md-code-block > div:first-child > div,
  body[data-dsh-harness-whale="true"] div[class*="_markdown_"] .md-code-block pre {
    background: var(--hww-code-panel) !important;
    border-color: var(--hww-border) !important;
  }

  body[data-dsh-harness-whale="true"] div[class*="_markdown_"] .md-code-block pre,
  body[data-dsh-harness-whale="true"] div[class*="_markdown_"] .md-code-block pre code { color: var(--hww-text) !important; }

  body[data-dsh-harness-whale="true"] div[class*="_markdown_"] .md-code-block pre code {
    background: transparent !important;
    border: 0 !important;
  }

  body[data-dsh-harness-whale="true"] div[class*="_markdown_"] .md-code-block button {
    background: var(--hww-surface-hover) !important;
    border: 1px solid var(--hww-border) !important;
    color: var(--hww-text-soft) !important;
  }

  body[data-dsh-harness-whale="true"] div[class*="_markdown_"] .md-code-block button:hover {
    background: var(--hww-surface-selected) !important;
    color: var(--hww-text-bright) !important;
  }

  .dsh-harness-whale-wallpaper {
    position: fixed;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    pointer-events: none;
    background:
      radial-gradient(ellipse 68% 78% at 79% 48%, rgba(115, 158, 222, 0.22) 0%, rgba(205, 224, 249, 0.18) 43%, transparent 73%),
      radial-gradient(ellipse 46% 36% at 64% 94%, rgba(155, 188, 229, 0.18), transparent 76%),
      linear-gradient(118deg, #f8fbff 0%, #f4f8ff 45%, #eaf2fd 72%, #e5eefc 100%);
    isolation: isolate;
    transition: background 320ms ease;
  }

  body[data-ds-dark-theme] .dsh-harness-whale-wallpaper {
    background:
      radial-gradient(ellipse 68% 78% at 79% 48%, rgba(29, 78, 143, 0.26) 0%, rgba(8, 35, 72, 0.12) 43%, transparent 73%),
      radial-gradient(ellipse 46% 36% at 64% 94%, rgba(25, 61, 111, 0.16), transparent 76%),
      linear-gradient(118deg, #03070e 0%, #061326 45%, #071c38 72%, #06162b 100%);
  }

  .dsh-harness-whale-wallpaper::before,
  .dsh-harness-whale-wallpaper::after {
    content: "";
    position: absolute;
    inset: -16%;
    opacity: 0.32;
    filter: blur(48px);
    will-change: transform;
  }

  body[data-ds-dark-theme] .dsh-harness-whale-wallpaper::before,
  body[data-ds-dark-theme] .dsh-harness-whale-wallpaper::after { opacity: 0.42; }

  .dsh-harness-whale-wallpaper::before {
    background: radial-gradient(ellipse 32% 18% at 74% 58%, rgba(76, 122, 187, 0.15), transparent 72%);
    animation: dsh-whale-mist-a 52s ease-in-out infinite alternate;
  }

  .dsh-harness-whale-wallpaper::after {
    background: radial-gradient(ellipse 28% 22% at 84% 28%, rgba(37, 90, 159, 0.12), transparent 75%);
    animation: dsh-whale-mist-b 71s ease-in-out infinite alternate;
  }

  .dsh-harness-whale-wallpaper canvas {
    position: absolute;
    inset: 0;
    z-index: 1;
    display: block;
    width: 100%;
    height: 100%;
  }

  @keyframes dsh-whale-mist-a {
    from { transform: translate3d(-1.5%, 1%, 0) scale(0.98); }
    to { transform: translate3d(2.5%, -1.5%, 0) scale(1.04); }
  }

  @keyframes dsh-whale-mist-b {
    from { transform: translate3d(2%, -1%, 0) scale(1.03); }
    to { transform: translate3d(-2%, 2%, 0) scale(0.97); }
  }

  @media (prefers-reduced-motion: reduce) {
    .dsh-harness-whale-wallpaper::before,
    .dsh-harness-whale-wallpaper::after { animation: none !important; }
  }
`;
function mountWallpaper(config, colorScheme = "dark") {
  const previousAttribute = document.body.getAttribute("data-dsh-harness-whale");
  const style = document.createElement("style");
  style.dataset.plugin = "dsh-plugin-harness-whale";
  style.textContent = THEME_STYLE;
  document.head.append(style);
  const layer = document.createElement("div");
  layer.className = "dsh-harness-whale-wallpaper";
  layer.setAttribute("aria-hidden", "true");
  const canvas = document.createElement("canvas");
  layer.append(canvas);
  document.body.prepend(layer);
  document.body.setAttribute("data-dsh-harness-whale", "true");
  const renderer = new WhaleRenderer(canvas, config, colorScheme);
  return {
    renderer,
    setActivity: (state) => renderer.setActivity(state),
    setColorScheme: (scheme) => renderer.setColorScheme(scheme),
    dispose: () => {
      renderer.destroy();
      layer.remove();
      style.remove();
      if (previousAttribute === null) document.body.removeAttribute("data-dsh-harness-whale");
      else document.body.setAttribute("data-dsh-harness-whale", previousAttribute);
    }
  };
}

// src/preview.ts
var wallpaper = mountWallpaper(DEFAULT_WALLPAPER_CONFIG, "light");
wallpaper.setActivity("idle");
window.addEventListener("pagehide", () => wallpaper.dispose(), { once: true });
//# sourceMappingURL=preview.js.map
