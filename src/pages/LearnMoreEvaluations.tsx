import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToHome from "@/components/BackToHome";
import { BookOpen, ArrowRight } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

const evaluationTypes = [
  {
    title: "General Analysis",
    slug: "general-analysis",
    explanation:
      "This service provides a formal assessment of a diploma or degree certificate only. Please note that academic transcripts cannot be evaluated under this specific service level.",
  },
  {
    title: "General Analysis Plus GPA",
    slug: "general-analysis-plus-gpa",
    explanation:
      "This report evaluates the diploma along with the cumulative grade point average (GPA). The GPA must be clearly stated on the original transcript; otherwise, a full Course-by-Course evaluation is required.",
  },
  {
    title: "Cosmetology Course-by-Course",
    slug: "cosmetology-course-by-course",
    explanation:
      "This specialized evaluation reviews the certificate and transcript to verify total clock hours completed. It requires a detailed breakdown of hours earned for each individual subject area.",
  },
  {
    title: "Course-by-Course",
    slug: "course-by-course",
    explanation:
      "This evaluation provides a detailed breakdown of the diploma and all transcript coursework. For incomplete programs, the transcript alone may be evaluated to determine total successfully completed credits.",
  },
  {
    title: "Health Professions Course-by-Course",
    slug: "health-professions-course-by-course",
    explanation:
      "Designed for medical practitioners, this comprehensive assessment includes the undergraduate degree, academic transcript, and a verification of clinical hours. It ensures all professional training components meet standard requirements.",
  },
  {
    title: "Comprehensive Course-by-Course",
    slug: "comprehensive-course-by-course",
    explanation:
      "This service evaluates two distinct credentials. It typically includes a General Analysis for secondary education and a Course-by-Course assessment for post-secondary degrees.",
  },
  {
    title: "High School and University Course-by-Course",
    slug: "high-school-and-university-course-by-course",
    explanation:
      "This all-inclusive package provides a detailed evaluation of both secondary and post-secondary education. It requires diplomas and full academic transcripts for both levels of study.",
  },
  {
    title: "Professional Licensure Course-by-Course",
    slug: "professional-licensure-course-by-course",
    explanation:
      "This extensive report assesses the high school diploma, undergraduate degree coursework, and current professional licensure. It is tailored for individuals seeking certification or registration in regulated industries.",
  },
];

const LearnMoreEvaluations = () => {
  const { translate } = useLocale();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 content-bg">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-medium tracking-[0.2em] uppercase mb-3 text-accent">
            {translate("Understanding Our Services")}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            {translate("Learn More About Our Evaluations")}
          </h1>
        </div>
      </section>

      {/* What's an Evaluation */}
      <section className="py-16 px-6 content-bg-alt">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
            {translate("What's an Evaluation?")}
          </h2>
          <h3 className="text-lg md:text-xl font-semibold text-accent mb-4">
            {translate("Institute of Foreign Credential Services (IFCS) Evaluation in USA: Features, Cost, Process & More")}
          </h3>
          <div className="space-y-4 text-[15px] leading-relaxed text-muted-foreground">
            <p>
              {translate("Institute of Foreign Credential Services (IFCS) evaluations are essential for international students and professionals seeking to study or work in the USA. They help universities, employers, and immigration officials accurately assess international qualifications through a personalized, expert-led approach. The process involves verifying academic records, converting them into U.S. educational equivalents, and providing a detailed report that meets industry standards.")}
            </p>
            <p>
              {translate("IFCS evaluations are widely accepted by hundreds of institutions and are crucial for university admissions, professional licensing, employment verification, and immigration support. Unlike larger automated services, IFCS is known for its high level of individual attention and direct access to experienced evaluators.")}
            </p>
          </div>
        </div>
      </section>

      {/* Evaluation Types */}
      <section className="py-20 px-6 content-bg">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-medium tracking-[0.2em] uppercase mb-3 text-accent">
              {translate("Our Evaluation Types")}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              {translate("Explore Each Service")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {evaluationTypes.map((ev) => (
              <div
                key={ev.slug}
                className="bg-card border border-border rounded-3xl p-6 hover:shadow-xl hover:shadow-accent/10 transition-all duration-300 hover:scale-[1.01] flex flex-col"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
                    <BookOpen size={18} className="text-accent" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground leading-snug pt-1.5">
                    {translate(ev.title)}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground mb-5 flex-1">
                  {translate(ev.explanation)}
                </p>
                <div className="flex items-center gap-5 self-start">
                  <Link
                    to={`/evaluations#${ev.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent/80 transition-colors group"
                  >
                    {translate("View Service")}
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to={`/pricing#${ev.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent/80 transition-colors group"
                  >
                    {translate("View Pricing")}
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-10 italic">
            {translate("Additional degrees can be added for additional fees — please inquire within.")}
          </p>
        </div>
      </section>

      <BackToHome />
      <Footer />
    </div>
  );
};

export default LearnMoreEvaluations;
