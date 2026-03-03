import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Upload, Send, Users, Clock, AlertCircle, CheckCircle2, Package, FileText, Star,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/* ---------- mock queue ---------- */
const mockQueue = [
  { id: "ORD-1001", applicant: "John Doe", email: "john@example.com", service: "Course-by-Course — Rush 3-Day", status: "in_review" as const, submitted: "02/28/2026" },
  { id: "ORD-1002", applicant: "Maria Garcia", email: "maria@example.com", service: "General Evaluation — 10 Business Days", status: "requested" as const, submitted: "03/01/2026" },
  { id: "ORD-1003", applicant: "Ahmed Ali", email: "ahmed@example.com", service: "Document Translation", status: "on_hold" as const, submitted: "02/25/2026" },
  { id: "ORD-1004", applicant: "Li Wei", email: "li@example.com", service: "Comprehensive Course-by-Course", status: "delivered" as const, submitted: "02/20/2026" },
];

const statusMeta: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  requested:  { label: "Requested",  color: "bg-muted text-muted-foreground",    icon: <Clock size={14} /> },
  in_review:  { label: "In Review",  color: "bg-accent/20 text-accent",          icon: <Package size={14} /> },
  on_hold:    { label: "On Hold",    color: "bg-destructive/20 text-destructive", icon: <AlertCircle size={14} /> },
  delivered:  { label: "Delivered",  color: "bg-emerald-500/20 text-emerald-600", icon: <CheckCircle2 size={14} /> },
};

const StaffDashboard = () => {
  const { toast } = useToast();
  const [filter, setFilter] = useState("all");
  const [shareEmail, setShareEmail] = useState("");
  const [shareRef, setShareRef] = useState("");
  const [shareType, setShareType] = useState("");
  const [shareExpiry, setShareExpiry] = useState("");
  const [staffNote, setStaffNote] = useState("");

  const filtered = filter === "all" ? mockQueue : mockQueue.filter((o) => o.status === filter);

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

      <div className="max-w-7xl mx-auto px-6 md:px-12 pb-24 space-y-10">

        {/* ── Queue Management ── */}
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users size={22} className="text-accent" /> Application Queue
            </CardTitle>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="requested">Requested</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((o) => {
                  const meta = statusMeta[o.status];
                  return (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">{o.id}</TableCell>
                      <TableCell>
                        <p className="font-medium">{o.applicant}</p>
                        <p className="text-xs text-muted-foreground">{o.email}</p>
                      </TableCell>
                      <TableCell>{o.service}</TableCell>
                      <TableCell>{o.submitted}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`${meta.color} gap-1`}>{meta.icon} {meta.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">Update Status</Button>
                          <Button size="sm" variant="outline">Message</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
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
                <label className="text-sm font-medium text-foreground">Applicant Email Address *</label>
                <Input type="email" placeholder="applicant@email.com" value={shareEmail} onChange={(e) => setShareEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">IFCS Reference Number *</label>
                <Input placeholder="IFCS-XXXXX" value={shareRef} onChange={(e) => setShareRef(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Type of Evaluation *</label>
                <Select value={shareType} onValueChange={setShareType}>
                  <SelectTrigger><SelectValue placeholder="Select evaluation type" /></SelectTrigger>
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
                <label className="text-sm font-medium text-foreground">Expiration Date (5-Year Control) *</label>
                <Input type="date" value={shareExpiry} onChange={(e) => setShareExpiry(e.target.value)} required />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-foreground">Upload Evaluation (PDF Only)</label>
                <Input type="file" accept=".pdf" />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" className="gap-2 px-8">
                  <Upload size={16} /> Upload & Share Report
                </Button>
              </div>
            </form>
            <div className="mt-6 bg-accent/5 rounded-xl p-5 space-y-1 text-sm text-muted-foreground">
              <p>• Applicant will receive a secure email link</p>
              <p>• Reports expire after 5 years unless renewed</p>
              <p>• Access can be revoked by IFCS staff at any time</p>
            </div>
          </CardContent>
        </Card>

        {/* ── Custom Offers / Notes ── */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Send size={22} className="text-accent" /> Send Custom Quote or Note
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Write a custom quote, revision note, or status update to an applicant..."
              value={staffNote}
              onChange={(e) => setStaffNote(e.target.value)}
              className="min-h-[120px]"
            />
            <Button onClick={() => { toast({ title: "Note Sent" }); setStaffNote(""); }} className="gap-2">
              <Send size={16} /> Send to Applicant
            </Button>
          </CardContent>
        </Card>

        {/* ── Feedback / Ratings ── */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Star size={22} className="text-accent" /> Recent Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default StaffDashboard;
