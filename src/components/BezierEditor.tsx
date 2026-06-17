import { useCallback, useRef } from 'react';

interface BezierEditorProps {
  /** A CSS `cubic-bezier(x1, y1, x2, y2)` string. */
  value: string;
  onChange: (next: string) => void;
}

const PRESETS: { label: string; value: string }[] = [
  { label: 'Standard', value: 'cubic-bezier(0.4, 0, 0.2, 1)' },
  { label: 'Ease-out', value: 'cubic-bezier(0, 0, 0.58, 1)' },
  { label: 'Ease-in-out', value: 'cubic-bezier(0.42, 0, 0.58, 1)' },
  { label: 'Linear', value: 'cubic-bezier(0, 0, 1, 1)' },
  { label: 'Snappy', value: 'cubic-bezier(0.22, 1, 0.36, 1)' },
];

// SVG geometry: a SIZE x SIZE plot with PAD padding. The curve runs from the
// bottom-left anchor (0,0) to the top-right anchor (1,1).
const SIZE = 200;
const PAD = 28;
const PLOT = SIZE - PAD * 2;

// Allow horizontal handles only within [0,1]; let vertical overshoot a little
// past the track so springy curves (y > 1 or y < 0) are reachable.
const Y_MIN = -0.5;
const Y_MAX = 1.5;

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const round2 = (n: number) => Math.round(n * 100) / 100;

function parse(value: string): [number, number, number, number] {
  const match = value.match(/cubic-bezier\(([^)]+)\)/);
  if (match) {
    const parts = match[1].split(',').map((p) => Number(p.trim()));
    if (parts.length === 4 && parts.every((n) => !Number.isNaN(n))) {
      return parts as [number, number, number, number];
    }
  }
  return [0.42, 0, 0.58, 1];
}

// Bezier (0..1) coordinates to SVG pixel coordinates. SVG y grows downward, so
// invert: progress 0 sits at the bottom, progress 1 at the top.
const toX = (x: number) => PAD + x * PLOT;
const toY = (y: number) => PAD + (1 - y) * PLOT;

export function BezierEditor({ value, onChange }: BezierEditorProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef<1 | 2 | null>(null);
  const [x1, y1, x2, y2] = parse(value);

  const emit = useCallback(
    (nx1: number, ny1: number, nx2: number, ny2: number) => {
      onChange(`cubic-bezier(${round2(nx1)}, ${round2(ny1)}, ${round2(nx2)}, ${round2(ny2)})`);
    },
    [onChange]
  );

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      const which = dragging.current;
      if (!svg || !which) return;
      const rect = svg.getBoundingClientRect();
      // Map pixel position back into bezier coordinate space.
      const px = ((clientX - rect.left) / rect.width) * SIZE;
      const py = ((clientY - rect.top) / rect.height) * SIZE;
      const bx = clamp((px - PAD) / PLOT, 0, 1);
      const by = clamp(1 - (py - PAD) / PLOT, Y_MIN, Y_MAX);
      if (which === 1) emit(bx, by, x2, y2);
      else emit(x1, y1, bx, by);
    },
    [emit, x1, y1, x2, y2]
  );

  const onPointerDown = (which: 1 | 2) => (e: React.PointerEvent) => {
    e.preventDefault();
    dragging.current = which;
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (dragging.current) handleMove(e.clientX, e.clientY);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    dragging.current = null;
    try {
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch {
      /* capture may already be released */
    }
  };

  const curve = `M ${toX(0)} ${toY(0)} C ${toX(x1)} ${toY(y1)} ${toX(x2)} ${toY(y2)} ${toX(1)} ${toY(1)}`;

  return (
    <div className="be-root">
      <div className="be-presets">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            className={`be-chip${p.value === value ? ' is-active' : ''}`}
            onClick={() => onChange(p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <svg
        ref={svgRef}
        className="be-canvas"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {/* Plot frame + diagonal reference (linear). */}
        <rect className="be-plot" x={PAD} y={PAD} width={PLOT} height={PLOT} rx={6} />
        <line className="be-diagonal" x1={toX(0)} y1={toY(0)} x2={toX(1)} y2={toY(1)} />

        {/* Handle leashes. */}
        <line className="be-leash" x1={toX(0)} y1={toY(0)} x2={toX(x1)} y2={toY(y1)} />
        <line className="be-leash" x1={toX(1)} y1={toY(1)} x2={toX(x2)} y2={toY(y2)} />

        {/* The easing curve. */}
        <path className="be-curve" d={curve} fill="none" />

        {/* Draggable control points. */}
        <circle
          className="be-handle"
          cx={toX(x1)}
          cy={toY(y1)}
          r={7}
          onPointerDown={onPointerDown(1)}
        />
        <circle
          className="be-handle"
          cx={toX(x2)}
          cy={toY(y2)}
          r={7}
          onPointerDown={onPointerDown(2)}
        />
      </svg>

      <code className="be-value">{`cubic-bezier(${round2(x1)}, ${round2(y1)}, ${round2(x2)}, ${round2(y2)})`}</code>
    </div>
  );
}
