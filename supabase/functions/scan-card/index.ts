import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: "You are a credit card OCR assistant. Extract card details from the image. For the front: extract cardholder name, card number, expiry month, expiry year. For the back: extract the CVV/CVC code. Use the extract_card tool to return results."
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Extract the credit card information from this image." },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
            ]
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_card",
              description: "Return extracted credit card details.",
              parameters: {
                type: "object",
                properties: {
                  cardHolder: { type: "string", description: "Name on the card (empty if back of card)" },
                  cardNumber: { type: "string", description: "Card number with spaces (empty if back of card)" },
                  expMonth: { type: "string", description: "2-digit expiry month (empty if back of card)" },
                  expYear: { type: "string", description: "4-digit expiry year (empty if back of card)" },
                  cvv: { type: "string", description: "3 or 4 digit CVV/CVC code from back of card (empty if front of card)" },
                },
                required: ["cardHolder", "cardNumber", "expMonth", "expYear"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_card" } },
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Card scan failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall?.function?.arguments) {
      const card = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(card), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Could not read card" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("scan-card error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
