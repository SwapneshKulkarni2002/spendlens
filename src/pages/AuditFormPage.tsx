import { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowLeft, ArrowRight, TrendingDown, ChevronDown } from 'lucide-react';
import { TOOLS, TOOL_MAP } from '../data/tools';
import type { ToolEntry, AuditInput, UseCase } from '../types';
import { runAudit } from '../lib/auditEngine';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'spendlens_form_state';
const USE_CASES: { value: UseCase; label: string }[] = [
  { value: 'coding', label: 'Software development / coding' },
  { value: 'writing', label: 'Content writing / copywriting' },
  { value: 'data', label: 'Data analysis / processing' },
  { value: 'research', label: 'Research / knowledge work' },
  { value: 'mixed', label: 'Mixed / general' },
];

interface Props {
  onBack: () => void;
  onComplete: (auditId: string) => void;
}

interface FormState {
  tools: ToolEntry[];
  teamSize: number;
  useCase: UseCase;
}

const defaultTool = (toolId = 'cursor'): ToolEntry => ({
  toolId: toolId as ToolEntry['toolId'],
  plan: TOOL_MAP[toolId]?.plans[0]?.id ?? '',
  seats: 1,
  monthlySpend: 0,
});

function loadState(): FormState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as FormState;
  } catch {}
  return { tools: [defaultTool('cursor')], teamSize: 5, useCase: 'coding' };
}

