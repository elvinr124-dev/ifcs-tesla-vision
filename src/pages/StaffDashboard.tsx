import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Upload, Send, Users, Clock, AlertCircle, CheckCircle2, Package, FileText, Star,
  Plus, X, Languages, FileUp, Info,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

/* ---------- mock queue ---------- */
const initialQueue: QueueOrder[] = [
  { id: "ORD-1001", applicant: "John Doe", email: "john@example.com", service: "Course-by-Course — Rush 3-Day", status: "in_review", submitted: "02/28/2026", requirements: [] },
  {
    id: "ORD-1002", applicant: "Maria Garcia", email: "maria@example.com", service: "General Evaluation — 10 Business Days", status: "on_hold", submitted: "03/01/2026",
    requirements: [
      { id: "r1", label: "Official Transcripts", description: "Upload certified copies of university transcripts.", type: "document" },
      { id: "r2", label: "Document Translation", description: "Diploma must be translated into English.", type: "translation" },
    ],
  },
  { id: "ORD-1003", applicant: "Ahmed Ali", email: "ahmed@example.com", service: "Document Translation", status: "requested", submitted: "02/25/2026", requirements: [] },
  { id: "ORD-1004", applicant: "Li Wei", email: "li@example.com", service: "Comprehensive Course-by-Course", status: "delivered", submitted: "02/20/2026", requirements: [] },
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

  // Share form
  const [shareEmail, setShareEmail] = useState("");
  const [shareRef, setShareRef] = useState("");
  const [shareType, setShareType] = useState("");
  const [shareExpiry, setShareExpiry] = useState("");

  // Requirement form
  const [newReqLabel, setNewReqLabel] = useState("");
  const [newReqDesc, setNewReqDesc] = useState("");
  const [newReqType, setNewReqType] = useState<"document" | "translation" | "info">("document");

  const [staffNote, setStaffNote] = useState("");

  const filtered = filter === "all" ? queue : queue.filter((o) => o.status === filter);

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

  const handleShare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareEmail || !shareRef || !shareType || !shareExpiry) {
      toast({ title: "Missing Fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    toast({ title: "Report Shared", description: `Evaluation report sent to ${shareEmail}.` });
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

          {/* ── Queue Management ── */}
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
            </CardHeader>
            <CardContent className="space-y-4">
              {filtered.map((o) => {
                const meta = statusMeta[o.status] ?? statusMeta.requested;
                const isSelected = selectedOrder === o.id;

                return (
                  <div key={o.id} className="rounded-xl border border-border overflow-hidden">
                    {/* Row header */}
                    <button
                      onClick={() => setSelectedOrder(isSelected ? null : o.id)}
                      className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors text-left"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <p className="font-semibold text-foreground">{o.id}</p>
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

                        {/* Send message */}
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-foreground">Message Applicant</p>
                          <Textarea placeholder="Type a message to this applicant..."
                            value={staffNote} onChange={(e) => setStaffNote(e.target.value)} className="min-h-[80px]" />
                          <Button size="sm" onClick={() => { toast({ title: "Message Sent" }); setStaffNote(""); }} className="gap-1">
                            <Send size={14} /> Send
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
                  <Input placeholder="IFCS-XXXXX" value={shareRef} onChange={(e) => setShareRef(e.target.value)} required />
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
