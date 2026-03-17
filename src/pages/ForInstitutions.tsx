import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import brooklynBridge from "@/assets/brooklyn-bridge-night.jpg";
import { CheckCircle, ArrowRight, Send, FileText } from "lucide-react";
import logoIau from "@/assets/logo-iau.png";
import logoNafsa from "@/assets/logo-nafsa.png";
import logoUnesco from "@/assets/logo-unesco.png";
import logoEaie from "@/assets/logo-eaie.png";
import logoAacrao from "@/assets/logo-aacrao.png";

const benefits = [
  "Tailored evaluations in accordance with your admissions and transfer policies",
  "15% discount over our standard prices and the convenience of paying on monthly basis",
  "Direct access to our senior evaluators",
  "Electronic Evaluation reports sent directly to the person who handles international admission",
  "Reduced turnaround time",
];

const evaluationTypes = [
  {
    title: "General Analysis plus GPA",
    description:
      "Identifies Country of study, institution(s), dates of attendance, credentials received, and provides an overall U.S. equivalency for each credential earned. Report includes overall GPA.",
  },
  {
    title: "Course-by-Course",
    description:
      "Identifies Country of study, institution(s), dates of attendance, credentials received and provides a list of courses for each credential, semester credit hours, grades, an accumulative GPA and US equivalency for each credential.",
  },
  {
    title: "Comprehensive Course-by-Course",
    description:
      "Identifies Country of study, institution(s), dates of attendance, credentials received and provides a list of courses for each credential, semester credit hours, grades, classifies lower and upper-division, graduate level designations for each course and U.S. equivalency for each credential.",
  },
  {
    title: "Health Professions Course-by-Course",
    description:
      "Identifies Country of study, institution(s), dates of attendance, credentials received and provides a list of courses for each credential, semester credit hours, grades, classifies lower and upper-division, graduate level designations for each course, lists clinical experience, and U.S. equivalency for each credential.",
  },
];

const resources = [
  {
    name: "International Association of Universities",
    logo: logoIau,
    url: "https://www.iau-aiu.net/",
  },
  {
    name: "NAFSA: Association of International Educators",
    logo: logoNafsa,
    url: "https://www.nafsa.org/",
  },
  {
    name: "UNESCO",
    logo: logoUnesco,
    url: "https://www.unesco.org/",
  },
  {
    name: "European Association for International Education",
    logo: logoEaie,
    url: "https://www.eaie.org/",
  },
  {
    name: "AACRAO",
    logo: logoAacrao,
    url: "https://www.aacrao.org/",
  },
];

