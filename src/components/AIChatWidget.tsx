import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, X, Send, Paperclip, RotateCcw, Maximize2, Minimize2, BookOpen, Plus, Trash2, Save, Edit2, ChevronLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type NavButton = { label: string; path: string; state?: any };
type Message = {
  role: "user" | "assistant";
  content: string;
  attachments?: string[];
  navButtons?: NavButton[];
};

const SUGGESTIONS = [
  "What is an evaluation?",
  "How much does it cost?",
  "What documents do I need?",
  "How fast can I get it?",
  "What's a Translation?",
  "Do you offer consulting?",
];

interface KBEntry {
  keywords: string[];
  response: string;
  navButtons?: NavButton[];
}

const appButton = (title: string, price: number, processing: string, procLabel: string, procKey: string): NavButton => ({
  label: `Start ${title}`,
  path: "/application",
  state: { serviceTitle: title, processingKey: procKey, processingLabel: procLabel, processingTime: processing, price },
});

// ============ BUILT-IN KNOWLEDGE BASE ============
const KNOWLEDGE_BASE: KBEntry[] = [
  // --- COMPANY / PEOPLE ---
  {
    keywords: ["who is the owner", "who is the director", "who runs ifcs", "who founded ifcs", "ceo", "founder", "director", "owner of ifcs", "who owns"],
    response: `The Director of **IFCS** is **Agron Matoshi**. He is a recognized expert in foreign credential evaluations and leads IFCS's mission to help international students and professionals get their credentials recognized in the United States.

📍 **IFCS** — Institute of Foreign Credential Services
📍 6 Cedar Street, Dobbs Ferry, NY 10522
📞 (914) 693-2840 | 📧 info@ifcsevals.com`,
    navButtons: [{ label: "About Us", path: "/about" }],
  },
  {
    keywords: ["who works at ifcs", "staff", "team", "employees"],
    response: `The IFCS team is led by **Director Agron Matoshi** and consists of senior credential evaluators who are recognized experts in the field. Our evaluators are regular contributors to publications and conferences organized by **NAFSA**, **AACRAO**, and the **International Association of Universities**.

For specific inquiries, contact us:
📞 (914) 693-2840 | 📧 info@ifcsevals.com`,
    navButtons: [{ label: "About Us", path: "/about" }],
  },
  // --- EVALUATIONS ---
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

**Do you need both?** If your documents are not in English, you'll typically need a certified translation first, then an evaluation. IFCS can handle both!

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
• Pricing: **$50 per page** with no hidden fees`,
    navButtons: [
      { label: "Start Translation Order", path: "/translations/order" },
      { label: "Get a Quote", path: "/translations/quote" },
    ],
  },
  {
    keywords: ["how fast", "how long does evaluation", "turnaround", "how quickly"],
    response: `IFCS offers three processing speeds:

⏱️ **Standard:** 8–10 business days
⚡ **3-Day Rush:** 3 business days
🚀 **24-Hour Priority:** Within 24 hours

Rush pricing varies by evaluation type. For example:
• General Analysis: $100 (Standard) → $150 (3-Day) → $195 (24-Hour)
• Course-by-Course: $190 (Standard) → $290 (3-Day) → $425 (24-Hour)

Processing begins once all required documents and payment are received.`,
    navButtons: [
      { label: "View Pricing", path: "/pricing" },
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
| **Cosmetology CxC** | $170 |
| **Course-by-Course** | $190 |
| **Health Professions CxC** | $230 |
| **Comprehensive CxC** | $290 |
| **HS & University CxC** | $295 |
| **Professional Licensure CxC** | $400 |

**Translations:** $50/page
**Consulting:** Evaluation consultations are **FREE**. Admission advising is **$60/hour**.
**Duplicate Reports:** $25 per copy`,
    navButtons: [
      { label: "View Full Pricing", path: "/pricing" },
      { label: "View Evaluations", path: "/evaluations" },
    ],
  },
  // --- GENERAL DOCUMENTS (no country-specific dump) ---
  {
    keywords: ["what document", "documents do i need", "required document", "what do i need to submit"],
    response: `The documents you need depend on the evaluation type and your **country of education**:

**For most evaluations:**
📄 **Transcripts / Mark Sheets** — official academic records
📄 **Diploma Certificate** — proof of degree completion

Some countries have additional requirements — just let me know which country you studied in and I'll give you the specific details!

**Important notes:**
• Legible uploaded copies are sufficient to **start** your application
• If documents are in a foreign language, IFCS can provide a translation quote
• **Document Authentication** ($140) — IFCS contacts your institution to verify directly

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
🚀 **24-Hour Priority** — Results within 24 hours

Rush fees vary by evaluation type. Examples:
• General Analysis: $150 (3-Day) / $195 (24-Hour)
• Course-by-Course: $290 (3-Day) / $425 (24-Hour)
• Comprehensive CxC: $390 (3-Day) / $490 (24-Hour)

For **translations**, same-day and next-day expedited service at $14.95/page additional.`,
    navButtons: [
      { label: "View Evaluations", path: "/evaluations" },
      { label: "Start Application", path: "/application" },
    ],
  },
  {
    keywords: ["how do i apply", "how to apply", "application process", "get started", "apply"],
    response: `Getting started with IFCS is simple — just follow these 4 steps:

**Step 1:** Determine which evaluation you need. Not sure? Our evaluation consultation is **FREE**!
**Step 2:** Complete the **online application** on our website.
**Step 3:** Upload legible copies of your transcripts and diploma certificates.
**Step 4:** Submit your signed application and make payment.

After submission, you'll receive an **IFCS ID** via email.`,
    navButtons: [
      { label: "Start Application", path: "/application" },
      { label: "View Evaluations", path: "/evaluations" },
    ],
  },
  // ---- SPECIFIC EVALUATION TYPES ----
  {
    keywords: ["general analysis"],
    response: `The **General Analysis** is our most affordable evaluation at **$100**:

**Rush:** $150 (3-Day) / $195 (24-Hour)

**What it includes:**
• Country of study & institution attended
• Dates of attendance & credential received
• Overall U.S. equivalency

**Recommended for:** Immigration, military, and junior college admission.
**Required Documents:** Transcripts/mark sheets and diploma certificate.`,
    navButtons: [
      { label: "View General Analysis", path: "/evaluations#general-analysis" },
      appButton("General Analysis", 100, "8–10 Business Days", "Standard", "standard"),
    ],
  },
  {
    keywords: ["general analysis plus gpa", "general plus gpa", "general gpa", "gpa evaluation"],
    response: `The **General Analysis plus GPA** evaluation costs **$150**:

**Rush:** $205 (3-Day) / $295 (24-Hour)

**What it includes:**
• Everything in General Analysis
• Plus an overall **GPA (Grade Point Average)**

**Recommended for:** Admission to institutions when GPA is required but no credit transfer is intended.`,
    navButtons: [
      { label: "View General Analysis + GPA", path: "/evaluations#general-analysis-plus-gpa" },
      appButton("General Analysis plus GPA", 150, "8–10 Business Days", "Standard", "standard"),
    ],
  },
  {
    keywords: ["cosmetology", "barbering", "beauty therapy", "hairdressing", "esthetics"],
    response: `The **Cosmetology Course-by-Course** evaluation costs **$170**:

**Rush:** $275 (3-Day) / $375 (24-Hour)

**What it includes:**
• Detailed course-by-course breakdown of cosmetology credentials
• Training hours for each subject area
• U.S. semester credit equivalencies

**Recommended for:** State cosmetology licensing boards, barbering, beauty therapy, hairdressing, and esthetics licensure.`,
    navButtons: [
      { label: "View Cosmetology CxC", path: "/evaluations#cosmetology-course-by-course" },
      appButton("Cosmetology Course-by-Course", 170, "8–10 Business Days", "Standard", "standard"),
    ],
  },
  {
    keywords: ["course-by-course", "course by course"],
    response: `The **Course-by-Course** evaluation costs **$190**:

**Rush:** $290 (3-Day) / $425 (24-Hour)

**What it includes:**
• List of all individual courses
• Semester credit hours for each course
• Letter grades and cumulative GPA
• U.S. equivalency

**Recommended for:** Admission to secondary and post-secondary institutions, and employment.`,
    navButtons: [
      { label: "View Course-by-Course", path: "/evaluations#course-by-course" },
      appButton("Course-by-Course", 190, "8–10 Business Days", "Standard", "standard"),
    ],
  },
  {
    keywords: ["health profession", "health professions course-by-course", "medical evaluation", "nursing evaluation", "clinical", "health prof"],
    response: `The **Health Professions Course-by-Course** is designed for healthcare professionals at **$230**:

**Rush:** $355 (3-Day) / $490 (24-Hour)

**What it includes:**
• All courses with credit hours and grades
• Upper/lower division and graduate level designations
• **Clinical experience details**
• U.S. equivalency

**Recommended for:** Medical, nursing, and health profession licensing boards.`,
    navButtons: [
      { label: "View Health Professions CxC", path: "/evaluations#health-professions-course-by-course" },
      appButton("Health Professions Course-by-Course", 230, "8–10 Business Days", "Standard", "standard"),
    ],
  },
  {
    keywords: ["comprehensive", "comprehensive course-by-course", "multiple degrees", "two degrees"],
    response: `The **Comprehensive Course-by-Course** evaluation costs **$290**:

**Rush:** $390 (3-Day) / $490 (24-Hour)

**What it includes:**
• All courses with semester credit hours and grades
• Lower and upper-division designations
• Graduate level classifications
• U.S. equivalency for **each** credential
• Covers **up to 2 degrees**

**Recommended for:** Graduate school admission, professional licensure, and individuals with multiple university degrees.`,
    navButtons: [
      { label: "View Comprehensive CxC", path: "/evaluations#comprehensive-course-by-course" },
      appButton("Comprehensive Course-by-Course", 290, "8–10 Business Days", "Standard", "standard"),
    ],
  },
  {
    keywords: ["high school and university", "high school & university", "high school university", "secondary and post-secondary"],
    response: `The **High School and University Course-by-Course** evaluation costs **$295**:

**Rush:** $395 (3-Day) / $495 (24-Hour)

**What it includes:**
• Comprehensive course-by-course covering **both** High School and University
• Detailed listing of courses, credit hours, grades, GPA
• U.S. equivalencies for each credential level

**Required Documents:** High School diploma + transcript, University degree certificate + transcript.`,
    navButtons: [
      { label: "View HS & University CxC", path: "/evaluations#high-school-and-university-course-by-course" },
      appButton("High School and University Course-by-Course", 295, "8–10 Business Days", "Standard", "standard"),
    ],
  },
  {
    keywords: ["professional licensure", "licensure course-by-course", "cpa", "engineer licensure", "bar admission", "pe licensure", "accounting evaluation"],
    response: `The **Professional Licensure Course-by-Course** is our most comprehensive evaluation at **$400**:

**Rush:** $550 (3-Day) / $650 (24-Hour)

**What it includes:**
• Secondary and post-secondary credential evaluation
• Detailed U.S. equivalencies and credit-hour analysis
• Grading-scale conversion and course-level comparability
• Professional credential validation

**Recommended for:** CPA, Professional Engineer (PE), Attorney Bar Admission.`,
    navButtons: [
      { label: "View Professional Licensure CxC", path: "/evaluations#professional-licensure-course-by-course" },
      appButton("Professional Licensure Course-by-Course", 400, "8–10 Business Days", "Standard", "standard"),
    ],
  },
  // ---- COUNTRY-SPECIFIC (each standalone, no other countries mentioned) ----
  {
    keywords: ["jamaica", "trinidad", "barbados", "guyana", "bahamas", "caribbean", "cxc", "csec", "cape", "st lucia", "antigua", "grenada", "dominica", "st kitts", "st vincent", "belize"],
    response: `For applicants from **Caribbean countries** (Jamaica, Trinidad & Tobago, Barbados, Guyana, Bahamas, etc.):

**Required Documents:**
📄 **CXC/CSEC Results** — Caribbean Secondary Education Certificate results are **required** for secondary-level evaluations
📄 **CAPE Results** — If applicable, for advanced proficiency
📄 **University Transcripts** — If you attended a Caribbean or other university
📄 **Diploma/Degree Certificate**

**Important:** The CXC results serve as the equivalent of a U.S. high school transcript for Caribbean nations. Without them, a complete evaluation of secondary credentials cannot be performed.

The most common evaluation for Caribbean applicants is the **Course-by-Course ($190)** or **High School & University CxC ($295)**.`,
    navButtons: [
      { label: "View Evaluations", path: "/evaluations" },
      { label: "Start Application", path: "/application" },
    ],
  },
  {
    keywords: ["nigeria", "ghana", "west africa", "waec", "neco", "sierra leone", "gambia", "liberia"],
    response: `For applicants from **West African countries** (Nigeria, Ghana, Sierra Leone, Gambia, Liberia, etc.):

**Required Documents:**
📄 **WAEC (West African Examinations Council)** results — This is the equivalent of a U.S. high school diploma and is **required** for secondary-level evaluations
📄 **NECO Results** — National Examinations Council results (Nigeria), if applicable
📄 **University Transcripts / Statement of Results**
📄 **Degree Certificate**

**For Nigerian applicants specifically:**
• WAEC/SSCE results are essential
• NYSC (National Youth Service Corps) certificate may be requested for some evaluations

The most common evaluation for West African applicants is the **Course-by-Course ($190)** or **Comprehensive CxC ($290)**.`,
    navButtons: [
      { label: "View Evaluations", path: "/evaluations" },
      { label: "Start Application", path: "/application" },
    ],
  },
  {
    keywords: ["india", "indian", "mark sheet", "marksheet", "cbse", "icse"],
    response: `For applicants from **India**:

**Required Documents:**
📄 **Mark Sheets** — Year-wise or semester-wise mark sheets for each year of study are **required**. Consolidated mark sheets are also accepted.
📄 **Degree Certificate / Provisional Degree Certificate**
📄 **10th & 12th Board Results** (CBSE, ICSE, or State Board) — Required for evaluations that include secondary credentials

**Important notes:**
• Indian universities issue mark sheets rather than transcripts — these are fully accepted
• If you have a **3-year bachelor's degree**, this is evaluated differently from a 4-year degree — IFCS will clarify the U.S. equivalency
• For professional courses (Engineering, Medical), the **Health Professions CxC ($230)** or **Professional Licensure CxC ($400)** may be appropriate`,
    navButtons: [
      { label: "View Evaluations", path: "/evaluations" },
      { label: "Start Application", path: "/application" },
    ],
  },
  {
    keywords: ["philippines", "filipino", "tor", "ched", "cav"],
    response: `For applicants from the **Philippines**:

**Required Documents:**
📄 **Transcript of Records (TOR)** — Official academic transcript
📄 **Diploma / Degree Certificate**
📄 **CAV (Certification, Authentication, and Verification)** — From CHED or DFA, may be required by some U.S. licensing boards

**For healthcare professionals:**
• The **Health Professions CxC ($230)** is commonly required for nursing, medical, and allied health licensure boards`,
    navButtons: [
      { label: "View Health Professions CxC", path: "/evaluations#health-professions-course-by-course" },
      { label: "Start Application", path: "/application" },
    ],
  },
  {
    keywords: ["china", "chinese", "cdgdc", "chesicc"],
    response: `For applicants from **China**:

**Required Documents:**
📄 **Official Transcripts** — In Chinese with notarized English translations
📄 **Degree Certificate / Diploma** — With notarized English translation
📄 **CDGDC/CHESICC Verification** — Degree verification may be needed

**Important:** Chinese documents not in English require a **certified translation** — IFCS can provide this ($50/page).`,
    navButtons: [
      { label: "View Evaluations", path: "/evaluations" },
      { label: "Translation Services", path: "/translations" },
    ],
  },
  {
    keywords: ["mexico", "mexican", "cedula", "titulo"],
    response: `For applicants from **Mexico**:

**Required Documents:**
📄 **Certificado de Estudios** — Official academic records/transcripts
📄 **Título Profesional** — Professional degree certificate
📄 **Cédula Profesional** — Professional license (if applicable)
📄 **Certified English translations** of all documents

All Mexican documents require certified English translations. IFCS can provide this ($50/page).`,
    navButtons: [
      { label: "View Evaluations", path: "/evaluations" },
      { label: "Translation Services", path: "/translations" },
    ],
  },
  {
    keywords: ["korea", "korean", "south korea"],
    response: `For applicants from **South Korea**:

**Required Documents:**
📄 **성적증명서 (Transcripts)** — Official academic transcripts
📄 **졸업증명서 (Graduation Certificate)** — Or degree certificate
📄 **Certified English translations** if documents are in Korean

Korean universities often issue both Korean and English versions of transcripts.`,
    navButtons: [
      { label: "View Evaluations", path: "/evaluations" },
      { label: "Start Application", path: "/application" },
    ],
  },
  {
    keywords: ["middle east", "saudi", "uae", "dubai", "qatar", "kuwait", "arabic", "jordan", "lebanon", "iraq", "iran", "egypt"],
    response: `For applicants from **Middle Eastern countries**:

**Required Documents:**
📄 **Official Transcripts** — In Arabic with certified English translations
📄 **Degree Certificate** — With certified English translation
📄 **Equivalency Certificate** — From the Ministry of Education (if available)

Arabic documents require certified English translation. IFCS can provide this ($50/page).`,
    navButtons: [
      { label: "View Evaluations", path: "/evaluations" },
      { label: "Translation Services", path: "/translations" },
    ],
  },
  {
    keywords: ["kenya", "ethiopia", "tanzania", "uganda", "south africa", "east africa"],
    response: `For applicants from **East/Southern African countries**:

**Required Documents:**
📄 **Official Transcripts / Academic Records**
📄 **Degree Certificate / Diploma**
📄 **Secondary school certificates** — KCSE (Kenya), EGSECE (Ethiopia), CSEE (Tanzania), UCE/UACE (Uganda), NSC (South Africa)
📄 **Certified English translations** if documents are not in English`,
    navButtons: [
      { label: "View Evaluations", path: "/evaluations" },
      { label: "Start Application", path: "/application" },
    ],
  },
  {
    keywords: ["brazil", "brazilian", "enem"],
    response: `For applicants from **Brazil**:

**Required Documents:**
📄 **Histórico Escolar** — Official academic transcript
📄 **Diploma** — Degree certificate
📄 **Certified English translations** of all Portuguese documents

IFCS can provide certified translations at $50/page.`,
    navButtons: [
      { label: "View Evaluations", path: "/evaluations" },
      { label: "Translation Services", path: "/translations" },
    ],
  },
  {
    keywords: ["russia", "russian", "ukraine", "ukrainian", "belarus"],
    response: `For applicants from **Russia / Ukraine / Belarus**:

**Required Documents:**
📄 **Диплом (Diploma)** — Degree certificate with certified English translation
📄 **Приложение к диплому (Diploma Supplement)** — Transcript/grades with translation
📄 **Аттестат (Attestat)** — Secondary school certificate, if needed

All documents require **certified English translations**. IFCS can provide these at $50/page.`,
    navButtons: [
      { label: "View Evaluations", path: "/evaluations" },
      { label: "Translation Services", path: "/translations" },
    ],
  },
  {
    keywords: ["pakistan", "pakistani"],
    response: `For applicants from **Pakistan**:

**Required Documents:**
📄 **Detailed Marks Certificate (DMC)** — For each year/semester
📄 **Degree Certificate**
📄 **Matric & Inter Board Results** — For secondary-level evaluations
📄 **HEC Attestation** — Higher Education Commission attestation (recommended)`,
    navButtons: [
      { label: "View Evaluations", path: "/evaluations" },
      { label: "Start Application", path: "/application" },
    ],
  },
  {
    keywords: ["bangladesh", "bangladeshi"],
    response: `For applicants from **Bangladesh**:

**Required Documents:**
📄 **Mark Sheets / Academic Transcripts** — For each year
📄 **Certificate / Degree**
📄 **SSC & HSC Results** — For secondary-level evaluations
📄 **Certified English translations** if documents are in Bengali`,
    navButtons: [
      { label: "View Evaluations", path: "/evaluations" },
      { label: "Start Application", path: "/application" },
    ],
  },
  {
    keywords: ["japan", "japanese"],
    response: `For applicants from **Japan**:

**Required Documents:**
📄 **成績証明書 (Seiseki Shōmeisho)** — Official transcripts
📄 **卒業証明書 (Sotsugyō Shōmeisho)** — Graduation certificate
📄 **Certified English translations** if documents are in Japanese

IFCS can provide certified translations at $50/page.`,
    navButtons: [
      { label: "View Evaluations", path: "/evaluations" },
      { label: "Translation Services", path: "/translations" },
    ],
  },
  {
    keywords: ["france", "french", "germany", "german", "italy", "italian", "spain", "spanish", "europe", "european", "uk", "united kingdom", "britain", "british", "portugal", "portuguese", "netherlands", "dutch", "poland", "polish", "romania", "romanian"],
    response: `For applicants from **European countries**:

**Required Documents:**
📄 **Official Transcripts / Academic Records**
📄 **Degree Certificate / Diploma**
📄 **Diploma Supplement** (if available — common in Bologna Process countries)
📄 **Certified English translations** if documents are not in English

IFCS can provide certified translations at $50/page for non-English documents.`,
    navButtons: [
      { label: "View Evaluations", path: "/evaluations" },
      { label: "Start Application", path: "/application" },
    ],
  },
  // ---- GENERAL TOPICS ----
  {
    keywords: ["consult", "consulting", "advising", "advisor", "appointment"],
    response: `IFCS offers two types of consulting:

🆓 **Evaluation Consultation — FREE**
Our experts help you determine which evaluation type is right for your specific goals.

💼 **Admissions & Academic Advising — $60/hour**
Our senior staff can help you find the right U.S. institution and program.

Consultations are held at our **Dobbs Ferry office** by appointment.
📞 **(914) 693-2840** | 📧 **info@ifcsevals.com**`,
    navButtons: [
      { label: "Book a Consultation", path: "/consulting/book" },
      { label: "View Consulting Page", path: "/consulting" },
    ],
  },
  {
    keywords: ["check status", "track", "status of", "my evaluation", "order status"],
    response: `You can check the status of your evaluation through your **My Dashboard**.

You'll need:
• Your **Application ID** (starts with "EE")
• Your **Date of Birth**

If you have an IFCS ID, you can also use that to look up your order.`,
    navButtons: [{ label: "Go to Dashboard", path: "/dashboard/client" }],
  },
  {
    keywords: ["what language", "which language", "language do you", "languages"],
    response: `We translate documents from and into **150+ languages**, including Spanish, French, Arabic, Chinese, Hindi, Portuguese, Russian, Japanese, Korean, German, Italian, Turkish, Vietnamese, Thai, Polish, Ukrainian, and many more!

All translations include:
• IFCS letterhead with signed certificate of accuracy
• Accepted by USCIS, universities, and government agencies
• $50 per page`,
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

IFCS evaluators are recognized experts, regular contributors to **NAFSA**, **AACRAO**, and the **International Association of Universities**.`,
    navButtons: [
      { label: "Start Application", path: "/application" },
      { label: "Learn More", path: "/learn-more-evaluations" },
    ],
  },
  {
    keywords: ["refund", "cancel", "money back"],
    response: `Here is our refund policy:

• Refunds are issued **only for overpayment**.
• **Standard service** can be canceled within **24 hours**, subject to a **$50 minimum processing fee**.
• **No refunds** for 24-hour and 3-day rush services once processing has begun.

📞 **(914) 693-2840** | 📧 **info@ifcsevals.com**`,
    navButtons: [{ label: "Contact Us", path: "/contact" }],
  },
  {
    keywords: ["duplicate", "additional cop", "extra cop"],
    response: `If you've received an evaluation from IFCS within the past **5 years**, you can request additional copies:

📄 **Electronic Report:** $25
📄 **Hard Copy:** $25 each
📦 **Domestic Shipping:** $25
✈️ **International Shipping:** $70`,
    navButtons: [{ label: "Order Duplicate Reports", path: "/duplicate-reports" }],
  },
  {
    keywords: ["shipping", "delivery", "mail", "send report"],
    response: `We offer several delivery options:

📧 **Electronic Sharing:** $25
📄 **Hard Copy:** $25 each
📦 **Domestic Shipping:** $25
✈️ **International Shipping:** $70

Reports are valid for **5 years**. After expiration, renewal is available for **$100**.`,
    navButtons: [{ label: "Start Application", path: "/application" }],
  },
  {
    keywords: ["renewal", "expire", "expiration", "valid", "how long is report valid"],
    response: `Evaluation reports are valid for **5 years** from the date of issuance. After expiration, you can renew for **$100**.`,
    navButtons: [{ label: "Renew Evaluation", path: "/addon/renewal" }],
  },
  {
    keywords: ["contact", "phone", "email address", "reach", "office", "address", "location", "hours"],
    response: `📞 **Phone:** (914) 693-2840
📠 **Fax:** (914) 231-7782
📧 **Email:** info@ifcsevals.com
📍 **Address:** 6 Cedar Street, Dobbs Ferry, NY 10522
🕐 **Hours:** Monday–Friday, 9:00 AM – 5:00 PM EST

**Director:** Agron Matoshi`,
    navButtons: [{ label: "Contact Us", path: "/contact" }],
  },
  {
    keywords: ["notari", "notarization"],
    response: `Yes! We offer **notarization** as an add-on: **$19.95 per order**, valid in **all 50 U.S. states**. You can add it during the translation order process.`,
    navButtons: [{ label: "Start Translation Order", path: "/translations/order" }],
  },
  {
    keywords: ["document authentication", "verify", "verification", "authenticate"],
    response: `**Document Authentication** is available for **$140**.

IFCS will **contact your issuing institution** to verify your documents on your behalf. This saves you time if your institution is difficult to reach.`,
    navButtons: [{ label: "Start Application", path: "/application" }],
  },
  {
    keywords: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"],
    response: `Hello! 👋 Welcome to **IFCS** — the Institute of Foreign Credential Services.

I can help you with:
• **Evaluations** — pricing, types, and how to apply
• **Translations** — certified translations in 150+ languages
• **Consulting** — free evaluation consultations
• **Status** — checking your evaluation progress

What would you like to know?`,
    navButtons: [],
  },
  {
    keywords: ["thank", "thanks", "appreciate"],
    response: `You're welcome! 😊 If you have any more questions, feel free to ask.

📞 **(914) 693-2840** | 📧 **info@ifcsevals.com**`,
    navButtons: [],
  },
  {
    keywords: ["blog", "articles", "news"],
    response: `Check out our blog for the latest news, tips, and insights about foreign credential evaluations!`,
    navButtons: [{ label: "Visit Our Blog", path: "/blog" }],
  },
  {
    keywords: ["about", "who is ifcs", "about ifcs", "history"],
    response: `**IFCS** — the Institute of Foreign Credential Services — is based in Dobbs Ferry, NY and is led by **Director Agron Matoshi**.

**What makes IFCS unique:**
• **Expert evaluators** — recognized industry leaders
• Regular contributors to **NAFSA**, **AACRAO**, and **IAU**
• **Personal attention** applied to every account
• Trusted by universities, government agencies, employers, and licensure boards`,
    navButtons: [{ label: "About Us", path: "/about" }],
  },
  {
    keywords: ["faq", "frequently asked", "common question"],
    response: `Our FAQ page covers the most commonly asked questions!`,
    navButtons: [{ label: "View FAQ", path: "/faq" }],
  },
  {
    keywords: ["individual", "student", "personal"],
    response: `If you're an **individual**, IFCS can help you get your foreign credentials evaluated, translated, and recognized.`,
    navButtons: [
      { label: "For Individuals", path: "/for-individuals" },
      { label: "View Evaluations", path: "/evaluations" },
    ],
  },
  {
    keywords: ["institution", "university", "college", "employer", "organization"],
    response: `For **institutions**, IFCS offers tailored evaluations, **15% discount**, direct access to senior evaluators, electronic reports, and reduced turnaround times.`,
    navButtons: [
      { label: "For Institutions", path: "/for-institutions" },
      { label: "Contact Us", path: "/contact" },
    ],
  },
  {
    keywords: ["naces", "member", "accredit", "legitimate"],
    response: `IFCS is a recognized credential evaluation service trusted by:

✅ **NAFSA** — Association of International Educators
✅ **AACRAO** — American Association of Collegiate Registrars and Admissions Officers
✅ **IAU** — International Association of Universities
✅ **UNESCO** — United Nations Educational, Scientific and Cultural Organization`,
    navButtons: [
      { label: "About Us", path: "/about" },
      { label: "Learn More", path: "/learn-more-evaluations" },
    ],
  },
  {
    keywords: ["original document", "do i need original", "send original"],
    response: `**No, you do not need to send originals to start!** Legible uploaded copies of your transcripts and diplomas are sufficient to begin your application.

For official evaluation, your institution may need to send **official transcripts** directly to IFCS, or you can pay **$140 for Document Authentication**.

📍 **Mailing address:** IFCS, 6 Cedar Street, Dobbs Ferry, NY 10522`,
    navButtons: [{ label: "Start Application", path: "/application" }],
  },
  {
    keywords: ["three degree", "3 degree", "more than two", "multiple degree"],
    response: `The **Comprehensive Course-by-Course ($290)** covers up to **2 degrees**. If you have 3 or more, additional fees may apply.

📞 **(914) 693-2840** | 📧 **info@ifcsevals.com**`,
    navButtons: [
      { label: "View Comprehensive CxC", path: "/evaluations#comprehensive-course-by-course" },
      { label: "Contact Us", path: "/contact" },
    ],
  },
  {
    keywords: ["accepted by my school", "will my school accept", "does my university accept"],
    response: `IFCS evaluations are trusted and accepted by universities, federal and state government agencies, employers, and licensure boards across the U.S.

We always recommend checking with your specific institution's admissions office. Our evaluation consultation is **FREE**!`,
    navButtons: [
      { label: "Contact Us", path: "/contact" },
      { label: "Book Consultation", path: "/consulting/book" },
    ],
  },
  {
    keywords: ["dobbs ferry", "where are you", "where is ifcs"],
    response: `IFCS is located at:

📍 **6 Cedar Street, Dobbs Ferry, NY 10522**
📞 (914) 693-2840
📠 Fax: (914) 231-7782
📧 info@ifcsevals.com
🕐 Monday–Friday, 9 AM – 5 PM EST

**Director:** Agron Matoshi`,
    navButtons: [{ label: "Contact Us", path: "/contact" }],
  },
  {
    keywords: ["sample", "sample report", "what does report look like"],
    response: `You can view sample evaluation reports on our evaluations page! Each evaluation type has a "View Sample" button so you can see exactly what the report looks like.`,
    navButtons: [
      { label: "View Evaluations", path: "/evaluations" },
      { label: "Learn More", path: "/learn-more-evaluations" },
    ],
  },
];

