import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToHome from "@/components/BackToHome";
import { useLocale } from "@/context/LocaleContext";
import brooklynBridge from "@/assets/brooklyn-bridge-night.jpg";
import { ArrowRight, Search, FileText, Upload, Send, GraduationCap, MessageSquare, Languages } from "lucide-react";

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
  const { translate } = useLocale();
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[55vh] min-h-[380px] w-full flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${brooklynBridge})` }} />
        <div className="video-overlay" />
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-12 text-center">
          <p className="text-sm font-semibold tracking-[0.25em] uppercase text-accent mb-4">{translate("Application Instructions")}</p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
            {translate("For Individuals")}
          </h1>
          <p className="text-xl md:text-2xl text-white/80 font-light mt-5 max-w-2xl mx-auto">
            {translate("Your step-by-step guide to getting your credentials evaluated.")}
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-24 px-6 md:px-12 content-bg">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold tracking-[0.25em] uppercase text-accent mb-3">{translate("How It Works")}</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">{translate("Application Steps")}</h2>
          </div>

          {steps.map((step, i) => {
            const Icon = step.icon;
            const isLast = i === steps.length - 1;
            return (
              <div key={step.num} className="relative">
                {!isLast && (
                  <div className="absolute left-9 top-[88px] bottom-[-2rem] w-px bg-gradient-to-b from-accent/40 to-transparent hidden md:block" />
                )}

                <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
                  <div className="flex-shrink-0 flex flex-col items-center gap-3">
                    <div className="w-[72px] h-[72px] rounded-3xl bg-accent flex items-center justify-center shadow-xl shadow-accent/30">
                      <Icon size={30} className="text-white" />
                    </div>
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground">
                      {translate("Step")} {step.num}
                    </span>
                  </div>

                  <div className="flex-1 rounded-3xl border border-border bg-card shadow-lg hover:shadow-xl hover:border-accent/30 transition-all duration-300 p-8 md:p-10 group">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-4 group-hover:text-accent transition-colors duration-200">
                      {translate(step.title)}
                    </h2>
                    <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                      {translate(step.body)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Online Application button */}
          <div className="flex justify-center pt-8">
            <Link
              to="/evaluations"
              className="group inline-flex items-center gap-4 px-10 py-5 rounded-3xl bg-accent text-accent-foreground font-bold text-lg tracking-wide shadow-2xl shadow-accent/40 hover:shadow-accent/60 hover:scale-105 transition-all duration-300"
            >
              <span>{translate("Online Application")}</span>
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <ArrowRight size={20} />
              </div>
            </Link>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Prefer a PDF?{" "}
            <a href="mailto:info@ifcsevals.com" className="text-accent underline underline-offset-4 hover:text-accent/80 transition-colors">
              Contact us at info@ifcsevals.com
            </a>{" "}
            to request a downloadable form.
          </p>
        </div>
      </section>

      {/* Services: Evaluations, Consulting, Translations */}
      <section className="py-24 px-6 md:px-12 content-bg-alt">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Evaluations */}
          <div className="rounded-3xl border border-border bg-card shadow-lg hover:border-accent/40 hover:shadow-xl transition-all duration-300 p-8 group flex flex-col">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-5">
              <GraduationCap size={24} className="text-accent" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold tracking-tight text-foreground mb-4 group-hover:text-accent transition-colors">Evaluations</h3>
            <p className="text-sm md:text-base text-muted-foreground font-light leading-relaxed flex-1">
              Our foreign academic transcript evaluation services are as thorough as any you will find in the profession, yet they bear one significant distinction; the evaluators themselves. Our professionals rank highest among the industry's most elite consultants and you will be in direct contact with our team from the very beginning when you undergo your free assessment. See our{" "}
              <Link to="/evaluations" className="text-accent underline underline-offset-4 hover:text-accent/80 transition-colors font-medium">
                Evaluations
              </Link>{" "}
              page to help you determine what services you need.
            </p>
          </div>

          {/* Consulting */}
          <div className="rounded-3xl border border-border bg-card shadow-lg hover:border-accent/40 hover:shadow-xl transition-all duration-300 p-8 group flex flex-col">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-5">
              <MessageSquare size={24} className="text-accent" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold tracking-tight text-foreground mb-4 group-hover:text-accent transition-colors">Consulting</h3>
            <p className="text-sm md:text-base text-muted-foreground font-light leading-relaxed flex-1">
              We will help you complete the forms necessary to make the process go well from the start and ensure everything is done with accuracy and speed. Then, once you are ready to progress toward admissions and foreign academic transcript evaluation, your IFCS consulting team will guide you through that stage to help you select the institution and program in the U.S.A that's right for you.
            </p>
            <p className="text-sm md:text-base text-muted-foreground font-light leading-relaxed mt-4">
              Consultations are available by appointment. Visit our{" "}
              <Link to="/consulting" className="text-accent underline underline-offset-4 hover:text-accent/80 transition-colors font-medium">
                Consulting
              </Link>{" "}
              page for more info.
            </p>
          </div>

          {/* Translations */}
          <div className="rounded-3xl border border-border bg-card shadow-lg hover:border-accent/40 hover:shadow-xl transition-all duration-300 p-8 group flex flex-col">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-5">
              <Languages size={24} className="text-accent" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold tracking-tight text-foreground mb-4 group-hover:text-accent transition-colors">Translations</h3>
            <p className="text-sm md:text-base text-muted-foreground font-light leading-relaxed flex-1">
              We provide translations from any language, for any document type, into English.{" "}
              <Link to="/translations" className="text-accent underline underline-offset-4 hover:text-accent/80 transition-colors font-medium">
                Click here
              </Link>{" "}
              to access our translations form.
            </p>
          </div>
        </div>
      </section>

      {/* How We Help You */}
      <section className="py-24 px-6 md:px-12 content-bg">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-semibold tracking-[0.25em] uppercase text-accent mb-3 text-center">{translate("Individuals")}</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground text-center mb-10">{translate("How We Help You")}</h2>

          <div className="rounded-3xl border border-border bg-card shadow-lg p-8 md:p-12">
            <p className="text-base md:text-lg text-muted-foreground font-light leading-relaxed">
              Foreign credential standards vary among universities, employers, state and government institutions. Knowing exactly how the educational accomplishments you have achieved abroad align with U.S. admissions departments and corporate employers is a task best left to a resource that knows the game inside out. The Institute of Foreign Credential Services (IFCS) can provide the insight you need to get your academic credentials recognized and determine exactly what you may need to do in order to make your next transition successful professionally or academically speaking.
            </p>
          </div>
        </div>
      </section>

      <BackToHome />
      <Footer />
    </div>
  );
};

export default ForIndividuals;
