import { useEffect, useRef, useState } from 'react';
import { BLUR_FRAG, GRADIENT_MAP_FRAG, HALFTONE_FRAG, QUAD_VERT } from './halftoneShaders';
import './HalftoneImage.css';

export type GradientStop = { position: number; color: [number, number, number, number] };

export type HalftoneParams = {
  gradient: GradientStop[];
  dotSize: number;
  dotScale: number;
  softness: number;
  /** Degrees. */
  rotation: number;
  /** Grid origin as % of the canvas. */
  center: [number, number];
};

/**
 * Where the source image sits inside the Figma frame, as % of that frame — the
 * numbers Figma emits for the shader's child image (left / top / width /
 * height). The frame itself is cover-fitted to the canvas, so the crop holds
 * at any aspect ratio instead of stretching.
 */
export type ImagePlacement = {
  frame: [number, number];
  left: number;
  top: number;
  width: number;
  height: number;
};

type Props = {
  src: string;
  /** Pre-rendered export shown until the first frame draws, or when WebGL is unavailable. */
  fallbackSrc: string;
  params: HalftoneParams;
  placement: ImagePlacement;
  /** Swell the dots around the cursor (desktop pointers only, off for reduced motion). */
  interactive?: boolean;
  className?: string;
};

const MAX_DPR = 2;
const POINTER_RADIUS = 180; // CSS px
const POINTER_BOOST = 0.6; // dots grow up to 1.6× at the cursor
const EASE_MS = 140; // time constant for the strength easing in / out

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
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? 'link');
  return p;
}

function makeTarget(gl: GL, w: number, h: number) {
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const fbo = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  return { tex, fbo };
}

/**
 * WebGL port of the Figma "Gradient map → Halftone" effect stack, applied to a
 * photo. The static image (gradient map + blur) is computed once per size; the
 * halftone pass is redrawn on resize and — when interactive — only inside a
 * scissor box around the cursor, so moving the mouse costs a small patch.
 */
