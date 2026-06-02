import { useSearchParams } from 'react-router-dom';
import { Nav } from '../components/Nav';
import { HeroVariantToggle } from '../components/HeroVariantToggle';
import { Hero } from '../sections/Hero';
import { HeroV2 } from '../sections/HeroV2';
import { HeroV3 } from '../sections/HeroV3';
import { Flow } from '../sections/Flow';
import { FromConversation } from '../sections/FromConversation';
import { MeetingDoc } from '../sections/MeetingDoc';
import { OneMeetingOneDoc } from '../sections/OneMeetingOneDoc';
import { ProductTabs } from '../sections/ProductTabs';
import { WhyChoose } from '../sections/WhyChoose';
import { Personas } from '../sections/Personas';
import { Templates } from '../sections/Templates';
import { FinalCTA } from '../sections/FinalCTA';
import { Footer } from '../sections/Footer';

export function Marketing() {
  const [params] = useSearchParams();
  const heroParam = params.get('hero');
  const heroVariant =
    heroParam === 'v2' || heroParam === 'v3' ? heroParam : 'v1';

  return (
    <>
      <Nav />
      <main>
        {heroVariant === 'v3' ? (
          <HeroV3 />
        ) : heroVariant === 'v2' ? (
          <HeroV2 />
        ) : (
          <Hero />
        )}
        <MeetingDoc />
        <Flow />
        <FromConversation />
        <OneMeetingOneDoc />
        <ProductTabs />
        <WhyChoose />
        <Personas />
        <Templates />
        <FinalCTA />
      </main>
      <Footer />
      <HeroVariantToggle />
    </>
  );
}
