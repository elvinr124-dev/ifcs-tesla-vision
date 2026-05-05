import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToHome from "@/components/BackToHome";
import LiveChatWidget from "@/components/LiveChatWidget";
import ViewApplicationDialog from "@/components/ViewApplicationDialog";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FileText, Download, RefreshCw, Clock, CheckCircle2, AlertCircle, Package,
  MessageSquare, ShieldCheck, Plus, Languages, Upload, ChevronDown, ChevronUp, Eye,
  Search, Headphones, CreditCard,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/* ---------- types ---------- */
interface ClientOrder {
  id: string;
  reference_id: string;
  client_email: string;
  service: string;
  status: string;
  staff_note: string;
  requirements: any[];
  submitted_at: string;
  application_id?: string;
  ifcs_id?: string;
  dob?: string;
}

interface DBReport {
  id: string;
  reference_id: string;
  applicant_email: string;
  evaluation_type: string;
  created_at: string;
  expiry_date: string | null;
  status: string;
  access_token: string;
  report_file_url: string | null;
}

interface ApplicationData {
  id: string;
  application_id: string;
  application_data: any;
  staff_notes: string;
  receipt_url?: string;
  ifcs_id?: string;
}

const addOns = [
  { id: "addon-duplicate", label: "Duplicate Report", price: 25, link: "/duplicate-reports" },
  { id: "addon-renewal", label: "Renewal (5 Years)", price: 100, link: "/addon/renewal" },
];

const statusMeta: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  requested:    { label: "Requested",            color: "bg-muted text-muted-foreground",       icon: <Clock size={14} /> },
  in_process:   { label: "In Process",           color: "bg-blue-500/20 text-blue-600",         icon: <Package size={14} /> },
  in_review:    { label: "In Review",            color: "bg-accent/20 text-accent",             icon: <Package size={14} /> },
  need_info:    { label: "Need Additional Info", color: "bg-amber-500/20 text-amber-600",       icon: <AlertCircle size={14} /> },
  on_hold:      { label: "On Hold",              color: "bg-destructive/20 text-destructive",   icon: <AlertCircle size={14} /> },
  completed:    { label: "Completed",            color: "bg-emerald-500/20 text-emerald-600",   icon: <CheckCircle2 size={14} /> },
  delivered:    { label: "Delivered",             color: "bg-emerald-500/20 text-emerald-600",   icon: <CheckCircle2 size={14} /> },
};

const statusSteps = ["requested", "in_process", "in_review", "need_info", "on_hold", "completed", "delivered"];

const reportStatusColor: Record<string, string> = {
  active:  "text-emerald-500",
  pending: "text-amber-500",
  expired: "text-destructive",
};

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const days = Array.from({ length: 31 }, (_, i) => i + 1);
const years = Array.from({ length: 116 }, (_, i) => 2015 - i);

const GlassSelect = ({ value, onChange, children }: { value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode }) => (
  <select value={value} onChange={onChange}
    className="w-full h-10 px-3 rounded-xl text-sm text-foreground bg-muted/60 border border-border focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-accent transition-all duration-200 appearance-none backdrop-blur-sm">
    {children}
  </select>
);

type DashSection = "eval_orders" | "trans_orders" | "eval_reports" | "trans_reports" | "payments" | "track_order" | "live_chat";

const sectionOptions: { value: DashSection; label: string; icon: React.ReactNode }[] = [
  { value: "eval_orders", label: "Evaluation Orders", icon: <Package size={18} /> },
  { value: "trans_orders", label: "Translation Orders", icon: <Languages size={18} /> },
  { value: "eval_reports", label: "Shared Evaluation Reports", icon: <ShieldCheck size={18} /> },
  { value: "trans_reports", label: "Shared Translation Reports", icon: <Languages size={18} /> },
  { value: "payments", label: "Payments", icon: <CreditCard size={18} /> },
  { value: "track_order", label: "Track Order", icon: <Search size={18} /> },
  { value: "live_chat", label: "Contact Agent", icon: <Headphones size={18} /> },
];

// Render staff notes — turns 📎 Attachment URLs into clickable buttons
const StaffNoteContent = ({ text }: { text: string }) => {
  if (!text) return null;
  const lines = text.split("\n");
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        const m = line.match(/^📎\s*(?:Attachment:\s*)?(.+?)\s*-\s*(https?:\/\/\S+)\s*$/);
        if (m) {
          const [, name, url] = m;
          return (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-accent/30 bg-accent/5 text-accent text-sm font-medium hover:bg-accent/10 transition-all"
            >
              <FileText size={14} /> {name}
              <Download size={12} />
            </a>
          );
        }
        // Inline URL → clickable link
        const urlRx = /(https?:\/\/\S+)/g;
        if (urlRx.test(line)) {
          const parts = line.split(urlRx);
          return (
            <p key={i} className="text-sm text-muted-foreground whitespace-pre-wrap">
              {parts.map((p, j) =>
                /^https?:\/\//.test(p) ? (
                  <a key={j} href={p} target="_blank" rel="noopener noreferrer" className="text-accent underline break-all">{p}</a>
                ) : (
                  <span key={j}>{p}</span>
                )
              )}
            </p>
          );
        }
        return <p key={i} className="text-sm text-muted-foreground whitespace-pre-wrap">{line}</p>;
      })}
    </div>
  );
};

