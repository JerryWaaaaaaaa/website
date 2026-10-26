import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import './MeshGradient.css';

/** A mesh-patch control point: position (% of the layer) and colour. */
export type MeshPatchPoint = { x: number; y: number; color: string };

/**
 * warp: domain-warped fractal noise mapped through the ramp colours, with
 * dithered grain (liquid, folding ribbons). patches: a true mesh gradient — a
 * grid of coloured control points, the surface between them interpolated
 * bicubically (as in Illustrator meshes / SwiftUI MeshGradient).
 */
export const MESH_MODES = ['warp', 'patches'] as const;
export type MeshMode = (typeof MESH_MODES)[number];

/** Patch control grid, row-major. Edge points stay on their edge so the canvas is always covered. */
export const PATCH_COLS = 3;
export const PATCH_ROWS = 3;

export type MeshGradientParams = {
  mode: MeshMode;
  /** Warp: ramp colours, in order. */
  ramp: string[];
  /** Patches: PATCH_ROWS × PATCH_COLS control points, row-major. */
  patches: MeshPatchPoint[];
  /** Patches: per-pixel colour grain (0 = clean). */
  patchGrain: number;
  /** Animation clock rate (1 = the tuned pace, 0 = static; off for reduced motion). */
  speed: number;
  /** Patches: how far free control points wander, % of the layer. */
  drift: number;
  /** Warp: noise frequency — roughly how many ribbons fit across the section. */
  scale: number;
  /** Warp: fold strength (0 = plain fractal noise, 2–4 = liquid). */
  warp: number;
  /** Warp: pans the pattern, as a fraction of the section's width / height (+x right, +y down). */
  offsetX: number;
  offsetY: number;
  /** Warp: sharpness of the bands between ramp colours (1 = linear). */
  contrast: number;
  /** Warp: per-pixel jitter of the ramp lookup — speckled grain that bleeds colours at band edges. */
  dither: number;
  /** Noise texture over the mesh: strength (0 = off). */
  grain: number;
  /** Noise tile size, CSS px (larger = coarser grain). */
  grainSize: number;
  grainBlend: GrainBlend;
};

/** Blend modes worth trying for the noise layer. */
export const GRAIN_BLENDS = ['overlay', 'soft-light', 'multiply', 'screen', 'normal'] as const;
export type GrainBlend = (typeof GRAIN_BLENDS)[number];

// Monochrome fractal noise tile; repeated as the grain layer's background.
const NOISE_URL = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>",
)}")`;

type Props = {
  params: MeshGradientParams;
  className?: string;
  /** Optional ref to the canvas, e.g. so the ASCII trail can sample its colours. */
  canvasRef?: RefObject<HTMLCanvasElement | null>;
};

export const MAX_RAMP = 6;
// Vertices per control-grid span when tessellating the patch surface.
const PATCH_SUB = 24;

const VERT = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

