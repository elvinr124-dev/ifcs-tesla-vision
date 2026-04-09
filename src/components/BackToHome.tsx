import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

interface BackToHomeProps {
  label?: string;
  to?: string;
}

const BackToHome = ({ label = "Back to Home", to = "/" }: BackToHomeProps) => {
  const { translate } = useLocale();
  return (
    <div className="flex justify-center py-10 content-bg">
      <Link
        to={to}
        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-card border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-accent/40 hover:shadow-xl shadow-lg transition-all duration-300 hover:scale-105"
      >
        <ArrowLeft size={16} />
        {translate(label)}
      </Link>
    </div>
  );
};

export default BackToHome;
