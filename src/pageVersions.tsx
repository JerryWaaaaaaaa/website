import type { ReactNode } from 'react';
import { Hero } from './sections/Hero';
import { HeroV2 } from './sections/HeroV2';
import { HeroV3 } from './sections/HeroV3';
import { HeroV4 } from './sections/HeroV4';
import { BuiltDifferentiate } from './sections/BuiltDifferentiate';
import { ProductSuite } from './sections/ProductSuite';
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

export type VersionId = 'v1' | 'v2' | 'v3' | 'v4';

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
];

export const DEFAULT_VERSION: VersionId = 'v1';
