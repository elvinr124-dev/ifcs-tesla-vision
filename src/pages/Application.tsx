import { useState, useCallback, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToHome from "@/components/BackToHome";
import DocumentScanner from "@/components/DocumentScanner";
import { ArrowLeft, ArrowRight, CheckCircle2, User, BookOpen, Target, Package, CreditCard, Upload, X, AlertTriangle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
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

const GlassInput = ({
  value, onChange, placeholder, type = "text", required, maxLength,
}: {
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; type?: string; required?: boolean; maxLength?: number;
}) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} maxLength={maxLength}
    className="w-full h-12 px-4 rounded-2xl text-sm text-foreground placeholder:text-muted-foreground bg-muted/60 border border-border focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-accent transition-all duration-200 backdrop-blur-sm" />
);

const GlassSelect = ({ value, onChange, children }: { value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode }) => (
  <select value={value} onChange={onChange}
    className="w-full h-12 px-4 rounded-2xl text-sm text-foreground bg-muted/60 border border-border focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-accent transition-all duration-200 appearance-none backdrop-blur-sm">
    {children}
  </select>
);

const FieldGroup = ({ label, required, children, note }: { label: string; required?: boolean; children: React.ReactNode; note?: string }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-semibold tracking-[0.12em] uppercase text-muted-foreground">
      {label} {required && <span className="text-accent">*</span>}
      {note && <span className="text-[10px] font-normal normal-case tracking-normal ml-2 text-muted-foreground/60">({note})</span>}
    </Label>
    {children}
  </div>
);

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-muted-foreground border-b border-border pb-2 mb-4">
    {children}
  </p>
);

