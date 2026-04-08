import { useState, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, X, CheckCircle, Send, Loader2, AlertTriangle, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToHome from "@/components/BackToHome";
import translationsBg from "@/assets/translations-bg.jpg";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLocale } from "@/context/LocaleContext";

interface FileAnalysis {
  file: File;
  analyzing: boolean;
  analysis: {
    wordCount: number;
    hasFormattedBoxes: boolean;
    isBlurry: boolean;
    isBirthCertificate: boolean;
    isDoublePage: boolean;
    documentType: string;
    blurryReason?: string;
  } | null;
  error?: string;
  preview?: string;
}

const GlassInput = ({
  value, onChange, placeholder, type = "text", required,
}: {
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; type?: string; required?: boolean;
}) => (
  <input
    type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
    className="w-full h-12 px-4 rounded-2xl text-sm text-foreground placeholder:text-muted-foreground bg-muted/60 border border-border focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-accent transition-all duration-200 backdrop-blur-sm"
  />
);

const FieldGroup = ({ label, required: req, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold tracking-[0.15em] uppercase text-muted-foreground">
      {label} {req && <span className="text-accent">*</span>}
    </label>
    {children}
  </div>
);

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-muted-foreground border-b border-border pb-2 mb-5">
    {children}
  </p>
);

