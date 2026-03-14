import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
interface StaffRequirement {
  id: string;
  label: string;
  description: string;
  type: "document" | "translation" | "info";
  resolved: boolean;
}

interface MockOrder {
  id: string;
  service: string;
  status: "requested" | "in_review" | "on_hold" | "delivered";
  submitted: string;
  staffNote: string;
  requirements: StaffRequirement[];
  deliveryApproved?: boolean;
  reportFileUrl?: string;
}

/* ---------- mock data ---------- */
const initialOrders: MockOrder[] = [
  {
    id: "ORD-1001", service: "Course-by-Course — Rush 3-Day", status: "in_review", submitted: "03/01/2026", staffNote: "",
    requirements: [], reportFileUrl: "/sample-report.pdf",
  },
  {
    id: "ORD-1002", service: "General Evaluation — 10 Business Days", status: "on_hold", submitted: "02/28/2026",
    staffNote: "We need additional documents before we can proceed with your evaluation.",
    requirements: [
      { id: "req-1", label: "Official Transcripts", description: "Please upload certified copies of your university transcripts.", type: "document", resolved: false },
      { id: "req-2", label: "Document Translation", description: "Your diploma must be translated into English by a certified translator.", type: "translation", resolved: false },
      { id: "req-3", label: "Passport Copy", description: "Please provide a copy of your passport name page.", type: "document", resolved: true },
    ],
  },
  {
    id: "ORD-1003", service: "Document Translation", status: "delivered", submitted: "02/20/2026", staffNote: "",
    requirements: [], deliveryApproved: false, reportFileUrl: "/sample-report.pdf",
  },
];

const mockReports = [
  { id: "IFCS-41522", type: "Course-by-Course", dateShared: "12/01/2025", expires: "12/01/2030", status: "active" as const },
  { id: "IFCS-39871", type: "General Evaluation", dateShared: "11/15/2025", expires: "11/15/2030", status: "pending" as const },
  { id: "IFCS-39001", type: "High School Evaluation", dateShared: "10/20/2025", expires: "10/20/2029", status: "expired" as const },
];

