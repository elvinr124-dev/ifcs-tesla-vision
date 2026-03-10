import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FileText, Clock, Award, ArrowLeft, CheckCircle2, Eye } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import brooklynBridge from "@/assets/brooklyn-bridge-night.jpg";
import serviceMilitary from "@/assets/service-military.jpg";
import serviceEducation from "@/assets/service-education.jpg";
import serviceEmployment from "@/assets/service-employment.jpg";
import serviceGraduate from "@/assets/service-graduate.jpg";
import serviceHealth from "@/assets/service-health.jpg";
import serviceHsUni from "@/assets/service-highschool-uni.jpg";
import serviceCosmetology from "@/assets/service-cosmetology.jpg";

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
  documents: "Transcript/Marksheets and Diploma Certificate",
  docSlots: ["Transcript/Marksheets", "Diploma Certificate"],
  bgImage: serviceMilitary,
  sampleUrl: ""
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
  documents: "Transcript/Marksheets and Diploma Certificate",
  docSlots: ["Transcript/Marksheets", "Diploma Certificate"],
  bgImage: serviceEducation,
  sampleUrl: ""
},
{
  title: "Cosmetology Course-by-Course",
  price: 170,
  rush3Day: 275,
  rush24Hr: 375,
  processing: "8–10 Business Days",
  description:
  "Provides a detailed course-by-course evaluation of cosmetology credentials earned abroad, including training hours for each subject area, U.S. semester credit equivalencies, and an overall U.S. equivalency for the credential. Designed to meet the documentation requirements of state cosmetology licensing boards.",
  recommendedFor: "State cosmetology licensing boards, barbering, beauty therapy, hairdressing, and esthetics licensure.",
  documents: "Certificate and transcript with hours showing hours for each subject",
  docSlots: ["Certificate", "Transcript with Hours"],
  bgImage: serviceCosmetology,
  sampleUrl: ""
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
  documents: "Transcript/Marksheets and Diploma Certificate",
  docSlots: ["Transcript/Marksheets", "Diploma Certificate"],
  bgImage: serviceEmployment,
  sampleUrl: ""
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
  documents: "Transcript/Marksheets and Diploma Certificate",
  docSlots: ["Transcript/Marksheets", "Diploma Certificate"],
  bgImage: serviceHealth,
  sampleUrl: ""
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
  "Transcript/Marksheets and Diploma Certificates. (Note: this service is only provided for post-secondary credentials.)",
  docSlots: ["Transcript/Marksheets", "Diploma Certificate"],
  bgImage: serviceGraduate,
  sampleUrl: ""
},
{
  title: "High School and University Course-by-Course",
  price: 295,
  rush3Day: 395,
  rush24Hr: 495,
  processing: "8–10 Business Days",
  description:
  "Provides a comprehensive course-by-course evaluation covering both High School and University credentials. Includes a detailed listing of courses, semester credit hours, grades, GPA, and U.S. equivalencies for each credential level. Ideal for applicants who need both secondary and post-secondary education assessed in a single report.",
  recommendedFor: "Further education, university admission, and credential recognition for combined secondary and post-secondary studies.",
  documents: "High School diploma, High School transcript, University degree certificate, University transcript",
  docSlots: ["High School Diploma", "High School Transcript", "University Degree Certificate", "University Transcript"],
  bgImage: serviceHsUni,
  sampleUrl: ""
}];


type ProcessingKey = "standard" | "rush3" | "rush24";

