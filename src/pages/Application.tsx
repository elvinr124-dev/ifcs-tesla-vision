import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, ArrowRight, CheckCircle2, User, BookOpen, Target, Package, CreditCard } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import brooklynBridge from "@/assets/brooklyn-bridge-night.jpg";

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const days = Array.from({ length: 31 }, (_, i) => i + 1);
const years = Array.from({ length: 116 }, (_, i) => 2015 - i);

const STEPS = [
  { num: 1, label: "Personal", icon: User },
  { num: 2, label: "Academic", icon: BookOpen },
  { num: 3, label: "Purpose", icon: Target },
  { num: 4, label: "Services", icon: Package },
  { num: 5, label: "Payment", icon: CreditCard },
];

/* ── Shared styled primitives ── */
const GlassInput = ({
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  maxLength,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
}) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    maxLength={maxLength}
    className="w-full h-12 px-4 rounded-2xl text-sm text-foreground placeholder:text-muted-foreground bg-muted/60 border border-border focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-accent transition-all duration-200 backdrop-blur-sm"
  />
);

const GlassSelect = ({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}) => (
  <select
    value={value}
    onChange={onChange}
    className="w-full h-12 px-4 rounded-2xl text-sm text-foreground bg-muted/60 border border-border focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-accent transition-all duration-200 appearance-none backdrop-blur-sm"
  >
    {children}
  </select>
);

const FieldGroup = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-semibold tracking-[0.12em] uppercase text-muted-foreground">
      {label} {required && <span className="text-accent">*</span>}
    </Label>
    {children}
  </div>
);

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-muted-foreground border-b border-border pb-2 mb-4">
    {children}
  </p>
);

