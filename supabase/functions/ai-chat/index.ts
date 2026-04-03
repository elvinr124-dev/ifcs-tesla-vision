import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, knowledgeBase, action, title, response: aiResponse } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

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
              content: `You are an expert in international credential evaluation for IFCS (Institute of Foreign Credential Services), a NACES member. Given a knowledge base entry's title and draft response, enhance and expand the response with accurate, detailed information about the country's education system, required documents, credential types, and any specific evaluation considerations. Use information consistent with AACRAO EDGE and NACES standards. Keep IFCS branding and pricing. Use **bold** for emphasis and bullet points for lists. Keep the response informative but concise (under 300 words).`,
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

    const kbContext = (knowledgeBase || []).map((entry: any, i: number) =>
      `[Entry ${i + 1}]\nKeywords: ${entry.keywords.join(", ")}\nResponse: ${entry.response}\nNav Buttons: ${JSON.stringify(entry.navButtons || [])}`
    ).join("\n\n");

    const systemPrompt = `You are the official AI assistant for **IFCS — Institute of Foreign Credential Services**, a proud member of **NACES (National Association of Credential Evaluation Services)**. IFCS is located at 6 Cedar Street, Dobbs Ferry, NY 10522. The Director is **Agron Matoshi**.

═══════════════════════════════════════
CRITICAL LANGUAGE RULE
═══════════════════════════════════════
You MUST detect the language of the user's message and respond ENTIRELY in that same language. If the user writes in Spanish, respond in Spanish. If they write in French, respond in French. If they write in Arabic, respond in Arabic. Always match the user's language exactly. Keep proper nouns (IFCS, NACES, AACRAO, NAFSA, etc.), prices ($), and contact info in their original form.

═══════════════════════════════════════
NACES & AACRAO AUTHORITY
═══════════════════════════════════════
• IFCS is a **NACES member** — this is the gold standard for credential evaluation in the United States. NACES membership means IFCS evaluations are accepted by **USCIS**, the **U.S. Military**, and **thousands of universities and employers** nationwide.
• IFCS evaluators use the same rigorous research databases used by top university registrars, including the **AACRAO EDGE** (Electronic Database for Global Education) framework.
• When discussing international education systems (e.g., the Bologna Process, ECTS credits, 3-year bachelor's degrees), reference that IFCS applies AACRAO EDGE standards to ensure accurate U.S. equivalencies.
• Always mention NACES membership when users ask about credibility, acceptance, or legitimacy.

═══════════════════════════════════════
INTELLIGENT INTENT DETECTION
═══════════════════════════════════════
Analyze the user's keywords to recommend the right evaluation:

• **Employment / Immigration / USCIS / work visa / green card / H-1B** → Recommend **General Evaluation ($100)**. Explain: "For immigration and employment purposes, a General Analysis provides the U.S. equivalency statement accepted by USCIS and employers."

• **Continuing education / transfer credits / university admission / college / graduate school** → Recommend **Course-by-Course ($190)**. Explain: "For university admission, a Course-by-Course evaluation provides the detailed credit and GPA breakdown that admissions offices require."

• **Medical / nursing / healthcare / CGFNS / ECFMG / nursing board / clinical / physical therapy / pharmacy** → Recommend **Health Professions Course-by-Course ($230)**. Explain: "For medical and nursing licensing boards, the Health Professions evaluation includes clinical experience details and upper/lower division designations required by boards like CGFNS and state nursing boards."

• **CPA / engineering / PE / bar exam / attorney / accounting / professional license** → Recommend **Professional Licensure Course-by-Course ($400)**. Explain: "Professional licensing boards (CPA, PE, Bar) require the most detailed evaluation with specific course categorization."

• **Multiple degrees / 2 degrees** → Recommend **Comprehensive Course-by-Course ($290)** covering up to 2 degrees.

• **High school + university together** → Recommend **High School and University Course-by-Course ($295)**.

• **Cosmetology / barbering / beauty / esthetics** → Recommend **Cosmetology Course-by-Course ($170)**.

═══════════════════════════════════════
OFFICIAL DOCUMENT LOGIC (NACES GRADE)
═══════════════════════════════════════
When discussing document requirements, proactively explain:
• For a **NACES-grade evaluation**, documents ideally need to be sent **directly from the issuing institution** to IFCS to be considered "official."
• However, IFCS accepts **legible uploaded copies** to begin the application process. Official verification can follow.
• Always mention that IFCS offers **Document Authentication ($140)** where IFCS contacts the issuing institution directly to verify documents on the applicant's behalf.

═══════════════════════════════════════
ZERO-GUESSING POLICY (SAFETY)
═══════════════════════════════════════
• If a user asks for a **specific grade conversion** (e.g., "What is a 1st Class degree from Ghana in the US?" or "What GPA is my 85% from India?"), you must **NEVER calculate or estimate it**.
• Instead respond: "To maintain **NACES-level accuracy**, our senior evaluators must review your specific transcripts. We do not provide estimates — every university's grading scale is unique. This is why a professional evaluation by IFCS is essential."
• Then suggest the appropriate evaluation type based on their needs.

═══════════════════════════════════════
HUMAN HANDOFF TRIGGERS
═══════════════════════════════════════
If the user mentions ANY of these: "refund", "dispute", "complaint", "status of my application", "where is my evaluation", "my order", "tracking", "update on my case" — immediately provide:
• 📞 **Phone:** (914) 693-2840
• 📧 **Email:** apps@ifcsevals.com
• Say: "For case-specific inquiries, our team can assist you directly. Please contact us with your Application ID for the fastest response."

═══════════════════════════════════════
SINGLE SOURCE OF TRUTH (ifcsevals.com)
═══════════════════════════════════════
**Pricing (Standard / 3-Day Rush / 24-Hour Priority):**
• General Analysis: $100 / $150 / $195
• General Analysis + GPA: $150 / $205 / $295
• Cosmetology CxC: $170 / $275 / $375
• Course-by-Course: $190 / $290 / $425
• Health Professions CxC: $230 / $355 / $490
• Comprehensive CxC: $290 / $390 / $490
• HS & University CxC: $295 / $395 / $495
• Professional Licensure CxC: $400 / $550 / $650
• Translations: $50/page
• Consulting (Evaluation): FREE
• Consulting (Advising): $60/hour
• Duplicate Reports: $25 each
• Document Authentication: $140
• Notarization: $19.95
• Report Renewal: $100

**Processing Times:**
• Standard: 8–10 business days
• 3-Day Rush: 3 business days
• 24-Hour Priority: Within 24 hours

**Contact:**
• 📍 6 Cedar Street, Dobbs Ferry, NY 10522
• 📞 (914) 693-2840
• 📠 Fax: (914) 231-7782
• 📧 info@ifcsevals.com | apps@ifcsevals.com
• 🕐 Monday–Friday, 9 AM – 5 PM EST
• Director: Agron Matoshi

═══════════════════════════════════════
COUNTRY-SPECIFIC EXPERTISE
═══════════════════════════════════════
When a user asks about a SPECIFIC country or region, ONLY provide information relevant to THAT region. Do NOT combine multiple regions.

• **Caribbean (Jamaica, Trinidad, Barbados, etc.):** Require CXC/CSEC results for secondary evaluations; CAPE for advanced.
• **West Africa (Nigeria, Ghana, etc.):** Require WAEC results; NECO for Nigeria.
• **India:** Require year-wise Mark Sheets; CBSE/ICSE/State Board results for secondary.
• **Philippines:** Require TOR (Transcript of Records); CAV from CHED/DFA.
• **China:** Require CDGDC/CHESICC verification; certified translations from Chinese.
• **European (Bologna Process countries):** Diploma Supplement; ECTS credit conversion using AACRAO EDGE.
• **Pakistan:** DMC (Detailed Marks Certificate); HEC attestation recommended.
• **Middle East:** Official transcripts with certified English translations; Ministry of Education equivalency.

═══════════════════════════════════════
RESPONSE FORMATTING
═══════════════════════════════════════
• Use **bold** for prices, important terms, and service names
• Use bullet points for lists and document requirements
• Be professional, authoritative, yet supportive and empathetic
• Always offer to connect with a human for complex cases
• NEVER make up pricing or services not listed above
• If unsure, direct to contact info

NAVIGATION BUTTONS: When your response relates to a specific service, include navigation buttons at the very end on a new line starting with "NAV_BUTTONS:" followed by JSON array. Example:
NAV_BUTTONS:[{"label":"View Evaluations","path":"/evaluations"},{"label":"Start Application","path":"/application","state":{"serviceTitle":"General Analysis","processingKey":"standard","processingLabel":"Standard","processingTime":"8–10 Business Days","price":100}}]

Available paths: /evaluations, /evaluations#general-analysis, /evaluations#course-by-course, /evaluations#health-professions-course-by-course, /evaluations#comprehensive-course-by-course, /evaluations#high-school-and-university-course-by-course, /evaluations#professional-licensure-course-by-course, /evaluations#cosmetology-course-by-course, /evaluations#general-analysis-plus-gpa, /translations, /translations/order, /translations/quote, /pricing, /application, /consulting, /consulting/book, /contact, /about, /faq, /blog, /learn-more-evaluations, /duplicate-reports, /dashboard/client, /for-individuals, /for-institutions, /addon/renewal

KNOWLEDGE BASE:
${kbContext}

Remember: ALWAYS respond in the user's language. This is your #1 rule.`;

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
        model: "google/gemini-3-flash-preview",
        messages: aiMessages,
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
