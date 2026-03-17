import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Globe, FileText, ShieldCheck, Clock, CheckCircle, ChevronDown, ChevronUp, Star, Award, Lock, Info, AlertTriangle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import translationsBg from "@/assets/translations-bg.jpg";
import logoAta from "@/assets/logo-ata.png";

const languages = [
"Spanish", "French", "Arabic", "Chinese (Simplified)", "Chinese (Traditional)",
"Portuguese", "Russian", "Japanese", "Korean", "German",
"Italian", "Hindi", "Urdu", "Turkish", "Farsi",
"Hebrew", "Polish", "Vietnamese", "Thai", "Tagalog",
"Greek", "Romanian", "Dutch", "Swedish", "Bengali",
"Swahili", "Malay", "Indonesian", "Czech", "Danish",
"Finnish", "Norwegian", "Hungarian", "Slovak", "Bulgarian",
"Croatian", "Serbian", "Slovenian", "Lithuanian", "Latvian",
"Estonian", "Ukrainian", "Georgian", "Armenian", "Azerbaijani",
"Kazakh", "Uzbek", "Pashto", "Nepali", "Sinhala",
"Burmese", "Khmer", "Lao", "Amharic", "Somali"];

const documents = [
{ name: "Birth Certificate", icon: FileText },
{ name: "Academic Transcripts", icon: FileText },
{ name: "Diploma / Degree", icon: Award },
{ name: "Marriage Certificate", icon: FileText },
{ name: "Driver's License", icon: FileText },
{ name: "Medical Records", icon: FileText },
{ name: "Bank Statements", icon: FileText },
{ name: "Immigration Papers", icon: FileText },
{ name: "Legal Contracts", icon: FileText },
{ name: "Business Documents", icon: FileText }];

const useCases = [
{ title: "USCIS Immigration", desc: "Certified translations accepted by all USCIS offices nationwide." },
{ title: "University Admissions", desc: "Translate academic records for college and graduate school applications." },
{ title: "Visa Applications", desc: "Document translations for visa processing at any embassy or consulate." },
{ title: "Credential Evaluations", desc: "Pair with our evaluation services for a streamlined admissions process." },
{ title: "Legal Proceedings", desc: "Court-ready certified translations for depositions, trials, and filings." },
{ title: "Professional Licensing", desc: "Translate credentials for state licensing boards and professional bodies." }];

const pricingFeatures = [
"Professional word-for-word translation",
"Signed & stamped certification letter",
"Digital PDF delivery",
"Formatting included",
"Revisions included",
"Secure & confidential handling"];

const faqs = [
{
  q: "What is a certified translation?",
  a: "A certified translation includes a signed statement by the translator or translation company attesting that the translation is accurate and complete. It is required by USCIS, universities, and government agencies."
},
{
  q: "How long does a translation take?",
  a: "Standard turnaround is 3–5 business days per document. Expedited service (1–2 business days) is available for an additional $25."
},
{
  q: "What languages do you translate?",
  a: "We translate documents from and into 150+ languages. If you don't see your language listed, contact us — we likely support it."
},
{
  q: "Will my translation be accepted by USCIS?",
  a: "Yes. All our certified translations meet USCIS requirements and are guaranteed to be accepted. If not, we will re-translate at no charge."
},
{
  q: "What counts as a 'word' for pricing?",
  a: "Everything that needs to be translated or reproduced counts — words, numbers, stamps, signatures, coat of arms, seals, dates, and any other content on the document."
},
{
  q: "What if my document has tables or formatted boxes?",
  a: "Documents with 5 or more formatted boxes/table cells per page require custom formatting and are priced at $70 per page (for 1–9 page projects). Our AI system automatically detects this upon upload."
},
{
  q: "What is a double page?",
  a: "If two pages are displayed side-by-side on a single sheet (a spread), it will be counted and billed as two separate pages with a $100 minimum."
}];

