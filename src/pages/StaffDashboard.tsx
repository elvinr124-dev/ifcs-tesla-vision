import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Upload, Send, Users, Clock, AlertCircle, CheckCircle2, Package, FileText, Star,
  Plus, X, Languages, FileUp, Info, Search, MessageCircle, Headphones,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import LiveChatWidget from "@/components/LiveChatWidget";

/* ---------- types ---------- */
interface Requirement {
  id: string;
  label: string;
  description: string;
  type: "document" | "translation" | "info";
}

interface QueueOrder {
  id: string;
  applicant: string;
  email: string;
  service: string;
  status: string;
  submitted: string;
  requirements: Requirement[];
}

interface PendingChat {
  id: string;
  client_display_name: string;
  client_identifier: string;
  created_at: string;
}

/* ---------- mock queue ---------- */
const initialQueue: QueueOrder[] = [
  { id: "44507", applicant: "John Doe", email: "john@example.com", service: "Course-by-Course — Rush 3-Day", status: "in_review", submitted: "02/28/2026", requirements: [] },
  {
    id: "44512", applicant: "Maria Garcia", email: "maria@example.com", service: "General Evaluation — 10 Business Days", status: "on_hold", submitted: "03/01/2026",
    requirements: [
      { id: "r1", label: "Official Transcripts", description: "Upload certified copies of university transcripts.", type: "document" },
      { id: "r2", label: "Document Translation", description: "Diploma must be translated into English.", type: "translation" },
    ],
  },
  { id: "44518", applicant: "Ahmed Ali", email: "ahmed@example.com", service: "Document Translation", status: "requested", submitted: "02/25/2026", requirements: [] },
  { id: "44523", applicant: "Li Wei", email: "li@example.com", service: "Comprehensive Course-by-Course", status: "delivered", submitted: "02/20/2026", requirements: [] },
];

const statusMeta: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  requested:  { label: "Requested",  color: "bg-muted text-muted-foreground",    icon: <Clock size={14} /> },
  in_review:  { label: "In Review",  color: "bg-accent/20 text-accent",          icon: <Package size={14} /> },
  on_hold:    { label: "On Hold",    color: "bg-destructive/20 text-destructive", icon: <AlertCircle size={14} /> },
  delivered:  { label: "Delivered",  color: "bg-emerald-500/20 text-emerald-600", icon: <CheckCircle2 size={14} /> },
};

const requirementTemplates = [
  { label: "Official Transcripts", type: "document" as const },
  { label: "Certified Diploma Copy", type: "document" as const },
  { label: "Passport Copy", type: "document" as const },
  { label: "Document Translation", type: "translation" as const },
  { label: "Proof of Payment", type: "document" as const },
  { label: "Additional Information", type: "info" as const },
];

