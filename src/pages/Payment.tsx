import { useState, useRef, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import BackToHome from "@/components/BackToHome";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Camera, CheckCircle2, CreditCard } from "lucide-react";
import paymentBg from "@/assets/payment-bg.jpg";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 14 }, (_, i) => currentYear + i);
const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));

const Payment = () => {
  const [form, setForm] = useState({
    docName: "",
    email: "",
    phone: "",
    ifcsId: "",
    amount: "",
    cardHolder: "",
    cardNumber: "",
    expMonth: "",
    expYear: "",
    cvv: "",
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Card scan state
  const [frontScanned, setFrontScanned] = useState(false);
  const [backScanned, setBackScanned] = useState(false);
  const [scanningFront, setScanningFront] = useState(false);
  const [scanningBack, setScanningBack] = useState(false);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  // E-signature state
  const [termsPopupOpen, setTermsPopupOpen] = useState(false);
  const [privacyPopupOpen, setPrivacyPopupOpen] = useState(false);
  const [termsSignature, setTermsSignature] = useState("");
  const [privacySignature, setPrivacySignature] = useState("");

  const total = form.amount ? parseFloat(form.amount) || 0 : 0;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

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

  const scanCard = async (file: File, side: "front" | "back") => {
    const setScan = side === "front" ? setScanningFront : setScanningBack;
    const setDone = side === "front" ? setFrontScanned : setBackScanned;
    setScan(true);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = (reader.result as string).split(",")[1];
        const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
        const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

        const res = await fetch(`${SUPABASE_URL}/functions/v1/scan-card`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
          body: JSON.stringify({ imageBase64: base64 }),
        });

        if (!res.ok) throw new Error("Failed to scan card");

        const parsed = await res.json();

        if (side === "front") {
          if (parsed.cardHolder || parsed.cardNumber) {
            setForm((p) => ({
              ...p,
              cardHolder: parsed.cardHolder || p.cardHolder,
              cardNumber: parsed.cardNumber || p.cardNumber,
              expMonth: parsed.expMonth || p.expMonth,
              expYear: parsed.expYear || p.expYear,
            }));
          }
        } else {
          // Back of card — CVV
          if (parsed.cvv) {
            setForm((p) => ({ ...p, cvv: parsed.cvv || p.cvv }));
          }
        }

        setDone(true);
        toast.success(`Card ${side} scanned successfully!`);
      } catch {
        toast.error(`Could not read card ${side}. Please enter manually.`);
      } finally {
        setScan(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFrontCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) scanCard(file, "front");
  };

  const handleBackCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) scanCard(file, "back");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms || !agreePrivacy) {
      toast.error("Please agree to both the terms and conditions and privacy policy.");
      return;
    }
    if (!form.docName || !form.email || !form.phone || !form.amount || !form.cardHolder || !form.cardNumber || !form.expMonth || !form.expYear || !form.cvv) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Payment submitted successfully!");
    }, 1500);
  };

  return (
    <div className="bg-background min-h-screen">
      <Navbar />

      {/* Hero — matches Evaluations / DuplicateReports size */}
      <section className="relative h-[80vh] min-h-[600px] w-full flex items-center overflow-hidden">
        <img
          src={paymentBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="video-overlay" />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-white leading-[0.95]">
            Payment
          </h1>
          <p className="mt-4 text-lg md:text-xl text-white/70 max-w-xl">
            Complete your payment securely below.
          </p>
          <button
            onClick={() => document.getElementById("payment-form")?.scrollIntoView({ behavior: "smooth" })}
            className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-accent text-accent-foreground font-bold text-lg shadow-xl hover:shadow-accent/40 hover:scale-105 transition-all duration-300"
          >
            Pay Now
          </button>
        </div>
      </section>

      {/* Form */}
      <section id="payment-form" className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Total Display */}
          <div className="mb-12 text-center">
            <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">Your total</p>
            <p className="text-5xl font-extrabold text-foreground tabular-nums">
              ${total.toFixed(2)}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Personal Info Section */}
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground tracking-tight">Personal Information</h2>
              <p className="text-sm text-muted-foreground">Details about the document holder</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="docName" className="text-foreground text-xs uppercase tracking-wider">Name on the documents *</Label>
                <Input id="docName" value={form.docName} onChange={set("docName")} required placeholder="Full name as shown on documents" className="bg-muted/30 border-border h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground text-xs uppercase tracking-wider">Email address *</Label>
                <Input id="email" type="email" value={form.email} onChange={set("email")} required placeholder="you@example.com" className="bg-muted/30 border-border h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground text-xs uppercase tracking-wider">Phone number *</Label>
                <Input id="phone" type="tel" value={form.phone} onChange={set("phone")} required placeholder="(555) 123-4567" className="bg-muted/30 border-border h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ifcsId" className="text-foreground text-xs uppercase tracking-wider">IFCS ID (if provided)</Label>
                <Input id="ifcsId" value={form.ifcsId} onChange={set("ifcsId")} placeholder="Optional" className="bg-muted/30 border-border h-12 rounded-xl" />
              </div>
            </div>

            {/* Amount Section */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-foreground text-xs uppercase tracking-wider">Amount to pay *</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-lg">$</span>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={set("amount")}
                  required
                  placeholder="0.00"
                  className="bg-muted/30 border-border h-14 rounded-xl pl-9 text-xl font-semibold tabular-nums"
                />
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Card Section */}
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground tracking-tight">Card Details</h2>
              <p className="text-sm text-muted-foreground">Take photos of your card to autofill or enter manually</p>
            </div>

            {/* Camera-only card capture: Front & Back */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Front of card */}
              <div
                className={`relative border-2 border-dashed rounded-2xl p-5 flex flex-col items-center gap-3 cursor-pointer transition-colors ${
                  frontScanned
                    ? "border-accent/60 bg-accent/5"
                    : "border-border hover:border-accent/40"
                }`}
                onClick={() => !scanningFront && frontInputRef.current?.click()}
              >
                <input
                  ref={frontInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFrontCapture}
                />
                {scanningFront ? (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-muted-foreground">Scanning front…</span>
                  </div>
                ) : frontScanned ? (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <CheckCircle2 size={32} className="text-accent" />
                    <span className="text-sm font-semibold text-accent">Front scanned</span>
                    <span className="text-xs text-muted-foreground">Tap to re-scan</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center">
                      <Camera size={24} className="text-muted-foreground" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">Front of Card</span>
                    <span className="text-xs text-muted-foreground">Tap to take photo</span>
                  </div>
                )}
              </div>

              {/* Back of card */}
              <div
                className={`relative border-2 border-dashed rounded-2xl p-5 flex flex-col items-center gap-3 cursor-pointer transition-colors ${
                  backScanned
                    ? "border-accent/60 bg-accent/5"
                    : "border-border hover:border-accent/40"
                }`}
                onClick={() => !scanningBack && backInputRef.current?.click()}
              >
                <input
                  ref={backInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleBackCapture}
                />
                {scanningBack ? (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-muted-foreground">Scanning back…</span>
                  </div>
                ) : backScanned ? (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <CheckCircle2 size={32} className="text-accent" />
                    <span className="text-sm font-semibold text-accent">Back scanned</span>
                    <span className="text-xs text-muted-foreground">Tap to re-scan</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center">
                      <CreditCard size={24} className="text-muted-foreground" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">Back of Card</span>
                    <span className="text-xs text-muted-foreground">Tap to take photo</span>
                  </div>
                )}
              </div>
            </div>

            {/* Card Fields */}
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="cardHolder" className="text-foreground text-xs uppercase tracking-wider">Cardholder name *</Label>
                <Input id="cardHolder" value={form.cardHolder} onChange={set("cardHolder")} required placeholder="Name on card" className="bg-muted/30 border-border h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardNumber" className="text-foreground text-xs uppercase tracking-wider">Card number *</Label>
                <Input id="cardNumber" value={form.cardNumber} onChange={set("cardNumber")} required placeholder="1234 5678 9012 3456" maxLength={19} className="bg-muted/30 border-border h-12 rounded-xl font-mono tracking-widest" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground text-xs uppercase tracking-wider">Month *</Label>
                  <Select value={form.expMonth} onValueChange={(v) => setForm((p) => ({ ...p, expMonth: v }))}>
                    <SelectTrigger className="bg-muted/30 border-border h-12 rounded-xl">
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground text-xs uppercase tracking-wider">Year *</Label>
                  <Select value={form.expYear} onValueChange={(v) => setForm((p) => ({ ...p, expYear: v }))}>
                    <SelectTrigger className="bg-muted/30 border-border h-12 rounded-xl">
                      <SelectValue placeholder="YYYY" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((y) => (
                        <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv" className="text-foreground text-xs uppercase tracking-wider">CVV *</Label>
                  <Input id="cvv" value={form.cvv} onChange={set("cvv")} required placeholder="•••" maxLength={4} className="bg-muted/30 border-border h-12 rounded-xl text-center tracking-[0.3em]" />
                </div>
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Terms & Privacy with e-signature */}
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Legal agreements
              </p>
              <div className="flex items-start gap-3">
                <Checkbox id="terms" checked={agreeTerms} onCheckedChange={handleTermsCheck} className="mt-0.5" />
                <Label htmlFor="terms" className="text-sm text-foreground leading-snug">
                  I agree to the{" "}
                  <Link to="/terms" className="text-accent underline underline-offset-2 hover:text-accent/80">
                    terms and conditions
                  </Link>
                  {agreeTerms && termsSignature && (
                    <span className="ml-2 text-xs text-accent">✓ Signed: {termsSignature}</span>
                  )}
                </Label>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox id="privacy" checked={agreePrivacy} onCheckedChange={handlePrivacyCheck} className="mt-0.5" />
                <Label htmlFor="privacy" className="text-sm text-foreground leading-snug">
                  I agree to the{" "}
                  <Link to="/privacy" className="text-accent underline underline-offset-2 hover:text-accent/80">
                    privacy policy
                  </Link>
                  {agreePrivacy && privacySignature && (
                    <span className="ml-2 text-xs text-accent">✓ Signed: {privacySignature}</span>
                  )}
                </Label>
              </div>
            </div>

            <Button type="submit" disabled={submitting} className="w-full h-14 text-lg font-bold rounded-2xl active:scale-[0.98] transition-transform">
              {submitting ? "Processing…" : `Pay $${total.toFixed(2)}`}
            </Button>
          </form>
        </div>
      </section>

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

export default Payment;
