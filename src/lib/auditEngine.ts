import type {
  AuditInput,
  AuditResult,
  ToolEntry,
  ToolRecommendation,
  UseCase,
} from '../types';
import { TOOL_MAP } from '../data/tools';

function getPlanPrice(toolId: string, planId: string): number {
  const tool = TOOL_MAP[toolId];
  if (!tool) return 0;
  return tool.plans.find((p) => p.id === planId)?.pricePerSeat ?? 0;
}

// Per-tool audit logic — each function returns a recommendation.
// Logic: check if plan fits team size, find cheaper same-vendor plan,
// suggest cross-tool alternatives for use case fit.

function auditCursor(entry: ToolEntry, _teamSize: number, _useCase: UseCase): ToolRecommendation {
  const { plan, seats, monthlySpend } = entry;
  const pricePerSeat = getPlanPrice('cursor', plan);
  const implied = pricePerSeat * seats;

  // Business has SSO + audit logs, overkill for small teams
  if (plan === 'business' && seats <= 3) {
    const projectedSpend = 20 * seats;
    return {
      toolId: 'cursor',
      toolName: 'Cursor',
      currentPlan: 'Business',
      currentSpend: monthlySpend || implied,
      recommendedAction: 'Downgrade to Cursor Pro',
      recommendedPlan: 'Pro',
      projectedSpend,
      monthlySavings: (monthlySpend || implied) - projectedSpend,
      reason:
        'Business adds SSO and audit logs — valuable at 10+ seats, not 3 or fewer. Pro at $20/seat covers the same AI features.',
      severity: 'high',
    };
  }

  // Pro is already the sweet spot for most teams
  if (plan === 'pro') {
    return {
      toolId: 'cursor',
      toolName: 'Cursor',
      currentPlan: 'Pro',
      currentSpend: monthlySpend || implied,
      recommendedAction: 'Keep current plan',
      projectedSpend: monthlySpend || implied,
      monthlySavings: 0,
      reason: 'Cursor Pro at $20/seat is the correct tier for most engineering teams.',
      severity: 'optimal',
    };
  }

  if (plan === 'enterprise' && seats <= 10) {
    const projectedSpend = 40 * seats; // business floor
    const current = monthlySpend || pricePerSeat * seats;
    if (current > projectedSpend) {
      return {
        toolId: 'cursor',
        toolName: 'Cursor',
        currentPlan: 'Enterprise',
        currentSpend: current,
        recommendedAction: 'Evaluate Cursor Business tier',
        recommendedPlan: 'Business',
        projectedSpend,
        monthlySavings: current - projectedSpend,
        reason:
          'Enterprise pricing is custom and typically adds volume discounts only at 50+ seats. Business covers security controls for most teams.',
        severity: 'medium',
      };
    }
  }

  return {
    toolId: 'cursor',
    toolName: 'Cursor',
    currentPlan: plan,
    currentSpend: monthlySpend || implied,
    recommendedAction: 'Keep current plan',
    projectedSpend: monthlySpend || implied,
    monthlySavings: 0,
    reason: 'Plan appears appropriate for your team size.',
    severity: 'optimal',
  };
}