const StaffDashboard = () => {
  const { toast } = useToast();
  const [filter, setFilter] = useState("all");
  const [queue, setQueue] = useState(initialQueue);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Share form
  const [shareEmail, setShareEmail] = useState("");
  const [shareRef, setShareRef] = useState("");
  const [shareType, setShareType] = useState("");
  const [shareExpiry, setShareExpiry] = useState("");

  // Requirement form
  const [newReqLabel, setNewReqLabel] = useState("");
  const [newReqDesc, setNewReqDesc] = useState("");
  const [newReqType, setNewReqType] = useState<"document" | "translation" | "info">("document");

  // Live chat
  const [pendingChats, setPendingChats] = useState<PendingChat[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);

  // Load pending chats
  useEffect(() => {
    const loadPending = async () => {
      const { data } = await supabase
        .from("chat_conversations")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (data) setPendingChats(data as PendingChat[]);
    };
    loadPending();

    // Realtime for new chat requests
    const channel = supabase
      .channel("staff-chat-requests")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_conversations" },
        () => { loadPending(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleConnectChat = async (chatId: string) => {
    await supabase
      .from("chat_conversations")
      .update({ status: "active", staff_identifier: "IFCSstaff" })
      .eq("id", chatId);
    setActiveConvId(chatId);
    toast({ title: "Connected", description: "You are now chatting with the client." });
  };

  const handleStartChatWithApplicant = async (applicant: string, email: string) => {
    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({
        client_identifier: email,
        client_display_name: applicant,
        staff_identifier: "IFCSstaff",
        status: "active",
      })
      .select()
      .single();

    if (error || !data) {
      toast({ title: "Error", description: "Could not start chat.", variant: "destructive" });
      return;
    }
    setActiveConvId(data.id);
    toast({ title: "Chat Started", description: `Live chat opened with ${applicant}.` });
  };

  // Search & filter logic
  const filtered = queue.filter((o) => {
    const matchesFilter = filter === "all" || o.status === filter;
    if (!searchQuery.trim()) return matchesFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = o.id.toLowerCase().includes(q) || o.email.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The filtering is already reactive via the `filtered` variable
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setQueue((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
    toast({ title: "Status Updated", description: `${orderId} → ${statusMeta[newStatus]?.label}` });
  };

  const handleAddRequirement = (orderId: string) => {
    if (!newReqLabel.trim()) return;
    const req: Requirement = {
      id: `req-${Date.now()}`,
      label: newReqLabel,
      description: newReqDesc || `Please provide: ${newReqLabel}`,
      type: newReqType,
    };
    setQueue((prev) => prev.map((o) => o.id === orderId ? { ...o, requirements: [...o.requirements, req] } : o));
    setNewReqLabel(""); setNewReqDesc("");
    toast({ title: "Requirement Added", description: `"${req.label}" sent to applicant.` });
  };

  const handleRemoveRequirement = (orderId: string, reqId: string) => {
    setQueue((prev) => prev.map((o) => o.id === orderId ? { ...o, requirements: o.requirements.filter((r) => r.id !== reqId) } : o));
  };

  const handleQuickReq = (orderId: string, tpl: typeof requirementTemplates[0]) => {
    const req: Requirement = {
      id: `req-${Date.now()}`,
      label: tpl.label,
      description: `Please provide: ${tpl.label}`,
      type: tpl.type,
    };
    setQueue((prev) => prev.map((o) => o.id === orderId ? { ...o, requirements: [...o.requirements, req] } : o));
    toast({ title: "Requirement Added", description: `"${tpl.label}" sent to applicant.` });
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareEmail || !shareRef || !shareType || !shareExpiry) {
      toast({ title: "Missing Fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    const isEdu = shareEmail.trim().toLowerCase().endsWith(".edu");
    const applicant = queue.find(o => o.id === shareRef);
    const applicantName = applicant?.applicant || "Applicant";
    const applicantEmail = applicant?.email || shareEmail;

    // Map shareType to label
    const typeLabels: Record<string, string> = {
      general: "General Analysis", general_gpa: "General Analysis + GPA",
      course: "Course-by-Course", comprehensive: "Comprehensive Course-by-Course",
      health: "Health Professions Course-by-Course",
    };

    // Insert report record
    const { data: report, error: insertErr } = await supabase
      .from("evaluation_reports")
      .insert({
        reference_id: shareRef,
        applicant_name: applicantName,
        applicant_email: applicantEmail,
        evaluation_type: typeLabels[shareType] || shareType,
        shared_to_email: shareEmail,
        shared_to_edu: isEdu,
        expiry_date: new Date(shareExpiry).toISOString(),
        status: "active",
      })
      .select()
      .single();

    if (insertErr || !report) {
      toast({ title: "Error", description: "Failed to create report record.", variant: "destructive" });
      return;
    }

    // Send email via edge function
    try {
      await supabase.functions.invoke("send-transcript-email", {
        body: {
          recipientEmail: shareEmail,
          applicantName,
          referenceId: shareRef,
          evaluationType: typeLabels[shareType] || shareType,
          accessToken: (report as any).access_token,
          isEdu,
        },
      });
    } catch {}

    if (isEdu) {
      toast({
        title: "Report Sent to Institution",
        description: `Parchment-style email sent to ${shareEmail} with transcript access link.`,
      });
    } else {
      toast({
        title: "Report Delivered",
        description: `Report added to client dashboard. Notification email sent to ${shareEmail}.`,
      });
    }

    setShareEmail(""); setShareRef(""); setShareType(""); setShareExpiry("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-28 pb-12 px-6 md:px-12 max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">Staff Dashboard</h1>
        <p className="text-muted-foreground mt-2 text-lg">Manage applications, share reports & communicate with applicants</p>
      </section>

      <div className="content-bg">
        <div className="max-w-7xl mx-auto px-6 md:px-12 pb-24 space-y-10">

          {/* ── Incoming Chat Requests ── */}
          {pendingChats.length > 0 && (
            <Card className="border-border bg-card border-emerald-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Headphones size={22} className="text-emerald-500" />
                  Incoming Chat Requests
                  <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-600 ml-2">
                    {pendingChats.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingChats.map((chat) => (
                  <div key={chat.id} className="flex items-center justify-between rounded-xl border border-border p-4">
                    <div>
                      <p className="font-medium text-foreground">{chat.client_display_name}</p>
                      <p className="text-xs text-muted-foreground">{chat.client_identifier} · {new Date(chat.created_at).toLocaleString()}</p>
                    </div>
                    <Button size="sm" onClick={() => handleConnectChat(chat.id)} className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                      <MessageCircle size={14} /> Connect
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* ── Active Chat Window ── */}
          {activeConvId && (
            <Card className="border-border bg-card border-emerald-500/30">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <MessageCircle size={22} className="text-emerald-500" /> Live Chat
                </CardTitle>
                <Button size="sm" variant="ghost" onClick={() => setActiveConvId(null)}>
                  <X size={16} /> Close
                </Button>
              </CardHeader>
              <CardContent className="h-[400px]">
                <LiveChatWidget conversationId={activeConvId} isStaff onClose={() => setActiveConvId(null)} />
              </CardContent>
            </Card>
          )}

          {/* ── Queue Management ── */}
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Users size={22} className="text-accent" /> Application Queue
                </CardTitle>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="requested">Requested</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search bar */}
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by IFCS reference # or email..."
                    className="pl-9"
                  />
                </div>
                <Button type="submit" variant="outline" className="gap-1">
                  <Search size={14} /> Search
                </Button>
              </form>
            </CardHeader>
            <CardContent className="space-y-4">
              {filtered.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No applications found for "{searchQuery}"</p>
                </div>
              )}
              {filtered.map((o) => {
                const meta = statusMeta[o.status] ?? statusMeta.requested;
                const isSelected = selectedOrder === o.id;

                return (
                  <div key={o.id} className="rounded-xl border border-border overflow-hidden">
                    <button
                      onClick={() => setSelectedOrder(isSelected ? null : o.id)}
                      className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors text-left"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <p className="font-semibold text-foreground">#{o.id}</p>
                          <Badge variant="secondary" className={`${meta.color} gap-1`}>{meta.icon} {meta.label}</Badge>
                        </div>
                        <p className="text-sm text-foreground mt-1">{o.applicant} <span className="text-muted-foreground">— {o.email}</span></p>
                        <p className="text-xs text-muted-foreground">{o.service} · Submitted {o.submitted}</p>
                      </div>
                    </button>

                    {isSelected && (
                      <div className="border-t border-border p-5 space-y-6">
                        {/* Status changer */}
                        <div>
                          <p className="text-sm font-medium text-foreground mb-2">Update Status</p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(statusMeta).map(([key, val]) => (
                              <Button key={key} size="sm"
                                variant={o.status === key ? "default" : "outline"}
                                className="gap-1"
                                onClick={() => handleStatusChange(o.id, key)}
                              >
                                {val.icon} {val.label}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Current requirements */}
                        <div>
                          <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                            <AlertCircle size={16} className="text-accent" /> Requirements Sent to Applicant
                          </p>
                          {o.requirements.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No requirements sent yet.</p>
                          ) : (
                            <div className="space-y-2">
                              {o.requirements.map((req) => (
                                <div key={req.id} className="rounded-lg border border-border p-3 flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {req.type === "translation" ? <Languages size={16} className="text-accent" /> :
                                     req.type === "document" ? <FileUp size={16} className="text-accent" /> :
                                     <Info size={16} className="text-accent" />}
                                    <div>
                                      <p className="text-sm font-medium text-foreground">{req.label}</p>
                                      <p className="text-xs text-muted-foreground">{req.description}</p>
                                    </div>
                                  </div>
                                  <Button size="sm" variant="ghost" onClick={() => handleRemoveRequirement(o.id, req.id)}>
                                    <X size={14} />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Quick-add requirements */}
                        <div>
                          <p className="text-sm font-medium text-foreground mb-2">Quick Add Requirement</p>
                          <div className="flex flex-wrap gap-2">
                            {requirementTemplates.map((tpl) => (
                              <Button key={tpl.label} size="sm" variant="outline" className="gap-1 text-xs"
                                onClick={() => handleQuickReq(o.id, tpl)}>
                                <Plus size={12} /> {tpl.label}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Custom requirement */}
                        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                          <p className="text-sm font-medium text-foreground">Custom Requirement</p>
                          <div className="grid sm:grid-cols-3 gap-3">
                            <Input placeholder="Requirement label" value={newReqLabel} onChange={(e) => setNewReqLabel(e.target.value)} />
                            <Input placeholder="Description (optional)" value={newReqDesc} onChange={(e) => setNewReqDesc(e.target.value)} />
                            <Select value={newReqType} onValueChange={(v: "document" | "translation" | "info") => setNewReqType(v)}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="document">Document Upload</SelectItem>
                                <SelectItem value="translation">Translation Needed</SelectItem>
                                <SelectItem value="info">Information Needed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button size="sm" onClick={() => handleAddRequirement(o.id)} className="gap-1">
                            <Send size={14} /> Send Requirement
                          </Button>
                        </div>

                        {/* Start live chat with applicant */}
                        <div>
                          <p className="text-sm font-medium text-foreground mb-2">Live Chat</p>
                          <Button size="sm" variant="outline" className="gap-1" onClick={() => handleStartChatWithApplicant(o.applicant, o.email)}>
                            <MessageCircle size={14} /> Start Chat with {o.applicant}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* ── Share Evaluation Report ── */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText size={22} className="text-accent" /> Share Evaluation Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleShare} className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Applicant Email *</label>
                  <Input type="email" placeholder="applicant@email.com" value={shareEmail} onChange={(e) => setShareEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">IFCS Reference # *</label>
                  <Input placeholder="44507" value={shareRef} onChange={(e) => setShareRef(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Evaluation Type *</label>
                  <Select value={shareType} onValueChange={setShareType}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Analysis</SelectItem>
                      <SelectItem value="general_gpa">General Analysis + GPA</SelectItem>
                      <SelectItem value="course">Course-by-Course</SelectItem>
                      <SelectItem value="comprehensive">Comprehensive Course-by-Course</SelectItem>
                      <SelectItem value="health">Health Professions Course-by-Course</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Expiration Date *</label>
                  <Input type="date" value={shareExpiry} onChange={(e) => setShareExpiry(e.target.value)} required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Upload Evaluation (PDF Only)</label>
                  <Input type="file" accept=".pdf" />
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" className="gap-2 px-8"><Upload size={16} /> Upload & Share Report</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* ── Feedback ── */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Star size={22} className="text-accent" /> Recent Feedback
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { from: "John Doe", rating: 5, text: "Excellent evaluation, very thorough!" },
                { from: "Maria Garcia", rating: 4, text: "Fast service. Would have liked more detail on GPA conversion." },
              ].map((f, i) => (
                <div key={i} className="border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">{f.from}</p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} size={14} className={s < f.rating ? "text-amber-400 fill-amber-400" : "text-muted"} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{f.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default StaffDashboard;
