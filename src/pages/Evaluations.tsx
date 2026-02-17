import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ChevronDown, FileText, Clock, Award, ArrowLeft } from "lucide-react";

const evaluationServices = [
  {
    title: "General Analysis",
    price: 100,
    rush3Day: 150,
    rush24Hr: 195,
    processing: "8–10 Business Days",
    description:
      "Identifies country of study, institution attended, dates of attendance, credential received, and provides an overall U.S. equivalency of the credential earned.",
    recommendedFor:
      "Immigration, military and admission to junior colleges.",
    documents: "Transcripts/mark sheets and diploma certificate",
  },
  {
    title: "General Analysis plus GPA",
    price: 150,
    rush3Day: 205,
    rush24Hr: 295,
    processing: "8–10 Business Days",
    description:
      "Identifies country of study, institution attended, dates of attendance, credential received, and provides an overall U.S. equivalency for the credential earned. Report includes overall GPA. (Available only for academic records that contain an overall grade point average.)",
    recommendedFor:
      "Admission to different types of institutions when GPA is required but no credit transfer is intended.",
    documents: "Transcripts/mark sheets and diploma certificate",
  },
  {
    title: "Course-by-Course",
    price: 190,
    rush3Day: 290,
    rush24Hr: 425,
    processing: "8–10 Business Days",
    description:
      "Identifies country of study, institution attended, dates of attendance, credential received and provides a list of courses for the credential, semester credit hours, grades, an accumulative GPA and U.S. equivalency for the credential earned.",
    recommendedFor:
      "Admission to secondary and post-secondary institutions, and employment.",
    documents: "Transcripts/mark sheets and diploma certificate.",
  },
  {
    title: "Comprehensive Course-by-Course",
    price: 290,
    rush3Day: 390,
    rush24Hr: 490,
    processing: "8–10 Business Days",
    description:
      "Identifies country of study, institution(s), dates of attendance, credentials received and provides a list of courses for each credential, semester credit hours, grades, classifies lower and upper-division, graduate level designations for each course and U.S. equivalency for each credential.",
    recommendedFor:
      "Transfer, graduate admission, professional licensure, and individuals who have earned multiple university degrees. Up to two degrees/sets of documents are included with this fee.",
    documents:
      "Transcripts/mark sheets and diploma certificates. (Note: this service is only provided for post-secondary credentials.)",
  },
  {
    title: "Health Professions Course-by-Course",
    price: 230,
    rush3Day: 355,
    rush24Hr: 490,
    processing: "8–10 Business Days",
    description:
      "Identifies country of study, institution attended, dates of attendance, credential received and provides a list of courses for the credential, semester credit hours, grades, classifies lower and upper-division, graduate level designations for each course, lists clinical experience, and U.S. equivalency for the credential earned.",
    recommendedFor: "Health profession licensing boards.",
    documents: "Transcripts/mark sheets and diploma certificate",
  },
];

const Evaluations = () => {
  return (
    <div className="bg-background min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="tesla-section bg-primary">
        <div className="absolute inset-0 bg-gradient-to-b from-primary via-primary/95 to-primary" />
        <div className="tesla-section-content text-primary-foreground animate-fade-in-up">
          <p className="text-sm font-medium tracking-[0.2em] uppercase mb-3 opacity-80">
            Credentials Recognized
          </p>
          <h1 className="tesla-hero-title">Academic Evaluations</h1>
          <p className="tesla-hero-subtitle max-w-2xl mx-auto mt-4 opacity-80">
            Get your well-earned academic credentials recognized by U.S.
            universities, employers, and state governmental institutions.
          </p>
          <div className="tesla-cta-group">
            <a
              href="#services"
              className="tesla-btn-outline !border-primary-foreground/60 !text-primary-foreground"
            >
              View Services
            </a>
          </div>
        </div>
        <div className="absolute bottom-8 z-10 animate-scroll-indicator">
          <ChevronDown size={28} className="text-primary-foreground" />
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium tracking-[0.2em] uppercase text-muted-foreground mb-3">
              Choose Your Evaluation
            </p>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-foreground">
              Service Tiers
            </h2>
          </div>

          <div className="space-y-8">
            {evaluationServices.map((service, idx) => (
              <div
                key={idx}
                className="border border-border rounded-sm overflow-hidden transition-all duration-300 hover:shadow-lg"
              >
                {/* Card Header */}
                <div className="bg-primary px-8 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <h3 className="text-xl md:text-2xl font-semibold text-primary-foreground tracking-tight">
                    {service.title}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl md:text-4xl font-bold text-primary-foreground">
                      ${service.price}
                    </span>
                    <span className="text-sm text-primary-foreground/60 ml-1">
                      standard
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Description */}
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-2">
                        Description
                      </h4>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-2 flex items-center gap-2">
                        <Award size={14} className="text-accent" />
                        Recommended For
                      </h4>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {service.recommendedFor}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-2 flex items-center gap-2">
                        <FileText size={14} className="text-accent" />
                        Required Documents
                      </h4>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {service.documents}
                      </p>
                    </div>
                  </div>

                  {/* Processing Times */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-3 flex items-center gap-2">
                      <Clock size={14} className="text-accent" />
                      Processing Options
                    </h4>

                    <div className="border border-border rounded-sm p-4 text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                        Standard
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        ${service.price}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {service.processing}
                      </p>
                    </div>

                    <div className="border border-accent/30 bg-accent/5 rounded-sm p-4 text-center">
                      <p className="text-xs text-accent uppercase tracking-wide mb-1 font-semibold">
                        Rush – 3 Business Days
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        ${service.rush3Day}
                      </p>
                    </div>

                    <div className="border border-accent/50 bg-accent/10 rounded-sm p-4 text-center">
                      <p className="text-xs text-accent uppercase tracking-wide mb-1 font-semibold">
                        Rush – 24 Hours
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        ${service.rush24Hr}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-8 pb-8">
                  <a
                    href="https://ifcsevals.com/application"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tesla-btn-primary inline-block text-center"
                  >
                    Start Application
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Back link */}
      <div className="text-center pb-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </div>

      <Footer />
    </div>
  );
};

export default Evaluations;
