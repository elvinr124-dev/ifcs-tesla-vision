import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, ArrowLeft, LogIn } from "lucide-react";

interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  type: string;
}

const JobApplication = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [docFiles, setDocFiles] = useState<File[]>([]);

  const [form, setForm] = useState({
    title: "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    preferredName: "",
    middle: "",
    suffix: "",
    formerName: "",
    email: user?.email || "",
    primaryPhone: "",
    secondaryPhone: "",
    country: "",
    address1: "",
    address2: "",
    city: "",
    zip: "",
    willingToRelocate: "",
    workExperience: "",
    education: "",
    skills: "",
    languages: "",
    howHeard: "",
    referredByEmployee: "no",
    startDate: "",
    coverLetterAttached: "no",
  });

  useEffect(() => {
    const load = async () => {
      if (!jobId) return;
      const { data } = await (supabase as any)
        .from("job_listings")
        .select("*")
        .eq("id", jobId)
        .single();
      setJob(data);
      setLoading(false);
    };
    load();
  }, [jobId]);

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        firstName: user.firstName || f.firstName,
        lastName: user.lastName || f.lastName,
        email: user.email || f.email,
      }));
    }
  }, [user]);

  const handleChange = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.email || !form.firstName || !form.lastName) {
      toast({ title: "Required fields missing", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    setSubmitting(true);

    let resumeUrl = "";
    if (resumeFile) {
      const ext = resumeFile.name.split(".").pop();
      const path = `resumes/${Date.now()}_${form.lastName}.${ext}`;
      const { error } = await supabase.storage.from("evaluation-reports").upload(path, resumeFile);
      if (!error) {
        const { data: urlData } = supabase.storage.from("evaluation-reports").getPublicUrl(path);
        resumeUrl = urlData.publicUrl;
      }
    }

    const { error } = await (supabase as any).from("job_applications").insert({
      job_id: jobId,
      applicant_email: form.email,
      first_name: form.firstName,
      last_name: form.lastName,
      phone: form.primaryPhone,
      address: `${form.address1} ${form.address2}`.trim(),
      city: form.city,
      zip: form.zip,
      country: form.country,
      resume_url: resumeUrl,
      education: form.education,
      work_experience: form.workExperience,
      skills: form.skills,
      languages: form.languages,
      how_heard: form.howHeard,
      referred_by_employee: form.referredByEmployee === "yes",
      start_date: form.startDate,
    });

    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: "Failed to submit application. Please try again.", variant: "destructive" });
    } else {
      toast({ title: "Application Submitted!", description: "Thank you for applying. We'll be in touch." });
      navigate("/careers/jobs");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-40">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-40 text-center text-muted-foreground">Job not found.</div>
        <Footer />
      </div>
    );
  }

  // If not logged in, show sign-in prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-lg mx-auto text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Apply for {job.title}</h1>
            <p className="text-muted-foreground mb-8">Please sign in or create an account to start your application.</p>
            <div className="flex flex-col gap-4 items-center">
              <Link to="/login/client" className="w-full max-w-xs">
                <Button className="w-full rounded-full gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
                  <LogIn size={18} /> Sign In
                </Button>
              </Link>
              <Link to="/signup" className="w-full max-w-xs">
                <Button variant="outline" className="w-full rounded-full gap-2">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-6 px-4">
        <div className="max-w-3xl mx-auto">
          <Link to="/careers/jobs" className="inline-flex items-center gap-1 text-accent hover:underline mb-4 text-sm">
            <ArrowLeft size={14} /> Back to Job Listings
          </Link>
          <div className="bg-accent/10 rounded-2xl p-6 mb-8">
            <p className="text-sm text-muted-foreground">Apply for</p>
            <h1 className="text-2xl font-bold text-foreground">{job.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{job.location} · {job.type}</p>
          </div>
        </div>
      </section>

      <section className="pb-20 px-4">
        <div className="max-w-3xl mx-auto space-y-10">

          {/* Resume Upload */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Resume (Optional)</h2>
            <p className="text-sm text-muted-foreground mb-3">You can use a resume to fill out your application faster and it will be added automatically as an attachment.</p>
            <label className="flex items-center gap-3 p-4 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-accent transition-colors">
              <Upload size={20} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{resumeFile ? resumeFile.name : "DOC, DOCX, or PDF (Max 6MB)"}</span>
              <input type="file" accept=".doc,.docx,.pdf" className="hidden" onChange={(e) => {
                const f = e.target.files?.[0];
                if (f && f.size <= 6 * 1024 * 1024) setResumeFile(f);
              }} />
            </label>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">Contact Information</h2>
            <p className="text-xs text-muted-foreground mb-4">The name on the account you are currently logged in with is displayed below.</p>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Email <span className="text-destructive">*</span></Label>
                <Input value={form.email} onChange={(e) => handleChange("email", e.target.value)} />
              </div>
              <div>
                <Label>Title</Label>
                <Select value={form.title} onValueChange={(v) => handleChange("title", v)}>
                  <SelectTrigger><SelectValue placeholder="Choose..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mr.">Mr.</SelectItem>
                    <SelectItem value="Ms.">Ms.</SelectItem>
                    <SelectItem value="Mrs.">Mrs.</SelectItem>
                    <SelectItem value="Dr.">Dr.</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>First Name <span className="text-destructive">*</span></Label>
                <Input value={form.firstName} onChange={(e) => handleChange("firstName", e.target.value)} />
              </div>
              <div>
                <Label>Preferred Name</Label>
                <Input value={form.preferredName} onChange={(e) => handleChange("preferredName", e.target.value)} placeholder="Optional" />
              </div>
              <div>
                <Label>Middle</Label>
                <Input value={form.middle} onChange={(e) => handleChange("middle", e.target.value)} />
              </div>
              <div>
                <Label>Last Name <span className="text-destructive">*</span></Label>
                <Input value={form.lastName} onChange={(e) => handleChange("lastName", e.target.value)} />
              </div>
              <div>
                <Label>Suffix</Label>
                <Select value={form.suffix} onValueChange={(v) => handleChange("suffix", v)}>
                  <SelectTrigger><SelectValue placeholder="Choose..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Jr.">Jr.</SelectItem>
                    <SelectItem value="Sr.">Sr.</SelectItem>
                    <SelectItem value="II">II</SelectItem>
                    <SelectItem value="III">III</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Former Name</Label>
                <Input value={form.formerName} onChange={(e) => handleChange("formerName", e.target.value)} />
              </div>
              <div>
                <Label>Primary Phone</Label>
                <Input value={form.primaryPhone} onChange={(e) => handleChange("primaryPhone", e.target.value)} />
              </div>
              <div>
                <Label>Secondary Phone</Label>
                <Input value={form.secondaryPhone} onChange={(e) => handleChange("secondaryPhone", e.target.value)} />
              </div>
              <div>
                <Label>Country</Label>
                <Input value={form.country} onChange={(e) => handleChange("country", e.target.value)} placeholder="Choose..." />
              </div>
              <div>
                <Label>Address 1</Label>
                <Input value={form.address1} onChange={(e) => handleChange("address1", e.target.value)} />
              </div>
              <div>
                <Label>Address 2</Label>
                <Input value={form.address2} onChange={(e) => handleChange("address2", e.target.value)} />
              </div>
              <div>
                <Label>City</Label>
                <Input value={form.city} onChange={(e) => handleChange("city", e.target.value)} />
              </div>
              <div>
                <Label>Zip / Postal Code</Label>
                <Input value={form.zip} onChange={(e) => handleChange("zip", e.target.value)} />
              </div>
              <div>
                <Label>Willing to Relocate</Label>
                <Select value={form.willingToRelocate} onValueChange={(v) => handleChange("willingToRelocate", v)}>
                  <SelectTrigger><SelectValue placeholder="Choose..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="maybe">Open to Discussion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Work Experience */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Work Experience</h2>
            <Textarea rows={4} placeholder="Describe your relevant work experience..." value={form.workExperience} onChange={(e) => handleChange("workExperience", e.target.value)} />
          </div>

          {/* Education */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Education</h2>
            <Textarea rows={4} placeholder="List your educational background..." value={form.education} onChange={(e) => handleChange("education", e.target.value)} />
          </div>

          {/* Skills */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Skills</h2>
            <Textarea rows={3} placeholder="List your relevant skills..." value={form.skills} onChange={(e) => handleChange("skills", e.target.value)} />
          </div>

          {/* Languages */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Languages</h2>
            <Textarea rows={2} placeholder="Besides English, what other languages do you speak?" value={form.languages} onChange={(e) => handleChange("languages", e.target.value)} />
          </div>

          {/* Documents */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Documents</h2>
            <p className="text-sm text-muted-foreground mb-3">Include documents with your application. Max 10 attached documents. DOC, DOCX, PDF, JPG or PNG (Max 6MB each).</p>
            <label className="flex items-center gap-3 p-4 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-accent transition-colors">
              <FileText size={20} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{docFiles.length > 0 ? `${docFiles.length} file(s) selected` : "Upload documents"}</span>
              <input type="file" accept=".doc,.docx,.pdf,.jpg,.png" multiple className="hidden" onChange={(e) => {
                const files = Array.from(e.target.files || []).filter(f => f.size <= 6 * 1024 * 1024).slice(0, 10);
                setDocFiles(files);
              }} />
            </label>
          </div>

          {/* Questions */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Questions</h2>
            <div className="space-y-5">
              <div>
                <Label>How did you hear about this opportunity? <span className="text-destructive">*</span></Label>
                <Select value={form.howHeard} onValueChange={(v) => handleChange("howHeard", v)}>
                  <SelectTrigger><SelectValue placeholder="Choose..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">IFCS Website</SelectItem>
                    <SelectItem value="indeed">Indeed</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="referral">Employee Referral</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Were you referred by a current employee?</Label>
                <RadioGroup value={form.referredByEmployee} onValueChange={(v) => handleChange("referredByEmployee", v)} className="flex gap-6 mt-1">
                  <div className="flex items-center gap-2"><RadioGroupItem value="yes" id="ref-yes" /><Label htmlFor="ref-yes">Yes</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem value="no" id="ref-no" /><Label htmlFor="ref-no">No</Label></div>
                </RadioGroup>
              </div>
              <div>
                <Label>When can you start? (MM/DD/YYYY)</Label>
                <Input type="date" value={form.startDate} onChange={(e) => handleChange("startDate", e.target.value)} />
              </div>
              <div>
                <Label>A cover letter is required for this role. Did you attach yours?</Label>
                <RadioGroup value={form.coverLetterAttached} onValueChange={(v) => handleChange("coverLetterAttached", v)} className="flex gap-6 mt-1">
                  <div className="flex items-center gap-2"><RadioGroupItem value="yes" id="cl-yes" /><Label htmlFor="cl-yes">Yes</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem value="no" id="cl-no" /><Label htmlFor="cl-no">No</Label></div>
                </RadioGroup>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground italic">
            Once you leave this page, you won't be able to edit the information you entered.
          </p>

          <div className="flex justify-end gap-4 pt-4">
            <Link to="/careers/jobs">
              <Button variant="outline" className="rounded-full">Cancel</Button>
            </Link>
            <Button
              className="rounded-full px-8 bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default JobApplication;
