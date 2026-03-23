import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToHome from "@/components/BackToHome";
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
  Plus, X, Languages, FileUp, Info, Search, MessageCircle, Headphones, Trash2, UserX,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import LiveChatWidget from "@/components/LiveChatWidget";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

/* ---------- types ---------- */
interface Requirement {
  id: string;
  label: string;
  description: string;
  type: "document" | "translation" | "info";
}

interface DBOrder {
  id: string;
  reference_id: string;
  client_email: string;
  service: string;
  status: string;
  staff_note: string;
  requirements: any[];
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

interface ClientAccount {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
  app_code: string | null;
  created_at: string;
}

interface PendingChat {
  id: string;
  client_display_name: string;
  client_identifier: string;
  created_at: string;
}

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
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // DB data
  const [orders, setOrders] = useState<DBOrder[]>([]);
  const [clients, setClients] = useState<ClientAccount[]>([]);

  // Share form
  const [shareEmail, setShareEmail] = useState("");
  const [shareRef, setShareRef] = useState("");
  const [shareType, setShareType] = useState("");
  const [shareExpiry, setShareExpiry] = useState("");
  const [shareFile, setShareFile] = useState<File | null>(null);

  // Requirement form
  const [newReqLabel, setNewReqLabel] = useState("");
  const [newReqDesc, setNewReqDesc] = useState("");
  const [newReqType, setNewReqType] = useState<"document" | "translation" | "info">("document");

  // Live chat
  const [pendingChats, setPendingChats] = useState<PendingChat[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);