const RadioCard = ({ value, selected, onSelect, children }: { value: string; selected: boolean; onSelect: () => void; children: React.ReactNode }) => (
  <button type="button" onClick={onSelect}
    className={`w-full text-left flex items-start gap-3 p-4 rounded-2xl border transition-all duration-200 ${
      selected ? "border-accent bg-accent/10 shadow-sm shadow-accent/20" : "border-border bg-muted/40 hover:bg-muted/70"
    }`}>
    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 transition-colors ${selected ? "border-accent bg-accent" : "border-muted-foreground"}`}>
      {selected && <div className="w-1.5 h-1.5 rounded-full bg-white mx-auto mt-[2px]" />}
    </div>
    <div className="text-sm text-foreground/90 leading-relaxed">{children}</div>
  </button>
);

/* Terms content for popup */
const TERMS_CONTENT = [
  "I certify that the information provided in this application is true and correct.",
  "No evaluation will be prepared and no refunds will be issued if IFCS determines that your documents have been in any way altered, tampered or forged. Furthermore, all relevant institutions listed on the application will be notified of the forged documentation submitted to IFCS.",
  "Payment must be made in U.S. dollars by money order, check, cash, Visa or MasterCard. If the money order or check is issued by a bank outside of the U.S., it must contain the printed name of the U.S. bank with which the bank is affiliated. A $40 fee will be charged for all returned checks. All fees are subject to change without notice.",
  "Refunds will be made only if an applicant has overpaid for services to IFCS. Applications for 8-10 day service can only be cancelled within 24hr of submission and will be subject to a $50 minimum processing fee. No refunds can be issued for 24hr, and 3-day service.",
  "Institute of Foreign Credential Services reserves the right to refuse service to anyone for any reason.",
  "Institute of Foreign Credential Services reserves the right to request additional information and/or official documentation by the issuing institution during the application process. Additionally, IFCS reserves the right to contact the issuing institution and authenticate your educational credentials.",
  "My evaluation and/or translation will be completed entirely based on the documents I submit to IFCS.",
  "I release IFCS from any liability for damages resulting from the use of an evaluation or translation by me or third party.",
  "Evaluation reports can only be released once we have received official documents directly from the issuing institution(s), or confirmation of your studies, if you had selected our verification service.",
];

/** Generate a unique application ID from first + last initials + 4-digit number */
const generateAppId = (first: string, last: string): string => {
  const f = (first.trim()[0] || "X").toUpperCase();
  const l = (last.trim()[0] || "X").toUpperCase();
  const num = String(Math.floor(1000 + Math.random() * 9000)); // 4 digits
  return `${f}${l}${num}`;
};

type ShippingAddr = { firstName: string; mi: string; lastName: string; company: string; street: string; city: string; state: string; zip: string; country: string };

const AddressBlock = ({ label, priceEach, addresses, setAddresses, emptyAddr }: {
  label: string; priceEach: number;
  addresses: ShippingAddr[];
  setAddresses: React.Dispatch<React.SetStateAction<ShippingAddr[]>>;
  emptyAddr: () => ShippingAddr;
}) => {
  const updateAddr = (idx: number, field: keyof ShippingAddr, value: string) => {
    setAddresses(prev => prev.map((a, i) => i === idx ? { ...a, [field]: value } : a));
  };
  return (
    <div className="pl-8 pt-2 space-y-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{label} — ${priceEach}/address × {addresses.length} = <span className="text-accent">${priceEach * addresses.length}</span></p>
      {addresses.map((addr, idx) => (
        <div key={idx} className="space-y-3 p-4 rounded-2xl border border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Address {idx + 1}</p>
            {addresses.length > 1 && (
              <button type="button" onClick={() => setAddresses(prev => prev.filter((_, i) => i !== idx))} className="text-xs text-destructive hover:underline">Remove</button>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground italic">Name of Receiver or Company (at least one required)</p>
          <div className="grid grid-cols-3 gap-3">
            <FieldGroup label="First Name"><GlassInput value={addr.firstName} onChange={(e) => updateAddr(idx, "firstName", e.target.value)} placeholder="First" /></FieldGroup>
            <FieldGroup label="MI"><GlassInput value={addr.mi} onChange={(e) => updateAddr(idx, "mi", e.target.value)} placeholder="M" maxLength={1} /></FieldGroup>
            <FieldGroup label="Last Name"><GlassInput value={addr.lastName} onChange={(e) => updateAddr(idx, "lastName", e.target.value)} placeholder="Last" /></FieldGroup>
          </div>
          <FieldGroup label="Company"><GlassInput value={addr.company} onChange={(e) => updateAddr(idx, "company", e.target.value)} placeholder="Company (optional)" /></FieldGroup>
          <FieldGroup label="Street Address" required><GlassInput value={addr.street} onChange={(e) => updateAddr(idx, "street", e.target.value)} placeholder="123 Main St, Apt 4" /></FieldGroup>
          <div className="grid grid-cols-2 gap-3">
            <FieldGroup label="City" required><GlassInput value={addr.city} onChange={(e) => updateAddr(idx, "city", e.target.value)} placeholder="City" /></FieldGroup>
            <FieldGroup label="State / Province" required><GlassInput value={addr.state} onChange={(e) => updateAddr(idx, "state", e.target.value)} placeholder="State" /></FieldGroup>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FieldGroup label="ZIP / Postal Code" required><GlassInput value={addr.zip} onChange={(e) => updateAddr(idx, "zip", e.target.value)} placeholder="10001" /></FieldGroup>
            <FieldGroup label="Country" required><GlassInput value={addr.country} onChange={(e) => updateAddr(idx, "country", e.target.value)} placeholder="United States" /></FieldGroup>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => setAddresses(prev => [...prev, emptyAddr()])} className="text-xs text-accent font-semibold hover:underline">
        + Add another address
      </button>
    </div>
  );
};

const Application = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { discountCode, setDiscountCode, discountAmount } = useCart();
  const routeState = location.state as {
    serviceTitle?: string; processingKey?: string; processingLabel?: string; processingTime?: string; price?: number;
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
  const [email, setEmail] = useState(user?.email ?? "");
  const [howHeard, setHowHeard] = useState("");
  const [ssn, setSsn] = useState("");
  const [idFile, setIdFile] = useState<File | null>(null);

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
  const [institutionEmail, setInstitutionEmail] = useState("");
  const [additionalEmails, setAdditionalEmails] = useState<string[]>([]);
  const [wantMoreEmails, setWantMoreEmails] = useState(false);
  
  // Multiple addresses per shipping method
  const emptyAddr = (): ShippingAddr => ({ firstName: "", mi: "", lastName: "", company: "", street: "", city: "", state: "", zip: "", country: "" });
  const [usPostageAddresses, setUsPostageAddresses] = useState<ShippingAddr[]>([emptyAddr()]);
  const [domesticCourierAddresses, setDomesticCourierAddresses] = useState<ShippingAddr[]>([emptyAddr()]);
  const [intlCourierAddresses, setIntlCourierAddresses] = useState<ShippingAddr[]>([emptyAddr()]);
  
  const [files, setFiles] = useState<File[]>([]);
  const [hasDegree, setHasDegree] = useState<"yes" | "no" | null>(null);
  const [degreeFiles, setDegreeFiles] = useState<File[]>([]);

  // Step 5
  const [paymentMethod, setPaymentMethod] = useState<"card" | "ach">("card");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardMonth, setCardMonth] = useState("");
  const [cardYear, setCardYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [achRouting, setAchRouting] = useState("");
  const [achAccount, setAchAccount] = useState("");
  const [achName, setAchName] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  // T&C / PP popup
  const [termsPopupOpen, setTermsPopupOpen] = useState(false);
  const [privacyPopupOpen, setPrivacyPopupOpen] = useState(false);
  const [termsSignature, setTermsSignature] = useState("");
  const [privacySignature, setPrivacySignature] = useState("");
  const [pendingAgreement, setPendingAgreement] = useState<"terms" | "privacy" | null>(null);

  const [stepError, setStepError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Generate application ID based on first + last name (memoized so it stays stable)
  const [appIdSeed] = useState(() => Math.floor(1000 + Math.random() * 9000));
  const applicationId = useMemo(() => {
    const f = (firstName.trim()[0] || "X").toUpperCase();
    const l = (lastName.trim()[0] || "X").toUpperCase();
    return `${f}${l}${String(appIdSeed).padStart(4, "0")}`;
  }, [firstName, lastName, appIdSeed]);

  // Calculate delivery costs
  const deliveryCosts = useMemo(() => {
    let cost = 0;
    if (deliveryOptions.includes("email-inst")) cost += 5;
    if (deliveryOptions.includes("us-postage")) cost += 15 * usPostageAddresses.length;
    if (deliveryOptions.includes("domestic-courier")) cost += 25 * domesticCourierAddresses.length;
    if (deliveryOptions.includes("intl-courier")) cost += 75 * intlCourierAddresses.length;
    return cost;
  }, [deliveryOptions, usPostageAddresses.length, domesticCourierAddresses.length, intlCourierAddresses.length]);

  const authCost = authOption === "authenticate" ? 140 : 0;
  const totalPrice = selectedPrice + deliveryCosts + authCost - discountAmount;

  const needsAddress = deliveryOptions.some(o => ["us-postage", "domestic-courier", "intl-courier"].includes(o));

  const validateStep = (s: number): string => {
    if (s === 1) {
      if (!lastName.trim()) return "Last name is required.";
      if (!firstName.trim()) return "First name is required.";
      if (!dobMonth) return "Date of birth month is required.";
      if (!dobDay) return "Date of birth day is required.";
      if (!dobYear) return "Date of birth year is required.";
      if (!gender) return "Please select a gender.";
      if (!email.trim()) return "E-mail address is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid e-mail address.";
      if (!cellPhone.trim()) return "Cell phone is required.";
      if (!howHeard.trim()) return "Please tell us how you heard about IFCS.";
    }
    if (s === 2) {
      if (!institutionName.trim()) return "Institution name is required.";
      if (!country.trim()) return "Country is required.";
      if (!attendance.trim()) return "Dates of attendance are required.";
      if (!degrees.trim()) return "Degree(s) earned is required.";
    }
    if (s === 3) {
      if (!purpose) return "Please select a purpose of evaluation.";
    }
    if (s === 4) {
      if (hasDegree === null) return "Please indicate whether you have obtained a degree certificate or diploma.";
      if (hasDegree === "yes" && degreeFiles.length === 0) return "Please upload your degree certificate or diploma.";
      if (deliveryOptions.length === 0) return "Please select at least one delivery option.";
      if (deliveryOptions.includes("email-inst") && !institutionEmail.trim()) return "Please enter the institution email address.";
      if (deliveryOptions.includes("email-inst") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(institutionEmail)) return "Please enter a valid institution email.";
      // Validate addresses for each selected shipping method
      const validateAddrs = (addrs: ShippingAddr[], label: string): string => {
        for (let i = 0; i < addrs.length; i++) {
          const a = addrs[i];
          const hasName = a.firstName.trim() || a.lastName.trim();
          const hasCompany = a.company.trim();
          if (!hasName && !hasCompany) return `Please enter the name or company for ${label} address ${addrs.length > 1 ? i + 1 : ""}.`;
          if (!a.street.trim()) return `Street address is required for ${label}.`;
          if (!a.city.trim()) return `City is required for ${label}.`;
          if (!a.state.trim()) return `State/Province is required for ${label}.`;
          if (!a.zip.trim()) return `ZIP/Postal code is required for ${label}.`;
          if (!a.country.trim()) return `Country is required for ${label}.`;
        }
        return "";
      };
      if (deliveryOptions.includes("us-postage")) { const e = validateAddrs(usPostageAddresses, "US Postage"); if (e) return e; }
      if (deliveryOptions.includes("domestic-courier")) { const e = validateAddrs(domesticCourierAddresses, "Domestic Courier"); if (e) return e; }
      if (deliveryOptions.includes("intl-courier")) { const e = validateAddrs(intlCourierAddresses, "International Courier"); if (e) return e; }
    }
    return "";
  };

  const toggleDelivery = (val: string) => {
    setDeliveryOptions((prev) => prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]);
  };

  const handleFilesProcessed = useCallback((processedFiles: File[]) => {
    setFiles(processedFiles);
  }, []);

  const buildEmailBody = () => {
    const lines: string[] = [];
    lines.push("INSTITUTE OF FOREIGN CREDENTIAL SERVICES");
    lines.push("6 CEDAR ST, DOBBS FERRY, NY 10522 WWW.IFCSEVALS.COM");
    lines.push("PHONE: (914) 693-2840 FAX: (914) 231-7782 EMAIL: INFO@IFCSEVALS.COM");
    lines.push("");
    lines.push("Please do not reply to this email");
    lines.push("");
    lines.push("Part 1 - Personal Information");
    lines.push("");
    lines.push(`First name: ${firstName}`);
    if (middleName) lines.push(`Middle name: ${middleName}`);
    lines.push(`Last name: ${lastName}`);
    if (credFirstName || credLastName) {
      lines.push(`Name on Education Credentials: ${credFirstName} ${credMiddleName ? `(${credMiddleName}) ` : ""}${credLastName}`);
    }
    const monthIdx = months.indexOf(dobMonth) + 1;
    const dobFormatted = `${String(monthIdx).padStart(2, "0")}/${String(dobDay).padStart(2, "0")}/${String(dobYear).slice(-2)}`;
    lines.push(`Date of Birth: ${dobFormatted}`);
    lines.push(`Gender: ${gender.charAt(0).toUpperCase() + gender.slice(1)}`);
    if (homePhone) lines.push(`Home Phone: ${homePhone}`);
    lines.push(`Cell Phone: ${cellPhone}`);
    lines.push(`E-mail Address: ${email}`);
    lines.push(`How Did You Hear About IFCS? ${howHeard}`);
    lines.push("");
    lines.push("Part 2 - Academic History");
    lines.push("");
    lines.push(`Name of Institution: ${institutionName}`);
    lines.push(`Country: ${country}`);
    lines.push(`Dates Attended: ${attendance}`);
    lines.push(`Degree(s) Earned: ${degrees}`);
    lines.push("");
    lines.push("Part 3 - Purpose of Evaluation");
    lines.push("");
    lines.push(`Purpose of Evaluation: ${purpose}`);
    lines.push("");
    lines.push("Part 4 - Types of Evaluation Reports and Additional Services");
    lines.push("");
    lines.push(`Credential Evaluations: ${selectedServiceTitle} ${selectedProcessingTime} ($${selectedPrice})`);
    lines.push(`Translation: ${translationOption === "english" ? "All my documents are in English and I do not need translation of my documents" : translationOption === "own-translation" ? "I will provide a certified translation" : "I need a quote for translation services"}`);
    lines.push(`Authentication: ${authOption === "authenticate" ? "Perform Document Authentication ($140)" : "I Will Arrange With The Issuing Institution(s) To Send Official Documents To IFCS"}`);
    const deliveryLabels: string[] = [];
    if (deliveryOptions.includes("email-self")) deliveryLabels.push("E Mail To The Address Provided");
    if (deliveryOptions.includes("email-inst")) deliveryLabels.push(`Email My Report To An Institution ($5)`);
    if (deliveryOptions.includes("us-postage")) deliveryLabels.push("US Postage ($15)");
    if (deliveryOptions.includes("domestic-courier")) deliveryLabels.push("Domestic Courier - USPS Priority Mail ($25)");
    if (deliveryOptions.includes("intl-courier")) deliveryLabels.push("International Courier ($75)");
    lines.push(`Delivery: ${deliveryLabels.join(", ")}`);
    if (deliveryOptions.includes("email-inst")) {
      lines.push(`E-mail Address to send the evaluation: ${institutionEmail}`);
      if (additionalEmails.length > 0) {
        additionalEmails.forEach((em, i) => lines.push(`Additional Email ${i + 1}: ${em}`));
      }
    }
    const fmtAddr = (a: ShippingAddr) => `${a.firstName} ${a.mi} ${a.lastName}${a.company ? ` / ${a.company}` : ""} — ${a.street}, ${a.city}, ${a.state} ${a.zip}, ${a.country}`;
    if (deliveryOptions.includes("us-postage")) {
      usPostageAddresses.forEach((a, i) => lines.push(`US Postage Address ${i + 1}: ${fmtAddr(a)}`));
    }
    if (deliveryOptions.includes("domestic-courier")) {
      domesticCourierAddresses.forEach((a, i) => lines.push(`Domestic Courier Address ${i + 1}: ${fmtAddr(a)}`));
    }
    if (deliveryOptions.includes("intl-courier")) {
      intlCourierAddresses.forEach((a, i) => lines.push(`International Courier Address ${i + 1}: ${fmtAddr(a)}`));
    }
    lines.push("");
    lines.push("Attachments");
    if (files.length > 0) {
      files.forEach((f) => lines.push(f.name));
    } else {
      lines.push("No attachments");
    }
    lines.push("");
    lines.push("Part 5 - Payment Options");
    lines.push("");
    if (discountCode && discountAmount > 0) {
      lines.push(`Discount Code: ${discountCode} (-$${discountAmount})`);
    }
    lines.push(`Total: $${Math.max(0, totalPrice).toFixed(2)}`);
    lines.push("");
    lines.push("I agree to the following terms and conditions:");
    TERMS_CONTENT.forEach((t, i) => lines.push(`${i + 1}. ${t}`));
    lines.push("");
    if (paymentMethod === "card") {
      lines.push(`Card Type: ${cardNumber.startsWith("4") ? "Visa" : cardNumber.startsWith("5") ? "Mastercard" : "Card"}`);
      lines.push(`Last Four Digits: ${cardNumber.slice(-4)}`);
    } else {
      lines.push("Payment Method: ACH Bank Transfer");
      lines.push(`Routing: ***${achRouting.slice(-4)}`);
      lines.push(`Account: ***${achAccount.slice(-4)}`);
    }
    return lines.join("\n");
  };

  const handleSubmit = async () => {
    if (!agreeTerms || !agreePrivacy) return;
    setSubmitting(true);

    const emailBody = buildEmailBody();
    const subject = `Your IFCS Application ${applicationId}`;
    const monthIdx = months.indexOf(dobMonth) + 1;
    const dobFormatted = `${String(monthIdx).padStart(2, "0")}/${String(dobDay).padStart(2, "0")}/${String(dobYear).slice(-2)}`;

    // Build full application data for "View Application"
    const applicationData = {
      firstName, lastName, middleName,
      credFirstName, credLastName, credMiddleName,
      dob: dobFormatted, dobMonth, dobDay, dobYear,
      gender, cellPhone, homePhone, email, howHeard, ssn,
      institutionName, country, attendance, degrees, purpose,
      serviceTitle: selectedServiceTitle, processingLabel: selectedProcessingLabel,
      processingTime: selectedProcessingTime, price: selectedPrice,
      translationOption, authOption,
      deliveryOptions, institutionEmail, additionalEmails,
      usPostageAddresses, domesticCourierAddresses, intlCourierAddresses,
      paymentMethod,
      cardLastFour: paymentMethod === "card" ? cardNumber.slice(-4) : "",
      cardType: paymentMethod === "card" ? (cardNumber.startsWith("4") ? "Visa" : cardNumber.startsWith("5") ? "Mastercard" : "Card") : "",
      achRoutingLast4: paymentMethod === "ach" ? achRouting.slice(-4) : "",
      achAccountLast4: paymentMethod === "ach" ? achAccount.slice(-4) : "",
      totalPrice: Math.max(0, totalPrice),
      discountCode: discountCode || "",
      discountAmount,
      authCost,
      deliveryCosts,
      filesCount: files.length,
      fileNames: files.map(f => f.name),
      termsSignature, privacySignature,
      submittedAt: new Date().toISOString(),
    };

    try {
      const { supabase } = await import("@/integrations/supabase/client");

      // Save application to DB
      await (supabase as any).from("applications").insert({
        application_id: applicationId,
        client_email: email,
        first_name: firstName,
        last_name: lastName,
        middle_name: middleName,
        dob: dobFormatted,
        gender,
        cell_phone: cellPhone,
        home_phone: homePhone,
        institution_name: institutionName,
        country,
        attendance,
        degrees,
        purpose,
        service_title: selectedServiceTitle,
        processing_label: selectedProcessingLabel,
        processing_time: selectedProcessingTime,
        price: selectedPrice,
        total_price: Math.max(0, totalPrice),
        translation_option: translationOption,
        auth_option: authOption,
        delivery_options: deliveryOptions,
        payment_method: paymentMethod,
        card_last_four: paymentMethod === "card" ? cardNumber.slice(-4) : "",
        application_data: applicationData,
        status: "requested",
      });

      // Also create a client_orders entry for tracking
      await (supabase as any).from("client_orders").insert({
        reference_id: applicationId,
        client_email: email,
        service: `${selectedServiceTitle} — ${selectedProcessingLabel}`,
        status: "requested",
        application_id: applicationId,
        dob: dobFormatted,
      });

      // Send email
      const { error } = await supabase.functions.invoke("send-application-email", {
        body: { subject, body: emailBody, applicantEmail: email },
      });

      if (error) {
        console.error("Email send error:", error);
      }

      // Navigate to confirmation page
      navigate("/order-confirmation", {
        state: {
          applicationId,
          email,
          serviceName: `${selectedServiceTitle} — ${selectedProcessingLabel}`,
          totalPrice: Math.max(0, totalPrice),
        },
      });
    } catch (err) {
      console.error("Submit error:", err);
      navigate("/order-confirmation", {
        state: {
          applicationId,
          email,
          serviceName: `${selectedServiceTitle} — ${selectedProcessingLabel}`,
          totalPrice: Math.max(0, totalPrice),
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => {
    const err = validateStep(step);
    if (err) { setStepError(err); return; }
    setStepError("");
    setStep((s) => Math.min(s + 1, 5));
  };
  const prev = () => { setStepError(""); setStep((s) => Math.max(s - 1, 1)); };

  const handleTermsCheckbox = (checked: boolean) => {
    if (checked && !agreeTerms) {
      setPendingAgreement("terms");
      setTermsPopupOpen(true);
    } else {
      setAgreeTerms(false);
      setTermsSignature("");
    }
  };

  const handlePrivacyCheckbox = (checked: boolean) => {
    if (checked && !agreePrivacy) {
      setPendingAgreement("privacy");
      setPrivacyPopupOpen(true);
    } else {
      setAgreePrivacy(false);
      setPrivacySignature("");
    }
  };

  const confirmTermsSignature = () => {
    if (!termsSignature.trim()) return;
    setAgreeTerms(true);
    setTermsPopupOpen(false);
    setPendingAgreement(null);
  };

  const confirmPrivacySignature = () => {
    if (!privacySignature.trim()) return;
    setAgreePrivacy(true);
    setPrivacyPopupOpen(false);
    setPendingAgreement(null);
  };

  // Redirect to login if not authenticated
  if (!user) {
    navigate("/login");
    return null;
  }

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

      {/* Stepper — NO click to skip */}
      <div className="max-w-4xl mx-auto px-6 pt-12 pb-2">
        <div className="flex items-center justify-between gap-1">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = s.num < step;
            const active = s.num === step;
            return (
              <div key={s.num} className="flex items-center flex-1">
                <div className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${active ? "scale-110" : ""}`}>
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md transition-all duration-300 ${
                    done ? "bg-accent/30 border border-accent/50" : active ? "bg-accent shadow-lg shadow-accent/40" : "bg-muted border border-border"
                  }`}>
                    {done ? <CheckCircle2 size={18} className="text-accent" /> : <Icon size={18} className={active ? "text-white" : "text-muted-foreground"} />}
                  </div>
                  <span className={`text-[10px] font-semibold tracking-wider uppercase hidden sm:block ${active ? "text-accent" : "text-muted-foreground"}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-px mx-2 bg-border overflow-hidden">
                    <div className="h-px bg-accent transition-all duration-500" style={{ width: s.num < step ? "100%" : "0%" }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form */}
      <section className="py-10 px-6 md:px-12 content-bg">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-accent via-accent/60 to-transparent" />
            <div className="p-8 md:p-12 space-y-10">

              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-8 animate-fade-in">
                  <div>
                    <div className="mb-4 px-4 py-3 rounded-2xl bg-accent/10 border border-accent/20">
                      <p className="text-sm font-semibold text-accent">
                        You're Applying For: <span className="text-foreground">{selectedServiceTitle}</span> · <span className="text-foreground">{selectedProcessingTime}</span> · <span className="text-foreground">{selectedProcessingLabel}</span>
                      </p>
                    </div>
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
                        <button key={g} type="button" onClick={() => setGender(g)}
                          className={`flex-1 py-3 rounded-2xl border text-sm font-semibold capitalize transition-all duration-200 ${
                            gender === g ? "bg-accent text-accent-foreground border-accent shadow-md shadow-accent/30" : "bg-muted/40 border-border text-foreground hover:bg-muted"
                          }`}>
                          {g.charAt(0).toUpperCase() + g.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <SectionHeading>Contact Information</SectionHeading>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FieldGroup label="Home Phone"><GlassInput value={homePhone} onChange={(e) => setHomePhone(e.target.value)} type="tel" placeholder="(555) 000-0000" /></FieldGroup>
                      <FieldGroup label="Cell Phone" required><GlassInput value={cellPhone} onChange={(e) => setCellPhone(e.target.value)} type="tel" placeholder="(555) 000-0000" /></FieldGroup>
                    </div>
                    <FieldGroup label="E-mail Address" required><GlassInput value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" /></FieldGroup>
                    <FieldGroup label="How did you hear about IFCS?" required><GlassInput value={howHeard} onChange={(e) => setHowHeard(e.target.value)} placeholder="Google, referral, etc." /></FieldGroup>
                  </div>

                  <div className="space-y-4">
                    <SectionHeading>Identification (Optional)</SectionHeading>
                    <FieldGroup label="Social Security Number (SSN)" note="Not required">
                      <GlassInput value={ssn} onChange={(e) => setSsn(e.target.value)} placeholder="XXX-XX-XXXX" maxLength={11} />
                    </FieldGroup>
                    <FieldGroup label="Government-Issued ID" note="Not required">
                      <div className="flex items-center gap-3">
                        {idFile ? (
                          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-muted/60 border border-border text-sm text-foreground">
                            <span className="truncate max-w-[200px]">{idFile.name}</span>
                            <button onClick={() => setIdFile(null)} className="text-muted-foreground hover:text-destructive"><X size={14} /></button>
                          </div>
                        ) : (
                          <label className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-muted/60 border border-border text-sm text-foreground cursor-pointer hover:bg-muted transition-colors">
                            <Upload size={16} /> Upload ID
                            <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => e.target.files?.[0] && setIdFile(e.target.files[0])} />
                          </label>
                        )}
                      </div>
                    </FieldGroup>
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
                    <FieldGroup label="Degree(s) Earned" required><GlassInput value={degrees} onChange={(e) => setDegrees(e.target.value)} placeholder="e.g. B.Sc. Computer Science" /></FieldGroup>
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
                      <RadioCard key={p} value={p} selected={purpose === p} onSelect={() => setPurpose(p)}>
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
                    <p className="text-xs text-muted-foreground -mt-2">
                      Upload clear, legible copies of your documents. {selectedServiceTitle === "High School and University Course-by-Course"
                        ? "You need to upload 4 documents: High School Diploma, High School Transcript, University Degree Certificate, and University Transcript."
                        : "You need to upload 2 documents: your Transcript/Marksheets and Diploma Certificate."}
                    </p>
                    <DocumentScanner onFilesProcessed={handleFilesProcessed} existingFiles={files} />

                    {/* Degree certificate question */}
                    <div className="space-y-3 pt-4">
                      <p className="text-sm font-semibold text-foreground">
                        Have you obtained a degree certificate or diploma? <span className="text-accent">*</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground italic">This is a mandatory field</p>
                      <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={hasDegree === "yes"}
                            onCheckedChange={(checked) => {
                              setHasDegree(checked ? "yes" : null);
                              if (!checked) setDegreeFiles([]);
                            }}
                          />
                          <span className="text-sm text-foreground">Yes</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={hasDegree === "no"}
                            onCheckedChange={(checked) => {
                              setHasDegree(checked ? "no" : null);
                              if (checked) setDegreeFiles([]);
                            }}
                          />
                          <span className="text-sm text-foreground">No</span>
                        </label>
                      </div>

                      {hasDegree === "yes" && (
                        <div className="pt-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                            Upload Degree Certificate / Diploma <span className="text-accent">*</span>
                          </p>
                          <DocumentScanner
                            onFilesProcessed={(processed) => setDegreeFiles(processed)}
                            existingFiles={degreeFiles}
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 pt-2">
                      <RadioCard value="arrange" selected={authOption === "arrange"} onSelect={() => setAuthOption("arrange")}>
                        I will arrange with the issuing institution(s) to send official documents to IFCS.
                      </RadioCard>
                      <div>
                        <RadioCard value="authenticate" selected={authOption === "authenticate"} onSelect={() => setAuthOption("authenticate")}>
                          Please perform document authentication <span className="font-bold text-accent">($140)</span>
                        </RadioCard>
                        {authOption === "authenticate" && selectedProcessingLabel !== "Standard" && (
                          <div className="flex items-start gap-2.5 mt-2 ml-2 p-3 rounded-xl bg-red-800/80 border border-red-600/60">
                            <AlertTriangle size={18} className="text-red-300 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-black font-medium leading-relaxed">
                              This service may not be available for rush processing. Please contact IFCS during business hours at <strong>(914) 693-2840</strong> to confirm availability.
                            </p>
                          </div>
                        )}
                      </div>
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
                        { value: "us-postage", label: "US Postage (no tracking number provided)", price: "$15/address" },
                        { value: "domestic-courier", label: "Domestic Courier (USPS Priority Mail)", price: "$25/address" },
                        { value: "intl-courier", label: "International Courier", price: "$75/address" },
                      ].map((opt) => {
                        const active = deliveryOptions.includes(opt.value);
                        return (
                          <button key={opt.value} type="button" onClick={() => toggleDelivery(opt.value)}
                            className={`w-full text-left flex items-center justify-between gap-3 p-4 rounded-2xl border transition-all duration-200 ${
                              active ? "border-accent bg-accent/10 shadow-sm shadow-accent/20" : "border-border bg-muted/40 hover:bg-muted/70"
                            }`}>
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

                    {/* Institution email + additional emails */}
                    {deliveryOptions.includes("email-inst") && (
                      <div className="pl-8 pt-2 space-y-3">
                        <FieldGroup label="Email Address of the Institution" required>
                          <GlassInput value={institutionEmail} onChange={(e) => setInstitutionEmail(e.target.value)} type="email" placeholder="e.g. admissions@university.edu" />
                        </FieldGroup>
                        
                        {/* Additional emails */}
                        {additionalEmails.map((em, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="flex-1">
                              <FieldGroup label={`Additional Email ${i + 1}`} required>
                                <GlassInput value={em} onChange={(e) => {
                                  const copy = [...additionalEmails];
                                  copy[i] = e.target.value;
                                  setAdditionalEmails(copy);
                                }} type="email" placeholder="e.g. registrar@university.edu" />
                              </FieldGroup>
                            </div>
                            <button type="button" onClick={() => setAdditionalEmails(prev => prev.filter((_, j) => j !== i))} className="mt-5 text-muted-foreground hover:text-destructive"><X size={16} /></button>
                          </div>
                        ))}

                        {!wantMoreEmails && additionalEmails.length === 0 && (
                          <button type="button" onClick={() => setWantMoreEmails(true)} className="text-xs text-accent font-semibold hover:underline">
                            Do you have another email you'd like to send to?
                          </button>
                        )}
                        {(wantMoreEmails || additionalEmails.length > 0) && (
                          <button type="button" onClick={() => setAdditionalEmails(prev => [...prev, ""])} className="text-xs text-accent font-semibold hover:underline">
                            + Add another email
                          </button>
                        )}
                        <p className="text-[10px] text-muted-foreground">Total email delivery cost: <span className="font-bold text-accent">$5</span> (flat fee for all emails)</p>
                      </div>
                    )}

                    {/* Per-method shipping addresses */}
                    {deliveryOptions.includes("us-postage") && (
                      <AddressBlock
                        label="US Postage"
                        priceEach={15}
                        addresses={usPostageAddresses}
                        setAddresses={setUsPostageAddresses}
                        emptyAddr={emptyAddr}
                      />
                    )}
                    {deliveryOptions.includes("domestic-courier") && (
                      <AddressBlock
                        label="Domestic Courier (USPS Priority Mail)"
                        priceEach={25}
                        addresses={domesticCourierAddresses}
                        setAddresses={setDomesticCourierAddresses}
                        emptyAddr={emptyAddr}
                      />
                    )}
                    {deliveryOptions.includes("intl-courier") && (
                      <AddressBlock
                        label="International Courier"
                        priceEach={75}
                        addresses={intlCourierAddresses}
                        setAddresses={setIntlCourierAddresses}
                        emptyAddr={emptyAddr}
                      />
                    )}
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
                      <div className="flex items-start justify-between gap-4 text-sm">
                        <span className="text-muted-foreground">Credential Evaluation:</span>
                        <span className="text-right font-medium text-foreground">{selectedServiceTitle} — {selectedProcessingLabel} ({selectedProcessingTime})</span>
                      </div>
                      <div className="flex items-start justify-between gap-4 text-sm">
                        <span className="text-muted-foreground">Service Price:</span>
                        <span className="text-right font-medium text-foreground">${selectedPrice}</span>
                      </div>
                      {deliveryOptions.includes("email-inst") && (
                        <div className="flex items-start justify-between gap-4 text-sm">
                          <span className="text-muted-foreground">Email to Institution ({institutionEmail}):</span>
                          <span className="text-right font-medium text-foreground">+$5</span>
                        </div>
                      )}
                      {deliveryOptions.includes("us-postage") && (
                        <div className="flex items-start justify-between gap-4 text-sm">
                          <span className="text-muted-foreground">US Postage ({usPostageAddresses.length} address{usPostageAddresses.length > 1 ? "es" : ""}):</span>
                          <span className="text-right font-medium text-foreground">+${15 * usPostageAddresses.length}</span>
                        </div>
                      )}
                      {deliveryOptions.includes("domestic-courier") && (
                        <div className="flex items-start justify-between gap-4 text-sm">
                          <span className="text-muted-foreground">Domestic Courier ({domesticCourierAddresses.length} address{domesticCourierAddresses.length > 1 ? "es" : ""}):</span>
                          <span className="text-right font-medium text-foreground">+${25 * domesticCourierAddresses.length}</span>
                        </div>
                      )}
                      {deliveryOptions.includes("intl-courier") && (
                        <div className="flex items-start justify-between gap-4 text-sm">
                          <span className="text-muted-foreground">International Courier ({intlCourierAddresses.length} address{intlCourierAddresses.length > 1 ? "es" : ""}):</span>
                          <span className="text-right font-medium text-foreground">+${75 * intlCourierAddresses.length}</span>
                        </div>
                      )}
                      {authOption === "authenticate" && (
                        <div className="flex items-start justify-between gap-4 text-sm">
                          <span className="text-muted-foreground">Document Authentication:</span>
                          <span className="text-right font-medium text-foreground">+$140</span>
                        </div>
                      )}
                      {discountAmount > 0 && (
                        <div className="flex items-start justify-between gap-4 text-sm">
                          <span className="text-emerald-600 font-semibold">Discount ({discountCode}):</span>
                          <span className="text-right font-medium text-emerald-600">-${discountAmount}</span>
                        </div>
                      )}
                      <div className="border-t border-border pt-3 mt-3 flex items-start justify-between gap-4 text-sm">
                        <span className="font-bold text-foreground">Total:</span>
                        <span className="text-right font-bold text-2xl text-accent">${Math.max(0, totalPrice)}</span>
                      </div>
                      <div className="flex items-start justify-between gap-4 text-sm pt-2">
                        <span className="text-muted-foreground">Number of Attachments:</span>
                        <span className="text-right font-medium text-foreground">{files.length}</span>
                      </div>
                      <div className="flex items-start justify-between gap-4 text-sm pt-2">
                        <span className="text-muted-foreground">Application ID:</span>
                        <span className="text-right font-bold text-accent">{applicationId}</span>
                      </div>
                    </div>

                    {/* Discount code input */}
                    <div className="pt-3 border-t border-border">
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Discount Code</p>
                      <div className="flex gap-3">
                        <input
                          value={discountCode}
                          onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                          placeholder="Enter discount code"
                          className="flex-1 h-10 px-4 rounded-xl text-sm bg-muted/60 border border-border focus:outline-none focus:ring-2 focus:ring-accent/60 text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                      {discountCode && discountAmount > 0 && (
                        <p className="text-sm text-emerald-600 mt-2 font-semibold">✓ Code "{discountCode}" applied — ${discountAmount} off</p>
                      )}
                      {discountCode && discountAmount === 0 && (
                        <p className="text-sm text-destructive mt-2 font-semibold">Invalid discount code</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-3">
                    <p className="text-xs text-destructive font-semibold">
                      ⚠ Please note your application is NOT complete. You must click "Submit Application" to complete your transaction. A confirmation email will be sent after successful payment.
                    </p>
                  </div>

                  {/* Payment method selector */}
                  <div className="space-y-6">
                    <SectionHeading>Payment Method</SectionHeading>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setPaymentMethod("card")}
                        className={`flex-1 py-3 rounded-2xl border text-sm font-semibold transition-all duration-200 ${
                          paymentMethod === "card" ? "bg-accent text-accent-foreground border-accent shadow-md shadow-accent/30" : "bg-muted/40 border-border text-foreground hover:bg-muted"
                        }`}>
                        💳 Credit / Debit Card
                      </button>
                      <button type="button" onClick={() => setPaymentMethod("ach")}
                        className={`flex-1 py-3 rounded-2xl border text-sm font-semibold transition-all duration-200 ${
                          paymentMethod === "ach" ? "bg-accent text-accent-foreground border-accent shadow-md shadow-accent/30" : "bg-muted/40 border-border text-foreground hover:bg-muted"
                        }`}>
                        🏦 ACH Bank Transfer
                      </button>
                    </div>

                    {paymentMethod === "card" && (
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
                    )}

                    {paymentMethod === "ach" && (
                      <div className="space-y-4">
                        <FieldGroup label="Account Holder Name" required>
                          <GlassInput value={achName} onChange={(e) => setAchName(e.target.value)} placeholder="Full name on bank account" />
                        </FieldGroup>
                        <FieldGroup label="Routing Number" required>
                          <GlassInput value={achRouting} onChange={(e) => setAchRouting(e.target.value)} placeholder="9-digit routing number" maxLength={9} />
                        </FieldGroup>
                        <FieldGroup label="Account Number" required>
                          <GlassInput value={achAccount} onChange={(e) => setAchAccount(e.target.value)} placeholder="Account number" maxLength={17} />
                        </FieldGroup>
                      </div>
                    )}
                  </div>

                  {/* Terms */}
                  <div className="space-y-3 border-t border-border pt-6">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">Legal Agreement</p>
                    
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <Checkbox id="terms" checked={agreeTerms} onCheckedChange={(v) => handleTermsCheckbox(!!v)} className="rounded-md" />
                      <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">
                        I agree to the{" "}
                        <Link to="/terms" className="text-accent underline underline-offset-2 font-semibold" target="_blank">
                          terms and conditions
                        </Link>
                      </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <Checkbox id="privacy" checked={agreePrivacy} onCheckedChange={(v) => handlePrivacyCheckbox(!!v)} className="rounded-md" />
                      <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">
                        I agree to the{" "}
                        <Link to="/privacy" className="text-accent underline underline-offset-2 font-semibold" target="_blank">
                          privacy policy
                        </Link>
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Validation error */}
              {stepError && (
                <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-5 py-3 flex items-center gap-3">
                  <span className="text-destructive text-lg">⚠</span>
                  <p className="text-sm font-medium text-destructive">{stepError}</p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-6 border-t border-border">
                {step > 1 ? (
                  <button onClick={prev}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-border bg-muted/50 text-sm font-semibold text-foreground hover:bg-muted transition-all duration-200">
                    <ArrowLeft size={16} /> Back
                  </button>
                ) : <div />}

                {step < 5 ? (
                  <button onClick={next}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-accent text-accent-foreground text-sm font-semibold shadow-lg shadow-accent/30 hover:bg-accent/90 hover:shadow-accent/50 transition-all duration-200 hover:scale-105">
                    Continue — {step}/5 <ArrowRight size={16} />
                  </button>
                ) : (
                  <button onClick={handleSubmit} disabled={!agreeTerms || !agreePrivacy || submitting}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-accent text-accent-foreground text-sm font-semibold shadow-lg shadow-accent/30 hover:bg-accent/90 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
                    {submitting ? "Submitting..." : "Submit Application 5/5"} <CheckCircle2 size={16} />
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Terms Signature Popup */}
      <Dialog open={termsPopupOpen} onOpenChange={(open) => { if (!open) { setTermsPopupOpen(false); setPendingAgreement(null); } }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Terms and Conditions</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-foreground/90 leading-relaxed">
            <p className="text-muted-foreground">I agree to the following terms and conditions:</p>
            <ol className="list-decimal pl-5 space-y-3">
              {TERMS_CONTENT.map((t, i) => <li key={i}>{t}</li>)}
            </ol>
          </div>
          <div className="border-t border-border pt-4 mt-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Type your full name as your signature</p>
            <GlassInput value={termsSignature} onChange={(e) => setTermsSignature(e.target.value)} placeholder="Type your full name" />
            <p className="text-xs text-muted-foreground">Date: {new Date().toLocaleDateString()}</p>
            <button onClick={confirmTermsSignature} disabled={!termsSignature.trim()}
              className="w-full inline-flex items-center justify-center gap-2 px-8 py-3 rounded-2xl bg-accent text-accent-foreground text-sm font-semibold shadow-lg hover:bg-accent/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
              <CheckCircle2 size={16} /> I Agree & Sign
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Signature Popup */}
      <Dialog open={privacyPopupOpen} onOpenChange={(open) => { if (!open) { setPrivacyPopupOpen(false); setPendingAgreement(null); } }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Privacy Policy</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-foreground/90 leading-relaxed">
            <p>Institute Of Foreign Credential Services, (IFCS), is committed to keeping any and all personal information collected of those individuals that visit our website and make use of our online facilities and services accurate, confidential, secure and private.</p>
            <p>Through the use of ifcsevals.com you are herein consenting to the data procedures expressed within this agreement.</p>
            <h4 className="font-bold mt-4">Collection of Information</h4>
            <p>This website collects various types of information, such as voluntarily provided information which may include your name, address, email address, billing and/or credit card information.</p>
            <h4 className="font-bold mt-4">Use of Information</h4>
            <p>IFCS may collect and make use of personal information to assist in the operation of our website and to ensure delivery of the services you need and request.</p>
            <h4 className="font-bold mt-4">Security</h4>
            <p>IFCS shall take every precaution to maintain adequate physical, procedural and technical security to prevent any loss, misuse, unauthorized access, disclosure or modification of personal information.</p>
            <p className="text-xs text-muted-foreground mt-4">For the full privacy policy, visit our <Link to="/privacy" target="_blank" className="text-accent underline">Privacy Policy page</Link>.</p>
          </div>
          <div className="border-t border-border pt-4 mt-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Type your full name as your signature</p>
            <GlassInput value={privacySignature} onChange={(e) => setPrivacySignature(e.target.value)} placeholder="Type your full name" />
            <p className="text-xs text-muted-foreground">Date: {new Date().toLocaleDateString()}</p>
            <button onClick={confirmPrivacySignature} disabled={!privacySignature.trim()}
              className="w-full inline-flex items-center justify-center gap-2 px-8 py-3 rounded-2xl bg-accent text-accent-foreground text-sm font-semibold shadow-lg hover:bg-accent/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
              <CheckCircle2 size={16} /> I Agree & Sign
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <BackToHome />
      <Footer />
    </div>
  );
};

export default Application;