const GlassInput = ({
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    className="w-full h-12 px-4 rounded-2xl text-sm text-foreground placeholder:text-muted-foreground bg-muted/60 border border-border focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-accent transition-all duration-200 backdrop-blur-sm"
  />
);

const ForInstitutions = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[55vh] min-h-[380px] w-full flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${brooklynBridge})` }} />
        <div className="video-overlay" />
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-12 text-center">
          <p className="text-sm font-semibold tracking-[0.25em] uppercase text-accent mb-4">Partner With IFCS</p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
            For Institutions
          </h1>
          <p className="text-xl md:text-2xl text-white/80 font-light mt-5 max-w-2xl mx-auto">
            Streamlined credential evaluation and translation services for colleges, universities, and corporate clients.
          </p>
        </div>
      </section>

      {/* Information */}
      <section className="py-24 px-6 md:px-12 content-bg">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-semibold tracking-[0.25em] uppercase text-accent mb-3 text-center">About Us</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground text-center mb-10">Information</h2>

          <div className="rounded-3xl border border-border bg-card shadow-lg p-8 md:p-12 space-y-6 text-base md:text-lg text-muted-foreground font-light leading-relaxed">
            <p>
              The Institute of Foreign Credential Services (IFCS) provides academic credential evaluations, document
              authentication, research and professional translations to colleges, universities, immigration attorneys,
              employers, private agencies, and other corporate clients. We do all of this to help our clients
              economize on the time they may otherwise spend in trying to manage admissions and transfers from
              international universities.
            </p>
            <p>
              IFCS is unique among evaluation services by virtue of the personal attention applied to each and every
              account and through the partnerships we have built among individual institutions and organizations.
              Another major distinguishing factor is the experience of the IFCS evaluators themselves. Our senior
              staff members are recognized experts and opinion leaders in foreign credential evaluations. They are
              regular contributors to publications and conferences organized by organizations such as{" "}
              <span className="text-accent font-medium">NAFSA</span>,{" "}
              <span className="text-accent font-medium">AACRAO</span>, and{" "}
              <span className="text-accent font-medium">International Association of Universities</span>.
            </p>
            <p className="text-foreground font-medium">As an IFCS client you can expect to realize several benefits:</p>
          </div>

          {/* Benefits list */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-start gap-4 p-6 rounded-3xl border border-border bg-card shadow hover:border-accent/40 hover:shadow-md transition-all duration-300">
                <CheckCircle size={22} className="text-accent shrink-0 mt-0.5" />
                <p className="text-sm md:text-base text-muted-foreground font-light leading-relaxed">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Evaluation Descriptions */}
      <section className="py-24 px-6 md:px-12 content-bg-alt">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-semibold tracking-[0.25em] uppercase text-accent mb-3 text-center">Our Services</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground text-center mb-10">Evaluation Descriptions</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {evaluationTypes.map((evalType, i) => (
              <div
                key={i}
                className="rounded-3xl border border-border bg-card shadow-lg hover:border-accent/40 hover:shadow-xl transition-all duration-300 p-8 group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
                    <FileText size={20} className="text-accent" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold tracking-tight text-foreground group-hover:text-accent transition-colors">
                    {evalType.title}
                  </h3>
                </div>
                <p className="text-sm md:text-base text-muted-foreground font-light leading-relaxed">
                  {evalType.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="py-24 px-6 md:px-12 content-bg">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-semibold tracking-[0.25em] uppercase text-accent mb-3 text-center">Affiliations</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground text-center mb-10">Resources</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource, i) => (
              <a
                key={i}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-3xl border border-border bg-card shadow-lg hover:border-accent/40 hover:shadow-xl transition-all duration-300 p-8 flex flex-col items-center gap-5 text-center"
              >
                <div className="w-24 h-24 rounded-2xl bg-white flex items-center justify-center overflow-hidden p-3">
                  <img src={resource.logo} alt={resource.name} className="w-full h-full object-contain" />
                </div>
                <p className="text-sm md:text-base font-semibold text-foreground group-hover:text-accent transition-colors">
                  {resource.name}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Professional Training */}
      <section className="py-20 px-6 md:px-12 content-bg-alt">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl border border-border bg-card shadow-lg p-8 md:p-12">
            <p className="text-sm font-semibold tracking-[0.25em] uppercase text-accent mb-3">Professional Training</p>
            <h3 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground mb-6">Stay Current. Stay Competitive.</h3>
            <p className="text-base md:text-lg text-muted-foreground font-light leading-relaxed">
              Educational systems around the world change regularly. Whether your admissions personnel need updates
              in order to remain current or they simply need to learn the fundamental steps in evaluating foreign
              credentials, our staff can help.
            </p>
            <p className="mt-4 text-base md:text-lg text-muted-foreground font-light">
              Please contact us for a list of training sessions.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-24 px-6 md:px-12 content-bg">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-semibold tracking-[0.25em] uppercase text-accent mb-3 text-center">Get In Touch</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground text-center mb-10">Contact Us</h2>

          {submitted ? (
            <div className="rounded-3xl border border-accent/40 bg-accent/5 p-12 text-center">
              <CheckCircle size={48} className="text-accent mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-2">Message Sent!</h3>
              <p className="text-muted-foreground font-light">Thank you for reaching out. Our team will be in touch shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-card shadow-xl p-8 md:p-12 space-y-6">
              {error && (
                <div className="rounded-2xl bg-destructive/10 border border-destructive/30 px-5 py-4 text-sm text-destructive font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold tracking-[0.15em] uppercase text-muted-foreground">
                  Your Name <span className="text-accent">*</span>
                </label>
                <GlassInput value={name} onChange={e => setName(e.target.value)} placeholder="Full name" required />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold tracking-[0.15em] uppercase text-muted-foreground">
                  Your E-mail Address <span className="text-accent">*</span>
                </label>
                <GlassInput value={email} onChange={e => setEmail(e.target.value)} placeholder="email@institution.edu" type="email" required />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold tracking-[0.15em] uppercase text-muted-foreground">
                  Your Phone Number
                </label>
                <GlassInput value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" type="tel" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold tracking-[0.15em] uppercase text-muted-foreground">
                  How Can We Help You? <span className="text-accent">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Tell us about your institution's needs..."
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-2xl text-sm text-foreground placeholder:text-muted-foreground bg-muted/60 border border-border focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-accent transition-all duration-200 resize-none"
                />
              </div>

              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  className="group inline-flex items-center gap-4 px-10 py-5 rounded-3xl bg-accent text-accent-foreground font-bold text-lg tracking-wide shadow-2xl shadow-accent/40 hover:shadow-accent/60 hover:scale-105 transition-all duration-300"
                >
                  <span>Submit</span>
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <Send size={20} />
                  </div>
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* CTA — Online Application */}
      <section className="py-20 px-6 md:px-12 content-bg-alt">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h3 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground">Ready to get started?</h3>
          <p className="text-base md:text-lg text-muted-foreground font-light">
            Submit your institution's application online and our team will reach out within one business day.
          </p>
          <div className="flex justify-center pt-2">
            <Link
              to="/application"
              className="group inline-flex items-center gap-4 px-10 py-5 rounded-3xl bg-accent text-accent-foreground font-bold text-lg tracking-wide shadow-2xl shadow-accent/40 hover:shadow-accent/60 hover:scale-105 transition-all duration-300"
            >
              <span>Online Application</span>
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <ArrowRight size={20} />
              </div>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ForInstitutions;
