import { useEffect, useState } from 'react';
import { TrendingDown, Share2, CheckCircle, AlertTriangle, AlertCircle, Info, ArrowRight, Mail, Send, Loader2, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { SavedAudit, Severity } from '../types';
import { CompactPDFReport } from '../components/CompactPDFReport';
import { generateAuditPDF } from '../lib/generatePDF';

interface Props {
  auditId: string;
}

const SEVERITY_CONFIG: Record<Severity, { icon: React.ReactNode; color: string; label: string }> = {
  high: { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-red-600 bg-red-50 border-red-100', label: 'Overspending' },
  medium: { icon: <AlertCircle className="w-4 h-4" />, color: 'text-amber-600 bg-amber-50 border-amber-100', label: 'Can optimize' },
  low: { icon: <Info className="w-4 h-4" />, color: 'text-blue-600 bg-blue-50 border-blue-100', label: 'Consider' },
  optimal: { icon: <CheckCircle className="w-4 h-4" />, color: 'text-emerald-600 bg-emerald-50 border-emerald-100', label: 'Optimal' },
};

export function SharedAuditPage({ auditId }: Props) {
  const [audit, setAudit] = useState<SavedAudit | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('audits')
        .select('*')
        .eq('id', auditId)
        .maybeSingle();
      if (data) setAudit(data as SavedAudit);
      setLoading(false);
    }
    load();
  }, [auditId]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPDF = async () => {
    if (!audit) return;
    setGeneratingPDF(true);
    try {
      await generateAuditPDF(audit, auditId);
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setGeneratingPDF(false);
    }
  };

  const sendEmailReport = async () => {
    if (!email || !email.includes('@')) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError(null);
    setSendingEmail(true);
    try {
      await supabase.from('leads').insert({
        audit_id: auditId,
        email,
        company_name: '',
        role: '',
        honeypot: '',
      });

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-confirmation`;
      const resp = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          auditId,
          totalMonthlySavings: audit?.total_monthly_savings || 0,
          isHighSavings: audit?.total_monthly_savings
            ? audit.total_monthly_savings > 500 || audit.results.some((r) => r.credexOpportunity)
            : false,
          aiSummary: audit?.ai_summary || '',
          results: audit?.results || [],
          teamSize: audit?.team_size || 1,
          useCase: audit?.use_case || 'mixed',
        }),
      });

      if (resp.ok) {
        setEmailSent(true);
      } else {
        const data = await resp.json().catch(() => ({}));
        setEmailError(data.error || 'Failed to send email. Please try again.');
      }
    } catch {
      setEmailError('Something went wrong. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 text-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Audit not found</h2>
          <a href="/" className="text-emerald-600 hover:underline text-sm">Run your own audit →</a>
        </div>
      </div>
    );
  }

  const totalMonthlySavings = audit.total_monthly_savings;
  const totalAnnualSavings = totalMonthlySavings * 12;
  const isOptimal = totalMonthlySavings < 100;
  const showCredex = totalMonthlySavings > 500 || audit.results.some((r) => r.credexOpportunity);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">SpendLens</span>
          </a>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadPDF}
              disabled={generatingPDF}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {generatingPDF ? (
                <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              {generatingPDF ? 'Generating...' : 'Download PDF'}
            </button>
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              {copied ? 'Copied!' : 'Share'}
            </button>
            <a
              href="/"
              className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg transition-colors font-medium"
            >
              Audit my stack
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10" id="pdf-content">
        <div className="text-center mb-8">
          <p className="text-sm text-gray-400 mb-2">Shared AI spend audit</p>
          <h1 className="text-2xl font-bold text-gray-900">
            {audit.use_case} team · {audit.team_size} people
          </h1>
        </div>

        {/* Hero */}
        {isOptimal ? (
          <div className="bg-emerald-600 rounded-3xl p-8 mb-8 text-white text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-200" />
            <h2 className="text-2xl font-bold">Spending well</h2>
            <p className="text-emerald-100 text-sm mt-2">No significant optimizations identified.</p>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-3xl p-8 mb-8 text-white text-center">
            <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-3">
              Savings identified
            </p>
            <div className="flex items-baseline justify-center gap-3 mb-2">
              <span className="text-6xl font-bold text-emerald-400">
                ${totalMonthlySavings.toFixed(0)}
              </span>
              <span className="text-gray-400 text-lg">/month</span>
            </div>
            <p className="text-2xl font-semibold">
              ${totalAnnualSavings.toFixed(0)}<span className="text-gray-400 font-normal text-lg"> /year</span>
            </p>
          </div>
        )}

        {/* AI summary */}
        {audit.ai_summary && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-gray-900 rounded-md flex items-center justify-center">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Analysis</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{audit.ai_summary}</p>
          </div>
        )}

        {/* Credex */}
        {showCredex && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 mb-6 text-white">
            <h3 className="font-bold text-lg mb-1">Get these tools cheaper</h3>
            <p className="text-emerald-100 text-sm mb-4">
              Credex sources pre-purchased AI credits at 20–35% below retail.
            </p>
            <a
              href="https://credex.rocks"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-emerald-700 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-emerald-50 transition-colors"
            >
              Learn more about Credex →
            </a>
          </div>
        )}

        {/* Tool breakdown */}
        <h2 className="font-bold text-gray-900 text-lg mb-4">Per-tool breakdown</h2>
        <div className="space-y-3 mb-10">
          {audit.results.map((rec, idx) => {
            const cfg = SEVERITY_CONFIG[rec.severity];
            return (
              <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{rec.toolName}</h3>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.color}`}>
                        {cfg.icon}
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Current: {rec.currentPlan} · ${rec.currentSpend.toFixed(0)}/mo
                    </p>
                  </div>
                  {rec.monthlySavings > 0 && (
                    <div className="text-right shrink-0">
                      <div className="text-emerald-600 font-bold text-lg">
                        −${rec.monthlySavings.toFixed(0)}/mo
                      </div>
                    </div>
                  )}
                </div>
                <div className="bg-gray-50 rounded-xl px-4 py-3">
                  <p className="text-sm font-medium text-gray-800 mb-1">{rec.recommendedAction}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{rec.reason}</p>
                </div>
                {rec.alternativeTool && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
                    <ArrowRight className="w-3 h-3" />
                    Consider: {rec.alternativeTool}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Send report to email */}
        {emailSent ? (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold text-emerald-800 mb-1">Report sent!</p>
            <p className="text-sm text-emerald-600">Check your inbox for the full breakdown.</p>
          </div>
        ) : (
          <div className="bg-white border-2 border-emerald-200 rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Send this report to your email</h3>
                <p className="text-sm text-gray-400">
                  Get the full breakdown with action steps delivered to your inbox.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(null);
                }}
                onKeyDown={(e) => e.key === 'Enter' && sendEmailReport()}
                disabled={sendingEmail}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
              />
              <button
                onClick={sendEmailReport}
                disabled={sendingEmail || !email}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-colors shrink-0"
              >
                {sendingEmail ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {sendingEmail ? 'Sending...' : 'Send report'}
              </button>
            </div>
            {emailError && (
              <p className="mt-2 text-xs text-red-600">{emailError}</p>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="text-center bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
          <h3 className="font-bold text-gray-900 text-lg mb-2">Audit your own AI stack</h3>
          <p className="text-gray-500 text-sm mb-5">
            Free, instant, and no signup required. See where you're overpaying.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Run my free audit
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Hidden compact PDF report for download */}
      <div id="compact-pdf-content" style={{ display: 'none' }}>
        {audit && <CompactPDFReport audit={audit} />}
      </div>
    </div>
  );
}
