import { CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import type { SavedAudit, Severity } from '../types';

interface Props {
  audit: SavedAudit;
}

const SEVERITY_CONFIG: Record<Severity, { color: string; label: string }> = {
  high: { color: 'text-red-600 bg-red-50', label: 'Overspending' },
  medium: { color: 'text-amber-600 bg-amber-50', label: 'Can optimize' },
  low: { color: 'text-blue-600 bg-blue-50', label: 'Consider' },
  optimal: { color: 'text-emerald-600 bg-emerald-50', label: 'Optimal' },
};

export function CompactPDFReport({ audit }: Props) {
  const totalMonthlySavings = audit.total_monthly_savings;
  const totalAnnualSavings = totalMonthlySavings * 12;
  const isOptimal = totalMonthlySavings < 100;

  return (
    <div className="w-full bg-white p-8" style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-6 h-6 bg-emerald-600 rounded-md flex items-center justify-center text-xs font-bold text-white">
          S
        </div>
        <span className="font-semibold text-gray-900">SpendLens</span>
      </div>

      {/* Team info */}
      <p className="text-sm text-gray-500 mb-8">
        {audit.use_case} team · {audit.team_size} {audit.team_size === 1 ? 'person' : 'people'}
      </p>

      {/* Hero section */}
      {isOptimal ? (
        <div className="bg-emerald-600 rounded-2xl p-6 mb-8 text-white text-center">
          <div className="text-4xl mb-3">✓</div>
          <h1 className="text-xl font-bold mb-2">Spending well</h1>
          <p className="text-sm text-emerald-100">
            No significant optimizations identified.
          </p>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-2xl p-6 mb-8 text-white text-center">
          <p className="text-xs uppercase text-gray-400 font-semibold mb-2">Potential savings</p>
          <div className="mb-2">
            <span className="text-4xl font-bold text-emerald-400">${totalMonthlySavings.toFixed(0)}</span>
            <span className="text-gray-400 text-lg">/month</span>
          </div>
          <p className="text-lg font-semibold">
            ${totalAnnualSavings.toFixed(0)}<span className="text-gray-400 font-normal text-sm"> /year</span>
          </p>
        </div>
      )}

      {/* AI Summary */}
      {audit.ai_summary && (
        <div className="bg-gray-50 rounded-lg p-4 mb-8 border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 bg-gray-900 rounded-sm flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
            <span className="text-sm font-semibold text-gray-900">Analysis</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">{audit.ai_summary}</p>
        </div>
      )}

      {/* Per-tool breakdown */}
      {audit.results.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Per-tool breakdown</h3>
          <div className="space-y-3">
            {audit.results.map((result, idx) => {
              const config = SEVERITY_CONFIG[result.severity];
              return (
                <div key={idx} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{result.toolName}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Current: {result.currentPlan} | ${result.currentSpend.toFixed(0)}/mo
                      </p>
                    </div>
                    {result.monthlySavings > 0 && (
                      <div className="text-right">
                        <span className="text-sm font-bold text-emerald-600">
                          -${result.monthlySavings.toFixed(0)}/mo
                        </span>
                        <p className="text-xs text-gray-500">
                          ${(result.monthlySavings * 12).toFixed(0)}/yr
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    <p className="font-semibold mb-1">{result.recommendedAction}</p>
                    <p>{result.reason}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Generated by SpendLens • {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
