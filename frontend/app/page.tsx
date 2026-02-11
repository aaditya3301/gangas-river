import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import TrustLogos from '@/components/landing/TrustLogos';
import PlatformOverview from '@/components/landing/PlatformOverview';
import FloodPrediction from '@/components/landing/FloodPrediction';
import Zoning from '@/components/landing/Zoning';
import CommunityVerification from '@/components/landing/CommunityVerification';
import ResearchAccess from '@/components/landing/ResearchAccess';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <TrustLogos />
      <PlatformOverview />
      <FloodPrediction />
      <Zoning />
      <CommunityVerification />
      <ResearchAccess />
      <CTASection />
      <Footer />
    </main>
  );
}
