import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipientEmail, applicantName, referenceId, evaluationType, accessToken, isEdu } = await req.json();

    // Build the access URL - use the project's preview URL
    const siteUrl = req.headers.get("origin") || "https://tfcs.lovable.app";
    const accessUrl = `${siteUrl}/transcript?token=${accessToken}`;

    let subject: string;
    let html: string;

    if (isEdu) {
      // Parchment-style email for .edu recipients
      subject = `You've received a Transcript`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1a6b8a; padding: 20px; text-align: center;">
            <h1 style="color: white; font-size: 20px; margin: 0;">You've received a Transcript</h1>
          </div>
          <div style="padding: 30px; background: white;">
            <p style="color: #333; line-height: 1.6;">
              <strong>Institute of Foreign Credential Services (IFCS)</strong> has sent you a Credential Evaluation 
              with the Delivery ID (DID) <strong>${referenceId}</strong> on behalf of <strong>${applicantName}</strong>. 
              This document is available for you to download for 30 days, so your prompt attention is requested. 
              The requestor of this document will receive an email notification once you access the Transcript.
            </p>
            <a href="${accessUrl}" style="display: block; background: #2e7d32; color: white; text-align: center; padding: 14px 28px; border-radius: 4px; text-decoration: none; font-weight: bold; margin: 24px 0;">
              Access the Transcript
            </a>
            <p style="color: #666; font-size: 13px; line-height: 1.5;">
              If the button above does not work, copy and paste the following URL in a browser window:<br/>
              <a href="${accessUrl}" style="color: #1a6b8a; word-break: break-all;">${accessUrl}</a>
            </p>
            <p style="color: #333; margin-top: 24px;">
              Thank you,<br/>
              <strong>The IFCS Team</strong>
            </p>
            <p style="color: #333; font-weight: bold; font-size: 13px;">Turn Credentials into Opportunities</p>
          </div>
          <div style="background: #f5f5f5; padding: 16px; text-align: center; border-top: 1px solid #ddd;">
            <p style="color: #999; font-size: 11px; margin: 0;">
              Please do not respond to this message. This notification has been sent to you by IFCS on behalf of the Requestor noted above.
            </p>
          </div>
        </div>
      `;
    } else {
      // Notification email for regular clients
      subject = `Your IFCS Evaluation Report is Ready`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #111;">Your Report is Ready</h2>
          <p style="color: #555; line-height: 1.6;">
            Hi ${applicantName},<br/><br/>
            Your <strong>${evaluationType}</strong> evaluation report (Reference #${referenceId}) is now ready. 
            Please log in to your IFCS dashboard to view and download your report.
          </p>
          <a href="${siteUrl}/dashboard/client" style="display: inline-block; background: #2563eb; color: white; padding: 12px 32px; border-radius: 24px; text-decoration: none; font-weight: bold; margin: 20px 0;">
            Go to My Dashboard
          </a>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">— IFCS Team</p>
        </div>
      `;
    }

    if (!RESEND_API_KEY) {
      console.log(`[DEV MODE] Would send email to ${recipientEmail}: ${subject}`);
      console.log(`Access URL: ${accessUrl}`);
      return new Response(JSON.stringify({ success: true, dev: true, accessUrl }), {
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
        to: [recipientEmail],
        subject,
        html,
      }),
    });

    const data = await res.json();
    return new Response(JSON.stringify({ success: true, data, accessUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