export function HalftoneImage({ src, fallbackSrc, params, placement, interactive = false, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl2', {
      premultipliedAlpha: true,
      antialias: false,
      // Partial (scissored) redraws need the previous frame to persist.
      preserveDrawingBuffer: true,
    });
    if (!gl) return; // fallback image stays visible

    let disposed = false;
    let raf = 0;
    let programs: { grad: WebGLProgram; blur: WebGLProgram; half: WebGLProgram };
    try {
      programs = {
        grad: compile(gl, QUAD_VERT, GRADIENT_MAP_FRAG),
        blur: compile(gl, QUAD_VERT, BLUR_FRAG),
        half: compile(gl, QUAD_VERT, HALFTONE_FRAG),
      };
    } catch (e) {
      console.warn('Halftone shader failed to compile', e);
      return;
    }

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const sourceTex = gl.createTexture();
    let image: HTMLImageElement | null = null;
    let targets: ReturnType<typeof makeTarget>[] = [];
    let size = { w: 0, h: 0, pw: 0, ph: 0, dpr: 1 };

    // Pointer state (CSS px, relative to the canvas).
    const pointer = { x: -9999, y: -9999, strength: 0, target: 0 };
    let lastBox: [number, number, number, number] | null = null;

    const u = (p: WebGLProgram, name: string) => gl.getUniformLocation(p, name);

    /** Rasterise the photo into the canvas box exactly as Figma places it. */
    const uploadSource = () => {
      if (!image) return;
      const off = document.createElement('canvas');
      off.width = size.pw;
      off.height = size.ph;
      const ctx = off.getContext('2d')!;
      const [fw, fh] = placement.frame;
      const k = Math.max(size.pw / fw, size.ph / fh);
      const fx = (size.pw - fw * k) / 2;
      const fy = (size.ph - fh * k) / 2;
      ctx.drawImage(
        image,
        fx + (placement.left / 100) * fw * k,
        fy + (placement.top / 100) * fh * k,
        (placement.width / 100) * fw * k,
        (placement.height / 100) * fh * k,
      );
      gl.bindTexture(gl.TEXTURE_2D, sourceTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, off);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    };

    /** Gradient map + separable blur into offscreen targets (once per size). */
    const prepare = () => {
      const p = paramsRef.current;
      targets.forEach((t) => {
        gl.deleteTexture(t.tex);
        gl.deleteFramebuffer(t.fbo);
      });
      targets = [0, 1, 2].map(() => makeTarget(gl, size.pw, size.ph));
      gl.viewport(0, 0, size.pw, size.ph);
      gl.disable(gl.SCISSOR_TEST);

      // 1. Gradient map: source -> targets[0]
      gl.useProgram(programs.grad);
      gl.bindFramebuffer(gl.FRAMEBUFFER, targets[0].fbo);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, sourceTex);
      gl.uniform1i(u(programs.grad, 'u_input'), 0);
      const stops = p.gradient.slice(0, 8);
      const colors = new Float32Array(32);
      const positions = new Float32Array(8);
      stops.forEach((s, i) => {
        colors.set(s.color, i * 4);
        positions[i] = s.position;
      });
      gl.uniform4fv(u(programs.grad, 'u_colors'), colors);
      gl.uniform1fv(u(programs.grad, 'u_positions'), positions);
      gl.uniform1i(u(programs.grad, 'u_count'), stops.length);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // 2. Blur H: targets[0] -> targets[1]; 3. Blur V: targets[1] -> targets[2].
      // Radius matches Figma: dotSize, in device texels.
      gl.useProgram(programs.blur);
      gl.uniform1i(u(programs.blur, 'u_input'), 0);
      gl.uniform1f(u(programs.blur, 'u_radius'), p.dotSize);
      gl.bindFramebuffer(gl.FRAMEBUFFER, targets[1].fbo);
      gl.bindTexture(gl.TEXTURE_2D, targets[0].tex);
      gl.uniform2f(u(programs.blur, 'u_dir'), 1, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.bindFramebuffer(gl.FRAMEBUFFER, targets[2].fbo);
      gl.bindTexture(gl.TEXTURE_2D, targets[1].tex);
      gl.uniform2f(u(programs.blur, 'u_dir'), 0, 1);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    /** Halftone pass to the canvas; optionally limited to a CSS-px box. */
    const drawHalftone = (box?: [number, number, number, number]) => {
      const p = paramsRef.current;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, size.pw, size.ph);
      if (box) {
        const [x0, y0, x1, y1] = box;
        if (x1 <= x0 || y1 <= y0) return;
        const d = size.dpr;
        gl.enable(gl.SCISSOR_TEST);
        gl.scissor(
          Math.floor(x0 * d),
          Math.floor(size.ph - y1 * d),
          Math.ceil((x1 - x0) * d),
          Math.ceil((y1 - y0) * d),
        );
      } else {
        gl.disable(gl.SCISSOR_TEST);
      }
      const h = programs.half;
      gl.useProgram(h);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, targets[2].tex);
      gl.uniform1i(u(h, 'u_blurred'), 0);
      gl.uniform2f(u(h, 'u_dims'), size.w, size.h);
      gl.uniform2f(u(h, 'u_center'), (p.center[0] / 100) * size.w, (p.center[1] / 100) * size.h);
      gl.uniform1f(u(h, 'u_dotSize'), p.dotSize);
      gl.uniform1f(u(h, 'u_dotScale'), p.dotScale);
      gl.uniform1f(u(h, 'u_softness'), p.softness);
      gl.uniform1f(u(h, 'u_rotation'), (p.rotation * Math.PI) / 180);
      gl.uniform2f(u(h, 'u_pointer'), pointer.x, pointer.y);
      gl.uniform1f(u(h, 'u_pointerStrength'), pointer.strength);
      gl.uniform1f(u(h, 'u_pointerRadius'), POINTER_RADIUS);
      gl.uniform1f(u(h, 'u_pointerBoost'), POINTER_BOOST);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const fullRender = () => {
      if (!image || !size.pw) return;
      uploadSource();
      prepare();
      drawHalftone();
      if (!disposed) setReady(true);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      const pw = Math.round(w * dpr);
      const ph = Math.round(h * dpr);
      if (pw === size.pw && ph === size.ph) return;
      canvas.width = pw;
      canvas.height = ph;
      size = { w, h, pw, ph, dpr };
      fullRender();
    };

    // --- Cursor interaction -------------------------------------------------
    // Listen on the surrounding section: the effect layer itself sits under
    // the content with pointer-events: none so the CTA stays clickable.
    const host = canvas.closest('section') ?? canvas.parentElement;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const live = interactive && canHover && !reduceMotion && host != null;
    let inView = true;

    // Box (CSS px) the cursor effect can touch, padded for neighbour dots.
    const boxAround = (x: number, y: number): [number, number, number, number] => {
      const r = POINTER_RADIUS + paramsRef.current.dotSize * 3;
      return [Math.max(0, x - r), Math.max(0, y - r), Math.min(size.w, x + r), Math.min(size.h, y + r)];
    };
    const union = (
      a: [number, number, number, number],
      b: [number, number, number, number] | null,
    ): [number, number, number, number] =>
      b ? [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])] : a;

    let lastT = 0;
    const tick = (t: number) => {
      raf = 0;
      const dt = lastT ? Math.min(t - lastT, 64) : 16;
      lastT = t;
      if (disposed || !targets.length) return;
      // Nothing to animate until the cursor has entered at least once.
      if (pointer.target === 0 && pointer.strength === 0 && !lastBox) return;
      // Frame-rate independent ease toward the target strength.
      pointer.strength += (pointer.target - pointer.strength) * (1 - Math.exp(-dt / EASE_MS));
      if (Math.abs(pointer.target - pointer.strength) < 0.01) pointer.strength = pointer.target;
      const box = boxAround(pointer.x, pointer.y);
      // Redraw where the effect was last frame as well as where it is now, so
      // dots the cursor just left settle back to the spec size.
      drawHalftone(union(box, lastBox));
      lastBox = pointer.strength > 0 ? box : null;
      if (pointer.strength !== pointer.target) schedule();
      else lastT = 0;
    };
    const schedule = () => {
      if (!raf && inView) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.target = 1;
      schedule();
    };
    const onLeave = () => {
      pointer.target = 0;
      schedule();
    };

    let io: IntersectionObserver | null = null;
    if (live) {
      host.addEventListener('pointermove', onMove, { passive: true });
      host.addEventListener('pointerleave', onLeave, { passive: true });
      io = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        if (inView) schedule();
      });
      io.observe(canvas);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      if (disposed) return;
      image = img;
      size = { w: 0, h: 0, pw: 0, ph: 0, dpr: 1 };
      resize();
    };
    img.src = src;

    const onLost = (e: Event) => {
      e.preventDefault();
      setReady(false);
    };
    canvas.addEventListener('webglcontextlost', onLost);

    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io?.disconnect();
      if (live) {
        host.removeEventListener('pointermove', onMove);
        host.removeEventListener('pointerleave', onLeave);
      }
      canvas.removeEventListener('webglcontextlost', onLost);
      targets.forEach((t) => {
        gl.deleteTexture(t.tex);
        gl.deleteFramebuffer(t.fbo);
      });
      gl.deleteTexture(sourceTex);
      gl.deleteBuffer(quad);
      Object.values(programs).forEach((p) => gl.deleteProgram(p));
    };
      // params/placement are static per caller (module-level constants), so the
    // GL setup only re-runs when the image or interactivity changes.
  }, [src, interactive]);

  return (
    <div className={`v6-halftone${className ? ` ${className}` : ''}`} aria-hidden="true">
      <img className="v6-halftone-fallback" src={fallbackSrc} alt="" />
      <canvas ref={canvasRef} className="v6-halftone-canvas" data-ready={ready ? 'true' : 'false'} />
    </div>
  );
}
