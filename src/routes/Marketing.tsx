import { useSearchParams } from 'react-router-dom';
import { DialRoot } from 'dialkit';
import 'dialkit/styles.css';
import { Nav } from '../components/Nav';
import { HeroVariantToggle } from '../components/HeroVariantToggle';
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

  return (
    <>
      <Nav />
      <V5VariantProvider>
        <main>{version.render()}</main>
      </V5VariantProvider>
      <Footer />
      <HeroVariantToggle />
      <V5Tuning />
      <DialRoot position="bottom-right" defaultOpen={false} />
    </>
  );
}
