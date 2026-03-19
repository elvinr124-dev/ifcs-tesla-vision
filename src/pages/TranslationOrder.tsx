import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, X, CheckCircle, Send, CreditCard, Loader2, AlertTriangle, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import translationsBg from "@/assets/translations-bg.jpg";
import { toast } from "@/hooks/use-toast";
import * as pdfjsLib from "pdfjs-dist";

// Set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;

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

/**
 * Pricing logic:
 * - Page 1: $50 base (300 words included) + $0.10/word over 300 + $20 formatting if 5+ boxes
 * - Pages 2+: $0.10/word for ALL words (no base) + $20 formatting if 5+ boxes
 * - Double page: $100 flat (600 words included) + $0.10/word over 600 + $20 formatting if 5+ boxes
 * - Birth certificate: always $75 per page + $0.10/word over 300
 */
function calculatePagePrice(
  analysis: FileAnalysis["analysis"],
  pageIndex: number
): { price: number; pageCount: number; label: string; breakdown: string; formattingFee: number; baseFee: number; wordCost: number } {
  if (!analysis) return { price: 50, pageCount: 1, label: "Standard", breakdown: "$50 base", formattingFee: 0, baseFee: 50, wordCost: 0 };

  const formattingFee = analysis.hasFormattedBoxes ? 20 : 0;

  // Double page
  if (analysis.isDoublePage) {
    const extraWords = Math.max(0, analysis.wordCount - 600);
    const wordCost = extraWords * 0.10;
    const price = 100 + wordCost + formattingFee;
    return {
      price, pageCount: 2, label: "Double Page",
      breakdown: `$100 flat${wordCost > 0 ? ` + $${wordCost.toFixed(2)} (${extraWords} extra words)` : ""}${formattingFee > 0 ? ` + $20 formatting` : ""}`,
      formattingFee, baseFee: 100, wordCost,
    };
  }

  // Birth certificate
  if (analysis.isBirthCertificate) {
    const extraWords = Math.max(0, analysis.wordCount - 300);
    const wordCost = extraWords * 0.10;
    const price = 75 + wordCost;
    return {
      price, pageCount: 1, label: "Birth Certificate",
      breakdown: `$75 base${wordCost > 0 ? ` + $${wordCost.toFixed(2)} (${extraWords} extra words)` : ""}`,
      formattingFee: 0, baseFee: 75, wordCost,
    };
  }

  // First page
  if (pageIndex === 0) {
    const extraWords = Math.max(0, analysis.wordCount - 300);
    const wordCost = extraWords * 0.10;
    const price = 50 + wordCost + formattingFee;
    return {
      price, pageCount: 1,
      label: formattingFee > 0 ? "Standard + Formatting" : "Standard",
      breakdown: `$50 base${wordCost > 0 ? ` + $${wordCost.toFixed(2)} (${extraWords} extra words)` : ""}${formattingFee > 0 ? ` + $20 formatting` : ""}`,
      formattingFee, baseFee: 50, wordCost,
    };
  }

  // Subsequent pages
  const wordCost = analysis.wordCount * 0.10;
  const price = wordCost + formattingFee;
  return {
    price, pageCount: 1,
    label: formattingFee > 0 ? "Additional page + Formatting" : "Additional page",
    breakdown: `${wordCost > 0 ? `$${wordCost.toFixed(2)} (${analysis.wordCount} words × $0.10)` : "No words"}${formattingFee > 0 ? ` + $20 formatting` : ""}`,
    formattingFee, baseFee: 0, wordCost,
  };
}

