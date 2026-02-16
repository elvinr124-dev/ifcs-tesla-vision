interface ServiceSectionProps {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  backgroundImage: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  dark?: boolean;
}

const ServiceSection = ({
  id,
  title,
  subtitle,
  description,
  backgroundImage,
  ctaLabel,
  ctaHref,
  secondaryLabel,
  secondaryHref,
  dark = true,
}: ServiceSectionProps) => {
  return (
    <section id={id} className="tesla-section">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />

      {/* Overlay */}
      {dark && <div className="video-overlay" />}
      {!dark && (
        <div className="absolute inset-0" style={{ background: "hsl(0 0% 100% / 0.7)" }} />
      )}

      {/* Content */}
      <div className="tesla-section-content">
        <p
          className="text-sm font-medium tracking-[0.2em] uppercase mb-3 opacity-80"
          style={{ color: dark ? "white" : "hsl(var(--foreground))" }}
        >
          {subtitle}
        </p>
        <h2
          className="text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight"
          style={{ color: dark ? "white" : "hsl(var(--foreground))" }}
        >
          {title}
        </h2>
        <p
          className="mt-4 text-base md:text-lg max-w-xl mx-auto font-light opacity-80"
          style={{ color: dark ? "white" : "hsl(var(--muted-foreground))" }}
        >
          {description}
        </p>

        <div className="tesla-cta-group">
          <a href={ctaHref} target="_blank" rel="noopener noreferrer" className="tesla-btn-primary">
            {ctaLabel}
          </a>
          {secondaryLabel && secondaryHref && (
            <a
              href={secondaryHref}
              target="_blank"
              rel="noopener noreferrer"
              className={dark ? "tesla-btn-outline" : "tesla-btn-secondary"}
            >
              {secondaryLabel}
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

export default ServiceSection;