const RadioCard = ({
  value,
  selected,
  onSelect,
  children,
}: {
  value: string;
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onSelect}
    className={`w-full text-left flex items-start gap-3 p-4 rounded-2xl border transition-all duration-200 ${
      selected
        ? "border-accent bg-accent/10 shadow-sm shadow-accent/20"
        : "border-border bg-muted/40 hover:bg-muted/70"
    }`}
  >
    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 transition-colors ${
      selected ? "border-accent bg-accent" : "border-muted-foreground"
    }`}>
      {selected && <div className="w-1.5 h-1.5 rounded-full bg-white mx-auto mt-[2px]" />}
    </div>
    <div className="text-sm text-foreground/90 leading-relaxed">{children}</div>
  </button>
);

const Application = () => {
  const location = useLocation();
  const routeState = location.state as {
    serviceTitle?: string;
    processingKey?: string;
    processingLabel?: string;
    processingTime?: string;
    price?: number;
  } | null;

  const selectedServiceTitle = routeState?.serviceTitle ?? "General Analysis";
  const selectedProcessingLabel = routeState?.processingLabel ?? "Standard";
  const selectedProcessingTime = routeState?.processingTime ?? "8–10 Business Days";
  const selectedPrice = routeState?.price ?? 100;

  const [step, setStep] = useState(1);

  // Step 1
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [credLastName, setCredLastName] = useState("");
  const [credFirstName, setCredFirstName] = useState("");
  const [credMiddleName, setCredMiddleName] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [gender, setGender] = useState("");
  const [homePhone, setHomePhone] = useState("");
  const [cellPhone, setCellPhone] = useState("");
  const [email, setEmail] = useState("");
  const [howHeard, setHowHeard] = useState("");

  // Step 2
  const [institutionName, setInstitutionName] = useState("");
  const [country, setCountry] = useState("");
  const [attendance, setAttendance] = useState("");
  const [degrees, setDegrees] = useState("");

  // Step 3
  const [purpose, setPurpose] = useState("");

  // Step 4
  const [appCode, setAppCode] = useState("");
  const [translationOption, setTranslationOption] = useState("english");
  const [authOption, setAuthOption] = useState("arrange");
  const [deliveryOptions, setDeliveryOptions] = useState<string[]>(["email-self"]);
  const [files, setFiles] = useState<File[]>([]);

  // Step 5
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardMonth, setCardMonth] = useState("");
  const [cardYear, setCardYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const toggleDelivery = (val: string) => {
    setDeliveryOptions((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles([...files, ...Array.from(e.target.files)]);
  };

  const handleSubmit = () => {
    alert("Application submitted! Your application ID: EE0039. We will contact you shortly.");
  };

  const next = () => setStep((s) => Math.min(s + 1, 5));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[50vh] min-h-[340px] w-full flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${brooklynBridge})` }} />
        <div className="video-overlay" />
        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 md:px-12">
          <Link to="/evaluations" className="inline-flex items-center gap-2 text-sm font-medium mb-6 opacity-70 hover:opacity-100 transition-opacity text-white">
            <ArrowLeft size={16} /> Back to Evaluations
          </Link>
          <p className="text-sm font-medium tracking-[0.2em] uppercase mb-3 text-accent">Get Started</p>
          <h1 className="tesla-hero-title text-white">Online Application</h1>
          <p className="tesla-hero-subtitle max-w-xl text-white/80">Complete the steps below to submit your credentials for evaluation.</p>
        </div>
      </section>

      {/* Stepper */}
      <div className="max-w-4xl mx-auto px-6 pt-12 pb-2">
        <div className="flex items-center justify-between gap-1">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = s.num < step;
            const active = s.num === step;
            return (
              <div key={s.num} className="flex items-center flex-1">
                <button
                  onClick={() => setStep(s.num)}
                  className={`flex flex-col items-center gap-1.5 group transition-all duration-300 ${active ? "scale-110" : ""}`}
                >
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md transition-all duration-300 ${
                      done
                        ? "bg-accent/30 border border-accent/50"
                        : active
                        ? "bg-accent shadow-lg shadow-accent/40"
                        : "bg-muted border border-border"
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 size={18} className="text-accent" />
                    ) : (
                      <Icon size={18} className={active ? "text-white" : "text-muted-foreground"} />
                    )}
                  </div>
                  <span className={`text-[10px] font-semibold tracking-wider uppercase hidden sm:block ${active ? "text-accent" : "text-muted-foreground"}`}>
                    {s.label}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-px mx-2 bg-border overflow-hidden">
                    <div
                      className="h-px bg-accent transition-all duration-500"
                      style={{ width: s.num < step ? "100%" : "0%" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form */}
      <section className="py-10 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">

          {/* Card shell */}
          <div className="rounded-3xl border border-border bg-card shadow-xl overflow-hidden">

            {/* Card top accent bar */}
            <div className="h-1 bg-gradient-to-r from-accent via-accent/60 to-transparent" />

            <div className="p-8 md:p-12 space-y-10">

              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-8 animate-fade-in">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Personal Information</h2>
                    <p className="text-sm text-muted-foreground mt-1">Step 1 of 5 — Tell us about yourself</p>
                  </div>

                  <div className="space-y-6">
                    <SectionHeading>Full Name</SectionHeading>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FieldGroup label="Last" required><GlassInput value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" /></FieldGroup>
                      <FieldGroup label="First" required><GlassInput value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" /></FieldGroup>
                      <FieldGroup label="Middle"><GlassInput value={middleName} onChange={(e) => setMiddleName(e.target.value)} placeholder="Middle name" /></FieldGroup>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <SectionHeading>Name on Educational Credentials (if different)</SectionHeading>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FieldGroup label="Last"><GlassInput value={credLastName} onChange={(e) => setCredLastName(e.target.value)} placeholder="Last name" /></FieldGroup>
                      <FieldGroup label="First"><GlassInput value={credFirstName} onChange={(e) => setCredFirstName(e.target.value)} placeholder="First name" /></FieldGroup>
                      <FieldGroup label="Middle"><GlassInput value={credMiddleName} onChange={(e) => setCredMiddleName(e.target.value)} placeholder="Middle name" /></FieldGroup>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <SectionHeading>Date of Birth</SectionHeading>
                    <div className="grid grid-cols-3 gap-4">
                      <FieldGroup label="Month" required>
                        <GlassSelect value={dobMonth} onChange={(e) => setDobMonth(e.target.value)}>
                          <option value="">Month</option>
                          {months.map((m) => <option key={m} value={m}>{m}</option>)}
                        </GlassSelect>
                      </FieldGroup>
                      <FieldGroup label="Day" required>
                        <GlassSelect value={dobDay} onChange={(e) => setDobDay(e.target.value)}>
                          <option value="">Day</option>
                          {days.map((d) => <option key={d} value={d}>{d}</option>)}
                        </GlassSelect>
                      </FieldGroup>
                      <FieldGroup label="Year" required>
                        <GlassSelect value={dobYear} onChange={(e) => setDobYear(e.target.value)}>
                          <option value="">Year</option>
                          {years.map((y) => <option key={y} value={y}>{y}</option>)}
                        </GlassSelect>
                      </FieldGroup>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <SectionHeading>Gender</SectionHeading>
                    <div className="flex gap-4">
                      {["male", "female"].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGender(g)}
                          className={`flex-1 py-3 rounded-2xl border text-sm font-semibold capitalize transition-all duration-200 ${
                            gender === g
                              ? "bg-accent text-accent-foreground border-accent shadow-md shadow-accent/30"
                              : "bg-muted/40 border-border text-foreground hover:bg-muted"
                          }`}
                        >
                          {g.charAt(0).toUpperCase() + g.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <SectionHeading>Contact Information</SectionHeading>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FieldGroup label="Home Phone"><GlassInput value={homePhone} onChange={(e) => setHomePhone(e.target.value)} type="tel" placeholder="(555) 000-0000" /></FieldGroup>
                      <FieldGroup label="Cell Phone"><GlassInput value={cellPhone} onChange={(e) => setCellPhone(e.target.value)} type="tel" placeholder="(555) 000-0000" /></FieldGroup>
                    </div>
                    <FieldGroup label="E-mail Address" required><GlassInput value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" /></FieldGroup>
                    <FieldGroup label="How did you hear about IFCS?"><GlassInput value={howHeard} onChange={(e) => setHowHeard(e.target.value)} placeholder="Google, referral, etc." /></FieldGroup>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="space-y-8 animate-fade-in">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Academic History</h2>
                    <p className="text-sm text-muted-foreground mt-1">Step 2 of 5 — List the institutions you attended for the credentials you need evaluated.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FieldGroup label="Name of Institution" required><GlassInput value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} placeholder="e.g. University of Lagos" /></FieldGroup>
                    <FieldGroup label="Country" required><GlassInput value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. Nigeria" /></FieldGroup>
                    <FieldGroup label="Dates of Attendance" required><GlassInput value={attendance} onChange={(e) => setAttendance(e.target.value)} placeholder="e.g. 2015–2019" /></FieldGroup>
                    <FieldGroup label="Degree(s) Earned"><GlassInput value={degrees} onChange={(e) => setDegrees(e.target.value)} placeholder="e.g. B.Sc. Computer Science" /></FieldGroup>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="space-y-8 animate-fade-in">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Purpose of Evaluation</h2>
                    <p className="text-sm text-muted-foreground mt-1">Step 3 of 5 — Select the primary purpose for your evaluation.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {["Further Education", "Immigration", "Licensing Boards", "Employment", "Military", "Other"].map((p) => (
                      <RadioCard
                        key={p}
                        value={p}
                        selected={purpose === p}
                        onSelect={() => setPurpose(p)}
                      >
                        <span className="font-medium">{p}</span>
                      </RadioCard>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4 */}
              {step === 4 && (
                <div className="space-y-8 animate-fade-in">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Additional Services</h2>
                    <p className="text-sm text-muted-foreground mt-1">Step 4 of 5 — Translation, documents, and delivery preferences.</p>
                  </div>

                  <div className="space-y-3">
                    <SectionHeading>Application Code (optional)</SectionHeading>
                    <p className="text-xs text-muted-foreground -mt-2">If you were given an application code by a referring institution, enter it here.</p>
                    <GlassInput value={appCode} onChange={(e) => setAppCode(e.target.value)} placeholder="Enter code" />
                  </div>

                  <div className="space-y-3">
                    <SectionHeading>Translation</SectionHeading>
                    <p className="text-xs text-muted-foreground -mt-2">If your documents are in a foreign language and you do not have a certified translation, we can provide a translation quote.</p>
                    <div className="space-y-2">
                      <RadioCard value="english" selected={translationOption === "english"} onSelect={() => setTranslationOption("english")}>
                        All my documents are in English and I do not need translation
                      </RadioCard>
                      <RadioCard value="own-translation" selected={translationOption === "own-translation"} onSelect={() => setTranslationOption("own-translation")}>
                        My documents are in a foreign language but I will provide a certified translation with copies of original documents
                      </RadioCard>
                      <RadioCard value="need-quote" selected={translationOption === "need-quote"} onSelect={() => setTranslationOption("need-quote")}>
                        My documents are in a foreign language and I need a quote for translation services
                      </RadioCard>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <SectionHeading>Submission of Academic Records</SectionHeading>
                    <p className="text-xs text-muted-foreground -mt-2">Please upload clear, legible copies of your diploma certificates and transcripts/mark sheets. (Max 10MB)</p>
                    <label className="flex flex-col items-center justify-center w-full h-28 rounded-2xl border-2 border-dashed border-border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                      <span className="text-sm text-muted-foreground">Click to select files</span>
                      {files.length > 0 && (
                        <span className="text-xs text-accent mt-1">{files.length} file(s) selected</span>
                      )}
                      <input type="file" multiple onChange={handleFileChange} className="hidden" />
                    </label>

                    <div className="space-y-2 pt-2">
                      <RadioCard value="arrange" selected={authOption === "arrange"} onSelect={() => setAuthOption("arrange")}>
                        I will arrange with the issuing institution(s) to send official documents to IFCS.
                      </RadioCard>
                      <RadioCard value="authenticate" selected={authOption === "authenticate"} onSelect={() => setAuthOption("authenticate")}>
                        Please perform document authentication <span className="font-bold text-accent">($140)</span>
                      </RadioCard>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Note: Your report can only be released once your studies have been verified. All records should be mailed to: <strong>6 Cedar St, Dobbs Ferry, NY 10522</strong>, or sent electronically to: <strong>docs@ifcsevals.com</strong>
                    </p>
                  </div>

                  <div className="space-y-3">
                    <SectionHeading>Delivery Services</SectionHeading>
                    <div className="space-y-2">
                      {[
                        { value: "email-self", label: "E-Mail to the address provided in part one", price: "Free" },
                        { value: "email-inst", label: "E-mail address of the institution receiving my report", price: "$5" },
                        { value: "us-postage", label: "US Postage", price: "$10/address" },
                        { value: "domestic-courier", label: "Domestic Courier", price: "$25/address" },
                        { value: "intl-courier", label: "International Courier", price: "$60/address" },
                      ].map((opt) => {
                        const active = deliveryOptions.includes(opt.value);
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => toggleDelivery(opt.value)}
                            className={`w-full text-left flex items-center justify-between gap-3 p-4 rounded-2xl border transition-all duration-200 ${
                              active
                                ? "border-accent bg-accent/10 shadow-sm shadow-accent/20"
                                : "border-border bg-muted/40 hover:bg-muted/70"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${active ? "border-accent bg-accent" : "border-muted-foreground"}`}>
                                {active && <CheckCircle2 size={12} className="text-white" />}
                              </div>
                              <span className="text-sm text-foreground/90">{opt.label}</span>
                            </div>
                            <span className={`text-xs font-bold flex-shrink-0 ${active ? "text-accent" : "text-muted-foreground"}`}>{opt.price}</span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Two copies of the evaluation are included. Additional copies available at $20 each.</p>
                  </div>
                </div>
              )}

              {/* STEP 5 */}
              {step === 5 && (
                <div className="space-y-8 animate-fade-in">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Review & Payment</h2>
                    <p className="text-sm text-muted-foreground mt-1">Step 5 of 5 — Confirm your order and complete payment.</p>
                  </div>

                  {/* Order summary */}
                  <div className="rounded-2xl border border-border bg-muted/40 p-6 space-y-3">
                    <SectionHeading>Your Order Summary</SectionHeading>
                    <div className="space-y-2">
                      {[
                        { label: "Order", value: `${selectedServiceTitle} — ${selectedProcessingLabel} (${selectedProcessingTime})` },
                        { label: "Price", value: `$${selectedPrice}` },
                        { label: "Authentication", value: authOption === "authenticate" ? "Perform Document Authentication (+$140)" : "Self-arranged" },
                        { label: "Delivery", value: deliveryOptions.includes("email-self") ? "E-Mail To Address Provided (Free)" : deliveryOptions.join(", ") },
                        { label: "Application ID", value: "EE0039", highlight: true },
                      ].map((row) => (
                        <div key={row.label} className="flex items-start justify-between gap-4 text-sm">
                          <span className="text-muted-foreground flex-shrink-0">{row.label}:</span>
                          <span className={`text-right font-medium ${row.highlight ? "text-accent font-bold" : "text-foreground"}`}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-3">
                    <p className="text-xs text-destructive font-semibold">
                      ⚠ Please note your application is NOT complete. You must click "Submit Application" to complete your transaction. A confirmation email will be sent after successful payment.
                    </p>
                  </div>

                  {/* Payment */}
                  <div className="space-y-6">
                    <SectionHeading>Card Details</SectionHeading>
                    <div className="space-y-4">
                      <FieldGroup label="Cardholder's Name" required>
                        <GlassInput value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Full name as on card" />
                      </FieldGroup>
                      <FieldGroup label="Card Number" required>
                        <GlassInput value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="•••• •••• •••• ••••" maxLength={19} />
                      </FieldGroup>
                      <div className="grid grid-cols-3 gap-4">
                        <FieldGroup label="Month" required>
                          <GlassSelect value={cardMonth} onChange={(e) => setCardMonth(e.target.value)}>
                            <option value="">MM</option>
                            {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </GlassSelect>
                        </FieldGroup>
                        <FieldGroup label="Year" required>
                          <GlassSelect value={cardYear} onChange={(e) => setCardYear(e.target.value)}>
                            <option value="">YYYY</option>
                            {Array.from({ length: 14 }, (_, i) => 2024 + i).map((y) => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </GlassSelect>
                        </FieldGroup>
                        <FieldGroup label="CVV" required>
                          <GlassInput value={cvv} onChange={(e) => setCvv(e.target.value)} placeholder="•••" maxLength={4} />
                        </FieldGroup>
                      </div>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="space-y-3 border-t border-border pt-6">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">Legal Agreement</p>
                    {[
                      { id: "terms", label: "I agree to the terms and conditions", checked: agreeTerms, onChange: (v: boolean) => setAgreeTerms(v) },
                      { id: "privacy", label: "I agree to the privacy policy", checked: agreePrivacy, onChange: (v: boolean) => setAgreePrivacy(v) },
                    ].map((item) => (
                      <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                        <Checkbox
                          id={item.id}
                          checked={item.checked}
                          onCheckedChange={(v) => item.onChange(!!v)}
                          className="rounded-md"
                        />
                        <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-8 border-t border-border">
                {step > 1 ? (
                  <button
                    onClick={prev}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-border bg-muted/50 text-sm font-semibold text-foreground hover:bg-muted transition-all duration-200"
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                ) : (
                  <div />
                )}

                {step < 5 ? (
                  <button
                    onClick={next}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-accent text-accent-foreground text-sm font-semibold shadow-lg shadow-accent/30 hover:bg-accent/90 hover:shadow-accent/50 transition-all duration-200 hover:scale-105"
                  >
                    Continue — {step}/5 <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!agreeTerms || !agreePrivacy}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-accent text-accent-foreground text-sm font-semibold shadow-lg shadow-accent/30 hover:bg-accent/90 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                  >
                    Submit Application 5/5 <CheckCircle2 size={16} />
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Application;
