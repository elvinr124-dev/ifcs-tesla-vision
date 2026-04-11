import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, ArrowRight, Briefcase, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  type: string;
  created_at: string;
}

const JobListings = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await (supabase as any)
        .from("job_listings")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      setJobs(data || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Open Positions</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find the role that's right for you and join our team at the Institute of Foreign Credential Services.
          </p>
        </div>
      </section>

      <section className="pb-20 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Briefcase className="mx-auto mb-4 text-muted-foreground/50" size={48} />
              <p className="text-lg">No open positions at this time. Check back soon!</p>
            </div>
          ) : (
            jobs.map((job) => {
              const isExpanded = expandedJob === job.id;
              return (
                <div key={job.id} className="border border-border rounded-2xl p-6 bg-card hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-foreground mb-2">{job.title}</h2>
                      <p className={`text-muted-foreground text-sm mb-3 ${isExpanded ? "" : "line-clamp-2"}`}>{job.description}</p>

                      {isExpanded && job.requirements && (
                        <div className="mt-3 mb-3">
                          <p className="text-xs font-bold tracking-[0.15em] uppercase text-muted-foreground mb-2">Requirements</p>
                          <p className="text-muted-foreground text-sm whitespace-pre-line">{job.requirements}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                        <span className="flex items-center gap-1"><Clock size={14} /> {job.type}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => setExpandedJob(isExpanded ? null : job.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border text-sm font-medium text-foreground hover:bg-muted/50 transition-all"
                      >
                        {isExpanded ? <><ChevronUp size={14} /> Show Less</> : <><ChevronDown size={14} /> Show More</>}
                      </button>
                      <Link to={`/careers/apply/${job.id}`}>
                        <Button className="rounded-full gap-2 bg-accent hover:bg-accent/90 text-accent-foreground whitespace-nowrap w-full">
                          Apply Now <ArrowRight size={16} />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default JobListings;
