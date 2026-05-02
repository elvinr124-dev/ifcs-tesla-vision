import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ═══════════════════════════════════════════════════════════════
// IFCS RULE-BASED KNOWLEDGE (no AI calls — zero credit usage)
// Captures every recurring fact already prompted into the AI so
// common questions are answered instantly and for free.
// ═══════════════════════════════════════════════════════════════
type RuleAnswer = { content: string; navButtons?: Array<{ label: string; path: string; state?: any }> };
type Rule = { keywords: string[][]; answer: RuleAnswer };

const RULES: Rule[] = [
  // CONTACT
  {
    keywords: [["phone"], ["call"], ["number"], ["contact"], ["reach"], ["email"], ["address"], ["location"], ["hours"], ["where"]],
    answer: {
      content: `**Contact IFCS — Institute of Foreign Credential Services**\n\n• **Phone:** (914) 693-2840\n• **Fax:** (914) 231-7782\n• **Email:** info@ifcsevals.com · apps@ifcsevals.com\n• **Address:** 6 Cedar Street, Dobbs Ferry, NY 10522\n• **Hours:** Monday–Friday, 9:00 AM – 5:00 PM EST`,
      navButtons: [{ label: "Contact Page", path: "/contact" }],
    },
  },
  // PRICING — full table
  {
    keywords: [["price"], ["pricing"], ["cost"], ["fee"], ["how much"], ["rates"]],
    answer: {
      content: `**IFCS Pricing — Standard / 3-Day Rush / 24-Hour Priority**\n\n• General Analysis — **$100 / $150 / $195**\n• General Analysis + GPA — **$150 / $205 / $295**\n• Cosmetology CxC — **$170 / $275 / $375**\n• Course-by-Course — **$190 / $290 / $425**\n• Health Professions CxC — **$230 / $355 / $490**\n• Comprehensive CxC — **$290 / $390 / $490**\n• HS & University CxC — **$295 / $395 / $495**\n• Professional Licensure CxC — **$400 / $550 / $650**\n\n**Add-ons:** Translations $50/page · Duplicate Reports $25 · Document Authentication $140 · Notarization $19.95 · Report Renewal $100\n**Consulting:** Evaluation = FREE · Academic Advising = $60/hr`,
      navButtons: [{ label: "View Pricing", path: "/pricing" }, { label: "All Evaluations", path: "/evaluations" }],
    },
  },
  // TURNAROUND
  {
    keywords: [["turnaround"], ["how long"], ["how many days"], ["processing time"], ["delivery time"], ["business days"], ["how fast"], ["rush"]],
    answer: {
      content: `**Processing Times**\n\n• **Standard:** 8–10 business days\n• **3-Day Rush:** 3 business days\n• **24-Hour Priority:** 24 hours\n\nRush services are available on most evaluations. Pricing varies — see the pricing page for details.`,
      navButtons: [{ label: "View Pricing", path: "/pricing" }],
    },
  },
  // EVALUATION TYPES (general)
  {
    keywords: [["what evaluations"], ["types of evaluation"], ["which evaluation"], ["kinds of evaluation"], ["evaluation services"], ["all evaluations"]],
    answer: {
      content: `**IFCS offers 8 evaluation types:**\n\n• **General Analysis** — $100 (employment, USCIS, military)\n• **General Analysis + GPA** — $150\n• **Course-by-Course** — $190 (university admission, transfer credits)\n• **Comprehensive CxC** — $290 (multiple degrees)\n• **HS & University CxC** — $295\n• **Health Professions CxC** — $230 (nursing, CGFNS, ECFMG)\n• **Cosmetology CxC** — $170\n• **Professional Licensure CxC** — $400 (CPA, PE, Bar)`,
      navButtons: [{ label: "Browse Evaluations", path: "/evaluations" }],
    },
  },
  // INTENT-BASED RECOMMENDATIONS
  {
    keywords: [["uscis"], ["green card"], ["work visa"], ["h-1b"], ["h1b"], ["immigration"], ["employment"]],
    answer: {
      content: `For **employment, immigration, USCIS, work visas, or green cards**, you'll want a **General Evaluation ($100)**.\n\nIt provides degree equivalency to U.S. standards, which is what USCIS, employers, and government agencies require.`,
      navButtons: [{ label: "Start General Analysis", path: "/application", state: { serviceTitle: "General Analysis", processingKey: "standard", processingLabel: "Standard", processingTime: "8–10 Business Days", price: 100 } }],
    },
  },
  {
    keywords: [["military"], ["veteran"], ["gi bill"], ["armed forces"]],
    answer: {
      content: `For **U.S. Military, veterans, or GI Bill** purposes, the **General Evaluation ($100)** is the right fit. IFCS evaluations are accepted by all branches of the U.S. Military.`,
      navButtons: [{ label: "Start General Analysis", path: "/application", state: { serviceTitle: "General Analysis", processingKey: "standard", processingLabel: "Standard", processingTime: "8–10 Business Days", price: 100 } }],
    },
  },
  {
    keywords: [["cpa"], ["bar exam"], ["bar admission"], ["professional engineer"], ["pe license"], ["professional licensure"], ["lawyer"], ["attorney licensure"]],
    answer: {
      content: `For **CPA, Professional Engineer (PE), or Bar admission**, you need the **Professional Licensure Course-by-Course ($400 standard)** evaluation.\n\nIt includes credit-hour analysis, grading-scale conversion, course-level comparability, and professional credential validation.`,
      navButtons: [{ label: "Start Professional Licensure CxC", path: "/application", state: { serviceTitle: "Professional Licensure Course-by-Course", processingKey: "standard", processingLabel: "Standard", processingTime: "8–10 Business Days", price: 400 } }],
    },
  },
  {
    keywords: [["nursing"], ["nurse"], ["cgfns"], ["ecfmg"], ["medical license"], ["healthcare"], ["health profession"]],
    answer: {
      content: `For **nursing, medical, or healthcare licensing (CGFNS, ECFMG)**, you need the **Health Professions Course-by-Course ($230)** evaluation.`,
      navButtons: [{ label: "Start Health Professions CxC", path: "/application", state: { serviceTitle: "Health Professions Course-by-Course", processingKey: "standard", processingLabel: "Standard", processingTime: "8–10 Business Days", price: 230 } }],
    },
  },
  {
    keywords: [["transfer credit"], ["university admission"], ["college admission"], ["continuing education"], ["graduate school"]],
    answer: {
      content: `For **university admission, transfer credits, or graduate school**, the **Course-by-Course ($190)** evaluation is what you need.`,
      navButtons: [{ label: "Start Course-by-Course", path: "/application", state: { serviceTitle: "Course-by-Course", processingKey: "standard", processingLabel: "Standard", processingTime: "8–10 Business Days", price: 190 } }],
    },
  },
  {
    keywords: [["cosmetology"], ["barber"], ["esthetics"], ["beauty license"]],
    answer: {
      content: `For **cosmetology, barbering, or esthetics licensing**, the **Cosmetology Course-by-Course ($170)** evaluation is what state boards require.`,
      navButtons: [{ label: "Start Cosmetology CxC", path: "/application", state: { serviceTitle: "Cosmetology Course-by-Course", processingKey: "standard", processingLabel: "Standard", processingTime: "8–10 Business Days", price: 170 } }],
    },
  },
  {
    keywords: [["multiple degree"], ["two degree"], ["2 degree"], ["several degree"]],
    answer: {
      content: `For applicants with **multiple degrees**, the **Comprehensive Course-by-Course ($290)** covers all of them in one evaluation.`,
      navButtons: [{ label: "Start Comprehensive CxC", path: "/application", state: { serviceTitle: "Comprehensive Course-by-Course", processingKey: "standard", processingLabel: "Standard", processingTime: "8–10 Business Days", price: 290 } }],
    },
  },
  // TRANSLATIONS
  {
    keywords: [["translation"], ["translate"], ["certified translation"]],
    answer: {
      content: `**Certified Translations** — $50/page\n\nIFCS provides certified translations for any official document required for evaluation, immigration, or academic use. You can start an order or request a quote first.`,
      navButtons: [{ label: "Start Translation Order", path: "/translations/order" }, { label: "Get a Quote", path: "/translations/quote" }],
    },
  },
  // TRACK ORDER / STATUS
  {
    keywords: [["track"], ["status"], ["where is my"], ["my order"], ["my application"], ["my evaluation"]],
    answer: {
      content: `You can **track your order** from your dashboard using either your **App ID** (e.g., EE0788 for evaluations or TEV1234 for translations) or your **IFCS ID** (5-digit number). Evaluations verify with **Date of Birth**; translations verify with **Zip Code**.\n\nFor urgent inquiries: **(914) 693-2840** or **apps@ifcsevals.com**.`,
      navButtons: [{ label: "My Dashboard", path: "/dashboard/client" }],
    },
  },
  // REFUND / DISPUTE — human handoff
  {
    keywords: [["refund"], ["dispute"], ["complaint"], ["cancel"]],
    answer: {
      content: `For **refunds, disputes, or complaints**, please contact our team directly so we can resolve it for you:\n\n• **Phone:** (914) 693-2840\n• **Email:** apps@ifcsevals.com`,
      navButtons: [{ label: "Contact Page", path: "/contact" }],
    },
  },
  // GRADE CONVERSION — zero-guess policy
  {
    keywords: [["convert grade"], ["gpa equivalent"], ["grade equivalent"], ["what is my gpa"], ["calculate gpa"], ["my gpa"]],
    answer: {
      content: `To ensure accuracy, our evaluators must review your specific transcripts. Every university's grading scale is unique — this is why a professional evaluation is essential.\n\nWe recommend a **Course-by-Course evaluation ($190)** for GPA-related needs.`,
      navButtons: [{ label: "Start Course-by-Course", path: "/application", state: { serviceTitle: "Course-by-Course", processingKey: "standard", processingLabel: "Standard", processingTime: "8–10 Business Days", price: 190 } }],
    },
  },
  // NACES / ACCEPTANCE
  {
    keywords: [["naces"], ["accepted by"], ["who accepts"], ["recognized"], ["accreditation"]],
    answer: {
      content: `IFCS is a **NACES member** — the gold standard for credential evaluation in the U.S.\n\nOur evaluations are accepted by **universities, colleges, employers, federal and state government agencies, USCIS, all branches of the U.S. Military, and professional licensing boards** nationwide.`,
      navButtons: [{ label: "About IFCS", path: "/about" }],
    },
  },
  // DISCOUNT CODES
  {
    keywords: [["discount"], ["promo code"], ["coupon"], ["promo"]],
    answer: {
      content: `**Discount codes** can be entered in your cart at checkout:\n\n• **IFCS10** — 10% off\n• **WELCOME15** — 15% off\n• **IFCS20** — 20% off`,
      navButtons: [{ label: "Cart", path: "/cart" }],
    },
  },
  // OFFICIAL DOCUMENTS
  {
    keywords: [["send transcript"], ["mail document"], ["send document"], ["official transcript"], ["where to send"]],
    answer: {
      content: `Once your application is submitted and you receive your **IFCS ID** (a 5-digit reference number), you can have your issuing institution send official documents directly to IFCS. Mailing instructions and the appropriate address are provided after submission. In some cases, originals must be mailed directly to our office for verification.`,
      navButtons: [{ label: "Start an Application", path: "/application" }],
    },
  },
  // CONSULTING
  {
    keywords: [["consultation"], ["consulting"], ["advisor"], ["advising"], ["book consult"]],
    answer: {
      content: `**Consulting Services**\n\n• **Evaluation Consultation** — FREE (helps you choose the right evaluation)\n• **Academic Advising** — $60/hour\n\nYou can book directly online.`,
      navButtons: [{ label: "Book Consultation", path: "/consulting/book" }, { label: "Consulting Info", path: "/consulting" }],
    },
  },
  // GREETINGS
  {
    keywords: [["hello"], ["hi"], ["hey"], ["good morning"], ["good afternoon"], ["good evening"]],
    answer: {
      content: `Hi there! I'm the **IFCS AI assistant**. I can help with:\n\n• Choosing the right evaluation\n• Pricing and turnaround times\n• Translations\n• Tracking your order\n• Document requirements by country\n\nWhat can I help you with today?`,
    },
  },
  // THANKS
  {
    keywords: [["thank"], ["thanks"], ["appreciate"]],
    answer: {
      content: `You're very welcome! If you need anything else, just ask — or call us at **(914) 693-2840**.`,
    },
  },
  // COUNTRY-SPECIFIC
  {
    keywords: [["jamaica"], ["trinidad"], ["barbados"], ["caribbean"], ["cxc"], ["csec"], ["cape"]],
    answer: {
      content: `**Caribbean credentials (Jamaica, Trinidad, Barbados, etc.):**\n\n• **CXC/CSEC** results required for secondary education\n• **CAPE** results for advanced/post-secondary\n• Official transcripts from any post-secondary institutions attended\n\nWe recommend a **Course-by-Course evaluation** for academic use or **General Analysis** for employment/immigration.`,
    },
  },
  {
    keywords: [["nigeria"], ["ghana"], ["west africa"], ["waec"], ["neco"]],
    answer: {
      content: `**West African credentials (Nigeria, Ghana, etc.):**\n\n• **WAEC** results required\n• **NECO** for Nigeria\n• Official university transcripts and degree certificates\n\nA **Course-by-Course** evaluation is typically needed for academic use.`,
    },
  },
  {
    keywords: [["india"], ["indian degree"], ["cbse"], ["icse"], ["mark sheet"]],
    answer: {
      content: `**Indian credentials:**\n\n• **Year-wise Mark Sheets** for all years of post-secondary\n• **CBSE / ICSE / State Board** certificates for secondary\n• Provisional + Final Degree certificates\n\nUse **Course-by-Course** for academic purposes; **General Analysis** for employment/USCIS.`,
    },
  },
  {
    keywords: [["philippines"], ["filipino degree"], ["ched"], ["cav"]],
    answer: {
      content: `**Philippines credentials:**\n\n• **TOR** (Transcript of Records) from your university\n• **CAV** from CHED or DFA when required by the receiving institution\n• Diploma / degree certificate`,
    },
  },
  {
    keywords: [["china"], ["chinese degree"], ["chesicc"], ["cdgdc"]],
    answer: {
      content: `**Chinese credentials:**\n\n• **CDGDC / CHESICC** verification report\n• Official transcripts in Chinese with **certified English translations**\n• Degree and graduation certificates`,
    },
  },
  {
    keywords: [["pakistan"], ["pakistani degree"], ["hec"], ["dmc"]],
    answer: {
      content: `**Pakistani credentials:**\n\n• **DMC** (Detailed Marks Certificate) for each year\n• **HEC** attestation strongly recommended\n• Degree certificate and official transcripts`,
    },
  },
  {
    keywords: [["bologna"], ["european degree"], ["ects"], ["diploma supplement"]],
    answer: {
      content: `**European (Bologna Process) credentials:**\n\n• **Diploma Supplement** in English\n• Official transcripts with **ECTS** credits\n• Degree certificate\n\nWe handle the ECTS-to-U.S. credit-hour conversion.`,
    },
  },
  // OWNER / DIRECTOR — confidential
  {
    keywords: [["who owns"], ["owner of ifcs"], ["ceo"], ["director"], ["founder"]],
    answer: {
      content: `For inquiries about our leadership team, please contact us directly at **info@ifcsevals.com** or call **(914) 693-2840**.`,
    },
  },
];

