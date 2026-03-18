import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code } = await req.json();

    if (!RESEND_API_KEY) {
      console.log(`[DEV MODE] Reset code for ${email}: ${code}`);
      return new Response(JSON.stringify({ success: true, dev: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "IFCS <noreply@ifcsevals.com>",
        to: [email],
        subject: "Your IFCS Password Reset Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
            <h2 style="color: #111;">Password Reset Code</h2>
            <p style="color: #555;">You requested a password reset for your IFCS account. Use the code below:</p>
            <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111;">${code}</span>
            </div>
            <p style="color: #555; font-size: 13px;">This code expires in 15 minutes. If you didn't request this, please ignore this email.</p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">— IFCS Team</p>
          </div>
        `,
      }),
    });

    const data = await res.json();
    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
