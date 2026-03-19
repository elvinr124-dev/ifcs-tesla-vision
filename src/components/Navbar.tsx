import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, GraduationCap, Languages, ShoppingCart, LogIn, LogOut, LayoutDashboard, Shield, Briefcase, Users, HelpCircle, Mail, Copy, User, ChevronDown, DollarSign, Headphones } from "lucide-react";
import NavSearchBar from "@/components/NavSearchBar";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import serviceMilitary from "@/assets/service-military.jpg";
import serviceEducation from "@/assets/service-education.jpg";
import serviceCosmetology from "@/assets/service-cosmetology.jpg";
import serviceEmployment from "@/assets/service-employment.jpg";
import serviceHealth from "@/assets/service-health.jpg";
import serviceGraduate from "@/assets/service-graduate.jpg";
import serviceHsUni from "@/assets/service-highschool-uni.jpg";

const evalPreviews = [
  { title: "General Analysis", price: 100, image: serviceMilitary, slug: "general-analysis" },
  { title: "General Analysis + GPA", price: 150, image: serviceEducation, slug: "general-analysis-plus-gpa" },
  { title: "Cosmetology CBC", price: 170, image: serviceCosmetology, slug: "cosmetology-course-by-course" },
  { title: "Course-by-Course", price: 190, image: serviceEmployment, slug: "course-by-course" },
  { title: "Health Professions CBC", price: 230, image: serviceHealth, slug: "health-professions-course-by-course" },
  { title: "Comprehensive CBC", price: 290, image: serviceGraduate, slug: "comprehensive-course-by-course" },
  { title: "HS & University CBC", price: 295, image: serviceHsUni, slug: "high-school-and-university-course-by-course" },
];

