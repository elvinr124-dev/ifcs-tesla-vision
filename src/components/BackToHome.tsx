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
    <div className="text-center pb-16 pt-8 content-bg">
      <Link
        to={to}
        className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full border border-border bg-card text-sm font-medium text-muted-foreground hover:text-foreground hover:border-accent/40 hover:shadow-lg transition-all duration-300"
      >
        <ArrowLeft size={16} />
        {translate(label)}
      </Link>
    </div>
  );
};

export default BackToHome;
