import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ToolResult {
  toolName: string;
  currentPlan: string;
  currentSpend: number;
  recommendedAction: string;
  recommendedPlan?: string;
  projectedSpend: number;
  monthlySavings: number;
  reason: string;
  severity: string;
  alternativeTool?: string;
  credexOpportunity?: boolean;
}

const SEVERITY_STYLES: Record<string, { bg: string; border: string; text: string; label: string }> = {
  high: { bg: "#fef2f2", border: "#fecaca", text: "#dc2626", label: "Overspending" },
  medium: { bg: "#fffbeb", border: "#fde68a", text: "#d97706", label: "Can optimize" },
  low: { bg: "#eff6ff", border: "#bfdbfe", text: "#2563eb", label: "Consider" },
  optimal: { bg: "#f0fdf4", border: "#bbf7d0", text: "#16a34a", label: "Optimal" },
};

function renderToolRow(r: ToolResult): string {
  const s = SEVERITY_STYLES[r.severity] || SEVERITY_STYLES.optimal;
  const savingsBlock = r.monthlySavings > 0
    ? `<td style="text-align:right;vertical-align:top;padding:12px 0;">
        <span style="font-weight:700;font-size:18px;color:#059669;">-$${r.monthlySavings.toFixed(0)}/mo</span><br/>
        <span style="font-size:12px;color:#9ca3af;">$${(r.monthlySavings * 12).toFixed(0)}/yr</span>
       </td>`
    : `<td style="text-align:right;vertical-align:top;padding:12px 0;">
        <span style="font-size:13px;color:#16a34a;font-weight:600;">Optimal</span>
       </td>`;

  const altLine = r.alternativeTool
    ? `<div style="margin-top:6px;font-size:12px;color:#2563eb;">Consider: ${r.alternativeTool}</div>`
    : "";

  return `
  <tr>
    <td colspan="2" style="padding:0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:12px;">
        <tr>
          <td style="vertical-align:top;padding:16px 16px 8px;">
            <span style="font-weight:600;font-size:15px;color:#111;">${r.toolName}</span>
            <span style="display:inline-block;margin-left:8px;font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px;background:${s.bg};color:${s.text};border:1px solid ${s.border};">${s.label}</span>
            <div style="font-size:13px;color:#6b7280;margin-top:4px;">Current: ${r.currentPlan} | $${r.currentSpend.toFixed(0)}/mo</div>
          </td>
          ${savingsBlock}
        </tr>
        <tr>
          <td colspan="2" style="padding:0 16px 16px;">
            <div style="background:#f9fafb;border-radius:8px;padding:10px 14px;">
              <div style="font-size:13px;font-weight:600;color:#1f2937;margin-bottom:4px;">${r.recommendedAction}</div>
              <div style="font-size:12px;color:#6b7280;line-height:1.5;">${r.reason}</div>
              ${altLine}
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const {
      email, auditId, totalMonthlySavings, isHighSavings,
      aiSummary, results, teamSize, useCase,
    } = await req.json();

    const resendKey = Deno.env.get("RESEND_API_KEY");

    if (!resendKey) {
      console.error("No Resend API key configured - cannot send email");
      return new Response(
        JSON.stringify({ sent: false, error: "Email service not configured" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const origin = new URL(req.url).origin;
    const shareUrl = `${origin}/audit/${auditId}`;
    const monthly = Number(totalMonthlySavings) || 0;
    const annual = monthly * 12;
    const isOptimal = monthly < 100;
    const toolResults: ToolResult[] = Array.isArray(results) ? results : [];

    // Savings hero
    const savingsHero = isOptimal
      ? `<div style="background:#059669;border-radius:16px;padding:32px 24px;text-align:center;margin-bottom:24px;">
          <div style="font-size:48px;margin-bottom:12px;">✓</div>
          <h2 style="color:white;font-size:22px;font-weight:700;margin:0 0 8px;">You're spending well</h2>
          <p style="color:#d1fae5;font-size:14px;margin:0;">Your AI stack looks appropriately sized for your team.</p>
        </div>`
      : `<div style="background:#111827;border-radius:16px;padding:32px 24px;text-align:center;margin-bottom:24px;">
          <p style="color:#9ca3af;font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 12px;">Potential savings identified</p>
          <div style="margin-bottom:4px;">
            <span style="font-size:48px;font-weight:700;color:#34d399;">$${monthly.toFixed(0)}</span>
            <span style="font-size:18px;color:#9ca3af;">/month</span>
          </div>
          <p style="color:white;font-size:20px;font-weight:600;margin:0;">$${annual.toFixed(0)}<span style="color:#9ca3af;font-weight:400;font-size:15px;"> /year</span></p>
        </div>`;

    // AI summary
    const summaryBlock = aiSummary
      ? `<div style="background:white;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:24px;">
          <div style="display:table;margin-bottom:12px;">
            <div style="display:table-cell;vertical-align:middle;padding-right:10px;">
              <div style="width:24px;height:24px;background:#111827;border-radius:4px;display:inline-block;font-size:11px;color:white;font-weight:700;line-height:24px;text-align:center;">A</div>
            </div>
            <div style="display:table-cell;vertical-align:middle;">
              <span style="font-size:13px;font-weight:600;color:#111827;">Personalized analysis</span>
            </div>
          </div>
          <p style="font-size:14px;color:#4b5563;line-height:1.6;margin:0;">${aiSummary}</p>
        </div>`
      : "";

    // Tool breakdown
    const toolRows = toolResults.map(renderToolRow).join("");
    const toolSection = toolResults.length > 0
      ? `<h3 style="font-size:16px;font-weight:700;color:#111;margin:0 0 16px;">Per-tool breakdown</h3>
         <table width="100%" cellpadding="0" cellspacing="0">${toolRows}</table>`
      : "";

    // Credex block
    const credexBlock = isHighSavings
      ? `<div style="background:linear-gradient(135deg,#059669,#0d9488);border-radius:12px;padding:20px;margin-top:24px;">
          <h3 style="color:white;font-size:16px;font-weight:700;margin:0 0 8px;">Get the same tools, cheaper</h3>
          <p style="color:#d1fae5;font-size:13px;line-height:1.5;margin:0 0 16px;">
            Credex sources pre-purchased AI credits at 20-35% below retail. With $${monthly.toFixed(0)}/month at stake, it's worth a 15-minute conversation.
          </p>
          <a href="https://credex.rocks" style="display:inline-block;background:white;color:#059669;font-weight:600;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:13px;">
            Book a free Credex consultation &rarr;
          </a>
        </div>`
      : "";

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111;background:#f9fafb;margin:0;padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Logo -->
          <tr>
            <td style="padding-bottom:24px;">
              <table cellpadding="0" cellspacing="0" style="display:inline-table;">
                <tr>
                  <td style="vertical-align:middle;padding-right:8px;">
                    <div style="width:28px;height:28px;background:#059669;border-radius:6px;display:inline-block;font-size:14px;color:white;font-weight:700;line-height:28px;text-align:center;">S</div>
                  </td>
                  <td style="vertical-align:middle;font-weight:700;font-size:16px;color:#111;">SpendLens</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td>
              <h1 style="font-size:22px;font-weight:700;margin:0 0 4px;color:#111;">Your AI Spend Audit Report</h1>
              <p style="font-size:13px;color:#6b7280;margin:0 0 24px;">${useCase} team | ${teamSize} ${teamSize === 1 ? 'person' : 'people'}</p>
            </td>
          </tr>

          <!-- Savings hero -->
          <tr><td>${savingsHero}</td></tr>

          <!-- AI summary -->
          <tr><td>${summaryBlock}</td></tr>

          <!-- Tool breakdown -->
          <tr><td>${toolSection}</td></tr>

          <!-- Credex -->
          <tr><td>${credexBlock}</td></tr>

          <!-- View online + share -->
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <a href="${shareUrl}" style="display:inline-block;background:#059669;color:white;font-weight:600;padding:12px 28px;border-radius:10px;text-decoration:none;font-size:14px;margin-bottom:16px;">
                View your full audit online &rarr;
              </a>
              <p style="font-size:12px;color:#9ca3af;margin:8px 0 0;">
                Share with your team: <a href="${shareUrl}" style="color:#059669;">${shareUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:28px;">
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 16px;" />
              <p style="color:#9ca3af;font-size:11px;margin:0;">
                Sent by SpendLens, a free tool by Credex. You're receiving this because you requested your audit report.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "SpendLens <onboarding@resend.dev>",
        to: [email],
        subject: monthly > 0
          ? `Your audit: $${monthly.toFixed(0)}/mo in savings identified`
          : "Your SpendLens audit report",
        html,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("Resend error:", resp.status, errText);
      return new Response(
        JSON.stringify({ sent: false, error: "Email delivery failed", details: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ sent: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("send-confirmation error:", err);
    return new Response(
      JSON.stringify({ sent: false, error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