const allLinks = [
  { label: "Evaluations", href: "/evaluations", icon: GraduationCap },
  { label: "Translations", href: "/translations", icon: Languages },
  { label: "Duplicate Report", href: "/duplicate-reports", icon: Copy },
  { label: "Pricing", href: "/pricing", icon: DollarSign },
  { label: "Consulting", href: "/consulting", icon: Briefcase },
  { label: "About Us", href: "/about", icon: Users },
  { label: "FAQ", href: "/faq", icon: HelpCircle },
  { label: "Contact", href: "/contact", icon: Mail },
  { label: "Cart", href: "/cart", icon: ShoppingCart },
  { label: "Login", href: "/login", icon: LogIn },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [evalHover, setEvalHover] = useState(false);
  const evalTimeout = useRef<ReturnType<typeof setTimeout>>();
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { user, logout } = useAuth();

  // Pages that have a dark hero where transparent bubbles look good
  const darkHeroPages = ["/", "/evaluations", "/translations", "/about", "/faq", "/contact", "/consulting", "/duplicate-reports", "/cart", "/blog"];
  const hasDarkHero = darkHeroPages.some(p => p === "/" ? location.pathname === "/" : location.pathname.startsWith(p));

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Always use scrolled style on pages without dark heroes
  const useScrolledStyle = scrolled || !hasDarkHero;

  const handleEvalEnter = () => {
    clearTimeout(evalTimeout.current);
    setEvalHover(true);
  };
  const handleEvalLeave = () => {
    evalTimeout.current = setTimeout(() => setEvalHover(false), 200);
  };

  const textColor = useScrolledStyle ? "hsl(var(--foreground))" : "white";

  const bubbleBase = `flex items-center gap-3 px-6 py-3.5 rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105`;
  const bubbleScrolled = `bg-foreground/10 hover:bg-accent/20`;
  const bubbleFloat = `bg-white/15 backdrop-blur-md hover:bg-white/25`;
  const bubbleActive = `bg-accent shadow-accent/30`;

  return (
    <nav className={`tesla-nav ${useScrolledStyle ? "tesla-nav-scrolled" : ""}`}>
      <Link to="/" className="text-2xl font-bold tracking-widest shrink-0" style={{ color: textColor }}>
        TFCS
      </Link>

      {/* Search Bar - right next to logo */}
      <div className="hidden md:flex ml-3">
        <NavSearchBar scrolled={useScrolledStyle} hasDarkHero={hasDarkHero} />
      </div>

      <div className="flex-1" />

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-2.5 shrink-0">

        {/* Get an Evaluation - with hover dropdown */}
        <div
          className="relative"
          onMouseEnter={handleEvalEnter}
          onMouseLeave={handleEvalLeave}
        >
          <Link to="/evaluations" className="group">
            <div
              className={`${bubbleBase} ${
                location.pathname === "/evaluations"
                  ? bubbleActive
                  : "bg-accent shadow-lg shadow-accent/30 hover:bg-accent/90"
              }`}
            >
              <GraduationCap size={20} className="text-white" />
              <span className="text-sm font-semibold tracking-wide text-white">
                Get an Evaluation
              </span>
            </div>
          </Link>

          {/* Lucid-style dropdown */}
          {evalHover && (
            <div
              className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50 animate-fade-in"
              onMouseEnter={handleEvalEnter}
              onMouseLeave={handleEvalLeave}
            >
              <div className="bg-background/95 backdrop-blur-xl border border-border rounded-3xl shadow-2xl p-6 min-w-[800px]">
                <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-accent mb-4">Our Evaluation Services</p>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {evalPreviews.map((ev) => (
                    <Link
                      key={ev.title}
                      to={`/evaluations#${ev.slug}`}
                      onClick={() => setEvalHover(false)}
                      className="flex-shrink-0 w-[140px] group/card"
                    >
                      <div className="w-[140px] h-[100px] rounded-2xl overflow-hidden mb-2 border border-border/50 shadow-sm group-hover/card:shadow-lg group-hover/card:scale-105 transition-all duration-300">
                        <img src={ev.image} alt={ev.title} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-xs font-bold text-foreground leading-tight">{ev.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">From ${ev.price}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Duplicate Report */}
        <Link to="/duplicate-reports" className="group">
          <div className={`${bubbleBase} ${location.pathname === "/duplicate-reports" ? bubbleActive : useScrolledStyle ? bubbleScrolled : bubbleFloat}`}>
            <Copy size={20} style={{ color: location.pathname === "/duplicate-reports" ? "white" : textColor }} />
            <span className="text-sm font-semibold tracking-wide" style={{ color: location.pathname === "/duplicate-reports" ? "white" : textColor }}>
              Duplicate Report
            </span>
          </div>
        </Link>

        {/* Translations */}
        <Link to="/translations" className="group">
          <div className={`${bubbleBase} ${location.pathname === "/translations" ? bubbleActive : useScrolledStyle ? bubbleScrolled : bubbleFloat}`}>
            <Languages size={20} style={{ color: location.pathname === "/translations" ? "white" : textColor }} />
            <span className="text-sm font-semibold tracking-wide" style={{ color: location.pathname === "/translations" ? "white" : textColor }}>
              Translations
            </span>
          </div>
        </Link>

        {/* My Dashboard (when logged in) */}
        {user && (
          <Link to={user.role === "staff" ? "/dashboard/staff" : "/dashboard/client"} className="group">
            <div className={`${bubbleBase} ${location.pathname.startsWith("/dashboard") ? bubbleActive : useScrolledStyle ? bubbleScrolled : bubbleFloat}`}>
              <LayoutDashboard size={20} style={{ color: location.pathname.startsWith("/dashboard") ? "white" : textColor }} />
              <span className="text-sm font-semibold tracking-wide" style={{ color: location.pathname.startsWith("/dashboard") ? "white" : textColor }}>
                My Dashboard
              </span>
            </div>
          </Link>
        )}

        {/* Cart bubble */}
        <Link to="/cart" className="group">
          <div className={`${bubbleBase} relative ${location.pathname === "/cart" ? bubbleActive : useScrolledStyle ? bubbleScrolled : bubbleFloat}`}>
            <ShoppingCart size={20} style={{ color: location.pathname === "/cart" ? "white" : textColor }} />
            <span className="text-sm font-semibold tracking-wide" style={{ color: location.pathname === "/cart" ? "white" : textColor }}>
              Cart
            </span>
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center shadow-md">
                {totalItems}
              </span>
            )}
          </div>
        </Link>

        {/* Login / Sign Out */}
        {user ? (
          <div className="flex items-center gap-2">
            {user.role === "staff" && (
              <Link to="/staff/cart" className="group">
                <div className={`${bubbleBase} ${useScrolledStyle ? bubbleScrolled : bubbleFloat}`}>
                  <Shield size={20} style={{ color: textColor }} />
                  <span className="text-sm font-semibold tracking-wide" style={{ color: textColor }}>
                    Staff View
                  </span>
                </div>
              </Link>
            )}
            <button
              onClick={() => { logout(); navigate("/"); }}
              className={`${bubbleBase} ${useScrolledStyle ? bubbleScrolled : bubbleFloat}`}
            >
              <LogOut size={20} style={{ color: textColor }} />
              <span className="text-sm font-semibold tracking-wide" style={{ color: textColor }}>
                Sign Out
              </span>
            </button>
          </div>
        ) : (
          <Link to="/login" className="group">
            <div
              className={`flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 ${
                location.pathname.startsWith("/login") || location.pathname === "/signup"
                  ? "bg-accent shadow-accent/30"
                  : useScrolledStyle
                    ? "bg-foreground/10 hover:bg-accent/20"
                    : "bg-white/15 backdrop-blur-md hover:bg-white/25"
              }`}
            >
              <User size={20} style={{ color: location.pathname.startsWith("/login") || location.pathname === "/signup" ? "white" : textColor }} />
            </div>
          </Link>
        )}

        {/* Sandwich menu */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <button
              className={`${bubbleBase} ${useScrolledStyle ? bubbleScrolled : bubbleFloat} ml-1`}
              aria-label="Open menu"
            >
              <Menu size={22} style={{ color: textColor }} />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 bg-background border-l border-border p-0">
            <SheetHeader className="p-6 border-b border-border">
              <SheetTitle className="text-xl font-bold tracking-widest text-foreground">TFCS</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col py-4">
              {allLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.href;
                if (link.href === "/login" && user) return null;
                return (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-4 px-6 py-4 transition-all duration-200 ${
                      isActive
                        ? "bg-accent/10 text-accent border-r-4 border-accent"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon size={20} className={isActive ? "text-accent" : "text-muted-foreground"} />
                    <span className="text-sm font-semibold tracking-wide">{link.label}</span>
                    {link.href === "/cart" && totalItems > 0 && (
                      <span className="ml-auto w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </Link>
                );
              })}

              {user && (
                <>
                  <Link
                    to={user.role === "staff" ? "/dashboard/staff" : "/dashboard/client"}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-4 px-6 py-4 transition-all duration-200 ${
                      location.pathname.startsWith("/dashboard")
                        ? "bg-accent/10 text-accent border-r-4 border-accent"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <LayoutDashboard size={20} className={location.pathname.startsWith("/dashboard") ? "text-accent" : "text-muted-foreground"} />
                    <span className="text-sm font-semibold tracking-wide">My Dashboard</span>
                  </Link>
                  <button
                    onClick={() => { logout(); navigate("/"); setSidebarOpen(false); }}
                    className="flex items-center gap-4 px-6 py-4 text-foreground hover:bg-muted transition-all duration-200"
                  >
                    <LogOut size={20} className="text-muted-foreground" />
                    <span className="text-sm font-semibold tracking-wide">Sign Out</span>
                  </button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Mobile toggle */}
      <Sheet>
        <SheetTrigger asChild>
          <button className="md:hidden" style={{ color: textColor }}>
            <Menu size={28} />
          </button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 bg-background border-l border-border p-0">
          <SheetHeader className="p-6 border-b border-border">
            <SheetTitle className="text-xl font-bold tracking-widest text-foreground">TFCS</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col py-4">
            {allLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.href;
              if (link.href === "/login" && user) return null;
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`flex items-center gap-4 px-6 py-4 transition-all duration-200 ${
                    isActive
                      ? "bg-accent/10 text-accent border-r-4 border-accent"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon size={20} className={isActive ? "text-accent" : "text-muted-foreground"} />
                  <span className="text-sm font-semibold tracking-wide">{link.label}</span>
                  {link.href === "/cart" && totalItems > 0 && (
                    <span className="ml-auto w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>
              );
            })}

            {user && (
              <>
                <Link
                  to={user.role === "staff" ? "/dashboard/staff" : "/dashboard/client"}
                  className={`flex items-center gap-4 px-6 py-4 transition-all duration-200 ${
                    location.pathname.startsWith("/dashboard")
                      ? "bg-accent/10 text-accent border-r-4 border-accent"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <LayoutDashboard size={20} className={location.pathname.startsWith("/dashboard") ? "text-accent" : "text-muted-foreground"} />
                  <span className="text-sm font-semibold tracking-wide">My Dashboard</span>
                </Link>
                <button
                  onClick={() => { logout(); navigate("/"); }}
                  className="flex items-center gap-4 px-6 py-4 text-foreground hover:bg-muted transition-all duration-200"
                >
                  <LogOut size={20} className="text-muted-foreground" />
                  <span className="text-sm font-semibold tracking-wide">Sign Out</span>
                </button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
};

export default Navbar;
