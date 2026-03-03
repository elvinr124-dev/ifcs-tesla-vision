import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, X, CheckCircle, Send, CreditCard } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import translationsBg from "@/assets/translations-bg.jpg";

const countries = [
  "Afghanistan","Albania","Algeria","American Samoa","Andorra","Angola","Anguilla","Antarctica",
  "Antigua and Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas",
  "Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia",
  "Bosnia and Herzegowina","Botswana","Bouvet Island","Brazil","British Indian Ocean Territory",
  "Brunei Darussalam","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde",
  "Cayman Islands","Central African Republic","Chad","Chile","China","Christmas Island",
  "Cocos (Keeling) Islands","Colombia","Comoros","Congo","Congo, the Democratic Republic of the",
  "Cook Islands","Costa Rica","Cote d'Ivoire","Croatia (Hrvatska)","Cuba","Cyprus","Czech Republic",
  "Denmark","Djibouti","Dominica","Dominican Republic","East Timor","Ecuador","Egypt","El Salvador",
  "Equatorial Guinea","Eritrea","Estonia","Ethiopia","Falkland Islands (Malvinas)","Faroe Islands",
  "Fiji","Finland","France","France Metropolitan","French Guiana","French Polynesia",
  "French Southern Territories","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece",
  "Greenland","Grenada","Guadeloupe","Guam","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti",
  "Heard and Mc Donald Islands","Holy See (Vatican City State)","Honduras","Hong Kong","Hungary",
  "Iceland","India","Indonesia","Iran (Islamic Republic of)","Iraq","Ireland","Israel","Italy",
  "Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Korea, Democratic People's Republic of",
  "Korea, Republic of","Kuwait","Kyrgyzstan","Lao, People's Democratic Republic","Latvia","Lebanon",
  "Lesotho","Liberia","Libyan Arab Jamahiriya","Liechtenstein","Lithuania","Luxembourg","Macau",
  "Macedonia, The Former Yugoslav Republic of","Madagascar","Malawi","Malaysia","Maldives","Mali",
  "Malta","Marshall Islands","Martinique","Mauritania","Mauritius","Mayotte","Mexico",
  "Micronesia, Federated States of","Moldova, Republic of","Monaco","Mongolia","Montserrat","Morocco",
  "Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","Netherlands Antilles",
  "New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","Niue","Norfolk Island",
  "Northern Mariana Islands","Norway","Oman","Pakistan","Palau","Panama","Papua New Guinea",
  "Paraguay","Peru","Philippines","Pitcairn","Poland","Portugal","Puerto Rico","Qatar","Reunion",
  "Romania","Russian Federation","Rwanda","Saint Kitts and Nevis","Saint Lucia",
  "Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia",
  "Senegal","Seychelles","Sierra Leone","Singapore","Slovakia (Slovak Republic)","Slovenia",
  "Solomon Islands","Somalia","South Africa","South Georgia and the South Sandwich Islands","Spain",
  "Sri Lanka","St. Helena","St. Pierre and Miquelon","Sudan","Suriname","Svalbard and Jan Mayen Islands",
  "Swaziland","Sweden","Switzerland","Syrian Arab Republic","Taiwan, Province of China","Tajikistan",
  "Tanzania, United Republic of","Thailand","Togo","Tokelau","Tonga","Trinidad and Tobago","Tunisia",
  "Turkey","Turkmenistan","Turks and Caicos Islands","Tuvalu","Uganda","Ukraine","United Arab Emirates",
  "United Kingdom","United States","United States Minor Outlying Islands","Uruguay","Uzbekistan",
  "Vanuatu","Venezuela","Vietnam","Virgin Islands (British)","Virgin Islands (U.S.)",
  "Wallis and Futuna Islands","Western Sahara","Yemen","Yugoslavia","Zambia","Zimbabwe",
];

const GlassInput = ({
  value, onChange, placeholder, type = "text", required,
}: {
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; type?: string; required?: boolean;
}) => (
  <input
    type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
    className="w-full h-12 px-4 rounded-2xl text-sm text-foreground placeholder:text-muted-foreground bg-muted/60 border border-border focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-accent transition-all duration-200 backdrop-blur-sm"
  />
);

const GlassSelect = ({
  value, onChange, children, required,
}: {
  value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode; required?: boolean;
}) => (
  <select
    value={value} onChange={onChange} required={required}
    className="w-full h-12 px-4 rounded-2xl text-sm text-foreground bg-muted/60 border border-border focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-accent transition-all duration-200 appearance-none backdrop-blur-sm"
  >
    {children}
  </select>
);

