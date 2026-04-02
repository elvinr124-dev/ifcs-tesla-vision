import { Link, useLocation, Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/context/LocaleContext";

const OrderConfirmation = () => {
  const location = useLocation();
  const { translate } = useLocale();
  const state = location.state as {
    applicationId?: string;
    email?: string;
    serviceName?: string;
    totalPrice?: number;
  } | null;

  if (!state?.applicationId) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-28 pb-24 px-6 md:px-12 max-w-3xl mx-auto">
        <div className="rounded-3xl bg-accent text-accent-foreground p-10 md:p-14 text-center space-y-6">
          <CheckCircle2 size={56} className="mx-auto" />
          <h1 className="text-3xl md:text-4xl font-bold">{translate("Order Successful!")}</h1>
          <div className="space-y-2">
            <p className="text-lg opacity-90">{translate("Application ID")}</p>
            <p className="text-4xl font-bold tracking-wider">{state.applicationId}</p>
          </div>
          {state.serviceName && (
            <p className="text-sm opacity-80">{state.serviceName}</p>
          )}
          {state.totalPrice !== undefined && (
            <p className="text-lg font-semibold">{translate("Total")}: ${state.totalPrice.toFixed(2)}</p>
          )}
          {state.email && (
            <p className="text-sm opacity-80">
              {translate("A confirmation email has been sent to")} {state.email}
            </p>
          )}
        </div>

        <div className="mt-8 text-center space-y-4">
          <p className="text-muted-foreground">
            {translate("Your order has been added to your dashboard. You can track its progress and view your application details there.")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/dashboard/client">
              <Button className="gap-2">
                {translate("Go to My Dashboard")} <ArrowRight size={16} />
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline">{translate("Back to Home")}</Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OrderConfirmation;
