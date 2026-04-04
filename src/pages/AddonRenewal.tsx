import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToHome from "@/components/BackToHome";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CreditCard, RefreshCw, ShoppingCart, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import brooklynBridge from "@/assets/brooklyn-bridge-night.jpg";
import { useLocale } from "@/context/LocaleContext";

const AddonRenewal = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { translateDual, translate } = useLocale();
  const [payment, setPayment] = useState({ name: "", ifcsId: "", email: "", phone: "", cardHolder: "", cardNumber: "", month: "", year: "", cvv: "" });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [termsPopupOpen, setTermsPopupOpen] = useState(false);
  const [privacyPopupOpen, setPrivacyPopupOpen] = useState(false);
  const [termsSignature, setTermsSignature] = useState("");
  const [privacySignature, setPrivacySignature] = useState("");

  const handleTermsCheck = (checked: boolean | "indeterminate") => {
    if (checked === true) setTermsPopupOpen(true);
    else { setAgreeTerms(false); setTermsSignature(""); }
  };
  const handlePrivacyCheck = (checked: boolean | "indeterminate") => {
    if (checked === true) setPrivacyPopupOpen(true);
    else { setAgreePrivacy(false); setPrivacySignature(""); }
  };
  const confirmTermsSignature = () => { if (!termsSignature.trim()) return; setAgreeTerms(true); setTermsPopupOpen(false); };
  const confirmPrivacySignature = () => { if (!privacySignature.trim()) return; setAgreePrivacy(true); setPrivacyPopupOpen(false); };

  const validate = () => {
    if (!agreeTerms || !agreePrivacy) { toast({ title: "Agreement required", description: "Please agree to terms and privacy policy.", variant: "destructive" }); return false; }
    return true;
  };

  const handleAddToCart = () => {
    if (!validate()) return;
    addItem({ serviceTitle: "Renewal (5 Years)", processingKey: "standard", processingLabel: "Renewal", processingTime: "5-7 Business Days", price: 100 });
    toast({ title: "Added to Cart", description: "Renewal (5 Years) ($100.00) added to your cart." });
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    toast({ title: "Payment Submitted", description: "Your renewal order for $100.00 has been submitted. Your report will be valid for 5 more years." });
    navigate("/dashboard/client");
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <img src={brooklynBridge} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="video-overlay" />
        <div className="relative z-10 text-center px-6">
          <h1 className="text-5xl md:text-8xl font-bold tracking-tight text-white hero-text-shadow">{translate("Renew Report")}</h1>
          <p className="text-white/80 mt-4 text-lg md:text-xl">{translate("Extend your evaluation validity for 5 more years")}</p>
        </div>
      </section>

      <div className="content-bg">
        <div className="max-w-3xl mx-auto px-6 py-16 space-y-8">
          <div className="text-center">
            <RefreshCw size={48} className="text-accent mx-auto mb-4" />
            <p className="text-muted-foreground">{translate("Renew your expired or expiring IFCS evaluation report. Your renewed report will be valid for an additional 5 years from the date of renewal.")}</p>
            <p className="text-4xl font-bold text-foreground mt-4">$100.00</p>
            <p className="text-sm text-muted-foreground mt-1">{translate("Renewal — Up to 5 Years")}</p>
          </div>

          <form onSubmit={handlePay} className="space-y-8">
            <Card className="border-border bg-card">
              <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard size={20} className="text-accent" /> {translateDual("Your Information & Payment")}</CardTitle></CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-sm font-medium text-foreground">{translateDual("Name on Documents")} *</label><Input required value={payment.name} onChange={(e) => setPayment({ ...payment, name: e.target.value })} /></div>
                <div className="space-y-1"><label className="text-sm font-medium text-foreground">{translateDual("IFCS ID")} *</label><Input required value={payment.ifcsId} onChange={(e) => setPayment({ ...payment, ifcsId: e.target.value })} placeholder="IFCS-XXXXX" /></div>
                <div className="space-y-1"><label className="text-sm font-medium text-foreground">{translateDual("Email")} *</label><Input type="email" required value={payment.email} onChange={(e) => setPayment({ ...payment, email: e.target.value })} /></div>
                <div className="space-y-1"><label className="text-sm font-medium text-foreground">{translateDual("Phone")} *</label><Input type="tel" required value={payment.phone} onChange={(e) => setPayment({ ...payment, phone: e.target.value })} /></div>
                <div className="sm:col-span-2 space-y-1"><label className="text-sm font-medium text-foreground">{translateDual("Name on Credit Card")} *</label><Input required value={payment.cardHolder} onChange={(e) => setPayment({ ...payment, cardHolder: e.target.value })} /></div>
                <div className="sm:col-span-2 space-y-1"><label className="text-sm font-medium text-foreground">{translateDual("Card Number")} *</label><Input required value={payment.cardNumber} onChange={(e) => setPayment({ ...payment, cardNumber: e.target.value })} placeholder="•••• •••• •••• ••••" /></div>
                <div className="space-y-1"><label className="text-sm font-medium text-foreground">{translateDual("Month")} *</label><Input required value={payment.month} onChange={(e) => setPayment({ ...payment, month: e.target.value })} placeholder="MM" /></div>
                <div className="space-y-1"><label className="text-sm font-medium text-foreground">{translateDual("Year")} *</label><Input required value={payment.year} onChange={(e) => setPayment({ ...payment, year: e.target.value })} placeholder="YYYY" /></div>
                <div className="space-y-1"><label className="text-sm font-medium text-foreground">{translateDual("CVV")} *</label><Input required value={payment.cvv} onChange={(e) => setPayment({ ...payment, cvv: e.target.value })} placeholder="•••" className="w-28" /></div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="pt-6 space-y-4">
                <p className="text-sm font-medium text-foreground mb-2">{translate("Please read and agree to the terms and conditions & privacy policy:")}</p>
                <div className="flex items-start gap-3">
                  <Checkbox id="terms" checked={agreeTerms} onCheckedChange={handleTermsCheck} />
                  <label htmlFor="terms" className="text-sm text-muted-foreground">
                    I agree to the <Link to="/terms" className="text-accent underline">Terms and Conditions</Link>
                    {agreeTerms && termsSignature && <span className="ml-2 text-xs text-accent">✓ Signed: {termsSignature}</span>}
                  </label>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox id="privacy" checked={agreePrivacy} onCheckedChange={handlePrivacyCheck} />
                  <label htmlFor="privacy" className="text-sm text-muted-foreground">
                    I agree to the <Link to="/privacy" className="text-accent underline">Privacy Policy</Link>
                    {agreePrivacy && privacySignature && <span className="ml-2 text-xs text-accent">✓ Signed: {privacySignature}</span>}
                  </label>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" size="lg" className="w-full py-6 text-lg rounded-2xl">
              {translate("Pay")} $100.00
            </Button>
          </form>
        </div>
      </div>

      {/* Terms Signature Popup */}
      <Dialog open={termsPopupOpen} onOpenChange={(open) => { if (!open) setTermsPopupOpen(false); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-xl font-bold text-foreground">Terms and Conditions</DialogTitle></DialogHeader>
          <div className="text-sm text-muted-foreground space-y-3 max-h-[40vh] overflow-y-auto pr-2">
            <p>By using the services provided by The Foreign Credential Services (TFCS/IFCS), you agree to the following terms and conditions.</p>
            <p><strong>1. Service Agreement:</strong> TFCS provides credential evaluation, translation, and consulting services. All orders are subject to review and acceptance.</p>
            <p><strong>2. Payment:</strong> All fees are due at the time of order submission. Prices are subject to change without notice.</p>
            <p><strong>3. Processing Times:</strong> Estimated processing times begin after all required documents have been received and verified.</p>
            <p><strong>4. Refund Policy:</strong> Refunds may be issued at the discretion of TFCS management. Processing fees are non-refundable once work has begun.</p>
          </div>
          <div className="border-t border-border pt-4 mt-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Type your full name as your signature</p>
            <Input value={termsSignature} onChange={(e) => setTermsSignature(e.target.value)} placeholder="Type your full name" />
            <p className="text-xs text-muted-foreground">Date: {new Date().toLocaleDateString()}</p>
            <button onClick={confirmTermsSignature} disabled={!termsSignature.trim()}
              className="w-full inline-flex items-center justify-center gap-2 px-8 py-3 rounded-2xl bg-accent text-accent-foreground text-sm font-semibold shadow-lg hover:bg-accent/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
              <CheckCircle2 size={16} /> I Agree & Sign
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Signature Popup */}
      <Dialog open={privacyPopupOpen} onOpenChange={(open) => { if (!open) setPrivacyPopupOpen(false); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-xl font-bold text-foreground">Privacy Policy</DialogTitle></DialogHeader>
          <div className="text-sm text-muted-foreground space-y-3 max-h-[40vh] overflow-y-auto pr-2">
            <p>The Foreign Credential Services (TFCS/IFCS) is committed to protecting your privacy.</p>
            <p><strong>1. Information Collection:</strong> We collect personal information necessary to process your order.</p>
            <p><strong>2. Use of Information:</strong> Your information is used solely for providing our services.</p>
            <p><strong>3. Data Security:</strong> We implement appropriate security measures to protect your personal information.</p>
            <p><strong>4. Third Parties:</strong> We do not sell or share your personal information with third parties except as required.</p>
          </div>
          <div className="border-t border-border pt-4 mt-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Type your full name as your signature</p>
            <Input value={privacySignature} onChange={(e) => setPrivacySignature(e.target.value)} placeholder="Type your full name" />
            <p className="text-xs text-muted-foreground">Date: {new Date().toLocaleDateString()}</p>
            <button onClick={confirmPrivacySignature} disabled={!privacySignature.trim()}
              className="w-full inline-flex items-center justify-center gap-2 px-8 py-3 rounded-2xl bg-accent text-accent-foreground text-sm font-semibold shadow-lg hover:bg-accent/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
              <CheckCircle2 size={16} /> I Agree & Sign
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <BackToHome />
      <Footer />
    </div>
  );
};

export default AddonRenewal;
