import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToHome from "@/components/BackToHome";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CreditCard, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import brooklynBridge from "@/assets/brooklyn-bridge-night.jpg";
import { useLocale } from "@/context/LocaleContext";

const AddonElectronicSharing = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { translateDual, translate } = useLocale();
  const [payment, setPayment] = useState({ name: "", ifcsId: "", email: "", phone: "", recipientEmail: "", cardHolder: "", cardNumber: "", month: "", year: "", cvv: "" });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms || !agreePrivacy) { toast({ title: "Agreement required", description: "Please agree to terms and privacy policy.", variant: "destructive" }); return; }
    toast({ title: "Payment Submitted", description: "Your electronic sharing order for $25.00 has been submitted." });
    navigate("/dashboard/client");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <img src={brooklynBridge} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="video-overlay" />
        <div className="relative z-10 text-center px-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">{translate("Electronic Sharing")}</h1>
          <p className="text-white/80 mt-2 text-lg">{translate("Share your evaluation report electronically")}</p>
        </div>
      </section>

      <div className="content-bg">
        <div className="max-w-3xl mx-auto px-6 py-16 space-y-8">
          <div className="text-center">
            <Share2 size={48} className="text-accent mx-auto mb-4" />
            <p className="text-muted-foreground">{translate("Send a secure electronic copy of your IFCS evaluation report to any institution or employer.")}</p>
            <p className="text-4xl font-bold text-foreground mt-4">$25.00</p>
          </div>

          <form onSubmit={handlePay} className="space-y-8">
            <Card className="border-border bg-card">
              <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard size={20} className="text-accent" /> {translateDual("Your Information & Payment")}</CardTitle></CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: translateDual("Name on Documents") + " *", key: "name" },
                  { label: translateDual("IFCS ID") + " *", key: "ifcsId", placeholder: "IFCS-XXXXX" },
                  { label: translateDual("Your Email") + " *", key: "email", type: "email" },
                  { label: translateDual("Phone") + " *", key: "phone", type: "tel" },
                ].map(({ label, key, ...rest }) => (
                  <div key={key} className="space-y-1">
                    <label className="text-sm font-medium text-foreground">{label}</label>
                    <Input required value={(payment as any)[key]} onChange={(e) => setPayment({ ...payment, [key]: e.target.value })} {...rest} />
                  </div>
                ))}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-sm font-medium text-foreground">{translateDual("Recipient Email (where to send report)")} *</label>
                  <Input type="email" required value={payment.recipientEmail} onChange={(e) => setPayment({ ...payment, recipientEmail: e.target.value })} />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-sm font-medium text-foreground">{translateDual("Name on Credit Card")} *</label>
                  <Input required value={payment.cardHolder} onChange={(e) => setPayment({ ...payment, cardHolder: e.target.value })} />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-sm font-medium text-foreground">{translateDual("Card Number")} *</label>
                  <Input required value={payment.cardNumber} onChange={(e) => setPayment({ ...payment, cardNumber: e.target.value })} placeholder="•••• •••• •••• ••••" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">{translateDual("Month")} *</label>
                  <Input required value={payment.month} onChange={(e) => setPayment({ ...payment, month: e.target.value })} placeholder="MM" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">{translateDual("Year")} *</label>
                  <Input required value={payment.year} onChange={(e) => setPayment({ ...payment, year: e.target.value })} placeholder="YYYY" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">{translateDual("CVV")} *</label>
                  <Input required value={payment.cvv} onChange={(e) => setPayment({ ...payment, cvv: e.target.value })} placeholder="•••" className="w-28" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox id="terms" checked={agreeTerms} onCheckedChange={(c) => setAgreeTerms(c === true)} />
                  <label htmlFor="terms" className="text-sm text-muted-foreground">{translate("I agree to the")} <span className="text-accent underline cursor-pointer">{translate("Terms and Conditions")}</span></label>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox id="privacy" checked={agreePrivacy} onCheckedChange={(c) => setAgreePrivacy(c === true)} />
                  <label htmlFor="privacy" className="text-sm text-muted-foreground">{translate("I agree to the")} <span className="text-accent underline cursor-pointer">{translate("Privacy Policy")}</span></label>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" size="lg" className="w-full py-6 text-lg rounded-2xl">{translate("Pay")} $25.00</Button>
          </form>
        </div>
      </div>
      <BackToHome />
      <Footer />
    </div>
  );
};

export default AddonElectronicSharing;
