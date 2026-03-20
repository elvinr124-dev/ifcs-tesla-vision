import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Camera, CreditCard, Upload } from "lucide-react";
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
  const [cardPreview, setCardPreview] = useState<string | null>(null);
  const [scanningCard, setScanningCard] = useState(false);
  const cardInputRef = useRef<HTMLInputElement>(null);

  const total = form.amount ? parseFloat(form.amount) || 0 : 0;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleCardUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setCardPreview(url);
    setScanningCard(true);

    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = (reader.result as string).split(",")[1];

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
        if (parsed.cardHolder || parsed.cardNumber) {
          setForm((p) => ({
            ...p,
            cardHolder: parsed.cardHolder || p.cardHolder,
            cardNumber: parsed.cardNumber || p.cardNumber,
            expMonth: parsed.expMonth || p.expMonth,
            expYear: parsed.expYear || p.expYear,
          }));
          toast.success("Card details extracted successfully!");
        } else {
          toast.error("Could not read card details. Please enter manually.");
        }
      } catch {
        toast.error("Could not read card details. Please enter manually.");
      } finally {
        setScanningCard(false);
      }
    };
    reader.readAsDataURL(file);
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

      {/* Hero */}
      <section className="relative h-[60vh] min-h-[420px] flex items-center justify-center overflow-hidden">
        <img
          src={paymentBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center px-6">
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-white leading-[0.95]">
            Payment
          </h1>
          <p className="mt-4 text-lg md:text-xl text-white/70 max-w-xl mx-auto">
            Complete your payment securely below.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-20 px-6">
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

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Card Section */}
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground tracking-tight">Card Details</h2>
              <p className="text-sm text-muted-foreground">Upload a card image to autofill or enter manually</p>
            </div>

            {/* Card Upload */}
            <div
              className="relative border-2 border-dashed border-border rounded-2xl p-6 flex flex-col items-center gap-4 cursor-pointer hover:border-accent/60 transition-colors group"
              onClick={() => cardInputRef.current?.click()}
            >
              <input
                ref={cardInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleCardUpload}
              />
              {cardPreview ? (
                <div className="relative w-full max-w-sm">
                  <img src={cardPreview} alt="Card preview" className="w-full rounded-xl shadow-lg" />
                  {scanningCard && (
                    <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="text-white text-sm font-medium">Scanning card…</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                    <CreditCard size={28} className="text-muted-foreground group-hover:text-accent transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">Upload or take a photo of your card</p>
                    <p className="text-xs text-muted-foreground mt-1">We'll extract the details automatically</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-full">
                      <Upload size={12} /> Upload
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-full">
                      <Camera size={12} /> Camera
                    </span>
                  </div>
                </>
              )}
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

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Terms & Privacy */}
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Legal agreements
              </p>
              <div className="flex items-start gap-3">
                <Checkbox id="terms" checked={agreeTerms} onCheckedChange={(v) => setAgreeTerms(v === true)} className="mt-0.5" />
                <Label htmlFor="terms" className="text-sm text-foreground leading-snug">
                  I agree to the{" "}
                  <Link to="/terms" className="text-accent underline underline-offset-2 hover:text-accent/80">
                    terms and conditions
                  </Link>
                </Label>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox id="privacy" checked={agreePrivacy} onCheckedChange={(v) => setAgreePrivacy(v === true)} className="mt-0.5" />
                <Label htmlFor="privacy" className="text-sm text-foreground leading-snug">
                  I agree to the{" "}
                  <Link to="/privacy" className="text-accent underline underline-offset-2 hover:text-accent/80">
                    privacy policy
                  </Link>
                </Label>
              </div>
            </div>

            <Button type="submit" disabled={submitting} className="w-full h-14 text-lg font-bold rounded-2xl active:scale-[0.98] transition-transform">
              {submitting ? "Processing…" : `Pay $${total.toFixed(2)}`}
            </Button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Payment;
