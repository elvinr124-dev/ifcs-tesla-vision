import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, X, Send, Paperclip } from "lucide-react";

type NavButton = { label: string; path: string };
type Message = {
  role: "user" | "assistant";
  content: string;
  attachments?: string[];
  navButtons?: NavButton[];
};

const SUGGESTIONS = [
  "What is an evaluation?",
  "What's the difference between an Evaluation and Translation?",
  "What's a Translation?",
  "How fast can I get my evaluation?",
  "How much does an evaluation cost?",
  "What documents do I need?",
  "Do you offer rush processing?",
  "How do I apply?",
  "What is a course-by-course evaluation?",
  "Do you offer consulting?",
  "How do I check my status?",
  "What languages do you translate?",
];

interface KBEntry {
  keywords: string[];
  response: string;
  navButtons?: NavButton[];
}

const KNOWLEDGE_BASE: KBEntry[] = [
  {
    keywords: ["what is an evaluation", "what is credential evaluation", "what's a credential evaluation", "what is a evaluation"],
    response: `A **credential evaluation** is an expert assessment of your foreign academic credentials to determine their U.S. equivalency.

IFCS evaluators — recognized experts in the field — review your transcripts and diplomas, convert grading scales, and produce a detailed report showing how your education aligns with U.S. standards.

**Who needs one?**
• Students applying to U.S. colleges or universities
• Professionals seeking employment or licensure
• Immigrants needing documentation for USCIS
• Anyone whose foreign credentials need U.S. recognition

IFCS is trusted by universities, federal and state government agencies, employers, and licensure boards across the U.S.`,
    navButtons: [
      { label: "View Evaluations", path: "/evaluations" },
      { label: "Learn More", path: "/learn-more-evaluations" },
    ],
  },
  {
    keywords: ["difference between evaluation and translation", "evaluation vs translation", "evaluation and translation"],
    response: `Great question! They serve different purposes:

**Evaluation** — An expert analysis that converts your foreign academic credentials into their U.S. equivalency. It tells universities and employers *what* your degree means in the American system.

**Translation** — A word-for-word conversion of your documents from their original language into English. It tells readers *what* your documents say.

**Do you need both?** If your documents are not in English, you'll typically need a certified translation first, then an evaluation. IFCS can handle both for you!

• Evaluations start at **$100**
• Translations are **$50 per page**`,
    navButtons: [
      { label: "View Evaluations", path: "/evaluations" },
      { label: "View Translations", path: "/translations" },
    ],
  },
  {
    keywords: ["what's a translation", "what is a translation", "what is translation"],
    response: `A **certified translation** is a professionally prepared, word-for-word conversion of your documents from their original language into English.

IFCS translations include:
• Delivered on **IFCS letterhead**
• **Signed and stamped** certificate of accuracy
• Accepted by **USCIS**, universities, and government agencies
• Available in **150+ languages**
• Standard turnaround: **3–5 business days**
• **Same-day** and expedited options available
• Pricing: **$50 per page** with no hidden fees

If USCIS does not accept your translation, we will re-translate at **no charge**.`,
    navButtons: [
      { label: "Start Translation Order", path: "/translations/order" },
      { label: "Get a Quote", path: "/translations/quote" },
    ],
  },
  {
    keywords: ["how fast", "how long does evaluation", "turnaround", "how quickly"],
    response: `IFCS offers three processing speeds for evaluations:

⏱️ **Standard:** 8–10 business days
⚡ **3-Day Rush:** 3 business days
🚀 **24-Hour Priority:** Within 24 hours

Rush pricing varies by evaluation type. For example:
• General Analysis: $100 (Standard) → $150 (3-Day) → $195 (24-Hour)
• Course-by-Course: $190 (Standard) → $290 (3-Day) → $350 (24-Hour)

Processing begins once all required documents and payment are received.`,
    navButtons: [
      { label: "View Pricing", path: "/evaluations" },
      { label: "Start Application", path: "/application" },
    ],
  },
  {
    keywords: ["how much", "price", "cost", "fee", "pricing"],
    response: `Here are our evaluation pricing tiers:

| Service | Price |
|---------|-------|
| **General Analysis** | $100 |
| **General Analysis + GPA** | $150 |
| **Cosmetology Course-by-Course** | $170 |
| **Course-by-Course** | $190 |
| **Health Professions** | $230 |
| **Comprehensive Course-by-Course** | $290 |
| **High School & University CxC** | $295 |
| **Professional Licensure CxC** | $400 |

**Rush options** are available at additional cost for 3-day and 24-hour processing.

**Translations:** $50 per page
**Consulting:** Evaluation consultations are **FREE**. Admission advising is **$60/hour**.
**Duplicate Reports:** $25 per copy`,
    navButtons: [
      { label: "View Full Pricing", path: "/pricing" },
      { label: "Start Application", path: "/application" },
    ],
  },
  {
    keywords: ["what document", "documents do i need", "required document", "what do i need to submit"],
    response: `The documents you need depend on the evaluation type:

**For most evaluations:**
📄 **Transcripts / Mark Sheets** — official academic records
📄 **Diploma Certificate** — proof of degree completion

**For High School & University Course-by-Course ($295):**
📄 High School diploma + transcript
📄 University degree certificate + transcript

**Important notes:**
• Legible uploaded copies are sufficient to **start** your application
• Official transcripts must be sent directly from your institution to be considered official
• If documents are in a foreign language, IFCS can provide a translation quote
• **Document Authentication** ($140) — IFCS contacts your institution to verify documents directly

📍 **Mailing address:** IFCS, 6 Cedar Street, Dobbs Ferry, NY 10522`,
    navButtons: [
      { label: "Start Application", path: "/application" },
      { label: "Learn More", path: "/learn-more-evaluations" },
    ],
  },
  {
    keywords: ["rush", "expedite", "urgent", "faster", "priority"],
    response: `Yes! We offer **rush processing** for all evaluation types:

⚡ **3-Day Rush** — Results in 3 business days
🚀 **24-Hour Priority** — Results within 24 hours of document receipt

Rush fees vary by evaluation type. Here are some examples:
• General Analysis: $150 (3-Day) / $195 (24-Hour)
• Course-by-Course: $290 (3-Day) / $350 (24-Hour)
• Comprehensive CxC: $390 (3-Day) / $450 (24-Hour)

For **translations**, we offer same-day and next-day expedited service at $14.95/page additional.`,
    navButtons: [
      { label: "View Evaluations", path: "/evaluations" },
      { label: "Start Application", path: "/application" },
    ],
  },
  {
    keywords: ["how do i apply", "how to apply", "application process", "get started", "start", "apply"],
    response: `Getting started with IFCS is simple — just follow these 4 steps:

**Step 1:** Determine which evaluation you need. Not sure? Our evaluation consultation is **FREE**!

**Step 2:** Complete the **online application** on our website.

**Step 3:** Upload legible copies of your transcripts and diploma certificates.

**Step 4:** Submit your signed application and make payment.

After submission, you'll receive an **IFCS ID** via email. Arrange for your institution to send official transcripts to:

📍 **IFCS, 6 Cedar Street, Dobbs Ferry, NY 10522**

Alternatively, pay **$140 for document authentication** and we handle verification directly.`,
    navButtons: [
      { label: "Start Application", path: "/application" },
      { label: "View Evaluations", path: "/evaluations" },
    ],
  },
  {
    keywords: ["course-by-course", "course by course", "cxc"],
    response: `**Course-by-Course evaluations** provide a detailed breakdown of your academic record, including:

• List of all individual courses
• Semester credit hours for each course
• Letter grades and cumulative GPA
• U.S. equivalency for each credential

**Types available:**
• **Course-by-Course** ($190) — For college transfer and undergrad admission
• **Cosmetology CxC** ($170) — Specialized for cosmetology credentials
• **Health Professions CxC** ($230) — Includes clinical experience details
• **Comprehensive CxC** ($290) — Includes upper/lower division levels, covers up to 2 degrees
• **High School & University CxC** ($295) — Covers both high school and university records
• **Professional Licensure CxC** ($400) — For professional licensing boards

Course-by-Course is recommended for **transfer credit**, **graduate admissions**, and **employment**.`,
    navButtons: [
      { label: "View All Evaluations", path: "/evaluations" },
      { label: "Learn More", path: "/learn-more-evaluations" },
    ],
  },
  {
    keywords: ["consult", "consulting", "advising", "advisor", "appointment"],
    response: `IFCS offers two types of consulting:

🆓 **Evaluation Consultation — FREE**
Our experts help you determine which evaluation type is right for your specific goals (education, employment, immigration, or licensure).

💼 **Admissions & Academic Advising — $60/hour**
Our senior staff has reviewed thousands of applications and can help you:
• Find the right U.S. institution and program
• Streamline the application process
• Understand admission requirements

Consultations are held at our **Dobbs Ferry office** by appointment.

📞 **(914) 693-2840**
📧 **info@ifcsevals.com**`,
    navButtons: [
      { label: "Book a Consultation", path: "/consulting/book" },
      { label: "View Consulting Page", path: "/consulting" },
    ],
  },
  {
    keywords: ["check status", "track", "status of", "my evaluation", "order status"],
    response: `You can check the status of your evaluation through your **My Dashboard** on our website.

You'll need:
• Your **Application ID** (starts with "EE")
• Your **Date of Birth**

If you have an IFCS ID, you can also use that to look up your order.

Need further assistance? Contact us:
📞 **(914) 693-2840**
📧 **info@ifcsevals.com**`,
    navButtons: [
      { label: "Go to Dashboard", path: "/dashboard/client" },
      { label: "Contact Us", path: "/contact" },
    ],
  },
  {
    keywords: ["what language", "which language", "language do you", "languages"],
    response: `We translate documents from and into **150+ languages**, including but not limited to:

🌍 Spanish, French, Arabic, Chinese, Hindi, Portuguese, Russian, Japanese, Korean, German, Italian, Turkish, Vietnamese, Thai, Polish, Ukrainian, and many more!

All translations include:
• IFCS letterhead with signed certificate of accuracy
• Accepted by USCIS, universities, and government agencies
• Standard turnaround: 3–5 business days
• $50 per page

If you don't see your language listed, contact us — we likely support it!`,
    navButtons: [
      { label: "Start Translation Order", path: "/translations/order" },
      { label: "Get a Quote", path: "/translations/quote" },
    ],
  },
  {
    keywords: ["uscis", "accepted", "immigration", "recognized"],
    response: `Yes! **IFCS evaluations and translations are accepted by:**

✅ **USCIS** (U.S. Citizenship and Immigration Services)
✅ Universities and colleges nationwide
✅ Federal and state government agencies
✅ Employers across all industries
✅ Professional licensure boards

IFCS evaluators are recognized experts, regular contributors to **NAFSA**, **AACRAO**, and the **International Association of Universities**.

For certified translations: If USCIS does not accept your translation, we will re-translate at **no charge**.`,
    navButtons: [
      { label: "Start Application", path: "/application" },
      { label: "Learn More", path: "/learn-more-evaluations" },
    ],
  },
  {
    keywords: ["refund", "cancel", "money back"],
    response: `Here is our refund policy:

• Refunds are issued **only for overpayment**.
• **Standard (8–10 day) service** can be canceled within **24 hours** of submission, subject to a **$50 minimum processing fee**.
• **No refunds** for 24-hour and 3-day rush services once processing has begun.

If you have questions about your specific situation, please contact us:
📞 **(914) 693-2840**
📧 **info@ifcsevals.com**`,
    navButtons: [
      { label: "Contact Us", path: "/contact" },
    ],
  },
  {
    keywords: ["duplicate", "additional cop", "extra cop"],
    response: `If you've received an evaluation from IFCS within the past **5 years**, you can request additional copies:

📄 **Electronic Report:** $25
📄 **Hard Copy:** $25 each
📦 **Domestic Shipping:** $25
✈️ **International Shipping:** $70

You can order duplicates directly through our website!`,
    navButtons: [
      { label: "Order Duplicate Reports", path: "/duplicate-reports" },
    ],
  },
  {
    keywords: ["shipping", "delivery", "mail", "send report"],
    response: `We offer several delivery options for your evaluation report:

📧 **Electronic Sharing:** $25
📄 **Hard Copy:** $25 each
📦 **Domestic Shipping:** $25
✈️ **International Shipping:** $70

Reports are valid for **5 years**. After expiration, renewal is available for **$100**.`,
    navButtons: [
      { label: "Start Application", path: "/application" },
    ],
  },
  {
    keywords: ["renewal", "expire", "expiration", "valid", "how long is report valid"],
    response: `Evaluation reports are valid for **5 years** from the date of issuance.

After expiration, you can renew your report for **$100**, which extends validity for another 5 years.

Need a renewal? You can start the process on our website.`,
    navButtons: [
      { label: "Renew Evaluation", path: "/addon/renewal" },
    ],
  },
  {
    keywords: ["contact", "phone", "email", "reach", "office", "address", "location", "hours"],
    response: `You can reach IFCS at:

📞 **Phone:** (914) 693-2840
📠 **Fax:** (914) 231-7782
📧 **Email:** info@ifcsevals.com
📍 **Address:** 6 Cedar Street, Dobbs Ferry, NY 10522
🕐 **Hours:** Monday–Friday, 9:00 AM – 5:00 PM EST

We welcome any questions and promise a swift response!`,
    navButtons: [
      { label: "Contact Us", path: "/contact" },
    ],
  },
  {
    keywords: ["general analysis", "general evaluation"],
    response: `The **General Analysis** is our most affordable evaluation:

**Price:** $100 (Standard 8–10 business days)
**Rush:** $150 (3-Day) / $195 (24-Hour)

**What it includes:**
• Country of study
• Institution attended
• Dates of attendance
• Credential received
• Overall U.S. equivalency

**Recommended for:**
• Immigration purposes
• Military applications
• Junior college admission

**Required Documents:** Transcripts/mark sheets and diploma certificate`,
    navButtons: [
      { label: "View Evaluations", path: "/evaluations#general-analysis" },
      { label: "Start Application", path: "/application" },
    ],
  },
  {
    keywords: ["comprehensive", "graduate", "professional license", "licensure"],
    response: `The **Comprehensive Course-by-Course** evaluation is our most detailed option:

**Price:** $290 (Standard) / $390 (3-Day) / $450 (24-Hour)

**What it includes:**
• All courses with semester credit hours and grades
• Lower and upper-division designations
• Graduate level classifications
• U.S. equivalency for each credential
• Covers **up to 2 degrees**

**Recommended for:**
• Graduate school admission
• Professional licensure
• Multiple degrees

We also offer **Professional Licensure Course-by-Course** at **$400** specifically for licensing boards.`,
    navButtons: [
      { label: "View Evaluations", path: "/evaluations#comprehensive-course-by-course" },
      { label: "Start Application", path: "/application" },
    ],
  },
  {
    keywords: ["health profession", "medical", "nursing", "clinical"],
    response: `The **Health Professions Course-by-Course** is designed for healthcare professionals:

**Price:** $230 (Standard) / $330 (3-Day) / $390 (24-Hour)

**What it includes:**
• All courses with credit hours and grades
• Upper/lower division and graduate level designations
• **Clinical experience details**
• U.S. equivalency

**Recommended for:** Medical, nursing, and health profession licensing boards.

**Required Documents:** Transcripts/mark sheets and diploma certificate`,
    navButtons: [
      { label: "View Evaluations", path: "/evaluations#health-professions" },
      { label: "Start Application", path: "/application" },
    ],
  },
  {
    keywords: ["notari", "notarization"],
    response: `Yes! We offer **notarization** as an add-on service:

💰 **$19.95 per order**
📜 Valid in **all 50 U.S. states**

You can add notarization during the translation order process.`,
    navButtons: [
      { label: "Start Translation Order", path: "/translations/order" },
    ],
  },
  {
    keywords: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"],
    response: `Hello! 👋 Welcome to **IFCS** — the Institute of Foreign Credential Services.

I can help you with:
• **Evaluations** — pricing, types, and how to apply
• **Translations** — certified translations in 150+ languages
• **Consulting** — free evaluation consultations
• **Status** — checking your evaluation progress
• **General questions** — documents, timelines, pricing, and more

What would you like to know?`,
    navButtons: [],
  },
  {
    keywords: ["thank", "thanks", "appreciate"],
    response: `You're welcome! 😊 If you have any more questions, feel free to ask. We're here to help!

For specific case questions, you can always reach our team:
📞 **(914) 693-2840**
📧 **info@ifcsevals.com**`,
    navButtons: [],
  },
  {
    keywords: ["blog", "articles", "news", "updates"],
    response: `Check out our blog for the latest news, tips, and insights about foreign credential evaluations, translations, and studying in the U.S.!`,
    navButtons: [
      { label: "Visit Our Blog", path: "/blog" },
    ],
  },
  {
    keywords: ["about", "who is ifcs", "about ifcs", "history"],
    response: `**IFCS** — the Institute of Foreign Credential Services — is based in Dobbs Ferry, NY and has been helping international students and professionals get their credentials recognized in the United States.

**What makes IFCS unique:**
• **Expert evaluators** — Our senior staff are recognized industry leaders
• Regular contributors to **NAFSA**, **AACRAO**, and **IAU**
• **Personal attention** applied to every account
• Trusted by universities, government agencies, employers, and licensure boards nationwide

📍 6 Cedar Street, Dobbs Ferry, NY 10522`,
    navButtons: [
      { label: "About Us", path: "/about" },
    ],
  },
  {
    keywords: ["faq", "frequently asked", "common question"],
    response: `Our FAQ page covers the most commonly asked questions about evaluations, translations, turnaround times, pricing, and more!`,
    navButtons: [
      { label: "View FAQ", path: "/faq" },
    ],
  },
  {
    keywords: ["individual", "student", "personal"],
    response: `If you're an **individual** (student, professional, or immigrant), IFCS can help you:

• Get your foreign credentials **evaluated** and recognized
• Receive **certified translations** of your documents
• Get **free consultation** to choose the right evaluation
• Navigate U.S. **admissions and employment** requirements

Start by determining which evaluation type fits your goals!`,
    navButtons: [
      { label: "For Individuals", path: "/for-individuals" },
      { label: "View Evaluations", path: "/evaluations" },
    ],
  },
  {
    keywords: ["institution", "university", "college", "employer", "organization"],
    response: `For **institutions**, IFCS offers:

• **Tailored evaluations** aligned with your admissions and transfer policies
• **15% discount** over standard prices with monthly billing
• **Direct access** to senior evaluators
• **Electronic reports** sent directly to your admissions office
• **Reduced turnaround times**
• **Professional training** for admissions personnel

Our senior staff are recognized experts in foreign credential evaluation.`,
    navButtons: [
      { label: "For Institutions", path: "/for-institutions" },
      { label: "Contact Us", path: "/contact" },
    ],
  },
  {
    keywords: ["document authentication", "verify", "verification", "authenticate"],
    response: `**Document Authentication** is available for **$140**.

Instead of having your institution send official documents directly, IFCS will **contact your issuing institution** to verify your documents on your behalf.

This is a convenient option if:
• Your institution is difficult to reach
• You need faster verification
• You're unable to arrange official document transfer`,
    navButtons: [
      { label: "Start Application", path: "/application" },
    ],
  },
];

