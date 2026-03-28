import { useState, useEffect, useRef } from "react";
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
  Paperclip, Receipt,
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
  application_id?: string;
  ifcs_id?: string;
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
  requested:    { label: "Requested",              color: "bg-muted text-muted-foreground",    icon: <Clock size={14} /> },
  in_process:   { label: "In Process",             color: "bg-blue-500/20 text-blue-600",      icon: <Package size={14} /> },
  in_review:    { label: "In Review",              color: "bg-accent/20 text-accent",          icon: <Package size={14} /> },
  need_info:    { label: "Need Additional Info",   color: "bg-amber-500/20 text-amber-600",    icon: <AlertCircle size={14} /> },
  on_hold:      { label: "On Hold",                color: "bg-destructive/20 text-destructive", icon: <AlertCircle size={14} /> },
  completed:    { label: "Completed",              color: "bg-emerald-500/20 text-emerald-600", icon: <CheckCircle2 size={14} /> },
  delivered:    { label: "Delivered",               color: "bg-emerald-500/20 text-emerald-600", icon: <CheckCircle2 size={14} /> },
};

const quickNotes = [
  "Needs translations",
  "Needs degree certificate",
  "Needs transcript",
  "Need to find the University",
  "Need to know accreditation",
  "Not accredited",
  "Under review",
];

const institutionQuickNote = `Greetings,
Attached please find the credential evaluation report and supporting academic documents of 

Thank you for choosing IFCS. 
Best regards, 
IFCS Team. 

 
Institute of Foreign Credential Services 
6 Cedar St, Dobbs Ferry, NY 10522 
Phone: 914.693.2840 
Fax: 914. 231-7782
E-mail: apps@ifcsevals.com 
www.ifcsevals.com`;

const evaluators = ["Vera", "Agron", "Enver", "Ritvan", "Fadil", "Bia", "Linda", "IFCS Team"];

