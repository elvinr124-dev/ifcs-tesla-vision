import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServiceSection from "@/components/ServiceSection";
import Footer from "@/components/Footer";

import evaluationsBg from "@/assets/evaluations-bg.jpg";
import translationsBg from "@/assets/translations-bg.jpg";
import consultingBg from "@/assets/consulting-bg.jpg";

const Index = () => {
  return (
    <div className="bg-background">
      <Navbar />

      <HeroSection />

      <ServiceSection
        id="evaluations"
        title="Academic Evaluations"
        subtitle="Credentials Recognized"
        description="Get your well-earned academic credentials recognized by U.S. universities, employers and state governmental institutions."
        backgroundImage={evaluationsBg}
        ctaLabel="Start Evaluation"
        ctaHref="https://ifcsevals.com/evaluations"
        secondaryLabel="Learn More"
        secondaryHref="https://ifcsevals.com/evaluations"
        dark
      />

      <ServiceSection
        id="translations"
        title="Translations"
        subtitle="Break Language Barriers"
        description="Eliminate any language barrier between you and your next opportunity. We can translate any document from or into English."
        backgroundImage={translationsBg}
        ctaLabel="Request Translation"
        ctaHref="/translations"
        secondaryLabel="View Languages"
        secondaryHref="/translations"
        dark={false}
      />

      <ServiceSection
        id="consulting"
        title="Consulting"
        subtitle="Expert Guidance"
        description="Work side by side with a senior consultant to ensure you choose the right evaluation and streamline your admission."
        backgroundImage={consultingBg}
        ctaLabel="Book Consultation"
        ctaHref="https://ifcsevals.com/contact-us"
        secondaryLabel="About Our Team"
        secondaryHref="https://ifcsevals.com/about-us"
        dark
      />

      <Footer />
    </div>
  );
};

export default Index;
