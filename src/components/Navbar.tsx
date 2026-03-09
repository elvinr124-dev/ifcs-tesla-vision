import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, GraduationCap, Languages, ShoppingCart, LogIn, LogOut, LayoutDashboard, Shield, Briefcase, Users, HelpCircle, Mail } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const headerLinks = [
  { label: "Evaluations", href: "/evaluations", icon: GraduationCap },
  { label: "Translations", href: "/translations", icon: Languages },
];

const allLinks = [
  { label: "Evaluations", href: "/evaluations", icon: GraduationCap },
  { label: "Translations", href: "/translations", icon: Languages },
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

  const bubbleBase = `flex items-center gap-2.5 px-5 py-3 rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105`;
  const bubbleScrolled = `bg-foreground/10 hover:bg-accent/20`;
  const bubbleFloat = `bg-white/15 backdrop-blur-md hover:bg-white/25`;
  const bubbleActive = `bg-accent shadow-accent/30`;

  return (
    <nav className={`tesla-nav ${scrolled ? "tesla-nav-scrolled" : ""}`}>
      <Link to="/" className="text-xl font-bold tracking-widest" style={{ color: textColor }}>
        IFCS
      </Link>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-2">
        {headerLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.href;
          return (
            <Link key={link.label} to={link.href} className="group">
              <div className={`${bubbleBase} ${isActive ? bubbleActive : scrolled ? bubbleScrolled : bubbleFloat}`}>
                <Icon size={18} style={{ color: isActive ? "white" : textColor }} />
                <span className="text-xs font-semibold tracking-wide" style={{ color: isActive ? "white" : textColor }}>
                  {link.label}
                </span>
              </div>
            </Link>
          );
        })}

        {/* Cart bubble */}
        <Link to="/cart" className="group">
          <div className={`${bubbleBase} relative ${location.pathname === "/cart" ? bubbleActive : scrolled ? bubbleScrolled : bubbleFloat}`}>
            <ShoppingCart size={18} style={{ color: location.pathname === "/cart" ? "white" : textColor }} />
            <span className="text-xs font-semibold tracking-wide" style={{ color: location.pathname === "/cart" ? "white" : textColor }}>
              Cart
            </span>
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center shadow-md">
                {totalItems}
              </span>
            )}
          </div>
        </Link>

        {/* Login / User bubble */}
        {user ? (
          <div className="flex items-center gap-2">
            <Link to={user.role === "staff" ? "/dashboard/staff" : "/dashboard/client"} className="group">
              <div className={`${bubbleBase} ${location.pathname.startsWith("/dashboard") ? bubbleActive : scrolled ? bubbleScrolled : bubbleFloat}`}>
                <LayoutDashboard size={18} style={{ color: location.pathname.startsWith("/dashboard") ? "white" : textColor }} />
                <span className="text-xs font-semibold tracking-wide" style={{ color: location.pathname.startsWith("/dashboard") ? "white" : textColor }}>
                  My Dashboard
                </span>
              </div>
            </Link>
            {user.role === "staff" && (
              <Link to="/staff/cart" className="group">
                <div className={`${bubbleBase} ${scrolled ? bubbleScrolled : bubbleFloat}`}>
                  <Shield size={18} style={{ color: textColor }} />
                  <span className="text-xs font-semibold tracking-wide" style={{ color: textColor }}>
                    Staff View
                  </span>
                </div>
              </Link>
            )}
            <button
              onClick={() => { logout(); navigate("/"); }}
              className={`${bubbleBase} ${scrolled ? bubbleScrolled : bubbleFloat}`}
            >
              <LogOut size={18} style={{ color: textColor }} />
              <span className="text-xs font-semibold tracking-wide" style={{ color: textColor }}>
                Sign Out
              </span>
            </button>
          </div>
        ) : (
          <Link to="/login" className="group">
            <div className={`${bubbleBase} ${location.pathname.startsWith("/login") || location.pathname === "/signup" ? bubbleActive : scrolled ? bubbleScrolled : bubbleFloat}`}>
              <LogIn size={18} style={{ color: location.pathname.startsWith("/login") || location.pathname === "/signup" ? "white" : textColor }} />
              <span className="text-xs font-semibold tracking-wide" style={{ color: location.pathname.startsWith("/login") || location.pathname === "/signup" ? "white" : textColor }}>
                Login
              </span>
            </div>
          </Link>
        )}

        {/* Apply Now → goes to login if not logged in */}
        <Link
          to={user ? "/application" : "/login"}
          className="inline-flex items-center justify-center px-7 py-3 text-sm font-semibold rounded-2xl ml-2 transition-all duration-200 hover:scale-105 shadow-lg"
          style={{ background: "hsl(var(--accent))", color: "hsl(var(--accent-foreground))" }}
        >
          Apply Now
        </Link>

        {/* Sandwich menu → Sheet sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <button
              className={`${bubbleBase} ${scrolled ? bubbleScrolled : bubbleFloat} ml-1`}
              aria-label="Open menu"
            >
              <Menu size={20} style={{ color: textColor }} />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 bg-background border-l border-border p-0">
            <SheetHeader className="p-6 border-b border-border">
              <SheetTitle className="text-xl font-bold tracking-widest text-foreground">IFCS</SheetTitle>
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

              <div className="px-6 pt-6">
                <Link
                  to={user ? "/application" : "/login"}
                  onClick={() => setSidebarOpen(false)}
                  className="block w-full text-center px-7 py-3 text-sm font-semibold rounded-2xl bg-accent text-accent-foreground shadow-lg hover:bg-accent/90 transition-all duration-200"
                >
                  Apply Now
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Mobile toggle → also opens Sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <button className="md:hidden" style={{ color: textColor }}>
            <Menu size={26} />
          </button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 bg-background border-l border-border p-0">
          <SheetHeader className="p-6 border-b border-border">
            <SheetTitle className="text-xl font-bold tracking-widest text-foreground">IFCS</SheetTitle>
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

            <div className="px-6 pt-6">
              <Link
                to={user ? "/application" : "/login"}
                className="block w-full text-center px-7 py-3 text-sm font-semibold rounded-2xl bg-accent text-accent-foreground shadow-lg hover:bg-accent/90 transition-all duration-200"
              >
                Apply Now
              </Link>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
};

export default Navbar;