const verificationSources = [
  "IFCS is performing document authentication",
  "Applicant will arrange to send with Institution",
  "Original Documents Required to be mailed to IFCS",
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

  // Live chat
  const [pendingChats, setPendingChats] = useState<PendingChat[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);

  // Delete confirmation
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: "client" | "order"; id: string; label: string; email?: string }>({ open: false, type: "client", id: "", label: "" });

  // New Application Entry dialog
  const [newAppOpen, setNewAppOpen] = useState(false);
  const [newAppSendTo, setNewAppSendTo] = useState("applicant");

  // Applicant fields
  const [newAppIfcsId, setNewAppIfcsId] = useState("IFCS-");
  const [newAppEmail, setNewAppEmail] = useState("");
  const [newAppVerification, setNewAppVerification] = useState("");
  const [newAppStatus, setNewAppStatus] = useState("in_process");
  const [newAppEvaluator, setNewAppEvaluator] = useState("");
  const [newAppRush, setNewAppRush] = useState("standard");
  const [newAppNotes, setNewAppNotes] = useState("");
  const [newAppAttachment, setNewAppAttachment] = useState<File | null>(null);
  const [newAppReceipt, setNewAppReceipt] = useState<File | null>(null);

  // Institution fields
  const [instAppNumber, setInstAppNumber] = useState("");
  const [instApplicantEmail, setInstApplicantEmail] = useState("");
  const [instInstitutionEmail, setInstInstitutionEmail] = useState("");
  const [instCcEmails, setInstCcEmails] = useState<string[]>([]);
  const [instCcInput, setInstCcInput] = useState("");
  const [instNotes, setInstNotes] = useState("");
  const [instAttachments, setInstAttachments] = useState<File[]>([]);

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
    const matchesSearch = o.reference_id.toLowerCase().includes(q) || o.client_email.toLowerCase().includes(q) || (o.ifcs_id || "").toLowerCase().includes(q) || (o.application_id || "").toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  // Status change
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    await (supabase as any).from("client_orders").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    const order = orders.find(o => o.id === orderId);
    if (order?.application_id) {
      await (supabase as any).from("applications").update({ status: newStatus }).eq("application_id", order.application_id);
    }
    toast({ title: "Status Updated", description: `Order → ${statusMeta[newStatus]?.label || newStatus}` });
  };

  // Staff note update with email notification (always sends to applicant)
  const handleUpdateNote = async (orderId: string, note: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    await (supabase as any).from("client_orders").update({ staff_note: note, updated_at: new Date().toISOString() }).eq("id", orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, staff_note: note } : o));

    if (order.application_id) {
      await (supabase as any).from("applications").update({ staff_notes: note, note_send_to: "applicant" }).eq("application_id", order.application_id);
    }

    const client = clients.find(c => c.email === order.client_email);
    const applicantName = client ? `${client.first_name} ${client.last_name}` : "Applicant";

    try {
      await supabase.functions.invoke("send-application-email", {
        body: {
          type: "staff_note",
          recipientEmail: order.client_email,
          applicantName,
          noteContent: note,
        },
      });
    } catch {}

    toast({ title: "Note Saved & Sent", description: `Note sent to ${order.client_email}.` });
  };

  // Delete client or order (with associated data)
  const handleDelete = async () => {
    if (deleteDialog.type === "order") {
      // Also delete associated application
      const order = orders.find(o => o.id === deleteDialog.id);
      if (order?.application_id) {
        await (supabase as any).from("applications").delete().eq("application_id", order.application_id);
      }
      await (supabase as any).from("client_orders").delete().eq("id", deleteDialog.id);
      setOrders(prev => prev.filter(o => o.id !== deleteDialog.id));

      // Also delete the client account if requested
      if (deleteDialog.email) {
        await (supabase as any).from("client_accounts").delete().eq("email", deleteDialog.email);
        setClients(prev => prev.filter(c => c.email !== deleteDialog.email));
      }

      toast({ title: "Deleted", description: "Application and associated data removed." });
    } else {
      await (supabase as any).from("client_accounts").delete().eq("id", deleteDialog.id);
      setClients(prev => prev.filter(c => c.id !== deleteDialog.id));
      toast({ title: "Client Deleted" });
    }
    setDeleteDialog({ open: false, type: "client", id: "", label: "" });
  };

  // Upload attachment on existing order note
  const handleNoteAttachment = async (orderId: string, file: File, type: "attachment" | "receipt") => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const folder = type === "receipt" ? "receipts" : "notes";
    const filePath = `${folder}/${order.reference_id}-${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("evaluation-reports").upload(filePath, file);
    if (upErr) {
      toast({ title: "Upload Failed", variant: "destructive" });
      return;
    }
    const { data: urlData } = supabase.storage.from("evaluation-reports").getPublicUrl(filePath);

    if (type === "receipt" && order.application_id) {
      await (supabase as any).from("applications").update({ receipt_url: urlData.publicUrl }).eq("application_id", order.application_id);
      toast({ title: "Receipt Uploaded", description: "Client can now view the receipt." });
    } else {
      const noteWithAttachment = `${order.staff_note || ""}\n📎 Attachment: ${file.name} - ${urlData.publicUrl}`;
      await handleUpdateNote(orderId, noteWithAttachment);
    }
  };

  // New Application Entry handler (Applicant mode)
  const handleNewApplication = async () => {
    if (!newAppEmail.trim() || !newAppIfcsId.trim()) {
      toast({ title: "Missing Fields", description: "Please enter Client Email and IFCS ID.", variant: "destructive" });
      return;
    }

    const { data: apps } = await (supabase as any)
      .from("applications")
      .select("*")
      .eq("client_email", newAppEmail.trim())
      .order("created_at", { ascending: false });

    if (!apps || apps.length === 0) {
      toast({ title: "No Application Found", description: `No application found for ${newAppEmail.trim()}.`, variant: "destructive" });
      return;
    }

    const app = apps[0];

    let attachmentUrl = "";
    if (newAppAttachment) {
      const filePath = `notes/${app.application_id}-${Date.now()}-${newAppAttachment.name}`;
      const { error: upErr } = await supabase.storage.from("evaluation-reports").upload(filePath, newAppAttachment);
      if (!upErr) {
        const { data: urlData } = supabase.storage.from("evaluation-reports").getPublicUrl(filePath);
        attachmentUrl = urlData.publicUrl;
      }
    }

    let receiptUrl = "";
    if (newAppReceipt) {
      const filePath = `receipts/${app.application_id}-${Date.now()}-${newAppReceipt.name}`;
      const { error: upErr } = await supabase.storage.from("evaluation-reports").upload(filePath, newAppReceipt);
      if (!upErr) {
        const { data: urlData } = supabase.storage.from("evaluation-reports").getPublicUrl(filePath);
        receiptUrl = urlData.publicUrl;
      }
    }

    const ifcsId = newAppIfcsId.trim();

    await (supabase as any).from("applications").update({
      ifcs_id: ifcsId,
      verification_source: newAppVerification,
      evaluator: newAppEvaluator,
      status: newAppStatus,
      staff_notes: newAppNotes,
      note_send_to: "applicant",
      receipt_url: receiptUrl || undefined,
    }).eq("application_id", app.application_id);

    await (supabase as any).from("client_orders").update({
      ifcs_id: ifcsId,
      status: newAppStatus,
      staff_note: newAppNotes,
    }).eq("application_id", app.application_id);

    const { data: existingOrder } = await (supabase as any)
      .from("client_orders")
      .select("id")
      .eq("application_id", app.application_id)
      .maybeSingle();

    if (!existingOrder) {
      await (supabase as any).from("client_orders").insert({
        reference_id: ifcsId,
        client_email: newAppEmail.trim(),
        service: `${app.service_title || ""} — ${app.processing_label || ""}`,
        status: newAppStatus,
        application_id: app.application_id,
        ifcs_id: ifcsId,
        dob: app.dob,
        staff_note: newAppNotes,
      });
    }

    if (newAppNotes.trim()) {
      const client = clients.find(c => c.email === newAppEmail.trim());
      const applicantName = client ? `${client.first_name} ${client.last_name}` : app.first_name ? `${app.first_name} ${app.last_name}` : "Applicant";
      try {
        await supabase.functions.invoke("send-application-email", {
          body: { type: "staff_note", recipientEmail: newAppEmail.trim(), applicantName, noteContent: newAppNotes },
        });
      } catch {}
    }

    toast({ title: "Application Entry Added", description: `IFCS ID ${ifcsId} linked to ${app.application_id}.` });
    resetNewAppForm();

    const { data: refreshed } = await (supabase as any).from("client_orders").select("*").order("created_at", { ascending: false });
    if (refreshed) setOrders(refreshed);
  };

  // Institution send report handler
  const handleInstitutionSend = async () => {
    if (!instInstitutionEmail.trim() || !instApplicantEmail.trim()) {
      toast({ title: "Missing Fields", description: "Please enter Institution Email and Applicant Email.", variant: "destructive" });
      return;
    }

    // Upload all attachments
    const attachmentUrls: string[] = [];
    for (const file of instAttachments) {
      const filePath = `institution/${instAppNumber || "general"}-${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("evaluation-reports").upload(filePath, file);
      if (!upErr) {
        const { data: urlData } = supabase.storage.from("evaluation-reports").getPublicUrl(filePath);
        attachmentUrls.push(urlData.publicUrl);
      }
    }

    // Build email body
    const attachmentLinks = attachmentUrls.length > 0 
      ? `\n\nAttached files:\n${attachmentUrls.map((url, i) => `${i + 1}. ${url}`).join("\n")}`
      : "";

    const emailBody = `${instNotes}${attachmentLinks}`;

    // All CC recipients
    const allRecipients = [instApplicantEmail.trim(), ...instCcEmails.filter(e => e.trim())];

    try {
      // Send to institution
      await supabase.functions.invoke("send-application-email", {
        body: {
          subject: `IFCS Credential Evaluation Report${instAppNumber ? ` — Application #${instAppNumber}` : ""}`,
          body: emailBody,
          recipientEmail: instInstitutionEmail.trim(),
          applicantEmail: allRecipients.join(","),
        },
      });

      toast({ title: "Report Sent", description: `Email sent to ${instInstitutionEmail.trim()} with CC to ${allRecipients.join(", ")}.` });
    } catch {
      toast({ title: "Send Failed", variant: "destructive" });
    }

    resetNewAppForm();
  };

  const resetNewAppForm = () => {
    setNewAppOpen(false);
    setNewAppSendTo("applicant");
    setNewAppIfcsId("IFCS-");
    setNewAppEmail("");
    setNewAppVerification("");
    setNewAppStatus("in_process");
    setNewAppEvaluator("");
    setNewAppRush("standard");
    setNewAppNotes("");
    setNewAppAttachment(null);
    setNewAppReceipt(null);
    setInstAppNumber("");
    setInstApplicantEmail("");
    setInstInstitutionEmail("");
    setInstCcEmails([]);
    setInstCcInput("");
    setInstNotes("");
    setInstAttachments([]);
  };

  const handleAddCc = () => {
    if (instCcInput.trim() && instCcInput.includes("@")) {
      setInstCcEmails(prev => [...prev, instCcInput.trim()]);
      setInstCcInput("");
    }
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

          {/* ── Application Queue ── */}
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Package size={22} className="text-accent" /> Application Queue
                  <Badge variant="secondary" className="ml-2">{orders.length}</Badge>
                </CardTitle>
                <div className="flex gap-2">
                  <Button onClick={() => setNewAppOpen(true)} className="gap-2 bg-foreground text-background hover:bg-foreground/90">
                    <Plus size={16} /> New Application Entry
                  </Button>
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="requested">Requested</SelectItem>
                      <SelectItem value="in_process">In Process</SelectItem>
                      <SelectItem value="in_review">In Review</SelectItem>
                      <SelectItem value="need_info">Need Additional Info</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by IFCS ID, App ID, reference # or email..." className="pl-9" />
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

                return (
                  <div key={o.id} className="rounded-xl border border-border overflow-hidden">
                    <button onClick={() => setSelectedOrder(isSelected ? null : o.id)}
                      className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors text-left">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          {o.application_id && <p className="font-semibold text-foreground">App ID {o.application_id}</p>}
                          {o.ifcs_id && <p className="font-semibold text-accent">IFCS ID {o.ifcs_id}</p>}
                          {!o.application_id && !o.ifcs_id && <p className="font-semibold text-foreground">#{o.reference_id}</p>}
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
                              <Button key={key} size="sm" variant={o.status === key ? "default" : "outline"} className="gap-1 rounded-full"
                                onClick={() => handleStatusChange(o.id, key)}>
                                {val.icon} {val.label}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Notes section - no dropdown, always sends to applicant */}
                        <div>
                          <p className="text-sm font-medium text-foreground mb-2">Notes</p>

                          {/* Quick note tags */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {quickNotes.map((qn) => (
                              <Button key={qn} size="sm" variant="outline" className="gap-1 text-xs rounded-full border-accent/40 text-accent hover:bg-accent/10"
                                onClick={() => {
                                  const currentNote = o.staff_note || "";
                                  const newNote = currentNote ? `${currentNote}\n${qn}` : qn;
                                  handleUpdateNote(o.id, newNote);
                                }}>
                                <Plus size={10} /> {qn}
                              </Button>
                            ))}
                          </div>

                          <Textarea defaultValue={o.staff_note} placeholder="Add any notes about this application..."
                            onBlur={(e) => { if (e.target.value !== o.staff_note) handleUpdateNote(o.id, e.target.value); }}
                          />

                          {/* Attachment buttons */}
                          <div className="flex gap-2 mt-2">
                            <label className="cursor-pointer">
                              <input type="file" className="hidden" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleNoteAttachment(o.id, file, "attachment");
                              }} />
                              <Button type="button" size="sm" variant="outline" className="gap-1 rounded-full pointer-events-none">
                                <Paperclip size={14} /> Attach File
                              </Button>
                            </label>
                            <label className="cursor-pointer">
                              <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleNoteAttachment(o.id, file, "receipt");
                              }} />
                              <Button type="button" size="sm" variant="outline" className="gap-1 rounded-full pointer-events-none">
                                <Receipt size={14} /> Upload Receipt
                              </Button>
                            </label>
                          </div>
                        </div>

                        {/* Chat & Delete */}
                        <div className="flex gap-3 flex-wrap">
                          <Button size="sm" variant="outline" className="gap-1 rounded-full" onClick={() => handleStartChatWithApplicant(applicantName, o.client_email)}>
                            <MessageCircle size={14} /> Chat with {applicantName}
                          </Button>
                          <Button size="sm" variant="destructive" className="gap-1 rounded-full"
                            onClick={() => setDeleteDialog({ open: true, type: "order", id: o.id, label: `${o.application_id || o.reference_id}`, email: o.client_email })}>
                            <Trash2 size={14} /> Delete Application & Client
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

      {/* ── New Application Entry Dialog ── */}
      <Dialog open={newAppOpen} onOpenChange={setNewAppOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">New Application Entry</DialogTitle>
          </DialogHeader>

          {/* Send To selector at top */}
          <div className="space-y-1.5 pb-2 border-b border-border">
            <label className="text-xs font-semibold uppercase tracking-widest text-accent">Send To</label>
            <Select value={newAppSendTo} onValueChange={setNewAppSendTo}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="applicant">Applicant</SelectItem>
                <SelectItem value="institution">Institution</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ── APPLICANT MODE ── */}
          {newAppSendTo === "applicant" && (
            <div className="space-y-6 pt-2">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-accent">Application Number *</label>
                  <Input value={newAppIfcsId} onChange={(e) => setNewAppIfcsId(e.target.value)} placeholder="IFCS-45001" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-accent">Client Email *</label>
                  <Input type="email" value={newAppEmail} onChange={(e) => setNewAppEmail(e.target.value)} placeholder="client@email.com" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-accent">Date Entered</label>
                  <Input value={new Date().toLocaleDateString()} disabled className="bg-muted/40" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-accent">Verification Source</label>
                  <Select value={newAppVerification} onValueChange={setNewAppVerification}>
                    <SelectTrigger><SelectValue placeholder="Select source..." /></SelectTrigger>
                    <SelectContent>
                      {verificationSources.map((v) => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-accent">Status</label>
                  <Select value={newAppStatus} onValueChange={setNewAppStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_process">In Process</SelectItem>
                      <SelectItem value="in_review">In Review</SelectItem>
                      <SelectItem value="need_info">Need Additional Information</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-accent">Assign Evaluator</label>
                <Select value={newAppEvaluator} onValueChange={setNewAppEvaluator}>
                  <SelectTrigger><SelectValue placeholder="Select evaluator..." /></SelectTrigger>
                  <SelectContent>
                    {evaluators.map((ev) => (
                      <SelectItem key={ev} value={ev}>{ev}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-accent">Rush Service</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "standard", label: "Standard", desc: "Regular processing", border: "border-foreground" },
                    { value: "3day", label: "🔥 3-Day Rush", desc: "Priority processing", border: "border-amber-500/40" },
                    { value: "24hour", label: "⚡ 24-Hour Rush", desc: "Urgent processing", border: "border-red-500/40" },
                  ].map((r) => (
                    <button key={r.value} type="button" onClick={() => setNewAppRush(r.value)}
                      className={`rounded-xl border-2 p-4 text-left transition-all ${newAppRush === r.value ? `${r.border} bg-muted/30` : "border-border hover:border-muted-foreground/30"}`}>
                      <p className="font-semibold text-sm text-foreground">{r.label}</p>
                      <p className="text-xs text-muted-foreground">{r.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-accent">Notes</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {quickNotes.map((qn) => (
                    <Button key={qn} type="button" size="sm" variant="outline" className="gap-1 text-xs rounded-full border-accent/40 text-accent hover:bg-accent/10"
                      onClick={() => setNewAppNotes(prev => prev ? `${prev}\n${qn}` : qn)}>
                      <Plus size={10} /> {qn}
                    </Button>
                  ))}
                </div>
                <Textarea value={newAppNotes} onChange={(e) => setNewAppNotes(e.target.value)} placeholder="Add any notes about this application..." rows={4} />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-accent">Attach File</label>
                  <Input type="file" onChange={(e) => setNewAppAttachment(e.target.files?.[0] || null)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-accent">Upload Receipt</label>
                  <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setNewAppReceipt(e.target.files?.[0] || null)} />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setNewAppOpen(false)}>Cancel</Button>
                <Button onClick={handleNewApplication} className="gap-2 bg-foreground text-background hover:bg-foreground/90">
                  <Plus size={16} /> Add Application
                </Button>
              </DialogFooter>
            </div>
          )}

          {/* ── INSTITUTION MODE ── */}
          {newAppSendTo === "institution" && (
            <div className="space-y-6 pt-2">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-accent">Application Number</label>
                  <Input value={instAppNumber} onChange={(e) => setInstAppNumber(e.target.value)} placeholder="e.g. EE2323" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-accent">Date Entered</label>
                  <Input value={new Date().toLocaleDateString()} disabled className="bg-muted/40" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-accent">Applicant Email *</label>
                  <Input type="email" value={instApplicantEmail} onChange={(e) => setInstApplicantEmail(e.target.value)} placeholder="applicant@email.com" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-accent">Institution Email *</label>
                  <Input type="email" value={instInstitutionEmail} onChange={(e) => setInstInstitutionEmail(e.target.value)} placeholder="admissions@university.edu" />
                </div>
              </div>

              {/* CC Emails */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-accent">CC Emails</label>
                <div className="flex gap-2">
                  <Input value={instCcInput} onChange={(e) => setInstCcInput(e.target.value)} placeholder="additional@email.com"
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCc(); } }} />
                  <Button type="button" size="sm" variant="outline" onClick={handleAddCc} className="shrink-0">
                    <Plus size={14} /> Add
                  </Button>
                </div>
                {instCcEmails.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {instCcEmails.map((email, i) => (
                      <Badge key={i} variant="secondary" className="gap-1 pr-1">
                        {email}
                        <button onClick={() => setInstCcEmails(prev => prev.filter((_, idx) => idx !== i))} className="ml-1 hover:text-destructive">
                          <X size={12} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes with institution quick add */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-accent">Notes</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Button type="button" size="sm" variant="outline" className="gap-1 text-xs rounded-full border-accent/40 text-accent hover:bg-accent/10"
                    onClick={() => setInstNotes(institutionQuickNote)}>
                    <Plus size={10} /> IFCS Report Template
                  </Button>
                </div>
                <Textarea value={instNotes} onChange={(e) => setInstNotes(e.target.value)} placeholder="Add email body..." rows={8} />
              </div>

              {/* Multiple attachments */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-accent">Attach Files</label>
                <Input type="file" multiple onChange={(e) => {
                  const files = e.target.files;
                  if (files) setInstAttachments(prev => [...prev, ...Array.from(files)]);
                }} />
                {instAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {instAttachments.map((file, i) => (
                      <Badge key={i} variant="secondary" className="gap-1 pr-1">
                        <Paperclip size={12} /> {file.name}
                        <button onClick={() => setInstAttachments(prev => prev.filter((_, idx) => idx !== i))} className="ml-1 hover:text-destructive">
                          <X size={12} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setNewAppOpen(false)}>Cancel</Button>
                <Button onClick={handleInstitutionSend} className="gap-2 bg-foreground text-background hover:bg-foreground/90">
                  <Send size={16} /> Send Report
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete application <strong>{deleteDialog.label}</strong> and the associated client account? This action cannot be undone.
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
