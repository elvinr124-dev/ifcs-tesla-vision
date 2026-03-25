import { Link } from "react-router-dom";

interface ServiceSectionProps {
  id: string;
  title: React.ReactNode;
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

  const LinkOrA = ({ href, className, style, children }: {href: string;className: string;style?: React.CSSProperties;children: React.ReactNode;}) =>
  isExternal(href) ?
  <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style}>
        {children}
      </a> :

  <Link to={href} className={className} style={style}>
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
      <div className="tesla-section-content hero-text-shadow">
        <p
          className="text-base tracking-[0.25em] uppercase mb-4 opacity-100 text-white font-semibold "
          style={{ color: dark ? "white" : "hsl(var(--foreground))" }}>

          {subtitle}
        </p>
        <h2
          className="text-5xl md:text-7xl tracking-tight font-semibold text-white lg:text-7xl"
          style={{ color: dark ? "white" : "hsl(var(--foreground))" }}>

          {title}
        </h2>
        <p
          className="mt-6 text-xl md:text-2xl max-w-2xl mx-auto opacity-90 text-center font-semibold text-white"
          style={{ color: dark ? "rgba(255,255,255,0.9)" : "hsl(var(--muted-foreground))", textShadow: dark ? "0 2px 8px rgba(0,0,0,0.6)" : "none" }}>

          {description}
        </p>
        <div className="tesla-cta-group mt-12">
          <LinkOrA href={ctaHref} className="inline-flex items-center justify-center px-14 py-5 text-base font-semibold tracking-wide rounded-2xl transition-all duration-200 shadow-2xl hover:scale-105" style={{ background: "hsl(217 91% 50%)", color: "white", boxShadow: "0 8px 32px hsl(217 91% 50% / 0.5)" }}>
            {ctaLabel}
          </LinkOrA>
          {secondaryLabel && secondaryHref &&
          <LinkOrA
            href={secondaryHref}
            className="inline-flex items-center justify-center px-14 py-5 text-base font-semibold tracking-wide rounded-2xl border-2 transition-all duration-200 hover:scale-105"
            style={{ borderColor: "rgba(255,255,255,0.6)", color: "white", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}>
            
              {secondaryLabel}
            </LinkOrA>
          }
        </div>
      </div>
    </section>);

};

export default ServiceSection;