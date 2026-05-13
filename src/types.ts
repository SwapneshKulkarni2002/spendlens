export type UseCase = 'coding' | 'writing' | 'data' | 'research' | 'mixed';

export type ToolId =
  | 'cursor'
  | 'github_copilot'
  | 'claude'
  | 'chatgpt'
  | 'anthropic_api'
  | 'openai_api'
  | 'gemini'
  | 'windsurf';

export interface ToolEntry {
  toolId: ToolId;
  plan: string;
  seats: number;
  monthlySpend: number;
}

export interface AuditInput {
  tools: ToolEntry[];
  teamSize: number;
  useCase: UseCase;
}

export type Severity = 'high' | 'medium' | 'low' | 'optimal';

export interface ToolRecommendation {
  toolId: ToolId;
  toolName: string;
  currentPlan: string;
  currentSpend: number;
  recommendedAction: string;
  recommendedPlan?: string;
  projectedSpend: number;
  monthlySavings: number;
  reason: string;
  severity: Severity;
  alternativeTool?: string;
  credexOpportunity?: boolean;
}

export interface AuditResult {
  recommendations: ToolRecommendation[];
  totalMonthlySpend: number;
  totalProjectedSpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  aiSummary: string;
  isOptimal: boolean;
  showCredex: boolean;
}

export interface Lead {
  auditId: string;
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
}

export interface SavedAudit {
  id: string;
  tools_data: ToolEntry[];
  team_size: number;
  use_case: UseCase;
  results: ToolRecommendation[];
  ai_summary: string;
  total_monthly_savings: number;
  created_at: string;
}

export interface PlanOption {
  id: string;
  label: string;
  pricePerSeat: number;
  minSeats?: number;
  maxSeats?: number;
}

export interface ToolDefinition {
  id: ToolId;
  name: string;
  plans: PlanOption[];
  category: 'coding' | 'general' | 'api';
}
