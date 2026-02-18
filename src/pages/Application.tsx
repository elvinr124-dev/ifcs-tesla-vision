import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import brooklynBridge from "@/assets/brooklyn-bridge-night.jpg";

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const days = Array.from({ length: 31 }, (_, i) => i + 1);
const years = Array.from({ length: 116 }, (_, i) => 2015 - i);

const Application = () => {
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

  const selectClass =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[50vh] min-h-[360px] w-full flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${brooklynBridge})` }} />
        <div className="video-overlay" />
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-12">
          <Link to="/evaluations" className="inline-flex items-center gap-2 text-sm font-medium mb-6 opacity-70 hover:opacity-100 transition-opacity text-white">
            <ArrowLeft size={16} /> Back to Evaluations
          </Link>
          <p className="text-sm font-medium tracking-[0.2em] uppercase mb-3 text-accent">Get Started</p>
          <h1 className="tesla-hero-title text-white">Online Application</h1>
          <p className="tesla-hero-subtitle max-w-2xl text-white/80">Complete the steps below to submit your credentials for evaluation.</p>
        </div>
      </section>

      {/* Progress */}
      <div className="max-w-3xl mx-auto px-6 pt-10 pb-4">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => setStep(s)}
              className={`w-10 h-10 rounded-full text-sm font-bold flex items-center justify-center transition-colors ${
                s === step
                  ? "bg-accent text-accent-foreground"
                  : s < step
                  ? "bg-accent/20 text-accent"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="w-full bg-muted rounded-full h-1.5">
          <div className="bg-accent h-1.5 rounded-full transition-all" style={{ width: `${(step / 5) * 100}%` }} />
        </div>
      </div>

      {/* Form Steps */}
      <section className="py-8 px-6 md:px-12">
        <div className="max-w-3xl mx-auto rounded-lg border border-border bg-card p-8">

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold text-foreground">1. Personal Information</h2>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">Name</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label>Last *</Label>
                    <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <Label>First *</Label>
                    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Middle</Label>
                    <Input value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                  Name on Educational Credentials (if different)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label>Last</Label>
                    <Input value={credLastName} onChange={(e) => setCredLastName(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>First</Label>
                    <Input value={credFirstName} onChange={(e) => setCredFirstName(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Middle</Label>
                    <Input value={credMiddleName} onChange={(e) => setCredMiddleName(e.target.value)} />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">Date of Birth *</h3>
                <div className="grid grid-cols-3 gap-4">
                  <select className={selectClass} value={dobMonth} onChange={(e) => setDobMonth(e.target.value)}>
                    <option value="">Month</option>
                    {months.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select className={selectClass} value={dobDay} onChange={(e) => setDobDay(e.target.value)}>
                    <option value="">Day</option>
                    {days.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select className={selectClass} value={dobYear} onChange={(e) => setDobYear(e.target.value)}>
                    <option value="">Year</option>
                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Gender *</Label>
                <RadioGroup value={gender} onValueChange={setGender} className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Home Phone</Label>
                    <Input value={homePhone} onChange={(e) => setHomePhone(e.target.value)} type="tel" />
                  </div>
                  <div className="space-y-1">
                    <Label>Cell Phone</Label>
                    <Input value={cellPhone} onChange={(e) => setCellPhone(e.target.value)} type="tel" />
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <Label>E-mail Address *</Label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
                </div>
              </div>

              <div className="space-y-1">
                <Label>How did you hear about IFCS?</Label>
                <Input value={howHeard} onChange={(e) => setHowHeard(e.target.value)} />
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold text-foreground">2. Academic History</h2>
              <p className="text-sm text-muted-foreground">List the educational institution(s) you attended for the credential(s) you need evaluated.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Name of Institution *</Label>
                  <Input value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label>Country *</Label>
                  <Input value={country} onChange={(e) => setCountry(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label>Dates of Attendance *</Label>
                  <Input value={attendance} onChange={(e) => setAttendance(e.target.value)} placeholder="e.g. 2015–2019" required />
                </div>
                <div className="space-y-1">
                  <Label>Degree(s) Earned</Label>
                  <Input value={degrees} onChange={(e) => setDegrees(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold text-foreground">3. Purpose of Evaluation</h2>
              <p className="text-sm text-muted-foreground">Check the appropriate box.</p>
              <RadioGroup value={purpose} onValueChange={setPurpose} className="space-y-3">
                {["Further Education", "Immigration", "Licensing Boards", "Employment", "Military", "Other"].map((p) => (
                  <div key={p} className="flex items-center gap-3 p-3 rounded-md border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={p} id={`purpose-${p}`} />
                    <Label htmlFor={`purpose-${p}`} className="cursor-pointer flex-1">{p}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold text-foreground">4. Additional Services</h2>

              <div className="space-y-1">
                <Label>Application Code</Label>
                <p className="text-xs text-muted-foreground mb-2">If you were given an application code by a referring institution, enter it here.</p>
                <Input value={appCode} onChange={(e) => setAppCode(e.target.value)} />
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">Translation</h3>
                <p className="text-xs text-muted-foreground mb-3">If your documents are in a foreign language and you do not have a certified translation, we can provide a translation quote.</p>
                <RadioGroup value={translationOption} onValueChange={setTranslationOption} className="space-y-2">
                  <div className="flex items-start gap-3 p-3 rounded-md border border-border">
                    <RadioGroupItem value="english" id="t-eng" className="mt-0.5" />
                    <Label htmlFor="t-eng" className="cursor-pointer text-sm">All my documents are in English and I do not need translation</Label>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-md border border-border">
                    <RadioGroupItem value="own-translation" id="t-own" className="mt-0.5" />
                    <Label htmlFor="t-own" className="cursor-pointer text-sm">My documents are in a foreign language but I will provide a certified translation with copies of original documents</Label>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-md border border-border">
                    <RadioGroupItem value="need-quote" id="t-quote" className="mt-0.5" />
                    <Label htmlFor="t-quote" className="cursor-pointer text-sm">My documents are in a foreign language and I need a quote for translation services</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Submission of Academic Records and Authentication
                </h3>
                <p className="text-xs text-muted-foreground mb-3">Please upload clear, legible copies of your diploma certificates and transcripts/mark sheets.</p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-accent/10 file:text-accent hover:file:bg-accent/20"
                />
                {files.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">{files.length} file(s) selected</p>
                )}

                <div className="mt-4">
                  <p className="text-xs text-muted-foreground mb-2">Please select one of the following:</p>
                  <RadioGroup value={authOption} onValueChange={setAuthOption} className="space-y-2">
                    <div className="flex items-start gap-3 p-3 rounded-md border border-border">
                      <RadioGroupItem value="arrange" id="auth-arrange" className="mt-0.5" />
                      <Label htmlFor="auth-arrange" className="cursor-pointer text-sm">I will arrange with the issuing institution(s) to send official documents to IFCS.</Label>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-md border border-border">
                      <RadioGroupItem value="authenticate" id="auth-do" className="mt-0.5" />
                      <Label htmlFor="auth-do" className="cursor-pointer text-sm">Please perform document authentication ($140)</Label>
                    </div>
                  </RadioGroup>
                </div>
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                  Note: Your report can only be released once your studies have been verified by the issuing institution(s), which may take longer than the timeframe selected. Applicants who select to arrange for official documents must request transcripts, mark sheets and examination certificates. All academic records should be mailed in a sealed envelope to: 6 Cedar St, Dobbs Ferry, NY 10522, or sent electronically to: docs@ifcsevals.com
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">Delivery Services</h3>
                <div className="space-y-2">
                  {[
                    { value: "email-self", label: "E-Mail to the address provided in part one (free)" },
                    { value: "email-inst", label: "E-mail address of the institution that needs to receive my report ($5)" },
                    { value: "us-postage", label: "US Postage ($10 per address)" },
                    { value: "domestic-courier", label: "Domestic Courier ($25 per address)" },
                    { value: "intl-courier", label: "International Courier ($60 per address)" },
                  ].map((opt) => (
                    <div key={opt.value} className="flex items-center gap-3 p-3 rounded-md border border-border">
                      <Checkbox
                        checked={deliveryOptions.includes(opt.value)}
                        onCheckedChange={() => toggleDelivery(opt.value)}
                        id={`del-${opt.value}`}
                      />
                      <Label htmlFor={`del-${opt.value}`} className="cursor-pointer text-sm">{opt.label}</Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">Two copies of the evaluation are included. You can order additional copies at $20 each.</p>
              </div>
            </div>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold text-foreground">5. Review & Payment</h2>

              <div className="rounded-md border border-border p-6 bg-muted/30 space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">Your Total</h3>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Your order:</span><span className="text-foreground font-medium">General Analysis No GPA 10 Business Days</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Authentication:</span><span className="text-foreground font-medium">{authOption === "authenticate" ? "Perform Document Authentication" : "Self-arranged"}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Delivery:</span><span className="text-foreground font-medium">{deliveryOptions.includes("email-self") ? "E-Mail To The Address Provided" : deliveryOptions.join(", ")}</span></div>
                <div className="flex justify-between text-sm border-t border-border pt-2 mt-2"><span className="text-muted-foreground">Application ID:</span><span className="font-bold text-accent">EE0039</span></div>
              </div>

              <p className="text-xs text-destructive font-medium">
                Please note your application is NOT complete. You must click "Submit Application" to complete your transaction.
              </p>

              <div className="space-y-4">
                <div className="space-y-1">
                  <Label>Cardholder's Name *</Label>
                  <Input value={cardName} onChange={(e) => setCardName(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label>Card Number *</Label>
                  <Input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} required placeholder="•••• •••• •••• ••••" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label>Month</Label>
                    <select className={selectClass} value={cardMonth} onChange={(e) => setCardMonth(e.target.value)}>
                      <option value="">MM</option>
                      {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label>Year</Label>
                    <select className={selectClass} value={cardYear} onChange={(e) => setCardYear(e.target.value)}>
                      <option value="">YYYY</option>
                      {Array.from({ length: 14 }, (_, i) => 2024 + i).map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label>CVV</Label>
                    <Input value={cvv} onChange={(e) => setCvv(e.target.value)} required maxLength={4} placeholder="•••" />
                  </div>
                </div>
              </div>

              <div className="space-y-3 border-t border-border pt-4">
                <p className="text-sm text-muted-foreground">Please read and agree to the terms and conditions & privacy policy:</p>
                <div className="flex items-center gap-3">
                  <Checkbox checked={agreeTerms} onCheckedChange={(v) => setAgreeTerms(!!v)} id="terms" />
                  <Label htmlFor="terms" className="cursor-pointer text-sm">I agree to the terms and conditions</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox checked={agreePrivacy} onCheckedChange={(v) => setAgreePrivacy(!!v)} id="privacy" />
                  <Label htmlFor="privacy" className="cursor-pointer text-sm">I agree to the privacy policy</Label>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
            {step > 1 ? (
              <Button variant="outline" onClick={prev} className="gap-2">
                <ArrowLeft size={16} /> Back
              </Button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <Button onClick={next} className="tesla-btn-primary !min-w-0 !px-8 gap-2">
                Continue with Application {step}/5 <ArrowRight size={16} />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!agreeTerms || !agreePrivacy}
                className="tesla-btn-primary !min-w-0 !px-8"
              >
                Submit Application 5/5
              </Button>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Application;