const findResponse = (query: string): { response: string; navButtons: NavButton[] } => {
  const q = query.toLowerCase().trim();

  for (const entry of KNOWLEDGE_BASE) {
    for (const kw of entry.keywords) {
      if (q.includes(kw)) {
        return { response: entry.response, navButtons: entry.navButtons || [] };
      }
    }
  }

  // Broad fallback matches
  if (q.includes("evaluation") || q.includes("credential") || q.includes("transcript") || q.includes("degree")) {
    const entry = KNOWLEDGE_BASE.find(e => e.keywords.includes("how do i apply"))!;
    return { response: entry.response, navButtons: entry.navButtons || [] };
  }
  if (q.includes("translat")) {
    const entry = KNOWLEDGE_BASE.find(e => e.keywords.includes("what's a translation"))!;
    return { response: entry.response, navButtons: entry.navButtons || [] };
  }

  return {
    response: `I appreciate your question! While I may not have the specific answer, our team would be happy to help.

📞 **Phone:** (914) 693-2840
📧 **Email:** info@ifcsevals.com
📍 **Address:** 6 Cedar Street, Dobbs Ferry, NY 10522
🕐 **Hours:** Monday–Friday, 9:00 AM – 5:00 PM EST

Is there anything else I can help with regarding evaluations, translations, or consulting?`,
    navButtons: [
      { label: "Contact Us", path: "/contact" },
      { label: "View FAQ", path: "/faq" },
    ],
  };
};