const TranslationOrder = () => {
  const [fullName, setFullName] = useState("");
  const [emailVal, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [transFrom, setTransFrom] = useState("");
  const [transTo, setTransTo] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [fileAnalyses, setFileAnalyses] = useState<FileAnalysis[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // Add-ons
  const [addExpedited, setAddExpedited] = useState(false);
  const [addHardCopy, setAddHardCopy] = useState(false);

  // Payment fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardZip, setCardZip] = useState("");
  const [cardName, setCardName] = useState("");

  // Convert a single PDF page to a base64 image
  const pdfPageToBase64 = async (pdfDoc: pdfjsLib.PDFDocumentProxy, pageNum: number): Promise<string> => {
    const page = await pdfDoc.getPage(pageNum);
    const scale = 2; // high res for AI analysis
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport }).promise;
    return canvas.toDataURL("image/jpeg", 0.85);
  };

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
            description: analysis.blurryReason || "Please re-upload a clearer version of this document.",
            variant: "destructive",
          });
        }

        setFileAnalyses(prev => prev.map((fa, i) =>
          i === index ? { ...fa, analyzing: false, analysis } : fa
        ));
      } catch {
        setFileAnalyses(prev => prev.map((fa, i) =>
          i === index ? { ...fa, analyzing: false, error: "Could not analyze document. You can still submit for manual review." } : fa
        ));
      }
    };
    reader.readAsDataURL(file);
  };

  // Process PDF: split into individual pages and analyze each
  const processPdf = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pageCount = pdfDoc.numPages;

    // Create placeholder entries for all pages
    const startIndex = fileAnalyses.length;
    const placeholders: FileAnalysis[] = [];
    for (let p = 1; p <= pageCount; p++) {
      placeholders.push({
        file: new File([], `${file.name} — Page ${p}`, { type: "image/jpeg" }),
        analyzing: false,
        analysis: null,
      });
    }
    setFileAnalyses(prev => [...prev, ...placeholders]);

    // Analyze each page
    for (let p = 1; p <= pageCount; p++) {
      const idx = startIndex + p - 1;
      const dataUrl = await pdfPageToBase64(pdfDoc, p);
      const base64 = dataUrl.split(",")[1];

      setFileAnalyses(prev => prev.map((fa, i) =>
        i === idx ? { ...fa, preview: dataUrl, analyzing: true } : fa
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
            body: JSON.stringify({ imageBase64: base64, fileName: `${file.name} - Page ${p}` }),
          }
        );

        if (!response.ok) throw new Error("Analysis failed");
        const analysis = await response.json();

        if (analysis.isBlurry) {
          toast({
            title: `Blurry Page Detected (Page ${p})`,
            description: analysis.blurryReason || "Please re-upload a clearer version of this document.",
            variant: "destructive",
          });
        }

        setFileAnalyses(prev => prev.map((fa, i) =>
          i === idx ? { ...fa, analyzing: false, analysis } : fa
        ));
      } catch {
        setFileAnalyses(prev => prev.map((fa, i) =>
          i === idx ? { ...fa, analyzing: false, error: "Could not analyze page. You can still submit for manual review." } : fa
        ));
      }
    }
  };

  const processFiles = async (files: File[]) => {
    for (const file of files) {
      if (file.type === "application/pdf") {
        await processPdf(file);
      } else {
        const startIndex = fileAnalyses.length;
        const newAnalysis: FileAnalysis = { file, analyzing: false, analysis: null };
        setFileAnalyses(prev => [...prev, newAnalysis]);
        analyzeFile(file, startIndex);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
    if (e.target) e.target.value = "";
  };

  // Drag and drop handlers

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    dragCounter.current = 0;
    const files = Array.from(e.dataTransfer.files).filter(f =>
      ["application/pdf", "image/jpeg", "image/png", "image/jpg"].includes(f.type)
    );
    if (files.length > 0) processFiles(files);
  }, [fileAnalyses.length]);

  const removeFile = (idx: number) => {
    setFileAnalyses(prev => prev.filter((_, i) => i !== idx));
  };

  // Calculate pricing per page — exclude errored/blurry pages
  const pagePricing = fileAnalyses.map((fa, i) => calculatePagePrice(fa.analysis, i));

  const subtotal = pagePricing.reduce((sum, p, i) => {
    const fa = fileAnalyses[i];
    if (fa.error || fa.analysis?.isBlurry || fa.analyzing || !fa.analysis) return sum;
    return sum + p.price;
  }, 0);
  const totalPages = pagePricing.reduce((sum, p, i) => {
    const fa = fileAnalyses[i];
    if (fa.error || fa.analysis?.isBlurry || fa.analyzing || !fa.analysis) return sum;
    return sum + p.pageCount;
  }, 0);
  const expeditedCost = addExpedited ? 25 : 0;
  const hardCopyCost = addHardCopy ? 25 : 0;
  const total = subtotal + expeditedCost + hardCopyCost;

  const hasBlurryFiles = fileAnalyses.some(fa => fa.analysis?.isBlurry);
  const isAnalyzing = fileAnalyses.some(fa => fa.analyzing);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !emailVal.trim() || !transFrom.trim() || !transTo.trim()) {
      setError("Please fill in all required fields before submitting.");
      return;
    }
    if (hasBlurryFiles) {
      setError("Please remove or re-upload blurry documents before submitting.");
      return;
    }
    if (isAnalyzing) {
      setError("Please wait for document analysis to complete.");
      return;
    }
    if (!cardNumber.trim() || !cardExpiry.trim() || !cardCvc.trim()) {
      setError("Please enter your payment details.");
      return;
    }
    setError("");
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen content-bg">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[50vh] min-h-[360px] w-full flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${translationsBg})` }} />
        <div className="video-overlay" />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-12">
          <Link to="/translations" className="inline-flex items-center gap-2 text-sm font-medium mb-8 opacity-70 hover:opacity-100 transition-opacity text-white">
            <ArrowLeft size={16} /> Back to Translations
          </Link>
          <p className="text-sm font-semibold tracking-[0.25em] uppercase text-accent mb-3">Place Your Order</p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white">
            Translation Order
          </h1>
          <p className="mt-4 text-base md:text-lg text-white/80 font-light max-w-xl">
            Upload your documents, our AI calculates pricing, and pay securely. Certified translations starting at $50/page.
          </p>
        </div>
      </section>

      {submitted ? (
        <section className="py-32 px-6 md:px-12 text-center">
          <div className="max-w-xl mx-auto rounded-3xl border border-accent/40 bg-accent/5 p-12">
            <CheckCircle size={56} className="text-accent mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-foreground mb-3">Order Placed!</h2>
            <p className="text-muted-foreground font-light mb-8">Thank you! We'll begin translating your documents and deliver within the selected timeframe.</p>
            <Link to="/translations" className="inline-flex items-center gap-3 px-8 py-4 rounded-3xl bg-accent text-accent-foreground font-bold shadow-xl shadow-accent/40 hover:scale-105 transition-all duration-300">
              Back to Translations
            </Link>
          </div>
        </section>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="max-w-6xl mx-auto px-6 md:px-12 py-16 grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Left Column — Main Form */}
            <div className="lg:col-span-2 space-y-10">

              {error && (
                <div className="rounded-2xl bg-destructive/10 border border-destructive/30 px-5 py-4 text-sm text-destructive font-medium">
                  {error}
                </div>
              )}

              {/* Your Information */}
              <div className="rounded-3xl border border-border bg-card shadow-lg p-8 space-y-6">
                <SectionHeading>Your Information</SectionHeading>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldGroup label="Full Name" required>
                    <GlassInput value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full name" required />
                  </FieldGroup>
                  <FieldGroup label="E-mail" required>
                    <GlassInput value={emailVal} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" type="email" required />
                  </FieldGroup>
                </div>
                <FieldGroup label="Phone">
                  <GlassInput value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" type="tel" />
                </FieldGroup>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldGroup label="Translating From" required>
                    <GlassInput value={transFrom} onChange={e => setTransFrom(e.target.value)} placeholder="e.g. Spanish" required />
                  </FieldGroup>
                  <FieldGroup label="Translating Into" required>
                    <GlassInput value={transTo} onChange={e => setTransTo(e.target.value)} placeholder="e.g. English" required />
                  </FieldGroup>
                </div>
                <FieldGroup label="Additional Notes">
                  <textarea
                    value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="Any special instructions or details about your documents..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-2xl text-sm text-foreground placeholder:text-muted-foreground bg-muted/60 border border-border focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-accent transition-all duration-200 resize-none"
                  />
                </FieldGroup>
              </div>

              {/* Upload Documents */}
              <div
                className="rounded-3xl border border-border bg-card shadow-lg p-8 space-y-5"
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <SectionHeading>Upload Your Documents</SectionHeading>
                <p className="text-sm text-muted-foreground font-light">
                  Upload clear, legible images or PDFs. Our AI will automatically count words per page and calculate pricing.
                </p>

                <label className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all duration-200 group ${
                  dragging
                    ? "border-accent bg-accent/10 scale-[1.02]"
                    : "border-border hover:border-accent/50 hover:bg-accent/5"
                }`}>
                  <Upload size={28} className={`transition-colors ${dragging ? "text-accent" : "text-muted-foreground group-hover:text-accent"}`} />
                  <span className={`text-sm font-medium transition-colors ${dragging ? "text-accent" : "text-muted-foreground group-hover:text-accent"}`}>
                    {dragging ? "Drop files here" : "Drag & drop or click to browse files"}
                  </span>
                  <span className="text-xs text-muted-foreground/60">PDF, JPG, PNG supported · PDFs are split into individual pages · Max 4MB per file</span>
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
                                  <span className="text-xs text-muted-foreground">Analyzing document...</span>
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
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium dark:bg-emerald-900/30 dark:text-emerald-400">Formatting Needed</span>
                                    )}
                                    {fa.analysis.isDoublePage && (
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium dark:bg-blue-900/30 dark:text-blue-400">Double page</span>
                                    )}
                                    {fa.analysis.isBirthCertificate && (
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium dark:bg-purple-900/30 dark:text-purple-400">Birth Certificate</span>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {pagePricing[i]?.label} · ${pagePricing[i]?.price.toFixed(2)}
                                    <span className="text-muted-foreground/60"> ({pagePricing[i]?.breakdown})</span>
                                  </p>
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
                  + Add another file
                </button>
              </div>

              {/* Add-Ons */}
              <div className="rounded-3xl border border-border bg-card shadow-lg p-8 space-y-5">
                <SectionHeading>Add-Ons</SectionHeading>

                <label className="flex items-center justify-between p-4 rounded-2xl border border-border hover:border-accent/30 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={addExpedited} onChange={e => setAddExpedited(e.target.checked)} className="w-4 h-4 rounded border-border text-accent focus:ring-accent" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Expedited Turnaround</p>
                      <p className="text-xs text-muted-foreground">1–2 business days delivery (standard is 3–5 days)</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-foreground">$25.00</span>
                </label>


                <label className="flex items-center justify-between p-4 rounded-2xl border border-border hover:border-accent/30 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={addHardCopy} onChange={e => setAddHardCopy(e.target.checked)} className="w-4 h-4 rounded border-border text-accent focus:ring-accent" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Hard Copy</p>
                      <p className="text-xs text-muted-foreground">Printed original shipped via FedEx with tracking</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-foreground">$25.00</span>
                </label>
              </div>

              {/* Payment Details */}
              <div className="rounded-3xl border border-border bg-card shadow-lg p-8 space-y-6">
                <SectionHeading>Payment Details</SectionHeading>
                <FieldGroup label="Name on Card" required>
                  <GlassInput value={cardName} onChange={e => setCardName(e.target.value)} placeholder="Full name on card" required />
                </FieldGroup>
                <FieldGroup label="Card Number" required>
                  <GlassInput value={cardNumber} onChange={e => setCardNumber(e.target.value)} placeholder="1234 5678 9012 3456" required />
                </FieldGroup>
                <div className="grid grid-cols-3 gap-4">
                  <FieldGroup label="Expiry" required>
                    <GlassInput value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} placeholder="MM/YY" required />
                  </FieldGroup>
                  <FieldGroup label="CVC" required>
                    <GlassInput value={cardCvc} onChange={e => setCardCvc(e.target.value)} placeholder="123" required />
                  </FieldGroup>
                  <FieldGroup label="Billing Zip" required>
                    <GlassInput value={cardZip} onChange={e => setCardZip(e.target.value)} placeholder="10001" required />
                  </FieldGroup>
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-center pt-2 pb-6">
                <button
                  type="submit"
                  disabled={isAnalyzing || hasBlurryFiles}
                  className="group inline-flex items-center gap-4 px-12 py-5 rounded-3xl bg-accent text-accent-foreground font-bold text-lg tracking-wide shadow-2xl shadow-accent/40 hover:shadow-accent/60 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
                >
                  <CreditCard size={20} />
                  <span>Place Order — ${total.toFixed(2)}</span>
                </button>
              </div>
            </div>

            {/* Right Column — Order Summary */}
            <div className="space-y-6">

              <div className="rounded-3xl border border-accent/30 bg-card shadow-lg p-8 space-y-5 sticky top-24">
                <SectionHeading>Order Summary</SectionHeading>

                {fileAnalyses.length === 0 ? (
                  <p className="text-sm text-muted-foreground font-light text-center py-4">
                    Upload documents to see pricing
                  </p>
                ) : (
                  <div className="space-y-3">
                    {fileAnalyses.map((fa, i) => {
                      const pp = pagePricing[i];
                      return (
                        <div key={i} className="space-y-1">
                          <p className="text-sm font-medium text-foreground truncate">{fa.file.name}</p>
                          {fa.analyzing && <p className="text-xs text-muted-foreground">Analyzing...</p>}
                          {fa.analysis && pp && (
                            <div className="space-y-0.5 text-xs text-muted-foreground">
                              {pp.baseFee > 0 && (
                                <div className="flex justify-between">
                                  <span>{i === 0 ? "First page flat fee" : pp.label === "Double Page" ? "Double page flat" : "Base"}</span>
                                  <span className="font-medium text-foreground">${pp.baseFee.toFixed(2)}</span>
                                </div>
                              )}
                              {pp.formattingFee > 0 && (
                                <div className="flex justify-between">
                                  <span>Formatting</span>
                                  <span className="font-medium text-foreground">${pp.formattingFee.toFixed(2)}</span>
                                </div>
                              )}
                              {pp.wordCost > 0 && (
                                <div className="flex justify-between">
                                  <span>{fa.analysis.wordCount} words{pp.baseFee > 0 ? " (overage)" : ""} × $0.10</span>
                                  <span className="font-medium text-foreground">${pp.wordCost.toFixed(2)}</span>
                                </div>
                              )}
                              {pp.baseFee === 0 && pp.wordCost === 0 && pp.formattingFee === 0 && (
                                <div className="flex justify-between">
                                  <span>Included (≤300 words)</span>
                                  <span className="font-medium text-foreground">$0.00</span>
                                </div>
                              )}
                              <div className="flex justify-between pt-1 border-t border-border/50">
                                <span className="font-medium">Subtotal</span>
                                <span className="font-medium text-foreground">${pp.price.toFixed(2)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    <div className="border-t border-border pt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Documents subtotal</span>
                        <span className="font-medium text-foreground">${subtotal.toFixed(2)}</span>
                      </div>
                      {addExpedited && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Expedited</span>
                          <span className="font-medium text-foreground">$25.00</span>
                        </div>
                      )}
                      {addHardCopy && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Hard Copy</span>
                          <span className="font-medium text-foreground">$25.00</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-border pt-3">
                      <div className="flex justify-between">
                        <span className="text-base font-bold text-foreground">Estimated Total</span>
                        <span className="text-xl font-bold text-accent">${total.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {totalPages} page{totalPages !== 1 ? "s" : ""} · {addExpedited ? "1–2 business days" : "3–5 business days"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      )}

      <Footer />
    </div>
  );
};

export default TranslationOrder;
