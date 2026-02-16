import { Link } from "react-router-dom";

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
  dark = true
}: ServiceSectionProps) => {
  const isExternal = (href: string) => href.startsWith("http");

  const LinkOrA = ({ href, className, children }: {href: string;className: string;children: React.ReactNode;}) =>
  isExternal(href) ?
  <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a> :

  <Link to={href} className={className}>
        {children}
      </Link>;


  return (
    <section id={id} className="tesla-section">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }} />

      {dark && <div className="video-overlay" />}
      {!dark &&
      <div className="absolute inset-0" style={{ background: "hsl(0 0% 100% / 0.7)" }} />
      }
      <div className="tesla-section-content">
        <p
          className="text-sm font-medium tracking-[0.2em] uppercase mb-3 opacity-80"
          style={{ color: dark ? "white" : "hsl(var(--foreground))" }}>

          {subtitle}
        </p>
        <h2
          className="text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight"
          style={{ color: dark ? "white" : "hsl(var(--foreground))" }}>

          {title}
        </h2>
        <p
          className="mt-4 text-base md:text-lg max-w-xl mx-auto opacity-80 text-center font-normal text-accent bg-white/0"
          style={{ color: dark ? "white" : "hsl(var(--muted-foreground))" }}>

          {description}
        </p>
        <div className="tesla-cta-group">
          <LinkOrA href={ctaHref} className="tesla-btn-primary">
            {ctaLabel}
          </LinkOrA>
          {secondaryLabel && secondaryHref &&
          <LinkOrA
            href={secondaryHref}
            className={dark ? "tesla-btn-outline" : "tesla-btn-secondary"}>

              {secondaryLabel}
            </LinkOrA>
          }
        </div>
      </div>
    </section>);

};

export default ServiceSection;