function auditGithubCopilot(
  entry: ToolEntry,
  _teamSize: number,
  useCase: UseCase
): ToolRecommendation {
  const { plan, seats, monthlySpend } = entry;
  const pricePerSeat = getPlanPrice('github_copilot', plan);
  const implied = pricePerSeat * seats;
  const current = monthlySpend || implied;

  if (plan === 'enterprise' && seats <= 5) {
    const projectedSpend = 19 * seats;
    return {
      toolId: 'github_copilot',
      toolName: 'GitHub Copilot',
      currentPlan: 'Enterprise',
      currentSpend: current,
      recommendedAction: 'Downgrade to GitHub Copilot Business',
      recommendedPlan: 'Business',
      projectedSpend,
      monthlySavings: current - projectedSpend,
      reason:
        'Enterprise adds fine-tuning and policy controls for large orgs. At 5 or fewer seats, Business ($19/seat) delivers identical day-to-day capability.',
      severity: 'high',
    };
  }

  if (plan === 'business' && seats === 1) {
    const projectedSpend = 10;
    return {
      toolId: 'github_copilot',
      toolName: 'GitHub Copilot',
      currentPlan: 'Business',
      currentSpend: current,
      recommendedAction: 'Switch to GitHub Copilot Individual',
      recommendedPlan: 'Individual',
      projectedSpend,
      monthlySavings: current - projectedSpend,
      reason:
        'Business requires a seat assignment but adds no benefit for solo developers. Individual at $10/month covers everything you need.',
      severity: 'medium',
    };
  }

  // For coding use case, suggest Cursor as alternative if on Individual
  if (plan === 'individual' && useCase === 'coding') {
    return {
      toolId: 'github_copilot',
      toolName: 'GitHub Copilot',
      currentPlan: 'Individual',
      currentSpend: current,
      recommendedAction: 'Consider Cursor Pro as an alternative',
      projectedSpend: current,
      monthlySavings: 0,
      reason:
        'GitHub Copilot Individual ($10/seat) is cost-effective. Cursor Pro ($20/seat) offers a richer chat experience; trade-off is worth evaluating if your team lives in VS Code-based workflows.',
      severity: 'low',
      alternativeTool: 'Cursor Pro',
    };
  }

  return {
    toolId: 'github_copilot',
    toolName: 'GitHub Copilot',
    currentPlan: plan,
    currentSpend: current,
    recommendedAction: 'Keep current plan',
    projectedSpend: current,
    monthlySavings: 0,
    reason: 'Plan fits your team size and use case.',
    severity: 'optimal',
  };
}

function auditClaude(entry: ToolEntry, _teamSize: number, _useCase: UseCase): ToolRecommendation {
  const { plan, seats, monthlySpend } = entry;
  const pricePerSeat = getPlanPrice('claude', plan);
  const implied = pricePerSeat * seats;
  const current = monthlySpend || implied;

  // Team plan has 5-seat minimum — overkill for < 5
  if (plan === 'team' && seats < 5) {
    const projectedSpend = 20 * seats; // Pro × actual seats
    return {
      toolId: 'claude',
      toolName: 'Claude',
      currentPlan: 'Team',
      currentSpend: current,
      recommendedAction: 'Switch to Claude Pro (individual)',
      recommendedPlan: 'Pro',
      projectedSpend,
      monthlySavings: current - projectedSpend,
      reason:
        'Claude Team has a 5-seat minimum and bills at $30/seat. For fewer than 5 users, individual Pro accounts at $20/seat cost less with equivalent usage.',
      severity: 'high',
    };
  }

  if (plan === 'max_20x' && seats > 1) {
    // Max 20x is $200/seat — very high. Check if Pro would serve non-power users
    return {
      toolId: 'claude',
      toolName: 'Claude',
      currentPlan: 'Max (20x)',
      currentSpend: current,
      recommendedAction: 'Audit individual usage — mix Max + Pro',
      projectedSpend: current * 0.6,
      monthlySavings: current * 0.4,
      reason:
        'Max 20x ($200/seat) is for power users hitting Pro rate limits daily. Most team members on mixed tasks won\'t saturate Pro ($20/seat). Segmenting saves ~40% on this line.',
      severity: 'high',
      credexOpportunity: true,
    };
  }

  if (plan === 'max_5x') {
    // Check if Pro is actually sufficient
    return {
      toolId: 'claude',
      toolName: 'Claude',
      currentPlan: 'Max (5x)',
      currentSpend: current,
      recommendedAction: 'Evaluate if Pro limits are actually hit',
      projectedSpend: 20 * seats,
      monthlySavings: current - 20 * seats,
      reason:
        'Max 5x ($100/seat) is justified only if Pro rate limits disrupt your workflow regularly. If you haven\'t hit limits in the past month, downgrading to Pro ($20/seat) cuts this line 80%.',
      severity: 'medium',
    };
  }

  if (plan === 'api') {
    if (current > 500) {
      return {
        toolId: 'claude',
        toolName: 'Claude',
        currentPlan: 'API Direct',
        currentSpend: current,
        recommendedAction: 'Negotiate Anthropic committed-use discount',
        projectedSpend: current * 0.8,
        monthlySavings: current * 0.2,
        reason:
          'At $500+/month on Anthropic API, you qualify for committed-use pricing. A 6-month commitment typically yields 15–25% savings. Credex can source pre-committed credits at deeper discounts.',
        severity: 'medium',
        credexOpportunity: true,
      };
    }
    return {
      toolId: 'claude',
      toolName: 'Claude',
      currentPlan: 'API Direct',
      currentSpend: current,
      recommendedAction: 'Keep — API is right for programmatic use',
      projectedSpend: current,
      monthlySavings: 0,
      reason:
        'Pay-as-you-go API pricing is appropriate for sub-$500/month usage where committed-use discounts don\'t yet apply.',
      severity: 'optimal',
    };
  }

  return {
    toolId: 'claude',
    toolName: 'Claude',
    currentPlan: plan,
    currentSpend: current,
    recommendedAction: 'Keep current plan',
    projectedSpend: current,
    monthlySavings: 0,
    reason: 'Plan fits your team size and use case.',
    severity: 'optimal',
  };
}

