# AI Summary Prompts

## Claude Haiku Prompt (generate-summary edge function)

### Reasoning
The prompt is designed to be **specific, concise, and action-oriented**. It avoids vague LLM hedging ("it depends," "consider," "might") in favor of definitive analysis grounded in numbers. The tone matches the SpendLens brand: direct, finance-literate, and respectful of user time.

### Final Prompt (Used)
```
You are an AI spend analyst writing a brief, direct audit summary for a startup team. Be specific, use numbers, and avoid filler phrases.

Team: {teamSize} people, primary use case: {useCase}
Tools: {toolSummary}
Total monthly savings identified: ${totalMonthlySavings}/mo
High-priority actions: {highPriority}

Write a ~100-word paragraph summarizing this team's AI spend situation. Be honest: if their spending is optimal, say so. If there are savings, name the top actions concretely. Mention the annual impact. Do not say "I" or "we". Do not use bullet points. Output only the paragraph, no preamble.
```

### Why This Works
- **Specificity**: Provides exact team context (size, use case, actual tools)
- **Grounding**: References concrete savings numbers, not hypotheticals
- **Directness**: "Be honest... Be specific... Output only the paragraph" prevents rambling
- **No filler**: Explicitly forbids "I" and bullet points — forces clarity
- **Brevity constraint**: ~100 words matches display real estate in the UI

### What We Tried That Didn't Work
1. **Longer, more conversational prompts**: Led to "Consider evaluating..." language that sounds weak. Users want confidence.
2. **Asking the LLM to "suggest" alternatives**: Generated unnecessary cross-sell noise. We stick to hardcoded audit logic instead.
3. **Removing the "be honest" clause**: Model defaulted to fake enthusiasm for non-optimal stacks. Adding this fixed it.
4. **No word limit**: Output ballooned to 200+ words. Adding "~100-word" kept it tight.

## Fallback Summary (Local Generation)
When the Anthropic API is unavailable or has no key configured, the frontend generates this template:

```typescript
function generateFallbackSummary(input: AuditInput, result: AuditResult): string {
  const toolNames = input.tools.map(t => TOOL_MAP[t.toolId]?.name ?? t.toolId).join(', ');
  const savingsText = result.totalMonthlySavings > 0
    ? `Your stack could save $${result.totalMonthlySavings.toFixed(0)}/month ($${result.totalAnnualSavings.toFixed(0)}/year) with the right adjustments.`
    : "Your current AI spend is well-optimized for your team's size and use case.";
  const highPri = result.recommendations.filter(r => r.severity === 'high');
  const topAction = highPri.length > 0
    ? ` The highest-priority action is: ${highPri[0].recommendedAction} on ${highPri[0].toolName}.`
    : '';
  return `You're a ${input.teamSize}-person team using ${toolNames} for ${input.useCase} work. ${savingsText}${topAction} Review the per-tool breakdown below for specific reasoning and next steps.`;
}
```

### Design Decision
The fallback **doesn't try to be creative**. It:
- States facts (team size, tools, use case)
- Quantifies savings or confirms optimization
- Points to the most actionable item
- Defers to the per-tool breakdown for depth

This ensures the fallback is **always correct** and never contradicts the audit results.

## Architectural Notes

### Why Haiku, Not Sonnet/Opus?
- **Cost**: Haiku is ~90% cheaper and sufficient for a single summarization task
- **Speed**: <500ms vs 1s+, critical for UX in a synchronous flow
- **Accuracy**: No degradation for this straightforward task

### Error Handling
```typescript
if (!anthropicKey) {
  console.log("No Anthropic API key configured - returning null for graceful fallback");
  return { status: 200, summary: null };
}
```
- Returns HTTP 200 with `summary: null` — never fails the entire request
- Frontend detects null and triggers local fallback (line 111 of AuditFormPage.tsx)
- Lead is saved even if summary fails — email and AI are both non-critical

### Why Not Use the LLM for Audit Math?
The audit engine is **100% hardcoded logic**, not LLM-based. This is intentional:
- **Auditability**: Finance leaders need to see exact reasoning, not "the AI thinks..."
- **Consistency**: No variance across identical inputs
- **Speed**: Hardcoded rules run in <5ms vs 500ms for API calls
- **Testability**: 9 passing tests cover all audit branches

The summary is the *only* LLM feature because it's purely **narrative**, not decision-making.
