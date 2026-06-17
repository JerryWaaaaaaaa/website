import { useSearchParams } from 'react-router-dom';
import { Nav } from '../components/Nav';
import { HeroVariantToggle } from '../components/HeroVariantToggle';
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
      <main>{version.render()}</main>
      <Footer />
      <HeroVariantToggle />
    </>
  );
}
