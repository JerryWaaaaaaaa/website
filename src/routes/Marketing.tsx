import { useSearchParams } from 'react-router-dom';
import { DialSidePanel } from '../components/DialSidePanel';
import { Nav } from '../components/Nav';
import { PageVersionDial } from '../components/PageVersionDial';
import { ScrollBackground } from '../components/ScrollBackground';
import { V5Tuning } from '../components/V5Tuning';
import { V5VariantProvider } from '../components/V5VariantContext';
import { Footer } from '../sections/Footer';
import { PAGE_VERSIONS, DEFAULT_VERSION } from '../pageVersions';
import { SECTION_VARIANT_GROUPS } from '../sectionVariants';

export function Marketing() {
  const [params] = useSearchParams();
  const versionParam = params.get('version');
  const version =
    PAGE_VERSIONS.find((v) => v.id === versionParam) ??
    PAGE_VERSIONS.find((v) => v.id === DEFAULT_VERSION)!;
  // The tuning panel only drives v5 sections, and the Sections panel only
  // versions with variant groups; elsewhere they'd just be dead controls.
  const isV5 = version.id === 'v5';
  const hasVariants = SECTION_VARIANT_GROUPS.some(
    (g) => !g.appliesTo || g.appliesTo.includes(version.id),
  );
  const main = <main>{version.render()}</main>;

  return (
    <>
      {/* First so its "Page" panel registers (and lists) above every other panel. */}
      <PageVersionDial />
      <ScrollBackground />
      {version.nav ? version.nav() : <Nav />}
      {hasVariants ? <V5VariantProvider>{main}</V5VariantProvider> : main}
      {version.footer ? version.footer() : <Footer />}
      {isV5 && <V5Tuning />}
      <DialSidePanel />
    </>
  );
}
