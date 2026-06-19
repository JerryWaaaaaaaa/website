import type { ReactNode } from 'react';
import type { VersionId } from './pageVersions';
import { ProductSuiteV5 } from './sections/ProductSuiteV5';
import { ProductSuiteV5B } from './sections/ProductSuiteV5B';
import { BuiltDifferentiateV5A } from './sections/builtDifferentiate/BuiltDifferentiateV5A';
import { BuiltDifferentiateV5C } from './sections/builtDifferentiate/BuiltDifferentiateV5C';
import { BuiltDifferentiateV5D } from './sections/builtDifferentiate/BuiltDifferentiateV5D';

export interface SectionVariant {
  /** Stable id used in the URL param value. */
  id: string;
  /** Short label shown on the dial-kit pill. */
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
    id: 'productSuite',
    label: 'Product Suite',
    defaultId: 'a',
    appliesTo: ['v5'],
    variants: [
      { id: 'a', label: 'Video', render: () => <ProductSuiteV5 /> },
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
