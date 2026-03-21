import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToHome from "@/components/BackToHome";
import LiveChatWidget from "@/components/LiveChatWidget";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  FileText, Download, Share2, RefreshCw, Send, Clock, CheckCircle2, AlertCircle, Package,
  MessageSquare, ShieldCheck, Plus, Languages, Upload, ChevronDown, ChevronUp, Eye, ThumbsUp, ThumbsDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

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
}

const addOns = [
  { id: "addon-duplicate", label: "Duplicate Report", price: 25, link: "/duplicate-reports" },
  { id: "addon-renewal", label: "Renewal (5 Years)", price: 100, link: "/addon/renewal" },
];

const statusMeta: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  requested:  { label: "Requested",  color: "bg-muted text-muted-foreground",       icon: <Clock size={14} /> },
  in_review:  { label: "In Review",  color: "bg-accent/20 text-accent",             icon: <Package size={14} /> },
  on_hold:    { label: "On Hold",    color: "bg-destructive/20 text-destructive",    icon: <AlertCircle size={14} /> },
  delivered:  { label: "Delivered",  color: "bg-emerald-500/20 text-emerald-600",    icon: <CheckCircle2 size={14} /> },
};

const statusSteps = ["requested", "in_review", "on_hold", "delivered"];

const reportStatusColor: Record<string, string> = {
  active:  "text-emerald-500",
  pending: "text-amber-500",
  expired: "text-destructive",
};

const ClientDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [dbReports, setDbReports] = useState<DBReport[]>([]);
  const [addRefInput, setAddRefInput] = useState("");
  const [addingRef, setAddingRef] = useState(false);

  const clientEmail = user?.email || user?.username || "";

  // Load orders from DB
  useEffect(() => {
    if (!clientEmail) return;

    const loadOrders = async () => {
      const { data } = await (supabase as any)
        .from("client_orders")
        .select("*")
        .eq("client_email", clientEmail)
        .order("created_at", { ascending: false });
      if (data) setOrders(data);
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

    return () => { supabase.removeChannel(channel); };
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

  // Add reference number
  const handleAddReference = async () => {
    if (!addRefInput.trim() || !clientEmail) return;
    setAddingRef(true);

    // Check if already linked
    const { data: existing } = await (supabase as any)
      .from("client_orders")
      .select("id")
      .eq("reference_id", addRefInput.trim())
      .eq("client_email", clientEmail)
      .single();

    if (existing) {
      toast({ title: "Already Added", description: "This reference number is already in your dashboard.", variant: "destructive" });
      setAddingRef(false);
      return;
    }

    // Insert the order reference
    const { error } = await (supabase as any)
      .from("client_orders")
      .insert({
        reference_id: addRefInput.trim(),
        client_email: clientEmail,
        service: "",
        status: "requested",
      });

    if (error) {
      toast({ title: "Error", description: "Failed to add reference. Please try again.", variant: "destructive" });
    } else {
      toast({ title: "Reference Added", description: `Order #${addRefInput.trim()} has been added to your dashboard.` });
      setAddRefInput("");
    }
    setAddingRef(false);
  };

  // Delivery approval
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectOrderId, setRejectOrderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleApproveDelivery = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, deliveryApproved: true } as any : o));
    toast({ title: "Delivery Approved", description: "You have approved the delivery. You can now view your report." });
  };

  const handleRejectDelivery = () => {
    if (!rejectReason.trim()) return;
    toast({ title: "Feedback Sent", description: "Your feedback has been sent to IFCS staff." });
    setRejectDialogOpen(false);
    setRejectReason("");
    setRejectOrderId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-28 pb-12 px-6 md:px-12 max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
          Welcome{user?.firstName ? `, ${user.firstName}` : ""}
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">Applicant Dashboard</p>
      </section>

      <div className="content-bg">
        <div className="max-w-7xl mx-auto px-6 md:px-12 pb-24 space-y-10">

          {/* ── Add Reference Number ── */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Plus size={22} className="text-accent" /> Track an Order
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Enter your IFCS reference number to add it to your dashboard and track its progress.
              </p>
              <div className="flex gap-3">
                <Input
                  value={addRefInput}
                  onChange={(e) => setAddRefInput(e.target.value)}
                  placeholder="e.g. 44507"
                  className="max-w-xs"
                />
                <Button onClick={handleAddReference} disabled={addingRef || !addRefInput.trim()} className="gap-2">
                  <Plus size={16} /> {addingRef ? "Adding..." : "Add Reference"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ── Order Tracking ── */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Package size={22} className="text-accent" /> Your Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {orders.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No orders yet. Add a reference number above to start tracking your evaluation.
                </p>
              )}
              {orders.map((order) => {
                const meta = statusMeta[order.status] ?? statusMeta.requested;
                const isExpanded = expandedOrder === order.reference_id;
                const currentIdx = statusSteps.indexOf(order.status);
                const requirements = Array.isArray(order.requirements) ? order.requirements : [];

                return (
                  <div key={order.id} className="rounded-xl border border-border overflow-hidden">
                    <button
                      onClick={() => setExpandedOrder(isExpanded ? null : order.reference_id)}
                      className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors text-left"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <p className="font-semibold text-foreground">#{order.reference_id}</p>
                          <Badge variant="secondary" className={`${meta.color} gap-1`}>
                            {meta.icon} {meta.label}
                          </Badge>
                        </div>
                        {order.service && <p className="text-sm text-muted-foreground mt-1">{order.service}</p>}
                        <p className="text-xs text-muted-foreground">Added {new Date(order.submitted_at).toLocaleDateString()}</p>
                      </div>
                      {isExpanded ? <ChevronUp size={20} className="text-muted-foreground" /> : <ChevronDown size={20} className="text-muted-foreground" />}
                    </button>

                    {isExpanded && (
                      <div className="border-t border-border p-5 space-y-6">
                        {/* Status timeline */}
                        <div>
                          <p className="text-sm font-medium text-foreground mb-3">Track Order</p>
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

                        {/* Staff note */}
                        {order.staff_note && (
                          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                            <p className="text-sm text-muted-foreground">{order.staff_note}</p>
                          </div>
                        )}

                        {/* Delivery Approval — shown when delivered */}
                        {order.status === "delivered" && (
                          <div className="rounded-xl border-2 border-accent/30 bg-accent/5 p-6">
                            <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                <Package size={24} className="text-accent" />
                                <div>
                                  <p className="font-semibold text-foreground text-lg">Your report is ready!</p>
                                  <p className="text-sm text-muted-foreground">
                                    Check the Shared Evaluation Reports section below for your report.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Staff requirements */}
                        {requirements.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                              <AlertCircle size={16} className="text-destructive" /> Requirements from IFCS Staff
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

                        {/* Add-Ons */}
                        <div>
                          <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                            <Plus size={16} className="text-accent" /> Add-Ons
                          </p>
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {addOns.map((addon) => (
                              <Link key={addon.id} to={addon.link}>
                                <div className="rounded-lg border border-border p-4 hover:border-accent/40 hover:bg-accent/5 transition-all cursor-pointer group">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-medium text-foreground">{addon.label}</p>
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
            </CardContent>
          </Card>

          {/* ── Credential Vault ── */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <ShieldCheck size={22} className="text-accent" /> Shared Evaluation Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dbReports.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No reports shared yet.</p>
              )}
              {dbReports.map((r) => {
                const isExpired = r.expiry_date ? new Date(r.expiry_date) < new Date() : false;
                const statusLabel = isExpired ? "expired" : r.status;
                return (
                  <div key={r.id} className="rounded-xl border border-border p-5 flex flex-wrap items-center justify-between gap-4">
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
                            <Button size="sm" variant="outline" className="gap-1"><Eye size={14} /> View</Button>
                          </Link>
                          <Button size="sm" variant="outline" className="gap-1"><Download size={14} /> Download</Button>
                        </>
                      )}
                      {isExpired && (
                        <Link to="/addon/renewal">
                          <Button size="sm" variant="destructive" className="gap-1"><RefreshCw size={14} /> Renew ($100)</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* ── Contact IFCS ── */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <MessageSquare size={22} className="text-accent" /> Contact IFCS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Need help? Click the <span className="font-semibold text-emerald-500">Contact Agent</span> button in the bottom-right corner to start a live chat with an IFCS representative. You can also reach us at <a href="mailto:info@ifcsevals.com" className="text-accent underline">info@ifcsevals.com</a>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tell us what's wrong</DialogTitle>
            <DialogDescription>Please explain why you're not ready to approve this delivery.</DialogDescription>
          </DialogHeader>
          <Textarea placeholder="Describe the issue..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="min-h-[120px]" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRejectDelivery} disabled={!rejectReason.trim()} className="gap-2"><Send size={16} /> Send Feedback</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <LiveChatWidget />
      <BackToHome />
      <Footer />
    </div>
  );
};

export default ClientDashboard;