const TranslationQuote = () => {
  const { translate, translateDual } = useLocale();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [transFrom, setTransFrom] = useState("");
  const [transTo, setTransTo] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Generate T-prefix application ID for quotes
  const [appIdSeed] = useState(() => Math.floor(1000 + Math.random() * 9000));
  const quoteAppId = useMemo(() => {
    const nameParts = name.trim().split(/\s+/);
    const f = (nameParts[0]?.[0] || "X").toUpperCase();
    const l = (nameParts[nameParts.length - 1]?.[0] || "X").toUpperCase();
    return `T${f}${l}${String(appIdSeed).padStart(4, "0")}`;
  }, [name, appIdSeed]);

  const [fileAnalyses, setFileAnalyses] = useState<FileAnalysis[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeFile = async (file: File, index: number) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(",")[1];
      const preview = e.target?.result as string;

      setFileAnalyses(prev => prev.map((fa, i) =>
        i === index ? { ...fa, preview, analyzing: true } : fa
      ));

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-document`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ imageBase64: base64, fileName: file.name }),
          }
        );

        if (!response.ok) throw new Error("Analysis failed");
        const analysis = await response.json();

        if (analysis.isBlurry) {
          toast({
            title: "Blurry Document Detected",
            description: analysis.blurryReason || "Please re-upload a clearer version.",
            variant: "destructive",
          });
        }

        setFileAnalyses(prev => prev.map((fa, i) =>
          i === index ? { ...fa, analyzing: false, analysis } : fa
        ));
      } catch {
        setFileAnalyses(prev => prev.map((fa, i) =>
          i === index ? { ...fa, analyzing: false, error: "Could not analyze. You can still submit." } : fa
        ));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const startIndex = fileAnalyses.length;
      const newAnalyses: FileAnalysis[] = newFiles.map(f => ({
        file: f, analyzing: false, analysis: null,
      }));
      setFileAnalyses(prev => [...prev, ...newAnalyses]);
      newFiles.forEach((file, i) => analyzeFile(file, startIndex + i));
    }
    if (e.target) e.target.value = "";
  };

  const removeFile = (idx: number) => {
    setFileAnalyses(prev => prev.filter((_, i) => i !== idx));
  };

  const hasBlurryFiles = fileAnalyses.some(fa => fa.analysis?.isBlurry);
  const isAnalyzing = fileAnalyses.some(fa => fa.analyzing);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !transFrom.trim() || !transTo.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    if (hasBlurryFiles) {
      setError("Please remove or re-upload blurry documents.");
      return;
    }
    if (isAnalyzing) {
      setError("Please wait for document analysis to complete.");
      return;
    }
    if (fileAnalyses.length === 0) {
      setError("Please upload at least one document.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const docSummary = fileAnalyses.map(fa => {
        const a = fa.analysis;
        return `- ${fa.file.name}: ${a ? `${a.wordCount} words, ${a.documentType}${a.isDoublePage ? ' (Double Page)' : ''}${a.hasFormattedBoxes ? ' (5+ boxes)' : ''}${a.isBirthCertificate ? ' (Birth Certificate)' : ''}` : 'Analysis pending'}`;
      }).join("\n");

      await supabase.functions.invoke("send-application-email", {
        body: {
          to: "translations@ifcsevals.com",
          subject: `Translation Quote Request — ${name} (${quoteAppId})`,
          html: `
            <h2>Translation Quote Request</h2>
            <p><strong>Application ID:</strong> ${quoteAppId}</p>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || "N/A"}</p>
            <p><strong>From:</strong> ${transFrom} → <strong>To:</strong> ${transTo}</p>
            ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ""}
            <h3>Documents (${fileAnalyses.length}):</h3>
            <pre>${docSummary}</pre>
          `,
        },
      });

      // Save quote to client_orders
      try {
        await supabase.from("client_orders").insert({
          reference_id: quoteAppId,
          client_email: email,
          service: `Translation Quote: ${transFrom} → ${transTo}`,
          status: "requested",
          application_id: quoteAppId,
          dob: "",
        });
      } catch (err) {
        console.error("Failed to save quote order:", err);
      }

      setSubmitted(true);
    } catch {
      toast({ title: "Error", description: "Could not submit quote request. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[50vh] min-h-[360px] w-full flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${translationsBg})` }} />
        <div className="video-overlay" />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-12">
          <Link to="/translations" className="inline-flex items-center gap-2 text-sm font-medium mb-8 opacity-70 hover:opacity-100 transition-opacity text-white">
            <ArrowLeft size={16} /> {translate("Back to Translations")}
          </Link>
          <p className="text-sm font-semibold tracking-[0.25em] uppercase text-accent mb-3">{translate("Request a Quote")}</p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white">
            {translate("Translation Quote")}
          </h1>
          <p className="mt-4 text-base md:text-lg text-white/80 font-light max-w-xl">
            {translate("Upload your documents for a personalized quote. Our AI will analyze word counts and our team will review and respond with pricing.")}
          </p>
        </div>
      </section>

      {submitted ? (
        <section className="py-32 px-6 md:px-12 text-center">
          <div className="max-w-xl mx-auto rounded-3xl border border-accent/40 bg-accent/5 p-12">
            <CheckCircle size={56} className="text-accent mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-foreground mb-3">{translate("Quote Request Submitted!")}</h2>
            <p className="text-lg font-semibold text-accent mb-2">Application ID: {quoteAppId}</p>
            <p className="text-muted-foreground font-light mb-8">{translate("Our team will review your documents and send a detailed quote to your email shortly.")}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/dashboard" className="inline-flex items-center gap-3 px-8 py-4 rounded-3xl bg-accent text-accent-foreground font-bold shadow-xl shadow-accent/40 hover:scale-105 transition-all duration-300">
                My Dashboard
              </Link>
              <Link to="/translations" className="inline-flex items-center gap-3 px-8 py-4 rounded-3xl border border-border text-foreground font-bold hover:bg-muted/50 transition-all duration-300">
                {translate("Back to Translations")}
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="max-w-6xl mx-auto px-6 md:px-12 py-16 grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Left — Form */}
            <div className="lg:col-span-2 space-y-10">

              {error && (
                <div className="rounded-2xl bg-destructive/10 border border-destructive/30 px-5 py-4 text-sm text-destructive font-medium">
                  {error}
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-6">
                <SectionHeading>{translateDual("Your Information")}</SectionHeading>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldGroup label={translateDual("Full Name")} required>
                    <GlassInput value={name} onChange={e => setName(e.target.value)} placeholder="Full name" required />
                  </FieldGroup>
                  <FieldGroup label={translateDual("E-mail")} required>
                    <GlassInput value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" type="email" required />
                  </FieldGroup>
                </div>
                <FieldGroup label={translateDual("Phone")}>
                  <GlassInput value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" type="tel" />
                </FieldGroup>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldGroup label={translateDual("Translating From")} required>
                    <GlassInput value={transFrom} onChange={e => setTransFrom(e.target.value)} placeholder="e.g. Spanish" required />
                  </FieldGroup>
                  <FieldGroup label={translateDual("Translating Into")} required>
                    <GlassInput value={transTo} onChange={e => setTransTo(e.target.value)} placeholder="e.g. English" required />
                  </FieldGroup>
                </div>
                <FieldGroup label={translateDual("Additional Notes")}>
                  <textarea
                    value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="Any special instructions or details about your documents..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-2xl text-sm text-foreground placeholder:text-muted-foreground bg-muted/60 border border-border focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-accent transition-all duration-200 resize-none"
                  />
                </FieldGroup>
              </div>

              {/* Upload */}
              <div className="space-y-5">
                <SectionHeading>{translateDual("Upload Your Documents")}</SectionHeading>
                <p className="text-sm text-muted-foreground font-light">
                  {translate("Upload clear images or PDFs. Our AI will analyze word counts for review — pricing will be provided by our team.")}
                </p>

                <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border rounded-2xl p-8 cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-all duration-200 group">
                  <Upload size={28} className="text-muted-foreground group-hover:text-accent transition-colors" />
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-accent transition-colors">{translate("Click to browse files")}</span>
                  <span className="text-xs text-muted-foreground/60">{translate("PDF, JPG, PNG supported · Max 4MB per file")}</span>
                  <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
                </label>

                {fileAnalyses.length > 0 && (
                  <div className="space-y-3">
                    {fileAnalyses.map((fa, i) => (
                      <div key={i} className={`rounded-2xl border p-4 ${fa.analysis?.isBlurry ? 'border-destructive/50 bg-destructive/5' : 'border-border bg-muted/30'}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            {fa.preview && (
                              <img src={fa.preview} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0 border border-border" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-foreground truncate">{fa.file.name}</p>

                              {fa.analyzing && (
                                <div className="flex items-center gap-2 mt-1">
                                  <Loader2 size={12} className="animate-spin text-accent" />
                                  <span className="text-xs text-muted-foreground">{translate("Analyzing document...")}</span>
                                </div>
                              )}

                              {fa.analysis && !fa.analysis.isBlurry && (
                                <div className="mt-1 space-y-1">
                                  <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
                                      <FileText size={10} /> {fa.analysis.documentType}
                                    </span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                                      {fa.analysis.wordCount} words
                                    </span>
                                    {fa.analysis.hasFormattedBoxes && (
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium dark:bg-orange-900/30 dark:text-orange-400">5+ boxes</span>
                                    )}
                                    {fa.analysis.isDoublePage && (
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium dark:bg-blue-900/30 dark:text-blue-400">Double page</span>
                                    )}
                                    {fa.analysis.isBirthCertificate && (
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium dark:bg-purple-900/30 dark:text-purple-400">Birth Certificate</span>
                                    )}
                                  </div>
                                </div>
                              )}

                              {fa.analysis?.isBlurry && (
                                <div className="mt-1 flex items-start gap-2">
                                  <AlertTriangle size={14} className="text-destructive shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-xs text-destructive font-medium">Blurry document detected</p>
                                    <p className="text-xs text-destructive/70">{fa.analysis.blurryReason || "Please re-upload a clearer version."}</p>
                                  </div>
                                </div>
                              )}

                              {fa.error && <p className="text-xs text-muted-foreground mt-1">{fa.error}</p>}
                            </div>
                          </div>
                          <button type="button" onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm font-medium text-accent hover:opacity-75 transition-opacity underline underline-offset-4">
                  {translate("+ Add another file")}
                </button>
              </div>

              {/* Submit */}
              <div className="flex justify-center pt-2 pb-6">
                <button
                  type="submit"
                  disabled={isAnalyzing || hasBlurryFiles || submitting}
                  className="group inline-flex items-center gap-4 px-12 py-5 rounded-full bg-accent text-accent-foreground font-bold text-lg tracking-wide shadow-2xl shadow-accent/40 hover:shadow-accent/60 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {submitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                  <span>{submitting ? translate("Submitting...") : translate("Submit Quote Request")}</span>
                </button>
              </div>
            </div>

            {/* Right — Summary + Payment */}
            <div className="space-y-6">

              {/* Document Summary */}
              <div className="rounded-3xl border border-accent/30 bg-white shadow-lg p-8 space-y-5 sticky top-24">
                <SectionHeading>{translateDual("Document Summary")}</SectionHeading>

                {fileAnalyses.length === 0 ? (
                  <p className="text-sm text-muted-foreground font-light text-center py-4">
                    {translate("Upload documents to see analysis")}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {fileAnalyses.map((fa, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-muted-foreground truncate max-w-[60%]">
                          {fa.file.name}
                          {fa.analyzing && " (analyzing...)"}
                        </span>
                        <span className="font-medium text-foreground">
                          {fa.analysis ? `${fa.analysis.wordCount} words` : "—"}
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-border pt-3">
                      <p className="text-xs text-muted-foreground">
                        {translate("Our team will review your documents and provide a detailed quote via email.")}
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </form>
      )}

      <BackToHome />
      <Footer />
    </div>
  );
};

export default TranslationQuote;