function auditChatGPT(entry: ToolEntry, _teamSize: number, useCase: UseCase): ToolRecommendation {
  const { plan, seats, monthlySpend } = entry;
  const pricePerSeat = getPlanPrice('chatgpt', plan);
  const implied = pricePerSeat * seats;
  const current = monthlySpend || implied;

  if (plan === 'team' && seats < 2) {
    return {
      toolId: 'chatgpt',
      toolName: 'ChatGPT',
      currentPlan: 'Team',
      currentSpend: current,
      recommendedAction: 'Switch to ChatGPT Plus',
      recommendedPlan: 'Plus',
      projectedSpend: 20,
      monthlySavings: current - 20,
      reason:
        'Team requires a minimum of 2 seats. A sole user on Team is paying $30 for the same capabilities available in Plus at $20.',
      severity: 'medium',
    };
  }

  if (plan === 'api') {
    if (current > 500) {
      return {
        toolId: 'chatgpt',
        toolName: 'ChatGPT',
        currentPlan: 'API Direct',
        currentSpend: current,
        recommendedAction: 'Seek committed-use or pre-purchased credits',
        projectedSpend: current * 0.75,
        monthlySavings: current * 0.25,
        reason:
          'OpenAI API at $500+/month is the threshold where pre-purchased credits through resellers like Credex can save 20–30% vs. pay-as-you-go.',
        severity: 'high',
        credexOpportunity: true,
      };
    }
  }

  if ((plan === 'plus' || plan === 'team') && useCase === 'coding' && seats > 3) {
    return {
      toolId: 'chatgpt',
      toolName: 'ChatGPT',
      currentPlan: plan === 'plus' ? 'Plus' : 'Team',
      currentSpend: current,
      recommendedAction: 'Evaluate Cursor + Claude as a coding-focused alternative',
      projectedSpend: current,
      monthlySavings: 0,
      reason:
        'For coding teams, Cursor Pro ($20/seat) + Claude Pro ($20/seat) offers a tighter IDE integration and stronger coding benchmarks than ChatGPT for the same or lower total cost.',
      severity: 'low',
      alternativeTool: 'Cursor + Claude',
    };
  }

  return {
    toolId: 'chatgpt',
    toolName: 'ChatGPT',
    currentPlan: plan,
    currentSpend: current,
    recommendedAction: 'Keep current plan',
    projectedSpend: current,
    monthlySavings: 0,
    reason: 'Plan appears appropriately sized for your team.',
    severity: 'optimal',
  };
}

