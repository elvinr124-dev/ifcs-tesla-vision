import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import cunyLogo from "@/assets/cuny-logo.png";
import cunyHeroBg from "@/assets/cuny-hero-bg.jpg";
import { useLocale } from "@/context/LocaleContext";

const CUNY = () => {
  const { translate } = useLocale();

  const cbcState = {
    serviceTitle: "Course-by-Course",
    processingKey: "standard",
    processingLabel: "Standard",
    processingTime: "8–10 Business Days",
    price: 190,
  };

  const hsUniState = {
    serviceTitle: "High School and University Course-by-Course",
    processingKey: "standard",
    processingLabel: "Standard",
    processingTime: "8–10 Business Days",
    price: 295,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative h-[80vh] min-h-[600px] w-full flex flex-col items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${cunyHeroBg})`,
            backgroundPosition: "center center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="video-overlay" />
        <div className="relative z-10 text-center px-6 hero-text-shadow">
          <h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight"
            style={{ color: "white" }}
          >
            {translate("The City University of New York")}
          </h1>
          <p
            className="text-xl md:text-2xl font-light max-w-3xl mx-auto mt-6 opacity-90"
            style={{ color: "rgba(255,255,255,0.9)", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}
          >
            {translate("Welcome to The Institute of Foreign Credential Services application for CUNY prospective students.")}
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="flex justify-center mb-12">
            <img
              src={cunyLogo}
              alt="CUNY - The City University of New York"
              className="h-32 md:h-40 w-auto"
            />
          </div>

          <div className="bg-muted/30 rounded-3xl p-8 md:p-12 mb-12">
            <p className="text-lg md:text-xl leading-relaxed" style={{ color: "hsl(var(--foreground))" }}>
              {translate("As a CUNY prospective student, you can receive a")} {" "}
              <span className="font-bold text-xl" style={{ color: "hsl(var(--accent))" }}>$20 {translate("discount")}</span>{" "}
              {translate("on your Course-by-Course or High School & University Course-by-Course evaluation at any processing speed by entering the following code:")}
            </p>
            <div className="mt-6 inline-block px-8 py-3 rounded-full font-bold text-2xl tracking-widest" style={{ background: "hsl(var(--accent))", color: "white" }}>
              CUNY
            </div>
          </div>

          <div className="mb-12">
            <p className="text-lg mb-8" style={{ color: "hsl(var(--foreground))" }}>
              {translate("Choose the evaluation that matches your academic background and start your application below.")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/application"
                state={cbcState}
                className="inline-flex items-center justify-center px-10 py-4 text-base font-semibold tracking-wide rounded-full transition-all duration-200 shadow-2xl hover:scale-105"
                style={{ background: "hsl(var(--accent))", color: "white", boxShadow: "0 8px 32px hsl(217 91% 50% / 0.5)" }}
              >
                {translate("Course-by-Course (CBC)")}
              </Link>
              <Link
                to="/application"
                state={hsUniState}
                className="inline-flex items-center justify-center px-10 py-4 text-base font-semibold tracking-wide rounded-full transition-all duration-200 shadow-2xl hover:scale-105 border-2"
                style={{ background: "white", color: "hsl(var(--accent))", borderColor: "hsl(var(--accent))", boxShadow: "0 8px 32px hsl(217 91% 50% / 0.2)" }}
              >
                {translate("HS & University CBC")}
              </Link>
            </div>
          </div>

          <p className="text-base" style={{ color: "hsl(var(--muted-foreground))" }}>
            {translate("If you have any questions, please send an email to")} {" "}
            <a
              href="mailto:info@ifcsevals.com"
              className="font-semibold underline"
              style={{ color: "hsl(var(--accent))" }}
            >
              info@ifcsevals.com
            </a>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CUNY;
