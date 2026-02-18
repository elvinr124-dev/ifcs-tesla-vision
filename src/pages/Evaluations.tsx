import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FileText, Clock, Award, ArrowLeft } from "lucide-react";
import brooklynBridge from "@/assets/brooklyn-bridge-night.jpg";
import serviceMilitary from "@/assets/service-military.jpg";
import serviceEducation from "@/assets/service-education.jpg";
import serviceEmployment from "@/assets/service-employment.jpg";
import serviceGraduate from "@/assets/service-graduate.jpg";
import serviceHealth from "@/assets/service-health.jpg";

const evaluationServices = [
  {
    title: "General Analysis",
    price: 100,
    rush3Day: 150,
    rush24Hr: 195,
    processing: "8–10 Business Days",
    description:
      "Identifies country of study, institution attended, dates of attendance, credential received, and provides an overall U.S. equivalency of the credential earned.",
    recommendedFor: "Immigration, military and admission to junior colleges.",
    documents: "Transcripts/mark sheets and diploma certificate",
    bgImage: serviceMilitary,
  },
  {
    title: "General Analysis plus GPA",
    price: 150,
    rush3Day: 205,
    rush24Hr: 295,
    processing: "8–10 Business Days",
    description:
      "Identifies country of study, institution attended, dates of attendance, credential received, and provides an overall U.S. equivalency for the credential earned. Report includes overall GPA.",
    recommendedFor:
      "Admission to different types of institutions when GPA is required but no credit transfer is intended.",
    documents: "Transcripts/mark sheets and diploma certificate",
    bgImage: serviceEducation,
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
    bgImage: serviceEmployment,
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
      "Transfer, graduate admission, professional licensure, and individuals who have earned multiple university degrees.",
    documents:
      "Transcripts/mark sheets and diploma certificates. (Note: this service is only provided for post-secondary credentials.)",
    bgImage: serviceGraduate,
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
    bgImage: serviceHealth,
  },
];

const Evaluations = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero with Brooklyn Bridge */}
      <section className="relative h-[80vh] min-h-[600px] w-full flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${brooklynBridge})` }}
        />
        <div className="video-overlay" />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium mb-8 opacity-70 hover:opacity-100 transition-opacity text-white/70 hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <p className="text-sm font-medium tracking-[0.2em] uppercase mb-3 text-accent">
            Credentials Recognized
          </p>
          <h1 className="tesla-hero-title text-white">Academic Evaluations</h1>
          <p className="tesla-hero-subtitle max-w-2xl mt-4 text-white/80">
            Get your well-earned academic credentials recognized by U.S.
            universities, employers, and state governmental institutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <a href="#services" className="tesla-btn-primary !min-w-0 !px-10 text-center">
              View Services
            </a>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium tracking-[0.2em] uppercase mb-3 text-accent">
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
                className="rounded-sm overflow-hidden transition-all duration-300 hover:shadow-xl border border-border bg-card"
              >
                {/* Card Header with Background Image */}
                <div className="relative px-8 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${service.bgImage})` }}
                  />
                  <div className="absolute inset-0 bg-black/60" />
                  <h3 className="relative z-10 text-xl md:text-2xl font-semibold tracking-tight text-white">
                    {service.title}
                  </h3>
                  <div className="relative z-10 flex items-baseline gap-1">
                    <span className="text-3xl md:text-4xl font-bold text-white">
                      ${service.price}
                    </span>
                    <span className="text-sm ml-1 text-white/70">standard</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <h4 className="text-xs font-semibold tracking-[0.15em] uppercase mb-2 text-muted-foreground">
                        Description
                      </h4>
                      <p className="text-sm leading-relaxed text-foreground/80">
                        {service.description}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold tracking-[0.15em] uppercase mb-2 flex items-center gap-2 text-muted-foreground">
                        <Award size={14} className="text-accent" />
                        Recommended For
                      </h4>
                      <p className="text-sm leading-relaxed text-foreground/80">
                        {service.recommendedFor}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold tracking-[0.15em] uppercase mb-2 flex items-center gap-2 text-muted-foreground">
                        <FileText size={14} className="text-accent" />
                        Required Documents
                      </h4>
                      <p className="text-sm leading-relaxed text-foreground/80">
                        {service.documents}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold tracking-[0.15em] uppercase mb-3 flex items-center gap-2 text-muted-foreground">
                      <Clock size={14} className="text-accent" />
                      Processing Options
                    </h4>
                    <div className="rounded-sm p-4 text-center border border-border">
                      <p className="text-xs uppercase tracking-wide mb-1 text-muted-foreground">Standard</p>
                      <p className="text-2xl font-bold text-foreground">${service.price}</p>
                      <p className="text-xs mt-1 text-muted-foreground">{service.processing}</p>
                    </div>
                    <div className="rounded-sm p-4 text-center border border-accent/30 bg-accent/5">
                      <p className="text-xs uppercase tracking-wide mb-1 font-semibold text-accent">Rush – 3 Business Days</p>
                      <p className="text-2xl font-bold text-foreground">${service.rush3Day}</p>
                    </div>
                    <div className="rounded-sm p-4 text-center border border-accent/50 bg-accent/10">
                      <p className="text-xs uppercase tracking-wide mb-1 font-semibold text-accent">Rush – 24 Hours</p>
                      <p className="text-2xl font-bold text-foreground">${service.rush24Hr}</p>
                    </div>
                  </div>
                </div>

                <div className="px-8 pb-8">
                  <Link
                    to="/application"
                    className="tesla-btn-primary inline-block text-center !min-w-[260px]"
                  >
                    Start Application
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="text-center pb-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm transition-colors text-muted-foreground hover:text-foreground"
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
