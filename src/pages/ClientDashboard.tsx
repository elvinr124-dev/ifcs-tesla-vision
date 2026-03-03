import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  FileText, Download, Share2, RefreshCw, Send, Clock, CheckCircle2, AlertCircle, Package,
  MessageSquare, ShieldCheck, Info,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/* ---------- mock data ---------- */
const mockReports = [
  { id: "IFCS-41522", type: "Course-by-Course", dateShared: "12/01/2025", expires: "12/01/2030", status: "active" as const },
  { id: "IFCS-39871", type: "General Evaluation", dateShared: "11/15/2025", expires: "11/15/2030", status: "pending" as const },
  { id: "IFCS-39001", type: "High School Evaluation", dateShared: "10/20/2025", expires: "10/20/2029", status: "expired" as const },
];

const mockOrders = [
  { id: "ORD-1001", service: "Course-by-Course — Rush 3-Day", status: "delivered" as const, note: "" },
  { id: "ORD-1002", service: "General Evaluation — 10 Business Days", status: "in_review" as const, note: "" },
  { id: "ORD-1003", service: "Document Translation", status: "on_hold" as const, note: "Missing certified copy of diploma. Please upload a legible scan." },
];

const statusMeta: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  requested:  { label: "Requested",  color: "bg-muted text-muted-foreground",       icon: <Clock size={14} /> },
  in_review:  { label: "In Review",  color: "bg-accent/20 text-accent",             icon: <Package size={14} /> },
  on_hold:    { label: "On Hold",    color: "bg-destructive/20 text-destructive",    icon: <AlertCircle size={14} /> },
  delivered:  { label: "Delivered",  color: "bg-emerald-500/20 text-emerald-600",    icon: <CheckCircle2 size={14} /> },
};

const reportStatusColor: Record<string, string> = {
  active:  "text-emerald-500",
  pending: "text-amber-500",
  expired: "text-destructive",
};

const ClientDashboard = () => {
  const { user } = useAuth();
  const { items } = useCart();
  const { toast } = useToast();
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;
    toast({ title: "Message Sent", description: "We have received your message and will respond within 24–48 hours." });
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-12 px-6 md:px-12 max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
          Welcome{user?.firstName ? `, ${user.firstName}` : ""}
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">Applicant Dashboard</p>
      </section>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pb-24 space-y-10">

        {/* ── Order Tracking ── */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Package size={22} className="text-accent" /> Order Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockOrders.map((order) => {
              const meta = statusMeta[order.status] ?? statusMeta.requested;
              return (
                <div key={order.id} className="rounded-xl border border-border p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground">{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.service}</p>
                    </div>
                    <Badge variant="secondary" className={`${meta.color} gap-1`}>
                      {meta.icon} {meta.label}
                    </Badge>
                  </div>

                  {/* Timeline bar */}
                  <div className="flex items-center gap-1">
                    {["requested", "in_review", "on_hold", "delivered"].map((s, i) => {
                      const keys = ["requested", "in_review", "on_hold", "delivered"];
                      const currentIdx = keys.indexOf(order.status);
                      const filled = i <= currentIdx;
                      return (
                        <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${filled ? "bg-accent" : "bg-muted"}`} />
                      );
                    })}
                  </div>

                  {order.status === "on_hold" && order.note && (
                    <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-start gap-3">
                      <AlertCircle size={18} className="text-destructive mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-destructive">Staff Note</p>
                        <p className="text-sm text-muted-foreground mt-1">{order.note}</p>
                        <Button size="sm" className="mt-3" variant="destructive">Upload Document</Button>
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
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IFCS Ref #</TableHead>
                  <TableHead>Evaluation Type</TableHead>
                  <TableHead>Date Shared</TableHead>
                  <TableHead>Expiration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockReports.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.id}</TableCell>
                    <TableCell>{r.type}</TableCell>
                    <TableCell>{r.dateShared}</TableCell>
                    <TableCell>{r.expires}</TableCell>
                    <TableCell>
                      <span className={`font-semibold capitalize ${reportStatusColor[r.status]}`}>{r.status}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {r.status === "active" && (
                          <>
                            <Button size="sm" variant="outline" className="gap-1"><Share2 size={14} /> Share</Button>
                            <Button size="sm" variant="outline" className="gap-1"><Download size={14} /> Download</Button>
                          </>
                        )}
                        {r.status === "pending" && (
                          <Button size="sm" variant="outline" className="gap-1"><Share2 size={14} /> Share</Button>
                        )}
                        {r.status === "expired" && (
                          <Button size="sm" variant="destructive" className="gap-1"><RefreshCw size={14} /> Renew ($100)</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
            <Textarea
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[140px]"
            />
            <Button onClick={handleSend} className="gap-2">
              <Send size={16} /> Send Message
            </Button>
          </CardContent>
        </Card>

        {/* ── Info Box ── */}
        <Card className="border-border bg-accent/5">
          <CardContent className="p-6 space-y-2">
            <h3 className="font-semibold flex items-center gap-2 text-foreground"><Info size={18} className="text-accent" /> Important Information</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>Electronic sharing fee: $25</li>
              <li>Hard copy: $25 + shipping</li>
              <li>Domestic shipping: $25</li>
              <li>International shipping: $70</li>
              <li>Reports are valid for 5 years</li>
              <li>Renewal after expiration: $100 (5 years)</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default ClientDashboard;