const Translations = () => {
  const [showAllLangs, setShowAllLangs] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const displayedLangs = showAllLangs ? languages : languages.slice(0, 10);

  return (
    <div className="bg-background min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] w-full flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${translationsBg})` }} />
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(215,80%,20%)]/[0.92] via-[hsl(215,70%,30%)]/[0.85] to-[hsl(215,60%,25%)]/[0.90]" />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-12 hero-text-shadow">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium mb-8 text-white opacity-70 hover:opacity-100 transition-opacity">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <p className="text-sm font-semibold tracking-[0.2em] uppercase mb-3 text-blue-200">
            Break Language Barriers
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-white">
            Translations
          </h1>
          <p className="mt-6 text-base md:text-lg max-w-xl font-semibold text-white/90">
            Eliminate any language barrier between you and your next opportunity. We can translate any document from or into English.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Link to="/translations/order" className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white text-[hsl(215,80%,25%)] font-semibold text-sm shadow-lg hover:scale-105 transition-all duration-300">
              Start Your Order
            </Link>
            <Link to="/translations/quote" className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-all duration-300">
              Get a Quote
            </Link>
          </div>
          <div className="flex items-center gap-2 mt-8">
            <div className="flex">
              {[...Array(5)].map((_, i) =>
              <Star key={i} size={16} fill="white" stroke="none" />
              )}
            </div>
            <span className="text-sm font-medium text-white/90">
              4.9 · Trusted by thousands of clients
            </span>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-b border-blue-200 bg-blue-50">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-8 grid grid-cols-2 md:grid-cols-5 gap-6">
          {[
          { icon: ShieldCheck, text: "USCIS Acceptance Guaranteed" },
          { icon: Award, text: "Professional Certified Translators" },
          { icon: Clock, text: "Fast Turnaround — Same-Day Available" },
          { icon: Lock, text: "Secure & Confidential" }].
          map(({ icon: Icon, text }) =>
          <div key={text} className="flex items-center gap-3">
              <Icon size={24} className="text-blue-700 shrink-0" />
              <span className="text-sm font-medium text-blue-950">{text}</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <img src={logoAta} alt="American Translators Association" className="h-8 object-contain" style={{ filter: "brightness(0) saturate(100%) invert(25%) sepia(80%) saturate(600%) hue-rotate(200deg)" }} />
          </div>
        </div>
      </section>

      {/* Pricing & Details */}
      <section className="py-24 px-6 md:px-12 content-bg">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left side — text + add-ons + turnaround */}
            <div className="space-y-8">
              <div>
                <p className="text-sm font-medium tracking-[0.2em] uppercase mb-3 text-accent">
                  Details & Pricing
                </p>
                <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-foreground">
                  What's included in our certified translation service
                </h2>
                <p className="mt-6 text-base text-muted-foreground font-light leading-relaxed">
                  A professionally prepared word-for-word translation of your documents, delivered on IFCS letterhead with a signed and stamped certificate of translation accuracy. Our expert translators deliver accurate, reliable translations with fast service, including same-day options. Enjoy clear pricing with no hidden fees and strict safeguards to keep your information secure.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                  <Link to="/translations/order" className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-accent text-accent-foreground font-semibold text-sm shadow-lg hover:scale-105 transition-all duration-300">
                    Start Your Order
                  </Link>
                  <Link to="/translations/quote" className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-border text-foreground font-semibold text-sm hover:bg-muted transition-all duration-300">
                    Get a Quote
                  </Link>
                </div>
              </div>

              {/* Add-ons */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <p className="text-sm font-medium tracking-[0.15em] uppercase text-muted-foreground mb-4">Available Add-Ons</p>
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">Expedited Turnaround</h4>
                      <p className="text-xs text-muted-foreground font-light mt-1">Priority processing — 1–2 business days delivery.</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground whitespace-nowrap">$25.00</span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">Hard Copy</h4>
                      <p className="text-xs text-muted-foreground font-light mt-1">Printed original shipped via FedEx with tracking.</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground whitespace-nowrap">$25.00</span>
                  </div>
                </div>
              </div>

              {/* Turnaround & Guarantee */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <p className="text-sm font-medium tracking-[0.15em] uppercase text-muted-foreground mb-4">Turnaround & Guarantee</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-start gap-2">
                    <Clock size={16} className="text-accent shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">3–5 business days</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Expedited: 1–2 days (+$25)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShieldCheck size={16} className="text-accent shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">100% Accepted</p>
                      <p className="text-xs text-muted-foreground mt-0.5">USCIS guaranteed</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Lock size={16} className="text-accent shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Secure</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Encrypted & confidential</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side — pricing card */}
            <div className="space-y-6">
              {/* Main pricing card */}
              <div className="rounded-2xl border-2 border-border bg-card text-foreground p-8 relative overflow-hidden shadow-lg">
                <div className="absolute top-0 left-0 right-0 h-1 bg-accent" />
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">Certified Translation</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Word-for-word document translation with certification letter for official use.
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <span className="text-3xl font-bold text-foreground">$50</span>
                    <p className="text-xs text-muted-foreground mt-0.5">per page</p>
                  </div>
                </div>

                {/* Pricing tiers info */}
                <div className="mt-6 p-4 rounded-xl bg-muted/60 border border-border">
                  <div className="flex items-start gap-2 mb-3">
                    <Info size={14} className="text-accent shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      First page includes up to <strong className="text-foreground">300 words</strong> (including numbers, stamps, signatures). Additional pages are charged at <strong className="text-foreground">$0.10/word</strong> for all words. Overage on any page: <strong className="text-foreground">$0.10/word</strong> beyond 300.
                    </p>
                  </div>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Custom formatting (5+ boxes)</span>
                      <span className="font-semibold text-foreground">+$20/page</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Additional pages</span>
                      <span className="font-semibold text-foreground">$0.10/word</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Birth Certificates</span>
                      <span className="font-semibold text-foreground">$75/page</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Double pages (side-by-side)</span>
                      <span className="font-semibold text-foreground">$100 flat</span>
                    </div>
                  </div>
                </div>

                {/* Included features */}
                <div className="mt-6">
                  <p className="text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground mb-3">What's Included</p>
                  <div className="grid grid-cols-1 gap-2.5">
                    {pricingFeatures.map((f) =>
                    <div key={f} className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-accent shrink-0" />
                      <span className="text-xs text-muted-foreground">{f}</span>
                    </div>
                    )}
                  </div>
                  <div className="mt-5 pt-4 border-t border-border space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-accent shrink-0" />
                      <span className="text-xs text-muted-foreground">USCIS acceptance guaranteed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-accent shrink-0" />
                      <span className="text-xs text-muted-foreground">Unlimited revisions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-accent shrink-0" />
                      <span className="text-xs text-muted-foreground">AI-powered word count verification</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-accent shrink-0" />
                      <span className="text-xs text-muted-foreground">Native-speaking professional translators</span>
                    </div>
                  </div>
                </div>

                {/* ATA badge inline */}
                <div className="mt-6 pt-4 border-t border-border flex items-center gap-3">
                  <Award size={18} className="text-accent shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Translated by <strong className="text-foreground">ATA-certified translators</strong> — the gold standard in professional translation accuracy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Languages */}
      <section className="py-24 px-6 md:px-12 content-bg-alt">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm font-medium tracking-[0.2em] uppercase mb-3 text-accent text-center">
            150+ Languages
          </p>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-center text-foreground">
            Translated by native-speaking professionals
          </h2>
          <p className="mt-4 text-base md:text-lg text-center text-muted-foreground max-w-2xl mx-auto font-light">
            Each translator is a vetted professional with native fluency. We match your document to the ideal linguist for accuracy and quality.
          </p>
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {displayedLangs.map((lang) =>
            <div
              key={lang}
              className="flex items-center gap-2 px-4 py-3 rounded-sm border border-border bg-card hover:border-accent/50 transition-colors">
                <Globe size={14} className="text-accent shrink-0" />
                <span className="text-sm font-medium text-foreground">{lang}</span>
              </div>
            )}
          </div>
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowAllLangs(!showAllLangs)}
              className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:opacity-80 transition-opacity">
              {showAllLangs ? "Show fewer" : "See all languages"}
              {showAllLangs ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>
      </section>

      {/* Documents */}
      <section className="py-24 px-6 md:px-12 content-bg">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm font-medium tracking-[0.2em] uppercase mb-3 text-accent text-center">
            Any Document
          </p>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-center text-foreground">
            Upload any document for translation
          </h2>
          <p className="mt-4 text-base md:text-lg text-center text-muted-foreground max-w-2xl mx-auto font-light">
            From birth certificates to legal contracts — our translators bring industry-specific expertise to ensure precision.
          </p>
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {documents.map(({ name, icon: Icon }) =>
            <div
              key={name}
              className="flex flex-col items-center gap-3 p-6 rounded-sm border border-border bg-card hover:border-accent/50 hover:shadow-sm transition-all text-center">
                <Icon size={28} className="text-accent" />
                <span className="text-sm font-medium text-foreground">{name}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 px-6 md:px-12 content-bg-alt">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm font-medium tracking-[0.2em] uppercase mb-3 text-accent text-center">
            Solutions
          </p>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-center text-foreground">
            Expert translations to meet your needs
          </h2>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map(({ title, desc }) =>
            <div
              key={title}
              className="p-8 rounded-sm border border-border bg-card hover:border-accent/50 transition-colors">
                <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">{desc}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Terms */}
      <section className="py-24 px-6 md:px-12 content-bg">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm font-medium tracking-[0.2em] uppercase mb-3 text-accent text-center">
            Pricing & Terms
          </p>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-center text-foreground mb-12">
            Transparent pricing, no surprises
          </h2>

          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-border bg-card">
              <h3 className="text-base font-semibold text-foreground mb-2">Page Definition</h3>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                Certified translation pages are limited to <strong className="text-foreground">300 words or less</strong>, including numbers, characters, signatures, and stamps. Everything that needs to be translated or reproduced counts as a word — stamps, signatures, numbers, coat of arms, seals, and all other content.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card">
              <h3 className="text-base font-semibold text-foreground mb-2">AI-Powered Word Count</h3>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                Our AI system automatically calculates the word count upon upload. The first 300 words are covered by the base page rate. Additional words are billed at <strong className="text-foreground">$0.10 per word</strong> (e.g., a 350-word page at $50 base totals $55).
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card">
              <h3 className="text-base font-semibold text-foreground mb-2">Custom Formatting</h3>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                If our AI detects 5 or more formatted boxes/table cells per page, the base rate adjusts to <strong className="text-foreground">$70 per page</strong> (for 1–9 page projects) to account for custom formatting work. Documents without complex formatting are billed at $50 per page.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card">
              <h3 className="text-base font-semibold text-foreground mb-2">Special Document Types</h3>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                <strong className="text-foreground">Birth certificates</strong> are always translated at $75 per page. <strong className="text-foreground">Double pages</strong> (two pages displayed side-by-side on a single sheet) are billed as two pages with a $100 minimum.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card">
              <h3 className="text-base font-semibold text-foreground mb-2">Upload Requirements</h3>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                All uploaded documents must be clear and legible. If our system detects a blurry or unreadable upload, you will be asked to re-upload a clearer version to ensure translation accuracy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 md:px-12 content-bg-alt">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-medium tracking-[0.2em] uppercase mb-3 text-accent text-center">
            FAQ
          </p>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-center text-foreground mb-12">
            Common questions
          </h2>
          <div className="space-y-0">
            {faqs.map(({ q, a }, i) =>
            <div key={i} className="border-b border-border">
                <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between py-6 text-left">
                  <span className="text-base font-medium text-foreground pr-4">{q}</span>
                  {openFaq === i ?
                <ChevronUp size={20} className="text-muted-foreground shrink-0" /> :
                <ChevronDown size={20} className="text-muted-foreground shrink-0" />
                }
                </button>
                {openFaq === i &&
              <p className="pb-6 text-sm text-muted-foreground font-light leading-relaxed">
                    {a}
                  </p>
              }
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 md:px-12 bg-primary text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-primary-foreground">
            Ready to get started?
          </h2>
          <p className="mt-4 text-base md:text-lg text-primary-foreground/70 font-light">
            Upload your document and receive a certified translation in as little as 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
            <Link to="/translations/order" className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-accent text-accent-foreground font-semibold text-sm shadow-lg hover:scale-105 transition-all duration-300">
              Start Your Order
            </Link>
            <Link to="/translations/quote" className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-primary-foreground/30 text-primary-foreground font-semibold text-sm hover:bg-primary-foreground/10 transition-all duration-300">
              Get a Quote
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>);
};

export default Translations;