const addOns = [
  { id: "addon-electronic", label: "Electronic Sharing", price: 25, link: "/addon/electronic-sharing" },
  { id: "addon-hardcopy", label: "Hard Copy Report", price: 25, link: "/addon/hard-copy" },
  { id: "addon-domestic", label: "Domestic Shipping", price: 25, link: "/addon/domestic-shipping" },
  { id: "addon-international", label: "International Shipping", price: 70, link: "/addon/international-shipping" },
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
  const [message, setMessage] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>("ORD-1002");
  const [orders, setOrders] = useState<MockOrder[]>(initialOrders);

  // Delivery approval state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectOrderId, setRejectOrderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleSend = async () => {
    if (!message.trim()) return;
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.functions.invoke("send-dashboard-message", {
        body: {
          message: message.trim(),
          senderName: user?.firstName || "Client",
          senderEmail: user?.email || "",
        },
      });
      if (error) throw error;
      toast({ title: "Message Sent", description: "Your message has been sent to info@ifcsevals.com. We'll respond within 24–48 hours." });
      setMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
      toast({ title: "Error", description: "Failed to send message. Please try again or email info@ifcsevals.com directly.", variant: "destructive" });
    }
  };

  const handleApproveDelivery = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, deliveryApproved: true } : o));
    toast({ title: "Delivery Approved", description: "You have approved the delivery. You can now view your report." });
  };

  const handleRejectDelivery = () => {
    if (!rejectReason.trim()) return;
    toast({ title: "Feedback Sent", description: "Your feedback has been sent to IFCS staff. They will review and follow up." });
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

          {/* ── Order Tracking ── */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Package size={22} className="text-accent" /> Your Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {orders.map((order) => {
                const meta = statusMeta[order.status] ?? statusMeta.requested;
                const isExpanded = expandedOrder === order.id;
                const currentIdx = statusSteps.indexOf(order.status);

                return (
                  <div key={order.id} className="rounded-xl border border-border overflow-hidden">
                    <button
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                      className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors text-left"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <p className="font-semibold text-foreground">{order.id}</p>
                          <Badge variant="secondary" className={`${meta.color} gap-1`}>
                            {meta.icon} {meta.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{order.service}</p>
                        <p className="text-xs text-muted-foreground">Submitted {order.submitted}</p>
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

                        {/* Delivery Approval (Fiverr-style) — shown when delivered */}
                        {order.status === "delivered" && (
                          <div className="rounded-xl border-2 border-accent/30 bg-accent/5 p-6">
                            {order.deliveryApproved ? (
                              <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                  <CheckCircle2 size={24} className="text-emerald-500" />
                                  <div>
                                    <p className="font-semibold text-foreground">Delivery Approved</p>
                                    <p className="text-sm text-muted-foreground">You approved this delivery. Your report is now available without watermark.</p>
                                  </div>
                                </div>
                                <Button variant="outline" className="gap-2" onClick={() => window.open(order.reportFileUrl, '_blank')}>
                                  <Eye size={16} /> View Report
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                  <Package size={24} className="text-accent" />
                                  <div>
                                    <p className="font-semibold text-foreground text-lg">Your report is ready!</p>
                                    <p className="text-sm text-muted-foreground">
                                      Review your report preview below. Once approved, you'll receive the final version without watermark.
                                    </p>
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                                  ⚠️ Once you approve this delivery, the order will be marked as complete. Any revisions after this step may be subject to extra costs.
                                </p>
                                <div className="flex items-center gap-3 flex-wrap">
                                  <Button
                                    variant="outline"
                                    className="gap-2"
                                    onClick={() => {
                                      // Opens a watermarked preview
                                      alert("Opening watermarked preview — this version cannot be downloaded or sent to institutions. Approve delivery to receive the final copy.");
                                    }}
                                  >
                                    <Eye size={16} /> View with Watermark
                                  </Button>
                                  <Button
                                    onClick={() => handleApproveDelivery(order.id)}
                                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    <ThumbsUp size={16} /> Yes, I approve delivery
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => { setRejectOrderId(order.id); setRejectDialogOpen(true); }}
                                    className="gap-2"
                                  >
                                    <ThumbsDown size={16} /> I'm not ready yet
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Staff requirements */}
                        {order.requirements.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                              <AlertCircle size={16} className="text-destructive" /> Requirements from IFCS Staff
                            </p>
                            {order.staffNote && (
                              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 mb-4">
                                <p className="text-sm text-muted-foreground">{order.staffNote}</p>
                              </div>
                            )}
                            <div className="space-y-3">
                              {order.requirements.map((req) => (
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
                                  {!req.resolved && (
                                    <div className="flex gap-2 shrink-0">
                                      {req.type === "translation" ? (
                                        <Link to="/translations">
                                          <Button size="sm" variant="outline" className="gap-1 text-xs">
                                            <Languages size={14} /> Get Translation
                                          </Button>
                                        </Link>
                                      ) : (
                                        <Button size="sm" variant="outline" className="gap-1 text-xs">
                                          <Upload size={14} /> Upload
                                        </Button>
                                      )}
                                    </div>
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
              {mockReports.map((r) => (
                <div key={r.id} className="rounded-xl border border-border p-5 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">{r.id}</p>
                    <p className="text-sm text-muted-foreground">{r.type}</p>
                    <p className="text-xs text-muted-foreground">Shared {r.dateShared} · Expires {r.expires}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-semibold capitalize ${reportStatusColor[r.status]}`}>{r.status}</span>
                    {r.status === "active" && (
                      <>
                        <Button size="sm" variant="outline" className="gap-1"><Share2 size={14} /> Share</Button>
                        <Button size="sm" variant="outline" className="gap-1"><Download size={14} /> Download</Button>
                      </>
                    )}
                    {r.status === "pending" && <Button size="sm" variant="outline" className="gap-1"><Share2 size={14} /> Share</Button>}
                    {r.status === "expired" && (
                      <Link to="/addon/renewal">
                        <Button size="sm" variant="destructive" className="gap-1"><RefreshCw size={14} /> Renew ($100)</Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* ── Message IFCS ── */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <MessageSquare size={22} className="text-accent" /> Message IFCS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Send a message to IFCS — Email: info@ifcsevals.com</p>
              <Textarea placeholder="Type your message here..." value={message} onChange={(e) => setMessage(e.target.value)} className="min-h-[140px]" />
              <Button onClick={handleSend} className="gap-2"><Send size={16} /> Send Message</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reject / Not Ready Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tell us what's wrong</DialogTitle>
            <DialogDescription>
              Please explain why you're not ready to approve this delivery. Our staff will review your feedback and follow up.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Describe the issue or what needs to be revised..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="min-h-[120px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRejectDelivery} disabled={!rejectReason.trim()} className="gap-2">
              <Send size={16} /> Send Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default ClientDashboard;