  // Delete confirmation
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: "client" | "order"; id: string; label: string }>({ open: false, type: "client", id: "", label: "" });

  // Load all data
  useEffect(() => {
    const loadAll = async () => {
      const [ordersRes, clientsRes, chatsRes] = await Promise.all([
        (supabase as any).from("client_orders").select("*").order("created_at", { ascending: false }),
        (supabase as any).from("client_accounts").select("*").order("created_at", { ascending: false }),
        supabase.from("chat_conversations").select("*").eq("status", "pending").order("created_at", { ascending: false }),
      ]);
      if (ordersRes.data) setOrders(ordersRes.data);
      if (clientsRes.data) setClients(clientsRes.data);
      if (chatsRes.data) setPendingChats(chatsRes.data as PendingChat[]);
    };
    loadAll();

    // Realtime for orders, clients, and chats
    const channel = supabase
      .channel("staff-all-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "client_orders" }, () => {
        (supabase as any).from("client_orders").select("*").order("created_at", { ascending: false }).then((r: any) => { if (r.data) setOrders(r.data); });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "client_accounts" }, () => {
        (supabase as any).from("client_accounts").select("*").order("created_at", { ascending: false }).then((r: any) => { if (r.data) setClients(r.data); });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_conversations" }, () => {
        supabase.from("chat_conversations").select("*").eq("status", "pending").order("created_at", { ascending: false }).then((r) => { if (r.data) setPendingChats(r.data as PendingChat[]); });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleConnectChat = async (chatId: string) => {
    await supabase.from("chat_conversations").update({ status: "active", staff_identifier: "IFCSstaff" }).eq("id", chatId);
    setActiveConvId(chatId);
    toast({ title: "Connected", description: "You are now chatting with the client." });
  };

  const handleStartChatWithApplicant = async (name: string, email: string) => {
    const { data, error } = await supabase.from("chat_conversations").insert({
      client_identifier: email, client_display_name: name, staff_identifier: "IFCSstaff", status: "active",
    }).select().single();
    if (error || !data) { toast({ title: "Error", description: "Could not start chat.", variant: "destructive" }); return; }
    setActiveConvId(data.id);
    toast({ title: "Chat Started", description: `Live chat opened with ${name}.` });
  };

  // Search & filter
  const filtered = orders.filter((o) => {
    const matchesFilter = filter === "all" || o.status === filter;
    if (!searchQuery.trim()) return matchesFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = o.reference_id.toLowerCase().includes(q) || o.client_email.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  // Status change
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    await (supabase as any).from("client_orders").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    toast({ title: "Status Updated", description: `Order → ${statusMeta[newStatus]?.label}` });
  };

  // Add requirement
  const handleAddRequirement = async (orderId: string) => {
    if (!newReqLabel.trim()) return;
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const req = { id: `req-${Date.now()}`, label: newReqLabel, description: newReqDesc || `Please provide: ${newReqLabel}`, type: newReqType };
    const updatedReqs = [...(Array.isArray(order.requirements) ? order.requirements : []), req];
    await (supabase as any).from("client_orders").update({ requirements: updatedReqs, updated_at: new Date().toISOString() }).eq("id", orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, requirements: updatedReqs } : o));
    setNewReqLabel(""); setNewReqDesc("");
    toast({ title: "Requirement Added", description: `"${req.label}" sent to applicant.` });
  };

  const handleQuickReq = async (orderId: string, tpl: typeof requirementTemplates[0]) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const req = { id: `req-${Date.now()}`, label: tpl.label, description: `Please provide: ${tpl.label}`, type: tpl.type };
    const updatedReqs = [...(Array.isArray(order.requirements) ? order.requirements : []), req];
    await (supabase as any).from("client_orders").update({ requirements: updatedReqs, updated_at: new Date().toISOString() }).eq("id", orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, requirements: updatedReqs } : o));
    toast({ title: "Requirement Added", description: `"${tpl.label}" sent to applicant.` });
  };

  const handleRemoveRequirement = async (orderId: string, reqId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const updatedReqs = (Array.isArray(order.requirements) ? order.requirements : []).filter((r: any) => r.id !== reqId);
    await (supabase as any).from("client_orders").update({ requirements: updatedReqs, updated_at: new Date().toISOString() }).eq("id", orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, requirements: updatedReqs } : o));
  };

  // Staff note
  const handleUpdateNote = async (orderId: string, note: string) => {
    await (supabase as any).from("client_orders").update({ staff_note: note, updated_at: new Date().toISOString() }).eq("id", orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, staff_note: note } : o));
    toast({ title: "Note Updated" });
  };

  // Delete client or order
  const handleDelete = async () => {
    if (deleteDialog.type === "client") {
      await (supabase as any).from("client_accounts").delete().eq("id", deleteDialog.id);
      setClients(prev => prev.filter(c => c.id !== deleteDialog.id));
      toast({ title: "Client Deleted", description: `Account removed.` });
    } else {
      await (supabase as any).from("client_orders").delete().eq("id", deleteDialog.id);
      setOrders(prev => prev.filter(o => o.id !== deleteDialog.id));
      toast({ title: "Order Deleted" });
    }
    setDeleteDialog({ open: false, type: "client", id: "", label: "" });
  };

  // Share report
  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareEmail || !shareRef || !shareType || !shareExpiry) {
      toast({ title: "Missing Fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    const isEdu = shareEmail.trim().toLowerCase().endsWith(".edu");
    const order = orders.find(o => o.reference_id === shareRef);
    const applicantEmail = order?.client_email || shareEmail;
    const client = clients.find(c => c.email === applicantEmail);
    const applicantName = client ? `${client.first_name} ${client.last_name}` : "Applicant";

    const typeLabels: Record<string, string> = {
      general: "General Analysis", general_gpa: "General Analysis + GPA",
      course: "Course-by-Course", comprehensive: "Comprehensive Course-by-Course",
      health: "Health Professions Course-by-Course",
    };

    // Upload PDF to storage if provided
    let reportFileUrl: string | null = null;
    if (shareFile) {
      const filePath = `reports/${shareRef}-${Date.now()}.pdf`;
      const { error: uploadErr } = await supabase.storage.from("evaluation-reports").upload(filePath, shareFile, { contentType: "application/pdf" });
      if (uploadErr) {
        toast({ title: "Upload Failed", description: "Could not upload the PDF file.", variant: "destructive" });
        return;
      }
      const { data: urlData } = supabase.storage.from("evaluation-reports").getPublicUrl(filePath);
      reportFileUrl = urlData.publicUrl;
    }

    const { data: report, error: insertErr } = await (supabase as any)
      .from("evaluation_reports")
      .insert({
        reference_id: shareRef, applicant_name: applicantName, applicant_email: applicantEmail,
        evaluation_type: typeLabels[shareType] || shareType, shared_to_email: shareEmail,
        shared_to_edu: isEdu, expiry_date: new Date(shareExpiry).toISOString(), status: "active",
        report_file_url: reportFileUrl,
      })
      .select().single();

    if (insertErr || !report) {
      toast({ title: "Error", description: "Failed to create report record.", variant: "destructive" });
      return;
    }

    try {
      await supabase.functions.invoke("send-transcript-email", {
        body: { recipientEmail: shareEmail, applicantName, referenceId: shareRef, evaluationType: typeLabels[shareType] || shareType, accessToken: (report as any).access_token, isEdu },
      });
    } catch {}

    toast({
      title: isEdu ? "Report Sent to Institution" : "Report Delivered",
      description: isEdu ? `Parchment-style email sent to ${shareEmail}.` : `Report added to client dashboard. Notification email sent to ${shareEmail}.`,
    });
    setShareEmail(""); setShareRef(""); setShareType(""); setShareExpiry(""); setShareFile(null);
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
                  <Headphones size={22} className="text-emerald-500" /> Incoming Chat Requests
                  <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-600 ml-2">{pendingChats.length}</Badge>
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

          {/* ── Active Chat ── */}
          {activeConvId && (
            <Card className="border-border bg-card border-emerald-500/30">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl"><MessageCircle size={22} className="text-emerald-500" /> Live Chat</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => setActiveConvId(null)}><X size={16} /> Close</Button>
              </CardHeader>
              <CardContent className="h-[400px]">
                <LiveChatWidget conversationId={activeConvId} isStaff onClose={() => setActiveConvId(null)} />
              </CardContent>
            </Card>
          )}

          {/* ── Registered Clients ── */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users size={22} className="text-accent" /> Registered Clients
                <Badge variant="secondary" className="ml-2">{clients.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {clients.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No registered clients yet.</p>
              ) : (
                <div className="space-y-3">
                  {clients.map((c) => (
                    <div key={c.id} className="flex items-center justify-between rounded-xl border border-border p-4">
                      <div>
                        <p className="font-medium text-foreground">{c.first_name} {c.last_name}</p>
                        <p className="text-xs text-muted-foreground">{c.email} · Joined {new Date(c.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => handleStartChatWithApplicant(`${c.first_name} ${c.last_name}`, c.email)}>
                          <MessageCircle size={14} /> Chat
                        </Button>
                        <Button size="sm" variant="destructive" className="gap-1" onClick={() => setDeleteDialog({ open: true, type: "client", id: c.id, label: `${c.first_name} ${c.last_name}` })}>
                          <UserX size={14} /> Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Order Queue ── */}
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Package size={22} className="text-accent" /> Application Queue
                  <Badge variant="secondary" className="ml-2">{orders.length}</Badge>
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
              <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by IFCS reference # or email..." className="pl-9" />
                </div>
              </form>
            </CardHeader>
            <CardContent className="space-y-4">
              {filtered.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">{searchQuery ? `No applications found for "${searchQuery}"` : "No orders in the queue yet."}</p>
                </div>
              )}
              {filtered.map((o) => {
                const meta = statusMeta[o.status] ?? statusMeta.requested;
                const isSelected = selectedOrder === o.id;
                const client = clients.find(c => c.email === o.client_email);
                const applicantName = client ? `${client.first_name} ${client.last_name}` : o.client_email;
                const requirements = Array.isArray(o.requirements) ? o.requirements : [];

                return (
                  <div key={o.id} className="rounded-xl border border-border overflow-hidden">
                    <button onClick={() => setSelectedOrder(isSelected ? null : o.id)}
                      className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors text-left">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <p className="font-semibold text-foreground">#{o.reference_id}</p>
                          <Badge variant="secondary" className={`${meta.color} gap-1`}>{meta.icon} {meta.label}</Badge>
                        </div>
                        <p className="text-sm text-foreground mt-1">{applicantName} <span className="text-muted-foreground">— {o.client_email}</span></p>
                        <p className="text-xs text-muted-foreground">{o.service || "No service specified"} · Added {new Date(o.submitted_at).toLocaleDateString()}</p>
                      </div>
                    </button>

                    {isSelected && (
                      <div className="border-t border-border p-5 space-y-6">
                        {/* Status changer */}
                        <div>
                          <p className="text-sm font-medium text-foreground mb-2">Update Status</p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(statusMeta).map(([key, val]) => (
                              <Button key={key} size="sm" variant={o.status === key ? "default" : "outline"} className="gap-1"
                                onClick={() => handleStatusChange(o.id, key)}>
                                {val.icon} {val.label}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Service update */}
                        <div>
                          <p className="text-sm font-medium text-foreground mb-2">Service</p>
                          <div className="flex gap-2">
                            <Input defaultValue={o.service} placeholder="e.g. Course-by-Course — Rush 3-Day"
                              onBlur={async (e) => {
                                if (e.target.value !== o.service) {
                                  await (supabase as any).from("client_orders").update({ service: e.target.value, updated_at: new Date().toISOString() }).eq("id", o.id);
                                  setOrders(prev => prev.map(x => x.id === o.id ? { ...x, service: e.target.value } : x));
                                  toast({ title: "Service Updated" });
                                }
                              }}
                            />
                          </div>
                        </div>

                        {/* Staff note */}
                        <div>
                          <p className="text-sm font-medium text-foreground mb-2">Staff Note (visible to client)</p>
                          <Textarea defaultValue={o.staff_note} placeholder="Add a note for the client..."
                            onBlur={(e) => { if (e.target.value !== o.staff_note) handleUpdateNote(o.id, e.target.value); }}
                          />
                        </div>

                        {/* Requirements */}
                        <div>
                          <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                            <AlertCircle size={16} className="text-accent" /> Requirements Sent to Applicant
                          </p>
                          {requirements.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No requirements sent yet.</p>
                          ) : (
                            <div className="space-y-2">
                              {requirements.map((req: any) => (
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
                                  <Button size="sm" variant="ghost" onClick={() => handleRemoveRequirement(o.id, req.id)}><X size={14} /></Button>
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
                          <Button size="sm" onClick={() => handleAddRequirement(o.id)} className="gap-1"><Send size={14} /> Send Requirement</Button>
                        </div>

                        {/* Chat & Delete */}
                        <div className="flex gap-3 flex-wrap">
                          <Button size="sm" variant="outline" className="gap-1" onClick={() => handleStartChatWithApplicant(applicantName, o.client_email)}>
                            <MessageCircle size={14} /> Chat with {applicantName}
                          </Button>
                          <Button size="sm" variant="destructive" className="gap-1"
                            onClick={() => setDeleteDialog({ open: true, type: "order", id: o.id, label: `#${o.reference_id}` })}>
                            <Trash2 size={14} /> Delete Order
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
              <CardTitle className="flex items-center gap-2 text-xl"><FileText size={22} className="text-accent" /> Share Evaluation Report</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleShare} className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Recipient Email *</label>
                  <Input type="email" placeholder="applicant@email.com or institution@school.edu" value={shareEmail} onChange={(e) => setShareEmail(e.target.value)} required />
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
                  <label className="text-sm font-medium text-foreground">Upload Evaluation (PDF Only) *</label>
                  <Input type="file" accept=".pdf" onChange={(e) => setShareFile(e.target.files?.[0] || null)} />
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" className="gap-2 px-8"><Upload size={16} /> Upload & Share Report</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deleteDialog.type === "client" ? "client" : "order"} <strong>{deleteDialog.label}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(prev => ({ ...prev, open: false }))}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} className="gap-1"><Trash2 size={14} /> Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BackToHome />
      <Footer />
    </div>
  );
};

export default StaffDashboard;
