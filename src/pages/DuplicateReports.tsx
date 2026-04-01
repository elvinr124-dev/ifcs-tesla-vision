import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToHome from "@/components/BackToHome";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CreditCard, FileText, MapPin, Mail, Truck, ShoppingCart, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";
import { useLocale } from "@/context/LocaleContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import duplicateReportsBg from "@/assets/duplicate-reports-bg.jpg";

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","American Samoa","Andorra","Angola","Anguilla","Antarctica","Antigua and Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia and Herzegowina","Botswana","Bouvet Island","Brazil","British Indian Ocean Territory","Brunei Darussalam","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Cayman Islands","Central African Republic","Chad","Chile","China","Christmas Island","Cocos (Keeling) Islands","Colombia","Comoros","Congo","Congo, the Democratic Republic of the","Cook Islands","Costa Rica","Cote d'Ivoire","Croatia (Hrvatska)","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","East Timor","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Ethiopia","Falkland Islands (Malvinas)","Faroe Islands","Fiji","Finland","France","France Metropolitan","French Guiana","French Polynesia","French Southern Territories","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada","Guadeloupe","Guam","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Heard and Mc Donald Islands","Holy See (Vatican City State)","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran (Islamic Republic of)","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Korea, Democratic People's Republic of","Korea, Republic of","Kuwait","Kyrgyzstan","Lao, People's Democratic Republic","Latvia","Lebanon","Lesotho","Liberia","Libyan Arab Jamahiriya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia, The Former Yugoslav Republic of","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Martinique","Mauritania","Mauritius","Mayotte","Mexico","Micronesia, Federated States of","Moldova, Republic of","Monaco","Mongolia","Montserrat","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","Netherlands Antilles","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","Niue","Norfolk Island","Northern Mariana Islands","Norway","Oman","Pakistan","Palau","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Pitcairn","Poland","Portugal","Puerto Rico","Qatar","Reunion","Romania","Russian Federation","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Seychelles","Sierra Leone","Singapore","Slovakia (Slovak Republic)","Slovenia","Solomon Islands","Somalia","South Africa","South Georgia and the South Sandwich Islands","Spain","Sri Lanka","St. Helena","St. Pierre and Miquelon","Sudan","Suriname","Svalbard and Jan Mayen Islands","Swaziland","Sweden","Switzerland","Syrian Arab Republic","Taiwan, Province of China","Tajikistan","Tanzania, United Republic of","Thailand","Togo","Tokelau","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Turks and Caicos Islands","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","United States Minor Outlying Islands","Uruguay","Uzbekistan","Vanuatu","Venezuela","Vietnam","Virgin Islands (British)","Virgin Islands (U.S.)","Wallis and Futuna Islands","Western Sahara","Yemen","Yugoslavia","Zambia","Zimbabwe"
];

const SHIPPING_OPTIONS = [
  { label: "USPS Postage (no tracking)", price: 15 },
  { label: "USPS Priority Mail with tracking", price: 25 },
  { label: "International Courier", price: 70 },
];