function auditAnthropicAPI(entry: ToolEntry): ToolRecommendation {
  const { monthlySpend } = entry;
  if (monthlySpend > 1000) {
    return {
      toolId: 'anthropic_api',
      toolName: 'Anthropic API',
      currentPlan: 'API',
      currentSpend: monthlySpend,
      recommendedAction: 'Purchase pre-committed credits via Credex',
      projectedSpend: monthlySpend * 0.75,
      monthlySavings: monthlySpend * 0.25,
      reason:
        'At $1k+/month on Anthropic API, buying pre-committed credits in bulk typically yields 20–30% savings. Credex sources these from companies that overprovisioned.',
      severity: 'high',
      credexOpportunity: true,
    };
  }
  if (monthlySpend > 300) {
    return {
      toolId: 'anthropic_api',
      toolName: 'Anthropic API',
      currentPlan: 'API',
      currentSpend: monthlySpend,
      recommendedAction: 'Monitor growth — credits become cost-effective above $1k/mo',
      projectedSpend: monthlySpend,
      monthlySavings: 0,
      reason:
        'You\'re approaching the threshold where pre-committed credits make economic sense. Track monthly growth — if spend reaches $1k, act.',
      severity: 'low',
    };
  }
  return {
    toolId: 'anthropic_api',
    toolName: 'Anthropic API',
    currentPlan: 'API',
    currentSpend: monthlySpend,
    recommendedAction: 'Keep pay-as-you-go',
    projectedSpend: monthlySpend,
    monthlySavings: 0,
    reason: 'Pay-as-you-go is correct at this spend level. Bulk credits have a minimum commitment that doesn\'t pencil out below $300–500/mo.',
    severity: 'optimal',
  };
}

function auditOpenAIAPI(entry: ToolEntry): ToolRecommendation {
  const { monthlySpend } = entry;
  if (monthlySpend > 1000) {
    return {
      toolId: 'openai_api',
      toolName: 'OpenAI API',
      currentPlan: 'API',
      currentSpend: monthlySpend,
      recommendedAction: 'Source pre-purchased API credits via Credex',
      projectedSpend: monthlySpend * 0.75,
      monthlySavings: monthlySpend * 0.25,
      reason:
        'OpenAI API at $1k+/month is well into the range where pre-purchased credits from overprovisioned companies trade at 20–30% discount to retail.',
      severity: 'high',
      credexOpportunity: true,
    };
  }
  if (monthlySpend > 300) {
    return {
      toolId: 'openai_api',
      toolName: 'OpenAI API',
      currentPlan: 'API',
      currentSpend: monthlySpend,
      recommendedAction: 'Consider switching high-volume tasks to Claude 3.5 Haiku',
      projectedSpend: monthlySpend * 0.85,
      monthlySavings: monthlySpend * 0.15,
      reason:
        'Claude 3.5 Haiku is competitively priced vs. GPT-4o-mini for high-volume tasks, with comparable quality on most workloads. Routing cost-intensive tasks there can trim 10–20%.',
      severity: 'medium',
      alternativeTool: 'Claude 3.5 Haiku (Anthropic API)',
    };
  }
  return {
    toolId: 'openai_api',
    toolName: 'OpenAI API',
    currentPlan: 'API',
    currentSpend: monthlySpend,
    recommendedAction: 'Keep pay-as-you-go',
    projectedSpend: monthlySpend,
    monthlySavings: 0,
    reason: 'Sub-$300/month API spend — overhead of commitments or credit purchases not worth it yet.',
    severity: 'optimal',
  };
}

function auditGemini(entry: ToolEntry, _teamSize: number, _useCase: UseCase): ToolRecommendation {
  const { plan, seats, monthlySpend } = entry;
  const pricePerSeat = getPlanPrice('gemini', plan);
  const implied = pricePerSeat * seats;
  const current = monthlySpend || implied;

  if (plan === 'business' && seats <= 2) {
    const projectedSpend = 19.99 * seats;
    return {
      toolId: 'gemini',
      toolName: 'Gemini',
      currentPlan: 'Business (Workspace)',
      currentSpend: current,
      recommendedAction: 'Switch to Gemini Advanced (personal Pro)',
      recommendedPlan: 'Pro',
      projectedSpend,
      monthlySavings: current - projectedSpend,
      reason:
        'Gemini for Google Workspace ($24/seat) adds Workspace integration. For 2 or fewer users not needing Workspace, personal Advanced ($19.99/seat) gives the same Gemini 1.5 Pro access cheaper.',
      severity: 'medium',
    };
  }

  if (plan === 'api' && current > 500) {
    return {
      toolId: 'gemini',
      toolName: 'Gemini',
      currentPlan: 'API Direct',
      currentSpend: current,
      recommendedAction: 'Compare with Claude 3.5 Sonnet for cost-sensitive tasks',
      projectedSpend: current * 0.85,
      monthlySavings: current * 0.15,
      reason:
        'Gemini 1.5 Pro API and Claude 3.5 Sonnet are similarly priced but benchmark differently by task type. Routing appropriately can cut 10–20%.',
      severity: 'low',
      alternativeTool: 'Claude 3.5 Sonnet',
    };
  }

  return {
    toolId: 'gemini',
    toolName: 'Gemini',
    currentPlan: plan,
    currentSpend: current,
    recommendedAction: 'Keep current plan',
    projectedSpend: current,
    monthlySavings: 0,
    reason: 'Spend appears appropriate for your team size.',
    severity: 'optimal',
  };
}

