import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToHome from "@/components/BackToHome";
import { ArrowLeft, Briefcase, Phone, Mail } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useLocale } from "@/context/LocaleContext";
import consultingBg from "@/assets/consulting-bg.jpg";

const GlassInput = ({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
}) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full h-12 px-4 rounded-2xl text-sm text-foreground placeholder:text-muted-foreground bg-muted/60 border border-border focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-accent transition-all duration-200"
  />
);

const FieldGroup = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-semibold tracking-[0.12em] uppercase text-muted-foreground">
      {label} {required && <span className="text-accent">*</span>}
    </Label>
    {children}
  </div>
);

const BookConsultation = () => {
  const { translate } = useLocale();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!name || !email || !message) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative h-[80vh] min-h-[600px] w-full flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${consultingBg})` }} />
        <div className="video-overlay" />
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-12 text-center hero-text-shadow animate-fade-in-up">
          <p className="text-sm font-medium tracking-[0.2em] uppercase mb-3 text-accent">{translate("Schedule Your Session")}</p>
          <h1 className="tesla-hero-title text-white">{translate("Book a Consultation")}</h1>
          <p className="tesla-hero-subtitle max-w-2xl mx-auto mt-4 text-white/90">
            {translate("Get expert guidance on credential evaluations and admissions from our senior staff.")}
          </p>
        </div>
      </section>

      <section className="py-24 px-6 md:px-12 content-bg">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Info Side */}
          <div className="space-y-8">
            <div>
              <p className="text-sm font-medium tracking-[0.2em] uppercase text-accent mb-3">{translate("Evaluations Consulting")}</p>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4">{translate("Expert Advice, Zero Guesswork")}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A consultant is a professional who provides professional or expert advice in a particular area. Foreign credential evaluations, and admission policies of U.S. universities are our main areas of expertise. If you want to avoid expensive guesswork then it only makes sense to use IFCS as your personal guide.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-border bg-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <Briefcase size={18} className="text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{translate("Admissions & Academic Advising")}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our senior staff has extensive admissions and academic advisory experience. They have reviewed literally thousands of applications and know firsthand what is required among U.S. colleges and universities. Based on the education you have completed abroad, there is no doubt IFCS can help you find the institution and program best suited for you and streamline the application process along the way.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-accent/20 bg-accent/5">
              <h3 className="text-base font-semibold text-foreground mb-3">{translate("Pricing")}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  <span><strong className="text-foreground">Evaluation consultations</strong> — provided at <strong className="text-accent">NO CHARGE</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  <span><strong className="text-foreground">Admission & advisory consultations</strong> — <strong className="text-accent">$60/hour</strong> at our Dobbs Ferry office</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone size={16} className="text-accent" />
                <span>(914) 693-2840</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail size={16} className="text-accent" />
                <span>info@ifcsevals.com</span>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div>
            <div className="rounded-3xl border border-border bg-card shadow-xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-accent via-accent/60 to-transparent" />
              <div className="p-8 md:p-10">
                {submitted ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-3xl bg-accent/10 flex items-center justify-center">
                      <Mail size={28} className="text-accent" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Message Sent!</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                      We'll get back to you within 1 business day to schedule your consultation.
                    </p>
                    <Link to="/consulting" className="inline-flex items-center gap-2 text-sm text-accent hover:underline mt-4">
                      <ArrowLeft size={14} /> Back to Consulting
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight text-foreground">Contact Us</h3>
                      <p className="text-sm text-muted-foreground mt-1">We welcome any questions and promise a swift response.</p>
                    </div>

                    <div className="space-y-4">
                      <FieldGroup label="Your Name" required>
                        <GlassInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
                      </FieldGroup>
                      <FieldGroup label="Your E-mail Address" required>
                        <GlassInput value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" type="email" />
                      </FieldGroup>
                      <FieldGroup label="Your Phone Number">
                        <GlassInput value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(xxx) xxx-xxxx" />
                      </FieldGroup>
                      <FieldGroup label="How Can We Help You?" required>
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Tell us about your situation and how we can assist you..."
                          rows={5}
                          className="w-full px-4 py-3 rounded-2xl text-sm text-foreground placeholder:text-muted-foreground bg-muted/60 border border-border focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-accent transition-all duration-200 resize-none"
                        />
                      </FieldGroup>
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={!name || !email || !message}
                      className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-accent text-accent-foreground text-sm font-semibold shadow-lg shadow-accent/30 hover:bg-accent/90 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      Submit
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="text-center pb-16 content-bg">
        <Link to="/consulting" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} /> Back to Consulting
        </Link>
      </div>

      <BackToHome />
      <Footer />
    </div>
  );
};

export default BookConsultation;
