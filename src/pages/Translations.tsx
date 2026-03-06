import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Globe, FileText, ShieldCheck, Clock, CheckCircle, ChevronDown, ChevronUp, Star, Award, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import translationsBg from "@/assets/translations-bg.jpg";

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


const addOns = [
{ name: "Expedited Turnaround", desc: "Priority processing — 50% faster delivery.", price: "$14.95 / page" },
{ name: "Notarization", desc: "Notarized stamp valid in all 50 states.", price: "$19.95 / order" },
{ name: "Hard Copy", desc: "Printed original shipped via FedEx with tracking.", price: "From $14.95" }];


const faqs = [
{
  q: "What is a certified translation?",
  a: "A certified translation includes a signed statement by the translator or translation company attesting that the translation is accurate and complete. It is required by USCIS, universities, and government agencies."
},
{
  q: "How long does a translation take?",
  a: "Standard turnaround is 2–3 business days per document. Expedited options are available for same-day or next-day delivery."
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
  q: "Can I get my document notarized?",
  a: "Yes. We offer notarization as an add-on service. The notarized document is valid in all 50 U.S. states."
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
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${translationsBg})` }} />
        
        <div className="video-overlay" />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-12 hero-text-shadow">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium mb-8 opacity-70 hover:opacity-100 transition-opacity"
            style={{ color: "white" }}>
            
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <p className="text-sm font-medium tracking-[0.2em] uppercase mb-3 opacity-80" style={{ color: "white" }}>
            Break Language Barriers
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight" style={{ color: "white" }}>
            Certified Translation
            <br />
            <span className="opacity-100">Services</span>
          </h1>
          <p className="mt-6 text-base md:text-lg max-w-xl font-light opacity-80" style={{ color: "white" }}>
            Get your documents translated and certified by professional translators in 150+ languages.
            Fast, accurate, and accepted by USCIS, universities, and government agencies.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Link
              to="/translations/order"
              className="tesla-btn-primary">
              
              Start Your Order
            </Link>
            <a
              href="https://ifcsevals.com/contact-us"
              target="_blank"
              rel="noopener noreferrer"
              className="tesla-btn-outline">
              
              Get a Quote
            </a>
          </div>
          {/* Trust bar */}
          <div className="flex items-center gap-2 mt-8">
            <div className="flex">
              {[...Array(5)].map((_, i) =>
              <Star key={i} size={16} fill="hsl(45 93% 58%)" stroke="none" />
              )}
            </div>
            <span className="text-sm font-medium opacity-90" style={{ color: "white" }}>
              4.9 · Trusted by thousands of clients
            </span>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-b border-border content-bg-alt">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
          { icon: ShieldCheck, text: "USCIS Acceptance Guaranteed" },
          { icon: Award, text: "Professional Certified Translators" },
          { icon: Clock, text: "Fast Turnaround — Same-Day Available" },
          { icon: Lock, text: "Secure & Confidential" }].
          map(({ icon: Icon, text }) =>
          <div key={text} className="flex items-center gap-3">
              <Icon size={24} className="text-accent shrink-0" />
              <span className="text-sm font-medium text-foreground">{text}</span>
            </div>
          )}
        </div>
      </section>

      {/* Languages */}
      <section className="py-24 px-6 md:px-12 content-bg">
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
      <section className="py-24 px-6 md:px-12 content-bg-alt">
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
      <section className="py-24 px-6 md:px-12 content-bg">
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

      {/* Pricing */}
      <section className="py-24 px-6 md:px-12 content-bg-alt">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm font-medium tracking-[0.2em] uppercase mb-3 text-accent text-center">
            Details & Pricing
          </p>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-center text-foreground">
            What's included in our service
          </h2>
          <p className="mt-4 text-base md:text-lg text-center text-muted-foreground max-w-2xl mx-auto font-light">
            A professionally prepared word-for-word translation delivered with a signed and stamped certificate of accuracy.
          </p>

          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Main pricing card */}
            <div className="p-8 rounded-sm border-2 border-accent bg-card">
              <p className="text-sm font-medium tracking-[0.15em] uppercase text-accent mb-2">Certified Translation</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-semibold text-foreground">$50</span>
                <span className="text-muted-foreground text-sm">per page</span>
              </div>
              <div className="space-y-3">
                {pricingFeatures.map((f) =>
                <div key={f} className="flex items-center gap-3">
                    <CheckCircle size={16} className="text-accent shrink-0" />
                    <span className="text-sm text-foreground">{f}</span>
                  </div>
                )}
              </div>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/translations/order"
                  className="tesla-btn-primary text-center">
                  
                  Start Your Order
                </Link>
              </div>
            </div>

            {/* Add-ons */}
            <div className="p-8 rounded-sm border border-border bg-card">
              <p className="text-sm font-medium tracking-[0.15em] uppercase text-muted-foreground mb-6">Available Add-Ons</p>
              <div className="space-y-6">
                {addOns.map(({ name, desc, price }) =>
                <div key={name} className="flex items-start justify-between gap-4 pb-6 border-b border-border last:border-0 last:pb-0">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{name}</h4>
                      <p className="text-sm text-muted-foreground font-light mt-1">{desc}</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground whitespace-nowrap">{price}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 md:px-12 content-bg">
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
            <Link
              to="/translations/order"
              className="tesla-btn-primary">
              
              Start Your Order
            </Link>
            <a
              href="https://ifcsevals.com/contact-us"
              target="_blank"
              rel="noopener noreferrer"
              className="tesla-btn-outline">
              
              Contact Us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>);

};

export default Translations;