const Evaluations = () => {
  const [selectedProcessing, setSelectedProcessing] = useState<Record<number, ProcessingKey>>({});
  const { addItem: addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const getSelectedPrice = (service: typeof evaluationServices[0], idx: number) => {
    const key = selectedProcessing[idx] ?? "standard";
    if (key === "rush3") return service.rush3Day;
    if (key === "rush24") return service.rush24Hr;
    return service.price;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Toast notification */}
      {toastMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl bg-accent text-accent-foreground text-sm font-semibold shadow-lg shadow-accent/30 animate-fade-in">
          {toastMsg}
        </div>
      )}

      {/* Hero with Brooklyn Bridge */}
      <section className="relative h-[80vh] min-h-[600px] w-full flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${brooklynBridge})` }} />
        
        <div className="video-overlay" />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-12 hero-text-shadow">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium mb-8 opacity-70 hover:opacity-100 transition-opacity text-white/70 hover:text-white">
            
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <p className="text-sm font-medium tracking-[0.2em] uppercase mb-3 text-white">
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
      <section id="services" className="py-24 px-4 sm:px-6 content-bg">
        <div className="max-w-[1600px] mx-auto w-full">
          <div className="text-center mb-16">
            <p className="text-sm font-medium tracking-[0.2em] uppercase mb-3 text-accent">
              Choose Your Evaluation
            </p>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-foreground">
              Service Tiers
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {evaluationServices.map((service, idx) => {
              const activeKey = selectedProcessing[idx] ?? "standard";
              return (
                <div
                  key={idx}
                  className="relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:scale-[1.01] hover:shadow-accent/20"
                  style={{ minHeight: 480 }}>
                  
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                    style={{ backgroundImage: `url(${service.bgImage})` }} />
                  
                  <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/60 to-black/40" />

                  <div className="relative z-10 p-8 md:p-10 h-full flex flex-col gap-6">

                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold tracking-[0.25em] uppercase text-accent mb-1">
                          Academic Evaluation
                        </p>
                        <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                          {service.title}
                        </h3>
                      </div>
                      <div className="flex-shrink-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3 text-center">
                        <p className="text-xs text-white/60 uppercase tracking-widest mb-1">From</p>
                        <p className="text-3xl font-bold text-white">${service.price}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white/8 backdrop-blur-sm border border-white/15 rounded-2xl p-5 space-y-1">
                        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/50 flex items-center gap-1.5">
                          <FileText size={11} /> Description
                        </p>
                        <p className="text-sm leading-relaxed text-white/85">
                          {service.description}
                        </p>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-white/8 backdrop-blur-sm border border-white/15 rounded-2xl p-5 space-y-1">
                          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/50 flex items-center gap-1.5">
                            <Award size={11} className="text-accent" /> Recommended For
                          </p>
                          <p className="text-sm leading-relaxed text-white/85">{service.recommendedFor}</p>
                        </div>
                        <div className="bg-white/8 backdrop-blur-sm border border-white/15 rounded-2xl p-5 space-y-1">
                          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/50 flex items-center gap-1.5">
                            <FileText size={11} /> Required Documents
                          </p>
                          <p className="text-sm leading-relaxed text-white/85">{service.documents}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/50 flex items-center gap-1.5 mb-3">
                        <Clock size={11} /> Select Processing Speed
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {([
                          { key: "standard" as ProcessingKey, label: "Standard", price: service.price, sub: service.processing },
                          { key: "rush3" as ProcessingKey, label: "Rush 3-Day", price: service.rush3Day, sub: "3 Business Days" },
                          { key: "rush24" as ProcessingKey, label: "Rush 24hr", price: service.rush24Hr, sub: "24 Hours" }
                        ] as const).map((opt) => {
                          const isActive = activeKey === opt.key;
                          return (
                            <button
                              key={opt.key}
                              onClick={() =>
                                setSelectedProcessing((prev) => ({ ...prev, [idx]: opt.key }))
                              }
                              className={`relative rounded-2xl p-4 text-center transition-all duration-300 border ${
                                isActive ?
                                "bg-accent border-accent shadow-lg shadow-accent/30 scale-[1.03]" :
                                "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20"}`
                              }>
                              {isActive &&
                                <CheckCircle2 size={14} className="absolute top-2 right-2 text-white" />
                              }
                              <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isActive ? "text-white" : "text-white/60"}`}>
                                {opt.label}
                              </p>
                              <p className={`text-xl font-bold ${isActive ? "text-white" : "text-white/90"}`}>
                                ${opt.price}
                              </p>
                              <p className={`text-[10px] mt-0.5 ${isActive ? "text-white/80" : "text-white/50"}`}>
                                {opt.sub}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-auto pt-2">
                      <p className="text-sm text-white/60">
                        Selected: <span className="text-white font-semibold">${getSelectedPrice(service, idx)}</span>
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            if (service.sampleUrl) {
                              window.open(service.sampleUrl, "_blank");
                            } else {
                              alert("Sample report coming soon!");
                            }
                          }}
                          className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold text-sm px-5 py-3 rounded-2xl hover:bg-white/20 transition-all duration-200">
                          <Eye size={16} /> View Sample
                        </button>
                        <button
                          onClick={() => {
                            const processingLabels: Record<ProcessingKey, string> = {
                              standard: "Standard",
                              rush3: "Rush 3-Day",
                              rush24: "Rush 24hr"
                            };
                            const processingTimes: Record<ProcessingKey, string> = {
                              standard: service.processing,
                              rush3: "3 Business Days",
                              rush24: "24 Hours"
                            };
                            const key = selectedProcessing[idx] ?? "standard";
                            addToCart({
                              serviceTitle: service.title,
                              processingKey: key,
                              processingLabel: processingLabels[key],
                              processingTime: processingTimes[key],
                              price: getSelectedPrice(service, idx),
                              clientUsername: "Guest"
                            });
                            showToast(`"${service.title} ${processingLabels[key]}" added to cart!`);
                          }}
                          className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/30 text-white font-semibold text-sm px-6 py-3 rounded-2xl hover:bg-white/25 transition-all duration-200 shadow-lg hover:scale-105">
                          🛒 Add to Cart
                        </button>
                        <button
                          onClick={() => {
                            if (!user) {
                              navigate("/login");
                            } else {
                              navigate("/application", {
                                state: {
                                  serviceTitle: service.title,
                                  processingKey: selectedProcessing[idx] ?? "standard",
                                  processingLabel: (() => {
                                    const k = selectedProcessing[idx] ?? "standard";
                                    return k === "rush3" ? "Rush 3-Day" : k === "rush24" ? "Rush 24hr" : "Standard";
                                  })(),
                                  processingTime: (() => {
                                    const k = selectedProcessing[idx] ?? "standard";
                                    return k === "rush3" ? "3 Business Days" : k === "rush24" ? "24 Hours" : service.processing;
                                  })(),
                                  price: getSelectedPrice(service, idx)
                                }
                              });
                            }
                          }}
                          className="inline-flex items-center gap-2 bg-white text-black font-semibold text-sm px-8 py-3 rounded-2xl hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105">
                          Start Application →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="text-center pb-16 content-bg">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm transition-colors text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </div>

      <Footer />
    </div>
  );
};

export default Evaluations;