// Domain-warped fbm (after Inigo Quilez): noise fed back into its own
// coordinates twice gives the folding ribbons; the result picks a colour from
// the ramp colours, jittered per pixel by a static hash for the grain.
const WARP_FRAG = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform vec2 u_res;      // CSS px
uniform float u_time;    // s
uniform float u_scale;
uniform float u_warp;
uniform vec2 u_offset;   // fraction of the section, +y down
uniform float u_contrast;
uniform float u_dither;
uniform int u_n;
uniform vec3 u_cols[${MAX_RAMP}];
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x),
             mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y);
}
const mat2 ROT = mat2(0.8, 0.6, -0.6, 0.8);
float fbm(vec2 p) {
  float a = 0.5;
  float s = 0.0;
  // 4 octaves: enough to fold, few enough that the ribbons stay broad.
  for (int i = 0; i < 4; i++) {
    s += a * vnoise(p);
    p = ROT * p * 2.02 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return s / 0.9375;
}
vec3 ramp(float v) {
  if (u_n < 2) return u_cols[0];
  float x = v * float(u_n - 1);
  int k = int(min(floor(x), float(u_n - 2)));
  float f = clamp((x - float(k) - 0.5) * u_contrast + 0.5, 0.0, 1.0);
  f = f * f * (3.0 - 2.0 * f);
  return mix(u_cols[k], u_cols[k + 1], f);
}
void main() {
  vec2 uv = vec2(v_uv.x, 1.0 - v_uv.y) - 0.5 - u_offset;
  vec2 p = uv * (u_res / min(u_res.x, u_res.y)) * u_scale;
  float t = u_time * 0.15;
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - 0.7 * t));
  vec2 r = vec2(fbm(p + u_warp * q + vec2(1.7, 9.2) + 0.5 * t),
                fbm(p + u_warp * q + vec2(8.3, 2.8) - 0.4 * t));
  float f = fbm(p + u_warp * r);
  // Stretch fbm's narrow middle range over the ramp; q adds large-scale drift.
  float v = (f - 0.5) * 1.8 + 0.5 + (length(q) - 0.7) * 0.4;
  v = clamp(v + (hash12(gl_FragCoord.xy) - 0.5) * u_dither, 0.0, 1.0);
  outColor = vec4(ramp(v), 1.0);
}`;

// Patches: the surface is tessellated on the CPU (positions + linear-light
// colours, both bicubic); the GPU just fills the triangles.
const PATCH_VERT = `#version 300 es
in vec2 a_pos;
in vec3 a_col;
out vec3 v_col;
void main() {
  v_col = a_col;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;
const PATCH_FRAG = `#version 300 es
precision highp float;
in vec3 v_col;
out vec4 outColor;
uniform float u_grain;
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
void main() {
  vec3 c = pow(clamp(v_col, 0.0, 1.0), vec3(1.0 / 2.2));
  // Static grain (+ a hair of dither so smooth spans don't band).
  c += (hash12(gl_FragCoord.xy) - 0.5) * (u_grain + 1.0 / 255.0);
  outColor = vec4(c, 1.0);
}`;

type GL = WebGL2RenderingContext;

function compile(gl: GL, vert: string, frag: string) {
  const make = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader');
    return s;
  };
  const p = gl.createProgram()!;
  gl.attachShader(p, make(gl.VERTEX_SHADER, vert));
  gl.attachShader(p, make(gl.FRAGMENT_SHADER, frag));
  gl.bindAttribLocation(p, 0, 'a_pos');
  gl.bindAttribLocation(p, 1, 'a_col');
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? 'link');
  return p;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1, 7), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/**
 * Point i's offset from home at clock t (s): a slow Lissajous loop with its own
 * frequencies and phase, so the points never move in lockstep.
 */
function driftOffset(i: number, t: number): [number, number] {
  const fx = 0.11 + 0.037 * i;
  const fy = 0.083 + 0.029 * ((i * 3) % 5);
  return [Math.sin(t * fx * Math.PI * 2 + i * 1.7), Math.cos(t * fy * Math.PI * 2 + i * 2.3)];
}

/** Catmull-Rom between p1 and p2 at t ∈ [0, 1]. */
const cr = (p0: number, p1: number, p2: number, p3: number, t: number) =>
  0.5 * (2 * p1 + (p2 - p0) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (3 * p1 - p0 - 3 * p2 + p3) * t * t * t);

/**
 * Control grid at clock t as [x %, y %, r, g, b] (colours in linear light).
 * Edge points are pinned to their edge and only slide along it; corners are fixed.
 */
function controlGrid(p: MeshGradientParams, t: number): number[][] {
  const out: number[][] = [];
  for (let r = 0; r < PATCH_ROWS; r++) {
    for (let c = 0; c < PATCH_COLS; c++) {
      const i = r * PATCH_COLS + c;
      const pt = p.patches[i] ?? { x: 0, y: 0, color: '#ffffff' };
      const [dx, dy] = driftOffset(i, t);
      const edgeX = c === 0 || c === PATCH_COLS - 1;
      const edgeY = r === 0 || r === PATCH_ROWS - 1;
      const x = edgeX ? (c === 0 ? 0 : 100) : pt.x + dx * p.drift;
      const y = edgeY ? (r === 0 ? 0 : 100) : pt.y + dy * p.drift;
      const [cr0, cg0, cb0] = hexToRgb(pt.color);
      out.push([x, y, cr0 ** 2.2, cg0 ** 2.2, cb0 ** 2.2]);
    }
  }
  return out;
}

