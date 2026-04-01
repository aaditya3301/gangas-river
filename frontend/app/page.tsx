import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import PlatformOverview from '@/components/landing/PlatformOverview';
import FloodPrediction from '@/components/landing/FloodPrediction';
import Zoning from '@/components/landing/Zoning';
import CommunityVerification from '@/components/landing/CommunityVerification';
import ResearchAccess from '@/components/landing/ResearchAccess';
import Footer from '@/components/landing/Footer';

export default function HomePage() {
  return (
    <main className="overflow-x-hidden bg-[#080c18]">
      <Navbar />
      <Hero />
      <PlatformOverview />
      <FloodPrediction />
      <Zoning />
      <CommunityVerification />
      <ResearchAccess />
      <Footer />
    </main>
  );
}
