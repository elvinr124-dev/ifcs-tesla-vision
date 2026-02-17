import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ChevronDown, FileText, Clock, Award, ArrowLeft } from "lucide-react";
import brooklynBridge from "@/assets/brooklyn-bridge-night.jpg";

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
    <div className="min-h-screen" style={{ background: "hsl(220 30% 8%)" }}>
      <Navbar />

      {/* Hero with Brooklyn Bridge */}
      <section className="relative h-[80vh] min-h-[600px] w-full flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${brooklynBridge})` }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, hsla(220 60% 15% / 0.5) 0%, hsla(220 60% 10% / 0.7) 60%, hsla(220 30% 8% / 1) 100%)",
          }}
        />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium mb-8 opacity-70 hover:opacity-100 transition-opacity"
            style={{ color: "hsl(45 90% 65%)" }}
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <p
            className="text-sm font-medium tracking-[0.2em] uppercase mb-3"
            style={{ color: "hsl(45 90% 65%)" }}
          >
            Credentials Recognized
          </p>
          <h1
            className="tesla-hero-title"
            style={{ color: "hsl(0 0% 100%)" }}
          >
            Academic Evaluations
          </h1>
          <p
            className="tesla-hero-subtitle max-w-2xl mt-4"
            style={{ color: "hsl(210 20% 80%)" }}
          >
            Get your well-earned academic credentials recognized by U.S.
            universities, employers, and state governmental institutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <a
              href="#services"
              className="px-12 py-3 text-sm font-medium tracking-wide rounded-sm transition-all duration-200 min-w-[260px] text-center"
              style={{
                background: "hsl(45 90% 55%)",
                color: "hsl(220 30% 8%)",
              }}
            >
              View Services
            </a>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p
              className="text-sm font-medium tracking-[0.2em] uppercase mb-3"
              style={{ color: "hsl(45 90% 65%)" }}
            >
              Choose Your Evaluation
            </p>
            <h2
              className="text-3xl md:text-5xl font-semibold tracking-tight"
              style={{ color: "hsl(0 0% 95%)" }}
            >
              Service Tiers
            </h2>
          </div>

          <div className="space-y-8">
            {evaluationServices.map((service, idx) => (
              <div
                key={idx}
                className="rounded-sm overflow-hidden transition-all duration-300 hover:shadow-xl"
                style={{
                  border: "1px solid hsl(220 30% 20%)",
                  background: "hsl(220 25% 12%)",
                }}
              >
                {/* Card Header */}
                <div
                  className="px-8 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(217 80% 40%), hsl(217 70% 30%))",
                  }}
                >
                  <h3
                    className="text-xl md:text-2xl font-semibold tracking-tight"
                    style={{ color: "hsl(0 0% 100%)" }}
                  >
                    {service.title}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span
                      className="text-3xl md:text-4xl font-bold"
                      style={{ color: "hsl(45 90% 65%)" }}
                    >
                      ${service.price}
                    </span>
                    <span
                      className="text-sm ml-1"
                      style={{ color: "hsl(210 20% 70%)" }}
                    >
                      standard
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Description */}
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <h4
                        className="text-xs font-semibold tracking-[0.15em] uppercase mb-2"
                        style={{ color: "hsl(210 20% 55%)" }}
                      >
                        Description
                      </h4>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: "hsl(210 15% 75%)" }}
                      >
                        {service.description}
                      </p>
                    </div>

                    <div>
                      <h4
                        className="text-xs font-semibold tracking-[0.15em] uppercase mb-2 flex items-center gap-2"
                        style={{ color: "hsl(210 20% 55%)" }}
                      >
                        <Award size={14} style={{ color: "hsl(45 90% 65%)" }} />
                        Recommended For
                      </h4>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: "hsl(210 15% 75%)" }}
                      >
                        {service.recommendedFor}
                      </p>
                    </div>

                    <div>
                      <h4
                        className="text-xs font-semibold tracking-[0.15em] uppercase mb-2 flex items-center gap-2"
                        style={{ color: "hsl(210 20% 55%)" }}
                      >
                        <FileText
                          size={14}
                          style={{ color: "hsl(45 90% 65%)" }}
                        />
                        Required Documents
                      </h4>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: "hsl(210 15% 75%)" }}
                      >
                        {service.documents}
                      </p>
                    </div>
                  </div>

                  {/* Processing Times */}
                  <div className="space-y-3">
                    <h4
                      className="text-xs font-semibold tracking-[0.15em] uppercase mb-3 flex items-center gap-2"
                      style={{ color: "hsl(210 20% 55%)" }}
                    >
                      <Clock size={14} style={{ color: "hsl(45 90% 65%)" }} />
                      Processing Options
                    </h4>

                    <div
                      className="rounded-sm p-4 text-center"
                      style={{ border: "1px solid hsl(220 30% 20%)" }}
                    >
                      <p
                        className="text-xs uppercase tracking-wide mb-1"
                        style={{ color: "hsl(210 20% 55%)" }}
                      >
                        Standard
                      </p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: "hsl(0 0% 95%)" }}
                      >
                        ${service.price}
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: "hsl(210 20% 55%)" }}
                      >
                        {service.processing}
                      </p>
                    </div>

                    <div
                      className="rounded-sm p-4 text-center"
                      style={{
                        border: "1px solid hsl(45 80% 45% / 0.3)",
                        background: "hsl(45 80% 45% / 0.08)",
                      }}
                    >
                      <p
                        className="text-xs uppercase tracking-wide mb-1 font-semibold"
                        style={{ color: "hsl(45 90% 65%)" }}
                      >
                        Rush – 3 Business Days
                      </p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: "hsl(0 0% 95%)" }}
                      >
                        ${service.rush3Day}
                      </p>
                    </div>

                    <div
                      className="rounded-sm p-4 text-center"
                      style={{
                        border: "1px solid hsl(45 80% 45% / 0.5)",
                        background: "hsl(45 80% 45% / 0.12)",
                      }}
                    >
                      <p
                        className="text-xs uppercase tracking-wide mb-1 font-semibold"
                        style={{ color: "hsl(45 90% 65%)" }}
                      >
                        Rush – 24 Hours
                      </p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: "hsl(0 0% 95%)" }}
                      >
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
                    className="inline-block text-center px-12 py-3 text-sm font-medium tracking-wide rounded-sm transition-all duration-200 min-w-[260px]"
                    style={{
                      background: "hsl(45 90% 55%)",
                      color: "hsl(220 30% 8%)",
                    }}
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
          className="inline-flex items-center gap-2 text-sm transition-colors"
          style={{ color: "hsl(210 20% 55%)" }}
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