export function AuditFormPage({ onBack, onComplete }: Props) {
  const [state, setState] = useState<FormState>(loadState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addTool = () => {
    const usedIds = new Set(state.tools.map((t) => t.toolId));
    const next = TOOLS.find((t) => !usedIds.has(t.id));
    if (!next) return;
    setState((s) => ({ ...s, tools: [...s.tools, defaultTool(next.id)] }));
  };

  const removeTool = (idx: number) => {
    setState((s) => ({ ...s, tools: s.tools.filter((_, i) => i !== idx) }));
  };

  const updateTool = (idx: number, patch: Partial<ToolEntry>) => {
    setState((s) => {
      const tools = [...s.tools];
      tools[idx] = { ...tools[idx], ...patch };
      // When tool changes, reset plan to first plan of new tool
      if (patch.toolId) {
        tools[idx].plan = TOOL_MAP[patch.toolId]?.plans[0]?.id ?? '';
        tools[idx].monthlySpend = 0;
        tools[idx].seats = 1;
      }
      return { ...s, tools };
    });
  };

  const submit = async () => {
    if (state.tools.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const input: AuditInput = {
        tools: state.tools,
        teamSize: state.teamSize,
        useCase: state.useCase,
      };
      const auditResult = runAudit(input);

      // Fetch AI summary via edge function
      let aiSummary = '';
      try {
        const resp = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-summary`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ input, auditResult }),
          }
        );
        if (resp.ok) {
          const data = await resp.json();
          aiSummary = data.summary ?? '';
        }
      } catch {
        // Fallback summary generated locally
      }

      if (!aiSummary) {
        aiSummary = generateFallbackSummary(input, auditResult);
      }

      const { data, error: dbErr } = await supabase
        .from('audits')
        .insert({
          tools_data: state.tools,
          team_size: state.teamSize,
          use_case: state.useCase,
          results: auditResult.recommendations,
          ai_summary: aiSummary,
          total_monthly_savings: auditResult.totalMonthlySavings,
        })
        .select('id')
        .single();

      if (dbErr || !data) throw new Error(dbErr?.message ?? 'Failed to save audit');
      onComplete(data.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const availableTools = TOOLS.filter((t) => {
    const usedIds = new Set(state.tools.map((e) => e.toolId));
    return !usedIds.has(t.id);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">SpendLens</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your AI tool stack</h1>
          <p className="text-gray-500">
            Add the AI tools you pay for. We'll audit each one and show savings opportunities.
          </p>
        </div>

        {/* Team context */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">About your team</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Team size (total headcount)
              </label>
              <input
                type="number"
                min={1}
                max={10000}
                value={state.teamSize}
                onChange={(e) =>
                  setState((s) => ({ ...s, teamSize: Math.max(1, parseInt(e.target.value) || 1) }))
                }
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Primary use case
              </label>
              <div className="relative">
                <select
                  value={state.useCase}
                  onChange={(e) =>
                    setState((s) => ({ ...s, useCase: e.target.value as UseCase }))
                  }
                  className="w-full appearance-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white pr-8"
                >
                  {USE_CASES.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Tool entries */}
        <div className="space-y-4 mb-4">
          {state.tools.map((entry, idx) => {
            const toolDef = TOOL_MAP[entry.toolId];
            const isApiTool = entry.toolId === 'anthropic_api' || entry.toolId === 'openai_api' ||
              toolDef?.plans.find(p => p.id === entry.plan)?.pricePerSeat === 0;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-medium text-gray-900 text-sm">Tool {idx + 1}</h3>
                  {state.tools.length > 1 && (
                    <button
                      onClick={() => removeTool(idx)}
                      className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Tool selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      AI tool
                    </label>
                    <div className="relative">
                      <select
                        value={entry.toolId}
                        onChange={(e) =>
                          updateTool(idx, { toolId: e.target.value as ToolEntry['toolId'] })
                        }
                        className="w-full appearance-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white pr-8"
                      >
                        <option value={entry.toolId}>
                          {TOOL_MAP[entry.toolId]?.name}
                        </option>
                        {availableTools.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Plan selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Current plan
                    </label>
                    <div className="relative">
                      <select
                        value={entry.plan}
                        onChange={(e) => updateTool(idx, { plan: e.target.value })}
                        className="w-full appearance-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white pr-8"
                      >
                        {toolDef?.plans.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.label}
                            {p.pricePerSeat > 0 ? ` — $${p.pricePerSeat}/seat/mo` : ''}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Seats */}
                  {!(entry.toolId === 'anthropic_api' || entry.toolId === 'openai_api') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Number of seats
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={entry.seats}
                        onChange={(e) =>
                          updateTool(idx, { seats: Math.max(1, parseInt(e.target.value) || 1) })
                        }
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  )}

                  {/* Monthly spend */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {isApiTool ? 'Monthly spend ($)' : 'Actual monthly spend ($)'}
                      <span className="ml-1 text-gray-400 font-normal">
                        {!isApiTool ? '(or leave blank to calculate)' : ''}
                      </span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-400 text-sm">$</span>
                      <input
                        type="number"
                        min={0}
                        value={entry.monthlySpend || ''}
                        placeholder={
                          isApiTool
                            ? '0'
                            : String(
                                (toolDef?.plans.find((p) => p.id === entry.plan)?.pricePerSeat ??
                                  0) * entry.seats
                              )
                        }
                        onChange={(e) =>
                          updateTool(idx, {
                            monthlySpend: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full border border-gray-200 rounded-xl pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add tool button */}
        {availableTools.length > 0 && state.tools.length < TOOLS.length && (
          <button
            onClick={addTool}
            className="w-full border-2 border-dashed border-gray-200 hover:border-emerald-300 text-gray-400 hover:text-emerald-600 rounded-2xl py-4 flex items-center justify-center gap-2 text-sm font-medium transition-all mb-6"
          >
            <Plus className="w-4 h-4" />
            Add another tool
          </button>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          onClick={submit}
          disabled={loading || state.tools.length === 0}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl text-base flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating your audit...
            </>
          ) : (
            <>
              Run audit
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
        <p className="text-center text-xs text-gray-400 mt-3">
          Results shown instantly. Email optional.
        </p>
      </div>
    </div>
  );
}

function generateFallbackSummary(
  input: AuditInput,
  result: Omit<import('../types').AuditResult, 'aiSummary'>
): string {
  const toolNames = input.tools
    .map((t) => TOOL_MAP[t.toolId]?.name ?? t.toolId)
    .join(', ');
  const savingsText =
    result.totalMonthlySavings > 0
      ? `Your stack could save $${result.totalMonthlySavings.toFixed(0)}/month ($${result.totalAnnualSavings.toFixed(0)}/year) with the right adjustments.`
      : "Your current AI spend is well-optimized for your team's size and use case.";
  const highPri = result.recommendations.filter((r) => r.severity === 'high');
  const topAction =
    highPri.length > 0
      ? ` The highest-priority action is: ${highPri[0].recommendedAction} on ${highPri[0].toolName}.`
      : '';
  return `You're a ${input.teamSize}-person team using ${toolNames} for ${input.useCase} work. ${savingsText}${topAction} Review the per-tool breakdown below for specific reasoning and next steps.`;
}
