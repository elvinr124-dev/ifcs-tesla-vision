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
      <div className="tesla-section-content animate-fade-in-up" style={{ color: "white" }}>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight">
          Institute of Foreign<br />Credential Services
        </h1>
        <p className="text-2xl md:text-3xl font-light max-w-3xl mx-auto mt-6 opacity-90">
          Helping Students Get the Credits They Deserve
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-12 justify-center">
          <Link
            to="/for-individuals"
            className="inline-flex items-center justify-center px-14 py-5 text-base font-semibold tracking-wide rounded-2xl transition-all duration-200 shadow-2xl hover:scale-105"
            style={{ background: "hsl(217 91% 50%)", color: "white", boxShadow: "0 8px 32px hsl(217 91% 50% / 0.5)" }}
          >
            For Individuals
          </Link>
          <Link
            to="/for-individuals"
            className="inline-flex items-center justify-center px-14 py-5 text-base font-semibold tracking-wide rounded-2xl border-2 transition-all duration-200 hover:scale-105"
            style={{ borderColor: "rgba(255,255,255,0.6)", color: "white", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}
          >
            For Institutions
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
