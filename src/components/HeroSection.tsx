import { ChevronDown } from "lucide-react";
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
        <h1 className="tesla-hero-title">
          Institute of Foreign<br />Credential Services
        </h1>
        <p className="tesla-hero-subtitle max-w-2xl mx-auto mt-4">
          Helping Students Get the Credits They Deserve
        </p>

        <div className="tesla-cta-group">
          <a href="https://ifcsevals.com/application" target="_blank" rel="noopener noreferrer" className="tesla-btn-primary">
            For Individuals
          </a>
          <a href="https://ifcsevals.com/application" target="_blank" rel="noopener noreferrer" className="tesla-btn-outline">
            For Institutions
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 z-10 animate-scroll-indicator">
        <ChevronDown size={28} style={{ color: "white" }} />
      </div>
    </section>
  );
};

export default HeroSection;
