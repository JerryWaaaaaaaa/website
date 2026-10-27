import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { createMeshRenderer, NOISE_SRC, type MeshGradientParams, type MeshRenderer } from './meshRenderer';
import './MeshGradient.css';

export {
  GRAIN_BLENDS,
  MAX_RAMP,
  MESH_MODES,
  PATCH_COLS,
  PATCH_ROWS,
  type GrainBlend,
  type MeshGradientParams,
  type MeshMode,
  type MeshPatchPoint,
} from './meshRenderer';

const NOISE_URL = `url("${NOISE_SRC}")`;

type Props = {
  params: MeshGradientParams;
  className?: string;
  /** Optional ref to the canvas, e.g. so the ASCII trail can sample its colours. */
  canvasRef?: RefObject<HTMLCanvasElement | null>;
};

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

    let renderer: MeshRenderer;
    try {
      renderer = createMeshRenderer(gl);
    } catch (e) {
      console.warn('Mesh gradient shader failed to compile', e);
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let disposed = false;
    let w = 0;
    let h = 0;
    let clock = 0; // animation time, s (accumulated so speed edits don't jump)
    let lastT = 0;
    let raf = 0;
    let inView = true;

    const draw = () => {
      if (disposed || !w || !h) return;
      renderer.draw(paramsRef.current, clock, w, h);
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
      renderer.dispose();
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
