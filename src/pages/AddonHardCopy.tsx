import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToHome from "@/components/BackToHome";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CreditCard, Copy, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import brooklynBridge from "@/assets/brooklyn-bridge-night.jpg";
import { useLocale } from "@/context/LocaleContext";

const COUNTRIES = ["Afghanistan","Albania","Algeria","Argentina","Australia","Austria","Bangladesh","Belgium","Brazil","Canada","Chile","China","Colombia","Czech Republic","Denmark","Dominican Republic","Ecuador","Egypt","Finland","France","Germany","Ghana","Greece","Guatemala","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kenya","Korea, Republic of","Kuwait","Lebanon","Malaysia","Mexico","Morocco","Nepal","Netherlands","New Zealand","Nigeria","Norway","Pakistan","Peru","Philippines","Poland","Portugal","Romania","Russian Federation","Saudi Arabia","Singapore","South Africa","Spain","Sri Lanka","Sweden","Switzerland","Taiwan","Thailand","Trinidad and Tobago","Tunisia","Turkey","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"];

const AddonHardCopy = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { translateDual, translate } = useLocale();
  const [qty, setQty] = useState(1);
  const [address, setAddress] = useState({ line1: "", line2: "", city: "", state: "", zip: "", country: "" });
  const [payment, setPayment] = useState({ name: "", ifcsId: "", email: "", phone: "", cardHolder: "", cardNumber: "", month: "", year: "", cvv: "" });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const total = 25 * qty;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms || !agreePrivacy) { toast({ title: "Agreement required", description: "Please agree to terms and privacy policy.", variant: "destructive" }); return; }
    toast({ title: "Payment Submitted", description: `Your hard copy order for $${total.toFixed(2)} has been submitted.` });
    navigate("/dashboard/client");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <img src={brooklynBridge} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="video-overlay" />
        <div className="relative z-10 text-center px-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">{translate("Hard Copy Report")}</h1>
          <p className="text-white/80 mt-2 text-lg">{translate("Request printed copies of your evaluation")}</p>
        </div>
      </section>

      <div className="content-bg">
        <div className="max-w-3xl mx-auto px-6 py-16 space-y-8">
          <div className="text-center">
            <Copy size={48} className="text-accent mx-auto mb-4" />
            <p className="text-muted-foreground">{translate("Receive official printed hard copies of your IFCS evaluation report.")}</p>
            <p className="text-4xl font-bold text-foreground mt-4">${total.toFixed(2)}</p>
            <div className="flex items-center justify-center gap-3 mt-3">
              <label className="text-sm font-medium text-foreground">{translateDual("Quantity")}:</label>
              <Input type="number" min={1} max={10} value={qty} onChange={(e) => setQty(Number(e.target.value))} className="w-20" />
              <span className="text-sm text-muted-foreground">× $25 each</span>
            </div>
          </div>

          <form onSubmit={handlePay} className="space-y-8">
            <Card className="border-border bg-card">
              <CardHeader><CardTitle className="flex items-center gap-2"><MapPin size={20} className="text-accent" /> Delivery Address</CardTitle></CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1"><label className="text-sm font-medium text-foreground">Address Line One *</label><Input required value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} /></div>
                <div className="sm:col-span-2 space-y-1"><label className="text-sm font-medium text-foreground">Address Line Two</label><Input value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })} /></div>
                <div className="space-y-1"><label className="text-sm font-medium text-foreground">City *</label><Input required value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} /></div>
                <div className="space-y-1"><label className="text-sm font-medium text-foreground">State *</label><Input required value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} /></div>
                <div className="space-y-1"><label className="text-sm font-medium text-foreground">Zip *</label><Input required value={address.zip} onChange={(e) => setAddress({ ...address, zip: e.target.value })} /></div>
                <div className="space-y-1"><label className="text-sm font-medium text-foreground">Country *</label>
                  <Select value={address.country} onValueChange={(v) => setAddress({ ...address, country: v })}><SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger><SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard size={20} className="text-accent" /> Payment</CardTitle></CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                {[{ label: "Name on Documents *", key: "name" },{ label: "IFCS ID *", key: "ifcsId", placeholder: "IFCS-XXXXX" },{ label: "Email *", key: "email", type: "email" },{ label: "Phone *", key: "phone", type: "tel" }].map(({ label, key, ...rest }) => (
                  <div key={key} className="space-y-1"><label className="text-sm font-medium text-foreground">{label}</label><Input required value={(payment as any)[key]} onChange={(e) => setPayment({ ...payment, [key]: e.target.value })} {...rest} /></div>
                ))}
                <div className="sm:col-span-2 space-y-1"><label className="text-sm font-medium text-foreground">Name on Credit Card *</label><Input required value={payment.cardHolder} onChange={(e) => setPayment({ ...payment, cardHolder: e.target.value })} /></div>
                <div className="sm:col-span-2 space-y-1"><label className="text-sm font-medium text-foreground">Card Number *</label><Input required value={payment.cardNumber} onChange={(e) => setPayment({ ...payment, cardNumber: e.target.value })} placeholder="•••• •••• •••• ••••" /></div>
                <div className="space-y-1"><label className="text-sm font-medium text-foreground">Month *</label><Input required value={payment.month} onChange={(e) => setPayment({ ...payment, month: e.target.value })} placeholder="MM" /></div>
                <div className="space-y-1"><label className="text-sm font-medium text-foreground">Year *</label><Input required value={payment.year} onChange={(e) => setPayment({ ...payment, year: e.target.value })} placeholder="YYYY" /></div>
                <div className="space-y-1"><label className="text-sm font-medium text-foreground">CVV *</label><Input required value={payment.cvv} onChange={(e) => setPayment({ ...payment, cvv: e.target.value })} placeholder="•••" className="w-28" /></div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card"><CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3"><Checkbox id="terms" checked={agreeTerms} onCheckedChange={(c) => setAgreeTerms(c === true)} /><label htmlFor="terms" className="text-sm text-muted-foreground">I agree to the <span className="text-accent underline cursor-pointer">Terms and Conditions</span></label></div>
              <div className="flex items-start gap-3"><Checkbox id="privacy" checked={agreePrivacy} onCheckedChange={(c) => setAgreePrivacy(c === true)} /><label htmlFor="privacy" className="text-sm text-muted-foreground">I agree to the <span className="text-accent underline cursor-pointer">Privacy Policy</span></label></div>
            </CardContent></Card>

            <Button type="submit" size="lg" className="w-full py-6 text-lg rounded-2xl">Pay ${total.toFixed(2)}</Button>
          </form>
        </div>
      </div>
      <BackToHome />
      <Footer />
    </div>
  );
};

export default AddonHardCopy;