const AIChatWidget = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput("");
    const userMsg: Message = { role: "user", content: suggestion };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    const { response, navButtons } = findResponse(suggestion);
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "assistant", content: response, navButtons }]);
      setIsLoading(false);
    }, 600);
  };

  const sendMessage = async () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;
    const attachmentNames = attachments.map((f) => f.name);
    const userMsg: Message = {
      role: "user",
      content: input.trim(),
      attachments: attachmentNames.length > 0 ? attachmentNames : undefined,
    };
    setMessages((prev) => [...prev, userMsg]);
    const query = input.trim();
    setInput("");
    setAttachments([]);
    setIsLoading(true);

    let response: string;
    let navButtons: NavButton[] = [];

    if (userMsg.attachments && userMsg.attachments.length > 0 && !query) {
      response = "Thank you for sharing your document(s). For a detailed review, please submit them through our online application or email them to **info@ifcsevals.com**.\n\nIf you have questions about the evaluation process, I'm happy to help!";
      navButtons = [{ label: "Start Application", path: "/application" }];
    } else {
      const result = findResponse(query);
      response = result.response;
      navButtons = result.navButtons;
    }

    await new Promise((r) => setTimeout(r, 800));
    setMessages((prev) => [...prev, { role: "assistant", content: response, navButtons }]);
    setIsLoading(false);
  };

  const renderMarkdown = (text: string) => {
    return text.split("\n").map((line, i) => {
      const parts = line.split(/(\*\*.*?\*\*)/).map((part, j) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={j}>{part.slice(2, -2)}</strong>
        ) : (
          <span key={j}>{part}</span>
        )
      );
      return (
        <span key={i}>
          {parts}
          {i < text.split("\n").length - 1 && <br />}
        </span>
      );
    });
  };

  const showSuggestions = messages.length === 0;

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-accent shadow-lg shadow-accent/40 flex items-center justify-center hover:scale-110 transition-transform duration-200"
          aria-label="Open chat"
        >
          <MessageCircle size={24} className="text-white" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-4rem)] rounded-3xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-accent text-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold">IFCS AI Assistant</p>
                <p className="text-[10px] opacity-80">Ask us anything about our services</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 rounded-full p-1.5 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.length === 0 && (
              <div className="space-y-4">
                <div className="text-center py-4 space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
                    <MessageCircle size={22} className="text-accent" />
                  </div>
                  <p className="text-base font-semibold text-foreground">Welcome to IFCS AI</p>
                  <p className="text-xs text-muted-foreground max-w-[280px] mx-auto">
                    I can help you with evaluations, translations, pricing, applications, and more. Try one of these:
                  </p>
                </div>
                {/* Suggestion chips */}
                <div className="flex flex-wrap gap-2 justify-center px-2">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(s)}
                      className="px-3 py-1.5 text-xs font-medium rounded-full border border-accent text-accent bg-white hover:bg-accent/10 transition-colors text-left"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[85%] space-y-2">
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {msg.attachments.map((name, j) => (
                        <span key={j} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-accent/20 text-[10px] text-accent font-medium">
                          <Paperclip size={10} /> {name}
                        </span>
                      ))}
                    </div>
                  )}
                  {msg.content && (
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-accent text-white rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      }`}
                    >
                      {renderMarkdown(msg.content)}
                    </div>
                  )}
                  {/* Navigation buttons */}
                  {msg.navButtons && msg.navButtons.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {msg.navButtons.map((btn, j) => (
                        <button
                          key={j}
                          onClick={() => {
                            setIsOpen(false);
                            navigate(btn.path);
                          }}
                          className="px-4 py-2 text-xs font-semibold rounded-full bg-accent text-white hover:bg-accent/90 transition-colors shadow-sm"
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Attachments preview */}
          {attachments.length > 0 && (
            <div className="px-4 py-2 border-t border-border flex flex-wrap gap-1">
              {attachments.map((file, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-accent/10 text-[10px] font-medium text-accent">
                  <Paperclip size={10} /> {file.name}
                  <button onClick={() => removeAttachment(i)} className="ml-1 hover:text-destructive">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-border px-4 py-3">
            <div className="flex gap-2 items-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-muted transition-colors flex-shrink-0"
                aria-label="Attach file"
              >
                <Paperclip size={18} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
              />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 h-10 px-4 rounded-full text-sm text-foreground placeholder:text-muted-foreground bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
              <button
                onClick={sendMessage}
                disabled={(!input.trim() && attachments.length === 0) || isLoading}
                className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accent/90 transition-colors disabled:opacity-50 flex-shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatWidget;
