import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { input, auditResult } = await req.json();
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");

    if (!anthropicKey) {
      console.log("No Anthropic API key configured - returning null for graceful fallback");
      return new Response(
        JSON.stringify({ summary: null }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const toolSummary = (input.tools as Array<{ toolId: string; plan: string; seats: number; monthlySpend: number }>)
      .map((t) => `${t.toolId} (${t.plan}, ${t.seats} seats, $${t.monthlySpend}/mo)`)
      .join(", ");

    const highPriority = (auditResult.recommendations as Array<{ severity: string; toolName: string; recommendedAction: string; monthlySavings: number }>)
      .filter((r) => r.severity === "high")
      .map((r) => `${r.toolName}: ${r.recommendedAction} (saves $${r.monthlySavings.toFixed(0)}/mo)`)
      .join("; ");

    const prompt = `You are an AI spend analyst writing a brief, direct audit summary for a startup team. Be specific, use numbers, and avoid filler phrases.

Team: ${input.teamSize} people, primary use case: ${input.useCase}
Tools: ${toolSummary}
Total monthly savings identified: $${auditResult.totalMonthlySavings.toFixed(0)}/mo
High-priority actions: ${highPriority || "None — stack is well-optimized"}

Write a ~100-word paragraph summarizing this team's AI spend situation. Be honest: if their spending is optimal, say so. If there are savings, name the top actions concretely. Mention the annual impact. Do not say "I" or "we". Do not use bullet points. Output only the paragraph, no preamble.`;

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 200,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("Anthropic API error:", resp.status, errText);
      return new Response(
        JSON.stringify({ summary: null }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await resp.json();
    const summary = data.content?.[0]?.text ?? null;

    return new Response(
      JSON.stringify({ summary }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("generate-summary error:", err);
    return new Response(
      JSON.stringify({ summary: null }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