const DuplicateReports = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { translateDual, translate } = useLocale();

  const [delivery, setDelivery] = useState<"electronic" | "hardcopy" | null>(null);
  const [hardCopyQty, setHardCopyQty] = useState(1);
  const [shippingMethod, setShippingMethod] = useState("");
  const [electronicEmail, setElectronicEmail] = useState("");
  const [address, setAddress] = useState({ line1: "", line2: "", city: "", state: "", zip: "", country: "" });
  const [payment, setPayment] = useState({ name: "", ifcsId: "", email: "", phone: "", cardHolder: "", cardNumber: "", month: "", year: "", cvv: "" });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  // E-signature state
  const [termsPopupOpen, setTermsPopupOpen] = useState(false);
  const [privacyPopupOpen, setPrivacyPopupOpen] = useState(false);
  const [termsSignature, setTermsSignature] = useState("");
  const [privacySignature, setPrivacySignature] = useState("");

  const shippingPrice = SHIPPING_OPTIONS.find(s => s.label === shippingMethod)?.price || 0;
  const total = delivery === "electronic"
    ? 25
    : delivery === "hardcopy"
      ? 25 * hardCopyQty + shippingPrice
      : 0;

  const handleTermsCheck = (checked: boolean | "indeterminate") => {
    if (checked === true) {
      setTermsPopupOpen(true);
    } else {
      setAgreeTerms(false);
      setTermsSignature("");
    }
  };

  const handlePrivacyCheck = (checked: boolean | "indeterminate") => {
    if (checked === true) {
      setPrivacyPopupOpen(true);
    } else {
      setAgreePrivacy(false);
      setPrivacySignature("");
    }
  };

  const confirmTermsSignature = () => {
    if (!termsSignature.trim()) return;
    setAgreeTerms(true);
    setTermsPopupOpen(false);
  };

  const confirmPrivacySignature = () => {
    if (!privacySignature.trim()) return;
    setAgreePrivacy(true);
    setPrivacyPopupOpen(false);
  };

  const validateForm = () => {
    if (!delivery) { toast({ title: "Select delivery", description: "Please choose a delivery option.", variant: "destructive" }); return false; }
    if (delivery === "electronic" && !electronicEmail.trim()) { toast({ title: "Email required", description: "Please enter the email address to send the report to.", variant: "destructive" }); return false; }
    if (delivery === "hardcopy" && !shippingMethod) { toast({ title: "Shipping required", description: "Please select a shipping method.", variant: "destructive" }); return false; }
    if (!agreeTerms || !agreePrivacy) { toast({ title: "Agreement required", description: "Please agree to terms and privacy policy.", variant: "destructive" }); return false; }
    return true;
  };

  const handleAddToCart = () => {
    if (!validateForm()) return;
    const label = delivery === "electronic"
      ? "Duplicate Report — Electronic"
      : `Duplicate Report — Hard Copy x${hardCopyQty}`;
    addItem({ serviceTitle: label, processingKey: "standard", processingLabel: delivery === "electronic" ? "Electronic" : "Hard Copy", processingTime: "5-7 Business Days", price: total });
    toast({ title: "Added to Cart", description: `${label} ($${total.toFixed(2)}) added to your cart.` });
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    toast({ title: "Payment Submitted", description: `Your order for $${total.toFixed(2)} has been submitted.` });
    navigate("/dashboard/client");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero — standardized height */}
      <section className="relative h-[80vh] min-h-[600px] w-full flex items-center overflow-hidden">
        <img src={duplicateReportsBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="video-overlay" />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-12 hero-text-shadow">
          <p className="text-sm font-medium tracking-[0.2em] uppercase mb-3 text-white">{translate("Additional Copies")}</p>
          <h1 className="tesla-hero-title text-white">{translate("Duplicate Reports")}</h1>
          <p className="tesla-hero-subtitle text-white/90 max-w-lg">{translate("Request additional copies of your IFCS evaluation")}</p>
        </div>
      </section>

      <div className="content-bg">
        <div className="max-w-3xl mx-auto px-6 py-16 space-y-8">

          <p className="text-muted-foreground text-center">
            {translate("If you have received an evaluation from IFCS within the past five years, you can request additional hard copies or electronic copies here.")}
          </p>

          {/* Total */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{translateDual("Your total")}</p>
            <p className="text-4xl font-bold text-foreground">${total.toFixed(2)}</p>
          </div>

          <form onSubmit={handlePay} className="space-y-8">
            {/* Delivery Options */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText size={20} className="text-accent" /> {translateDual("Report Delivery Options")} *</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <button type="button" onClick={() => { setDelivery("electronic"); setShippingMethod(""); }}
                    className={`rounded-xl border-2 p-6 text-left transition-all ${delivery === "electronic" ? "border-accent bg-accent/10" : "border-border hover:border-accent/40"}`}>
                    <p className="font-semibold text-foreground">{translateDual("Electronic Report")}</p>
                    <p className="text-2xl font-bold text-accent mt-1">$25</p>
                    <p className="text-xs text-muted-foreground mt-1">{translateDual("Sent via secure email link")}</p>
                  </button>
                  <button type="button" onClick={() => { setDelivery("hardcopy"); setElectronicEmail(""); }}
                    className={`rounded-xl border-2 p-6 text-left transition-all ${delivery === "hardcopy" ? "border-accent bg-accent/10" : "border-border hover:border-accent/40"}`}>
                    <p className="font-semibold text-foreground">Hard Copy</p>
                    <p className="text-2xl font-bold text-accent mt-1">$25 <span className="text-sm font-normal text-muted-foreground">each</span></p>
                    <p className="text-xs text-muted-foreground mt-1">Mailed to the address of your choice</p>
                  </button>
                </div>

                {/* Electronic — email field */}
                {delivery === "electronic" && (
                  <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-3 animate-fade-in">
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <Mail size={18} className="text-accent" />
                      Send my Electronic Report to the following email address:
                    </div>
                    <Input
                      type="email"
                      required
                      placeholder="recipient@example.com"
                      value={electronicEmail}
                      onChange={(e) => setElectronicEmail(e.target.value)}
                    />
                  </div>
                )}

                {/* Hard copy — quantity + shipping */}
                {delivery === "hardcopy" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-foreground">Quantity:</label>
                      <Input type="number" min={1} max={10} value={hardCopyQty} onChange={(e) => setHardCopyQty(Number(e.target.value))} className="w-20" />
                    </div>

                    {/* Shipping method */}
                    <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-3">
                      <div className="flex items-center gap-2 text-foreground font-medium">
                        <Truck size={18} className="text-accent" />
                        Shipping Method *
                      </div>
                      <div className="grid gap-2">
                        {SHIPPING_OPTIONS.map((opt) => (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() => setShippingMethod(opt.label)}
                            className={`rounded-lg border-2 p-4 text-left transition-all flex items-center justify-between ${shippingMethod === opt.label ? "border-accent bg-accent/10" : "border-border hover:border-accent/40"}`}
                          >
                            <span className="text-sm text-foreground">{opt.label}</span>
                            <span className="font-bold text-accent">${opt.price}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Address — only for hard copy */}
            {delivery === "hardcopy" && (
              <Card className="border-border bg-card animate-fade-in">
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
                      <SelectTrigger><SelectValue placeholder="Please Select..." /></SelectTrigger>
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
                  <label className="text-sm font-medium text-foreground">Email Address *</label>
                  <Input type="email" required value={payment.email} onChange={(e) => setPayment({ ...payment, email: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Phone Number *</label>
                  <Input type="tel" required value={payment.phone} onChange={(e) => setPayment({ ...payment, phone: e.target.value })} />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-sm font-medium text-foreground">Name of the Credit Card Holder *</label>
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

            {/* Agreements with e-signature */}
            <Card className="border-border bg-card">
              <CardContent className="pt-6 space-y-4">
                <p className="text-sm font-medium text-foreground mb-2">Please read and agree to the terms and conditions & privacy policy:</p>
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
              Pay ${total.toFixed(2)}
            </Button>
          </form>
        </div>
      </div>

      {/* Terms Signature Popup */}
      <Dialog open={termsPopupOpen} onOpenChange={(open) => { if (!open) setTermsPopupOpen(false); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">Terms and Conditions</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground space-y-3 max-h-[40vh] overflow-y-auto pr-2">
            <p>By using the services provided by The Foreign Credential Services (TFCS/IFCS), you agree to the following terms and conditions. Please read them carefully before proceeding.</p>
            <p><strong>1. Service Agreement:</strong> TFCS provides credential evaluation, translation, and consulting services. All orders are subject to review and acceptance.</p>
            <p><strong>2. Payment:</strong> All fees are due at the time of order submission. Prices are subject to change without notice.</p>
            <p><strong>3. Processing Times:</strong> Estimated processing times begin after all required documents have been received and verified.</p>
            <p><strong>4. Refund Policy:</strong> Refunds may be issued at the discretion of TFCS management. Processing fees are non-refundable once work has begun.</p>
            <p><strong>5. Document Handling:</strong> TFCS takes reasonable care in handling submitted documents but is not liable for loss or damage during transit.</p>
            <p><strong>6. Accuracy:</strong> Clients are responsible for ensuring all submitted information and documents are accurate and authentic.</p>
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
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">Privacy Policy</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground space-y-3 max-h-[40vh] overflow-y-auto pr-2">
            <p>The Foreign Credential Services (TFCS/IFCS) is committed to protecting your privacy. This policy outlines how we collect, use, and safeguard your personal information.</p>
            <p><strong>1. Information Collection:</strong> We collect personal information necessary to process your evaluation, translation, or consulting order.</p>
            <p><strong>2. Use of Information:</strong> Your information is used solely for the purpose of providing our services and communicating with you about your order.</p>
            <p><strong>3. Data Security:</strong> We implement appropriate security measures to protect your personal information from unauthorized access.</p>
            <p><strong>4. Third Parties:</strong> We do not sell or share your personal information with third parties except as required to fulfill your order or comply with legal obligations.</p>
            <p><strong>5. Data Retention:</strong> We retain your information for as long as necessary to provide our services and comply with legal requirements.</p>
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

export default DuplicateReports;
