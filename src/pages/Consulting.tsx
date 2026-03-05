import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Briefcase } from "lucide-react";
import consultingBg from "@/assets/consulting-bg.jpg";

const services = [
  { title: "Admission Guidance", desc: "Get personalized advice on choosing the right evaluation type and navigating the admissions process at U.S. institutions." },
  { title: "Credential Strategy", desc: "Work with a senior consultant to develop a strategy for getting your foreign credentials recognized efficiently." },
  { title: "Institutional Consulting", desc: "We partner with universities and employers to streamline their foreign credential evaluation workflows." },
  { title: "Licensure Support", desc: "Expert guidance for professionals seeking state licensure — from nurses to engineers to accountants." },
];

const Consulting = () => (
  <div className="min-h-screen">
    <Navbar />

    <section className="relative h-[80vh] min-h-[600px] w-full flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${consultingBg})` }} />
      <div className="video-overlay" />
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-12 text-center animate-fade-in-up">
        <p className="text-sm font-medium tracking-[0.2em] uppercase mb-3 text-accent">Expert Guidance</p>
        <h1 className="tesla-hero-title text-white">Consulting</h1>
        <p className="tesla-hero-subtitle max-w-2xl mx-auto mt-4 text-white/80">
          Work side by side with a senior consultant to ensure you choose the right evaluation and streamline your admission.
        </p>
      </div>
    </section>

    <section className="py-24 px-6 md:px-12 content-bg">
      <div className="max-w-6xl mx-auto">
        <p className="text-sm font-medium tracking-[0.2em] uppercase text-accent text-center mb-3">What We Offer</p>
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-foreground text-center mb-16">
          Consulting Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((s) => (
            <div key={s.title} className="p-8 rounded-3xl border border-border bg-card shadow-lg hover:shadow-xl hover:border-accent/30 transition-all duration-300">
              <Briefcase size={24} className="text-accent mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <a
            href="https://ifcsevals.com/contact-us"
            target="_blank"
            rel="noopener noreferrer"
            className="tesla-btn-primary inline-block"
          >
            Book a Consultation
          </a>
        </div>
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

export default Consulting;
