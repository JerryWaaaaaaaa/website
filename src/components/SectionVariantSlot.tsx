import { useSearchParams } from 'react-router-dom';
import { SECTION_VARIANT_GROUPS } from '../sectionVariants';

interface SectionVariantSlotProps {
  /** Matches a SectionVariantGroup id in the registry. */
  groupId: string;
}

export function SectionVariantSlot({ groupId }: SectionVariantSlotProps) {
  const [params] = useSearchParams();
  const group = SECTION_VARIANT_GROUPS.find((g) => g.id === groupId);
  if (!group) return null;

  const selected = params.get(group.id) ?? group.defaultId;
  const variant =
    group.variants.find((v) => v.id === selected) ??
    group.variants.find((v) => v.id === group.defaultId) ??
    group.variants[0];

  return <>{variant.render()}</>;
}
