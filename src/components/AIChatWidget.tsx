import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, X, Send, Paperclip, RotateCcw, Maximize2, Minimize2, BookOpen, Plus, Trash2, Save, Edit2, ChevronLeft, Sparkles, Wand2, Loader2, Tag, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ifcsLogo from "@/assets/ifcs-logo.png";

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

const QUICK_PROMPTS = [
  "Check my application status",
  "How do I log in?",
  "View pricing",
  "What's in my cart?",
];

// Contextual prompts based on last AI response content
const getContextualPrompts = (lastAssistantMsg: string): string[] => {
  const lower = lastAssistantMsg.toLowerCase();
  
  if (lower.includes("general analysis") && !lower.includes("course-by-course")) {
    return ["Start General Analysis application", "What documents do I need?", "View pricing", "What about rush processing?"];
  }
  if (lower.includes("course-by-course") && lower.includes("health")) {
    return ["Start Health Professions application", "What documents do I need?", "View pricing", "Do you offer rush?"];
  }
  if (lower.includes("course-by-course") && lower.includes("comprehensive")) {
    return ["Start Comprehensive application", "I have 3+ degrees", "View pricing", "How fast can I get it?"];
  }
  if (lower.includes("course-by-course") && lower.includes("professional licensure")) {
    return ["Start Professional Licensure application", "Is this for CPA?", "View pricing", "What about rush?"];
  }
  if (lower.includes("course-by-course") && lower.includes("cosmetology")) {
    return ["Start Cosmetology application", "View pricing", "What documents do I need?"];
  }
  if (lower.includes("course-by-course")) {
    return ["Start Course-by-Course application", "What documents do I need?", "View pricing", "How fast can I get it?"];
  }
  if (lower.includes("translation")) {
    return ["Start translation order", "Get a translation quote", "How much per page?", "What languages?"];
  }
  if (lower.includes("evaluation")) {
    return ["View all evaluation types", "Which evaluation do I need?", "View pricing", "How do I apply?"];
  }
  if (lower.includes("application found") || lower.includes("status")) {
    return ["Go to my dashboard", "Contact IFCS", "Request duplicate report"];
  }
  if (lower.includes("caribbean") || lower.includes("cxc")) {
    return ["Start application", "View evaluations", "What is CXC?"];
  }
  if (lower.includes("waec") || lower.includes("nigeria") || lower.includes("west afric")) {
    return ["Start application", "View evaluations", "Need translations too"];
  }
  if (lower.includes("consult")) {
    return ["Book a consultation", "View evaluations", "View pricing"];
  }
  if (lower.includes("discount") || lower.includes("promo")) {
    return ["Contact IFCS for codes", "View pricing", "Start application"];
  }
  // Default fallback
  return QUICK_PROMPTS;
};

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
  {
    keywords: ["who is the owner", "who is the director", "who runs ifcs", "who founded ifcs", "ceo", "founder", "director", "owner of ifcs", "who owns"],
    response: `For inquiries about our leadership team, please contact us directly:\n\n📞 **(914) 693-2840**\n📧 **info@ifcsevals.com**\n📍 6 Cedar Street, Dobbs Ferry, NY 10522`,
    navButtons: [{ label: "Contact Us", path: "/contact" }],
  },
  {
    keywords: ["who works at ifcs", "staff", "team", "employees"],
    response: `The IFCS team consists of senior credential evaluators who are recognized experts in the field. Our evaluators are regular contributors to publications and conferences organized by leading international education associations.\n\nFor specific inquiries, contact us:\n📞 (914) 693-2840 | 📧 info@ifcsevals.com`,
    navButtons: [{ label: "About Us", path: "/about" }],
  },
  {
    keywords: ["what is an evaluation", "what is credential evaluation", "what's a credential evaluation", "what is a evaluation"],
    response: `A **credential evaluation** is an expert assessment of your foreign academic credentials to determine their U.S. equivalency.\n\nIFCS evaluators — recognized experts in the field — review your transcripts and diplomas, convert grading scales, and produce a detailed report showing how your education aligns with U.S. standards.\n\n**Who needs one?**\n• Students applying to U.S. colleges or universities\n• Professionals seeking employment or licensure\n• Immigrants needing documentation for USCIS\n• Anyone whose foreign credentials need U.S. recognition\n\nIFCS is trusted by universities, federal and state government agencies, employers, and licensure boards across the U.S.`,
    navButtons: [
      { label: "View Evaluations", path: "/evaluations" },
      { label: "Learn More", path: "/learn-more-evaluations" },
    ],
  },
  {
    keywords: ["difference between evaluation and translation", "evaluation vs translation", "evaluation and translation"],
    response: `Great question! They serve different purposes:\n\n**Evaluation** — An expert analysis that converts your foreign academic credentials into their U.S. equivalency.\n\n**Translation** — A word-for-word conversion of your documents from their original language into English.\n\n**Do you need both?** If your documents are not in English, you'll typically need a certified translation first, then an evaluation. IFCS can handle both!\n\n• Evaluations start at **$100**\n• Translations are **$50 per page**`,
    navButtons: [
      { label: "View Evaluations", path: "/evaluations" },
      { label: "View Translations", path: "/translations" },
    ],
  },
  {
    keywords: ["what's a translation", "what is a translation", "what is translation"],
    response: `A **certified translation** is a professionally prepared, word-for-word conversion of your documents from their original language into English.\n\nIFCS translations include:\n• Delivered on **IFCS letterhead**\n• **Signed and stamped** certificate of accuracy\n• Accepted by **USCIS**, universities, and government agencies\n• Available in **150+ languages**\n• Standard turnaround: **3–5 business days**\n• **Same-day** and expedited options available\n• Pricing: **$50 per page** with no hidden fees`,
    navButtons: [
      { label: "Start Translation Order", path: "/translations/order" },
      { label: "Get a Quote", path: "/translations/quote" },
    ],
  },
  {
    keywords: ["how fast", "how long does evaluation", "turnaround", "how quickly"],
    response: `IFCS offers three processing speeds:\n\n⏱️ **Standard:** 8–10 business days\n⚡ **3-Day Rush:** 3 business days\n🚀 **24-Hour Priority:** Within 24 hours\n\nRush pricing varies by evaluation type. For example:\n• General Analysis: $100 (Standard) → $150 (3-Day) → $195 (24-Hour)\n• Course-by-Course: $190 (Standard) → $290 (3-Day) → $425 (24-Hour)`,
    navButtons: [
      { label: "View Pricing", path: "/pricing" },
      { label: "Start Application", path: "/application" },
    ],
  },
  {
    keywords: ["how much", "price", "cost", "fee", "pricing"],
    response: `Here are our evaluation pricing tiers:\n\n| Service | Price |\n|---------|-------|\n| **General Analysis** | $100 |\n| **General Analysis + GPA** | $150 |\n| **Cosmetology CxC** | $170 |\n| **Course-by-Course** | $190 |\n| **Health Professions CxC** | $230 |\n| **Comprehensive CxC** | $290 |\n| **HS & University CxC** | $295 |\n| **Professional Licensure CxC** | $400 |\n\n**Translations:** $50/page\n**Consulting:** Evaluation consultations are **FREE**. Admission advising is **$60/hour**.\n**Duplicate Reports:** $25 per copy`,
    navButtons: [
      { label: "View Full Pricing", path: "/pricing" },
      { label: "View Evaluations", path: "/evaluations" },
    ],
  },
  {
    keywords: ["what document", "documents do i need", "required document", "what do i need to submit"],
    response: `The documents you need depend on the evaluation type and your **country of education**:\n\n**For most evaluations:**\n📄 **Transcripts / Mark Sheets** — official academic records\n📄 **Diploma Certificate** — proof of degree completion\n\nSome countries have additional requirements — just let me know which country you studied in and I'll give you the specific details!`,
    navButtons: [
      { label: "Start Application", path: "/application" },
      { label: "Learn More", path: "/learn-more-evaluations" },
    ],
  },
  {
    keywords: ["rush", "expedite", "urgent", "faster", "priority"],
    response: `Yes! We offer **rush processing** for all evaluation types:\n\n⚡ **3-Day Rush** — Results in 3 business days\n🚀 **24-Hour Priority** — Results within 24 hours\n\nRush fees vary by evaluation type.`,
    navButtons: [
      { label: "View Evaluations", path: "/evaluations" },
      { label: "Start Application", path: "/application" },
    ],
  },
  {
    keywords: ["how do i apply", "how to apply", "application process", "get started", "apply"],
    response: `Getting started with IFCS is simple — just follow these 4 steps:\n\n**Step 1:** Determine which evaluation you need. Not sure? Our evaluation consultation is **FREE**!\n**Step 2:** Complete the **online application** on our website.\n**Step 3:** Upload legible copies of your transcripts and diploma certificates.\n**Step 4:** Submit your signed application and make payment.`,
    navButtons: [
      { label: "Start Application", path: "/application" },
      { label: "View Evaluations", path: "/evaluations" },
    ],
  },
  {
    keywords: ["general analysis"],
    response: `The **General Analysis** is our most affordable evaluation at **$100**:\n\n**Rush:** $150 (3-Day) / $195 (24-Hour)\n\n**What it includes:**\n• Country of study & institution attended\n• Dates of attendance & credential received\n• Overall U.S. equivalency\n\n**Recommended for:** Immigration, military, and junior college admission.`,
    navButtons: [
      { label: "View General Analysis", path: "/evaluations#general-analysis" },
      appButton("General Analysis", 100, "8–10 Business Days", "Standard", "standard"),
    ],
  },
  {
    keywords: ["general analysis plus gpa", "general plus gpa", "general gpa", "gpa evaluation"],
    response: `The **General Analysis plus GPA** evaluation costs **$150**:\n\n**Rush:** $205 (3-Day) / $295 (24-Hour)\n\n**What it includes:**\n• Everything in General Analysis\n• Plus an overall **GPA (Grade Point Average)**\n\n**Recommended for:** Admission to institutions when GPA is required.`,
    navButtons: [
      { label: "View General Analysis + GPA", path: "/evaluations#general-analysis-plus-gpa" },
      appButton("General Analysis plus GPA", 150, "8–10 Business Days", "Standard", "standard"),
    ],
  },
  {
    keywords: ["cosmetology", "barbering", "beauty therapy", "hairdressing", "esthetics"],
    response: `The **Cosmetology Course-by-Course** evaluation costs **$170**:\n\n**Rush:** $275 (3-Day) / $375 (24-Hour)\n\n**Recommended for:** State cosmetology licensing boards, barbering, beauty therapy, hairdressing, and esthetics licensure.`,
    navButtons: [
      { label: "View Cosmetology CxC", path: "/evaluations#cosmetology-course-by-course" },
      appButton("Cosmetology Course-by-Course", 170, "8–10 Business Days", "Standard", "standard"),
    ],
  },
  {
    keywords: ["course-by-course", "course by course"],
    response: `The **Course-by-Course** evaluation costs **$190**:\n\n**Rush:** $290 (3-Day) / $425 (24-Hour)\n\n**What it includes:**\n• List of all individual courses\n• Semester credit hours for each course\n• Letter grades and cumulative GPA\n• U.S. equivalency\n\n**Recommended for:** Admission to secondary and post-secondary institutions, and employment.`,
    navButtons: [
      { label: "View Course-by-Course", path: "/evaluations#course-by-course" },
      appButton("Course-by-Course", 190, "8–10 Business Days", "Standard", "standard"),
    ],
  },
  {
    keywords: ["health profession", "health professions course-by-course", "medical evaluation", "nursing evaluation", "clinical", "health prof"],
    response: `The **Health Professions Course-by-Course** is designed for healthcare professionals at **$230**:\n\n**Rush:** $355 (3-Day) / $490 (24-Hour)\n\n**What it includes:**\n• All courses with credit hours and grades\n• Upper/lower division and graduate level designations\n• **Clinical experience details**\n• U.S. equivalency\n\n**Recommended for:** Medical, nursing, and health profession licensing boards.`,
    navButtons: [
      { label: "View Health Professions CxC", path: "/evaluations#health-professions-course-by-course" },
      appButton("Health Professions Course-by-Course", 230, "8–10 Business Days", "Standard", "standard"),
    ],
  },
  {
    keywords: ["comprehensive", "comprehensive course-by-course", "multiple degrees", "two degrees"],
    response: `The **Comprehensive Course-by-Course** evaluation costs **$290**:\n\n**Rush:** $390 (3-Day) / $490 (24-Hour)\n\n**What it includes:**\n• All courses with semester credit hours and grades\n• Lower and upper-division designations\n• Graduate level classifications\n• Covers **up to 2 degrees**\n\n**Recommended for:** Graduate school admission, professional licensure, and individuals with multiple university degrees.`,
    navButtons: [
      { label: "View Comprehensive CxC", path: "/evaluations#comprehensive-course-by-course" },
      appButton("Comprehensive Course-by-Course", 290, "8–10 Business Days", "Standard", "standard"),
    ],
  },
  {
    keywords: ["high school and university", "high school & university", "high school university", "secondary and post-secondary"],
    response: `The **High School and University Course-by-Course** evaluation costs **$295**:\n\n**Rush:** $395 (3-Day) / $495 (24-Hour)\n\n**What it includes:**\n• Comprehensive course-by-course covering **both** High School and University\n• Detailed listing of courses, credit hours, grades, GPA\n• U.S. equivalencies for each credential level`,
    navButtons: [
      { label: "View HS & University CxC", path: "/evaluations#high-school-and-university-course-by-course" },
      appButton("High School and University Course-by-Course", 295, "8–10 Business Days", "Standard", "standard"),
    ],
  },
  {
    keywords: ["professional licensure", "licensure course-by-course", "cpa", "engineer licensure", "bar admission", "pe licensure", "accounting evaluation"],
    response: `The **Professional Licensure Course-by-Course** is our most comprehensive evaluation at **$400**:\n\n**Rush:** $550 (3-Day) / $650 (24-Hour)\n\n**Recommended for:** CPA, Professional Engineer (PE), Attorney Bar Admission.`,
    navButtons: [
      { label: "View Professional Licensure CxC", path: "/evaluations#professional-licensure-course-by-course" },
      appButton("Professional Licensure Course-by-Course", 400, "8–10 Business Days", "Standard", "standard"),
    ],
  },
  {
    keywords: ["jamaica", "trinidad", "barbados", "guyana", "bahamas", "caribbean", "cxc", "csec", "cape", "st lucia", "antigua", "grenada", "dominica", "st kitts", "st vincent", "belize"],
    response: `For applicants from **Caribbean countries** (Jamaica, Trinidad & Tobago, Barbados, Guyana, Bahamas, etc.):\n\n**Required Documents:**\n📄 **CXC/CSEC Results** — Caribbean Secondary Education Certificate results are **required** for secondary-level evaluations\n📄 **CAPE Results** — If applicable, for advanced proficiency\n📄 **University Transcripts** — If you attended a Caribbean or other university\n📄 **Diploma/Degree Certificate**\n\n**Important:** The CXC results serve as the equivalent of a U.S. high school transcript for Caribbean nations.`,
    navButtons: [
      { label: "View Evaluations", path: "/evaluations" },
      { label: "Start Application", path: "/application" },
    ],
  },
  {
    keywords: ["nigeria", "ghana", "west africa", "waec", "neco", "sierra leone", "gambia", "liberia"],
    response: `For applicants from **West African countries** (Nigeria, Ghana, Sierra Leone, Gambia, Liberia, etc.):\n\n**Required Documents:**\n📄 **WAEC (West African Examinations Council)** results — **required** for secondary-level evaluations\n📄 **NECO Results** — National Examinations Council results (Nigeria), if applicable\n📄 **University Transcripts / Statement of Results**\n📄 **Degree Certificate**`,
    navButtons: [
      { label: "View Evaluations", path: "/evaluations" },
      { label: "Start Application", path: "/application" },
    ],
  },
  {
    keywords: ["india", "indian", "mark sheet", "marksheet", "cbse", "icse"],
    response: `For applicants from **India**:\n\n**Required Documents:**\n📄 **Mark Sheets** — Year-wise or semester-wise mark sheets for each year of study are **required**\n📄 **Degree Certificate / Provisional Degree Certificate**\n📄 **10th & 12th Board Results** (CBSE, ICSE, or State Board) — Required for evaluations that include secondary credentials`,
    navButtons: [
      { label: "View Evaluations", path: "/evaluations" },
      { label: "Start Application", path: "/application" },
    ],
  },
  {
    keywords: ["philippines", "filipino", "tor", "ched", "cav"],
    response: `For applicants from the **Philippines**:\n\n**Required Documents:**\n📄 **Transcript of Records (TOR)** — Official academic transcript\n📄 **Diploma / Degree Certificate**\n📄 **CAV (Certification, Authentication, and Verification)** — From CHED or DFA`,
    navButtons: [
      { label: "View Health Professions CxC", path: "/evaluations#health-professions-course-by-course" },
      { label: "Start Application", path: "/application" },
    ],
  },
  {
    keywords: ["china", "chinese", "cdgdc", "chesicc"],
    response: `For applicants from **China**:\n\n**Required Documents:**\n📄 **Official Transcripts** — In Chinese with notarized English translations\n📄 **Degree Certificate / Diploma** — With notarized English translation\n📄 **CDGDC/CHESICC Verification** — Degree verification may be needed\n\n**Important:** Chinese documents not in English require a **certified translation** — IFCS can provide this ($50/page).`,
    navButtons: [
      { label: "View Evaluations", path: "/evaluations" },
      { label: "Translation Services", path: "/translations" },
    ],
  },
  {
    keywords: ["mexico", "mexican", "cedula", "titulo"],
    response: `For applicants from **Mexico**:\n\n**Required Documents:**\n📄 **Certificado de Estudios** — Official academic records/transcripts\n📄 **Título Profesional** — Professional degree certificate\n📄 **Cédula Profesional** — Professional license (if applicable)\n📄 **Certified English translations** of all documents`,
    navButtons: [
      { label: "View Evaluations", path: "/evaluations" },
      { label: "Translation Services", path: "/translations" },
    ],
  },
  {
    keywords: ["korea", "korean", "south korea"],
    response: `For applicants from **South Korea**:\n\n**Required Documents:**\n📄 **성적증명서 (Transcripts)** — Official academic transcripts\n📄 **졸업증명서 (Graduation Certificate)** — Or degree certificate\n📄 **Certified English translations** if documents are in Korean`,
    navButtons: [
      { label: "View Evaluations", path: "/evaluations" },
      { label: "Start Application", path: "/application" },
    ],
  },
  {
    keywords: ["middle east", "saudi", "uae", "dubai", "qatar", "kuwait", "arabic", "jordan", "lebanon", "iraq", "iran", "egypt"],
    response: `For applicants from **Middle Eastern countries**:\n\n**Required Documents:**\n📄 **Official Transcripts** — In Arabic with certified English translations\n📄 **Degree Certificate** — With certified English translation\n📄 **Equivalency Certificate** — From the Ministry of Education (if available)`,
    navButtons: [
      { label: "View Evaluations", path: "/evaluations" },
      { label: "Translation Services", path: "/translations" },
    ],
  },
  {
    keywords: ["kenya", "ethiopia", "tanzania", "uganda", "south africa", "east africa"],
    response: `For applicants from **East/Southern African countries**:\n\n**Required Documents:**\n📄 **Official Transcripts / Academic Records**\n📄 **Degree Certificate / Diploma**\n📄 **Secondary school certificates** — KCSE (Kenya), EGSECE (Ethiopia), CSEE (Tanzania), UCE/UACE (Uganda), NSC (South Africa)`,
    navButtons: [
      { label: "View Evaluations", path: "/evaluations" },
      { label: "Start Application", path: "/application" },
    ],
  },
  {
    keywords: ["brazil", "brazilian", "enem"],
    response: `For applicants from **Brazil**:\n\n**Required Documents:**\n📄 **Histórico Escolar** — Official academic transcript\n📄 **Diploma** — Degree certificate\n📄 **Certified English translations** of all Portuguese documents`,
    navButtons: [
      { label: "View Evaluations", path: "/evaluations" },
      { label: "Translation Services", path: "/translations" },
    ],
  },
  {
    keywords: ["russia", "russian", "ukraine", "ukrainian", "belarus"],
    response: `For applicants from **Russia / Ukraine / Belarus**:\n\n**Required Documents:**\n📄 **Диплом (Diploma)** — Degree certificate with certified English translation\n📄 **Приложение к диплому (Diploma Supplement)** — Transcript/grades with translation\n📄 **Аттестат (Attestat)** — Secondary school certificate, if needed`,
    navButtons: [
      { label: "View Evaluations", path: "/evaluations" },
      { label: "Translation Services", path: "/translations" },
    ],
  },
  {
    keywords: ["pakistan", "pakistani"],
    response: `For applicants from **Pakistan**:\n\n**Required Documents:**\n📄 **Detailed Marks Certificate (DMC)** — For each year/semester\n📄 **Degree Certificate**\n📄 **Matric & Inter Board Results** — For secondary-level evaluations\n📄 **HEC Attestation** — Higher Education Commission attestation (recommended)`,
    navButtons: [
      { label: "View Evaluations", path: "/evaluations" },
      { label: "Start Application", path: "/application" },
    ],
  },
  {
    keywords: ["bangladesh", "bangladeshi"],
    response: `For applicants from **Bangladesh**:\n\n**Required Documents:**\n📄 **Mark Sheets / Academic Transcripts** — For each year\n📄 **Certificate / Degree**\n📄 **SSC & HSC Results** — For secondary-level evaluations`,
    navButtons: [
      { label: "View Evaluations", path: "/evaluations" },
      { label: "Start Application", path: "/application" },
    ],
  },
  {
    keywords: ["japan", "japanese"],
    response: `For applicants from **Japan**:\n\n**Required Documents:**\n📄 **成績証明書 (Seiseki Shōmeisho)** — Official transcripts\n📄 **卒業証明書 (Sotsugyō Shōmeisho)** — Graduation certificate\n📄 **Certified English translations** if documents are in Japanese`,
    navButtons: [
      { label: "View Evaluations", path: "/evaluations" },
      { label: "Translation Services", path: "/translations" },
    ],
  },
  {
    keywords: ["france", "french", "germany", "german", "italy", "italian", "spain", "spanish", "europe", "european", "uk", "united kingdom", "britain", "british", "portugal", "portuguese", "netherlands", "dutch", "poland", "polish", "romania", "romanian"],
    response: `For applicants from **European countries**:\n\n**Required Documents:**\n📄 **Official Transcripts / Academic Records**\n📄 **Degree Certificate / Diploma**\n📄 **Diploma Supplement** (if available — common in Bologna Process countries)\n📄 **Certified English translations** if documents are not in English`,
    navButtons: [
      { label: "View Evaluations", path: "/evaluations" },
      { label: "Start Application", path: "/application" },
    ],
  },
  {
    keywords: ["consult", "consulting", "advising", "advisor", "appointment"],
    response: `IFCS offers two types of consulting:\n\n🆓 **Evaluation Consultation — FREE**\nOur experts help you determine which evaluation type is right for your specific goals.\n\n💼 **Admissions & Academic Advising — $60/hour**\nOur senior staff can help you find the right U.S. institution and program.\n\nConsultations are held at our **Dobbs Ferry office** by appointment.\n📞 **(914) 693-2840** | 📧 **info@ifcsevals.com**`,
    navButtons: [
      { label: "Book a Consultation", path: "/consulting/book" },
      { label: "View Consulting Page", path: "/consulting" },
    ],
  },
  {
    keywords: ["check status", "track", "status of", "my evaluation", "order status", "where is my evaluation", "application status", "EE0", "EE1", "EE2", "EE3", "EE4", "EE5", "EE6", "EE7", "EE8", "EE9"],
    response: `I can help you check your application status! Please provide:\n\n• Your **Application ID** (e.g., EE0788)\n• Your **Date of Birth** (for verification)\n\nOnce verified, I'll share your current status and direct you to your dashboard.`,
    navButtons: [{ label: "Go to Dashboard", path: "/dashboard/client" }],
  },
  {
    keywords: ["what language", "which language", "language do you", "languages"],
    response: `We translate documents from and into **150+ languages**, including Spanish, French, Arabic, Chinese, Hindi, Portuguese, Russian, Japanese, Korean, German, Italian, Turkish, Vietnamese, Thai, Polish, Ukrainian, and many more!\n\nAll translations include:\n• IFCS letterhead with signed certificate of accuracy\n• Accepted by USCIS, universities, and government agencies\n• $50 per page`,
    navButtons: [
      { label: "Start Translation Order", path: "/translations/order" },
      { label: "Get a Quote", path: "/translations/quote" },
    ],
  },
  {
    keywords: ["uscis", "accepted", "immigration", "recognized", "green card", "h1b", "h-1b", "work visa", "immigrant"],
    response: `Yes! As a **NACES member**, IFCS evaluations are recognized at the highest level:\n\n✅ **USCIS** (U.S. Citizenship and Immigration Services)\n✅ **U.S. Military** branches\n✅ Universities and colleges nationwide\n✅ Federal and state government agencies\n✅ Employers across all industries\n✅ Professional licensure boards\n\nFor **immigration and employment purposes**, we recommend the **General Analysis ($100)** which provides the U.S. equivalency statement accepted by USCIS.\n\nNACES membership ensures our evaluations meet the gold standard of credential evaluation in the United States.`,
    navButtons: [
      { label: "Start Application", path: "/application", state: { serviceTitle: "General Analysis", processingKey: "standard", processingLabel: "Standard", processingTime: "8–10 Business Days", price: 100 } },
      { label: "Learn More", path: "/learn-more-evaluations" },
    ],
  },
  {
    keywords: ["refund", "cancel", "money back", "dispute", "complaint"],
    response: `For case-specific inquiries regarding refunds, disputes, or complaints, please contact our team directly:\n\n📞 **(914) 693-2840**\n📧 **apps@ifcsevals.com**\n\nPlease have your **Application ID** ready for the fastest response.\n\n**General refund policy:**\n• Refunds are issued **only for overpayment**.\n• **Standard service** can be canceled within **24 hours**, subject to a **$50 minimum processing fee**.\n• **No refunds** for 24-hour and 3-day rush services once processing has begun.`,
    navButtons: [{ label: "Contact Us", path: "/contact" }],
  },
  {
    keywords: ["duplicate", "additional cop", "extra cop"],
    response: `If you've received an evaluation from IFCS within the past **5 years**, you can request additional copies:\n\n📄 **Electronic Report:** $25\n📄 **Hard Copy:** $25 each\n📦 **Domestic Shipping:** $25\n✈️ **International Shipping:** $70`,
    navButtons: [{ label: "Order Duplicate Reports", path: "/duplicate-reports" }],
  },
  {
    keywords: ["shipping", "delivery", "mail", "send report"],
    response: `We offer several delivery options:\n\n📧 **Electronic Sharing:** $25\n📄 **Hard Copy:** $25 each\n📦 **Domestic Shipping:** $25\n✈️ **International Shipping:** $70\n\nReports are valid for **5 years**. After expiration, renewal is available for **$100**.`,
    navButtons: [{ label: "Start Application", path: "/application" }],
  },
  {
    keywords: ["renewal", "expire", "expiration", "valid", "how long is report valid"],
    response: `Evaluation reports are valid for **5 years** from the date of issuance. After expiration, you can renew for **$100**.`,
    navButtons: [{ label: "Renew Evaluation", path: "/addon/renewal" }],
  },
  {
    keywords: ["contact", "phone", "email address", "reach", "office", "address", "location", "hours"],
    response: `📞 **Phone:** (914) 693-2840\n📠 **Fax:** (914) 231-7782\n📧 **Email:** info@ifcsevals.com\n📍 **Address:** 6 Cedar Street, Dobbs Ferry, NY 10522\n🕐 **Hours:** Monday–Friday, 9:00 AM – 5:00 PM EST`,
    navButtons: [{ label: "Contact Us", path: "/contact" }],
  },
  {
    keywords: ["notari", "notarization"],
    response: `Yes! We offer **notarization** as an add-on: **$19.95 per order**, valid in **all 50 U.S. states**.`,
    navButtons: [{ label: "Start Translation Order", path: "/translations/order" }],
  },
  {
    keywords: ["document authentication", "verify", "verification", "authenticate"],
    response: `**Document Authentication** is available for **$140**.\n\nIFCS will **contact your issuing institution** to verify your documents on your behalf.`,
    navButtons: [{ label: "Start Application", path: "/application" }],
  },
  {
    keywords: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"],
    response: `Hello! 👋 Welcome to **IFCS** — the Institute of Foreign Credential Services.\n\nI can help you with:\n• **Evaluations** — pricing, types, and how to apply\n• **Translations** — certified translations in 150+ languages\n• **Consulting** — free evaluation consultations\n• **Status** — checking your evaluation progress\n\nWhat would you like to know?`,
    navButtons: [],
  },
  {
    keywords: ["thank", "thanks", "appreciate"],
    response: `You're welcome! 😊 If you have any more questions, feel free to ask.\n\n📞 **(914) 693-2840** | 📧 **info@ifcsevals.com**`,
    navButtons: [],
  },
  {
    keywords: ["blog", "articles", "news"],
    response: `Check out our blog for the latest news, tips, and insights about foreign credential evaluations!`,
    navButtons: [{ label: "Visit Our Blog", path: "/blog" }],
  },
  {
    keywords: ["about", "who is ifcs", "about ifcs", "history"],
    response: `**IFCS** — the Institute of Foreign Credential Services — is based in Dobbs Ferry, NY.\n\n**What makes IFCS unique:**\n• **Expert evaluators** — recognized industry leaders\n• Regular contributors to leading international education organizations\n• **Personal attention** applied to every account\n• Trusted by universities, government agencies, employers, and licensure boards`,
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
    keywords: ["naces", "member", "accredit", "legitimate", "recognized", "credible", "trusted", "accepted everywhere"],
    response: `**IFCS is a proud member of NACES** — the gold standard for credential evaluation in the United States.\n\n**What this means:**\n✅ Evaluations accepted by **USCIS**, the **U.S. Military**, and **thousands of universities**\n✅ Adheres to the highest ethical and professional standards\n✅ Uses industry-standard research databases used by top university registrars\n\n**Also recognized by:** NAFSA, IAU, UNESCO`,
    navButtons: [
      { label: "About Us", path: "/about" },
      { label: "Learn More", path: "/learn-more-evaluations" },
    ],
  },
  {
    keywords: ["original document", "do i need original", "send original", "mail documents", "send documents", "official documents"],
    response: `**No, you do not need to send originals to start!** Legible uploaded copies of your transcripts and diplomas are sufficient to begin your application.\n\n**Sending Official Documents:**\nOnce your application is submitted, you will receive an **IFCS ID** (a 5-digit reference number). At that point, you may contact your issuing institution and request that official documents be sent directly to IFCS. You will be provided with the appropriate mailing address and instructions.\n\n**Note:** In some cases, IFCS may require the original documents to be mailed directly to our office for verification purposes.`,
    navButtons: [{ label: "Start Application", path: "/application" }],
  },
  {
    keywords: ["three degree", "3 degree", "more than two", "multiple degree"],
    response: `The **Comprehensive Course-by-Course ($290)** covers up to **2 degrees**. If you have 3 or more, additional fees may apply.\n\n📞 **(914) 693-2840** | 📧 **info@ifcsevals.com**`,
    navButtons: [
      { label: "View Comprehensive CxC", path: "/evaluations#comprehensive-course-by-course" },
      { label: "Contact Us", path: "/contact" },
    ],
  },
  {
    keywords: ["accepted by my school", "will my school accept", "does my university accept"],
    response: `IFCS evaluations are trusted and accepted by universities, federal and state government agencies, employers, and licensure boards across the U.S.\n\nWe always recommend checking with your specific institution's admissions office. Our evaluation consultation is **FREE**!`,
    navButtons: [
      { label: "Contact Us", path: "/contact" },
      { label: "Book Consultation", path: "/consulting/book" },
    ],
  },
  {
    keywords: ["dobbs ferry", "where are you", "where is ifcs"],
    response: `IFCS is located at:\n\n📍 **6 Cedar Street, Dobbs Ferry, NY 10522**\n📞 (914) 693-2840\n📠 Fax: (914) 231-7782\n📧 info@ifcsevals.com\n🕐 Monday–Friday, 9 AM – 5 PM EST`,
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
  // Cart
  {
    keywords: ["cart", "shopping cart", "add to cart", "my cart", "whats in my cart"],
    response: `You can add multiple services to your **cart** before checking out! The cart is accessible from the navigation bar.\n\nYou can also apply **discount codes** at checkout for savings.`,
    navButtons: [{ label: "View Cart", path: "/cart" }],
  },
  {
    keywords: ["login", "sign in", "log in", "account", "my account", "sign up", "register", "create account"],
    response: `You can **log in** or **create an account** to track your applications, view order history, and manage your evaluations.\n\nAlready have an account? Log in to access your dashboard.\nNew to IFCS? Create a free account to get started!`,
    navButtons: [
      { label: "Log In", path: "/login" },
      { label: "Sign Up", path: "/signup" },
      { label: "My Dashboard", path: "/dashboard/client" },
    ],
  },
  {
    keywords: ["discount", "coupon", "promo", "promo code", "discount code", "save money", "deal"],
    response: `IFCS does offer **discount codes** from time to time. To inquire about current promotions or obtain a discount code, please contact us directly:\n\n📞 **(914) 693-2840**\n📧 **info@ifcsevals.com**\n\nOnce you have a code, simply add your services to the cart and enter it at checkout!`,
    navButtons: [{ label: "Contact Us", path: "/contact" }, { label: "View Pricing", path: "/pricing" }],
  },
  {
    keywords: ["privacy policy", "privacy", "data protection", "personal data", "data"],
    response: `IFCS takes your privacy seriously. Our **Privacy Policy** outlines how we collect, use, and protect your personal information.\n\nAll documents and personal data are handled with strict confidentiality and security measures.`,
    navButtons: [{ label: "View Privacy Policy", path: "/privacy-policy" }],
  },
  {
    keywords: ["terms of service", "terms", "conditions", "terms and conditions", "tos"],
    response: `Our **Terms of Service** outline the conditions for using IFCS services, including evaluation policies, payment terms, and service agreements.\n\nWe recommend reviewing them before submitting an application.`,
    navButtons: [{ label: "View Terms of Service", path: "/terms-of-service" }],
  },
  {
    keywords: ["dashboard", "my orders", "track order", "order history", "my applications"],
    response: `Your **Dashboard** lets you:\n• Track application status in real-time\n• View staff notes and updates\n• Access receipts and order history\n• Check your IFCS ID\n\nLog in to access your dashboard!`,
    navButtons: [{ label: "Go to Dashboard", path: "/dashboard/client" }, { label: "Log In", path: "/login" }],
  },
  // Albania and Balkans
  {
    keywords: ["albania", "albanian", "albanian diploma", "albanian university", "albanian high school", "tirana", "kosova", "kosovo", "pristina"],
    response: `For applicants from **Albania / Kosovo**:\n\n**Required Documents:**\n📄 **Dëftesë Pjekurie** — Secondary school leaving certificate (Matura)\n📄 **Diplomë** — University degree certificate\n📄 **Lista e Notave (Transcript)** — Official academic record with grades\n📄 **Certified English translations** of all documents\n\n**Education System:**\n• Secondary education: 12 years (Gjimnaz)\n• Bachelor's degree: typically 3 years (Bologna system)\n• Master's degree: 1-2 years\n• Albanian universities follow the Bologna Process since 2003\n\nIFCS can provide certified translations at **$50/page**.`,
    navButtons: [
      { label: "View Evaluations", path: "/evaluations" },
      { label: "Translation Services", path: "/translations" },
      { label: "Start Application", path: "/application" },
    ],
  },
];

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
  const [suggestingKeywords, setSuggestingKeywords] = useState(false);
  const [enhancingResponse, setEnhancingResponse] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);

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
    setShowForm(false);
  };

  const startEdit = (entry: DBKnowledgeEntry) => {
    setEditing(entry);
    setFormTitle(entry.title);
    setFormKeywords(entry.keywords.join(", "));
    setFormResponse(entry.response);
    setFormCategory(entry.category);
    setShowForm(true);
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

  const handleSuggestKeywords = async () => {
    if (!formTitle.trim()) return;
    setSuggestingKeywords(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: { action: "suggest-keywords", title: formTitle, response: formResponse || undefined },
      });
      if (!error && data?.keywords) {
        const existing = formKeywords.split(",").map(k => k.trim().toLowerCase()).filter(Boolean);
        const merged = [...new Set([...existing, ...data.keywords])];
        setFormKeywords(merged.join(", "));
      }
    } catch (e) {
      console.error("Keyword suggestion error:", e);
    } finally {
      setSuggestingKeywords(false);
    }
  };

  const handleEnhanceResponse = async () => {
    if (!formTitle.trim()) return;
    setEnhancingResponse(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: { action: "enhance-response", title: formTitle, response: formResponse || undefined },
      });
      if (!error && data?.enhanced) {
        setFormResponse(data.enhanced);
      }
    } catch (e) {
      console.error("Response enhancement error:", e);
    } finally {
      setEnhancingResponse(false);
    }
  };

  const filteredEntries = searchQuery
    ? entries.filter(e =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.keywords.some(k => k.includes(searchQuery.toLowerCase())) ||
        e.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : entries;

  const categoryColors: Record<string, string> = {
    general: "bg-blue-100 text-blue-700",
    evaluations: "bg-green-100 text-green-700",
    translations: "bg-purple-100 text-purple-700",
    company: "bg-orange-100 text-orange-700",
    policies: "bg-red-100 text-red-700",
    country: "bg-teal-100 text-teal-700",
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-accent text-white">
        <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1.5 transition-colors">
          <ChevronLeft size={18} />
        </button>
        <BookOpen size={18} />
        <span className="text-sm font-semibold flex-1">Knowledge Base</span>
        <span className="text-[10px] opacity-70 bg-white/20 px-2 py-0.5 rounded-full">{entries.length} entries</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Search & Add Button */}
        <div className="sticky top-0 bg-card z-10 px-4 py-3 border-b border-border space-y-2">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search entries..."
                className="w-full h-9 pl-9 pr-3 rounded-xl text-sm border border-border bg-muted/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="h-9 px-4 rounded-xl bg-accent text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-accent/90 transition-colors whitespace-nowrap"
            >
              <Plus size={14} /> Add
            </button>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* Add / Edit Form */}
          {showForm && (
            <div className="rounded-2xl border-2 border-accent/30 p-4 space-y-3 bg-accent/5 animate-fade-in">
              <p className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-2">
                <Sparkles size={14} />
                {editing ? "Edit Entry" : "New Knowledge Entry"}
              </p>
              <input
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                placeholder="Title (e.g. 'Albanian Credentials')"
                className="w-full px-3 py-2.5 rounded-xl text-sm border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 font-medium"
              />

              {/* Keywords with AI suggest */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                    <Tag size={12} /> Keywords
                  </label>
                  <button
                    onClick={handleSuggestKeywords}
                    disabled={suggestingKeywords || !formTitle.trim()}
                    className="text-[10px] font-semibold text-accent hover:text-accent/80 flex items-center gap-1 disabled:opacity-40 transition-colors"
                  >
                    {suggestingKeywords ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                    AI Suggest
                  </button>
                </div>
                <textarea
                  value={formKeywords}
                  onChange={e => setFormKeywords(e.target.value)}
                  placeholder="Keywords will be auto-generated by AI, or type your own (comma-separated)"
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none"
                />
              </div>

              <select
                value={formCategory}
                onChange={e => setFormCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm border border-border bg-background text-foreground"
              >
                <option value="general">📋 General</option>
                <option value="evaluations">📊 Evaluations</option>
                <option value="translations">🌍 Translations</option>
                <option value="company">🏢 Company</option>
                <option value="policies">📜 Policies</option>
                <option value="country">🗺️ Country-Specific</option>
              </select>

              {/* Response with AI enhance */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-muted-foreground">AI Response</label>
                  <button
                    onClick={handleEnhanceResponse}
                    disabled={enhancingResponse || !formTitle.trim()}
                    className="text-[10px] font-semibold text-accent hover:text-accent/80 flex items-center gap-1 disabled:opacity-40 transition-colors"
                  >
                    {enhancingResponse ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    AI Enhance
                  </button>
                </div>
                <textarea
                  value={formResponse}
                  onChange={e => setFormResponse(e.target.value)}
                  placeholder="Type a draft or click 'AI Enhance' to auto-generate based on the title using AACRAO credential data"
                  rows={6}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none leading-relaxed"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving || !formTitle.trim() || !formResponse.trim()}
                  className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold rounded-xl bg-accent text-white hover:bg-accent/90 transition-colors disabled:opacity-50 shadow-sm"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {editing ? "Update" : "Save Entry"}
                </button>
                <button
                  onClick={resetForm}
                  className="px-5 py-2.5 text-xs font-semibold rounded-xl border border-border text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Entries List */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin text-accent" />
            </div>
          ) : filteredEntries.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">
              {searchQuery ? "No entries match your search" : "No custom entries yet. Click 'Add' to create one!"}
            </p>
          ) : (
            <div className="space-y-2">
              {filteredEntries.map(entry => (
                <div
                  key={entry.id}
                  className="group rounded-2xl border border-border p-3.5 bg-background hover:border-accent/30 hover:shadow-sm transition-all duration-200 cursor-pointer"
                  onClick={() => startEdit(entry)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">{entry.title}</p>
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${categoryColors[entry.category] || categoryColors.general}`}>
                          {entry.category}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {entry.keywords.slice(0, 4).map((kw, i) => (
                          <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                            {kw}
                          </span>
                        ))}
                        {entry.keywords.length > 4 && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                            +{entry.keywords.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                      className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">
                    {entry.response.replace(/\*\*/g, "").substring(0, 120)}...
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
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
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastUserMsgRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingScroll, setPendingScroll] = useState<"user" | "assistant" | null>(null);

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
  }, [showKnowledge]);

  // Save chat state on message changes
  useEffect(() => {
    saveChatState(messages);
  }, [messages]);

  // Scroll logic: on user send → scroll to bottom; on AI response → scroll so user's prompt is at top
  useEffect(() => {
    if (!pendingScroll) return;
    if (pendingScroll === "user") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } else if (pendingScroll === "assistant" && lastUserMsgRef.current) {
      lastUserMsgRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setPendingScroll(null);
  }, [pendingScroll, messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const removeAttachment = (index: number) => setAttachments(prev => prev.filter((_, i) => i !== index));

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setInput("");
    const userMsg: Message = { role: "user", content: suggestion };
    setMessages(prev => [...prev, userMsg]);
    setPendingScroll("user");
    setIsLoading(true);
    sendToAI([...messages, userMsg]);
  };

  const sendToAI = async (conversationMessages: Message[]) => {
    try {
      // Check if user is providing an app ID + DOB for status lookup
      const lastMsg = conversationMessages[conversationMessages.length - 1];
      const prevMsgs = conversationMessages.slice(-6);
      
      // Detect if this looks like a DOB response after an app ID was given
      const dobMatch = lastMsg.content.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);
      // Also detect if the user provides both app ID and DOB in one message
      const combinedAppIdMatch = lastMsg.content.match(/\b(EE\d{3,}|NE\d{3,}|IFCS-?\d{4,5}|\d{5})\b/i);
      const prevAppIdMsg = prevMsgs.find(m => m.role === "user" && /\b(EE\d{3,}|NE\d{3,}|IFCS-?\d{4,5}|\d{5})\b/i.test(m.content));
      // Also check if AI asked for DOB in the last assistant message
      const aiAskedForDob = prevMsgs.some(m => m.role === "assistant" && (m.content.toLowerCase().includes("date of birth") || m.content.toLowerCase().includes("dob")));
      
      // Case 1: User provides DOB after previously giving app ID
      // Case 2: User provides both in one message  
      const effectiveAppIdMsg = prevAppIdMsg || (combinedAppIdMatch && dobMatch ? lastMsg : null);
      
      if (dobMatch && effectiveAppIdMsg) {
        const appIdMatch = effectiveAppIdMsg.content.match(/\b(EE\d{3,}|NE\d{3,}|IFCS-?\d{4,5}|\d{5})\b/i);
        if (appIdMatch) {
          // Do actual status lookup
          const { data, error } = await supabase.functions.invoke("ai-chat", {
            body: { action: "lookup-status", applicationId: appIdMatch[1], dob: lastMsg.content.trim() },
          });
          
          if (!error && data) {
            if (data.found) {
              setMessages(prev => [...prev, {
                role: "assistant",
                content: `**Application Found**\n\n**Applicant:** ${data.name}\n**Application ID:** ${data.applicationId}\n**IFCS ID:** ${data.ifcsId}\n**Service:** ${data.service}\n**Processing:** ${data.processing}\n**Status:** ${data.status}\n${data.staffNotes ? `**Notes:** ${data.staffNotes}` : ""}\n\nFor detailed information, visit your dashboard.`,
                navButtons: [{ label: "Go to Dashboard", path: "/dashboard/client" }],
              }]);
            } else {
              setMessages(prev => [...prev, {
                role: "assistant",
                content: data.message || "No application found. Please verify your Application ID and Date of Birth.",
                navButtons: [{ label: "Contact Us", path: "/contact" }],
              }]);
            }
            setPendingScroll("assistant");
            setIsLoading(false);
            return;
          }
        }
      }

      const allKB = [...customEntries, ...KNOWLEDGE_BASE];
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          messages: conversationMessages.map(m => ({ role: m.role, content: m.content })),
          knowledgeBase: allKB.map(e => ({
            keywords: e.keywords,
            response: e.response,
            navButtons: e.navButtons || [],
          })),
        },
      });

      if (error) {
        console.error("AI chat error:", error);
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "I'm sorry, I'm having trouble connecting right now. Please try again or contact us directly:\n\n(914) 693-2840 | info@ifcsevals.com",
          navButtons: [{ label: "Contact Us", path: "/contact" }],
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: data?.content || "I'm sorry, I couldn't process that. Please try again.",
          navButtons: data?.navButtons || [],
        }]);
        setPendingScroll("assistant");
      }
    } catch (e) {
      console.error("AI chat error:", e);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I'm experiencing technical difficulties. Please contact us directly:\n\n(914) 693-2840 | info@ifcsevals.com",
        navButtons: [{ label: "Contact Us", path: "/contact" }],
      }]);
    } finally {
      setIsLoading(false);
    }
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
    setPendingScroll("user");

    if (userMsg.attachments && userMsg.attachments.length > 0 && !query) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Thank you for sharing your document(s). For a detailed review, please submit them through our online application or email them to **info@ifcsevals.com**.",
        navButtons: [{ label: "Start Application", path: "/application" }],
      }]);
      setIsLoading(false);
    } else {
      await sendToAI([...messages, userMsg]);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setInput("");
    setAttachments([]);
    sessionStorage.removeItem(CHAT_STATE_KEY);
  };

  const renderMarkdown = (text: string) => {
    // Clean up problematic characters before rendering
    const cleanedText = text.replace(/\?\?+/g, "?").replace(/!!+/g, "!").replace(/#{1,4}\s/g, "");
    const lines = cleanedText.split("\n");
    return lines.map((line, i) => {
      const trimmed = line.trim();

      // Strip markdown headers (###, ##, #) and render as bold text
      const headerMatch = trimmed.match(/^#{1,4}\s+(.+)$/);
      if (headerMatch) {
        return (
          <p key={i} className="py-1">
            <strong className="font-bold text-foreground text-[14px]">{headerMatch[1]}</strong>
          </p>
        );
      }

      // Handle bullet points
      const isBullet = /^[•\-✅📄📞📧📍🕐📠⏱️⚡🚀🆓💼📦✈️]\s?/.test(trimmed) || trimmed.startsWith("- ");
      const isNumbered = /^\d+[\.\)]\s/.test(trimmed);

      const formatInline = (text: string) => {
        return text.split(/(\*\*.*?\*\*|\*[^*]+?\*)/).map((part, j) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={j} className="font-bold text-foreground">{part.slice(2, -2)}</strong>;
          }
          if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) {
            return <em key={j} className="italic">{part.slice(1, -1)}</em>;
          }
          return <span key={j}>{part}</span>;
        });
      };

      if (isBullet || isNumbered) {
        return (
          <div key={i} className="flex gap-2 py-0.5">
            <span className="flex-shrink-0 mt-0.5">{isBullet ? trimmed.match(/^[•\-✅📄📞📧📍🕐📠⏱️⚡🚀🆓💼📦✈️]/)?.[0] || "•" : ""}</span>
            <span className="flex-1">{formatInline(isBullet ? trimmed.replace(/^[•\-✅📄📞📧📍🕐📠⏱️⚡🚀🆓💼📦✈️]\s?/, "") : trimmed)}</span>
          </div>
        );
      }

      if (trimmed === "") return <div key={i} className="h-2" />;

      return (
        <p key={i} className="py-0.5">
          {formatInline(line)}
        </p>
      );
    });
  };

  // Find the index of the last user message for scroll ref
  const lastUserMsgIndex = messages.reduce((acc, msg, i) => msg.role === "user" ? i : acc, -1);

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-accent shadow-lg shadow-accent/40 flex items-center justify-center hover:scale-110 transition-transform duration-200 border-2 border-white/20"
          aria-label="Open chat"
        >
          <img src={ifcsLogo} alt="IFCS AI" className="w-9 h-9 rounded-full object-cover" />
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
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-accent text-white">
                <div className="flex items-center gap-3">
                  <img src={ifcsLogo} alt="IFCS" className="w-9 h-9 rounded-full object-cover border-2 border-white/30" />
                  <div>
                    <p className="text-sm font-bold tracking-wide">IFCS AI</p>
                    <p className="text-[10px] opacity-70">Ask in any language</p>
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
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {messages.length === 0 && (
                  <div className="space-y-4">
                    <div className="text-center py-3 space-y-2">
                      <img src={ifcsLogo} alt="IFCS" className="w-14 h-14 mx-auto rounded-full object-cover shadow-md" />
                      <p className="text-base font-bold text-foreground">IFCS AI</p>
                      <p className="text-xs text-muted-foreground max-w-[260px] mx-auto">
                        How can we help you today?
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 px-2">
                      {SUGGESTIONS.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestionClick(s)}
                          className="px-3 py-2.5 text-xs font-medium rounded-full border border-accent/30 text-accent bg-white hover:bg-accent hover:text-white transition-all duration-200 text-center leading-tight shadow-sm"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    ref={i === lastUserMsgIndex ? lastUserMsgRef : undefined}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
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
                          className={`rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
                            msg.role === "user"
                              ? "bg-accent text-white rounded-br-md shadow-sm"
                              : "bg-muted/60 text-foreground rounded-bl-md border border-border/50"
                          }`}
                        >
                          {renderMarkdown(msg.content)}
                          {msg.role === "assistant" && (
                            <div className="mt-3 pt-2 border-t border-border/30">
                              <p className="text-[9px] text-muted-foreground/70 italic leading-tight">
                                ⚠️ AI-generated responses may contain errors. For verified information, please contact IFCS directly. IFCS is not responsible for inaccuracies.
                              </p>
                            </div>
                          )}
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
                              className="px-4 py-2 text-xs font-semibold rounded-full bg-accent text-white hover:opacity-90 transition-all shadow-sm"
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
                      <span className="w-2 h-2 rounded-full bg-accent/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full bg-accent/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 rounded-full bg-accent/40 animate-bounce" style={{ animationDelay: "300ms" }} />
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

              {/* Quick-send contextual suggestion chips */}
              {messages.length > 0 && !isLoading && (
                <div className="px-4 py-2 border-t border-border flex gap-1.5 overflow-x-auto scrollbar-none">
                  {(() => {
                    const lastAssistant = [...messages].reverse().find(m => m.role === "assistant");
                    const prompts = lastAssistant ? getContextualPrompts(lastAssistant.content) : QUICK_PROMPTS;
                    return prompts.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestionClick(prompt)}
                        className="flex-shrink-0 px-3 py-1.5 text-[11px] font-medium rounded-full border border-accent text-accent bg-white hover:bg-accent/5 transition-colors whitespace-nowrap"
                      >
                        {prompt}
                      </button>
                    ));
                  })()}
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
                    placeholder="Type your message in any language..."
                    className="flex-1 h-10 px-4 rounded-full text-sm text-foreground placeholder:text-muted-foreground bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={(!input.trim() && attachments.length === 0) || isLoading}
                    className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-50 flex-shrink-0 shadow-sm"
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
