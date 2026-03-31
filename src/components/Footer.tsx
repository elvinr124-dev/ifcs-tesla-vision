import { Link } from "react-router-dom";
import { useLocale } from "@/context/LocaleContext";

const Footer = () => {
  const { translate } = useLocale();

  const serviceLinks = [
    { label: "Academic Evaluations", to: "/evaluations" },
    { label: "Translations", to: "/translations" },
    { label: "Consulting", to: "/consulting" },
    { label: "Payment", to: "/payment" },
  ];

  const companyLinks = [
    { label: "About Us", to: "/about" },
    { label: "For Individuals", to: "/for-individuals" },
    { label: "FAQ", to: "/faq" },
    { label: "Contact Us", to: "/contact" },
    { label: "Blog", to: "/blog" },
  ];

  return (
    <footer className="bg-primary py-16 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <h3 className="text-lg font-bold tracking-widest text-primary-foreground mb-4">IFCS</h3>
            <p className="text-sm text-primary-foreground/60 leading-relaxed">
              {translate("Institute of Foreign Credential Services. Trusted by universities, employers, and government agencies across the U.S.")}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-primary-foreground/40 mb-4">{translate("Services")}</h4>
            <ul className="space-y-2">
              {serviceLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    {translate(item.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-primary-foreground/40 mb-4">{translate("Company")}</h4>
            <ul className="space-y-2">
              {companyLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    {translate(item.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-primary-foreground/40 mb-4">{translate("Contact")}</h4>
            <div className="space-y-2 text-sm text-primary-foreground/70">
              <p>6 Cedar Street</p>
              <p>Dobbs Ferry, NY 10522</p>
              <a href="mailto:info@ifcsevals.com" className="block hover:text-primary-foreground transition-colors">
                info@ifcsevals.com
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-primary-foreground/40">
            © {new Date().getFullYear()} {translate("Institute of Foreign Credential Services. All rights reserved.")}
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-xs text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors">
              {translate("Privacy Policy")}
            </Link>
            <Link to="/terms" className="text-xs text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors">
              {translate("Terms of Service")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
