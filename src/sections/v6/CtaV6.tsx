import { useRef } from 'react';
import { AgentCta } from './AgentCta';
import { AsciiTrail } from './halftone/AsciiTrail';
import { HalftoneImage, type HalftoneParams, type ImagePlacement } from './halftone/HalftoneImage';
import { useShaderDials } from './halftone/useShaderDials';
import { MeshGradient } from './mesh/MeshGradient';
import { V6_MESH_DIALS } from './mesh/meshPreset';
import { useMeshDials } from './mesh/useMeshDials';
import './CtaV6.css';

// Figma 260:56525 effect stack: "Gradient map" then "Halftone" (values as exported).
const CTA_HALFTONE: HalftoneParams = {
  gradient: [
    { position: 0, color: [0.12549, 0.258824, 0.560784, 1] },
    { position: 0.591346, color: [0.27451, 0.454902, 0.811765, 1] },
    { position: 0.6875, color: [0.839216, 0.898039, 0.992157, 1] },
    { position: 0.754808, color: [0.798963, 0.734289, 0.978929, 1] },
    { position: 1, color: [0.533004, 0.875131, 0.852323, 1] },
  ],
  dotSize: 2.6, // spec 5.5, tuned
  dotScale: 1,
  softness: 1,
  rotation: 0,
  rotationSpeed: 0.7, // deg/s — subtle loop
  center: [50, 50],
};

// The photo's box inside the 1800 × 941 frame (Figma "image 1011").
const CTA_PLACEMENT: ImagePlacement = {
  frame: [1800, 941],
  left: 0.01,
  top: -25.95,
  width: 110.11,
  height: 158.65,
};

const CTA_DIALS = { params: CTA_HALFTONE };

function CtaHalftoneBg() {
  const { params, ascii, asciiOn } = useShaderDials('CTA shader', CTA_DIALS);
  return (
    <>
      <HalftoneImage
        className="v6-cta-bg"
        src="/v6/cta/source.webp"
        fallbackSrc="/v6/cta/bg.webp"
        params={params}
        placement={CTA_PLACEMENT}
      />
      {asciiOn && <AsciiTrail params={ascii} />}
    </>
  );
}

function CtaMeshBg() {
  const { mesh, ascii, asciiOn } = useMeshDials('CTA mesh', V6_MESH_DIALS);
  // The trail's tiles sample the mesh under them ("background" palette).
  const meshRef = useRef<HTMLCanvasElement | null>(null);
  return (
    <>
      <MeshGradient className="v6-cta-bg" params={mesh} canvasRef={meshRef} />
      {asciiOn && <AsciiTrail params={ascii} colorSource={meshRef} />}
    </>
  );
}

/**
 * V6 closing CTA (Figma 607:45685; shader + photo placement as 260:56524;
 * headline + tagline card per 661:29171). The background is the Figma halftone shader
 * rebuilt in WebGL with the hero's ASCII heat trail following the cursor on
 * desktop. The exported render (bg.webp) is the fallback.
 * `background="mesh"` swaps in the drifting brand mesh + tiled trail.
 */
export function CtaV6({ background = 'halftone' }: { background?: 'halftone' | 'mesh' }) {
  return (
    <section className="v6-panel v6-cta" aria-labelledby="v6-cta-title">
      {background === 'mesh' ? <CtaMeshBg /> : <CtaHalftoneBg />}
      <div className="v6-cta-copy">
        <h2 className="v6-chips v6-cta-title" id="v6-cta-title">
          <span className="v6-chips-row">
            <span className="v6-chip-line v6-chip-line--blue">Cut the busywork,</span>
          </span>
          <span className="v6-chips-row">
            <span className="v6-chip-line v6-chip-line--pink">keep the hours</span>
          </span>
        </h2>
        <div className="v6-glass-card v6-cta-tagline">
          <p>Join 10,000+ top performers from 100+ customers who’ve transformed their meeting flow</p>
          <AgentCta media="orb">Get started for free</AgentCta>
        </div>
      </div>
    </section>
  );
}
