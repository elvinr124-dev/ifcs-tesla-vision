import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToHome from "@/components/BackToHome";
import ViewApplicationDialog from "@/components/ViewApplicationDialog";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Search, Eye, PenTool, Mail, Send, Paperclip, X, Users, Stamp, Sparkles, SpellCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import brooklynBridge from "@/assets/brooklyn-bridge-night.jpg";
import ifcsLogo from "@/assets/ifcs-logo-signature.png";

const STAFF_EMAILS = [
  "docs@ifcsevals.com",
  "intake@ifcsevals.com",
  "apps@ifcsevals.com",
  "status@ifcsevals.com",
  "info@ifcsevals.com",
  "support@ifcsevals.com",
  "translations@ifcsevals.com",
];

// Signature is now image-only, no text appended to email content

interface AppRow {
  id: string;
  application_id: string;
  ifcs_id: string | null;
  first_name: string;
  last_name: string;
  client_email: string;
  application_data: any;
  created_at: string;
}

const StaffCartView = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<AppRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // View Application dialog
  const [viewAppOpen, setViewAppOpen] = useState(false);
  const [viewAppData, setViewAppData] = useState<any>(null);
  const [viewAppId, setViewAppId] = useState("");

  // E-Signature dialog
  const [sigOpen, setSigOpen] = useState(false);
  const [sigData, setSigData] = useState<{ terms: string; privacy: string; name: string; appId: string } | null>(null);

  // Email dialog
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailFrom, setEmailFrom] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [emailAttachments, setEmailAttachments] = useState<File[]>([]);
  const [emailSending, setEmailSending] = useState(false);
  const [signatureAttached, setSignatureAttached] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user || user.role !== "staff") return;
    fetchClients();
  }, [user]);

  const fetchClients = async () => {
    setLoading(true);
    const { data } = await (supabase as any)
      .from("applications")
      .select("id, application_id, ifcs_id, first_name, last_name, client_email, application_data, created_at")
      .order("created_at", { ascending: false })
      .limit(10);
    setClients(data || []);
    setLoading(false);
  };

  const filtered = clients.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.first_name?.toLowerCase().includes(q) ||
      c.last_name?.toLowerCase().includes(q) ||
      c.client_email?.toLowerCase().includes(q) ||
      c.application_id?.toLowerCase().includes(q) ||
      (c.ifcs_id && c.ifcs_id.toLowerCase().includes(q))
    );
  });

  const openViewApp = (row: AppRow) => {
    setViewAppData(row.application_data);
    setViewAppId(row.application_id);
    setViewAppOpen(true);
  };

  const openSignature = (row: AppRow) => {
    const d = row.application_data || {};
    setSigData({
      terms: d.termsSignature || "",
      privacy: d.privacySignature || "",
      name: `${row.first_name} ${row.last_name}`,
      appId: row.application_id,
    });
    setSigOpen(true);
  };

  const openEmail = (row: AppRow) => {
    setEmailTo(row.client_email);
    setEmailFrom("");
    setEmailSubject("");
    setEmailContent("");
    setEmailAttachments([]);
    setSignatureAttached(false);
    setEmailOpen(true);
  };

  const handleAttachSignature = () => {
    setSignatureAttached((prev) => !prev);
  };

  const handleFromChange = (newFrom: string) => {
    setEmailFrom(newFrom);
  };

  const handleSendEmail = async () => {
    if (!emailFrom || !emailSubject.trim() || !emailContent.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setEmailSending(true);
    try {
      await supabase.functions.invoke("send-application-email", {
        body: {
          subject: emailSubject,
          body: emailContent,
          applicantEmail: emailTo,
          recipientEmail: emailFrom,
        },
      });
      toast.success("Email sent successfully.");
      setEmailOpen(false);
    } catch {
      toast.error("Failed to send email.");
    }
    setEmailSending(false);
  };

  const handleAiRewrite = async (mode: "rewrite" | "grammar") => {
    if (!emailContent.trim()) {
      toast.error("Write some content first.");
      return;
    }
    setAiProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("rewrite-email", {
        body: { content: emailContent, mode },
      });
      if (error) throw error;
      if (data?.result) {
        setEmailContent(data.result);
        toast.success(mode === "grammar" ? "Grammar checked!" : "Email rewritten!");
      }
    } catch {
      toast.error("AI processing failed.");
    }
    setAiProcessing(false);
  };

  const addAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setEmailAttachments((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  if (!user || user.role !== "staff") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center">
          <Shield size={28} className="text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Staff Access Required</h2>
        <p className="text-muted-foreground text-sm">You must be logged in as IFCS staff to view this page.</p>
        <Link to="/login/staff" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-accent text-accent-foreground text-sm font-semibold shadow-lg shadow-accent/30 hover:bg-accent/90 transition-all">
          Go to Staff Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[40vh] min-h-[260px] w-full flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${brooklynBridge})` }} />
        <div className="video-overlay" />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold mb-6">
            <Shield size={12} /> Staff Portal
          </div>
          <p className="text-sm font-medium tracking-[0.2em] uppercase mb-3 text-accent">IFCS Internal</p>
          <h1 className="tesla-hero-title text-white">Recent Clients</h1>
          <p className="tesla-hero-subtitle text-white/80 max-w-lg">
            View the 10 most recent client applications.
          </p>
        </div>
      </section>

      <section className="py-16 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">

          {/* Logged in as + Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                <Shield size={18} className="text-accent" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Logged in as</p>
                <p className="text-lg font-bold text-foreground">{user.username}</p>
              </div>
            </div>
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or ID..."
                className="pl-10 rounded-2xl"
              />
            </div>
          </div>

          {/* Client list */}
          {loading ? (
            <div className="text-center py-16 text-muted-foreground">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl border border-border bg-card p-16 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center">
                <Users size={28} className="text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground">No Clients Found</h3>
              <p className="text-muted-foreground text-sm max-w-xs">
                {search ? "No clients match your search." : "No recent applications yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((row) => (
                <div key={row.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Client info */}
                    <div className="space-y-1 flex-1 min-w-0">
                      <p className="text-lg font-bold text-foreground truncate">
                        {row.first_name} {row.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">{row.client_email}</p>
                      <div className="flex items-center gap-3 flex-wrap mt-1">
                        <span className="text-xs font-semibold bg-accent/10 border border-accent/20 text-accent rounded-lg px-2.5 py-1">
                          App ID: {row.application_id}
                        </span>
                        {row.ifcs_id && (
                          <span className="text-xs font-semibold bg-muted border border-border text-muted-foreground rounded-lg px-2.5 py-1">
                            IFCS ID: {row.ifcs_id}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                      <button
                        onClick={() => openViewApp(row)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent/90 transition-all"
                      >
                        <Eye size={14} /> View Application
                      </button>
                      <button
                        onClick={() => openSignature(row)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-border bg-muted/50 text-foreground text-xs font-semibold hover:bg-muted transition-all"
                      >
                        <PenTool size={14} /> View E-Signature
                      </button>
                      <button
                        onClick={() => openEmail(row)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-accent/30 bg-accent/5 text-accent text-xs font-semibold hover:bg-accent/10 transition-all"
                      >
                        <Mail size={14} /> Email
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <BackToHome />
        </div>
      </section>

      {/* View Application Dialog */}
      <ViewApplicationDialog
        open={viewAppOpen}
        onOpenChange={setViewAppOpen}
        data={viewAppData}
        applicationId={viewAppId}
      />

      {/* E-Signature Dialog */}
      <Dialog open={sigOpen} onOpenChange={setSigOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>E-Signature & Agreements — {sigData?.appId}</DialogTitle>
          </DialogHeader>
          {sigData && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Client</p>
                <p className="text-lg font-bold text-foreground">{sigData.name}</p>
              </div>

              {/* Terms & Conditions agreed to */}
              <div className="rounded-2xl border border-border bg-muted/30 p-5 space-y-3">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Terms & Conditions — Agreed</p>
                <div className="text-xs text-muted-foreground leading-relaxed max-h-40 overflow-y-auto pr-2">
                  <p>By submitting this application, the applicant agrees to be bound by the Terms of Service of the Institute of Foreign Credential Services (IFCS). The applicant acknowledges that IFCS evaluations are advisory in nature, that processing times are estimates, and that all fees are non-refundable once evaluation has begun. IFCS is not responsible for delays caused by incomplete or inaccurate documentation provided by the applicant. The applicant grants IFCS permission to contact issuing institutions for document verification purposes.</p>
                </div>
                <div className="border-t border-border pt-3">
                  <p className="text-xs text-muted-foreground font-semibold mb-1">Digital Signature</p>
                  {sigData.terms ? (
                    <p className="text-xl font-serif italic text-foreground">{sigData.terms}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No signature on file</p>
                  )}
                </div>
              </div>

              {/* Privacy Policy agreed to */}
              <div className="rounded-2xl border border-border bg-muted/30 p-5 space-y-3">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Privacy Policy — Agreed</p>
                <div className="text-xs text-muted-foreground leading-relaxed max-h-40 overflow-y-auto pr-2">
                  <p>The applicant acknowledges and consents to the Privacy Policy of IFCS. Personal information collected — including name, date of birth, contact details, and academic records — is used solely for credential evaluation purposes. IFCS may share applicant information with designated institutions and employers as requested. Data is securely stored and will not be sold or distributed to third parties beyond the scope of the evaluation. The applicant has the right to request access to, correction of, or deletion of their personal data at any time by contacting IFCS.</p>
                </div>
                <div className="border-t border-border pt-3">
                  <p className="text-xs text-muted-foreground font-semibold mb-1">Digital Signature</p>
                  {sigData.privacy ? (
                    <p className="text-xl font-serif italic text-foreground">{sigData.privacy}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No signature on file</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Email Dialog — near full screen */}
      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="max-w-[92vw] w-[92vw] max-h-[92vh] h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Send Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 flex-1">
            {/* From & To row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">From</label>
                <Select value={emailFrom} onValueChange={handleFromChange}>
                  <SelectTrigger className="rounded-2xl h-14 text-base">
                    <SelectValue placeholder="Select sender..." />
                  </SelectTrigger>
                  <SelectContent>
                    {STAFF_EMAILS.map((e) => (
                      <SelectItem key={e} value={e}>{e}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">To</label>
                <Input value={emailTo} readOnly className="rounded-2xl bg-muted/50 h-14 text-base" />
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Subject</label>
              <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="Email subject..." className="rounded-2xl h-14 text-base" />
            </div>

            {/* Content */}
            <div className="space-y-1.5 flex-1">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Content</label>
              <textarea
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                placeholder="Write your message..."
                rows={16}
                className="w-full px-5 py-4 rounded-2xl text-base text-foreground placeholder:text-muted-foreground bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring resize-y min-h-[320px]"
              />
            </div>

            {/* Signature preview when attached */}
            {signatureAttached && (
              <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4">
                <img src={ifcsEmailSig} alt="IFCS Email Signature" className="max-w-md h-auto object-contain" />
              </div>
            )}

            {/* Toolbar row: Attach, Signature, Smart Rewrite, Grammar Check */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-border bg-muted/50 text-sm font-semibold text-foreground hover:bg-muted transition-all"
                >
                  <Paperclip size={16} /> Attach File
                </button>
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={addAttachment} />
                <button
                  type="button"
                  onClick={handleAttachSignature}
                  className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl border text-sm font-semibold transition-all ${
                    signatureAttached
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border bg-muted/50 text-foreground hover:bg-muted"
                  }`}
                >
                  <Stamp size={16} /> {signatureAttached ? "Signature Attached ✓" : "Attach Signature"}
                </button>
                <button
                  type="button"
                  onClick={() => handleAiRewrite("rewrite")}
                  disabled={aiProcessing}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-purple-300 bg-purple-50 text-sm font-semibold text-purple-700 hover:bg-purple-100 transition-all disabled:opacity-50"
                >
                  <Sparkles size={16} /> {aiProcessing ? "Processing..." : "Smart Rewrite"}
                </button>
                <button
                  type="button"
                  onClick={() => handleAiRewrite("grammar")}
                  disabled={aiProcessing}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-green-300 bg-green-50 text-sm font-semibold text-green-700 hover:bg-green-100 transition-all disabled:opacity-50"
                >
                  <SpellCheck size={16} /> Grammar Check
                </button>
              </div>

              {/* Send button - bottom right bubble */}
              <button
                onClick={handleSendEmail}
                disabled={emailSending || !emailFrom || !emailSubject.trim() || !emailContent.trim()}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-accent text-accent-foreground text-sm font-semibold shadow-lg hover:bg-accent/90 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} /> {emailSending ? "Sending..." : "Send"}
              </button>
            </div>

            {emailAttachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {emailAttachments.map((f, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent/10 border border-accent/20 text-xs text-accent font-medium">
                    {f.name}
                    <button onClick={() => setEmailAttachments((p) => p.filter((_, idx) => idx !== i))}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default StaffCartView;
