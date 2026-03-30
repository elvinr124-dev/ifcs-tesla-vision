import { useState, useEffect } from "react";
import { X, Cookie } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  const { isEU, isCA, translate } = useLocale();

  useEffect(() => {
    const consent = localStorage.getItem("tfcs_cookie_consent");
    if (!consent && (isEU || isCA)) {
      // Small delay so it doesn't flash on load
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [isEU, isCA]);

  const accept = () => {
    localStorage.setItem("tfcs_cookie_consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("tfcs_cookie_consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 animate-fade-in">
      <div className="max-w-3xl mx-auto bg-background/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Cookie size={24} className="text-accent shrink-0 mt-0.5 sm:mt-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground mb-1">
            {translate("We value your privacy")}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {translate("We use cookies to enhance your browsing experience and analyze site traffic. By clicking \"Accept\", you consent to our use of cookies.")}
            {" "}
            <a href="/privacy" className="text-accent underline hover:no-underline">
              {translate("Privacy Policy")}
            </a>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-border text-foreground hover:bg-muted transition-colors"
          >
            {translate("Decline")}
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-accent text-white hover:bg-accent/90 transition-colors"
          >
            {translate("Accept")}
          </button>
        </div>
        <button
          onClick={decline}
          className="absolute top-3 right-3 sm:hidden text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;
