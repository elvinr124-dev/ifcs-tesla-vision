import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServiceSection from "@/components/ServiceSection";
import Footer from "@/components/Footer";

import evaluationsBg from "@/assets/evaluations-bg.jpg";
import translationsBg from "@/assets/translations-bg.jpg";
import credentialClarityBg from "@/assets/credential-clarity-bg.jpg";
import consultingBg from "@/assets/consulting-bg.jpg";
import { useLocale } from "@/context/LocaleContext";

const Index = () => {
  const { translate } = useLocale();

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
        ctaHref="/evaluations"
        secondaryLabel="Learn More"
        secondaryHref="/learn-more-evaluations"
        dark
      />

      <ServiceSection
        id="translations"
        title="Certified Translations"
        subtitle="Break Language Barriers"
        description="Eliminate any language barrier between you and your next opportunity. We can translate any document from or into English."
        backgroundImage={translationsBg}
        ctaLabel="Get a Certified Translation"
        ctaHref="/translations"
        secondaryLabel="View Languages"
        secondaryHref="/translations"
        dark={false}
      />

      <ServiceSection
        id="credential-clarity"
        title={<>{translate("Credential Clarity for")}<br />{translate("Your Global Journey")}</>}
        subtitle="Your Path Forward"
        description="Continue your journey to educational and professional enlightenment with IFCS. We will help you get your foreign credentials recognized by universities, employers, and governmental institutions."
        backgroundImage={credentialClarityBg}
        ctaLabel="For Individuals"
        ctaHref="/for-individuals"
        secondaryLabel="For Institutions"
        secondaryHref="/for-institutions"
        dark
      />

      <ServiceSection
        id="consulting"
        title="Consulting"
        subtitle="Expert Guidance"
        description="Work side by side with a senior consultant to ensure you choose the right evaluation and streamline your admission."
        backgroundImage={consultingBg}
        ctaLabel="Book Consultation"
        ctaHref="/consulting"
        secondaryLabel="About Our Team"
        secondaryHref="/about"
        dark
      />

      <Footer />
    </div>
  );
};

export default Index;