function auditWindsurf(entry: ToolEntry, _teamSize: number, _useCase: UseCase): ToolRecommendation {
  const { plan, seats, monthlySpend } = entry;
  const pricePerSeat = getPlanPrice('windsurf', plan);
  const implied = pricePerSeat * seats;
  const current = monthlySpend || implied;

  if (plan === 'teams' && seats <= 2) {
    const projectedSpend = 15 * seats;
    return {
      toolId: 'windsurf',
      toolName: 'Windsurf',
      currentPlan: 'Teams',
      currentSpend: current,
      recommendedAction: 'Downgrade to Windsurf Pro',
      recommendedPlan: 'Pro',
      projectedSpend,
      monthlySavings: current - projectedSpend,
      reason:
        'Teams plan ($35/seat) adds admin controls and SSO. For 1–2 users, Pro ($15/seat) is identical in AI capabilities — admin overhead doesn\'t justify the 133% cost premium.',
      severity: 'high',
    };
  }

  // Windsurf is generally cheaper than Cursor — surface this if user has both
  return {
    toolId: 'windsurf',
    toolName: 'Windsurf',
    currentPlan: plan,
    currentSpend: current,
    recommendedAction: 'Keep current plan',
    projectedSpend: current,
    monthlySavings: 0,
    reason: 'Windsurf is already cost-efficient for AI coding assistance.',
    severity: 'optimal',
  };
}

export function runAudit(input: AuditInput): Omit<AuditResult, 'aiSummary'> {
  const recommendations: ToolRecommendation[] = input.tools.map((entry) => {
    switch (entry.toolId) {
      case 'cursor':
        return auditCursor(entry, input.teamSize, input.useCase);
      case 'github_copilot':
        return auditGithubCopilot(entry, input.teamSize, input.useCase);
      case 'claude':
        return auditClaude(entry, input.teamSize, input.useCase);
      case 'chatgpt':
        return auditChatGPT(entry, input.teamSize, input.useCase);
      case 'anthropic_api':
        return auditAnthropicAPI(entry);
      case 'openai_api':
        return auditOpenAIAPI(entry);
      case 'gemini':
        return auditGemini(entry, input.teamSize, input.useCase);
      case 'windsurf':
        return auditWindsurf(entry, input.teamSize, input.useCase);
      default:
        return {
          toolId: entry.toolId,
          toolName: entry.toolId,
          currentPlan: entry.plan,
          currentSpend: entry.monthlySpend,
          recommendedAction: 'Keep current plan',
          projectedSpend: entry.monthlySpend,
          monthlySavings: 0,
          reason: 'No audit rules defined for this tool yet.',
          severity: 'optimal' as const,
        };
    }
  });

  const totalMonthlySpend = recommendations.reduce((sum, r) => sum + r.currentSpend, 0);
  const totalProjectedSpend = recommendations.reduce((sum, r) => sum + r.projectedSpend, 0);
  const totalMonthlySavings = Math.max(0, totalMonthlySpend - totalProjectedSpend);
  const totalAnnualSavings = totalMonthlySavings * 12;
  const showCredex =
    totalMonthlySavings > 500 || recommendations.some((r) => r.credexOpportunity);
  const isOptimal = totalMonthlySavings < 100;

  return {
    recommendations,
    totalMonthlySpend,
    totalProjectedSpend,
    totalMonthlySavings,
    totalAnnualSavings,
    isOptimal,
    showCredex,
  };
}