/** Bicubic surface point at grid coords (s, t) — 0…cols-1 / 0…rows-1. */
function surface(grid: number[][], s: number, t: number, out: Float32Array, o: number) {
  const ci = Math.min(Math.floor(s), PATCH_COLS - 2);
  const ri = Math.min(Math.floor(t), PATCH_ROWS - 2);
  const fu = s - ci;
  const fv = t - ri;
  const col = (k: number) => Math.max(0, Math.min(PATCH_COLS - 1, k));
  const row = (k: number) => Math.max(0, Math.min(PATCH_ROWS - 1, k));
  for (let d = 0; d < 5; d++) {
    const along = [-1, 0, 1, 2].map((dr) => {
      const rr = row(ri + dr) * PATCH_COLS;
      return cr(
        grid[rr + col(ci - 1)][d],
        grid[rr + col(ci)][d],
        grid[rr + col(ci + 1)][d],
        grid[rr + col(ci + 2)][d],
        fu,
      );
    });
    const v = cr(along[0], along[1], along[2], along[3], fv);
    // Position → clip space (y up); colour stays linear.
    out[o + d] = d === 0 ? v / 50 - 1 : d === 1 ? 1 - v / 50 : v;
  }
}

/** Static CSS stand-in (no WebGL / before the first frame): one radial per control point. */
function cssFallback({ patches }: MeshGradientParams): CSSProperties {
  const layers = patches.map((p) => `radial-gradient(circle at ${p.x}% ${p.y}%, ${p.color} 0%, transparent 60%)`);
  return { background: [...layers, patches[0]?.color ?? '#fff'].join(', ') };
}

/**
 * Full-bleed mesh gradient (WebGL2), in one of two modes: warp — liquid,
 * folding ribbons of the ramp colours with dithered grain — or patches — a
 * true mesh gradient whose free control points drift slowly. An optional
 * static noise texture sits on top. Animates only while on screen; a still
 * frame for reduced motion.
 */
