import { HeroV6 } from './HeroV6';
import { ProductStripV6 } from './ProductStripV6';
import { ProductSlideshowV6 } from './ProductSlideshowV6';
import { StoryV6 } from './StoryV6';
import { OpenPlatformV6 } from './OpenPlatformV6';
import { UseCaseV6 } from './UseCaseV6';
import { TemplatesV6 } from './TemplatesV6';
import { CtaV6 } from './CtaV6';
import './v6.css';

/**
 * V6 — "Microsite Stylized" (Figma QDrgl8Mpky2WshHHxnLz8E · 261:72350).
 * Full-bleed hero + product strip, then the 1800px body column of panels.
 * The nav skin (<Nav variant="v6" />) and <FooterV6 /> are wired as this
 * version's chrome in pageVersions.tsx.
 */
export function V6Page() {
  return (
    <div className="v6-page">
      <HeroV6 />
      <ProductStripV6 />
      <div className="v6-body">
        <ProductSlideshowV6 />
        <StoryV6 />
        <OpenPlatformV6 />
        <UseCaseV6 />
        <TemplatesV6 />
        <CtaV6 />
      </div>
    </div>
  );
}
