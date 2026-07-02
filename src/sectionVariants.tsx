import type { ReactNode } from 'react';
import type { VersionId } from './pageVersions';
import { HeroV2 } from './sections/HeroV2';
import { HeroV4 } from './sections/HeroV4';
import { HeroV5 } from './sections/HeroV5';
import { HeroV5B } from './sections/HeroV5B';
import { ProductSuiteV5 } from './sections/ProductSuiteV5';
import { ProductSuiteV5B } from './sections/ProductSuiteV5B';
import { ProductSuiteV5C } from './sections/ProductSuiteV5C';
import { ProductSuiteV5D } from './sections/ProductSuiteV5D';
import { BuiltDifferentiateV5A } from './sections/builtDifferentiate/BuiltDifferentiateV5A';
import { BuiltDifferentiateV5C } from './sections/builtDifferentiate/BuiltDifferentiateV5C';
import { BuiltDifferentiateV5D } from './sections/builtDifferentiate/BuiltDifferentiateV5D';

export interface SectionVariant {
  /** Stable id used as the dialkit select option value. */
  id: string;
  /** Short label shown in the dialkit select. */
  label: string;
  render: () => ReactNode;
}

export interface SectionVariantGroup {
  /** URL search-param key, e.g. 'productSuite'. */
  id: string;
  /** Group label shown in the dial kit. */
  label: string;
  /** Variant rendered when no (valid) param is present. */
  defaultId: string;
  /**
   * Page versions whose render() mounts this group's slot. The dial kit only
   * shows the group on those versions; undefined means "always".
   */
  appliesTo?: VersionId[];
  variants: SectionVariant[];
}

export const SECTION_VARIANT_GROUPS: SectionVariantGroup[] = [
  {
    id: 'hero',
    label: 'Hero',
    defaultId: 'b',
    appliesTo: ['v5'],
    variants: [
      { id: 'a', label: 'Flat', render: () => <HeroV5 /> },
      { id: 'b', label: 'Grouped', render: () => <HeroV5B /> },
      { id: 'c', label: 'V2', render: () => <HeroV2 showTuner={false} /> },
      { id: 'd', label: 'V4', render: () => <HeroV4 /> },
    ],
  },
  {
    id: 'productSuite',
    label: 'Product Suite',
    defaultId: 'd',
    appliesTo: ['v5'],
    variants: [
      { id: 'd', label: 'Tab bar', render: () => <ProductSuiteV5D /> },
      { id: 'c', label: 'Slider', render: () => <ProductSuiteV5C /> },
      { id: 'a', label: 'Carousel', render: () => <ProductSuiteV5 /> },
      { id: 'b', label: 'Product UI', render: () => <ProductSuiteV5B /> },
    ],
  },
  {
    id: 'builtDifferentiate',
    label: 'Built Different',
    defaultId: 'a',
    appliesTo: ['v5'],
    variants: [
      { id: 'a', label: 'Scroll', render: () => <BuiltDifferentiateV5A /> },
      { id: 'c', label: 'Zigzag', render: () => <BuiltDifferentiateV5C /> },
      { id: 'd', label: 'Pinned carousel', render: () => <BuiltDifferentiateV5D /> },
    ],
  },
];
