import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

const searchItems = [
  // Evaluations
  { label: "General Analysis", path: "/evaluations", hash: "general-analysis", keywords: ["general", "analysis", "evaluation", "basic"] },
  { label: "General Analysis + GPA", path: "/evaluations", hash: "general-analysis-plus-gpa", keywords: ["general", "gpa", "evaluation"] },
  { label: "Cosmetology CBC", path: "/evaluations", hash: "cosmetology-course-by-course", keywords: ["cosmetology", "cbc", "course"] },
  { label: "Course-by-Course", path: "/evaluations", hash: "course-by-course", keywords: ["course", "cbc", "evaluation"] },
  { label: "Health Professions CBC", path: "/evaluations", hash: "health-professions-course-by-course", keywords: ["health", "professions", "cbc", "nursing", "medical"] },
  { label: "Comprehensive CBC", path: "/evaluations", hash: "comprehensive-course-by-course", keywords: ["comprehensive", "cbc", "course"] },
  { label: "HS & University CBC", path: "/evaluations", hash: "high-school-and-university-course-by-course", keywords: ["high school", "university", "cbc", "hs"] },
  
  // Processing speeds
  { label: "Course-by-Course · 3-Day Rush", path: "/evaluations", hash: "course-by-course", keywords: ["course", "3 day", "rush", "3-day"] },
  { label: "Course-by-Course · 24-Hour Rush", path: "/evaluations", hash: "course-by-course", keywords: ["course", "24 hour", "rush", "24-hour", "24 hours"] },
  { label: "General Analysis · 3-Day Rush", path: "/evaluations", hash: "general-analysis", keywords: ["general", "3 day", "rush"] },
  { label: "General Analysis · 24-Hour Rush", path: "/evaluations", hash: "general-analysis", keywords: ["general", "24 hour", "rush", "24 hours"] },

  // Pages
  { label: "Evaluations", path: "/evaluations", keywords: ["evaluations", "credential", "degree"] },
  { label: "Translations", path: "/translations", keywords: ["translations", "translate", "document"] },
  { label: "Consulting", path: "/consulting", keywords: ["consulting", "consult", "advice"] },
  { label: "About Us", path: "/about", keywords: ["about", "company", "team", "who"] },
  { label: "FAQ", path: "/faq", keywords: ["faq", "questions", "help", "frequently"] },
  { label: "Contact", path: "/contact", keywords: ["contact", "email", "phone", "reach"] },
  { label: "Blog", path: "/blog", keywords: ["blog", "articles", "posts", "news"] },
  { label: "For Individuals", path: "/for-individuals", keywords: ["individuals", "personal", "student"] },
  { label: "For Institutions", path: "/for-institutions", keywords: ["institutions", "school", "university", "employer"] },
  { label: "Duplicate Reports", path: "/duplicate-reports", keywords: ["duplicate", "report", "copy", "extra"] },
  { label: "Login", path: "/login", keywords: ["login", "sign in", "account"] },
  { label: "Sign Up", path: "/signup", keywords: ["sign up", "register", "create account"] },
  { label: "Cart", path: "/cart", keywords: ["cart", "checkout", "order"] },
  { label: "Privacy Policy", path: "/privacy-policy", keywords: ["privacy", "policy", "data"] },
  { label: "Terms of Service", path: "/terms-of-service", keywords: ["terms", "service", "legal"] },
];

interface NavSearchBarProps {
  scrolled: boolean;
  hasDarkHero: boolean;
}

const NavSearchBar = ({ scrolled, hasDarkHero }: NavSearchBarProps) => {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const useScrolledStyle = scrolled || !hasDarkHero;

  const filtered = query.trim().length > 0
    ? searchItems.filter(item => {
        const q = query.toLowerCase();
        return (
          item.label.toLowerCase().includes(q) ||
          item.keywords.some(k => k.includes(q))
        );
      }).slice(0, 8)
    : [];

  const handleSelect = (item: typeof searchItems[0]) => {
    setQuery("");
    setFocused(false);
    if (item.hash) {
      navigate(`${item.path}#${item.hash}`);
    } else {
      navigate(item.path);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && filtered.length > 0) {
      handleSelect(filtered[0]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const textColor = useScrolledStyle ? "hsl(var(--foreground))" : "white";

  return (
    <div ref={wrapperRef} className="relative">
      <div
        className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all duration-200 shadow-md ${
          useScrolledStyle
            ? "bg-foreground/10 hover:bg-accent/20"
            : "bg-white/15 backdrop-blur-md hover:bg-white/25"
        }`}
      >
        <Search size={18} style={{ color: textColor }} className="shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search for Evaluations"
          className="bg-transparent border-none outline-none text-sm font-semibold tracking-wide w-[28rem] placeholder:opacity-70"
          style={{ color: textColor }}
        />
      </div>

      {focused && filtered.length > 0 && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-background/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl py-2 z-50 animate-fade-in">
          {filtered.map((item, i) => (
            <button
              key={`${item.label}-${i}`}
              onClick={() => handleSelect(item)}
              className="w-full text-left px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent/10 transition-colors flex items-center gap-2"
            >
              <Search size={14} className="text-muted-foreground shrink-0" />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NavSearchBar;
