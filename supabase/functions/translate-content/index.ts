import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// MyMemory free translation API — no API key required, no AI credits used.
// Limits: ~5000 words/day per IP (more than enough for UI strings, especially with caching).
async function translateOne(text: string, target: string): Promise<string> {
  if (!text || !text.trim()) return text;
  // Skip translating things that look like URLs, emails, phone numbers, or pure numbers
  if (/^[\s\d$%.,()\-+/]+$/.test(text)) return text;
  if (/@|https?:\/\//.test(text) && text.length < 60) return text;

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${encodeURIComponent(target)}`;
    const res = await fetch(url, { headers: { "User-Agent": "IFCS-Translate/1.0" } });
    if (!res.ok) return text;
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    if (typeof translated === "string" && translated.trim() && !/^MYMEMORY WARNING/i.test(translated)) {
      // Decode HTML entities the API sometimes returns
      return translated
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");
    }
    return text;
  } catch {
    return text;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { texts, targetLanguage } = await req.json();

    if (!texts || !Array.isArray(texts) || texts.length === 0 || !targetLanguage) {
      return new Response(JSON.stringify({ error: "Missing texts or targetLanguage" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Run with limited concurrency to be polite to the free API
    const CONCURRENCY = 5;
    const translations: string[] = new Array(texts.length).fill("");
    let cursor = 0;

    async function worker() {
      while (cursor < texts.length) {
        const i = cursor++;
        translations[i] = await translateOne(texts[i], targetLanguage);
      }
    }

    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, texts.length) }, worker));

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
