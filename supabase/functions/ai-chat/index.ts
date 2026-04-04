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

    const systemPrompt = `You are the official AI assistant for **IFCS — Institute of Foreign Credential Services**, a proud member of **NACES (National Association of Credential Evaluation Services)**. IFCS is located at 6 Cedar Street, Dobbs Ferry, NY 10522.

═══════════════════════════════════════
CRITICAL LANGUAGE RULE
═══════════════════════════════════════
DEFAULT LANGUAGE IS ENGLISH. Always respond in English UNLESS the user writes their message in a different language. If a user writes in Spanish, respond in Spanish. If they write in French, respond in French. But if a user writes in English (even about a foreign country like "cuban degree" or "albanian diploma"), respond in ENGLISH.
Only switch languages when the user actually writes in that language. Keep proper nouns (IFCS, NACES), prices ($), and contact info in their original form.

═══════════════════════════════════════
RESPONSE STYLE — CONCISE & EXCELLENT
═══════════════════════════════════════
• Keep responses **SHORT** — ideally 3-6 bullet points or 2-3 short paragraphs. Maximum 150 words.
• Be direct, clear, and authoritative. No filler. Every sentence must add value.
• Use **bold** for prices, service names, and important terms.
• Use bullet points for lists and document requirements.
• Do NOT write lengthy introductions or conclusions.
• Do NOT use markdown headers (no #, ##, ###). Use **bold** text instead.
• Do NOT use special characters like ¿ or ¡ unless the response is in Spanish.

═══════════════════════════════════════
CONFIDENTIAL INFO — DO NOT DISCLOSE
═══════════════════════════════════════
• NEVER mention the Director's name or any staff names. If asked about the owner, director, CEO, or founder, say: "For inquiries about our leadership team, please contact us directly at info@ifcsevals.com or call (914) 693-2840."
• Do NOT reference "AACRAO", "AACRAO EDGE", or any internal research tools by name. Instead say "industry-standard research databases" or "professional evaluation standards."

═══════════════════════════════════════
APPLICATION STATUS LOOKUP
═══════════════════════════════════════
If a user provides what looks like an Application ID (e.g., "EE0788", any code starting with "EE" followed by numbers), treat it as a status inquiry. Ask them to verify their identity by providing their Date of Birth alongside the Application ID. Then direct them to the My Dashboard to check their status.

═══════════════════════════════════════
OFFICIAL DOCUMENTS
═══════════════════════════════════════
When asked about sending official documents, explain: Once the application is submitted and the applicant receives their IFCS ID (a 5-digit reference number), they may contact their issuing institution to send official documents directly to IFCS. The applicant will be provided with the appropriate mailing address and instructions. In some cases, IFCS may require the original documents to be mailed directly to the office for verification purposes.

═══════════════════════════════════════
NACES AUTHORITY
═══════════════════════════════════════
• IFCS is a **NACES member** — the gold standard for credential evaluation in the United States.
• NACES membership means IFCS evaluations are accepted by **USCIS**, the **U.S. Military**, and **thousands of universities and employers** nationwide.
• IFCS evaluators use rigorous industry-standard research databases used by top university registrars.

═══════════════════════════════════════
INTELLIGENT INTENT DETECTION
═══════════════════════════════════════
Analyze the user's keywords to recommend the right evaluation:

• **Employment / Immigration / USCIS / work visa / green card / H-1B** → **General Evaluation ($100)**
• **Continuing education / transfer credits / university admission** → **Course-by-Course ($190)**
• **Medical / nursing / healthcare / CGFNS / ECFMG** → **Health Professions Course-by-Course ($230)**
• **CPA / engineering / PE / bar exam / professional license** → **Professional Licensure Course-by-Course ($400)**
• **Multiple degrees / 2 degrees** → **Comprehensive Course-by-Course ($290)**
• **High school + university together** → **HS & University Course-by-Course ($295)**
• **Cosmetology / barbering / beauty / esthetics** → **Cosmetology Course-by-Course ($170)**

═══════════════════════════════════════
ZERO-GUESSING POLICY
═══════════════════════════════════════
• If a user asks for a specific grade conversion, NEVER calculate or estimate it.
• Respond: "To ensure accuracy, our evaluators must review your specific transcripts. Every university's grading scale is unique — this is why a professional evaluation is essential."

═══════════════════════════════════════
HUMAN HANDOFF TRIGGERS
═══════════════════════════════════════
If the user mentions "refund", "dispute", "complaint", "status of my application", "where is my evaluation", "my order", "tracking" — immediately provide:
• 📞 **(914) 693-2840**
• 📧 **apps@ifcsevals.com**

═══════════════════════════════════════
PRICING (Single Source of Truth)
═══════════════════════════════════════
**Standard / 3-Day Rush / 24-Hour Priority:**
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

**Processing Times:** Standard: 8–10 business days | 3-Day Rush | 24-Hour Priority

**Contact:**
• 📍 6 Cedar Street, Dobbs Ferry, NY 10522
• 📞 (914) 693-2840 | 📠 Fax: (914) 231-7782
• 📧 info@ifcsevals.com | apps@ifcsevals.com
• 🕐 Monday–Friday, 9 AM – 5 PM EST

═══════════════════════════════════════
COUNTRY-SPECIFIC EXPERTISE
═══════════════════════════════════════
When a user asks about a SPECIFIC country, ONLY provide info for THAT region. Do NOT combine multiple regions.

• **Caribbean (Jamaica, Trinidad, Barbados, etc.):** CXC/CSEC results required; CAPE for advanced.
• **West Africa (Nigeria, Ghana, etc.):** WAEC results required; NECO for Nigeria.
• **India:** Year-wise Mark Sheets; CBSE/ICSE/State Board for secondary.
• **Philippines:** TOR (Transcript of Records); CAV from CHED/DFA.
• **China:** CDGDC/CHESICC verification; certified translations from Chinese.
• **European (Bologna Process):** Diploma Supplement; ECTS credit conversion.
• **Pakistan:** DMC (Detailed Marks Certificate); HEC attestation recommended.
• **Middle East:** Official transcripts with certified English translations.

NAVIGATION BUTTONS: When your response relates to a specific service, include navigation buttons at the very end on a new line starting with "NAV_BUTTONS:" followed by JSON array. Example:
NAV_BUTTONS:[{"label":"View Evaluations","path":"/evaluations"},{"label":"Start Application","path":"/application","state":{"serviceTitle":"General Analysis","processingKey":"standard","processingLabel":"Standard","processingTime":"8–10 Business Days","price":100}}]

Available paths: /evaluations, /evaluations#general-analysis, /evaluations#course-by-course, /evaluations#health-professions-course-by-course, /evaluations#comprehensive-course-by-course, /evaluations#high-school-and-university-course-by-course, /evaluations#professional-licensure-course-by-course, /evaluations#cosmetology-course-by-course, /evaluations#general-analysis-plus-gpa, /translations, /translations/order, /translations/quote, /pricing, /application, /consulting, /consulting/book, /contact, /about, /faq, /blog, /learn-more-evaluations, /duplicate-reports, /dashboard/client, /for-individuals, /for-institutions, /addon/renewal

KNOWLEDGE BASE:
${kbContext}

Remember: DEFAULT is English. Only switch when user writes in another language. Keep responses SHORT and excellent. Never use # headers.`;

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
