import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, FileText, Upload, CreditCard, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import brooklynBridge from "@/assets/brooklyn-bridge-night.jpg";

const steps = [
  {
    number: 1,
    icon: FileText,
    title: "Determine Your Service",
    description:
      'Determine which evaluation service you need (see our Evaluations page). If you are not able to determine which evaluation is best for you, contact IFCS at info@ifcsevals.com.',
  },
  {
    number: 2,
    icon: CheckCircle,
    title: "Complete Application",
    description:
      "Complete the online application below, or download the PDF application.",
  },
  {
    number: 3,
    icon: Upload,
    title: "Upload Documents",
    description:
      "Please upload legible copies of your transcripts/mark sheets and diploma certificates. If your documents are in a foreign language, and you do not have a certified translation, we can provide a translation quote.",
  },
  {
    number: 4,
    icon: CreditCard,
    title: "Submit & Pay",
    description:
      "Submit a completed and signed application, with all accompanying documents from Step 3, and make a payment.",
  },
];

const Application = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // placeholder — no backend yet
    alert("Application submitted! We will contact you shortly.");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[60vh] min-h-[420px] w-full flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${brooklynBridge})` }}
        />
        <div className="video-overlay" />
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-12">
          <Link
            to="/evaluations"
            className="inline-flex items-center gap-2 text-sm font-medium mb-6 opacity-70 hover:opacity-100 transition-opacity text-white"
          >
            <ArrowLeft size={16} />
            Back to Evaluations
          </Link>
          <p className="text-sm font-medium tracking-[0.2em] uppercase mb-3 text-accent">
            Get Started
          </p>
          <h1 className="tesla-hero-title text-white">
            Start Your Application
          </h1>
          <p className="tesla-hero-subtitle max-w-2xl text-white/80">
            Follow the steps below to submit your credentials for evaluation.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-foreground text-center mb-4">
            Application Instructions
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Four simple steps to get your credentials evaluated.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="rounded-lg border border-border bg-card p-6 flex gap-5 hover:shadow-lg transition-shadow"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Icon size={22} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1">
                      Step {step.number}
                    </p>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact / Application Form */}
      <section className="py-20 px-6 md:px-12 bg-muted/30">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground text-center mb-2">
            Online Application
          </h2>
          <p className="text-center text-muted-foreground mb-10">
            Fill out the form below to get started. We'll reach out to you with next steps.
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-lg border border-border bg-card p-8"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Your name *</Label>
              <Input
                id="name"
                name="name"
                required
                maxLength={100}
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Your e-mail address *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                maxLength={255}
                value={form.email}
                onChange={handleChange}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Your phone number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                maxLength={20}
                value={form.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">How can we help you? *</Label>
              <textarea
                id="message"
                name="message"
                required
                maxLength={1000}
                value={form.message}
                onChange={handleChange}
                rows={4}
                placeholder="Tell us about your evaluation needs..."
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <Button type="submit" className="w-full tesla-btn-primary !rounded-md">
              Submit Application
            </Button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Application;
