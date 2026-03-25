import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import nycVideo from "@/assets/nyc-street.mp4";
import nycPoster from "@/assets/nyc-street-poster.jpg";

const HeroSection = () => {
  return (
    <section className="tesla-section">
      {/* Video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster={nycPoster}
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={nycVideo} type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="video-overlay" />

      {/* Content */}
      <div className="tesla-section-content animate-fade-in-up hero-text-shadow" style={{ color: "white" }}>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight">
          The Foreign<br />Credential Services
        </h1>
        <p className="text-2xl md:text-3xl font-light max-w-3xl mx-auto mt-6 opacity-90">
          Helping Students Get the Credits They Deserve
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-12 justify-center">
          <Link
            to="/evaluations"
            className="inline-flex items-center justify-center px-14 py-5 text-base font-semibold tracking-wide rounded-2xl transition-all duration-200 shadow-2xl hover:scale-105"
            style={{ background: "hsl(217 91% 50%)", color: "white", boxShadow: "0 8px 32px hsl(217 91% 50% / 0.5)" }}
          >
            Get an Evaluation
          </Link>
          <Link
            to="/translations"
            className="inline-flex items-center justify-center px-14 py-5 text-base font-semibold tracking-wide rounded-2xl transition-all duration-200 hover:scale-105"
            style={{ background: "white", color: "hsl(217 91% 50%)" }}
          >
            Get a Certified Translation
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 z-10 animate-scroll-indicator">
        <ChevronDown size={34} style={{ color: "white" }} />
      </div>
    </section>
  );
};

export default HeroSection;
