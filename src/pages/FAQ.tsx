import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToHome from "@/components/BackToHome";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import faqBg from "@/assets/faq-bg.jpg";

const faqs = [
  {
    q: "How long does it take to get an evaluation done?",
    a: "Typically, evaluations done by IFCS are turned around within 8–10 business days. We provide 24-hour priority service and three-day \"rush\" evaluation service at additional costs."
  },
  {
    q: "What type of evaluation is right for me?",
    a: "Selecting an evaluation appropriate for you depends on several factors, but here is a practical guideline:\n\n• General evaluation analysis is recommended for employment, military and emigration situations. If you are looking at a graduate or undergraduate admission, then general evaluations plus GPA are recommended, particularly when no transfer credits are intended.\n\n• Continued education (secondary and post-secondary transfers) would require a course-by-course evaluation.\n\n• Comprehensive course-by-course evaluations are appropriate for graduate admissions and professional licensing boards.\n\n• Health professions course-by-course evaluations are recommended if you have completed your studies in healthcare and you are seeking licensure with healthcare licensing boards in the U.S."
  },
  {
    q: "How should I send my application and supporting documents to IFCS?",
    a: "We accept applications and related documents at our office between 9 a.m. to 5 p.m. on business days. You may also send your completed application and paperwork to us via U.S. mail. Our address is 6 Cedar Street, Dobbs Ferry, NY 10522."
  },
  {
    q: "I require assistance filling out my application, does IFCS offer personal guidance?",
    a: "Yes. You may come in for consulting during normal business hours. We do prefer to make an appointment however via email or telephone to ensure someone will be on hand to help you."
  },
  {
    q: "What if I want a refund?",
    a: "Refunds will be made only if you have overpaid for services to IFCS. Applications for 8–10 day service can only be canceled within 24 hours of submission and will be subject to a $50 minimum processing fee. No refunds can be issued for 24-hour and 3-day service."
  },
  {
    q: "What is the difference between an evaluation and translation?",
    a: "An evaluation provides a US equivalency of your foreign academic credentials. A translation is a word-for-word conversion from your native language into English."
  },
  {
    q: "May I obtain additional copies of my previous evaluation?",
    a: "Additional copies are available for $25 plus shipping."
  }
];

const FAQ = () => {
  const [open, setOpen] = useState<number | null>(null);
  const { translate } = useLocale();

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="relative h-[80vh] min-h-[600px] w-full flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${faqBg})` }} />
        <div className="video-overlay" />
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-12 text-center animate-fade-in-up hero-text-shadow">
          <p className="text-sm font-medium tracking-[0.2em] uppercase mb-3 text-white">{translate("Help Center")}</p>
          <h1 className="tesla-hero-title text-white">{translate("Frequently Asked Questions")}</h1>
          <p className="tesla-hero-subtitle max-w-2xl mx-auto mt-4 text-white/90">
            {translate("Have questions? We're here to help with your credential evaluation and translation needs.")}
          </p>
        </div>
      </section>

      <section className="py-24 px-6 md:px-12 content-bg">
        <div className="max-w-3xl mx-auto space-y-0">
          {faqs.map(({ q, a }, i) => (
            <div key={i} className="border-b border-border">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between py-6 text-left"
              >
                <span className="text-base font-medium text-foreground pr-4">{translate(q)}</span>
                {open === i ? (
                  <ChevronUp size={20} className="text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown size={20} className="text-muted-foreground shrink-0" />
                )}
              </button>
              {open === i && (
                <p className="pb-6 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{translate(a)}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <BackToHome />
      <Footer />
    </div>
  );
};

export default FAQ;
