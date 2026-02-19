import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, GraduationCap, Languages, Briefcase, Users, HelpCircle, Mail, LogIn, ShoppingCart, LogOut, Shield } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

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
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const textColor = scrolled ? "hsl(var(--foreground))" : "white";

  const bubbleBase = `flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105`;
  const bubbleScrolled = `bg-foreground/10 hover:bg-accent/20`;
  const bubbleFloat = `bg-white/15 backdrop-blur-md hover:bg-white/25`;
  const bubbleActive = `bg-accent shadow-accent/30`;

  return (
    <nav className={`tesla-nav ${scrolled ? "tesla-nav-scrolled" : ""}`}>
      <Link to="/" className="text-lg font-bold tracking-widest" style={{ color: textColor }}>
        IFCS
      </Link>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-2 flex-wrap">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.href;
          return (
            <Link key={link.label} to={link.href} className="group">
              <div className={`${bubbleBase} ${isActive ? bubbleActive : scrolled ? bubbleScrolled : bubbleFloat}`}>
                <Icon size={16} style={{ color: isActive ? "white" : textColor }} />
                <span className="text-[11px] font-semibold tracking-wide" style={{ color: isActive ? "white" : textColor }}>
                  {link.label}
                </span>
              </div>
            </Link>
          );
        })}

        {/* Cart bubble */}
        <Link to="/cart" className="group">
          <div className={`${bubbleBase} relative ${location.pathname === "/cart" ? bubbleActive : scrolled ? bubbleScrolled : bubbleFloat}`}>
            <ShoppingCart size={16} style={{ color: location.pathname === "/cart" ? "white" : textColor }} />
            <span className="text-[11px] font-semibold tracking-wide" style={{ color: location.pathname === "/cart" ? "white" : textColor }}>
              Cart
            </span>
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-accent text-accent-foreground text-[9px] font-bold flex items-center justify-center shadow-md">
                {totalItems}
              </span>
            )}
          </div>
        </Link>

        {/* Login / User bubble */}
        {user ? (
          <div className="flex items-center gap-2">
            {user.role === "staff" && (
              <Link to="/staff/cart" className="group">
                <div className={`${bubbleBase} ${scrolled ? bubbleScrolled : bubbleFloat}`}>
                  <Shield size={16} style={{ color: textColor }} />
                  <span className="text-[11px] font-semibold tracking-wide" style={{ color: textColor }}>
                    Staff View
                  </span>
                </div>
              </Link>
            )}
            <button
              onClick={() => { logout(); navigate("/"); }}
              className={`${bubbleBase} ${scrolled ? bubbleScrolled : bubbleFloat}`}
            >
              <LogOut size={16} style={{ color: textColor }} />
              <span className="text-[11px] font-semibold tracking-wide" style={{ color: textColor }}>
                Sign Out
              </span>
            </button>
          </div>
        ) : (
          <Link to="/login" className="group">
            <div className={`${bubbleBase} ${location.pathname.startsWith("/login") || location.pathname === "/signup" ? bubbleActive : scrolled ? bubbleScrolled : bubbleFloat}`}>
              <LogIn size={16} style={{ color: location.pathname.startsWith("/login") || location.pathname === "/signup" ? "white" : textColor }} />
              <span className="text-[11px] font-semibold tracking-wide" style={{ color: location.pathname.startsWith("/login") || location.pathname === "/signup" ? "white" : textColor }}>
                Login
              </span>
            </div>
          </Link>
        )}

        <Link to="/evaluations" className="tesla-btn-primary !min-w-0 !px-6 !py-2 text-xs ml-2">
          Apply Now
        </Link>
      </div>

      {/* Mobile toggle */}
      <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)} style={{ color: textColor }}>
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
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md ${isActive ? "bg-accent" : "bg-muted hover:bg-accent/20"}`}>
                    <Icon size={22} className={isActive ? "text-accent-foreground" : "text-foreground"} />
                  </div>
                  <span className="text-xs font-medium text-foreground">{link.label}</span>
                </Link>
              );
            })}

            {/* Cart mobile */}
            <Link to="/cart" className="flex flex-col items-center gap-2" onClick={() => setMobileOpen(false)}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md relative ${location.pathname === "/cart" ? "bg-accent" : "bg-muted hover:bg-accent/20"}`}>
                <ShoppingCart size={22} className={location.pathname === "/cart" ? "text-accent-foreground" : "text-foreground"} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">{totalItems}</span>
                )}
              </div>
              <span className="text-xs font-medium text-foreground">Cart</span>
            </Link>

            {/* Login mobile */}
            {user ? (
              <button
                className="flex flex-col items-center gap-2"
                onClick={() => { logout(); navigate("/"); setMobileOpen(false); }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md bg-muted hover:bg-accent/20">
                  <LogOut size={22} className="text-foreground" />
                </div>
                <span className="text-xs font-medium text-foreground">Sign Out</span>
              </button>
            ) : (
              <Link to="/login" className="flex flex-col items-center gap-2" onClick={() => setMobileOpen(false)}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md ${location.pathname.startsWith("/login") ? "bg-accent" : "bg-muted hover:bg-accent/20"}`}>
                  <LogIn size={22} className={location.pathname.startsWith("/login") ? "text-accent-foreground" : "text-foreground"} />
                </div>
                <span className="text-xs font-medium text-foreground">Login</span>
              </Link>
            )}
          </div>
          <div className="px-6 pb-6">
            <Link to="/evaluations" className="tesla-btn-primary !min-w-0 text-center block" onClick={() => setMobileOpen(false)}>
              Apply Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
