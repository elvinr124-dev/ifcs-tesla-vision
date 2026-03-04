import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Copy, CreditCard, FileText, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import brooklynBridge from "@/assets/brooklyn-bridge-night.jpg";

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","American Samoa","Andorra","Angola","Anguilla","Antarctica","Antigua and Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia and Herzegowina","Botswana","Brazil","Brunei Darussalam","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Cayman Islands","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Greenland","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Korea, Republic of","Kuwait","Kyrgyzstan","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","Norway","Oman","Pakistan","Palau","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Puerto Rico","Qatar","Romania","Russian Federation","Rwanda","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"
];

const DuplicateReports = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [delivery, setDelivery] = useState<"electronic" | "hardcopy" | null>(null);
  const [hardCopyQty, setHardCopyQty] = useState(1);
  const [address, setAddress] = useState({ line1: "", line2: "", city: "", state: "", zip: "", country: "" });
  const [payment, setPayment] = useState({ name: "", ifcsId: "", email: "", phone: "", cardHolder: "", cardNumber: "", month: "", year: "", cvv: "" });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const total = delivery === "electronic" ? 25 : delivery === "hardcopy" ? 25 * hardCopyQty : 0;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!delivery) { toast({ title: "Select delivery", description: "Please choose a delivery option.", variant: "destructive" }); return; }
    if (!agreeTerms || !agreePrivacy) { toast({ title: "Agreement required", description: "Please agree to terms and privacy policy.", variant: "destructive" }); return; }
    toast({ title: "Payment Submitted", description: `Your order for $${total.toFixed(2)} has been submitted.` });
    navigate("/dashboard/client");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <img src={brooklynBridge} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="video-overlay" />
        <div className="relative z-10 text-center px-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">Duplicate Reports</h1>
          <p className="text-white/80 mt-2 text-lg">Request additional copies of your IFCS evaluation</p>
        </div>
      </section>

      <div className="content-bg">
        <div className="max-w-3xl mx-auto px-6 py-16 space-y-8">

          <p className="text-muted-foreground text-center">
            If you have received an evaluation from IFCS within the past five years, you can request additional hard copies or electronic copies here.
          </p>

          {/* Total */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Your total</p>
            <p className="text-4xl font-bold text-foreground">${total.toFixed(2)}</p>
          </div>

          <form onSubmit={handlePay} className="space-y-8">
            {/* Delivery Options */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText size={20} className="text-accent" /> Report Delivery Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <button type="button" onClick={() => setDelivery("electronic")}
                    className={`rounded-xl border-2 p-6 text-left transition-all ${delivery === "electronic" ? "border-accent bg-accent/10" : "border-border hover:border-accent/40"}`}>
                    <p className="font-semibold text-foreground">Electronic Report</p>
                    <p className="text-2xl font-bold text-accent mt-1">$25</p>
                    <p className="text-xs text-muted-foreground mt-1">Sent via secure email link</p>
                  </button>
                  <button type="button" onClick={() => setDelivery("hardcopy")}
                    className={`rounded-xl border-2 p-6 text-left transition-all ${delivery === "hardcopy" ? "border-accent bg-accent/10" : "border-border hover:border-accent/40"}`}>
                    <p className="font-semibold text-foreground">Hard Copy</p>
                    <p className="text-2xl font-bold text-accent mt-1">$25 <span className="text-sm font-normal text-muted-foreground">each</span></p>
                    <p className="text-xs text-muted-foreground mt-1">Mailed to your address</p>
                  </button>
                </div>
                {delivery === "hardcopy" && (
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-foreground">Quantity:</label>
                    <Input type="number" min={1} max={10} value={hardCopyQty} onChange={(e) => setHardCopyQty(Number(e.target.value))} className="w-20" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Address — only for hard copy */}
            {delivery === "hardcopy" && (
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><MapPin size={20} className="text-accent" /> Delivery Address</CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-sm font-medium text-foreground">Address Line One *</label>
                    <Input required value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-sm font-medium text-foreground">Address Line Two</label>
                    <Input value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">City *</label>
                    <Input required value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">State *</label>
                    <Input required value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">Zip *</label>
                    <Input required value={address.zip} onChange={(e) => setAddress({ ...address, zip: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">Country *</label>
                    <Select value={address.country} onValueChange={(v) => setAddress({ ...address, country: v })}>
                      <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                      <SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CreditCard size={20} className="text-accent" /> Payment</CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Name on Documents *</label>
                  <Input required value={payment.name} onChange={(e) => setPayment({ ...payment, name: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">IFCS ID *</label>
                  <Input required value={payment.ifcsId} onChange={(e) => setPayment({ ...payment, ifcsId: e.target.value })} placeholder="IFCS-XXXXX" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Email *</label>
                  <Input type="email" required value={payment.email} onChange={(e) => setPayment({ ...payment, email: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Phone *</label>
                  <Input type="tel" required value={payment.phone} onChange={(e) => setPayment({ ...payment, phone: e.target.value })} />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-sm font-medium text-foreground">Name on Credit Card *</label>
                  <Input required value={payment.cardHolder} onChange={(e) => setPayment({ ...payment, cardHolder: e.target.value })} />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-sm font-medium text-foreground">Card Number *</label>
                  <Input required value={payment.cardNumber} onChange={(e) => setPayment({ ...payment, cardNumber: e.target.value })} placeholder="•••• •••• •••• ••••" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Month *</label>
                  <Select value={payment.month} onValueChange={(v) => setPayment({ ...payment, month: v })}>
                    <SelectTrigger><SelectValue placeholder="MM" /></SelectTrigger>
                    <SelectContent>{Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Year *</label>
                  <Select value={payment.year} onValueChange={(v) => setPayment({ ...payment, year: v })}>
                    <SelectTrigger><SelectValue placeholder="YYYY" /></SelectTrigger>
                    <SelectContent>{Array.from({ length: 16 }, (_, i) => String(2026 + i)).map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">CVV *</label>
                  <Input required value={payment.cvv} onChange={(e) => setPayment({ ...payment, cvv: e.target.value })} placeholder="•••" className="w-28" />
                </div>
              </CardContent>
            </Card>

            {/* Agreements */}
            <Card className="border-border bg-card">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox id="terms" checked={agreeTerms} onCheckedChange={(c) => setAgreeTerms(c === true)} />
                  <label htmlFor="terms" className="text-sm text-muted-foreground">I agree to the <span className="text-accent underline cursor-pointer">Terms and Conditions</span></label>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox id="privacy" checked={agreePrivacy} onCheckedChange={(c) => setAgreePrivacy(c === true)} />
                  <label htmlFor="privacy" className="text-sm text-muted-foreground">I agree to the <span className="text-accent underline cursor-pointer">Privacy Policy</span></label>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" size="lg" className="w-full py-6 text-lg rounded-2xl">
              Pay ${total.toFixed(2)}
            </Button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DuplicateReports;
