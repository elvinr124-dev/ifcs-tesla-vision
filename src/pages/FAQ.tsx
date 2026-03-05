import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import faqBg from "@/assets/faq-bg.jpg";

const faqs = [
  { q: "What is a credential evaluation?", a: "A credential evaluation is an expert assessment of your foreign academic credentials to determine their U.S. equivalency. It is used for university admissions, employment, immigration, and professional licensing." },
  { q: "How long does an evaluation take?", a: "Standard processing takes 8–10 business days. We also offer 3-day rush and 24-hour rush options for an additional fee." },
  { q: "What documents do I need?", a: "You will typically need your transcripts/mark sheets and diploma certificate. Some evaluations may require additional documentation." },
  { q: "Is IFCS recognized by universities?", a: "Yes. IFCS evaluations are accepted by universities, employers, and government agencies across the United States." },
  { q: "Can I get a course-by-course evaluation?", a: "Yes. We offer course-by-course evaluations that list individual courses, credit hours, grades, and GPA — ideal for transfer credit and graduate admissions." },
  { q: "Do you offer translation services?", a: "Yes. We provide certified translations in 150+ languages, accepted by USCIS, universities, and all government agencies." },
  { q: "How do I check my evaluation status?", a: "You can check your evaluation status through our application portal or by contacting our office directly." },
  { q: "What is rush processing?", a: "Rush processing expedites your evaluation. The 3-day rush delivers in 3 business days, and the 24-hour rush delivers within 24 hours of document receipt." },
];

const FAQ = () => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="relative h-[80vh] min-h-[600px] w-full flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${faqBg})` }} />
        <div className="video-overlay" />
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-12 text-center animate-fade-in-up">
          <p className="text-sm font-medium tracking-[0.2em] uppercase mb-3 text-accent">Help Center</p>
          <h1 className="tesla-hero-title text-white">Frequently Asked Questions</h1>
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
                <span className="text-base font-medium text-foreground pr-4">{q}</span>
                {open === i ? <ChevronUp size={20} className="text-muted-foreground shrink-0" /> : <ChevronDown size={20} className="text-muted-foreground shrink-0" />}
              </button>
              {open === i && (
                <p className="pb-6 text-sm text-muted-foreground leading-relaxed">{a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="text-center pb-16 content-bg">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>

      <Footer />
    </div>
  );
};

export default FAQ;
