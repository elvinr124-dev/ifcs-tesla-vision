import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Evaluations", href: "#evaluations" },
  { label: "Translations", href: "#translations" },
  { label: "Consulting", href: "#consulting" },
  { label: "About Us", href: "#about" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`tesla-nav ${scrolled ? "tesla-nav-scrolled" : ""}`}>
      <a href="#" className="text-lg font-bold tracking-widest" style={{ color: scrolled ? "hsl(var(--foreground))" : "white" }}>
        IFCS
      </a>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="text-sm font-medium tracking-wide transition-opacity hover:opacity-70"
            style={{ color: scrolled ? "hsl(var(--foreground))" : "white" }}
          >
            {link.label}
          </a>
        ))}
        <a
          href="https://ifcsevals.com/application"
          target="_blank"
          rel="noopener noreferrer"
          className="tesla-btn-primary !min-w-0 !px-6 !py-2 text-xs"
        >
          Apply Now
        </a>
      </div>

      {/* Mobile toggle */}
      <button
        className="md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{ color: scrolled ? "hsl(var(--foreground))" : "white" }}
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border md:hidden">
          <div className="flex flex-col p-6 gap-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="https://ifcsevals.com/application"
              target="_blank"
              rel="noopener noreferrer"
              className="tesla-btn-primary !min-w-0 text-center"
            >
              Apply Now
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