function matchRule(text: string): RuleAnswer | null {
  if (!text || text.length < 2) return null;
  let best: { rule: Rule; score: number } | null = null;
  for (const rule of RULES) {
    let score = 0;
    for (const group of rule.keywords) {
      // Each group is a list of phrases; any phrase in the group matching counts as 1 point.
      if (group.some(phrase => text.includes(phrase))) score++;
    }
    if (score > 0 && (!best || score > best.score)) best = { rule, score };
  }
  return best ? best.rule.answer : null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, knowledgeBase, action, title, response: aiResponse, applicationId, dob } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // ACTION: lookup-status
    if (action === "lookup-status") {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const sb = createClient(supabaseUrl, supabaseKey);

      // Try by application_id first, then by ifcs_id
      const searchId = applicationId.trim().toUpperCase();
      let query = sb.from("applications").select("application_id, ifcs_id, first_name, last_name, dob, status, service_title, processing_label, staff_notes, created_at").or(`application_id.ilike.${searchId},ifcs_id.ilike.${searchId},ifcs_id.ilike.IFCS-${searchId}`);
      const { data: apps, error } = await query;

      if (error || !apps || apps.length === 0) {
        return new Response(JSON.stringify({ found: false, message: "No application found with that ID. Please double-check and try again, or contact us at (914) 693-2840." }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Normalize DOB for comparison: handle many formats
      const MONTH_MAP: Record<string, string> = {
        january: "01", jan: "01", february: "02", feb: "02", march: "03", mar: "03",
        april: "04", apr: "04", may: "05", june: "06", jun: "06", july: "07", jul: "07",
        august: "08", aug: "08", september: "09", sept: "09", sep: "09",
        october: "10", oct: "10", november: "11", nov: "11", december: "12", dec: "12",
      };

      const normalizeDob = (d: string): string => {
        if (!d) return "";
        let cleaned = d.trim().replace(/,/g, "").replace(/\s+/g, " ");
        
        // Handle text month formats like "September 16th 2002", "Sept 16 02"
        const textMonthMatch = cleaned.match(/^([a-zA-Z]+)\s+(\d{1,2})(?:st|nd|rd|th)?\s+(\d{2,4})$/i);
        if (textMonthMatch) {
          const monthStr = textMonthMatch[1].toLowerCase();
          const mm = MONTH_MAP[monthStr];
          if (mm) {
            const dd = textMonthMatch[2].padStart(2, "0");
            let yy = textMonthMatch[3];
            if (yy.length === 4) yy = yy.slice(-2);
            return `${mm}/${dd}/${yy}`;
          }
        }
        
        // Handle "16 September 2002" format
        const textMonthMatch2 = cleaned.match(/^(\d{1,2})(?:st|nd|rd|th)?\s+([a-zA-Z]+)\s+(\d{2,4})$/i);
        if (textMonthMatch2) {
          const monthStr = textMonthMatch2[2].toLowerCase();
          const mm = MONTH_MAP[monthStr];
          if (mm) {
            const dd = textMonthMatch2[1].padStart(2, "0");
            let yy = textMonthMatch2[3];
            if (yy.length === 4) yy = yy.slice(-2);
            return `${mm}/${dd}/${yy}`;
          }
        }
        
        // Handle numeric formats: MM/DD/YYYY, MM-DD-YYYY, MM.DD.YYYY
        cleaned = cleaned.replace(/[-\.]/g, "/");
        const parts = cleaned.split("/");
        if (parts.length !== 3) return cleaned.toLowerCase();
        let [mm, dd, yy] = parts;
        mm = mm.padStart(2, "0");
        dd = dd.padStart(2, "0");
        if (yy.length === 4) yy = yy.slice(-2);
        return `${mm}/${dd}/${yy}`;
      };

      const normalizedInputDob = normalizeDob(dob);
      const app = apps.find((a: any) => normalizeDob(a.dob) === normalizedInputDob);
      if (!app) {
        // Try exact match as fallback
        const appExact = apps.find((a: any) => a.dob === dob);
        if (!appExact) {
          return new Response(JSON.stringify({ found: false, message: "Date of birth does not match our records. Please use the format MM/DD/YYYY (e.g., 04/17/2000) and try again." }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      const matchedApp = app || apps.find((a: any) => a.dob === dob)!;
      return new Response(JSON.stringify({
        found: true,
        status: matchedApp.status || "Requested",
        service: matchedApp.service_title || "N/A",
        processing: matchedApp.processing_label || "Standard",
        name: `${matchedApp.first_name} ${matchedApp.last_name}`,
        applicationId: matchedApp.application_id,
        ifcsId: matchedApp.ifcs_id || "Not yet assigned",
        staffNotes: matchedApp.staff_notes || "",
        createdAt: matchedApp.created_at,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: suggest-keywords
    if (action === "suggest-keywords") {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            {
              role: "system",
              content: `You are a keyword generator for IFCS (Institute of Foreign Credential Services) AI chatbot knowledge base. Given a title and optionally a response, generate 10-20 relevant keywords/phrases that users might type to find this entry. Include variations, synonyms, abbreviations, related terms, country names, credential types, etc. Return ONLY a JSON array of lowercase strings, nothing else. Example: ["albanian", "albania", "albanian diploma", "albanian university", "albanian high school", "tirana university"]`,
            },
            {
              role: "user",
              content: `Title: ${title}\n${aiResponse ? `Response: ${aiResponse}` : ""}`,
            },
          ],
        }),
      });

      if (!res.ok) {
        const t = await res.text();
        console.error("AI gateway error:", res.status, t);
        throw new Error("AI keyword suggestion failed");
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || "[]";
      const match = content.match(/\[[\s\S]*\]/);
      const keywords = match ? JSON.parse(match[0]) : [];

      return new Response(JSON.stringify({ keywords }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: enhance-response
    if (action === "enhance-response") {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are an expert in international credential evaluation for IFCS (Institute of Foreign Credential Services), a NACES member. Given a knowledge base entry's title and draft response, enhance and expand the response with accurate, detailed information about the country's education system, required documents, credential types, and any specific evaluation considerations. Use information consistent with industry-standard research databases and NACES standards. Keep IFCS branding and pricing. Use **bold** for emphasis and bullet points for lists. Keep the response informative but concise (under 300 words).`,
            },
            {
              role: "user",
              content: `Title: ${title}\nDraft Response: ${aiResponse || "Please generate a helpful response about this topic."}`,
            },
          ],
        }),
      });

      if (!res.ok) {
        const t = await res.text();
        console.error("AI gateway error:", res.status, t);
        throw new Error("AI response enhancement failed");
      }

      const data = await res.json();
      const enhanced = data.choices?.[0]?.message?.content || aiResponse || "";

      return new Response(JSON.stringify({ enhanced }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: chat
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Missing messages" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ═══════════════════════════════════════
    // RULE-BASED FAST PATH (zero AI cost)
    // ═══════════════════════════════════════
    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user")?.content || "";
    const ruleAnswer = matchRule(String(lastUserMsg).toLowerCase());
    if (ruleAnswer) {
      let content = ruleAnswer.content;
      const navButtons = ruleAnswer.navButtons || [];
      content = content.replace(/\?\?+/g, "?").replace(/!!+/g, "!").replace(/#{1,4}\s/g, "");
      return new Response(JSON.stringify({ content, navButtons, source: "rules" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build KB context WITHOUT exposing the literal "Nav Buttons:" line to the model
    // (the model was echoing it into responses). Nav buttons stay on server only.
    const kbContext = (knowledgeBase || []).map((entry: any, i: number) =>
      `[Entry ${i + 1}]\nKeywords: ${entry.keywords.join(", ")}\nResponse: ${entry.response}`
    ).join("\n\n");

    const systemPrompt = `You are the official AI assistant for **IFCS — Institute of Foreign Credential Services**, a proud member of **NACES (National Association of Credential Evaluation Services)**. IFCS is located at 6 Cedar Street, Dobbs Ferry, NY 10522.

═══════════════════════════════════════
CRITICAL LANGUAGE RULE
═══════════════════════════════════════
DEFAULT LANGUAGE IS ENGLISH. Always respond in English UNLESS the user writes their message in a different language. If a user writes in Spanish, respond in Spanish. If they write in French, respond in French. But if a user writes in English (even about a foreign country like "cuban degree" or "albanian diploma"), respond in ENGLISH.
Only switch languages when the user actually writes in that language. Keep proper nouns (IFCS, NACES), prices ($), and contact info in their original form.

═══════════════════════════════════════
RESPONSE STYLE — CONCISE & EXCELLENT
═══════════════════════════════════════
- Keep responses SHORT — ideally 3-6 bullet points or 2-3 short paragraphs. Maximum 150 words.
- Be direct, clear, and authoritative. No filler. Every sentence must add value.
- Use **bold** for prices, service names, and important terms.
- Use bullet points for lists and document requirements.
- Do NOT write lengthy introductions or conclusions.
- Do NOT use markdown headers (no #, ##, ###). Use **bold** text instead.
- Do NOT use special characters like inverted question marks or inverted exclamation marks.
- NEVER output double question marks (??) or other duplicated punctuation.
- Use clean, standard punctuation only.

═══════════════════════════════════════
CONFIDENTIAL INFO — DO NOT DISCLOSE
═══════════════════════════════════════
- NEVER mention the Director's name or any staff names. If asked about the owner, director, CEO, or founder, say: "For inquiries about our leadership team, please contact us directly at info@ifcsevals.com or call (914) 693-2840."
- Do NOT reference "AACRAO", "AACRAO EDGE", or any internal research tools by name. Instead say "industry-standard research databases" or "professional evaluation standards."

═══════════════════════════════════════
APPLICATION STATUS LOOKUP
═══════════════════════════════════════
If a user provides what looks like an Application ID (e.g., "EE0788", any code starting with "EE" followed by numbers) or an IFCS ID (a 5-digit number), treat it as a status inquiry. Ask them to verify their identity by providing their Date of Birth (MM/DD/YYYY) alongside the Application ID. Then say you will look it up. The system will handle the actual lookup.

═══════════════════════════════════════
OFFICIAL DOCUMENTS
═══════════════════════════════════════
Once the application is submitted and the applicant receives their IFCS ID (a 5-digit reference number), they may contact their issuing institution to send official documents directly to IFCS. The applicant will be provided with the appropriate mailing address and instructions. In some cases, IFCS may require the original documents to be mailed directly to the office for verification purposes.

═══════════════════════════════════════
NACES AUTHORITY & ACCEPTANCE
═══════════════════════════════════════
- IFCS is a **NACES member** — the gold standard for credential evaluation in the United States.
- NACES membership means IFCS evaluations are accepted by **universities, colleges, employers, federal and state government agencies, USCIS, U.S. Military branches, and professional licensing boards** nationwide.
- Do NOT over-emphasize USCIS — only mention it when the user specifically asks about immigration. For general acceptance questions, list ALL accepting bodies equally.
- IFCS evaluators use rigorous industry-standard research databases used by top university registrars.

═══════════════════════════════════════
INTELLIGENT INTENT DETECTION
═══════════════════════════════════════
Analyze the user's keywords to recommend the right evaluation:

- **Employment / Immigration / USCIS / work visa / green card / H-1B** → **General Evaluation ($100)**
- **Military / U.S. Military / armed forces / veteran / GI Bill / military professional boards** → **General Evaluation ($100)**
- **Continuing education / transfer credits / university admission** → **Course-by-Course ($190)**
- **Medical / nursing / healthcare / CGFNS / ECFMG** → **Health Professions Course-by-Course ($230)**
- **CPA / engineering / PE / bar exam / professional license** → **Professional Licensure Course-by-Course ($400)**
- **Multiple degrees / 2 degrees** → **Comprehensive Course-by-Course ($290)**
- **High school + university together** → **HS & University Course-by-Course ($295)**
- **Cosmetology / barbering / beauty / esthetics** → **Cosmetology Course-by-Course ($170)**

═══════════════════════════════════════
ZERO-GUESSING POLICY
═══════════════════════════════════════
If a user asks for a specific grade conversion, NEVER calculate or estimate it. Respond: "To ensure accuracy, our evaluators must review your specific transcripts. Every university's grading scale is unique — this is why a professional evaluation is essential."

═══════════════════════════════════════
HUMAN HANDOFF TRIGGERS
═══════════════════════════════════════
If the user mentions "refund", "dispute", "complaint", "status of my application", "where is my evaluation", "my order", "tracking" — immediately provide:
- (914) 693-2840
- apps@ifcsevals.com

═══════════════════════════════════════
PRICING (Single Source of Truth)
═══════════════════════════════════════
**Standard / 3-Day Rush / 24-Hour Priority:**
- General Analysis: $100 / $150 / $195
- General Analysis + GPA: $150 / $205 / $295
- Cosmetology CxC: $170 / $275 / $375
- Course-by-Course: $190 / $290 / $425
- Health Professions CxC: $230 / $355 / $490
- Comprehensive CxC: $290 / $390 / $490
- HS & University CxC: $295 / $395 / $495
- Professional Licensure CxC: $400 / $550 / $650
- Translations: $50/page
- Consulting (Evaluation): FREE
- Consulting (Advising): $60/hour
- Duplicate Reports: $25 each
- Document Authentication: $140
- Notarization: $19.95
- Report Renewal: $100

**Processing Times:** Standard: 8-10 business days | 3-Day Rush | 24-Hour Priority

═══════════════════════════════════════
COMPLETE WEBSITE FEATURES & PAGES
═══════════════════════════════════════
The IFCS website (ifcsevals.com) has the following pages and features that you should know about and be able to direct users to:

**Navigation & Pages:**
- Home page (/) — hero section, service overview
- Evaluations (/evaluations) — all 8 evaluation types with pricing, samples, and "Start Application" buttons
- Translations (/translations) — certified translation services
- Start Translation Order (/translations/order) — order form for translations
- Get a Translation Quote (/translations/quote) — quote request form
- Pricing (/pricing) — complete pricing table for all services
- About (/about) — company history, NACES membership, team info
- Contact (/contact) — contact form, phone, email, address, hours
- FAQ (/faq) — frequently asked questions
- Blog (/blog) — articles about credential evaluation
- For Individuals (/for-individuals) — services for individual applicants
- For Institutions (/for-institutions) — institutional services with 15% discount
- Consulting (/consulting) — free evaluation consultations and $60/hr advising
- Book Consultation (/consulting/book) — schedule an appointment
- Learn More About Evaluations (/learn-more-evaluations) — detailed info
- Duplicate Reports (/duplicate-reports) — order additional copies of past evaluations
- Report Renewal (/addon/renewal) — renew expired evaluation reports ($100)

**User Account Features:**
- Client Login (/login) — existing clients can log in to their account
- Client Signup (/signup) — new clients can create an account with name, email, password
- My Dashboard (/dashboard/client) — clients can track their applications, view order status, see staff notes, and view receipts
- Cart (/cart) — shopping cart where users can add multiple services and apply discount codes

**Discount Codes (Cart Feature):**
Users can enter discount codes in the cart for savings:
- **IFCS10** — 10% off
- **IFCS20** — 20% off
- **WELCOME15** — 15% off

**Application Process:**
The application (/application) is a 5-step wizard:
1. Personal Information (requires government ID upload)
2. Education Background
3. Service Selection & Processing Speed
4. Document Uploads
5. Payment & Submission
After submission, users receive a unique Application ID (e.g., EE0788).

**Legal Pages:**
- Privacy Policy (/privacy-policy) — data protection and privacy practices
- Terms of Service (/terms-of-service) — terms and conditions for using IFCS services

**Add-on Services:**
- Hard Copy delivery
- Domestic Shipping ($25)
- International Shipping ($70)
- Electronic Sharing ($25)
- Report Renewal ($100)

**Contact Information:**
- Phone: (914) 693-2840
- Fax: (914) 231-7782
- Email: info@ifcsevals.com | apps@ifcsevals.com
- Address: 6 Cedar Street, Dobbs Ferry, NY 10522
- Hours: Monday-Friday, 9:00 AM - 5:00 PM EST

═══════════════════════════════════════
COUNTRY-SPECIFIC EXPERTISE
═══════════════════════════════════════
When a user asks about a SPECIFIC country, ONLY provide info for THAT region. Do NOT combine multiple regions.

- **Caribbean (Jamaica, Trinidad, Barbados, etc.):** CXC/CSEC results required; CAPE for advanced.
- **West Africa (Nigeria, Ghana, etc.):** WAEC results required; NECO for Nigeria.
- **India:** Year-wise Mark Sheets; CBSE/ICSE/State Board for secondary.
- **Philippines:** TOR (Transcript of Records); CAV from CHED/DFA.
- **China:** CDGDC/CHESICC verification; certified translations from Chinese.
- **European (Bologna Process):** Diploma Supplement; ECTS credit conversion.
- **Pakistan:** DMC (Detailed Marks Certificate); HEC attestation recommended.
- **Middle East:** Official transcripts with certified English translations.

NAVIGATION BUTTONS: When your response relates to a specific service, include navigation buttons at the very end on a new line starting with "NAV_BUTTONS:" followed by JSON array. Example:
NAV_BUTTONS:[{"label":"View Evaluations","path":"/evaluations"},{"label":"Start Application","path":"/application","state":{"serviceTitle":"General Analysis","processingKey":"standard","processingLabel":"Standard","processingTime":"8–10 Business Days","price":100}}]

Available paths: /evaluations, /evaluations#general-analysis, /evaluations#course-by-course, /evaluations#health-professions-course-by-course, /evaluations#comprehensive-course-by-course, /evaluations#high-school-and-university-course-by-course, /evaluations#professional-licensure-course-by-course, /evaluations#cosmetology-course-by-course, /evaluations#general-analysis-plus-gpa, /translations, /translations/order, /translations/quote, /pricing, /application, /consulting, /consulting/book, /contact, /about, /faq, /blog, /learn-more-evaluations, /duplicate-reports, /dashboard/client, /for-individuals, /for-institutions, /addon/renewal, /cart, /login, /signup, /privacy-policy, /terms-of-service

KNOWLEDGE BASE:
${kbContext}

Remember: DEFAULT is English. Only switch when user writes in another language. Keep responses SHORT and excellent. Never use # headers. Never output double question marks or hashtag symbols.`;

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({ role: m.role, content: m.content })),
    ];

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: aiMessages,
        max_tokens: 400,
      }),
    });

    if (!res.ok) {
      if (res.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (res.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await res.text();
      console.error("AI gateway error:", res.status, t);
      throw new Error("AI chat failed");
    }

    const data = await res.json();
    let content = data.choices?.[0]?.message?.content || "";

    let navButtons: any[] = [];
    const navMatch = content.match(/NAV_BUTTONS:\s*(\[[\s\S]*?\])\s*$/);
    if (navMatch) {
      try {
        navButtons = JSON.parse(navMatch[1]);
        content = content.replace(/NAV_BUTTONS:\s*\[[\s\S]*?\]\s*$/, "").trim();
      } catch { /* ignore parse errors */ }
    }

    // Strip any leaked "Nav Buttons: [...]" the model may have echoed from the KB
    const leakedNavRx = /\n?\s*Nav Buttons?:\s*\[[\s\S]*?\]\s*$/i;
    const leakedMatch = content.match(/Nav Buttons?:\s*(\[[\s\S]*?\])/i);
    if (leakedMatch && navButtons.length === 0) {
      try { navButtons = JSON.parse(leakedMatch[1]); } catch { /* ignore */ }
    }
    content = content.replace(leakedNavRx, "").replace(/\n?\s*Nav Buttons?:\s*\[[\s\S]*?\]/gi, "").trim();

    // Clean up any remaining formatting issues
    content = content.replace(/\?\?+/g, "?").replace(/!!+/g, "!").replace(/#{1,4}\s/g, "");

    return new Response(JSON.stringify({ content, navButtons }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
