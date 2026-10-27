/**
 * A mesh-patch control point: position (% of the layer), colour, and an
 * optional weight — how much of the surface its colour claims (1 = even;
 * higher spreads it over more of the neighbouring area, lower shrinks it).
 */
export type MeshPatchPoint = { x: number; y: number; color: string; weight?: number };

/** Bounds on a patch point's weight. */
export const PATCH_WEIGHT_MIN = 0.05;
export const PATCH_WEIGHT_MAX = 5;

/**
 * warp: domain-warped fractal noise mapped through the ramp colours, with
 * dithered grain (liquid, folding ribbons). patches: a true mesh gradient — a
 * grid of coloured control points, the surface between them interpolated
 * bicubically (as in Illustrator meshes / SwiftUI MeshGradient).
 */
export const MESH_MODES = ['warp', 'patches'] as const;
export type MeshMode = (typeof MESH_MODES)[number];

/** Default patch control grid (columns × rows), row-major. */
export const PATCH_COLS = 3;
export const PATCH_ROWS = 3;
/** Bounds on the patch grid's columns / rows. */
export const PATCH_GRID_MIN = 2;
export const PATCH_GRID_MAX = 6;

export type MeshGradientParams = {
  mode: MeshMode;
  /** Warp: ramp colours, in order. */
  ramp: string[];
  /** Patches: rows × cols control points, row-major. */
  patches: MeshPatchPoint[];
  /** Patches: control grid size (default PATCH_COLS × PATCH_ROWS). */
  cols?: number;
  rows?: number;
  /**
   * Patches: per-pixel jitter of where the surface is sampled, as a fraction of
   * the layer's shorter side — speckled grain that bleeds neighbouring colours
   * into each other (0 = clean).
   */
  patchDither: number;
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

/** Monochrome fractal noise tile (256px), drawn as the grain layer. */
export const NOISE_SRC = `data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>",
)}`;
const NOISE_TILE = 256;

export const MAX_RAMP = 6;
// Vertices across the tessellated patch surface (spread over its spans), per axis.
const PATCH_VERTS = 97;

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
void main() {
  outColor = vec4(pow(clamp(v_col, 0.0, 1.0), vec3(1.0 / 2.2)), 1.0);
}`;
// Patches, second pass: each pixel reads the drawn surface from a random
// nearby spot (static per pixel), so colours speckle into their neighbours.
const DITHER_FRAG = `#version 300 es
precision highp float;
out vec4 outColor;
uniform sampler2D u_tex;
uniform vec2 u_size;     // buffer px
uniform float u_dither;  // jitter radius, fraction of the shorter side
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
void main() {
  vec2 px = gl_FragCoord.xy;
  float a = hash12(px) * 6.2831853;
  float r = sqrt(hash12(px + 17.31)) * u_dither * min(u_size.x, u_size.y);
  vec2 uv = clamp((px + vec2(cos(a), sin(a)) * r) / u_size, 0.5 / u_size, 1.0 - 0.5 / u_size);
  vec3 c = texture(u_tex, uv).rgb;
  // A hair of noise so smooth spans don't band.
  c += (hash12(px + 3.7) - 0.5) / 255.0;
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

/** Uniform cubic B-spline basis at t ∈ [0, 1] — never negative, so safe for weighted blends. */
const bspline = (t: number) => {
  const t2 = t * t;
  const t3 = t2 * t;
  return [(1 - t) ** 3 / 6, (3 * t3 - 6 * t2 + 4) / 6, (-3 * t3 + 3 * t2 + 3 * t + 1) / 6, t3 / 6];
};

/** Catmull-Rom between p1 and p2 at t ∈ [0, 1]. */
const cr = (p0: number, p1: number, p2: number, p3: number, t: number) =>
  0.5 *
  (2 * p1 +
    (p2 - p0) * t +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t +
    (3 * p1 - p0 - 3 * p2 + p3) * t * t * t);

/** The patch control grid's size. */
export function patchGrid(p: Pick<MeshGradientParams, 'cols' | 'rows'>): { cols: number; rows: number } {
  return { cols: p.cols ?? PATCH_COLS, rows: p.rows ?? PATCH_ROWS };
}

/** Whether patch point i sits off the layer's edge on x / y (corners are on both edges). */
export function patchAxes(i: number, cols = PATCH_COLS, rows = PATCH_ROWS): { x: boolean; y: boolean } {
  const r = Math.floor(i / cols);
  const c = i % cols;
  return { x: c > 0 && c < cols - 1, y: r > 0 && r < rows - 1 };
}

/**
 * Rendered grid at clock t, (rows + 2) × (cols + 2) of [x %, y %, r, g, b, weight]
 * (colours in linear light). Control points can sit anywhere, so they're
 * wrapped in a ring of border points: each edge point is projected onto the
 * layer's border (corners onto its corners) in its own colour, so the surface
 * always reaches the edges. A point already on the border coincides with its
 * projection, which renders exactly like the plain 3 × 3 mesh.
 */
function controlGrid(p: MeshGradientParams, t: number): number[][] {
  const { cols: PC, rows: PR } = patchGrid(p);
  const GC = PC + 2;
  const GR = PR + 2;
  const pts: number[][] = [];
  for (let i = 0; i < PC * PR; i++) {
    const pt = p.patches[i] ?? { x: 0, y: 0, color: '#ffffff' };
    const [dx, dy] = driftOffset(i, t);
    // Edge points only wander along their edge; corners stay put.
    const axes = patchAxes(i, PC, PR);
    const [cr0, cg0, cb0] = hexToRgb(pt.color);
    const w = Math.max(PATCH_WEIGHT_MIN, pt.weight ?? 1);
    pts.push([
      pt.x + (axes.x ? dx * p.drift : 0),
      pt.y + (axes.y ? dy * p.drift : 0),
      cr0 ** 2.2,
      cg0 ** 2.2,
      cb0 ** 2.2,
      w,
    ]);
  }
  const out: number[][] = [];
  for (let r = 0; r < GR; r++) {
    for (let c = 0; c < GC; c++) {
      const pr = Math.max(0, Math.min(PR - 1, r - 1));
      const pc = Math.max(0, Math.min(PC - 1, c - 1));
      const src = pts[pr * PC + pc];
      // Ring rows / columns pin their axis to the border; next to a control
      // corner they pin the other axis too, landing on the layer's corner.
      const ringRow = r === 0 || r === GR - 1;
      const ringCol = c === 0 || c === GC - 1;
      const edgeCol = pc === 0 || pc === PC - 1;
      const edgeRow = pr === 0 || pr === PR - 1;
      const x = ringCol || (ringRow && edgeCol) ? (pc === 0 ? 0 : 100) : src[0];
      const y = ringRow || (ringCol && edgeRow) ? (pr === 0 ? 0 : 100) : src[1];
      out.push([x, y, src[2], src[3], src[4], src[5]]);
    }
  }
  return out;
}

/** Bicubic surface point at grid coords (s, t) — 0…gc-1 / 0…gr-1. */
function surface(
  grid: number[][],
  gc: number,
  gr: number,
  s: number,
  t: number,
  out: Float32Array,
  o: number,
  weighted: boolean,
) {
  const ci = Math.min(Math.floor(s), gc - 2);
  const ri = Math.min(Math.floor(t), gr - 2);
  const fu = s - ci;
  const fv = t - ri;
  const col = (k: number) => Math.max(0, Math.min(gc - 1, k));
  const row = (k: number) => Math.max(0, Math.min(gr - 1, k));
  for (let d = 0; d < 5; d++) {
    const along = [-1, 0, 1, 2].map((dr) => {
      const rr = row(ri + dr) * gc;
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
  if (!weighted) return;
  // Weights: shift the colour by how much a weighted blend of the nearby
  // points differs from an even one. Equal weights add nothing, so an
  // unweighted mesh renders exactly as plain Catmull-Rom.
  const bu = bspline(fu);
  const bv = bspline(fv);
  let sw = 0;
  const even = [0, 0, 0];
  const heavy = [0, 0, 0];
  for (let j = 0; j < 4; j++) {
    const rr = row(ri + j - 1) * gc;
    for (let i = 0; i < 4; i++) {
      const g = grid[rr + col(ci + i - 1)];
      const b = bu[i] * bv[j];
      const bw = b * g[5];
      sw += bw;
      for (let k = 0; k < 3; k++) {
        even[k] += b * g[2 + k];
        heavy[k] += bw * g[2 + k];
      }
    }
  }
  for (let k = 0; k < 3; k++) out[o + 2 + k] += heavy[k] / sw - even[k];
}

export type MeshRenderer = {
  /** Draws one frame into the whole drawing buffer; `w`/`h` are the layer's CSS size. */
  draw: (p: MeshGradientParams, clock: number, w: number, h: number) => void;
  dispose: () => void;
};

/** Compiles both modes' programs on `gl`. Throws if a shader fails to compile. */
export function createMeshRenderer(gl: GL): MeshRenderer {
  const programs: Record<MeshMode, WebGLProgram> = {
    warp: compile(gl, VERT, WARP_FRAG),
    patches: compile(gl, PATCH_VERT, PATCH_FRAG),
  };

  // Warp: one full-screen quad.
  const quadVao = gl.createVertexArray();
  gl.bindVertexArray(quadVao);
  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  // Patches: a triangle grid, rebuilt when the control grid's size changes;
  // vertices rewritten each frame.
  const patchVao = gl.createVertexArray();
  const patchVbo = gl.createBuffer();
  const patchIbo = gl.createBuffer();
  gl.bindVertexArray(patchVao);
  gl.bindBuffer(gl.ARRAY_BUFFER, patchVbo);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 20, 0);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 20, 8);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, patchIbo);
  gl.bindVertexArray(null);
  let tess = { gc: 0, gr: 0, nu: 0, nv: 0, sub: 0, verts: new Float32Array(0), count: 0 };
  const tessellation = (gc: number, gr: number) => {
    if (tess.gc === gc && tess.gr === gr) return tess;
    // A similar vertex budget whatever the grid size (24 per span at the default 3 × 3).
    const sub = Math.max(8, Math.round((PATCH_VERTS - 1) / (Math.max(gc, gr) - 1)));
    const nu = (gc - 1) * sub + 1;
    const nv = (gr - 1) * sub + 1;
    const indices = new Uint16Array((nu - 1) * (nv - 1) * 6);
    let k = 0;
    for (let j = 0; j < nv - 1; j++) {
      for (let i = 0; i < nu - 1; i++) {
        const a = j * nu + i;
        indices.set([a, a + 1, a + nu, a + 1, a + nu + 1, a + nu], k);
        k += 6;
      }
    }
    const verts = new Float32Array(nu * nv * 5);
    gl.bindVertexArray(patchVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, patchVbo);
    gl.bufferData(gl.ARRAY_BUFFER, verts.byteLength, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, patchIbo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    gl.bindVertexArray(null);
    tess = { gc, gr, nu, nv, sub, verts, count: indices.length };
    return tess;
  };

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
  const ditherProgram = compile(gl, VERT, DITHER_FRAG);
  const ud = {
    tex: gl.getUniformLocation(ditherProgram, 'u_tex'),
    size: gl.getUniformLocation(ditherProgram, 'u_size'),
    dither: gl.getUniformLocation(ditherProgram, 'u_dither'),
  };
  // Offscreen target the patch surface is drawn into before the dither pass.
  const surfaceTex = gl.createTexture();
  const surfaceFbo = gl.createFramebuffer();
  let texW = 0;
  let texH = 0;
  const surfaceTarget = (w: number, h: number) => {
    if (w !== texW || h !== texH) {
      gl.bindTexture(gl.TEXTURE_2D, surfaceTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.bindFramebuffer(gl.FRAMEBUFFER, surfaceFbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, surfaceTex, 0);
      texW = w;
      texH = h;
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, surfaceFbo);
  };

  const drawWarp = (p: MeshGradientParams, clock: number, w: number, h: number) => {
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

  const drawPatches = (p: MeshGradientParams, clock: number) => {
    const grid = controlGrid(p, clock);
    const weighted = p.patches.some((pt) => (pt.weight ?? 1) !== 1);
    const { cols, rows } = patchGrid(p);
    const { gc, gr, nu, nv, sub, verts, count } = tessellation(cols + 2, rows + 2);
    for (let j = 0; j < nv; j++) {
      for (let i = 0; i < nu; i++) {
        surface(grid, gc, gr, i / sub, j / sub, verts, (j * nu + i) * 5, weighted);
      }
    }
    const bw = gl.drawingBufferWidth;
    const bh = gl.drawingBufferHeight;
    // The surface goes straight to the canvas without dither; else via the offscreen target.
    if (p.patchDither > 0) surfaceTarget(bw, bh);
    // Corner colour under any sliver the surface misses (e.g. spline overshoot).
    const [r, g, b] = hexToRgb(p.patches[0]?.color ?? '#ffffff');
    gl.clearColor(r, g, b, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(programs.patches);
    gl.bindVertexArray(patchVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, patchVbo);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, verts);
    gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
    if (p.patchDither > 0) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.useProgram(ditherProgram);
      gl.bindVertexArray(quadVao);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, surfaceTex);
      gl.uniform1i(ud.tex, 0);
      gl.uniform2f(ud.size, bw, bh);
      gl.uniform1f(ud.dither, p.patchDither);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  };

  return {
    draw(p, clock, w, h) {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      if (p.mode === 'patches') drawPatches(p, clock);
      else drawWarp(p, clock, w, h);
      gl.bindVertexArray(null);
    },
    dispose() {
      [quad, patchVbo, patchIbo].forEach((b) => gl.deleteBuffer(b));
      [quadVao, patchVao].forEach((v) => gl.deleteVertexArray(v));
      Object.values(programs).forEach((pr) => gl.deleteProgram(pr));
      gl.deleteProgram(ditherProgram);
      gl.deleteTexture(surfaceTex);
      gl.deleteFramebuffer(surfaceFbo);
    },
  };
}

let noiseImage: Promise<HTMLImageElement> | null = null;
function loadNoise() {
  noiseImage ??= new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = NOISE_SRC;
  });
  return noiseImage;
}

/**
 * Renders one still frame — mesh plus its noise layer — to a 2D canvas of
 * `width × height` CSS px at `scale`× resolution (e.g. for PNG export).
 * `clock` picks the animation moment (0 = the first frame on load).
 */
export async function renderMeshStill(
  params: MeshGradientParams,
  { width, height, scale = 1, clock = 0 }: { width: number; height: number; scale?: number; clock?: number },
): Promise<HTMLCanvasElement> {
  const pw = Math.round(width * scale);
  const ph = Math.round(height * scale);
  const glCanvas = document.createElement('canvas');
  glCanvas.width = pw;
  glCanvas.height = ph;
  const gl = glCanvas.getContext('webgl2', {
    antialias: false,
    alpha: false,
    preserveDrawingBuffer: true,
  });
  if (!gl) throw new Error('WebGL2 unavailable');
  const renderer = createMeshRenderer(gl);
  renderer.draw(params, clock, width, height);

  const out = document.createElement('canvas');
  out.width = pw;
  out.height = ph;
  const ctx = out.getContext('2d')!;
  ctx.drawImage(glCanvas, 0, 0);
  renderer.dispose();
  gl.getExtension('WEBGL_lose_context')?.loseContext();

  if (params.grain > 0) {
    const pattern = ctx.createPattern(await loadNoise(), 'repeat');
    if (pattern) {
      const s = (params.grainSize * scale) / NOISE_TILE;
      pattern.setTransform(new DOMMatrix().scale(s, s));
      ctx.globalAlpha = params.grain;
      ctx.globalCompositeOperation = params.grainBlend === 'normal' ? 'source-over' : params.grainBlend;
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, pw, ph);
    }
  }
  return out;
}