const ClientDashboard = () => {
  const { user } = useAuth();
  const { translate } = useLocale();
  const { toast } = useToast();
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [dbReports, setDbReports] = useState<DBReport[]>([]);
  const [activeSection, setActiveSection] = useState<DashSection>("eval_orders");
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);

  // Track order inputs
  const [trackType, setTrackType] = useState<"evaluation" | "translation">("evaluation");
  const [trackId, setTrackId] = useState("");
  const [trackDobMonth, setTrackDobMonth] = useState("");
  const [trackDobDay, setTrackDobDay] = useState("");
  const [trackDobYear, setTrackDobYear] = useState("");
  const [trackZip, setTrackZip] = useState("");
  const [tracking, setTracking] = useState(false);

  // View application dialog
  const [viewAppOpen, setViewAppOpen] = useState(false);
  const [viewAppData, setViewAppData] = useState<any>(null);
  const [viewAppId, setViewAppId] = useState("");

  // Application data cache
  const [appDataMap, setAppDataMap] = useState<Record<string, ApplicationData>>({});

  const clientEmail = user?.email || user?.username || "";

  // Helper to load application data for a set of orders
  const loadAppDataForOrders = async (ordersList: ClientOrder[]) => {
    const appIds = ordersList.filter((o: any) => o.application_id).map((o: any) => o.application_id);
    if (appIds.length > 0) {
      const { data: apps } = await (supabase as any)
        .from("applications")
        .select("id, application_id, application_data, staff_notes, receipt_url, ifcs_id")
        .in("application_id", appIds);
      if (apps) {
        const map: Record<string, ApplicationData> = {};
        apps.forEach((a: ApplicationData) => { map[a.application_id] = a; });
        setAppDataMap(prev => ({ ...prev, ...map }));
      }
    }
  };

  // Load orders from DB
  useEffect(() => {
    if (!clientEmail) return;

    const loadOrders = async () => {
      const { data } = await (supabase as any)
        .from("client_orders")
        .select("*")
        .eq("client_email", clientEmail)
        .order("created_at", { ascending: false });
      if (data) {
        setOrders(data);
        await loadAppDataForOrders(data);
      }
    };
    loadOrders();

    // Realtime for order updates
    const channel = supabase
      .channel("client-orders-rt")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "client_orders",
      }, (payload) => {
        if (payload.eventType === "INSERT") {
          const newOrder = payload.new as ClientOrder;
          if (newOrder.client_email === clientEmail) {
            setOrders(prev => [newOrder, ...prev]);
          }
        } else if (payload.eventType === "UPDATE") {
          const updated = payload.new as ClientOrder;
          setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
        } else if (payload.eventType === "DELETE") {
          const deleted = payload.old as any;
          setOrders(prev => prev.filter(o => o.id !== deleted.id));
        }
      })
      .subscribe();

    // Realtime for application staff_notes updates
    const appChannel = supabase
      .channel("client-app-notes")
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "applications",
      }, (payload) => {
        const updated = payload.new as any;
        setAppDataMap(prev => ({
          ...prev,
          [updated.application_id]: { ...prev[updated.application_id], ...updated },
        }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(appChannel);
    };
  }, [clientEmail]);

  // Payment requests for this client
  useEffect(() => {
    if (!clientEmail) return;
    const load = async () => {
      const { data } = await (supabase as any)
        .from("payment_requests")
        .select("*")
        .eq("client_email", clientEmail.toLowerCase())
        .order("created_at", { ascending: false });
      if (data) setPaymentRequests(data);
    };
    load();
    const ch = supabase
      .channel("client-payments-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "payment_requests" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [clientEmail]);

  // Load reports from database
  useEffect(() => {
    if (!clientEmail) return;

    const loadReports = async () => {
      const { data } = await (supabase as any)
        .from("evaluation_reports")
        .select("*")
        .eq("applicant_email", clientEmail)
        .order("created_at", { ascending: false });
      if (data) setDbReports(data as DBReport[]);
    };
    loadReports();

    const channel = supabase
      .channel("client-reports")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "evaluation_reports",
      }, (payload) => {
        const newReport = payload.new as DBReport;
        if (newReport.applicant_email === clientEmail) {
          setDbReports(prev => [newReport, ...prev]);
          toast({ title: "New Report Available", description: "A new evaluation report has been shared with you." });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [clientEmail]);

  // Track order handler
  const handleTrackOrder = async () => {
    if (!trackId.trim()) return;

    const isTranslation = trackType === "translation";

    if (isTranslation) {
      if (!trackZip.trim()) {
        toast({ title: "Zip Code Required", description: "Please enter the zip code used in your translation order.", variant: "destructive" });
        return;
      }
    } else {
      if (!trackDobMonth || !trackDobDay || !trackDobYear) {
        toast({ title: "Date of Birth Required", description: "Please enter your date of birth to verify your identity.", variant: "destructive" });
        return;
      }
    }
    setTracking(true);

    const searchVal = trackId.trim();

    if (isTranslation) {
      // For translations, search by app ID and verify zip from application_data
      const { data: app } = await (supabase as any)
        .from("applications")
        .select("*")
        .or(`application_id.eq.${searchVal},ifcs_id.eq.${searchVal}`)
        .maybeSingle();

      if (app) {
        const appZip = app.application_data?.zip || "";
        if (appZip.trim() !== trackZip.trim()) {
          toast({ title: "Verification Failed", description: "The zip code doesn't match. Please try again.", variant: "destructive" });
          setTracking(false);
          return;
        }
        const existing = orders.find(o => o.application_id === app.application_id);
        if (existing) {
          toast({ title: "Already Tracked", description: "This order is already in your dashboard.", variant: "destructive" });
          setTracking(false);
          return;
        }
        const { data: newOrder } = await (supabase as any)
          .from("client_orders")
          .insert({
            reference_id: app.application_id,
            client_email: clientEmail,
            service: `${app.service_title || ""} — ${app.processing_label || ""}`,
            status: app.status || "requested",
            application_id: app.application_id,
            dob: "",
            ifcs_id: app.ifcs_id || null,
          })
          .select()
          .single();
        if (newOrder) {
          setOrders(prev => [newOrder, ...prev]);
          setAppDataMap(prev => ({
            ...prev,
            [app.application_id]: { id: app.id, application_id: app.application_id, application_data: app.application_data, staff_notes: app.staff_notes, receipt_url: app.receipt_url, ifcs_id: app.ifcs_id },
          }));
          toast({ title: "Order Found", description: `Order #${searchVal} has been added to your dashboard.` });
        }
      } else {
        toast({ title: "Order Not Found", description: "No translation order matches the provided ID and zip code.", variant: "destructive" });
      }
      setTrackId(""); setTrackZip(""); setTracking(false);
      return;
    }

    // Evaluation tracking (DOB-based)
    const monthIdx = months.indexOf(trackDobMonth) + 1;
    const dobFormatted = `${String(monthIdx).padStart(2, "0")}/${String(trackDobDay).padStart(2, "0")}/${String(trackDobYear).slice(-2)}`;

    // First try client_orders by reference_id
    let { data: found } = await (supabase as any)
      .from("client_orders")
      .select("*")
      .or(`reference_id.eq.${searchVal},application_id.eq.${searchVal}`)
      .eq("dob", dobFormatted)
      .maybeSingle();

    // If not found, try applications table
    if (!found) {
      const { data: app } = await (supabase as any)
        .from("applications")
        .select("*")
        .or(`application_id.eq.${searchVal}`)
        .eq("dob", dobFormatted)
        .maybeSingle();

      if (app) {
        // Check if already in orders for THIS client
        const existing = orders.find(o => o.application_id === app.application_id || o.reference_id === app.application_id);
        if (existing) {
          toast({ title: "Already Tracked", description: "This order is already in your dashboard.", variant: "destructive" });
          setTracking(false);
          return;
        }

        // Create a client_orders entry for this client (even if different account)
        const { data: newOrder } = await (supabase as any)
          .from("client_orders")
          .insert({
            reference_id: app.application_id,
            client_email: clientEmail,
            service: `${app.service_title} — ${app.processing_label}`,
            status: app.status || "requested",
            application_id: app.application_id,
            dob: dobFormatted,
            ifcs_id: app.ifcs_id || null,
          })
          .select()
          .single();

        if (newOrder) {
          setOrders(prev => [newOrder, ...prev]);
          // Load app data for this tracked order
          setAppDataMap(prev => ({
            ...prev,
            [app.application_id]: {
              id: app.id,
              application_id: app.application_id,
              application_data: app.application_data,
              staff_notes: app.staff_notes,
              receipt_url: app.receipt_url,
              ifcs_id: app.ifcs_id,
            },
          }));
          toast({ title: "Order Found", description: `Order #${searchVal} has been added to your dashboard.` });
        }
      } else {
        // Also try by ifcs_id in applications
        const { data: appByIfcs } = await (supabase as any)
          .from("applications")
          .select("*")
          .eq("ifcs_id", searchVal)
          .eq("dob", dobFormatted)
          .maybeSingle();

        if (appByIfcs) {
          const existing = orders.find(o => o.application_id === appByIfcs.application_id);
          if (existing) {
            toast({ title: "Already Tracked", description: "This order is already in your dashboard.", variant: "destructive" });
            setTracking(false);
            return;
          }

          const { data: newOrder } = await (supabase as any)
            .from("client_orders")
            .insert({
              reference_id: appByIfcs.application_id,
              client_email: clientEmail,
              service: `${appByIfcs.service_title} — ${appByIfcs.processing_label}`,
              status: appByIfcs.status || "requested",
              application_id: appByIfcs.application_id,
              dob: dobFormatted,
              ifcs_id: appByIfcs.ifcs_id || null,
            })
            .select()
            .single();

          if (newOrder) {
            setOrders(prev => [newOrder, ...prev]);
            setAppDataMap(prev => ({
              ...prev,
              [appByIfcs.application_id]: {
                id: appByIfcs.id,
                application_id: appByIfcs.application_id,
                application_data: appByIfcs.application_data,
                staff_notes: appByIfcs.staff_notes,
                receipt_url: appByIfcs.receipt_url,
                ifcs_id: appByIfcs.ifcs_id,
              },
            }));
            toast({ title: "Order Found", description: `Order #${searchVal} has been added to your dashboard.` });
          }
        } else {
          toast({ title: "Order Not Found", description: "No order matches the provided ID and date of birth. Please check and try again.", variant: "destructive" });
        }
      }
    } else {
      // Already exists check
      const existing = orders.find(o => o.id === found.id);
      if (existing) {
        toast({ title: "Already Tracked", description: "This order is already in your dashboard.", variant: "destructive" });
      } else {
        setOrders(prev => [found, ...prev]);
        // Load app data for this found order
        if (found.application_id) {
          await loadAppDataForOrders([found]);
        }
        toast({ title: "Order Found", description: `Order #${searchVal} has been added to your dashboard.` });
      }
    }

    setTrackId("");
    setTrackDobMonth("");
    setTrackDobDay("");
    setTrackDobYear("");
    setTrackZip("");
    setTracking(false);
  };

  // View application — merge staff edits into application_data for latest view
  const handleViewApplication = async (appId: string) => {
    // Always fetch latest from DB to ensure we have staff edits
    const { data: app } = await (supabase as any)
      .from("applications")
      .select("*")
      .eq("application_id", appId)
      .maybeSingle();
    if (app) {
      // Merge top-level columns into application_data so ViewApplicationDialog shows latest
      const merged = {
        ...(app.application_data || {}),
        firstName: app.first_name,
        lastName: app.last_name,
        middleName: app.middle_name,
        dob: app.dob,
        gender: app.gender,
        cellPhone: app.cell_phone,
        homePhone: app.home_phone,
        email: app.client_email,
        country: app.country,
        institutionName: app.institution_name,
        attendance: app.attendance,
        degrees: app.degrees,
        purpose: app.purpose,
        serviceTitle: app.service_title,
        processingTime: app.processing_time || app.processing_label,
        translationOption: app.translation_option,
        authOption: app.auth_option,
        deliveryOptions: app.delivery_options,
        totalPrice: app.total_price,
        paymentMethod: app.payment_method,
        cardLastFour: app.card_last_four,
        ifcsId: app.ifcs_id,
        staffNotes: app.staff_notes,
        // For translations
        fullName: app.first_name ? `${app.first_name} ${app.last_name}` : (app.application_data?.fullName || ""),
        phone: app.cell_phone || app.application_data?.phone,
      };
      setViewAppData(merged);
      setViewAppId(appId);
      setViewAppOpen(true);
      // Update cache
      setAppDataMap(prev => ({
        ...prev,
        [appId]: { ...prev[appId], ...app, application_data: merged },
      }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-28 pb-14 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex items-center gap-5 mb-2">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 flex items-center justify-center shadow-sm">
            <ShieldCheck size={28} className="text-accent" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              {translate("Welcome")}{user?.firstName ? `, ${user.firstName}` : ""} 👋
            </h1>
            <p className="text-muted-foreground mt-1 text-base">{translate("Applicant Dashboard")}</p>
          </div>
        </div>
      </section>

      <div className="content-bg">
        <div className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
          <div className="flex gap-8">
            {/* ── Left Sidebar Navigation ── */}
            <aside className="hidden md:flex flex-col w-64 shrink-0 sticky top-28 self-start space-y-2">
              {sectionOptions.map((opt) => {
                const isActive = activeSection === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setActiveSection(opt.value)}
                    className={`flex items-center gap-3 w-full px-5 py-4 rounded-2xl text-left transition-all duration-200 ${
                      isActive
                        ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20"
                        : "bg-card border border-border text-foreground hover:bg-accent/10 hover:border-accent/40"
                    }`}
                  >
                    <div className={`${isActive ? "text-accent-foreground" : "text-accent"}`}>
                      {opt.icon}
                    </div>
                    <span className="text-sm font-semibold">{translate(opt.label)}</span>
                  </button>
                );
              })}
            </aside>

            {/* Mobile section selector */}
            <div className="md:hidden w-full mb-6">
              <div className="flex overflow-x-auto gap-2 pb-2">
                {sectionOptions.map((opt) => {
                  const isActive = activeSection === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setActiveSection(opt.value)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all ${
                        isActive
                          ? "bg-accent text-accent-foreground shadow-md"
                          : "bg-card border border-border text-foreground"
                      }`}
                    >
                      {opt.icon}
                      {translate(opt.label)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Main Content Area ── */}
            <div className="flex-1 min-w-0 space-y-8">

          {/* ── Track Order ── */}
          {activeSection === "track_order" && (
            <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <Search size={20} className="text-accent" />
                </div>
                <h2 className="text-xl font-bold text-foreground">{translate("Track Order")}</h2>
              </div>

              {/* Track type toggle */}
              <div className="flex gap-2 mb-5">
                <button
                  onClick={() => setTrackType("evaluation")}
                  className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                    trackType === "evaluation"
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {translate("Evaluation")}
                </button>
                <button
                  onClick={() => setTrackType("translation")}
                  className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                    trackType === "translation"
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {translate("Translation")}
                </button>
              </div>

              <p className="text-sm text-muted-foreground mb-5">
                {trackType === "evaluation"
                  ? translate("Enter your IFCS ID or Application ID and date of birth to track your evaluation order.")
                  : translate("Enter your IFCS ID (e.g. 4407) or App ID (e.g. TEV1234) and the zip code from your translation order.")}
              </p>
              <div className="space-y-4">
                <Input
                  value={trackId}
                  onChange={(e) => setTrackId(e.target.value)}
                  placeholder={trackType === "evaluation" ? "IFCS ID (e.g. 44507) or App ID (e.g. EE0098)" : "IFCS ID (e.g. 4407) or App ID (e.g. TEV1234)"}
                  className="max-w-sm rounded-2xl h-12"
                />
                {trackType === "evaluation" ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">{translate("Date of Birth")}</p>
                  <div className="grid grid-cols-3 gap-3 max-w-sm">
                    <GlassSelect value={trackDobMonth} onChange={(e) => setTrackDobMonth(e.target.value)}>
                      <option value="">Month</option>
                      {months.map(m => <option key={m} value={m}>{m}</option>)}
                    </GlassSelect>
                    <GlassSelect value={trackDobDay} onChange={(e) => setTrackDobDay(e.target.value)}>
                      <option value="">Day</option>
                      {days.map(d => <option key={d} value={d}>{d}</option>)}
                    </GlassSelect>
                    <GlassSelect value={trackDobYear} onChange={(e) => setTrackDobYear(e.target.value)}>
                      <option value="">Year</option>
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </GlassSelect>
                  </div>
                </div>
                ) : (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">{translate("Zip Code")}</p>
                  <Input
                    value={trackZip}
                    onChange={(e) => setTrackZip(e.target.value)}
                    placeholder="e.g. 33026"
                    className="max-w-sm rounded-2xl h-12"
                  />
                </div>
                )}
                <button onClick={handleTrackOrder} disabled={tracking || !trackId.trim()}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  <Search size={16} /> {tracking ? translate("Searching...") : translate("Track Order")}
                </button>
              </div>
            </div>
          )}

          {/* ── Live Chat / Contact Agent ── */}
          {activeSection === "live_chat" && (
            <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <Headphones size={20} className="text-accent" />
                </div>
                <h2 className="text-xl font-bold text-foreground">{translate("Contact an IFCS Agent")}</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                {translate("Start a live chat with an IFCS agent for real-time support. You can also reach us at")} 📞 <span className="font-semibold text-foreground">(914) 693-2840</span>
              </p>
              <button
                onClick={() => {
                  // Programmatically click the floating Contact Agent button
                  const btn = document.querySelector('[data-live-chat-trigger]') as HTMLButtonElement;
                  if (btn) btn.click();
                }}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90 transition-all shadow-lg shadow-accent/20"
              >
                <Headphones size={18} /> {translate("Start Live Chat")}
              </button>
            </div>
          )}


          {activeSection === "eval_orders" && (
          <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center">
                <Package size={20} className="text-accent" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{translate("Evaluation Orders")}</h2>
            </div>
            <div className="space-y-4">
              {orders.filter(o => !o.application_id?.startsWith("T")).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {translate("No evaluation orders yet.")}
                </p>
              )}
              {orders.filter(o => !o.application_id?.startsWith("T")).map((order) => {
                const meta = statusMeta[order.status] ?? statusMeta.requested;
                const isExpanded = expandedOrder === order.id;
                const currentIdx = statusSteps.indexOf(order.status);
                const requirements = Array.isArray(order.requirements) ? order.requirements : [];
                const hasAppData = order.application_id ? appDataMap[order.application_id] : null;
                const staffNotes = order.application_id ? appDataMap[order.application_id]?.staff_notes : null;
                const receiptUrl = order.application_id ? appDataMap[order.application_id]?.receipt_url : null;

                return (
                  <div key={order.id} className="rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <button
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                      className="w-full flex items-center justify-between p-5 hover:bg-muted/20 transition-colors text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          {order.application_id && <p className="font-bold text-foreground">App ID {order.application_id}</p>}
                          {(order.ifcs_id || hasAppData?.ifcs_id) && (
                            <p className="font-bold text-accent">— IFCS ID {order.ifcs_id || hasAppData?.ifcs_id}</p>
                          )}
                          {!order.application_id && <p className="font-bold text-foreground">#{order.reference_id}</p>}
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${meta.color}`}>
                            {meta.icon} {meta.label}
                          </span>
                        </div>
                        {order.service && <p className="text-sm text-muted-foreground mt-1.5 truncate">{order.service}</p>}
                        <p className="text-xs text-muted-foreground mt-0.5">Added {new Date(order.submitted_at).toLocaleDateString()}</p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        {isExpanded ? <ChevronUp size={20} className="text-muted-foreground" /> : <ChevronDown size={20} className="text-muted-foreground" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-border p-5 space-y-6">
                        <div className="flex flex-wrap gap-2">
                          {hasAppData && (
                            <button
                              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent/90 transition-all"
                              onClick={() => handleViewApplication(order.application_id!)}
                            >
                              <Eye size={14} /> {translate("View Application")}
                            </button>
                          )}
                          {receiptUrl && (
                            <button
                              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-border bg-muted/50 text-foreground text-xs font-semibold hover:bg-muted transition-all"
                              onClick={() => window.open(receiptUrl, "_blank")}
                            >
                              <FileText size={14} /> {translate("View Receipt")}
                            </button>
                          )}
                        </div>

                        <div>
                          <p className="text-sm font-medium text-foreground mb-3">{translate("Track Order")}</p>
                          <div className="flex items-center gap-2">
                            {statusSteps.map((s, i) => {
                              const filled = i <= currentIdx;
                              const label = statusMeta[s]?.label;
                              return (
                                <div key={s} className="flex-1 text-center">
                                  <div className={`h-2 rounded-full transition-colors ${filled ? "bg-accent" : "bg-muted"}`} />
                                  <p className={`text-[10px] mt-1 ${filled ? "text-accent font-medium" : "text-muted-foreground"}`}>{label}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {(order.staff_note || staffNotes) && (
                          <div className="rounded-xl border border-border p-5 bg-muted/20">
                            <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                              <MessageSquare size={16} className="text-accent" /> {translate("Staff Notes")}
                            </p>
                            <StaffNoteContent text={staffNotes || order.staff_note || ""} />
                          </div>
                        )}

                        {order.status === "delivered" && (
                          <div className="rounded-xl border-2 border-accent/30 bg-accent/5 p-6">
                            <div className="flex items-center gap-3">
                              <Package size={24} className="text-accent" />
                              <div>
                                <p className="font-semibold text-foreground text-lg">{translate("Your report is ready!")}</p>
                                <p className="text-sm text-muted-foreground">
                                  {translate("Check the Shared Evaluation Reports section below for your report.")}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {requirements.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                              <AlertCircle size={16} className="text-destructive" /> {translate("Requirements from IFCS Staff")}
                            </p>
                            <div className="space-y-3">
                              {requirements.map((req: any) => (
                                <div key={req.id} className={`rounded-lg border p-4 flex items-start gap-4 ${req.resolved ? "border-emerald-500/30 bg-emerald-500/5" : "border-border"}`}>
                                  <div className="mt-0.5">
                                    {req.resolved
                                      ? <CheckCircle2 size={20} className="text-emerald-500" />
                                      : <Clock size={20} className="text-muted-foreground" />}
                                  </div>
                                  <div className="flex-1">
                                    <p className={`font-medium text-sm ${req.resolved ? "text-emerald-600 line-through" : "text-foreground"}`}>{req.label}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{req.description}</p>
                                  </div>
                                  {!req.resolved && req.type === "translation" && (
                                    <Link to="/translations">
                                      <Button size="sm" variant="outline" className="gap-1 text-xs">
                                        <Languages size={14} /> Get Translation
                                      </Button>
                                    </Link>
                                  )}
                                  {!req.resolved && req.type !== "translation" && (
                                    <Button size="sm" variant="outline" className="gap-1 text-xs">
                                      <Upload size={14} /> Upload
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                            <Plus size={16} className="text-accent" /> {translate("Add-Ons")}
                          </p>
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {addOns.map((addon) => (
                              <Link key={addon.id} to={addon.link}>
                                <div className="rounded-lg border border-border p-4 hover:border-accent/40 hover:bg-accent/5 transition-all cursor-pointer group">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-medium text-foreground">{translate(addon.label)}</p>
                                      <p className="text-lg font-bold text-accent">${addon.price}</p>
                                    </div>
                                    <Plus size={18} className="text-muted-foreground group-hover:text-accent transition-colors" />
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          )}

          {/* ── Shared Evaluation Reports ── */}
          {activeSection === "eval_reports" && (
          <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center">
                <ShieldCheck size={20} className="text-accent" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{translate("Shared Evaluation Reports")}</h2>
            </div>
            <div className="space-y-3">
              {dbReports.filter(r => !r.evaluation_type?.toLowerCase().includes("translation")).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No reports shared yet.</p>
              )}
              {dbReports.filter(r => !r.evaluation_type?.toLowerCase().includes("translation")).map((r) => {
                const isExpired = r.expiry_date ? new Date(r.expiry_date) < new Date() : false;
                const statusLabel = isExpired ? "expired" : r.status;
                return (
                  <div key={r.id} className="rounded-2xl border border-border p-5 flex flex-wrap items-center justify-between gap-4 hover:shadow-sm transition-shadow">
                    <div>
                      <p className="font-semibold text-foreground">#{r.reference_id}</p>
                      <p className="text-sm text-muted-foreground">{r.evaluation_type}</p>
                      <p className="text-xs text-muted-foreground">
                        Shared {new Date(r.created_at).toLocaleDateString()}
                        {r.expiry_date && ` · Expires ${new Date(r.expiry_date).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-semibold capitalize ${reportStatusColor[statusLabel] || "text-muted-foreground"}`}>{statusLabel}</span>
                      {!isExpired && (
                        <>
                          <Link to={`/transcript?token=${r.access_token}`}>
                            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-all">
                              <Eye size={14} /> View
                            </button>
                          </Link>
                          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-all" onClick={() => r.report_file_url && window.open(r.report_file_url, "_blank")} disabled={!r.report_file_url}>
                            <Download size={14} /> Download
                          </button>
                        </>
                      )}
                      {isExpired && (
                        <Link to="/addon/renewal">
                          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-destructive text-destructive-foreground text-xs font-semibold hover:bg-destructive/90 transition-all">
                            <RefreshCw size={14} /> Renew ($100)
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          )}

          {/* ── Translation Orders ── */}
          {activeSection === "trans_orders" && (
          <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center">
                <Languages size={20} className="text-accent" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{translate("Translation Orders")}</h2>
            </div>
            <div className="space-y-4">
              {orders.filter(o => o.application_id?.startsWith("T")).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {translate("No translation orders yet.")}
                </p>
              )}
              {orders.filter(o => o.application_id?.startsWith("T")).map((order) => {
                const meta = statusMeta[order.status] ?? statusMeta.requested;
                const isExpanded = expandedOrder === order.id;
                const currentIdx = statusSteps.indexOf(order.status);
                const hasAppData = order.application_id ? appDataMap[order.application_id] : null;
                const staffNotes = order.application_id ? appDataMap[order.application_id]?.staff_notes : null;
                const receiptUrl = order.application_id ? appDataMap[order.application_id]?.receipt_url : null;

                return (
                  <div key={order.id} className="rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <button
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                      className="w-full flex items-center justify-between p-5 hover:bg-muted/20 transition-colors text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <p className="font-bold text-foreground">App ID {order.application_id || order.reference_id}</p>
                          {(order.ifcs_id || hasAppData?.ifcs_id) && (
                            <p className="font-bold text-accent">— IFCS ID {order.ifcs_id || hasAppData?.ifcs_id}</p>
                          )}
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${meta.color}`}>
                            {meta.icon} {meta.label}
                          </span>
                        </div>
                        {order.service && <p className="text-sm text-muted-foreground mt-1.5 truncate">{order.service}</p>}
                        <p className="text-xs text-muted-foreground mt-0.5">Added {new Date(order.submitted_at).toLocaleDateString()}</p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        {isExpanded ? <ChevronUp size={20} className="text-muted-foreground" /> : <ChevronDown size={20} className="text-muted-foreground" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-border p-5 space-y-6">
                        <div className="flex flex-wrap gap-2">
                          {hasAppData && (
                            <button
                              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent/90 transition-all"
                              onClick={() => handleViewApplication(order.application_id!)}
                            >
                              <Eye size={14} /> {translate("View Application")}
                            </button>
                          )}
                          {receiptUrl && (
                            <button
                              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-border bg-muted/50 text-foreground text-xs font-semibold hover:bg-muted transition-all"
                              onClick={() => window.open(receiptUrl, "_blank")}
                            >
                              <FileText size={14} /> {translate("View Receipt")}
                            </button>
                          )}
                        </div>

                        <div>
                          <p className="text-sm font-medium text-foreground mb-3">{translate("Track Order")}</p>
                          <div className="flex items-center gap-2">
                            {statusSteps.map((s, i) => {
                              const filled = i <= currentIdx;
                              const label = statusMeta[s]?.label;
                              return (
                                <div key={s} className="flex-1 text-center">
                                  <div className={`h-2 rounded-full transition-colors ${filled ? "bg-accent" : "bg-muted"}`} />
                                  <p className={`text-[10px] mt-1 ${filled ? "text-accent font-medium" : "text-muted-foreground"}`}>{label}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {(order.staff_note || staffNotes) && (
                          <div className="rounded-xl border border-border p-5 bg-muted/20">
                            <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                              <MessageSquare size={16} className="text-accent" /> {translate("Staff Notes")}
                            </p>
                            <StaffNoteContent text={staffNotes || order.staff_note || ""} />
                          </div>
                        )}

                        {order.status === "delivered" && (
                          <div className="rounded-xl border-2 border-accent/30 bg-accent/5 p-6">
                            <div className="flex items-center gap-3">
                              <Languages size={24} className="text-accent" />
                              <div>
                                <p className="font-semibold text-foreground text-lg">{translate("Your translation is ready!")}</p>
                                <p className="text-sm text-muted-foreground">
                                  {translate("Check the Shared Translation Reports section below.")}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          )}

          {/* ── Shared Translation Reports ── */}
          {activeSection === "trans_reports" && (
          <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center">
                <Languages size={20} className="text-accent" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{translate("Shared Translation Reports")}</h2>
            </div>
            <div className="space-y-3">
              {dbReports.filter(r => r.evaluation_type?.toLowerCase().includes("translation")).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No translation reports shared yet.</p>
              )}
              {dbReports.filter(r => r.evaluation_type?.toLowerCase().includes("translation")).map((r) => {
                const isExpired = r.expiry_date ? new Date(r.expiry_date) < new Date() : false;
                const statusLabel = isExpired ? "expired" : r.status;
                return (
                  <div key={r.id} className="rounded-2xl border border-border p-5 flex flex-wrap items-center justify-between gap-4 hover:shadow-sm transition-shadow">
                    <div>
                      <p className="font-semibold text-foreground">#{r.reference_id}</p>
                      <p className="text-sm text-muted-foreground">{r.evaluation_type}</p>
                      <p className="text-xs text-muted-foreground">
                        Shared {new Date(r.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-semibold capitalize ${reportStatusColor[statusLabel] || "text-muted-foreground"}`}>{statusLabel}</span>
                      {!isExpired && (
                        <>
                          <Link to={`/transcript?token=${r.access_token}`}>
                            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-all">
                              <Eye size={14} /> View
                            </button>
                          </Link>
                          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-all" onClick={() => r.report_file_url && window.open(r.report_file_url, "_blank")} disabled={!r.report_file_url}>
                            <Download size={14} /> Download
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          )}

          <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center">
                <MessageSquare size={20} className="text-accent" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Contact IFCS</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Need help? Click the <span className="font-semibold text-emerald-500">Contact Agent</span> button in the bottom-right corner to start a live chat with an IFCS representative. You can also reach us at <a href="mailto:info@ifcsevals.com" className="text-accent underline">info@ifcsevals.com</a>.
            </p>
          </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Application Dialog */}
      <ViewApplicationDialog
        open={viewAppOpen}
        onOpenChange={setViewAppOpen}
        data={viewAppData}
        applicationId={viewAppId}
      />

      <LiveChatWidget />
      <BackToHome />
      <Footer />
    </div>
  );
};

export default ClientDashboard;
