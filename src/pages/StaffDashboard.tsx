import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToHome from "@/components/BackToHome";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Upload, Send, Users, Clock, AlertCircle, CheckCircle2, Package, FileText, Star,
  Plus, X, Languages, FileUp, Info, Search, MessageCircle, Headphones, Trash2, UserX,
  Paperclip, Receipt, Edit3, Mail, CreditCard,
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

type StaffSection = "chat" | "queue" | "share_report" | "careers";

const staffSectionOptions: { value: StaffSection; label: string; icon: React.ReactNode }[] = [
  { value: "chat", label: "Live Chat", icon: <Headphones size={18} /> },
  { value: "queue", label: "Application Queue", icon: <Package size={18} /> },
  { value: "share_report", label: "Share Report", icon: <FileText size={18} /> },
  { value: "careers", label: "Career Listings", icon: <Users size={18} /> },
];

const StaffDashboard = () => {
  const { toast } = useToast();
  const [staffSection, setStaffSection] = useState<StaffSection>("queue");
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
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; deleteType: "client" | "application" | "both"; orderId: string; label: string; email?: string }>({ open: false, deleteType: "both", orderId: "", label: "" });

  // Edit Application dialog
  const [editAppOpen, setEditAppOpen] = useState(false);
  const [editAppData, setEditAppData] = useState<any>(null);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [editFields, setEditFields] = useState({
    first_name: "", last_name: "", middle_name: "", dob: "", ifcs_id: "", status: "",
    service_title: "", processing_label: "", evaluator: "", staff_notes: "", verification_source: "",
    country: "", institution_name: "", cell_phone: "", home_phone: "", gender: "",
  });

  // Email Client / Institution dialog
  const [newAppOpen, setNewAppOpen] = useState(false);
  const [newAppSendTo, setNewAppSendTo] = useState("applicant");

  // Email Client fields
  const [newAppIfcsId, setNewAppIfcsId] = useState("IFCS-");
  const [newAppEmail, setNewAppEmail] = useState("");
  const [newAppVerification, setNewAppVerification] = useState("");
  const [newAppStatus, setNewAppStatus] = useState("in_process");
  const [newAppEvaluator, setNewAppEvaluator] = useState("");
  const [newAppRush, setNewAppRush] = useState("standard");
  const [newAppNotes, setNewAppNotes] = useState("");
  const [newAppAttachment, setNewAppAttachment] = useState<File | null>(null);
  const [newAppReceipt, setNewAppReceipt] = useState<File | null>(null);
  const [emailClientSubject, setEmailClientSubject] = useState("");

  // Institution fields
  const [instAppNumber, setInstAppNumber] = useState("");
  const [instApplicantEmail, setInstApplicantEmail] = useState("");
  const [instInstitutionEmail, setInstInstitutionEmail] = useState("");
  const [instCcEmails, setInstCcEmails] = useState<string[]>([]);
  const [instCcInput, setInstCcInput] = useState("");
  const [instNotes, setInstNotes] = useState("");
  const [instAttachments, setInstAttachments] = useState<File[]>([]);

  // Career management
  const [careerListings, setCareerListings] = useState<any[]>([]);
  const [careerApps, setCareerApps] = useState<any[]>([]);
  const [careerDialogOpen, setCareerDialogOpen] = useState(false);
  const [careerEditId, setCareerEditId] = useState<string | null>(null);
  const [careerTitle, setCareerTitle] = useState("");
  const [careerDesc, setCareerDesc] = useState("");
  const [careerReqs, setCareerReqs] = useState("");
  const [careerLocation, setCareerLocation] = useState("Dobbs Ferry, NY");
  const [careerType, setCareerType] = useState("Full-time");
  const [careerActive, setCareerActive] = useState(true);
  const [careerAppsDialogOpen, setCareerAppsDialogOpen] = useState(false);
  const [careerViewJobId, setCareerViewJobId] = useState<string | null>(null);

  // Load all data
  useEffect(() => {
    const loadAll = async () => {
      const [ordersRes, clientsRes, chatsRes, jobsRes, jobAppsRes] = await Promise.all([
        (supabase as any).from("client_orders").select("*").order("created_at", { ascending: false }),
        (supabase as any).from("client_accounts").select("*").order("created_at", { ascending: false }),
        supabase.from("chat_conversations").select("*").eq("status", "pending").order("created_at", { ascending: false }),
        (supabase as any).from("job_listings").select("*").order("created_at", { ascending: false }),
        (supabase as any).from("job_applications").select("*").order("created_at", { ascending: false }),
      ]);
      if (ordersRes.data) setOrders(ordersRes.data);
      if (clientsRes.data) setClients(clientsRes.data);
      if (chatsRes.data) {
        // Deduplicate: only show the most recent pending chat per client
        const seen = new Set<string>();
        const unique = (chatsRes.data as PendingChat[]).filter(c => {
          if (seen.has(c.client_identifier)) return false;
          seen.add(c.client_identifier);
          return true;
        });
        setPendingChats(unique);
      }
      if (jobsRes.data) setCareerListings(jobsRes.data);
      if (jobAppsRes.data) setCareerApps(jobAppsRes.data);
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
        supabase.from("chat_conversations").select("*").eq("status", "pending").order("created_at", { ascending: false }).then((r) => {
          if (r.data) {
            const seen = new Set<string>();
            const unique = (r.data as PendingChat[]).filter(c => {
              if (seen.has(c.client_identifier)) return false;
              seen.add(c.client_identifier);
              return true;
            });
            setPendingChats(unique);
          }
        });
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
    const order = orders.find(o => o.id === deleteDialog.orderId);

    if (deleteDialog.deleteType === "application" || deleteDialog.deleteType === "both") {
      if (order?.application_id) {
        await (supabase as any).from("applications").delete().eq("application_id", order.application_id);
      }
      await (supabase as any).from("client_orders").delete().eq("id", deleteDialog.orderId);
      setOrders(prev => prev.filter(o => o.id !== deleteDialog.orderId));
    }

    if (deleteDialog.deleteType === "client" || deleteDialog.deleteType === "both") {
      if (deleteDialog.email) {
        await (supabase as any).from("client_accounts").delete().eq("email", deleteDialog.email);
        setClients(prev => prev.filter(c => c.email !== deleteDialog.email));
      }
    }

    const messages: Record<string, string> = {
      client: "Client account deleted.",
      application: "Application deleted.",
      both: "Application and client account deleted.",
    };
    toast({ title: "Deleted", description: messages[deleteDialog.deleteType] });
    setDeleteDialog({ open: false, deleteType: "both", orderId: "", label: "" });
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

      // Try to extract IFCS Reference Number from receipt image/PDF using OCR
      try {
        const { data: ocrResult } = await supabase.functions.invoke("analyze-document", {
          body: { imageBase64: await fileToBase64(file), extractReference: true },
        });
        if (ocrResult?.referenceNumber) {
          const ifcsId = ocrResult.referenceNumber;
          await (supabase as any).from("applications").update({ ifcs_id: ifcsId }).eq("application_id", order.application_id);
          await (supabase as any).from("client_orders").update({ ifcs_id: ifcsId }).eq("id", orderId);
          setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ifcs_id: ifcsId } : o));
          toast({ title: "Receipt Uploaded & IFCS ID Extracted", description: `IFCS Reference #${ifcsId} has been linked.` });
          return;
        }
      } catch {}

      toast({ title: "Receipt Uploaded", description: "Client can now view the receipt." });
    } else {
      const noteWithAttachment = `${order.staff_note || ""}\n📎 Attachment: ${file.name} - ${urlData.publicUrl}`;
      await handleUpdateNote(orderId, noteWithAttachment);
    }
  };

  // Helper to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1] || result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
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

  const openEditApp = async (order: DBOrder) => {
    // Load full application data
    const { data: app } = await (supabase as any).from("applications").select("*").eq("application_id", order.application_id).maybeSingle();
    if (!app) {
      toast({ title: "Not Found", description: "Application not found in database.", variant: "destructive" });
      return;
    }
    setEditAppData(app);
    setEditFields({
      first_name: app.first_name || "", last_name: app.last_name || "", middle_name: app.middle_name || "",
      dob: app.dob || "", ifcs_id: app.ifcs_id || "", status: app.status || "requested",
      service_title: app.service_title || "", processing_label: app.processing_label || "",
      evaluator: app.evaluator || "", staff_notes: app.staff_notes || "",
      verification_source: app.verification_source || "", country: app.country || "",
      institution_name: app.institution_name || "", cell_phone: app.cell_phone || "",
      home_phone: app.home_phone || "", gender: app.gender || "",
    });
    setEditAppOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editAppData) return;
    setSaveConfirmOpen(true);
  };

  const confirmSaveEdit = async () => {
    if (!editAppData) return;
    setSaveConfirmOpen(false);

    await (supabase as any).from("applications").update({
      first_name: editFields.first_name, last_name: editFields.last_name, middle_name: editFields.middle_name,
      dob: editFields.dob, ifcs_id: editFields.ifcs_id, status: editFields.status,
      service_title: editFields.service_title, processing_label: editFields.processing_label,
      evaluator: editFields.evaluator, staff_notes: editFields.staff_notes,
      verification_source: editFields.verification_source, country: editFields.country,
      institution_name: editFields.institution_name, cell_phone: editFields.cell_phone,
      home_phone: editFields.home_phone, gender: editFields.gender,
    }).eq("application_id", editAppData.application_id);

    // Update client_orders too
    await (supabase as any).from("client_orders").update({
      ifcs_id: editFields.ifcs_id, status: editFields.status, staff_note: editFields.staff_notes,
      service: `${editFields.service_title} — ${editFields.processing_label}`,
    }).eq("application_id", editAppData.application_id);

    // Send notification email to client
    try {
      await supabase.functions.invoke("send-application-email", {
        body: {
          subject: "Your IFCS Application Has Been Updated",
          body: `Dear ${editFields.first_name} ${editFields.last_name},\n\nYour application (${editAppData.application_id}) has been updated by our team. Please log in to your dashboard to view the latest details.\n\nBest regards,\nIFCS Team\n\nInstitute of Foreign Credential Services\n6 Cedar St, Dobbs Ferry, NY 10522\nPhone: (914) 693-2840\nwww.ifcsevals.com`,
          recipientEmail: editAppData.client_email,
        },
      });
    } catch {}

    toast({ title: "Application Updated", description: "Changes saved and client notified." });
    setEditAppOpen(false);

    // Refresh orders
    const { data: refreshed } = await (supabase as any).from("client_orders").select("*").order("created_at", { ascending: false });
    if (refreshed) setOrders(refreshed);
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
    setEmailClientSubject("");
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

      <section className="pt-28 pb-14 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex items-center gap-5 mb-2">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 flex items-center justify-center shadow-sm">
            <Package size={28} className="text-accent" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Staff Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-base">Manage applications, share reports & communicate with applicants</p>
          </div>
        </div>
      </section>

      <div className="content-bg">
        <div className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
          <div className="flex gap-8">
            {/* ── Left Sidebar Navigation ── */}
            <aside className="hidden md:flex flex-col w-64 shrink-0 sticky top-28 self-start space-y-2">
              {staffSectionOptions.map((opt) => {
                const isActive = staffSection === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setStaffSection(opt.value)}
                    className={`flex items-center gap-3 w-full px-5 py-4 rounded-2xl text-left transition-all duration-200 ${
                      isActive
                        ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20"
                        : "bg-card border border-border text-foreground hover:bg-accent/10 hover:border-accent/40"
                    }`}
                  >
                    <div className={`${isActive ? "text-accent-foreground" : "text-accent"}`}>
                      {opt.icon}
                    </div>
                    <span className="text-sm font-semibold">{opt.label}</span>
                    {opt.value === "chat" && pendingChats.length > 0 && (
                      <span className="ml-auto w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                        {pendingChats.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </aside>

            {/* Mobile section selector */}
            <div className="md:hidden w-full mb-6">
              <div className="flex overflow-x-auto gap-2 pb-2">
                {staffSectionOptions.map((opt) => {
                  const isActive = staffSection === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setStaffSection(opt.value)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all ${
                        isActive
                          ? "bg-accent text-accent-foreground shadow-md"
                          : "bg-card border border-border text-foreground"
                      }`}
                    >
                      {opt.icon}
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Main Content Area ── */}
            <div className="flex-1 min-w-0 space-y-10">

          {/* ── Incoming Chat Requests ── */}
          {staffSection === "chat" && pendingChats.length > 0 && (
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
          {staffSection === "chat" && activeConvId && (
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

          {/* ── No pending chats message ── */}
          {staffSection === "chat" && pendingChats.length === 0 && !activeConvId && (
            <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm text-center py-12">
              <Headphones size={40} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-semibold text-foreground mb-1">No pending chat requests</p>
              <p className="text-sm text-muted-foreground">When clients request live chat support, they'll appear here.</p>
            </div>
          )}

          {/* ── Application Queue ── */}
          {staffSection === "queue" && (
          <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm">
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <Package size={20} className="text-accent" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Application Queue</h2>
                  <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-semibold">{orders.length}</span>
                </div>
                <div className="flex gap-2">
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-48 rounded-2xl"><SelectValue placeholder="Filter by status" /></SelectTrigger>
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
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by IFCS ID, App ID, reference # or email..." className="pl-10 rounded-2xl h-12" />
              </div>
            </div>
            <div className="space-y-4">
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
                  <div key={o.id} className="rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow">
                    <button onClick={() => setSelectedOrder(isSelected ? null : o.id)}
                      className="w-full flex items-center justify-between p-5 hover:bg-muted/20 transition-colors text-left">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          {o.application_id && <p className="font-semibold text-foreground">App ID {o.application_id}</p>}
                          {o.ifcs_id && <p className="font-semibold text-accent">IFCS ID {o.ifcs_id}</p>}
                          {!o.application_id && !o.ifcs_id && <p className="font-semibold text-foreground">#{o.reference_id}</p>}
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${meta.color}`}>{meta.icon} {meta.label}</span>
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
                              <button key={key}
                                className={`inline-flex items-center gap-1 px-4 py-2 rounded-2xl text-xs font-semibold transition-all ${o.status === key ? "bg-accent text-accent-foreground" : "border border-border bg-muted/50 text-foreground hover:bg-muted"}`}
                                onClick={() => handleStatusChange(o.id, key)}>
                                {val.icon} {val.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Verification Source */}
                        <div>
                          <p className="text-sm font-medium text-foreground mb-2">Verification Source</p>
                          <Select
                            value={(orders.find(ord => ord.id === o.id) as any)?.verification_source || ""}
                            onValueChange={async (val) => {
                              await (supabase as any).from("client_orders").update({ verification_source: val }).eq("id", o.id);
                              if (o.application_id) {
                                await (supabase as any).from("applications").update({ verification_source: val }).eq("application_id", o.application_id);
                              }
                              setOrders(prev => prev.map(ord => ord.id === o.id ? { ...ord, verification_source: val } as any : ord));
                              toast({ title: "Verification Source Updated" });
                            }}
                          >
                            <SelectTrigger className="w-full max-w-md rounded-2xl"><SelectValue placeholder="Select verification source..." /></SelectTrigger>
                            <SelectContent>
                              {verificationSources.map((v) => (
                                <SelectItem key={v} value={v}>{v}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Notes section - no dropdown, always sends to applicant */}
                        <div>
                          <p className="text-sm font-medium text-foreground mb-2">Notes</p>

                          {/* Quick note tags */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {quickNotes.map((qn) => (
                              <button key={qn} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-2xl text-xs font-semibold border border-accent/30 text-accent bg-accent/5 hover:bg-accent/10 transition-all"
                                onClick={() => {
                                  const currentNote = o.staff_note || "";
                                  const newNote = currentNote ? `${currentNote}\n${qn}` : qn;
                                  handleUpdateNote(o.id, newNote);
                                }}>
                                <Plus size={10} /> {qn}
                              </button>
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

                        {/* Edit, Email, Chat & Delete */}
                        <div className="flex gap-2 flex-wrap">
                          {o.application_id && (
                            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-accent/30 text-xs font-semibold text-accent bg-accent/5 hover:bg-accent/10 transition-all"
                              onClick={() => openEditApp(o)}>
                              <Edit3 size={14} /> Edit Application
                            </button>
                          )}
                          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-accent/30 text-xs font-semibold text-accent bg-accent/5 hover:bg-accent/10 transition-all"
                            onClick={() => {
                              setNewAppSendTo("applicant");
                              setNewAppEmail(o.client_email);
                              setInstAppNumber(o.application_id || o.reference_id);
                              setNewAppOpen(true);
                            }}>
                            <Mail size={14} /> Email Client
                          </button>
                          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-accent/30 text-xs font-semibold text-accent bg-accent/5 hover:bg-accent/10 transition-all"
                            onClick={() => {
                              setNewAppSendTo("institution");
                              setInstApplicantEmail(o.client_email);
                              setInstAppNumber(o.application_id || o.reference_id);
                              setInstNotes(institutionQuickNote);
                              setNewAppOpen(true);
                            }}>
                            <Send size={14} /> Email Institution
                          </button>
                          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-accent/30 text-xs font-semibold text-accent bg-accent/5 hover:bg-accent/10 transition-all"
                            onClick={() => {
                              const amount = prompt("Enter payment amount for the client (e.g. 150.00):");
                              if (amount && !isNaN(Number(amount))) {
                                const paymentUrl = `${window.location.origin}/payment?amount=${amount}`;
                                navigator.clipboard.writeText(paymentUrl);
                                toast({ title: "Payment Link Copied", description: `Link with $${amount} amount copied to clipboard. You can paste it in an email to the client.` });
                              }
                            }}>
                            <CreditCard size={14} /> Send Payment Link
                          </button>
                          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-border bg-muted/50 text-xs font-semibold text-foreground hover:bg-muted transition-all"
                            onClick={() => handleStartChatWithApplicant(applicantName, o.client_email)}>
                            <MessageCircle size={14} /> Chat with {applicantName}
                          </button>
                          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-destructive/30 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-all"
                            onClick={() => setDeleteDialog({ open: true, deleteType: "client", orderId: o.id, label: `${o.application_id || o.reference_id}`, email: o.client_email })}>
                            <UserX size={14} /> Delete Client
                          </button>
                          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-destructive/30 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-all"
                            onClick={() => setDeleteDialog({ open: true, deleteType: "application", orderId: o.id, label: `${o.application_id || o.reference_id}`, email: o.client_email })}>
                            <Trash2 size={14} /> Delete Application
                          </button>
                          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-destructive text-destructive-foreground text-xs font-semibold hover:bg-destructive/90 transition-all"
                            onClick={() => setDeleteDialog({ open: true, deleteType: "both", orderId: o.id, label: `${o.application_id || o.reference_id}`, email: o.client_email })}>
                            <Trash2 size={14} /> Delete Client & Application
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Share Evaluation Report ── */}
          <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center">
                <FileText size={20} className="text-accent" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Share Evaluation Report</h2>
            </div>
            <form onSubmit={handleShare} className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Recipient Email *</label>
                <Input type="email" placeholder="applicant@email.com or institution@school.edu" value={shareEmail} onChange={(e) => setShareEmail(e.target.value)} required className="rounded-2xl h-12" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">IFCS Reference # *</label>
                <Input placeholder="44507" value={shareRef} onChange={(e) => setShareRef(e.target.value)} required className="rounded-2xl h-12" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Evaluation Type *</label>
                <Select value={shareType} onValueChange={setShareType}>
                  <SelectTrigger className="rounded-2xl h-12"><SelectValue placeholder="Select type" /></SelectTrigger>
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
                <Input type="date" value={shareExpiry} onChange={(e) => setShareExpiry(e.target.value)} required className="rounded-2xl h-12" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-foreground">Upload Evaluation (PDF Only) *</label>
                <Input type="file" accept=".pdf" onChange={(e) => setShareFile(e.target.files?.[0] || null)} className="rounded-2xl" />
              </div>
              <div className="md:col-span-2">
                <button type="submit" className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90 transition-all">
                  <Upload size={16} /> Upload & Share Report
                </button>
              </div>
            </form>
          </div>

          {/* ── Career / Job Listings Management ── */}
          <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <Users size={20} className="text-accent" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Career Listings</h2>
              </div>
              <Button
                className="rounded-full gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={() => {
                  setCareerEditId(null);
                  setCareerTitle(""); setCareerDesc(""); setCareerReqs(""); setCareerLocation("Dobbs Ferry, NY"); setCareerType("Full-time"); setCareerActive(true);
                  setCareerDialogOpen(true);
                }}
              >
                <Plus size={16} /> Add Career
              </Button>
            </div>
            {careerListings.length === 0 ? (
              <p className="text-muted-foreground text-sm">No career listings yet.</p>
            ) : (
              <div className="space-y-4">
                {careerListings.map((job: any) => (
                  <div key={job.id} className="flex items-center justify-between p-4 rounded-2xl border border-border">
                    <div>
                      <p className="font-semibold text-foreground">{job.title}</p>
                      <p className="text-sm text-muted-foreground">{job.location} · {job.type} {!job.is_active && <span className="text-destructive">(Inactive)</span>}</p>
                      <p className="text-xs text-muted-foreground mt-1">Applications: {careerApps.filter((a: any) => a.job_id === job.id).length}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="rounded-full" onClick={() => {
                        setCareerEditId(job.id);
                        setCareerTitle(job.title); setCareerDesc(job.description); setCareerReqs(job.requirements);
                        setCareerLocation(job.location); setCareerType(job.type); setCareerActive(job.is_active);
                        setCareerDialogOpen(true);
                      }}>
                        <Edit3 size={14} />
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-full" onClick={() => {
                        setCareerViewJobId(job.id);
                        setCareerAppsDialogOpen(true);
                      }}>
                        View Applicants
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-full text-destructive" onClick={async () => {
                        await (supabase as any).from("job_listings").delete().eq("id", job.id);
                        setCareerListings((prev: any[]) => prev.filter((j: any) => j.id !== job.id));
                        toast({ title: "Deleted", description: "Job listing removed." });
                      }}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Email Client / Email Institution Dialog ── */}
      <Dialog open={newAppOpen} onOpenChange={setNewAppOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {newAppSendTo === "applicant" ? "Email Client" : "Email Institution"}
            </DialogTitle>
          </DialogHeader>

          {/* Tab selector */}
          <div className="flex gap-2 pb-2 border-b border-border">
            <button
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${newAppSendTo === "applicant" ? "bg-accent text-white" : "border border-border text-foreground hover:bg-muted"}`}
              onClick={() => setNewAppSendTo("applicant")}
            >
              <Mail size={14} className="inline mr-1.5" /> Email Client
            </button>
            <button
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${newAppSendTo === "institution" ? "bg-accent text-white" : "border border-border text-foreground hover:bg-muted"}`}
              onClick={() => setNewAppSendTo("institution")}
            >
              <Send size={14} className="inline mr-1.5" /> Email Institution
            </button>
          </div>

          {/* ── APPLICANT MODE ── */}
          {newAppSendTo === "applicant" && (
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

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-accent">Client Email *</label>
                <Input type="email" value={newAppEmail} onChange={(e) => setNewAppEmail(e.target.value)} placeholder="client@email.com" />
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

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-accent">Subject</label>
                <Input value={emailClientSubject} onChange={(e) => setEmailClientSubject(e.target.value)} placeholder={`IFCS Application Update${instAppNumber ? ` — #${instAppNumber}` : ""}`} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-accent">Message</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {quickNotes.map((qn) => (
                    <Button key={qn} type="button" size="sm" variant="outline" className="gap-1 text-xs rounded-full border-accent/40 text-accent hover:bg-accent/10"
                      onClick={() => setNewAppNotes(prev => prev ? `${prev}\n${qn}` : qn)}>
                      <Plus size={10} /> {qn}
                    </Button>
                  ))}
                </div>
                <Textarea value={newAppNotes} onChange={(e) => setNewAppNotes(e.target.value)} placeholder="Type your message to the client..." rows={8} />
              </div>

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
                <Button variant="outline" onClick={() => setNewAppOpen(false)} className="rounded-full">Cancel</Button>
                <Button onClick={async () => {
                  if (!newAppEmail.trim()) {
                    toast({ title: "Missing Email", description: "Please enter the client's email.", variant: "destructive" });
                    return;
                  }
                  // Upload attachments
                  const attachmentUrls: string[] = [];
                  for (const file of instAttachments) {
                    const filePath = `client-emails/${instAppNumber || "general"}-${Date.now()}-${file.name}`;
                    const { error: upErr } = await supabase.storage.from("evaluation-reports").upload(filePath, file);
                    if (!upErr) {
                      const { data: urlData } = supabase.storage.from("evaluation-reports").getPublicUrl(filePath);
                      attachmentUrls.push(urlData.publicUrl);
                    }
                  }
                  const attachmentLinks = attachmentUrls.length > 0 ? `\n\nAttached files:\n${attachmentUrls.map((url, i) => `${i + 1}. ${url}`).join("\n")}` : "";
                  const emailBody = `${newAppNotes}${attachmentLinks}`;
                  const allCc = instCcEmails.filter(e => e.trim());

                  try {
                    await supabase.functions.invoke("send-application-email", {
                      body: {
                        subject: emailClientSubject.trim() || `IFCS Application Update${instAppNumber ? ` — #${instAppNumber}` : ""}`,
                        body: emailBody,
                        recipientEmail: newAppEmail.trim(),
                        applicantEmail: allCc.length > 0 ? allCc.join(",") : undefined,
                      },
                    });
                    toast({ title: "Email Sent", description: `Email sent to ${newAppEmail.trim()}.` });
                  } catch {
                    toast({ title: "Send Failed", variant: "destructive" });
                  }
                  resetNewAppForm();
                }} className="gap-2 bg-accent text-white hover:bg-accent/90 rounded-full">
                  <Send size={16} /> Send Email
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
                <Button variant="outline" onClick={() => setNewAppOpen(false)} className="rounded-full">Cancel</Button>
                <Button onClick={handleInstitutionSend} className="gap-2 bg-accent text-white hover:bg-accent/90 rounded-full">
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
              {deleteDialog.deleteType === "client" && (
                <>Are you sure you want to delete the <strong>client account</strong> associated with <strong>{deleteDialog.label}</strong>? This action cannot be undone.</>
              )}
              {deleteDialog.deleteType === "application" && (
                <>Are you sure you want to delete application <strong>{deleteDialog.label}</strong>? The client account will remain. This action cannot be undone.</>
              )}
              {deleteDialog.deleteType === "both" && (
                <>Are you sure you want to delete application <strong>{deleteDialog.label}</strong> and the associated client account? This action cannot be undone.</>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(prev => ({ ...prev, open: false }))}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} className="gap-1"><Trash2 size={14} /> Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Application Dialog */}
      <Dialog open={editAppOpen} onOpenChange={setEditAppOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Edit Application — {editAppData?.application_id}</DialogTitle>
            <DialogDescription>Update application details. The client will be notified of changes.</DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-accent">First Name</label>
                <Input value={editFields.first_name} onChange={e => setEditFields(p => ({ ...p, first_name: e.target.value }))} className="rounded-full" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-accent">Middle Name</label>
                <Input value={editFields.middle_name} onChange={e => setEditFields(p => ({ ...p, middle_name: e.target.value }))} className="rounded-full" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-accent">Last Name</label>
                <Input value={editFields.last_name} onChange={e => setEditFields(p => ({ ...p, last_name: e.target.value }))} className="rounded-full" />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-accent">Date of Birth</label>
                <Input value={editFields.dob} onChange={e => setEditFields(p => ({ ...p, dob: e.target.value }))} className="rounded-full" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-accent">Gender</label>
                <Select value={editFields.gender} onValueChange={v => setEditFields(p => ({ ...p, gender: v }))}>
                  <SelectTrigger className="rounded-full"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-accent">IFCS ID</label>
                <Input value={editFields.ifcs_id} onChange={e => setEditFields(p => ({ ...p, ifcs_id: e.target.value }))} className="rounded-full" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-accent">Cell Phone</label>
                <Input value={editFields.cell_phone} onChange={e => setEditFields(p => ({ ...p, cell_phone: e.target.value }))} className="rounded-full" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-accent">Home Phone</label>
                <Input value={editFields.home_phone} onChange={e => setEditFields(p => ({ ...p, home_phone: e.target.value }))} className="rounded-full" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-accent">Service</label>
                <Select value={editFields.service_title} onValueChange={v => setEditFields(p => ({ ...p, service_title: v }))}>
                  <SelectTrigger className="rounded-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General Analysis">General Analysis</SelectItem>
                    <SelectItem value="General Analysis + GPA">General Analysis + GPA</SelectItem>
                    <SelectItem value="Course-by-Course">Course-by-Course</SelectItem>
                    <SelectItem value="Health Professions Course-by-Course">Health Professions Course-by-Course</SelectItem>
                    <SelectItem value="Comprehensive Course-by-Course">Comprehensive Course-by-Course</SelectItem>
                    <SelectItem value="High School and University Course-by-Course">HS & University Course-by-Course</SelectItem>
                    <SelectItem value="Professional Licensure Course-by-Course">Professional Licensure Course-by-Course</SelectItem>
                    <SelectItem value="Cosmetology Course-by-Course">Cosmetology Course-by-Course</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-accent">Processing Speed</label>
                <Select value={editFields.processing_label} onValueChange={v => setEditFields(p => ({ ...p, processing_label: v }))}>
                  <SelectTrigger className="rounded-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Rush 3-Day">Rush 3-Day</SelectItem>
                    <SelectItem value="Rush 24hr">Rush 24hr</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-accent">Status</label>
                <Select value={editFields.status} onValueChange={v => setEditFields(p => ({ ...p, status: v }))}>
                  <SelectTrigger className="rounded-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusMeta).map(([key, val]) => (
                      <SelectItem key={key} value={key}>{val.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-accent">Evaluator</label>
                <Select value={editFields.evaluator} onValueChange={v => setEditFields(p => ({ ...p, evaluator: v }))}>
                  <SelectTrigger className="rounded-full"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {evaluators.map(ev => <SelectItem key={ev} value={ev}>{ev}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-accent">Verification Source</label>
                <Select value={editFields.verification_source} onValueChange={v => setEditFields(p => ({ ...p, verification_source: v }))}>
                  <SelectTrigger className="rounded-full"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {verificationSources.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-accent">Country</label>
                <Input value={editFields.country} onChange={e => setEditFields(p => ({ ...p, country: e.target.value }))} className="rounded-full" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-accent">Institution Name</label>
                <Input value={editFields.institution_name} onChange={e => setEditFields(p => ({ ...p, institution_name: e.target.value }))} className="rounded-full" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-accent">Staff Notes</label>
              <Textarea value={editFields.staff_notes} onChange={e => setEditFields(p => ({ ...p, staff_notes: e.target.value }))} rows={4} />
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setEditAppOpen(false)} className="rounded-full">Cancel</Button>
              <Button onClick={handleSaveEdit} className="gap-2 bg-accent text-white hover:bg-accent/90 rounded-full">
                Save Changes
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Confirmation Dialog */}
      <Dialog open={saveConfirmOpen} onOpenChange={setSaveConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Changes</DialogTitle>
            <DialogDescription>Are you sure you want to save these changes? The client will be notified.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setSaveConfirmOpen(false)} className="rounded-full">Cancel</Button>
            <Button onClick={confirmSaveEdit} className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* ── Career Add/Edit Dialog ── */}
      <Dialog open={careerDialogOpen} onOpenChange={setCareerDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{careerEditId ? "Edit Job Listing" : "Add Job Listing"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-sm font-medium">Title *</Label><Input value={careerTitle} onChange={e => setCareerTitle(e.target.value)} placeholder="e.g. Junior Evaluator" /></div>
            <div><Label className="text-sm font-medium">Description *</Label><Textarea rows={4} value={careerDesc} onChange={e => setCareerDesc(e.target.value)} /></div>
            <div><Label className="text-sm font-medium">Requirements</Label><Textarea rows={3} value={careerReqs} onChange={e => setCareerReqs(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-sm font-medium">Location</Label><Input value={careerLocation} onChange={e => setCareerLocation(e.target.value)} /></div>
              <div><Label className="text-sm font-medium">Type</Label>
                <Select value={careerType} onValueChange={setCareerType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem><SelectItem value="Part-time">Part-time</SelectItem><SelectItem value="Contract">Contract</SelectItem><SelectItem value="Internship">Internship</SelectItem>
                </SelectContent></Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={careerActive} onChange={e => setCareerActive(e.target.checked)} id="career-active" />
              <Label htmlFor="career-active">Active (visible to applicants)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCareerDialogOpen(false)} className="rounded-full">Cancel</Button>
            <Button className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={async () => {
              if (!careerTitle || !careerDesc) { toast({ title: "Missing fields", variant: "destructive" }); return; }
              if (careerEditId) {
                await (supabase as any).from("job_listings").update({ title: careerTitle, description: careerDesc, requirements: careerReqs, location: careerLocation, type: careerType, is_active: careerActive, updated_at: new Date().toISOString() }).eq("id", careerEditId);
                setCareerListings((prev: any[]) => prev.map((j: any) => j.id === careerEditId ? { ...j, title: careerTitle, description: careerDesc, requirements: careerReqs, location: careerLocation, type: careerType, is_active: careerActive } : j));
              } else {
                const { data } = await (supabase as any).from("job_listings").insert({ title: careerTitle, description: careerDesc, requirements: careerReqs, location: careerLocation, type: careerType, is_active: careerActive }).select().single();
                if (data) setCareerListings((prev: any[]) => [data, ...prev]);
              }
              setCareerDialogOpen(false);
              toast({ title: careerEditId ? "Job Updated" : "Job Created" });
            }}>
              {careerEditId ? "Save Changes" : "Create Listing"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── View Applicants Dialog ── */}
      <Dialog open={careerAppsDialogOpen} onOpenChange={setCareerAppsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Applicants for {careerListings.find((j: any) => j.id === careerViewJobId)?.title || "Job"}</DialogTitle>
          </DialogHeader>
          {careerApps.filter((a: any) => a.job_id === careerViewJobId).length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">No applications yet.</p>
          ) : (
            <div className="space-y-4">
              {careerApps.filter((a: any) => a.job_id === careerViewJobId).map((app: any) => (
                <div key={app.id} className="border border-border rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-foreground">{app.first_name} {app.last_name}</p>
                      <p className="text-sm text-muted-foreground">{app.applicant_email}</p>
                      {app.phone && <p className="text-sm text-muted-foreground">{app.phone}</p>}
                    </div>
                    <Badge variant="secondary">{app.status}</Badge>
                  </div>
                  {app.resume_url && <a href={app.resume_url} target="_blank" rel="noreferrer" className="text-accent text-sm hover:underline mt-2 inline-block">View Resume</a>}
                  {app.work_experience && <div className="mt-2"><p className="text-xs font-semibold text-muted-foreground">Work Experience</p><p className="text-sm text-foreground">{app.work_experience}</p></div>}
                  {app.education && <div className="mt-2"><p className="text-xs font-semibold text-muted-foreground">Education</p><p className="text-sm text-foreground">{app.education}</p></div>}
                  {app.languages && <div className="mt-2"><p className="text-xs font-semibold text-muted-foreground">Languages</p><p className="text-sm text-foreground">{app.languages}</p></div>}
                  <div className="mt-3 flex gap-2">
                    <Select defaultValue={app.status} onValueChange={async (v) => {
                      await (supabase as any).from("job_applications").update({ status: v }).eq("id", app.id);
                      setCareerApps((prev: any[]) => prev.map((a: any) => a.id === app.id ? { ...a, status: v } : a));
                    }}>
                      <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="reviewing">Reviewing</SelectItem>
                        <SelectItem value="interview">Interview</SelectItem>
                        <SelectItem value="hired">Hired</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>


      <Footer />
    </div>
  );
};

export default StaffDashboard;