const FieldGroup = ({ label, required: req, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold tracking-[0.15em] uppercase text-muted-foreground">
      {label} {req && <span className="text-accent">*</span>}
    </label>
    {children}
  </div>
);

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-muted-foreground border-b border-border pb-2 mb-5">
    {children}
  </p>
);

const TranslationOrder = () => {
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middle, setMiddle] = useState("");
  const [phone, setPhone] = useState("");
  const [emailVal, setEmail] = useState("");
  const [addr1, setAddr1] = useState("");
  const [addr2, setAddr2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("");
  const [transFrom, setTransFrom] = useState("");
  const [transTo, setTransTo] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lastName.trim() || !firstName.trim() || !phone.trim() || !emailVal.trim() ||
        !transFrom.trim() || !transTo.trim()) {
      setError("Please fill in all required fields before submitting.");
      return;
    }
    setError("");
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen content-bg">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[50vh] min-h-[360px] w-full flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${translationsBg})` }} />
        <div className="video-overlay" />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-12">
          <Link to="/translations" className="inline-flex items-center gap-2 text-sm font-medium mb-8 opacity-70 hover:opacity-100 transition-opacity text-white">
            <ArrowLeft size={16} /> Back to Translations
          </Link>
          <p className="text-sm font-semibold tracking-[0.25em] uppercase text-accent mb-3">Get Your Documents Translated</p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white">
            Translation Order
          </h1>
          <p className="mt-4 text-base md:text-lg text-white/80 font-light max-w-xl">
            We provide translations from any language, for any document type, into English. Submit your documents to receive a quote.
          </p>
        </div>
      </section>

      {submitted ? (
        <section className="py-32 px-6 md:px-12 text-center">
          <div className="max-w-xl mx-auto rounded-3xl border border-accent/40 bg-accent/5 p-12">
            <CheckCircle size={56} className="text-accent mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-foreground mb-3">Order Submitted!</h2>
            <p className="text-muted-foreground font-light mb-8">Thank you! We'll review your documents and send a quote to your email shortly.</p>
            <Link to="/translations" className="inline-flex items-center gap-3 px-8 py-4 rounded-3xl bg-accent text-accent-foreground font-bold shadow-xl shadow-accent/40 hover:scale-105 transition-all duration-300">
              Back to Translations
            </Link>
          </div>
        </section>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="max-w-6xl mx-auto px-6 md:px-12 py-16 grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Left Column — Main Form */}
            <div className="lg:col-span-2 space-y-10">

              {error && (
                <div className="rounded-2xl bg-destructive/10 border border-destructive/30 px-5 py-4 text-sm text-destructive font-medium">
                  {error}
                </div>
              )}

              {/* Name on Documents */}
              <div className="rounded-3xl border border-border bg-card shadow-lg p-8 space-y-6">
                <SectionHeading>Name on Documents</SectionHeading>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FieldGroup label="Last" required>
                    <GlassInput value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" required />
                  </FieldGroup>
                  <FieldGroup label="First" required>
                    <GlassInput value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" required />
                  </FieldGroup>
                  <FieldGroup label="Middle">
                    <GlassInput value={middle} onChange={e => setMiddle(e.target.value)} placeholder="Middle (optional)" />
                  </FieldGroup>
                </div>
              </div>

              {/* Contact */}
              <div className="rounded-3xl border border-border bg-card shadow-lg p-8 space-y-6">
                <SectionHeading>Contact</SectionHeading>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldGroup label="Phone" required>
                    <GlassInput value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" type="tel" required />
                  </FieldGroup>
                  <FieldGroup label="E-mail" required>
                    <GlassInput value={emailVal} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" type="email" required />
                  </FieldGroup>
                </div>
              </div>

              {/* Address */}
              <div className="rounded-3xl border border-border bg-card shadow-lg p-8 space-y-6">
                <SectionHeading>Address</SectionHeading>
                <FieldGroup label="Address Line One">
                  <GlassInput value={addr1} onChange={e => setAddr1(e.target.value)} placeholder="Street address" />
                </FieldGroup>
                <FieldGroup label="Address Line Two">
                  <GlassInput value={addr2} onChange={e => setAddr2(e.target.value)} placeholder="Apt, suite, unit..." />
                </FieldGroup>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <FieldGroup label="City">
                    <GlassInput value={city} onChange={e => setCity(e.target.value)} placeholder="City" />
                  </FieldGroup>
                  <FieldGroup label="State">
                    <GlassInput value={state} onChange={e => setState(e.target.value)} placeholder="State" />
                  </FieldGroup>
                  <FieldGroup label="Zip">
                    <GlassInput value={zip} onChange={e => setZip(e.target.value)} placeholder="Zip code" />
                  </FieldGroup>
                </div>
                <FieldGroup label="Country">
                  <GlassSelect value={country} onChange={e => setCountry(e.target.value)}>
                    <option value="">Select country...</option>
                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                  </GlassSelect>
                </FieldGroup>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldGroup label="Translating From" required>
                    <GlassInput value={transFrom} onChange={e => setTransFrom(e.target.value)} placeholder="e.g. Spanish" required />
                  </FieldGroup>
                  <FieldGroup label="Translating Into" required>
                    <GlassInput value={transTo} onChange={e => setTransTo(e.target.value)} placeholder="e.g. English" required />
                  </FieldGroup>
                </div>
              </div>

              {/* Upload Documents */}
              <div className="rounded-3xl border border-border bg-card shadow-lg p-8 space-y-5">
                <SectionHeading>Upload Your Documents</SectionHeading>
                <p className="text-sm text-muted-foreground font-light">Select your files for upload (Max 4MB per file)</p>

                <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border rounded-2xl p-8 cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-all duration-200 group">
                  <Upload size={28} className="text-muted-foreground group-hover:text-accent transition-colors" />
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-accent transition-colors">Click to browse files</span>
                  <span className="text-xs text-muted-foreground/60">PDF, JPG, PNG supported</span>
                  <input type="file" multiple className="hidden" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
                </label>

                {files.length > 0 && (
                  <div className="space-y-2">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-3 rounded-2xl bg-muted/50 border border-border">
                        <span className="text-sm text-foreground truncate">{f.name}</span>
                        <button type="button" onClick={() => removeFile(i)} className="ml-3 text-muted-foreground hover:text-destructive transition-colors">
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                  className="text-sm font-medium text-accent hover:opacity-75 transition-opacity underline underline-offset-4"
                >
                  + Add another file
                </button>
              </div>

              {/* Submit */}
              <div className="flex justify-center pt-2 pb-6">
                <button
                  type="submit"
                  className="group inline-flex items-center gap-4 px-12 py-5 rounded-3xl bg-accent text-accent-foreground font-bold text-lg tracking-wide shadow-2xl shadow-accent/40 hover:shadow-accent/60 hover:scale-105 transition-all duration-300"
                >
                  <span>Submit Order</span>
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <Send size={20} />
                  </div>
                </button>
              </div>
            </div>

            {/* Right Column — Contact Us + Payment */}
            <div className="space-y-6">

              {/* Contact Us sidebar */}
              <div className="rounded-3xl border border-border bg-card shadow-lg p-8 space-y-5 sticky top-24">
                <SectionHeading>Contact Us</SectionHeading>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold tracking-[0.15em] uppercase text-muted-foreground">
                    Your Name <span className="text-accent">*</span>
                  </label>
                  <GlassInput value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Full name" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold tracking-[0.15em] uppercase text-muted-foreground">
                    Your E-mail Address <span className="text-accent">*</span>
                  </label>
                  <GlassInput value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="email@example.com" type="email" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold tracking-[0.15em] uppercase text-muted-foreground">
                    Your Phone Number
                  </label>
                  <GlassInput value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="+1 (555) 000-0000" type="tel" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold tracking-[0.15em] uppercase text-muted-foreground">
                    How Can We Help You? <span className="text-accent">*</span>
                  </label>
                  <textarea
                    value={contactMsg}
                    onChange={e => setContactMsg(e.target.value)}
                    placeholder="Tell us about your translation needs..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-2xl text-sm text-foreground placeholder:text-muted-foreground bg-muted/60 border border-border focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-accent transition-all duration-200 resize-none"
                  />
                </div>

                <button
                  type="button"
                  className="w-full group inline-flex items-center justify-center gap-3 px-6 py-4 rounded-3xl bg-accent text-accent-foreground font-bold text-base shadow-xl shadow-accent/30 hover:shadow-accent/50 hover:scale-105 transition-all duration-300"
                >
                  <span>Submit</span>
                  <Send size={16} />
                </button>
              </div>

              {/* Make a Payment */}
              <div className="rounded-3xl border border-border bg-card shadow-lg p-8 space-y-4">
                <SectionHeading>Make a Payment</SectionHeading>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">
                  Make a payment for translation (if you have already received a quote).
                </p>
                <button
                  type="button"
                  className="w-full group inline-flex items-center justify-center gap-3 px-6 py-4 rounded-3xl bg-foreground text-background font-bold text-base shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <CreditCard size={18} />
                  <span>Make Payment</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      <Footer />
    </div>
  );
};

export default TranslationOrder;
