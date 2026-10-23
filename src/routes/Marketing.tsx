import { useSearchParams } from 'react-router-dom';
import { DialSidePanel } from '../components/DialSidePanel';
import { Nav } from '../components/Nav';
import { PageVersionDial } from '../components/PageVersionDial';
import { ScrollBackground } from '../components/ScrollBackground';
import { V5Tuning } from '../components/V5Tuning';
import { V5VariantProvider } from '../components/V5VariantContext';
import { Footer } from '../sections/Footer';
import { PAGE_VERSIONS, DEFAULT_VERSION } from '../pageVersions';

export function Marketing() {
  const [params] = useSearchParams();
  const versionParam = params.get('version');
  const version =
    PAGE_VERSIONS.find((v) => v.id === versionParam) ??
    PAGE_VERSIONS.find((v) => v.id === DEFAULT_VERSION)!;
  // The section-variant + tuning panels only drive v5 sections; mounting them on
  // other versions would just clutter the dial kit with dead controls.
  const isV5 = version.id === 'v5';
  const main = <main>{version.render()}</main>;

  return (
    <>
      {/* First so its "Page" panel registers (and lists) above every other panel. */}
      <PageVersionDial />
      <ScrollBackground />
      {version.nav ? version.nav() : <Nav />}
      {isV5 ? <V5VariantProvider>{main}</V5VariantProvider> : main}
      {version.footer ? version.footer() : <Footer />}
      {isV5 && <V5Tuning />}
      <DialSidePanel />
    </>
  );
}
