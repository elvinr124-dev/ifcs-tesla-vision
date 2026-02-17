import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, GraduationCap, Languages, Briefcase, Users, HelpCircle, Mail } from "lucide-react";

const navLinks = [
  { label: "Evaluations", href: "/evaluations", icon: GraduationCap },
  { label: "Translations", href: "/translations", icon: Languages },
  { label: "Consulting", href: "/consulting", icon: Briefcase },
  { label: "About Us", href: "/about", icon: Users },
  { label: "FAQ", href: "/faq", icon: HelpCircle },
  { label: "Contact", href: "/contact", icon: Mail },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const textColor = scrolled ? "hsl(var(--foreground))" : "white";

  return (
    <nav className={`tesla-nav ${scrolled ? "tesla-nav-scrolled" : ""}`}>
      <Link to="/" className="text-lg font-bold tracking-widest" style={{ color: textColor }}>
        IFCS
      </Link>

      {/* Desktop nav — bubble icons */}
      <div className="hidden md:flex items-center gap-2">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.href;
          return (
            <Link
              key={link.label}
              to={link.href}
              className="group flex flex-col items-center gap-1 px-3 py-1"
            >
              <div
                className={`
                  w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200
                  shadow-md hover:shadow-lg hover:scale-110
                  ${isActive
                    ? "bg-accent shadow-accent/30"
                    : scrolled
                      ? "bg-foreground/10 hover:bg-accent/20"
                      : "bg-white/15 backdrop-blur-md hover:bg-white/25"
                  }
                `}
              >
                <Icon
                  size={18}
                  style={{ color: isActive ? "white" : textColor }}
                />
              </div>
              <span
                className="text-[10px] font-medium tracking-wide transition-opacity"
                style={{ color: textColor }}
              >
                {link.label}
              </span>
            </Link>
          );
        })}
        <Link
          to="/evaluations"
          className="tesla-btn-primary !min-w-0 !px-6 !py-2 text-xs ml-2"
        >
          Apply Now
        </Link>
      </div>

      {/* Mobile toggle */}
      <button
        className="md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{ color: textColor }}
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border md:hidden">
          <div className="grid grid-cols-3 gap-4 p-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  className="flex flex-col items-center gap-2"
                  onClick={() => setMobileOpen(false)}
                >
                  <div
                    className={`
                      w-14 h-14 rounded-2xl flex items-center justify-center shadow-md
                      ${isActive ? "bg-accent" : "bg-muted hover:bg-accent/20"}
                    `}
                  >
                    <Icon size={22} className={isActive ? "text-accent-foreground" : "text-foreground"} />
                  </div>
                  <span className="text-xs font-medium text-foreground">{link.label}</span>
                </Link>
              );
            })}
          </div>
          <div className="px-6 pb-6">
            <Link
              to="/evaluations"
              className="tesla-btn-primary !min-w-0 text-center block"
              onClick={() => setMobileOpen(false)}
            >
              Apply Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
