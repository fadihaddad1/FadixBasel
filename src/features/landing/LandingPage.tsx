import { Navbar } from './sections/Navbar';
import { Hero } from './sections/Hero';
import { SocialProof } from './sections/SocialProof';
import { WhyFail } from './sections/WhyFail';
import { HowItWorks } from './sections/HowItWorks';
import { Pricing } from './sections/Pricing';
import { FounderNote } from './sections/FounderNote';
import { FinalCta } from './sections/FinalCta';
import { Footer } from './sections/Footer';

/** DayGauge consumer landing page. */
export function LandingPage() {
  return (
    <div className="bg-grain relative min-h-screen w-full overflow-x-clip bg-ink-950">
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <WhyFail />
        <HowItWorks />
        <Pricing />
        <FounderNote />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