export function MeshGradient({ params, className, canvasRef: externalRef }: Props) {
  const ownRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRef = externalRef ?? ownRef;
  const [ready, setReady] = useState(false);
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const refreshRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl2', {
      antialias: false,
      alpha: false,
      // Keeps the last frame readable between draws (the tile trail samples it).
      preserveDrawingBuffer: true,
    });
    if (!gl) return; // CSS fallback stays visible

    let programs: Record<MeshMode, WebGLProgram>;
    try {
      programs = { warp: compile(gl, VERT, WARP_FRAG), patches: compile(gl, PATCH_VERT, PATCH_FRAG) };
    } catch (e) {
      console.warn('Mesh gradient shader failed to compile', e);
      return;
    }

    // Warp: one full-screen quad.
    const quadVao = gl.createVertexArray();
    gl.bindVertexArray(quadVao);
    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    // Patches: a fixed-topology triangle grid; vertices rewritten each frame.
    const nu = (PATCH_COLS - 1) * PATCH_SUB + 1;
    const nv = (PATCH_ROWS - 1) * PATCH_SUB + 1;
    const verts = new Float32Array(nu * nv * 5);
    const indices = new Uint16Array((nu - 1) * (nv - 1) * 6);
    let k = 0;
    for (let j = 0; j < nv - 1; j++) {
      for (let i = 0; i < nu - 1; i++) {
        const a = j * nu + i;
        indices.set([a, a + 1, a + nu, a + 1, a + nu + 1, a + nu], k);
        k += 6;
      }
    }
    const patchVao = gl.createVertexArray();
    gl.bindVertexArray(patchVao);
    const patchVbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, patchVbo);
    gl.bufferData(gl.ARRAY_BUFFER, verts.byteLength, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 20, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 20, 8);
    const patchIbo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, patchIbo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    gl.bindVertexArray(null);

    const loc = (mode: MeshMode, name: string) => gl.getUniformLocation(programs[mode], name);
    const uw = {
      res: loc('warp', 'u_res'),
      time: loc('warp', 'u_time'),
      scale: loc('warp', 'u_scale'),
      warp: loc('warp', 'u_warp'),
      offset: loc('warp', 'u_offset'),
      contrast: loc('warp', 'u_contrast'),
      dither: loc('warp', 'u_dither'),
      n: loc('warp', 'u_n'),
      cols: loc('warp', 'u_cols'),
    };
    const up = { grain: loc('patches', 'u_grain') };

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let disposed = false;
    let w = 0;
    let h = 0;
    let clock = 0; // animation time, s (accumulated so speed edits don't jump)
    let lastT = 0;
    let raf = 0;
    let inView = true;

    const drawWarp = (p: MeshGradientParams) => {
      const ramp = p.ramp.slice(0, MAX_RAMP);
      const cols = new Float32Array(MAX_RAMP * 3);
      ramp.forEach((c, i) => cols.set(hexToRgb(c), i * 3));
      gl.useProgram(programs.warp);
      gl.bindVertexArray(quadVao);
      gl.uniform2f(uw.res, w, h);
      gl.uniform1f(uw.time, clock);
      gl.uniform1f(uw.scale, p.scale);
      gl.uniform1f(uw.warp, p.warp);
      gl.uniform2f(uw.offset, p.offsetX, p.offsetY);
      gl.uniform1f(uw.contrast, p.contrast);
      gl.uniform1f(uw.dither, p.dither);
      gl.uniform1i(uw.n, ramp.length);
      gl.uniform3fv(uw.cols, cols);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const drawPatches = (p: MeshGradientParams) => {
      const grid = controlGrid(p, clock);
      for (let j = 0; j < nv; j++) {
        for (let i = 0; i < nu; i++) {
          surface(grid, i / PATCH_SUB, j / PATCH_SUB, verts, (j * nu + i) * 5);
        }
      }
      // Corner colour under anything the surface doesn't reach.
      const [r, g, b] = hexToRgb(p.patches[0]?.color ?? '#ffffff');
      gl.clearColor(r, g, b, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(programs.patches);
      gl.bindVertexArray(patchVao);
      gl.bindBuffer(gl.ARRAY_BUFFER, patchVbo);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, verts);
      gl.uniform1f(up.grain, p.patchGrain);
      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    };

    const draw = () => {
      if (disposed || !w || !h) return;
      const p = paramsRef.current;
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (p.mode === 'patches') drawPatches(p);
      else drawWarp(p);
      gl.bindVertexArray(null);
      setReady(true);
    };
    refreshRef.current = () => {
      draw();
      start();
    };

    const tick = (t: number) => {
      raf = 0;
      const speed = paramsRef.current.speed;
      if (disposed || !inView || !speed || reduceMotion) {
        lastT = 0;
        return;
      }
      const dt = lastT ? Math.min(t - lastT, 64) : 0;
      lastT = t;
      clock += (speed * dt) / 1000;
      draw();
      raf = requestAnimationFrame(tick);
    };
    function start() {
      if (!raf && inView && paramsRef.current.speed && !reduceMotion) raf = requestAnimationFrame(tick);
    }

    // CSS resolution: warp's grain stays ~1px; patches are cheap either way.
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.round(w));
      canvas.height = Math.max(1, Math.round(h));
      draw();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) start();
    });
    io.observe(canvas);
    resize();
    start();

    const onLost = (e: Event) => {
      e.preventDefault();
      setReady(false);
    };
    canvas.addEventListener('webglcontextlost', onLost);

    return () => {
      disposed = true;
      refreshRef.current = null;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener('webglcontextlost', onLost);
      [quad, patchVbo, patchIbo].forEach((b) => gl.deleteBuffer(b));
      [quadVao, patchVao].forEach((v) => gl.deleteVertexArray(v));
      Object.values(programs).forEach((pr) => gl.deleteProgram(pr));
    };
  }, []);

  // Live param edits (e.g. DialKit) redraw in place, keyed on content.
  const paramsKey = JSON.stringify(params);
  useEffect(() => {
    refreshRef.current?.();
  }, [paramsKey]);

  return (
    <div
      className={`v6-mesh${className ? ` ${className}` : ''}`}
      style={cssFallback(params)}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="v6-mesh-canvas" data-ready={ready ? 'true' : 'false'} />
      {params.grain > 0 && (
        <div
          className="v6-mesh-grain"
          style={{
            backgroundImage: NOISE_URL,
            backgroundSize: `${params.grainSize}px`,
            opacity: params.grain,
            mixBlendMode: params.grainBlend,
          }}
        />
      )}
    </div>
  );
}
