window.__ModuleLoader__.load({ id: "dsh-plugin-harness-whale", factory: function (require) { var module = { exports: {} }; var exports = module.exports;
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client.tsx
var client_exports = {};
__export(client_exports, {
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(client_exports);
var import_react = require("react");

// src/activity.ts
var asRecord = (value) => typeof value === "object" && value !== null ? value : void 0;
var callSnapshot = (value) => {
  const source = asRecord(value);
  const getter = source?.getSnapshot;
  if (typeof getter !== "function") return source;
  try {
    return asRecord(getter.call(value));
  } catch {
    return source;
  }
};
function hasRunningSignal(value, depth = 0) {
  if (depth > 2) return false;
  const record = callSnapshot(value);
  if (record === void 0) return false;
  if (record.running === true || record.busy === true || record.streaming === true) return true;
  if (Array.isArray(record.runningCalls) && record.runningCalls.length > 0) return true;
  const status = String(record.status ?? record.phase ?? record.state ?? "").toLowerCase();
  if (["running", "streaming", "thinking", "executing", "pending"].includes(status)) return true;
  return ["conversation", "chat", "agent", "session"].some((key) => hasRunningSignal(record[key], depth + 1));
}
function isBlankSession(value) {
  const record = callSnapshot(value);
  if (record?.blank === true) return true;
  const summary = callSnapshot(record?.summary);
  if (summary?.blank === true) return true;
  const chat = asRecord(record?.chat);
  const legacy = asRecord(chat?.legacy);
  const nodeLists = [record?.nodes, chat?.nodes, legacy?.nodes];
  return nodeLists.some((nodes) => Array.isArray(nodes) && nodes.length === 0);
}
function isTextInput(target) {
  if (!(target instanceof HTMLElement)) return false;
  if (target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement) return true;
  return target.isContentEditable || target.closest('[contenteditable="true"]') !== null;
}
function watchActivity(ctx, update) {
  const context = asRecord(ctx);
  const getService = context?.get;
  let activeUntil = 0;
  let current;
  const markActive = (event) => {
    if (isTextInput(event.target)) activeUntil = performance.now() + 1700;
  };
  const inspect = () => {
    let next = "idle";
    try {
      const sessions = typeof getService === "function" ? getService.call(ctx, "sessions") : void 0;
      const sessionsRecord = asRecord(sessions);
      const listSnapshot = callSnapshot(sessionsRecord?.list);
      const currentId = listSnapshot?.current ?? listSnapshot?.currentId ?? listSnapshot?.selected;
      if (typeof currentId === "string" && currentId.length > 0) {
        const getter = sessionsRecord?.get;
        const session = typeof getter === "function" ? getter.call(sessions, currentId) : void 0;
        const items = Array.isArray(listSnapshot?.items) ? listSnapshot.items : [];
        const summary = items.map(asRecord).find(
          (item) => item?.sessionId === currentId || item?.id === currentId
        );
        const blank = summary?.blank === true || isBlankSession(session);
        next = blank ? "idle" : "session";
        if (!blank && (summary?.running === true || hasRunningSignal(session))) next = "active";
      }
    } catch {
    }
    if (performance.now() < activeUntil) next = "active";
    if (next !== current) {
      current = next;
      update(next);
    }
  };
  document.addEventListener("input", markActive, true);
  document.addEventListener("keydown", markActive, true);
  document.addEventListener("focusin", markActive, true);
  const timer = window.setInterval(inspect, 320);
  inspect();
  return () => {
    window.clearInterval(timer);
    document.removeEventListener("input", markActive, true);
    document.removeEventListener("keydown", markActive, true);
    document.removeEventListener("focusin", markActive, true);
  };
}

// src/config.ts
var DEFAULT_WALLPAPER_CONFIG = Object.freeze({
  enabled: true,
  quality: "auto",
  preset: "calm",
  brightness: 0.9,
  scale: 1,
  interactionStrength: 1,
  activeDimming: 0.22
});
var clamp = (value, min, max) => Math.max(min, Math.min(max, value));
function resolveConfig(value) {
  const raw = typeof value === "object" && value !== null ? value : {};
  const quality = ["auto", "low", "medium", "high"].includes(String(raw.quality)) ? raw.quality : DEFAULT_WALLPAPER_CONFIG.quality;
  const preset = ["calm", "vivid"].includes(String(raw.preset)) ? raw.preset : DEFAULT_WALLPAPER_CONFIG.preset;
  return {
    enabled: raw.enabled !== false,
    quality,
    preset,
    brightness: clamp(Number(raw.brightness) || DEFAULT_WALLPAPER_CONFIG.brightness, 0.35, 1.4),
    scale: clamp(Number(raw.scale) || DEFAULT_WALLPAPER_CONFIG.scale, 0.72, 1.25),
    interactionStrength: clamp(
      Number.isFinite(Number(raw.interactionStrength)) ? Number(raw.interactionStrength) : DEFAULT_WALLPAPER_CONFIG.interactionStrength,
      0,
      1.5
    ),
    activeDimming: clamp(Number(raw.activeDimming) || DEFAULT_WALLPAPER_CONFIG.activeDimming, 0.12, 0.6)
  };
}

// src/whale-path.ts
var WHALE_PATH = "M48.8354 10.0479C48.3232 9.79199 48.1025 10.2798 47.8032 10.5278C47.7007 10.6079 47.6143 10.7119 47.5273 10.8076C46.7793 11.624 45.9048 12.1597 44.7622 12.0957C43.0923 12 41.666 12.5356 40.4058 13.8398C40.1377 12.2319 39.2476 11.272 37.8926 10.6558C37.1836 10.3359 36.4668 10.0156 35.9702 9.31982C35.6235 8.82373 35.5293 8.27197 35.356 7.72754C35.2456 7.3999 35.1353 7.06396 34.7651 7.00781C34.3633 6.94385 34.2056 7.2876 34.0479 7.57568C33.418 8.75195 33.1733 10.0479 33.1973 11.3599C33.2524 14.312 34.4736 16.6641 36.8999 18.3359C37.1758 18.5278 37.2466 18.7197 37.1597 19C36.9946 19.5757 36.7974 20.1357 36.624 20.7119C36.5137 21.0801 36.3486 21.1597 35.9624 21C34.6309 20.4321 33.481 19.5918 32.4644 18.5757C30.7393 16.8721 29.1792 14.9917 27.2334 13.52C26.7764 13.1758 26.3193 12.856 25.8467 12.5518C23.8618 10.584 26.1069 8.96777 26.627 8.77588C27.1704 8.57568 26.8159 7.8877 25.0591 7.896C23.3022 7.90381 21.6953 8.50391 19.647 9.30371C19.3477 9.42383 19.0322 9.51172 18.7095 9.58398C16.8501 9.22363 14.9199 9.14355 12.9033 9.37598C9.10596 9.80762 6.07275 11.6396 3.84326 14.7681C1.16455 18.5278 0.53418 22.7998 1.30664 27.2559C2.11768 31.9521 4.46582 35.8398 8.07373 38.8799C11.8159 42.0322 16.1255 43.5762 21.041 43.2803C24.0269 43.104 27.3516 42.6963 31.1016 39.4561C32.0469 39.936 33.0396 40.1279 34.686 40.272C35.9546 40.3921 37.1758 40.208 38.1211 40.0078C39.6021 39.688 39.4995 38.2881 38.9639 38.0322C34.623 35.9678 35.5762 36.8081 34.71 36.1279C36.9155 33.4639 40.2402 30.6958 41.54 21.728C41.6426 21.0161 41.5557 20.5679 41.54 19.9917C41.5322 19.6396 41.6108 19.5039 42.0049 19.4639C43.0923 19.3359 44.1479 19.0317 45.1167 18.4878C47.9292 16.9199 49.064 14.3438 49.3315 11.2559C49.3711 10.7837 49.3237 10.2959 48.8354 10.0479ZM24.3262 37.8398C20.1196 34.4639 18.0791 33.3521 17.2358 33.3999C16.4482 33.4482 16.5898 34.3682 16.7632 34.9678C16.9443 35.5601 17.1812 35.9683 17.5117 36.4878C17.7402 36.832 17.8979 37.3442 17.2832 37.728C15.9282 38.584 13.5728 37.4399 13.4624 37.3838C10.7207 35.7358 8.42822 33.5601 6.81348 30.584C5.25342 27.7197 4.34766 24.6479 4.19775 21.3677C4.1582 20.5757 4.38672 20.2959 5.15869 20.1519C6.17529 19.96 7.22314 19.9199 8.23926 20.0718C12.5327 20.7119 16.1885 22.6719 19.2529 25.7759C21.002 27.5439 22.3252 29.6558 23.6885 31.7202C25.1377 33.9121 26.6978 36 28.6831 37.7119C29.3843 38.312 29.9434 38.7681 30.479 39.104C28.8643 39.2881 26.1699 39.3281 24.3262 37.8398ZM26.3433 24.6001C26.3433 24.248 26.6191 23.9678 26.9658 23.9678C27.0444 23.9678 27.1152 23.9839 27.1782 24.0078C27.2651 24.04 27.3438 24.0879 27.4067 24.1602C27.5171 24.272 27.5801 24.4321 27.5801 24.6001C27.5801 24.9521 27.3042 25.2319 26.9575 25.2319C26.6108 25.2319 26.3433 24.9521 26.3433 24.6001ZM32.6064 27.8799C32.2046 28.0479 31.8027 28.1919 31.4165 28.208C30.8179 28.2397 30.1641 27.9922 29.8096 27.688C29.2583 27.2158 28.8643 26.9521 28.6987 26.1279C28.6279 25.7759 28.6675 25.2319 28.7305 24.9199C28.8721 24.248 28.7144 23.8159 28.2495 23.4238C27.8716 23.104 27.3911 23.0161 26.8633 23.0161C26.666 23.0161 26.4849 22.9277 26.3511 22.856C26.1304 22.7441 25.9492 22.4639 26.1226 22.1201C26.1777 22.0078 26.4458 21.7358 26.5088 21.688C27.2256 21.272 28.0527 21.4077 28.8169 21.7197C29.5259 22.0161 30.0615 22.5601 30.834 23.3281C31.6216 24.2559 31.7632 24.5117 32.2124 25.208C32.5669 25.752 32.8901 26.312 33.1104 26.9521C33.2446 27.3521 33.0713 27.6802 32.6064 27.8799Z";
var PATH_VIEW_SIZE = 50;

// src/renderer.ts
var QUALITY_POINTS = {
  low: 900,
  medium: 1300,
  high: 1750
};
var ZONE_MAX = 16;
var ZONE_SCALE = 0.86;
var ZONE_ALPHA = 0.92;
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
`;
var quadVertexShader = `
  precision highp float;
  attribute vec2 aCorner;
  varying vec2 vUv;

  void main() {
    vUv = aCorner * 0.5 + 0.5;
    gl_Position = vec4(aCorner, 0.0, 1.0);
  }
`;
var blurFragmentShader = `
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
`;
var compositeFragmentShader = `
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
`;
var GLOW_STRENGTH = {
  calm: { light: 0.45, dark: 0.6 },
  vivid: { light: 0.68, dark: 0.9 }
};
var GLOW_SCALE = 0.5;
var GLOW_BUDGET_MS = 24;
var GLOW_BUDGET_FRAMES = 90;
var clamp2 = (value, min, max) => Math.max(min, Math.min(max, value));
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
  const probe2 = document.createElement("canvas");
  const context = probe2.getContext("2d");
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
function createProgram(gl, vertexSource = vertexShader, fragmentSource = fragmentShader) {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
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
  if (state === "active") return Math.max(activeDimming, 0.5);
  if (state === "session") return 0.78;
  return 1;
};
var WhaleRenderer = class {
  canvas;
  config;
  gl = null;
  context2d = null;
  program = null;
  blurProgram = null;
  compositeProgram = null;
  buffer = null;
  quadBuffer = null;
  pointAttributes = { position: -1, meta: -1 };
  glowTargets = [];
  glowSize = { width: 0, height: 0 };
  pointCount = 0;
  quality;
  activity = "idle";
  /** Welcome screen: no text to read, so the whale keeps full strength there. */
  showcase = true;
  opacity = 1;
  targetOpacity = 1;
  pointer = { x: 0, y: 0 };
  pointerTarget = { x: 0, y: 0 };
  flowPointer = { x: 0, y: 0 };
  flowPointerTarget = { x: 0, y: 0 };
  flowStrength = 0;
  flowTarget = 0;
  colorScheme;
  zones = [];
  zoneData = new Float32Array(ZONE_MAX * 4);
  frame = 0;
  lastFrame = 0;
  slowFrames = 0;
  slowGlowFrames = 0;
  /** Cleared once the glow pass cannot hold the frame budget on this machine. */
  glowEnabled = false;
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
    this.targetOpacity = this.showcase ? 1 : activityOpacity(state, this.config.activeDimming);
    if (this.reduced || this.gl === null) this.renderStatic();
  }
  /**
   * The welcome screen has no text to read, so activity dimming does not apply
   * there: it is the wallpaper's showcase and stays at full strength.
   */
  setShowcase(value) {
    this.canvas.dataset.showcase = value ? "on" : "off";
    if (this.showcase === value) return;
    this.showcase = value;
    this.targetOpacity = value ? 1 : activityOpacity(this.activity, this.config.activeDimming);
    if (this.reduced || this.gl === null) this.renderStatic();
  }
  /**
   * Text blocks the whale should stay out of the way of. Pass `null` when the
   * zones cannot be measured; the column then keeps its plain reading scrim.
   */
  setReadingZones(rects) {
    const next = (rects ?? []).slice(0, ZONE_MAX);
    const unchanged = next.length === this.zones.length && next.every((rect, index) => {
      const current = this.zones[index];
      return current.x === rect.x && current.y === rect.y && current.w === rect.w && current.h === rect.h;
    });
    if (unchanged) return;
    this.zones = next;
    this.zoneData.fill(0);
    this.zones.forEach((rect, index) => {
      this.zoneData.set([rect.x, rect.y, rect.w, rect.h], index * 4);
    });
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
      if (this.quadBuffer !== null) this.gl.deleteBuffer(this.quadBuffer);
      if (this.program !== null) this.gl.deleteProgram(this.program);
      if (this.blurProgram !== null) this.gl.deleteProgram(this.blurProgram);
      if (this.compositeProgram !== null) this.gl.deleteProgram(this.compositeProgram);
      for (const target of this.glowTargets) {
        this.gl.deleteFramebuffer(target.framebuffer);
        this.gl.deleteTexture(target.texture);
      }
      this.glowTargets = [];
    }
  }
  initializeWebGL() {
    const gl = this.gl;
    if (gl === null) return;
    this.program = createProgram(gl);
    this.buffer = gl.createBuffer();
    if (this.buffer === null) throw new Error("Unable to allocate WebGL point buffer");
    this.quadBuffer = gl.createBuffer();
    if (this.quadBuffer === null) throw new Error("Unable to allocate WebGL quad buffer");
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    if (this.quality !== "low") {
      try {
        this.blurProgram = createProgram(gl, quadVertexShader, blurFragmentShader);
        this.compositeProgram = createProgram(gl, quadVertexShader, compositeFragmentShader);
        this.glowEnabled = true;
      } catch (error) {
        this.blurProgram = null;
        this.compositeProgram = null;
        this.glowEnabled = false;
        this.canvas.dataset.glow = "unavailable";
        console.warn("[harness-whale] glow pass unavailable on this driver; drawing the sharp pass only.", error);
      }
    }
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(
      gl.SRC_ALPHA,
      gl.ONE_MINUS_SRC_ALPHA,
      gl.ONE,
      gl.ONE_MINUS_SRC_ALPHA
    );
    this.uploadPoints();
  }
  /** Half-resolution targets for the glow pass; rebuilt whenever the canvas resizes. */
  resizeGlowTargets() {
    const gl = this.gl;
    if (gl === null || this.blurProgram === null) return;
    const width = Math.max(1, Math.round(this.canvas.width * GLOW_SCALE));
    const height = Math.max(1, Math.round(this.canvas.height * GLOW_SCALE));
    if (this.glowTargets.length === 2 && this.glowSize.width === width && this.glowSize.height === height) {
      return;
    }
    this.glowSize = { width, height };
    for (const target of this.glowTargets) {
      gl.deleteFramebuffer(target.framebuffer);
      gl.deleteTexture(target.texture);
    }
    this.glowTargets = [];
    for (let index = 0; index < 2; index += 1) {
      const target = gl.createTexture();
      const framebuffer = gl.createFramebuffer();
      if (target === null || framebuffer === null) return;
      gl.bindTexture(gl.TEXTURE_2D, target);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target, 0);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
        gl.deleteFramebuffer(framebuffer);
        gl.deleteTexture(target);
        for (const allocated of this.glowTargets) {
          gl.deleteFramebuffer(allocated.framebuffer);
          gl.deleteTexture(allocated.texture);
        }
        this.glowTargets = [];
        this.glowEnabled = false;
        this.canvas.dataset.glow = "unavailable";
        console.warn("[harness-whale] glow target framebuffer is incomplete; drawing the sharp pass only.");
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return;
      }
      this.glowTargets.push({ framebuffer, texture: target });
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
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
    this.pointAttributes = {
      position: gl.getAttribLocation(program, "aPosition"),
      meta: gl.getAttribLocation(program, "aMeta")
    };
    this.bindPointAttributes();
  }
  /**
   * Vertex attribute bindings are global context state, and the glow pass binds
   * the quad program's own attribute in between point draws. Re-establish the
   * point pointers before every draw instead of once at upload time; otherwise a
   * driver that assigns `aCorner` to the same index as `aPosition` leaves the
   * next frame reading the quad buffer and the whale disappears.
   */
  bindPointAttributes() {
    const gl = this.gl;
    const buffer = this.buffer;
    if (gl === null || buffer === null) return;
    const { position, meta } = this.pointAttributes;
    if (position < 0 || meta < 0) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
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
    this.resizeGlowTargets();
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
    const flowEase = 1 - Math.exp(-delta / (this.flowTarget > this.flowStrength ? 140 : 800));
    this.flowStrength += (this.flowTarget - this.flowStrength) * flowEase;
    this.renderWebGL(now * 1e-3);
    if (this.glowEnabled) {
      this.slowGlowFrames = delta > GLOW_BUDGET_MS ? this.slowGlowFrames + 1 : Math.max(0, this.slowGlowFrames - 3);
      if (this.slowGlowFrames > GLOW_BUDGET_FRAMES) {
        this.glowEnabled = false;
        this.slowGlowFrames = 0;
        this.canvas.dataset.glow = "off";
        console.info(
          `[harness-whale] glow pass disabled: ${Math.round(delta)} ms frames exceeded the ${GLOW_BUDGET_MS} ms budget for ${GLOW_BUDGET_FRAMES} frames.`
        );
      }
    }
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
  /** Bind the point program, publish its uniforms and draw the cloud once. */
  drawPoints(time) {
    const gl = this.gl;
    const program = this.program;
    if (gl === null || program === null) return;
    const dpr = this.canvas.width / Math.max(1, this.canvas.getBoundingClientRect().width);
    const width = this.canvas.width / dpr;
    const height = this.canvas.height / dpr;
    gl.useProgram(program);
    this.bindPointAttributes();
    const uniform = (name2) => gl.getUniformLocation(program, name2);
    gl.uniform2f(uniform("uViewport"), width, height);
    gl.uniform2f(uniform("uPointer"), this.pointer.x, this.pointer.y);
    gl.uniform2f(uniform("uFlowPointer"), this.flowPointer.x, this.flowPointer.y);
    gl.uniform1f(uniform("uTime"), this.reduced ? 0 : time);
    gl.uniform1f(uniform("uDpr"), dpr);
    gl.uniform1f(uniform("uScale"), this.config.scale);
    const motion = this.reduced ? 0 : this.showcase ? 1 : this.activity === "active" ? 0.72 : this.activity === "session" ? 0.92 : 1;
    gl.uniform1f(uniform("uMotion"), motion);
    gl.uniform1f(uniform("uOpacity"), this.opacity);
    gl.uniform1f(uniform("uBrightness"), this.config.brightness);
    gl.uniform1f(uniform("uInteraction"), this.config.interactionStrength);
    gl.uniform1f(uniform("uFlowStrength"), this.flowStrength);
    gl.uniform1f(uniform("uColorScheme"), this.colorScheme === "light" ? 1 : 0);
    const zoneRects = uniform("uZoneRects[0]") ?? uniform("uZoneRects");
    if (zoneRects !== null) gl.uniform4fv(zoneRects, this.zoneData);
    gl.uniform1f(uniform("uZoneCount"), this.zones.length);
    gl.uniform1f(uniform("uZoneSoft"), 1);
    gl.uniform1f(uniform("uZoneScale"), ZONE_SCALE);
    gl.uniform1f(uniform("uZoneAlpha"), ZONE_ALPHA);
    gl.drawArrays(gl.POINTS, 0, this.pointCount);
  }
  /**
   * Draw one fullscreen triangle with the quad program.
   * @param source - texture to sample
   * @param setUniforms - extra uniforms for this pass
   */
  drawQuad(program, source, setUniforms, blend) {
    const gl = this.gl;
    if (gl === null) return;
    gl.useProgram(program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, source);
    const uniform = (name2) => gl.getUniformLocation(program, name2);
    gl.uniform1i(uniform("uSource"), 0);
    setUniforms(uniform);
    const corner = gl.getAttribLocation(program, "aCorner");
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.enableVertexAttribArray(corner);
    gl.vertexAttribPointer(corner, 2, gl.FLOAT, false, 0, 0);
    blend();
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  /** Half-resolution bright pass, separable blur, then composite over the sharp pass. */
  renderGlow(time) {
    const gl = this.gl;
    const blur = this.blurProgram;
    const composite = this.compositeProgram;
    const [first, second] = this.glowTargets;
    if (gl === null || blur === null || composite === null || first === void 0 || second === void 0) return;
    const glowWidth = Math.max(1, Math.round(this.canvas.width * GLOW_SCALE));
    const glowHeight = Math.max(1, Math.round(this.canvas.height * GLOW_SCALE));
    gl.disable(gl.BLEND);
    gl.bindFramebuffer(gl.FRAMEBUFFER, first.framebuffer);
    gl.viewport(0, 0, glowWidth, glowHeight);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    this.drawPoints(time);
    gl.disable(gl.BLEND);
    gl.viewport(0, 0, glowWidth, glowHeight);
    gl.bindFramebuffer(gl.FRAMEBUFFER, second.framebuffer);
    gl.clear(gl.COLOR_BUFFER_BIT);
    this.drawQuad(blur, first.texture, (uniform) => {
      gl.uniform2f(uniform("uStep"), 1 / glowWidth, 0);
    }, () => {
    });
    gl.bindFramebuffer(gl.FRAMEBUFFER, first.framebuffer);
    gl.clear(gl.COLOR_BUFFER_BIT);
    this.drawQuad(blur, second.texture, (uniform) => {
      gl.uniform2f(uniform("uStep"), 0, 1 / glowHeight);
    }, () => {
    });
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    const light = this.colorScheme === "light";
    this.drawQuad(composite, first.texture, (uniform) => {
      gl.uniform1f(uniform("uStrength"), GLOW_STRENGTH[this.config.preset][this.colorScheme]);
      gl.uniform1f(uniform("uMode"), light ? 1 : 0);
      gl.uniform3f(uniform("uInk"), 0.019608, 0.043137, 0.078431);
    }, () => {
      gl.enable(gl.BLEND);
      if (light) {
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      } else {
        gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_COLOR, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      }
    });
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  }
  renderWebGL(time) {
    const gl = this.gl;
    const program = this.program;
    if (gl === null || program === null) return;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    this.drawPoints(time);
    if (this.glowEnabled && this.glowTargets.length === 2) this.renderGlow(time);
  }
  renderCanvas2D() {
    const context = this.context2d;
    if (context === null) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = this.canvas.width / Math.max(1, rect.width);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, rect.width, rect.height);
    const points = sampleWhale(QUALITY_POINTS.medium);
    const compact = clamp2((rect.width - 520) / 440, 0, 1);
    const size = Math.min(rect.height * (0.46 + compact * 0.18), rect.width * (0.68 - compact * 0.2)) * this.config.scale;
    const centerX = rect.width * (0.56 + compact * 0.175);
    const centerY = rect.height * 0.49;
    const particle = this.colorScheme === "light" ? "52, 91, 196" : "232, 244, 255";
    context.fillStyle = `rgba(${particle}, ${0.82 * this.targetOpacity * this.config.brightness})`;
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
    const compact = clamp2((rect.width - 520) / 440, 0, 1);
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

// src/reading-zone.ts
var SCROLL_SELECTOR = "[data-conversation-scroll]";
var COLUMN_SELECTORS = [
  '[data-slot="main.conversation"] > [data-phase]',
  '[data-slot="conversation"] > [data-phase]'
];
var BLOCK_SELECTORS = [
  'div[class*="_markdown_"]',
  ":is(p, li, h1, h2, h3, h4, h5, h6, pre, blockquote, table)"
];
var MAX_ZONES = 16;
var MERGE_GAP = 8;
var MIN_VISIBLE_HEIGHT = 6;
var MIN_VISIBLE_WIDTH = 24;
var MUTATION_SETTLE_MS = 400;
function columnElement() {
  for (const selector of COLUMN_SELECTORS) {
    const element = document.querySelector(selector);
    if (element instanceof HTMLElement) return element;
  }
  return null;
}
function mergeVertically(rects) {
  const sorted = [...rects].sort((a, b) => a.y - b.y);
  const merged = [];
  for (const rect of sorted) {
    const last = merged[merged.length - 1];
    const overlaps = last !== void 0 && rect.y <= last.y + last.h + MERGE_GAP && rect.x < last.x + last.w && last.x < rect.x + rect.w;
    if (!overlaps) {
      merged.push({ ...rect });
      continue;
    }
    const right = Math.max(last.x + last.w, rect.x + rect.w);
    const bottom = Math.max(last.y + last.h, rect.y + rect.h);
    last.x = Math.min(last.x, rect.x);
    last.y = Math.min(last.y, rect.y);
    last.w = right - last.x;
    last.h = bottom - last.y;
  }
  return merged;
}
function fuseToLimit(bands, limit) {
  const result = [...bands].sort((a, b) => a.y - b.y);
  while (result.length > limit) {
    let best = 0;
    let bestGap = Number.POSITIVE_INFINITY;
    for (let index = 0; index < result.length - 1; index += 1) {
      const gap = result[index + 1].y - (result[index].y + result[index].h);
      if (gap < bestGap) {
        bestGap = gap;
        best = index;
      }
    }
    const [first, second] = [result[best], result[best + 1]];
    const x = Math.min(first.x, second.x);
    const right = Math.max(first.x + first.w, second.x + second.w);
    result.splice(best, 2, {
      x,
      y: first.y,
      w: right - x,
      h: Math.max(first.y + first.h, second.y + second.h) - first.y
    });
  }
  return result;
}
function isShowcasePhase() {
  const column = columnElement();
  return column === null || column.getAttribute("data-phase") === "hero";
}
function measureReadingZones() {
  const column = columnElement();
  if (column === null) return null;
  if (column.getAttribute("data-phase") === "hero") return null;
  const scroller = document.querySelector(SCROLL_SELECTOR);
  const clip = (scroller ?? column).getBoundingClientRect();
  if (clip.width < MIN_VISIBLE_WIDTH || clip.height < MIN_VISIBLE_HEIGHT) return null;
  const selector = BLOCK_SELECTORS.map((block) => `${SCROLL_SELECTOR} ${block}`).join(", ");
  const rects = [];
  for (const element of document.querySelectorAll(selector)) {
    const box = element.getBoundingClientRect();
    const top = Math.max(box.top, clip.top);
    const bottom = Math.min(box.bottom, clip.bottom);
    const left = Math.max(box.left, clip.left);
    const right = Math.min(box.right, clip.right);
    if (bottom - top < MIN_VISIBLE_HEIGHT || right - left < MIN_VISIBLE_WIDTH) continue;
    rects.push({ x: left, y: top, w: right - left, h: bottom - top });
  }
  if (rects.length === 0) return [];
  const merged = fuseToLimit(mergeVertically(rects), MAX_ZONES);
  return merged.map((rect) => ({
    x: Math.round(rect.x),
    y: Math.round(rect.y),
    w: Math.round(rect.w),
    h: Math.round(rect.h)
  }));
}
function watchReadingZones(onChange) {
  let frame = 0;
  let timer = 0;
  let disposed = false;
  let signature = "";
  const push = () => {
    if (disposed) return;
    const showcase = isShowcasePhase();
    const rects = measureReadingZones();
    const next = `${showcase ? "showcase" : "reading"}|${JSON.stringify(rects)}`;
    if (next === signature) return;
    signature = next;
    onChange(rects, showcase);
  };
  const schedule = (delay) => {
    if (disposed) return;
    if (frame !== 0) cancelAnimationFrame(frame);
    if (timer !== 0) window.clearTimeout(timer);
    if (delay === 0) {
      frame = requestAnimationFrame(() => {
        frame = 0;
        push();
      });
      return;
    }
    timer = window.setTimeout(() => {
      timer = 0;
      push();
    }, delay);
  };
  const scroller = document.querySelector(SCROLL_SELECTOR);
  const onScroll = () => schedule(0);
  const onResize = () => schedule(200);
  scroller?.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);
  const observer = new MutationObserver(() => schedule(MUTATION_SETTLE_MS));
  observer.observe(scroller ?? columnElement() ?? document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["data-phase"]
  });
  schedule(0);
  return {
    dispose: () => {
      disposed = true;
      if (frame !== 0) cancelAnimationFrame(frame);
      if (timer !== 0) window.clearTimeout(timer);
      observer.disconnect();
      scroller?.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    }
  };
}

// src/self-check.ts
var MIN_TRANSMISSION = 0.3;
var OVERLAY_SELECTOR = [
  '[role="dialog"]',
  '[aria-modal="true"]',
  '[role="menu"]',
  '[role="listbox"]',
  '[role="tooltip"]',
  '[class*="mask"]',
  '[class*="Mask"]',
  '[class*="popover"]',
  '[class*="Popover"]'
].join(", ");
var TRANSPARENT_MAX = 0.02;
var SCRIM_RANGE = [0.3, 0.85];
var FRAME_SELECTOR = '#root > [data-slot="root"] > *';
var COLUMN_SELECTORS2 = [
  '[data-slot="main.conversation"] > [data-phase]',
  '[data-slot="conversation"] > [data-phase]'
];
function normalizeColor(color) {
  return color.replace(/\s+/g, "").toLowerCase();
}
function alphaOf(color) {
  if (color === "" || color === "transparent") return 0;
  const match = /^rgba?\(([^)]+)\)$/.exec(color.trim());
  if (match === null) return 1;
  const parts = match[1].split(",").map((part) => Number.parseFloat(part));
  return parts.length > 3 && Number.isFinite(parts[3]) ? parts[3] : 1;
}
function probe(label, selector, expected, ok) {
  const element = document.querySelector(selector);
  if (element === null) {
    return { label, selector, found: false, background: "", alpha: 0, expected, ok: false };
  }
  const background = getComputedStyle(element).backgroundColor;
  const alpha = alphaOf(background);
  return { label, selector, found: true, background, alpha, expected, ok: ok(alpha, element) };
}
function describeElement(element) {
  const slot = element.getAttribute("data-slot");
  const id = element.id === "" ? "" : `#${element.id}`;
  const className = typeof element.className === "string" && element.className !== "" ? `.${element.className.trim().split(/\s+/)[0]}` : "";
  return `${element.tagName.toLowerCase()}${id}${slot === null ? "" : `[data-slot="${slot}"]`}${className}`;
}
function probeCoverage(layer, allowed, points) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  return points.map(([fx, fy]) => {
    const x = Math.round(width * fx);
    const y = Math.round(height * fy);
    const blockers = [];
    let transmission = 1;
    for (const element of document.elementsFromPoint(x, y)) {
      if (element === document.body || element === document.documentElement) continue;
      if (layer !== null && (layer.contains(element) || element.contains(layer))) continue;
      if (element.closest(OVERLAY_SELECTOR) !== null) continue;
      const style = getComputedStyle(element);
      const alpha = alphaOf(style.backgroundColor);
      const image = style.backgroundImage === "none" ? "" : " +background-image";
      if (alpha <= 0.01 && image === "") continue;
      if (allowed.has(normalizeColor(style.backgroundColor))) continue;
      transmission *= 1 - alpha;
      blockers.push(`${describeElement(element)} ${style.backgroundColor}${image}`);
    }
    return {
      at: [x, y],
      transmission: Math.round(transmission * 100) / 100,
      blockers,
      ok: transmission >= MIN_TRANSMISSION
    };
  });
}
function collectDiagnostics(version, colorScheme, ownSurfaces = () => []) {
  const allowed = new Set(ownSurfaces().map(normalizeColor));
  const problems = [];
  const layer = document.querySelector(".dsh-harness-whale-wallpaper");
  const canvas = layer?.querySelector("canvas") ?? null;
  const canvasRect = canvas === null ? null : { width: canvas.width, height: canvas.height };
  if (layer === null) problems.push("wallpaper layer is missing from the document");
  if (canvas === null) problems.push("wallpaper canvas is missing");
  else if (canvas.width === 0 || canvas.height === 0) problems.push("wallpaper canvas has no drawing buffer");
  const surfaces = [];
  const frame = probe("shell frame", FRAME_SELECTOR, "transparent", (alpha) => alpha <= TRANSPARENT_MAX);
  surfaces.push(frame);
  if (frame.found && !frame.ok) {
    problems.push(
      `${frame.selector} paints ${frame.background}; the wallpaper behind it is covered`
    );
  }
  if (!frame.found) {
    problems.push(`${FRAME_SELECTOR} not found; the shell frame hook may have been renamed`);
  }
  const root = probe("#root", "#root", "transparent", (alpha) => alpha <= TRANSPARENT_MAX);
  surfaces.push(root);
  if (root.found && !root.ok) problems.push(`#root paints ${root.background}`);
  const column = COLUMN_SELECTORS2.map((selector) => probe("conversation column", selector, "clear on hero, light scrim while reading", () => true)).find((entry) => entry.found);
  if (column === void 0) {
    problems.push(`${COLUMN_SELECTORS2.join(" / ")} not found; the conversation slot hook may have been renamed`);
  } else {
    const element = document.querySelector(column.selector);
    const phase = element.getAttribute("data-phase");
    const hero = phase === "hero";
    const ok = hero ? column.alpha <= TRANSPARENT_MAX : column.alpha >= SCRIM_RANGE[0] && column.alpha <= SCRIM_RANGE[1];
    surfaces.push({ ...column, ok, expected: `${column.expected} (phase=${phase ?? "unknown"})` });
    if (!ok) {
      problems.push(
        hero ? `${column.selector}[data-phase=hero] paints ${column.background}; the welcome screen should stay clear` : `${column.selector}[data-phase=${phase ?? "unknown"}] paints ${column.background}; expected a reading scrim between ${SCRIM_RANGE[0]} and ${SCRIM_RANGE[1]} alpha`
      );
    }
  }
  const coverage = probeCoverage(layer, allowed, [
    [0.16, 0.3],
    [0.5, 0.45],
    [0.84, 0.28],
    [0.78, 0.72],
    [0.35, 0.82]
  ]);
  for (const entry of coverage) {
    if (entry.ok) continue;
    problems.push(
      `only ${Math.round(entry.transmission * 100)}% of the wallpaper survives at (${entry.at[0]}, ${entry.at[1]}) \u2014 covered by ${entry.blockers.join(" | ") || "an unmeasurable layer"}`
    );
  }
  return {
    version,
    status: document.documentElement.getAttribute("data-hww-status"),
    colorScheme,
    renderer: canvas?.dataset.renderer,
    canvas: canvasRect,
    layerFound: layer !== null,
    surfaces,
    coverage,
    problems,
    ok: problems.length === 0
  };
}
var reported = /* @__PURE__ */ new Set();
function report(version, colorScheme, ownSurfaces) {
  const diagnostics = collectDiagnostics(version, colorScheme, ownSurfaces);
  const key = `${version}|${colorScheme}|${diagnostics.problems.join("|")}`;
  if (!diagnostics.ok && !reported.has(key)) {
    reported.add(key);
    console.warn(
      `[harness-whale ${version}] the Harness shell is covering the wallpaper again:
` + diagnostics.problems.map((problem) => `  - ${problem}`).join("\n") + "\n  This means a Harness DOM/CSS hook moved. Run window.__harnessWhale.check() for the\n  full report and see docs/compatibility.md for the hook list this plugin relies on."
    );
  }
  return diagnostics;
}
function watchShellIntegrity(version, colorScheme, ownSurfaces = () => []) {
  const timers = /* @__PURE__ */ new Set();
  let observer = null;
  const later = (run, delay) => {
    const timer = window.setTimeout(() => {
      timers.delete(timer);
      run();
    }, delay);
    timers.add(timer);
  };
  later(() => report(version, colorScheme(), ownSurfaces), 1500);
  const column = COLUMN_SELECTORS2.map((selector) => document.querySelector(selector)).find((element) => element !== null);
  if (column !== void 0 && column !== null) {
    observer = new MutationObserver(() => later(() => report(version, colorScheme(), ownSurfaces), 250));
    observer.observe(column, { attributes: true, attributeFilter: ["data-phase"] });
  }
  const check = () => report(version, colorScheme(), ownSurfaces);
  const api = { version, check };
  const globals = window;
  globals.__harnessWhale = api;
  return {
    check,
    dispose: () => {
      for (const timer of timers) window.clearTimeout(timer);
      timers.clear();
      observer?.disconnect();
      if (globals.__harnessWhale === api) delete globals.__harnessWhale;
    }
  };
}

// src/theme.ts
var THEME_TOKEN_OVERRIDES = {
  "--dsw-alias-bg-base": { light: "rgba(244, 248, 255, 0.72)", dark: "rgba(4, 9, 18, 0.20)" },
  "--dsw-alias-bg-layer-1": { light: "rgba(248, 251, 255, 0.78)", dark: "rgba(6, 17, 34, 0.34)" },
  "--dsw-alias-bg-layer-2": { light: "rgba(238, 245, 255, 0.90)", dark: "rgba(8, 23, 45, 0.84)" },
  "--dsw-alias-bg-layer-3": { light: "rgba(232, 241, 253, 0.96)", dark: "rgba(10, 28, 53, 0.93)" },
  "--dsw-specific-sidebar-fill": { light: "rgba(239, 246, 255, 0.96)", dark: "rgba(5, 15, 30, 0.95)" },
  "--dsw-alias-label-primary": { light: "#10233d", dark: "#eef5ff" },
  "--dsw-alias-label-secondary": { light: "#526a86", dark: "#aebdd0" },
  "--dsw-alias-label-tertiary": { light: "#7186a0", dark: "#7f91a8" },
  "--dsw-alias-label-caption": { light: "#8799ae", dark: "#62758d" },
  "--dsw-alias-border-l1": { light: "rgba(76, 105, 142, 0.10)", dark: "rgba(153, 190, 232, 0.08)" },
  "--dsw-alias-border-l2": { light: "rgba(76, 105, 142, 0.15)", dark: "rgba(153, 190, 232, 0.13)" },
  "--dsw-alias-border-l3": { light: "rgba(76, 105, 142, 0.21)", dark: "rgba(153, 190, 232, 0.18)" },
  "--dsw-alias-border-l4": { light: "rgba(66, 96, 134, 0.28)", dark: "rgba(174, 207, 243, 0.24)" },
  "--dsw-alias-interactive-hover": { light: "rgba(77, 107, 254, 0.08)", dark: "rgba(132, 177, 229, 0.10)" },
  "--dsw-alias-interactive-pressed": { light: "rgba(77, 107, 254, 0.13)", dark: "rgba(132, 177, 229, 0.16)" },
  "--dsw-alias-interactive-selected": { light: "rgba(77, 107, 254, 0.14)", dark: "rgba(77, 107, 254, 0.17)" },
  "--dsw-specific-button-secondary-fill": { light: "rgba(255, 255, 255, 0.62)", dark: "rgba(145, 180, 222, 0.11)" },
  "--dsw-specific-button-secondary-fill-hover": { light: "rgba(77, 107, 254, 0.10)", dark: "rgba(145, 180, 222, 0.17)" },
  "--dsw-specific-button-tertiary-fill-hover": { light: "rgba(77, 107, 254, 0.08)", dark: "rgba(145, 180, 222, 0.11)" },
  "--dsw-alias-button-elevated-fill": { light: "rgba(248, 251, 255, 0.96)", dark: "rgba(12, 31, 58, 0.94)" },
  "--dsw-alias-button-floating-fill": { light: "rgba(248, 251, 255, 0.96)", dark: "rgba(12, 31, 58, 0.94)" },
  "--dsw-alias-bg-mask-drop": { light: "rgba(28, 48, 75, 0.26)", dark: "rgba(3, 9, 18, 0.76)" }
};
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
    --hww-reading-scrim: rgba(244, 248, 255, 0.50);
    --hww-reading-scrim-soft: rgba(244, 248, 255, 0.40);
    --hww-hero-halo: rgba(248, 251, 255, 0.85);
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
    --hww-reading-scrim: rgba(4, 9, 18, 0.46);
    --hww-reading-scrim-soft: rgba(4, 9, 18, 0.38);
    --hww-hero-halo: rgba(3, 8, 16, 0.90);
  }

  body[data-dsh-harness-whale="true"] #root {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    background: transparent !important;
  }

  /*
   * The shell frame (ui-layout AppFrame) paints --dsw-alias-bg-base across the
   * viewport; keep it clear so the wallpaper holds full strength in the margins.
   * It was matched as [data-details-collapsed] on Harness <= 0.1.2 and lost that
   * attribute in 0.1.5, so it is matched structurally now.
   */
  body[data-dsh-harness-whale="true"] #root > [data-slot="root"] > * {
    background: transparent !important;
  }

  /*
   * Running text must not sit naked on the dot matrix, but a column-wide veil
   * dims the whole whale, margins no glyph ever touches included: over a bright
   * pool a white scrim at 0.40 puts a floor of 102 on every pixel behind it, so
   * the ink reads grey instead of near-black. The scrim therefore follows the
   * text itself \u2014 the reading-zone watcher measures the blocks that carry glyphs
   * and the band layer below paints the scrim over those bands only. The column
   * scrim survives as the fallback for when the zones cannot be measured at all;
   * readability outranks wallpaper presence there. Slot spellings: "conversation"
   * on Harness <= 0.1.2, "main.conversation" from 0.1.5.
   */
  body[data-dsh-harness-whale="true"]:not([data-hww-zones="on"]) [data-slot="conversation"] > [data-phase]:not([data-phase="hero"]),
  body[data-dsh-harness-whale="true"]:not([data-hww-zones="on"]) [data-slot="main.conversation"] > [data-phase]:not([data-phase="hero"]) {
    background: var(--hww-reading-scrim) !important;
  }

  /*
   * Measured zones: the bands carry the scrim, so the column itself must be
   * clear \u2014 otherwise the whale behind it is washed twice.
   */
  body[data-dsh-harness-whale="true"][data-hww-zones="on"] [data-slot="conversation"] > [data-phase],
  body[data-dsh-harness-whale="true"][data-hww-zones="on"] [data-slot="main.conversation"] > [data-phase] {
    background: transparent !important;
  }

  body[data-dsh-harness-whale="true"] [data-slot="conversation"] > [data-phase="hero"],
  body[data-dsh-harness-whale="true"] [data-slot="main.conversation"] > [data-phase="hero"] {
    background: transparent !important;
  }

  /*
   * One span per measured text band, positioned in viewport coordinates (the
   * layer is fixed, and so are the rects). The box-shadow is the feather: a
   * paragraph ends in a soft edge instead of a rectangle. The bands sit above the
   * canvas and below the shell, so glyphs still win and the ink between blocks
   * keeps its full strength.
   */
  .dsh-whale-reading-scrim {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
  }

  .dsh-whale-reading-scrim > span {
    position: absolute;
    border-radius: 18px;
    background: var(--hww-reading-scrim-soft);
    box-shadow: 0 0 26px 14px var(--hww-reading-scrim-soft);
  }

  /*
   * Welcome-screen halo: the hero title is drawn straight over the whale, so a
   * theme-coloured text-shadow (invisible on the pool, which is the same colour)
   * clears the few pixels around each glyph where dots would break the letter
   * edges. Inherited, so every hero label gets the same treatment.
   */
  body[data-dsh-harness-whale="true"] [data-slot="conversation"] > [data-phase="hero"],
  body[data-dsh-harness-whale="true"] [data-slot="main.conversation"] > [data-phase="hero"] {
    text-shadow: 0 0 10px var(--hww-hero-halo), 0 1px 3px var(--hww-hero-halo);
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

  /*
   * Message content. Scoped to the conversation-session slot outlet and to plain
   * elements: the previous div[class*="_markdown_"] prefix does not exist in
   * current Harness bundles, so every rule under it was dead code (the compat
   * preflight found it), and .md-code-block lives in another package entirely.
   * The code-block hook is data-code-block-banner, which ui-chat does render.
   */
  body[data-dsh-harness-whale="true"] [data-slot="conversation.session"] { color: var(--hww-text) !important; }
  body[data-dsh-harness-whale="true"] [data-slot="conversation.session"] :is(h1, h2, h3, h4, strong) { color: var(--hww-text-bright) !important; }

  body[data-dsh-harness-whale="true"] [data-slot="conversation.session"] a {
    color: var(--hww-link) !important;
    text-decoration-color: color-mix(in srgb, var(--hww-link) 42%, transparent) !important;
  }

  body[data-dsh-harness-whale="true"] [data-slot="conversation.session"] code {
    background: var(--hww-code) !important;
    color: var(--hww-text) !important;
    border: 1px solid var(--hww-border) !important;
    box-shadow: none !important;
  }

  body[data-dsh-harness-whale="true"] [data-slot="conversation.session"] blockquote {
    background: var(--hww-surface) !important;
    border-color: color-mix(in srgb, var(--hww-link) 38%, transparent) !important;
    color: var(--hww-text-soft) !important;
  }

  body[data-dsh-harness-whale="true"] [data-slot="conversation.session"] pre {
    overflow: hidden;
    background: var(--hww-code-panel) !important;
    border: 1px solid var(--hww-border) !important;
    box-shadow: 0 12px 34px var(--hww-shadow) !important;
  }

  body[data-dsh-harness-whale="true"] [data-slot="conversation.session"] [data-code-block-banner],
  body[data-dsh-harness-whale="true"] [data-slot="conversation.session"] [data-code-block-banner] > div,
  body[data-dsh-harness-whale="true"] [data-slot="conversation.session"] pre {
    background: var(--hww-code-panel) !important;
    border-color: var(--hww-border) !important;
  }

  body[data-dsh-harness-whale="true"] [data-slot="conversation.session"] pre,
  body[data-dsh-harness-whale="true"] [data-slot="conversation.session"] pre code { color: var(--hww-text) !important; }

  body[data-dsh-harness-whale="true"] [data-slot="conversation.session"] pre code {
    background: transparent !important;
    border: 0 !important;
  }

  body[data-dsh-harness-whale="true"] [data-slot="conversation.session"] [data-code-block-banner] button {
    background: var(--hww-surface-hover) !important;
    border: 1px solid var(--hww-border) !important;
    color: var(--hww-text-soft) !important;
  }

  body[data-dsh-harness-whale="true"] [data-slot="conversation.session"] [data-code-block-banner] button:hover {
    background: var(--hww-surface-selected) !important;
    color: var(--hww-text-bright) !important;
  }

  .dsh-harness-whale-wallpaper {
    position: fixed;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    pointer-events: none;
    /* The pool: a lit water column behind the whale, a cooler floor glow under
       it, and a diagonal base wash. Keep the entries here and in the dark block
       below in the same order \u2014 they are one background, not three layers. */
    background:
      radial-gradient(ellipse 62% 74% at 77% 46%, rgba(150, 187, 236, 0.34) 0%, rgba(206, 228, 250, 0.20) 46%, transparent 74%),
      radial-gradient(ellipse 46% 36% at 64% 94%, rgba(146, 184, 230, 0.26), transparent 76%),
      radial-gradient(ellipse 90% 70% at 12% 8%, rgba(226, 238, 253, 0.55), transparent 70%),
      linear-gradient(118deg, #f8fbff 0%, #eef5ff 45%, #e2edfc 72%, #dbe8fa 100%);
    isolation: isolate;
    transition: background 320ms ease;
  }

  body[data-ds-dark-theme] .dsh-harness-whale-wallpaper {
    background:
      radial-gradient(ellipse 62% 74% at 77% 46%, rgba(30, 78, 146, 0.46) 0%, rgba(14, 44, 88, 0.26) 46%, transparent 74%),
      radial-gradient(ellipse 46% 36% at 64% 94%, rgba(28, 74, 136, 0.30), transparent 76%),
      radial-gradient(ellipse 90% 70% at 12% 8%, rgba(10, 32, 64, 0.45), transparent 70%),
      linear-gradient(118deg, #040a14 0%, #071930 45%, #0a2344 72%, #08192f 100%);
  }

  /* The vivid preset lifts the pool and the mist for demos and screenshots. */
  body[data-hww-preset="vivid"] .dsh-harness-whale-wallpaper {
    background:
      radial-gradient(ellipse 62% 74% at 77% 46%, rgba(122, 170, 232, 0.46) 0%, rgba(186, 216, 248, 0.26) 46%, transparent 74%),
      radial-gradient(ellipse 46% 36% at 64% 94%, rgba(126, 170, 226, 0.34), transparent 76%),
      radial-gradient(ellipse 90% 70% at 12% 8%, rgba(232, 242, 254, 0.68), transparent 70%),
      linear-gradient(118deg, #f9fcff 0%, #e9f2ff 45%, #d9e8fb 72%, #cee0f7 100%);
  }

  body[data-ds-dark-theme][data-hww-preset="vivid"] .dsh-harness-whale-wallpaper {
    background:
      radial-gradient(ellipse 62% 74% at 77% 46%, rgba(44, 104, 184, 0.58) 0%, rgba(20, 58, 112, 0.32) 46%, transparent 74%),
      radial-gradient(ellipse 46% 36% at 64% 94%, rgba(38, 96, 168, 0.38), transparent 76%),
      radial-gradient(ellipse 90% 70% at 12% 8%, rgba(14, 42, 82, 0.55), transparent 70%),
      linear-gradient(118deg, #050c1a 0%, #0a2140 45%, #0e2d58 72%, #0a1f3c 100%);
  }

  .dsh-harness-whale-wallpaper::before,
  .dsh-harness-whale-wallpaper::after {
    content: "";
    position: absolute;
    inset: -16%;
    opacity: 0.42;
    filter: blur(48px);
    will-change: transform;
  }

  body[data-ds-dark-theme] .dsh-harness-whale-wallpaper::before,
  body[data-ds-dark-theme] .dsh-harness-whale-wallpaper::after { opacity: 0.55; }

  body[data-hww-preset="vivid"] .dsh-harness-whale-wallpaper::before,
  body[data-hww-preset="vivid"] .dsh-harness-whale-wallpaper::after { opacity: 0.62; }

  body[data-ds-dark-theme][data-hww-preset="vivid"] .dsh-harness-whale-wallpaper::before,
  body[data-ds-dark-theme][data-hww-preset="vivid"] .dsh-harness-whale-wallpaper::after { opacity: 0.78; }

  .dsh-harness-whale-wallpaper::before {
    background: radial-gradient(ellipse 34% 20% at 74% 58%, rgba(96, 146, 214, 0.26), transparent 72%);
    animation: dsh-whale-mist-a 52s ease-in-out infinite alternate;
  }

  .dsh-harness-whale-wallpaper::after {
    background: radial-gradient(ellipse 30% 24% at 84% 28%, rgba(58, 118, 196, 0.22), transparent 75%);
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
  layer.dataset.version = "0.3.12";
  layer.setAttribute("aria-hidden", "true");
  const canvas = document.createElement("canvas");
  layer.append(canvas);
  document.body.prepend(layer);
  document.body.setAttribute("data-dsh-harness-whale", "true");
  document.body.setAttribute("data-hww-preset", config.preset);
  const renderer = new WhaleRenderer(canvas, config, colorScheme);
  let activeScheme = colorScheme;
  const ownSurfaces = () => {
    const style2 = getComputedStyle(document.body);
    const derived = [
      "--hww-page",
      "--hww-surface",
      "--hww-surface-strong",
      "--hww-code",
      "--hww-code-panel",
      "--hww-reading-scrim",
      "--hww-reading-scrim-soft"
    ].map((name2) => style2.getPropertyValue(name2).trim());
    return [
      ...Object.values(THEME_TOKEN_OVERRIDES).flatMap((modes) => [modes.light, modes.dark]),
      ...derived
    ].filter((value) => value !== "");
  };
  document.documentElement.setAttribute("data-hww-status", "ok");
  const shellWatch = watchShellIntegrity("0.3.12", () => activeScheme, ownSurfaces);
  const scrim = document.createElement("div");
  scrim.className = "dsh-whale-reading-scrim";
  scrim.setAttribute("aria-hidden", "true");
  layer.append(scrim);
  const bandPool = [];
  const paintScrim = (rects) => {
    const bands = rects ?? [];
    while (bandPool.length < bands.length) {
      const band = document.createElement("span");
      band.setAttribute("aria-hidden", "true");
      scrim.append(band);
      bandPool.push(band);
    }
    bandPool.forEach((band, index) => {
      const rect = bands[index];
      if (rect === void 0) {
        band.style.display = "none";
        return;
      }
      band.style.display = "";
      band.style.left = `${rect.x}px`;
      band.style.top = `${rect.y}px`;
      band.style.width = `${rect.w}px`;
      band.style.height = `${rect.h}px`;
    });
  };
  const zoneWatch = watchReadingZones((rects, showcase) => {
    renderer.setReadingZones(rects);
    renderer.setShowcase(showcase);
    paintScrim(rects);
    document.body.setAttribute("data-hww-zones", rects === null ? "off" : "on");
    document.body.setAttribute("data-hww-showcase", showcase ? "on" : "off");
  });
  return {
    renderer,
    setActivity: (state) => renderer.setActivity(state),
    setColorScheme: (scheme) => {
      activeScheme = scheme;
      renderer.setColorScheme(scheme);
    },
    dispose: () => {
      document.documentElement.removeAttribute("data-hww-status");
      zoneWatch.dispose();
      document.body.removeAttribute("data-hww-preset");
      document.body.removeAttribute("data-hww-zones");
      document.body.removeAttribute("data-hww-showcase");
      shellWatch.dispose();
      renderer.destroy();
      layer.remove();
      style.remove();
      if (previousAttribute === null) document.body.removeAttribute("data-dsh-harness-whale");
      else document.body.setAttribute("data-dsh-harness-whale", previousAttribute);
    }
  };
}

// src/client.tsx
var name = "harness-whale-wallpaper-client";
var inject = ["slots", "theme"];
async function loadConfig(signal) {
  try {
    const response = await fetch("/_plugins/harness-whale/config", {
      cache: "no-store",
      credentials: "same-origin",
      signal
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return resolveConfig(await response.json());
  } catch (error) {
    if (signal.aborted) throw error;
    console.warn("[harness-whale] Config endpoint unavailable; using safe defaults.", error);
    return DEFAULT_WALLPAPER_CONFIG;
  }
}
function createWallpaperLifecycle(ctx, setMount) {
  return function HarnessWhaleWallpaper() {
    (0, import_react.useEffect)(() => {
      const abort = new AbortController();
      let mount;
      let stopActivity;
      void loadConfig(abort.signal).then((config) => {
        if (abort.signal.aborted || !config.enabled) return;
        try {
          mount = mountWallpaper(config, ctx.theme.getTheme().active.colorScheme);
          setMount(mount);
          stopActivity = watchActivity(ctx, mount.setActivity);
        } catch (error) {
          document.documentElement.setAttribute("data-hww-status", "failed");
          console.error(
            "[harness-whale] could not mount the wallpaper; the app is left untouched. Run npm run compat in the plugin checkout and see docs/compatibility.md.",
            error
          );
        }
      }).catch((error) => {
        if (!abort.signal.aborted) console.error("[harness-whale] Failed to start wallpaper.", error);
      });
      return () => {
        abort.abort();
        stopActivity?.();
        mount?.dispose();
        setMount(void 0);
      };
    }, []);
    return null;
  };
}
function apply(ctx) {
  const slots = ctx.get("slots");
  if (slots === void 0) {
    console.error("[harness-whale] Required Harness slot service is unavailable; plugin stopped safely.");
    return;
  }
  ctx.effect(
    () => ctx.theme.overrideTokens("dsh-plugin-harness-whale", THEME_TOKEN_OVERRIDES),
    "harness-whale-wallpaper: theme tokens"
  );
  let activeMount;
  const syncTheme = (snapshot) => {
    activeMount?.setColorScheme(snapshot.active.colorScheme);
  };
  ctx.on("theme/change", syncTheme);
  const Lifecycle = createWallpaperLifecycle(ctx, (mount) => {
    activeMount = mount;
  });
  ctx.effect(
    () => slots.inject("shell.overlay", () => slots.register(
      { name: "shell.overlay", id: "harness-whale-wallpaper" },
      Lifecycle
    )),
    "harness-whale-wallpaper: shell lifecycle"
  );
}
return module.exports; } });
//# sourceMappingURL=client.js.map
