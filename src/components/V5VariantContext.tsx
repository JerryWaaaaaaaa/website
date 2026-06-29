import { createContext, useContext, useRef, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDialKit, type DialConfig } from 'dialkit';
import { PAGE_VERSIONS, DEFAULT_VERSION, type VersionId } from '../pageVersions';
import { SECTION_VARIANT_GROUPS } from '../sectionVariants';
import { useDialUrlSync } from './dialUrlSync';

// Maps a SectionVariantGroup id -> the currently selected variant id.
type VariantSelection = Record<string, string>;

const VariantSelectionContext = createContext<VariantSelection>({});

/** Selected variant id for a group, or undefined to fall back to its defaultId. */
export function useSelectedVariant(groupId: string): string | undefined {
  return useContext(VariantSelectionContext)[groupId];
}

// Registers a dialkit "Sections" panel with one select per variant group that
// applies to the active page version, and exposes the selections through context
// so SectionVariantSlot can render the chosen variant. The page only re-renders
// on a deliberate variant swap.
export function V5VariantProvider({ children }: { children: ReactNode }) {
  const [params] = useSearchParams();
  const versionParam = params.get('version');
  const version: VersionId = PAGE_VERSIONS.some((v) => v.id === versionParam)
    ? (versionParam as VersionId)
    : DEFAULT_VERSION;

  // Mount-time URL snapshot, used to seed each group's initial selection so a
  // shared link opens on the chosen variants with no flash of defaults.
  const initialParams = useRef(params).current;

  const groups = SECTION_VARIANT_GROUPS.filter(
    (g) => !g.appliesTo || g.appliesTo.includes(version),
  );

  // Build the dialkit config from the applicable groups. Variant ids are stored
  // as the option `value`, so the resolved value is the id itself. Each select's
  // default is seeded from the URL when it names a real variant for that group.
  const config: DialConfig = {};
  for (const group of groups) {
    const fromUrl = initialParams.get(group.id);
    const seeded = group.variants.some((v) => v.id === fromUrl)
      ? (fromUrl as string)
      : group.defaultId;
    config[group.id] = {
      type: 'select',
      options: group.variants.map((v) => ({ value: v.id, label: v.label })),
      default: seeded,
    };
  }

  const values = useDialKit('Sections', config) as VariantSelection;

  // Mirror non-default selections into the URL (one param per group id). Discrete
  // selects write immediately; the page already re-renders on a variant swap.
  const target: Record<string, string> = {};
  for (const group of groups) {
    const selected = values[group.id];
    if (selected && selected !== group.defaultId) target[group.id] = selected;
  }
  useDialUrlSync({
    keys: SECTION_VARIANT_GROUPS.map((g) => g.id),
    target,
    immediate: true,
  });

  return (
    <VariantSelectionContext.Provider value={values}>
      {children}
    </VariantSelectionContext.Provider>
  );
}
