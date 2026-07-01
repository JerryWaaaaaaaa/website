import type { ReactNode } from 'react';
import { Hero } from './sections/Hero';
import { HeroV2 } from './sections/HeroV2';
import { HeroV3 } from './sections/HeroV3';
import { HeroV4 } from './sections/HeroV4';
import { BuiltDifferentiate } from './sections/BuiltDifferentiate';
import { OpenPlatformV5 } from './sections/OpenPlatformV5';
import { UseCaseV5B } from './sections/useCaseV5/UseCaseV5B';
import { PricingV5 } from './sections/pricingV5/PricingV5';
import { ProductSuite } from './sections/ProductSuite';
import { SectionVariantSlot } from './components/SectionVariantSlot';
import { BuiltUnique } from './sections/BuiltUnique';
import { OpenPlatform } from './sections/OpenPlatform';
import { UseCase } from './sections/UseCase';
// import { MeetingDoc } from './sections/MeetingDoc';
// import { Flow } from './sections/Flow';
// import { FromConversation } from './sections/FromConversation';
// import { OneMeetingOneDoc } from './sections/OneMeetingOneDoc';
// import { ProductTabs } from './sections/ProductTabs';
// import { WhyChoose } from './sections/WhyChoose';
// import { Personas } from './sections/Personas';
// import { Templates } from './sections/Templates';
// import { FinalCTA } from './sections/FinalCTA';

export type VersionId = 'v1' | 'v2' | 'v3' | 'v4' | 'v5';

export interface PageVersion {
  id: VersionId;
  label: string;
  render: () => ReactNode;
}

const sharedSections = (
  <>
    <ProductSuite />
    <BuiltUnique />
    <OpenPlatform />
    <UseCase />
    {/* <MeetingDoc /> */}
    {/* <Flow /> */}
    {/* <FromConversation /> */}
    {/* <OneMeetingOneDoc /> */}
    {/* <ProductTabs /> */}
    {/* <WhyChoose /> */}
    {/* <Personas /> */}
    {/* <Templates /> */}
    {/* <FinalCTA /> */}
  </>
);

export const PAGE_VERSIONS: PageVersion[] = [
  {
    id: 'v1',
    label: 'V1',
    render: () => (
      <>
        <Hero />
        {sharedSections}
      </>
    ),
  },
  {
    id: 'v2',
    label: 'V2',
    render: () => (
      <>
        <HeroV2 />
        {sharedSections}
      </>
    ),
  },
  {
    id: 'v3',
    label: 'V3',
    render: () => (
      <>
        <HeroV3 />
        {sharedSections}
      </>
    ),
  },
  {
    id: 'v4',
    label: 'V4',
    // v4 is built from scratch and renders only the new hero + sections.
    render: () => (
      <>
        <HeroV4 />
        <BuiltDifferentiate />
        <OpenPlatform />
        <UseCase />
      </>
    ),
  },
  {
    id: 'v5',
    label: 'V5',
    // v5 is a full independent duplicate of v4 with its own section copies.
    render: () => (
      <>
        <SectionVariantSlot groupId="hero" />
        <SectionVariantSlot groupId="productSuite" />
        <SectionVariantSlot groupId="builtDifferentiate" />
        <OpenPlatformV5 />
        <UseCaseV5B />
        <PricingV5 />
      </>
    ),
  },
];

export const DEFAULT_VERSION: VersionId = 'v5';
