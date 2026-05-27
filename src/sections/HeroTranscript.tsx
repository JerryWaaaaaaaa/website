import { Fragment, useEffect, useRef } from 'react';

const SPEAKERS = [
  {
    name: 'Claire',
    src: '/avatars/claire.png',
    text: 'Quick recap — we shipped the new dashboard Monday, and signups are up 14%.',
  },
  {
    name: 'Priya',
    src: '/avatars/priya.png',
    text: 'Nice. Should we promote it on the homepage?',
  },
  {
    name: 'Marcus',
    src: '/avatars/marcus.png',
    text: "Yes, let's queue a banner for next sprint.",
  },
  {
    name: 'Mei',
    src: '/avatars/mei.png',
    text: "I'll draft copy and share by Thursday.",
  },
  {
    name: 'Diego',
    src: '/avatars/diego.png',
    text: "Perfect, let's review in standup.",
  },
];

const REPEAT = 4;
const CURVE_D = 'M -101 89 C 134 227 200 60 380 30 C 540 5 660 90 720 230';

export interface HeroTranscriptProps {
  avatarSize?: number;
  avatarGap?: number;
  avatarOffset?: number;
  fontSize?: number;
  ribbonThickness?: number;
  ribbonColor?: string;
  cycleMs?: number;
}

export function HeroTranscript({
  avatarSize = 48,
  avatarGap = 2,
  avatarOffset = 0,
  fontSize = 20,
  ribbonThickness = 58,
  ribbonColor = '#d2def2',
  cycleMs = 30000,
}: HeroTranscriptProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const textPathRef = useRef<SVGTextPathElement | null>(null);
  const measureTextRef = useRef<SVGTextElement | null>(null);
  const avatarLayerRef = useRef<SVGGElement | null>(null);

  const avatarOffsetRef = useRef(avatarOffset);
  avatarOffsetRef.current = avatarOffset;

  useEffect(() => {
    const svg = svgRef.current;
    const path = pathRef.current;
    const textPath = textPathRef.current;
    const measure = measureTextRef.current;
    const layer = avatarLayerRef.current;
    if (!svg || !path || !textPath || !measure || !layer) return;

    // Measure each quote's rendered width on the path. The trailing em-space
    // in the measured string matches the trailing em-space inside each rendered
    // <tspan>, so the loop period along the path equals the sum of these widths.
    const quoteWidths = SPEAKERS.map((s) => {
      measure.textContent = `\u201C${s.text}\u201D\u2003`;
      return measure.getComputedTextLength();
    });
    measure.textContent = '';

    const W = quoteWidths.reduce((a, b) => a + b, 0);

    // Cumulative start position per (rep, speaker) — the arc length where
    // that speaker's avatar should anchor (start of their quote).
    const offsets: number[] = [];
    for (let rep = 0; rep < REPEAT; rep++) {
      let acc = rep * W;
      for (let i = 0; i < SPEAKERS.length; i++) {
        offsets.push(acc);
        acc += quoteWidths[i];
      }
    }

    const pathLen = path.getTotalLength();
    const images = Array.from(layer.querySelectorAll('image'));
    const start = performance.now();
    let raf = 0;

    // Avatars float just outside the ribbon edge along the local normal.
    // Sides alternate by global avatar index for a uniform rhythm across
    // the REPEAT-copy seam.
    const baseMagnitude = ribbonThickness / 2 + avatarGap;

    const tick = (now: number) => {
      const t = ((now - start) % cycleMs) / cycleMs;
      const currentOffset = -W + t * W;

      textPath.setAttribute('startOffset', String(currentOffset));

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const arc = currentOffset + offsets[i];
        if (arc < 0 || arc > pathLen) {
          img.style.visibility = 'hidden';
          continue;
        }
        const side = i % 2 === 0 ? -1 : 1;
        const off = side * (baseMagnitude + avatarOffsetRef.current);

        const pt = path.getPointAtLength(arc);

        // Sample tangent by two nearby points; rotate 90deg for the normal.
        const a = Math.max(0, arc - 0.5);
        const b = Math.min(pathLen, arc + 0.5);
        const p0 = path.getPointAtLength(a);
        const p1 = path.getPointAtLength(b);
        const tx = p1.x - p0.x;
        const ty = p1.y - p0.y;
        const len = Math.hypot(tx, ty) || 1;
        const nx = -ty / len;
        const ny = tx / len;

        const cx = pt.x + nx * off;
        const cy = pt.y + ny * off;

        img.setAttribute(
          'transform',
          `translate(${cx - avatarSize / 2}, ${cy - avatarSize / 2})`,
        );
        img.style.visibility = 'visible';
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [avatarSize, avatarGap, ribbonThickness, fontSize, cycleMs]);

  const textStyle = {
    fontFamily: "'General Sans', sans-serif",
    fontStyle: 'normal' as const,
    fontWeight: 400,
    fontSize,
    fill: 'var(--text-primary)',
  };

  return (
    <div className="hero-transcript" aria-hidden="true">
      <svg viewBox="0 -30 1440 290" ref={svgRef}>
        <defs>
          <path ref={pathRef} id="hero-transcript-curve" d={CURVE_D} fill="none" />
          <clipPath id="hero-avatar-clip">
            <circle cx={avatarSize / 2} cy={avatarSize / 2} r={avatarSize / 2} />
          </clipPath>
        </defs>
        {/* Ribbon background */}
        <path
          d={CURVE_D}
          fill="none"
          stroke={ribbonColor}
          strokeWidth={ribbonThickness}
          strokeLinecap="butt"
        />
        {/* Animated text on path — startOffset driven by rAF in useEffect */}
        <text style={textStyle}>
          <textPath ref={textPathRef} href="#hero-transcript-curve" startOffset={0}>
            {Array.from({ length: REPEAT }).map((_, rep) => (
              <Fragment key={rep}>
                {SPEAKERS.map((s, i) => (
                  <tspan key={i}>{`\u201C${s.text}\u201D\u2003`}</tspan>
                ))}
              </Fragment>
            ))}
          </textPath>
        </text>
        {/* Off-screen text node used once on mount to measure segment widths */}
        <text
          ref={measureTextRef}
          style={{ ...textStyle, visibility: 'hidden' }}
          x={-99999}
          y={-99999}
        />
        {/* Avatars — one <image> per (repetition, speaker), positioned per frame */}
        <g ref={avatarLayerRef}>
          {Array.from({ length: REPEAT }).flatMap((_, rep) =>
            SPEAKERS.map((s, i) => (
              <image
                key={`${rep}-${i}`}
                href={s.src}
                width={avatarSize}
                height={avatarSize}
                clipPath="url(#hero-avatar-clip)"
                style={{ visibility: 'hidden' }}
              />
            )),
          )}
        </g>
      </svg>
    </div>
  );
}
