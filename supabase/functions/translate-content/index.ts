import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { texts, targetLanguage, targetLanguageName } = await req.json();

    if (!texts || !Array.isArray(texts) || texts.length === 0 || !targetLanguage) {
      return new Response(JSON.stringify({ error: "Missing texts or targetLanguage" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build a numbered list for the AI to translate
    const numberedTexts = texts.map((t: string, i: number) => `${i + 1}. ${t}`).join("\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: `You are a professional translator. Translate the following numbered texts from English to ${targetLanguageName} (${targetLanguage}). Keep the same numbering. Only output the translations, one per line, with the number prefix. Keep proper nouns, brand names (IFCS, TFCS), URLs, email addresses, and phone numbers unchanged. Keep formatting symbols like $ and % unchanged. Be natural and fluent.`,
          },
          {
            role: "user",
            content: numberedTexts,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI translation failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse numbered translations
    const lines = content.split("\n").filter((l: string) => l.trim());
    const translations: string[] = [];
    
    for (let i = 0; i < texts.length; i++) {
      const pattern = new RegExp(`^${i + 1}\\.\\s*(.+)$`);
      const match = lines.find((l: string) => pattern.test(l));
      if (match) {
        translations.push(match.replace(pattern, "$1").trim());
      } else if (lines[i]) {
        // Fallback: use line by position, strip any numbering
        translations.push(lines[i].replace(/^\d+\.\s*/, "").trim());
      } else {
        translations.push(texts[i]); // fallback to original
      }
    }

    return new Response(JSON.stringify({ translations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("translate-content error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
