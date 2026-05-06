import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// AI-based card OCR has been disabled to avoid using AI integration credits.
// The Payment page falls back to manual entry when scanning is unavailable.
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  return new Response(
    JSON.stringify({ disabled: true, message: "Card scanning disabled — please enter details manually." }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
