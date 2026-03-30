import { useState, useRef, useEffect } from "react";
import { Globe, Search, Check, Loader2 } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

const LanguageSelector = ({ scrolled, hasDarkHero }: { scrolled: boolean; hasDarkHero: boolean }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { locale, setLanguage, availableLanguages, isTranslating } = useLocale();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const useScrolledStyle = scrolled || !hasDarkHero;
  const textColor = useScrolledStyle ? "hsl(var(--foreground))" : "white";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const filtered = availableLanguages.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(search.toLowerCase()) ||
      l.code.toLowerCase().includes(search.toLowerCase())
  );

  const bubbleBase = `flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105`;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`${bubbleBase} ${
          useScrolledStyle
            ? "bg-foreground/10 hover:bg-accent/20"
            : "bg-white/15 backdrop-blur-md hover:bg-white/25"
        }`}
        aria-label="Change language"
        title={`Language: ${locale.language}`}
      >
        {isTranslating ? (
          <Loader2 size={20} className="animate-spin" style={{ color: textColor }} />
        ) : (
          <Globe size={20} style={{ color: textColor }} />
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-3 z-50 animate-fade-in">
          <div className="bg-background/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-4 w-[280px]">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-accent mb-3">
              Select Language
            </p>

            {/* Search */}
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search languages..."
                className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-border bg-muted/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>

            {/* Detected info */}
            <div className="text-[10px] text-muted-foreground mb-2 px-1">
              <span className="font-semibold">Detected:</span> {locale.country} ({locale.countryCode})
            </div>

            {/* Language list */}
            <div className="max-h-[280px] overflow-y-auto space-y-0.5 custom-scrollbar">
              {filtered.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                    locale.languageCode === lang.code
                      ? "bg-accent/10 text-accent"
                      : "hover:bg-muted/60 text-foreground"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{lang.name}</p>
                    <p className="text-[10px] text-muted-foreground">{lang.nativeName}</p>
                  </div>
                  {locale.languageCode === lang.code && (
                    <Check size={16} className="text-accent shrink-0" />
                  )}
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No languages found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
