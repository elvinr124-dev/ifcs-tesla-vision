import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import paymentBg from "@/assets/payment-bg.jpg";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 14 }, (_, i) => currentYear + i);
const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));

const Payment = () => {
  const { items, discountAmount } = useCart();
  const subtotal = items.reduce((s, i) => s + i.price, 0);
  const discount = subtotal * (discountAmount / 100);
  const total = Math.max(0, subtotal - discount);

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

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

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
        <div className="absolute inset-0 bg-black/60" />
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
        <div className="max-w-2xl mx-auto">
          <div className="mb-10 text-center">
            <p className="text-3xl font-bold text-foreground">
              Your total: <span className="text-accent">${total.toFixed(2)}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name on documents */}
            <div className="space-y-2">
              <Label htmlFor="docName" className="text-foreground">Name on the documents *</Label>
              <Input id="docName" value={form.docName} onChange={set("docName")} required placeholder="Full name as shown on documents" className="bg-muted/50 border-border" />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email address *</Label>
              <Input id="email" type="email" value={form.email} onChange={set("email")} required placeholder="you@example.com" className="bg-muted/50 border-border" />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground">Phone number *</Label>
              <Input id="phone" type="tel" value={form.phone} onChange={set("phone")} required placeholder="(555) 123-4567" className="bg-muted/50 border-border" />
            </div>

            {/* IFCS ID */}
            <div className="space-y-2">
              <Label htmlFor="ifcsId" className="text-foreground">IFCS ID (if provided)</Label>
              <Input id="ifcsId" value={form.ifcsId} onChange={set("ifcsId")} placeholder="Optional" className="bg-muted/50 border-border" />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-foreground">Amount to pay *</Label>
              <Input id="amount" type="number" min="0" step="0.01" value={form.amount} onChange={set("amount")} required placeholder="0.00" className="bg-muted/50 border-border" />
            </div>

            {/* Card holder */}
            <div className="space-y-2">
              <Label htmlFor="cardHolder" className="text-foreground">Name of the credit card holder *</Label>
              <Input id="cardHolder" value={form.cardHolder} onChange={set("cardHolder")} required placeholder="Cardholder name" className="bg-muted/50 border-border" />
            </div>

            {/* Card number */}
            <div className="space-y-2">
              <Label htmlFor="cardNumber" className="text-foreground">Card Number *</Label>
              <Input id="cardNumber" value={form.cardNumber} onChange={set("cardNumber")} required placeholder="1234 5678 9012 3456" maxLength={19} className="bg-muted/50 border-border" />
            </div>

            {/* Expiry + CVV row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Month *</Label>
                <Select value={form.expMonth} onValueChange={(v) => setForm((p) => ({ ...p, expMonth: v }))}>
                  <SelectTrigger className="bg-muted/50 border-border">
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
                <Label className="text-foreground">Year *</Label>
                <Select value={form.expYear} onValueChange={(v) => setForm((p) => ({ ...p, expYear: v }))}>
                  <SelectTrigger className="bg-muted/50 border-border">
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
                <Label htmlFor="cvv" className="text-foreground">CVV *</Label>
                <Input id="cvv" value={form.cvv} onChange={set("cvv")} required placeholder="123" maxLength={4} className="bg-muted/50 border-border" />
              </div>
            </div>

            {/* Terms & Privacy checkboxes */}
            <div className="space-y-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Please read and agree to the terms and conditions &amp; privacy policy:
              </p>
              <div className="flex items-start gap-3">
                <Checkbox id="terms" checked={agreeTerms} onCheckedChange={(v) => setAgreeTerms(v === true)} />
                <Label htmlFor="terms" className="text-sm text-foreground leading-snug">
                  I agree to the{" "}
                  <Link to="/terms" className="text-accent underline underline-offset-2 hover:text-accent/80">
                    terms and conditions
                  </Link>
                </Label>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox id="privacy" checked={agreePrivacy} onCheckedChange={(v) => setAgreePrivacy(v === true)} />
                <Label htmlFor="privacy" className="text-sm text-foreground leading-snug">
                  I agree to the{" "}
                  <Link to="/privacy" className="text-accent underline underline-offset-2 hover:text-accent/80">
                    privacy policy
                  </Link>
                </Label>
              </div>
            </div>

            <Button type="submit" disabled={submitting} className="w-full h-14 text-lg font-bold rounded-2xl mt-6">
              {submitting ? "Processing…" : "Submit Payment"}
            </Button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Payment;
