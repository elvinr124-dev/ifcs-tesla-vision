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

    // ACTION: suggest-keywords - AI suggests keywords for a knowledge entry
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
      // Extract JSON array from response
      const match = content.match(/\[[\s\S]*\]/);
      const keywords = match ? JSON.parse(match[0]) : [];

      return new Response(JSON.stringify({ keywords }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: enhance-response - AI enhances a knowledge base response with credential info
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
              content: `You are an expert in international credential evaluation for IFCS (Institute of Foreign Credential Services). Given a knowledge base entry's title and draft response, enhance and expand the response with accurate, detailed information about the country's education system, required documents, credential types, and any specific evaluation considerations. Use information consistent with AACRAO (American Association of Collegiate Registrars and Admissions Officers) standards. Keep IFCS branding and pricing. Use **bold** for emphasis and bullet points for lists. Keep the response informative but concise (under 300 words).`,
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

    // ACTION: chat - Main chat with multilingual support
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Missing messages" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build the knowledge base context for the AI
    const kbContext = (knowledgeBase || []).map((entry: any, i: number) =>
      `[Entry ${i + 1}]\nKeywords: ${entry.keywords.join(", ")}\nResponse: ${entry.response}\nNav Buttons: ${JSON.stringify(entry.navButtons || [])}`
    ).join("\n\n");

    const systemPrompt = `You are the official AI assistant for **IFCS — Institute of Foreign Credential Services**, located at 6 Cedar Street, Dobbs Ferry, NY 10522. The Director is **Agron Matoshi**.

CRITICAL LANGUAGE RULE: You MUST detect the language of the user's message and respond ENTIRELY in that same language. If the user writes in Spanish, respond in Spanish. If they write in French, respond in French. If they write in Arabic, respond in Arabic. Always match the user's language exactly. Keep proper nouns (IFCS, AACRAO, NAFSA, etc.), prices ($), and contact info in their original form.

Your role:
- Answer questions about IFCS services using the knowledge base below
- Be professional, authoritative, yet supportive and empathetic
- Use **bold** for prices and important info, bullet points for lists
- Always offer to let the user speak to a human via email (info@ifcsevals.com) or phone (914-693-2840) for complex cases
- If you know about a specific evaluation type or country's requirements, provide detailed info
- For country-specific questions, include required documents, credential types, and any special requirements (e.g., CXC for Caribbean, WAEC for West Africa, mark sheets for India, CDGDC for China)
- Use AACRAO standards for education system information
- NEVER make up pricing or services not in the knowledge base
- If unsure, direct to contact info

NAVIGATION BUTTONS: When your response relates to a specific service, include navigation buttons in your response. Format them as a JSON array at the very end of your response on a new line starting with "NAV_BUTTONS:" followed by the JSON. Example:
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
        model: "google/gemini-2.5-flash",
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

    // Extract nav buttons if present
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
