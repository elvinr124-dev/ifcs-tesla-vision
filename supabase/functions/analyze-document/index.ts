import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// NOTE: This function previously used AI to analyze documents and count words.
// To eliminate AI credit usage, it now returns safe defaults so the client-side
// flow keeps working. Blur detection is handled locally by DocumentScanner.tsx
// (Laplacian variance). Word counts are entered manually by staff during review.
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { extractReference } = await req.json().catch(() => ({}));

    if (extractReference) {
      return new Response(JSON.stringify({ referenceNumber: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        wordCount: 0,
        hasFormattedBoxes: false,
        isBlurry: false,
        isBirthCertificate: false,
        isDoublePage: false,
        documentType: "Document (manual review)",
        manualReview: true,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
