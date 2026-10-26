import { useEffect, useRef, useState } from 'react';
import { AgentCta } from './AgentCta';
import { ProductBrowser, ProductChip, useProductRotation } from './HeroProducts';
import { HalftoneImage, type HalftoneParams, type ImagePlacement } from './halftone/HalftoneImage';
import { AsciiTrail } from './halftone/AsciiTrail';
import { useShaderDials } from './halftone/useShaderDials';
import { MeshGradient } from './mesh/MeshGradient';
import { V6_MESH_DIALS } from './mesh/meshPreset';
import { useMeshDials } from './mesh/useMeshDials';
import { useCardDrag } from './useCardDrag';
import './HeroV6.css';

// Figma renders the halftone on the 1237 px-wide photo; the hero frame is 2200.
const PHOTO_TO_FRAME = 2200 / 1237;

// Figma 191:60298 effect stack: "Gradient map" then "Halftone". dotSize spec is
// 5.5 photo px, tuned to 1 (the Dot Size dial reads in photo px).
const HERO_HALFTONE: HalftoneParams = {
  gradient: [
    { position: 0.427885, color: [0.798963, 0.734289, 0.978929, 1] },
    { position: 0.581731, color: [0.27451, 0.454902, 0.811765, 1] },
    { position: 0.716346, color: [0.839216, 0.898039, 0.992157, 1] },
    { position: 1, color: [0.370106, 0.798747, 0.770178, 1] },
  ],
  dotSize: 1 * PHOTO_TO_FRAME,
  dotScale: 1,
  softness: 1,
  rotation: 0,
  rotationSpeed: 0.4, // deg/s — kept very subtle
  center: [50, 50],
};
const HERO_DIALS = { params: HERO_HALFTONE, dotSizeUnit: PHOTO_TO_FRAME };

// The portrait photo inside "image-bg" (606:45465): a 2200 × 1428 box that
// starts at the top of the 1361-tall hero and runs 67px past its bottom edge.
const HERO_PLACEMENT: ImagePlacement = {
  frame: [2200, 1428],
  left: 0,
  top: -74.54,
  width: 100,
  height: 204.5,
  scaleDots: true,
};

/** Halftone photo + glyph trail (the Figma build). */
function HeroHalftoneBg() {
  const { params, ascii, asciiOn } = useShaderDials('Hero shader', HERO_DIALS);
  return (
    <>
      <HalftoneImage
        className="v6-hero-bg"
        src="/v6/hero/source.webp"
        fallbackSrc="/v6/hero/bg.webp"
        params={params}
        placement={HERO_PLACEMENT}
      />
      {asciiOn && <AsciiTrail params={ascii} />}
    </>
  );
}

/** Drifting mesh gradient + tiled trail. */
function HeroMeshBg() {
  const { mesh, ascii, asciiOn } = useMeshDials('Hero mesh', V6_MESH_DIALS);
  // The trail's tiles sample the mesh under them ("background" palette).
  const meshRef = useRef<HTMLCanvasElement | null>(null);
  return (
    <>
      <MeshGradient className="v6-hero-mesh" params={mesh} canvasRef={meshRef} />
      {asciiOn && <AsciiTrail params={ascii} colorSource={meshRef} />}
    </>
  );
}

// meeting-floating.mp4 (the V5 hero's meeting video) is three 16:9 speaker
// tiles stacked in one portrait frame; the self view crops to one tile at a
// time and cuts between them like Zoom's active-speaker view.
const SPEAKER_CROPS = ['0%', '50%', '100%'];
const SPEAKER_MS = 3200;

/**
 * V6 hero (Figma 606:45464): chip headline over a halftone photo + product UI.
 * As in V5, the product name in the headline loops through the suite and the
 * browser frame's URL + product UI follow it on one clock.
 * The background is the Figma halftone rebuilt in WebGL, slowly rotating, with
 * an ASCII heat trail following the cursor on desktop; the exported render
 * (bg.webp) is the fallback. The meeting self view can be dragged around the
 * hero on desktop; its video cuts between three speakers.
 * `background="mesh"` swaps the halftone for a drifting brand mesh gradient
 * and the trail for coloured tiles with white letters.
 */
export function HeroV6({ background = 'halftone' }: { background?: 'halftone' | 'mesh' }) {
  const product = useProductRotation();
  const heroRef = useRef<HTMLElement | null>(null);
  const drag = useCardDrag(heroRef, '(min-width: 640px) and (pointer: fine)');
  const [speaker, setSpeaker] = useState(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setSpeaker((s) => (s + 1) % SPEAKER_CROPS.length),
      SPEAKER_MS,
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="v6-hero" aria-labelledby="v6-hero-title" ref={heroRef}>
      {background === 'mesh' ? <HeroMeshBg /> : <HeroHalftoneBg />}

      <div className="v6-hero-copy">
        <h1 className="v6-chips v6-hero-title" id="v6-hero-title">
          <span className="v6-chips-row">
            <span className="v6-chip-line v6-chip-line--blue">You just talk</span>
          </span>
          <span className="v6-chips-row">
            <span className="v6-chip-line v6-chip-line--pink">AI builds you</span>
            <ProductChip index={product} />
          </span>
        </h1>

        <div className="v6-glass-card v6-hero-tagline">
          <p>AI meeting flow handles all the meeting grunt work, so you can focus on what really matters</p>
          <AgentCta media="orb">Get started for free</AgentCta>
        </div>
      </div>

      <div className="v6-hero-ui">
        <ProductBrowser index={product} />

        <div
          className="v6-selfview"
          aria-hidden="true"
          data-card="selfview"
          onPointerDown={drag.onPointerDown}
        >
          <div className="v6-selfview-bar">
            <span className="v6-selfview-layouts">
              <span className="v6-layout v6-layout--strip" />
              <span className="v6-layout v6-layout--wide" />
              <span className="v6-layout v6-layout--split" />
              <img className="v6-layout" src="/v6/hero/layout-grid.svg" alt="" draggable={false} />
            </span>
            <img className="v6-layout" src="/v6/hero/resize.svg" alt="" draggable={false} />
          </div>
          <div className="v6-selfview-video">
            <video
              src="/hero-may-images/meeting-floating.mp4"
              style={{ objectPosition: `50% ${SPEAKER_CROPS[speaker]}` }}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
