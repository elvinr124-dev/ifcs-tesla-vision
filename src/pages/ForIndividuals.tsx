import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import brooklynBridge from "@/assets/brooklyn-bridge-night.jpg";
import { ArrowRight, Search, FileText, Upload, Send } from "lucide-react";

const steps = [
  {
    num: 1,
    icon: Search,
    title: "Determine Your Service",
    body: "Determine which evaluation service you need (see our Evaluations page). If you are not able to determine which evaluation is best for you, contact IFCS at info@ifcsevals.com.",
  },
  {
    num: 2,
    icon: FileText,
    title: "Complete Your Application",
    body: "Complete the online application, or click here to download the PDF application. Fill in all required personal, academic, and purpose-of-evaluation information.",
  },
  {
    num: 3,
    icon: Upload,
    title: "Upload Your Documents",
    body: "Please upload legible copies of your transcripts/mark sheets and diploma certificates. If your documents are in a foreign language, and you do not have a certified translation, we can provide a translation quote.",
  },
  {
    num: 4,
    icon: Send,
    title: "Submit & Pay",
    body: "Submit a completed and signed application, with all accompanying documents from Step 3, and make a payment. Your evaluation will begin once all materials are received and verified.",
  },
];

const ForIndividuals = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[55vh] min-h-[380px] w-full flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${brooklynBridge})` }} />
        <div className="video-overlay" />
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-12 text-center">
          <p className="text-sm font-semibold tracking-[0.25em] uppercase text-accent mb-4">Application Instructions</p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
            For Individuals
          </h1>
          <p className="text-xl md:text-2xl text-white/80 font-light mt-5 max-w-2xl mx-auto">
            Your step-by-step guide to getting your credentials evaluated.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isLast = i === steps.length - 1;
            return (
              <div key={step.num} className="relative">
                {/* Connector line */}
                {!isLast && (
                  <div className="absolute left-9 top-[88px] bottom-[-2rem] w-px bg-gradient-to-b from-accent/40 to-transparent hidden md:block" />
                )}

                <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
                  {/* Step bubble */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-3">
                    <div className="w-[72px] h-[72px] rounded-3xl bg-accent flex items-center justify-center shadow-xl shadow-accent/30">
                      <Icon size={30} className="text-white" />
                    </div>
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground">
                      Step {step.num}
                    </span>
                  </div>

                  {/* Content bubble */}
                  <div className="flex-1 rounded-3xl border border-border bg-card shadow-lg hover:shadow-xl hover:border-accent/30 transition-all duration-300 p-8 md:p-10 group">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-4 group-hover:text-accent transition-colors duration-200">
                      {step.title}
                    </h2>
                    <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                      {step.body}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Online Application bubble button */}
          <div className="flex justify-center pt-8">
            <Link
              to="/application"
              className="group inline-flex items-center gap-4 px-10 py-5 rounded-3xl bg-accent text-accent-foreground font-bold text-lg tracking-wide shadow-2xl shadow-accent/40 hover:shadow-accent/60 hover:scale-105 transition-all duration-300"
            >
              <span>Online Application</span>
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <ArrowRight size={20} />
              </div>
            </Link>
          </div>

          {/* Or download PDF */}
          <p className="text-center text-sm text-muted-foreground mt-4">
            Prefer a PDF?{" "}
            <a href="mailto:info@ifcsevals.com" className="text-accent underline underline-offset-4 hover:text-accent/80 transition-colors">
              Contact us at info@ifcsevals.com
            </a>{" "}
            to request a downloadable form.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ForIndividuals;
