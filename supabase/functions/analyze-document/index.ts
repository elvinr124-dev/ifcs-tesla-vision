import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64, fileName } = await req.json();
    
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
            content: `You are a document analysis AI for a certified translation service. Analyze the uploaded document image and return structured data.

Your job:
1. Count ALL translatable elements: words, numbers, stamps, signatures, coat of arms, seals, headers, footers, dates, names, addresses. Everything that needs translation counts as a "word".
2. Detect if the document contains 5 or more formatted box/table cells per page. A "box" is any bordered cell in a table or form field with content.
3. Detect if the image is blurry or unclear (low quality, out of focus, too dark, unreadable text).
4. Detect if this is a birth certificate.
5. Detect if this is a double page (two pages displayed side-by-side on a single sheet).

You MUST respond using the analyze_document tool.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this document image (filename: ${fileName}). Count all translatable elements including words, numbers, stamps, signatures, coat of arms, seals, and any other elements that would need to be translated or reproduced. Determine if it has 5+ formatted boxes/table cells, if it's blurry, if it's a birth certificate, and if it's a double page.`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_document",
              description: "Return the analysis results for the uploaded document.",
              parameters: {
                type: "object",
                properties: {
                  wordCount: {
                    type: "number",
                    description: "Total count of all translatable elements (words, numbers, stamps, signatures, seals, coat of arms, dates, etc.)"
                  },
                  hasFormattedBoxes: {
                    type: "boolean",
                    description: "True if the document has 5 or more formatted box/table cells on this page"
                  },
                  isBlurry: {
                    type: "boolean",
                    description: "True if the image is blurry, unclear, too dark, or has unreadable text"
                  },
                  isBirthCertificate: {
                    type: "boolean",
                    description: "True if the document appears to be a birth certificate"
                  },
                  isDoublePage: {
                    type: "boolean",
                    description: "True if two pages are displayed side-by-side on a single sheet"
                  },
                  documentType: {
                    type: "string",
                    description: "Brief description of the document type (e.g., 'Birth Certificate', 'Academic Transcript', 'Legal Contract')"
                  },
                  blurryReason: {
                    type: "string",
                    description: "If blurry, explain why (e.g., 'Image is out of focus', 'Text is too small to read')"
                  }
                },
                required: ["wordCount", "hasFormattedBoxes", "isBlurry", "isBirthCertificate", "isDoublePage", "documentType"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_document" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Service busy, please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const analysis = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(analysis), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Could not analyze document" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-document error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