// ============ MATCHING LOGIC ============
const findResponse = (query: string, customEntries: KBEntry[]): { response: string; navButtons: NavButton[] } => {
  const q = query.toLowerCase().trim();
  const allEntries = [...customEntries, ...KNOWLEDGE_BASE];

  // Score-based matching: prefer entries with more keyword matches
  let bestMatch: KBEntry | null = null;
  let bestScore = 0;

  for (const entry of allEntries) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (q.includes(kw.toLowerCase())) {
        score += kw.length; // longer keyword = more specific = higher score
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  if (bestMatch && bestScore > 0) {
    return { response: bestMatch.response, navButtons: bestMatch.navButtons || [] };
  }

  // Broad fallback
  if (q.includes("evaluation") || q.includes("credential") || q.includes("transcript") || q.includes("degree")) {
    const entry = KNOWLEDGE_BASE.find(e => e.keywords.includes("how do i apply"));
    if (entry) return { response: entry.response, navButtons: entry.navButtons || [] };
  }
  if (q.includes("translat")) {
    const entry = KNOWLEDGE_BASE.find(e => e.keywords.includes("what's a translation"));
    if (entry) return { response: entry.response, navButtons: entry.navButtons || [] };
  }

  return {
    response: `I appreciate your question! While I may not have the specific answer, our team would be happy to help.

📞 **Phone:** (914) 693-2840
📧 **Email:** info@ifcsevals.com
📍 **Address:** 6 Cedar Street, Dobbs Ferry, NY 10522
🕐 **Hours:** Monday–Friday, 9:00 AM – 5:00 PM EST

Is there anything else I can help with?`,
    navButtons: [
      { label: "Contact Us", path: "/contact" },
      { label: "View FAQ", path: "/faq" },
    ],
  };
};

// ============ CHAT STATE KEY ============
const CHAT_STATE_KEY = "ifcs_ai_chat_state";

const saveChatState = (messages: Message[]) => {
  try {
    sessionStorage.setItem(CHAT_STATE_KEY, JSON.stringify(messages));
  } catch { /* ignore */ }
};

const loadChatState = (): Message[] => {
  try {
    const saved = sessionStorage.getItem(CHAT_STATE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
};

// ============ KNOWLEDGE EDITOR ============
interface DBKnowledgeEntry {
  id: string;
  title: string;
  keywords: string[];
  response: string;
  nav_buttons: NavButton[];
  category: string;
  is_active: boolean;
}

const KnowledgeEditor = ({ onClose }: { onClose: () => void }) => {
  const [entries, setEntries] = useState<DBKnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<DBKnowledgeEntry | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formKeywords, setFormKeywords] = useState("");
  const [formResponse, setFormResponse] = useState("");
  const [formCategory, setFormCategory] = useState("general");
  const [saving, setSaving] = useState(false);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const { data } = await (supabase as any).from("ai_knowledge_entries").select("*").eq("is_active", true).order("created_at", { ascending: false });
    setEntries(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const resetForm = () => {
    setEditing(null);
    setFormTitle("");
    setFormKeywords("");
    setFormResponse("");
    setFormCategory("general");
  };

  const startEdit = (entry: DBKnowledgeEntry) => {
    setEditing(entry);
    setFormTitle(entry.title);
    setFormKeywords(entry.keywords.join(", "));
    setFormResponse(entry.response);
    setFormCategory(entry.category);
  };

  const handleSave = async () => {
    if (!formTitle.trim() || !formResponse.trim()) return;
    setSaving(true);
    const keywords = formKeywords.split(",").map(k => k.trim().toLowerCase()).filter(Boolean);
    const payload = {
      title: formTitle.trim(),
      keywords,
      response: formResponse.trim(),
      category: formCategory,
      nav_buttons: [],
      updated_at: new Date().toISOString(),
    };

    if (editing) {
      await (supabase as any).from("ai_knowledge_entries").update(payload).eq("id", editing.id);
    } else {
      await (supabase as any).from("ai_knowledge_entries").insert(payload);
    }
    resetForm();
    await fetchEntries();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await (supabase as any).from("ai_knowledge_entries").delete().eq("id", id);
    await fetchEntries();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-accent text-white">
        <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1.5 transition-colors">
          <ChevronLeft size={18} />
        </button>
        <BookOpen size={18} />
        <span className="text-sm font-semibold">Knowledge Base Editor</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Add / Edit Form */}
        <div className="rounded-2xl border border-border p-4 space-y-3 bg-muted/30">
          <p className="text-xs font-bold uppercase tracking-wider text-foreground">
            {editing ? "Edit Entry" : "Add New Entry"}
          </p>
          <input
            value={formTitle}
            onChange={e => setFormTitle(e.target.value)}
            placeholder="Title (e.g. 'Office Hours')"
            className="w-full px-3 py-2 rounded-xl text-sm border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
          <input
            value={formKeywords}
            onChange={e => setFormKeywords(e.target.value)}
            placeholder="Keywords (comma-separated, e.g. 'hours, open, schedule')"
            className="w-full px-3 py-2 rounded-xl text-sm border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
          <select
            value={formCategory}
            onChange={e => setFormCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm border border-border bg-background text-foreground"
          >
            <option value="general">General</option>
            <option value="evaluations">Evaluations</option>
            <option value="translations">Translations</option>
            <option value="company">Company</option>
            <option value="policies">Policies</option>
          </select>
          <textarea
            value={formResponse}
            onChange={e => setFormResponse(e.target.value)}
            placeholder="AI Response (supports **bold** formatting)"
            rows={5}
            className="w-full px-3 py-2 rounded-xl text-sm border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !formTitle.trim() || !formResponse.trim()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full bg-accent text-white hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              <Save size={14} /> {editing ? "Update" : "Add Entry"}
            </button>
            {editing && (
              <button onClick={resetForm} className="px-4 py-2 text-xs font-semibold rounded-full border border-border text-foreground hover:bg-muted transition-colors">
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Existing Entries */}
        <p className="text-xs font-bold uppercase tracking-wider text-foreground">
          Custom Entries ({entries.length})
        </p>
        {loading ? (
          <p className="text-xs text-muted-foreground text-center py-4">Loading...</p>
        ) : entries.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No custom entries yet. Add one above!</p>
        ) : (
          <div className="space-y-2">
            {entries.map(entry => (
              <div key={entry.id} className="rounded-2xl border border-border p-3 bg-background space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{entry.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      Keywords: {entry.keywords.join(", ")}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => startEdit(entry)} className="p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-accent">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(entry.id)} className="p-1.5 rounded-full hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{entry.response.replace(/\*\*/g, "")}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============ MAIN WIDGET ============
const AIChatWidget = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isStaff = user?.role === "staff";
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>(loadChatState);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showKnowledge, setShowKnowledge] = useState(false);
  const [customEntries, setCustomEntries] = useState<KBEntry[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load custom knowledge entries from DB
  useEffect(() => {
    const loadCustom = async () => {
      const { data } = await (supabase as any).from("ai_knowledge_entries").select("*").eq("is_active", true);
      if (data) {
        setCustomEntries(data.map((e: any) => ({
          keywords: e.keywords || [],
          response: e.response || "",
          navButtons: e.nav_buttons || [],
        })));
      }
    };
    loadCustom();
  }, [showKnowledge]); // reload when closing knowledge editor

  // Save chat state on message changes
  useEffect(() => {
    saveChatState(messages);
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const removeAttachment = (index: number) => setAttachments(prev => prev.filter((_, i) => i !== index));

  const handleSuggestionClick = (suggestion: string) => {
    setInput("");
    const userMsg: Message = { role: "user", content: suggestion };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    const { response, navButtons } = findResponse(suggestion, customEntries);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "assistant", content: response, navButtons }]);
      setIsLoading(false);
    }, 400);
  };

  const sendMessage = async () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;
    const attachmentNames = attachments.map(f => f.name);
    const userMsg: Message = {
      role: "user",
      content: input.trim(),
      attachments: attachmentNames.length > 0 ? attachmentNames : undefined,
    };
    setMessages(prev => [...prev, userMsg]);
    const query = input.trim();
    setInput("");
    setAttachments([]);
    setIsLoading(true);

    let response: string;
    let navButtons: NavButton[] = [];

    if (userMsg.attachments && userMsg.attachments.length > 0 && !query) {
      response = "Thank you for sharing your document(s). For a detailed review, please submit them through our online application or email them to **info@ifcsevals.com**.";
      navButtons = [{ label: "Start Application", path: "/application" }];
    } else {
      const result = findResponse(query, customEntries);
      response = result.response;
      navButtons = result.navButtons;
    }

    await new Promise(r => setTimeout(r, 500));
    setMessages(prev => [...prev, { role: "assistant", content: response, navButtons }]);
    setIsLoading(false);
  };

  const handleReset = () => {
    setMessages([]);
    setInput("");
    setAttachments([]);
    sessionStorage.removeItem(CHAT_STATE_KEY);
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
        <div className={`fixed z-50 rounded-3xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden animate-fade-in-up transition-all duration-300 ${
          isExpanded
            ? "bottom-4 right-4 w-[50vw] max-w-[720px] h-[calc(100vh-2rem)]"
            : "bottom-6 right-6 w-[400px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-4rem)]"
        }`}>
          {showKnowledge ? (
            <KnowledgeEditor onClose={() => setShowKnowledge(false)} />
          ) : (
            <>
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
                <div className="flex items-center gap-1">
                  {isStaff && (
                    <button
                      onClick={() => setShowKnowledge(true)}
                      className="hover:bg-white/20 rounded-full px-3 py-1.5 transition-colors flex items-center gap-1.5 text-[11px] font-semibold"
                      title="Manage Knowledge Base"
                    >
                      <BookOpen size={14} /> Knowledge
                    </button>
                  )}
                  <button
                    onClick={handleReset}
                    className="hover:bg-white/20 rounded-full p-1.5 transition-colors"
                    aria-label="Reset chat"
                    title="Reset chat"
                  >
                    <RotateCcw size={16} />
                  </button>
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="hover:bg-white/20 rounded-full p-1.5 transition-colors"
                    title={isExpanded ? "Minimize" : "Expand"}
                  >
                    {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                  <button onClick={() => { setIsOpen(false); setIsExpanded(false); }} className="hover:bg-white/20 rounded-full p-1.5 transition-colors">
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {messages.length === 0 && (
                  <div className="space-y-4">
                    <div className="text-center py-3 space-y-2">
                      <div className="w-12 h-12 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
                        <MessageCircle size={22} className="text-accent" />
                      </div>
                      <p className="text-base font-semibold text-foreground">Welcome to IFCS AI</p>
                      <p className="text-xs text-muted-foreground max-w-[280px] mx-auto">
                        How can I help you today? Try one of these:
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 px-2">
                      {SUGGESTIONS.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestionClick(s)}
                          className="px-3 py-2.5 text-xs font-medium rounded-2xl border border-accent/30 text-accent bg-white hover:bg-accent hover:text-white transition-all duration-200 text-center leading-tight"
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
                      {msg.navButtons && msg.navButtons.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {msg.navButtons.map((btn, j) => (
                            <button
                              key={j}
                              onClick={() => {
                                setIsOpen(false);
                                if (btn.state) {
                                  navigate(btn.path, { state: btn.state });
                                } else {
                                  navigate(btn.path);
                                }
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
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendMessage()}
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
            </>
          )}
        </div>
      )}
    </>
  );
};

export default AIChatWidget;
