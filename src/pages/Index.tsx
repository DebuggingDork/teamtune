import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ContainerScrollSection from "@/components/ContainerScrollSection";
import { Features } from "@/components/ui/features-8";
import TestimonialsSection from "@/components/TestimonialsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <ContainerScrollSection />
      <Features />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
