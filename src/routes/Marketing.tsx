import { Nav } from '../components/Nav';
import { Hero } from '../sections/Hero';
import { Flow } from '../sections/Flow';
import { FromConversation } from '../sections/FromConversation';
import { OneMeetingOneDoc } from '../sections/OneMeetingOneDoc';
import { ProductTabs } from '../sections/ProductTabs';
import { WhyChoose } from '../sections/WhyChoose';
import { Personas } from '../sections/Personas';
import { Templates } from '../sections/Templates';
import { FinalCTA } from '../sections/FinalCTA';
import { Footer } from '../sections/Footer';

export function Marketing() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
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
    </>
  );
}
