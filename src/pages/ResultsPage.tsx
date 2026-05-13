import { useEffect, useState } from 'react';
import {
  TrendingDown, Share2, CheckCircle, AlertTriangle, AlertCircle,
  Info, Mail, ExternalLink, ArrowRight, RefreshCw, Send, Loader2, Download
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { SavedAudit, Severity } from '../types';
import { LeadCaptureModal } from '../components/LeadCaptureModal';
import { CompactPDFReport } from '../components/CompactPDFReport';
import { generateAuditPDF } from '../lib/generatePDF';

interface Props {
  auditId: string;
  onNewAudit: () => void;
}

const SEVERITY_CONFIG: Record<Severity, { icon: React.ReactNode; color: string; label: string }> = {
  high: {
    icon: <AlertTriangle className="w-4 h-4" />,
    color: 'text-red-600 bg-red-50 border-red-100',
    label: 'Overspending',
  },
  medium: {
    icon: <AlertCircle className="w-4 h-4" />,
    color: 'text-amber-600 bg-amber-50 border-amber-100',
    label: 'Can optimize',
  },
  low: {
    icon: <Info className="w-4 h-4" />,
    color: 'text-blue-600 bg-blue-50 border-blue-100',
    label: 'Consider',
  },
  optimal: {
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    label: 'Optimal',
  },
};

export function ResultsPage({ auditId, onNewAudit }: Props) {
  const [audit, setAudit] = useState<SavedAudit | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [inlineEmail, setInlineEmail] = useState('');
  const [inlineEmailError, setInlineEmailError] = useState<string | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('audits')
        .select('*')
        .eq('id', auditId)
        .maybeSingle();
      if (data) setAudit(data as SavedAudit);
      setLoading(false);
    }
    fetch();
  }, [auditId]);

  const shareUrl = `${window.location.origin}/audit/${auditId}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
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

  const sendEmailReport = async (email: string) => {
    if (!email || !email.includes('@')) {
      setInlineEmailError('Please enter a valid email address.');
      return;
    }
    setInlineEmailError(null);
    setSendingEmail(true);
    try {
      // Save lead
      await supabase.from('leads').insert({
        audit_id: auditId,
        email,
        company_name: '',
        role: '',
        honeypot: '',
      });

      // Send confirmation email
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
        setInlineEmailError(data.error || 'Failed to send email. Please try again.');
      }
    } catch {
      setInlineEmailError('Something went wrong. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading your audit...</p>
        </div>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Audit not found</h2>
          <p className="text-gray-500 mb-6">This audit may have expired or the link is incorrect.</p>
          <button
            onClick={onNewAudit}
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
          >
            Run a new audit
          </button>
        </div>
      </div>
    );
  }

  const totalMonthlySavings = audit.total_monthly_savings;
  const totalAnnualSavings = totalMonthlySavings * 12;
  const showCredex = totalMonthlySavings > 500 || audit.results.some((r) => r.credexOpportunity);
  const isOptimal = totalMonthlySavings < 100;
  const highCount = audit.results.filter((r) => r.severity === 'high').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <a href="https://credex.rocks/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">SpendLens</span>
          </a>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadPDF}
              disabled={generatingPDF}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
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
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              {copied ? 'Copied!' : 'Share'}
            </button>
            <button
              onClick={onNewAudit}
              className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 border border-emerald-200 hover:border-emerald-300 px-3 py-1.5 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              New audit
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10" id="pdf-content">
        {/* Hero savings block */}
        {isOptimal ? (
          <div className="bg-emerald-600 rounded-3xl p-8 mb-8 text-white text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-emerald-200" />
            <h1 className="text-2xl font-bold mb-2">You're spending well</h1>
            <p className="text-emerald-100 text-sm max-w-sm mx-auto">
              Your AI stack looks appropriately sized for your team. No significant optimizations found right now.
            </p>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-3xl p-8 mb-8 text-white">
            <div className="text-center">
              <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-3">
                Potential savings identified
              </p>
              <div className="flex items-baseline justify-center gap-3 mb-2">
                <span className="text-6xl font-bold text-emerald-400">
                  ${totalMonthlySavings.toFixed(0)}
                </span>
                <span className="text-gray-400 text-lg">/month</span>
              </div>
              <p className="text-2xl font-semibold text-white mb-4">
                ${totalAnnualSavings.toFixed(0)}<span className="text-gray-400 font-normal text-lg"> /year</span>
              </p>
              {highCount > 0 && (
                <div className="inline-flex items-center gap-1.5 bg-red-500/20 text-red-300 text-sm px-3 py-1.5 rounded-full">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {highCount} high-priority {highCount === 1 ? 'issue' : 'issues'} found
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Summary */}
        {audit.ai_summary && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-gray-900 rounded-md flex items-center justify-center">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Personalized analysis</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{audit.ai_summary}</p>
          </div>
        )}

        {/* Credex CTA — high savings */}
        {showCredex && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 mb-6 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg mb-1">Get the same tools, cheaper</h3>
                <p className="text-emerald-100 text-sm leading-relaxed mb-4">
                  Credex sources pre-purchased AI credits from companies that overprovisioned —
                  typically 20–35% below retail. With ${totalMonthlySavings.toFixed(0)}/month at stake,
                  it's worth a 15-minute conversation.
                </p>
                <a
                  href="https://credex.rocks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-emerald-700 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-emerald-50 transition-colors"
                >
                  Book a free Credex consultation
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Per-tool breakdown */}
        <h2 className="font-bold text-gray-900 text-lg mb-4">Per-tool breakdown</h2>
        <div className="space-y-3 mb-8">
          {audit.results.map((rec, idx) => {
            const cfg = SEVERITY_CONFIG[rec.severity];
            return (
              <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5">
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
                        <div className="text-xs text-gray-400">
                          ${(rec.monthlySavings * 12).toFixed(0)}/yr
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-xl px-4 py-3">
                    <p className="text-sm font-medium text-gray-800 mb-1">
                      {rec.recommendedAction}
                    </p>
                    <p className="text-xs text-gray-500 leading-relaxed">{rec.reason}</p>
                  </div>
                  {rec.alternativeTool && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
                      <ArrowRight className="w-3 h-3" />
                      Consider: {rec.alternativeTool}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Email report section */}
        {emailSent || leadCaptured ? (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold text-emerald-800 mb-1">Report sent!</p>
            <p className="text-sm text-emerald-600">Check your inbox for the full breakdown.</p>
          </div>
        ) : (
          <div className="bg-white border-2 border-emerald-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {isOptimal ? 'Stay informed on new optimizations' : 'Send report to email'}
                </h3>
                <p className="text-sm text-gray-400">
                  {isOptimal
                    ? "We'll notify you when savings apply to your stack."
                    : 'Get the full breakdown with action steps delivered to your inbox.'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="you@company.com"
                value={inlineEmail}
                onChange={(e) => {
                  setInlineEmail(e.target.value);
                  setInlineEmailError(null);
                }}
                onKeyDown={(e) => e.key === 'Enter' && sendEmailReport(inlineEmail)}
                disabled={sendingEmail}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
              />
              <button
                onClick={() => sendEmailReport(inlineEmail)}
                disabled={sendingEmail || !inlineEmail}
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
            {inlineEmailError && (
              <p className="mt-2 text-xs text-red-600">{inlineEmailError}</p>
            )}
            <p className="mt-3 text-xs text-gray-400">
              Want more detail?{' '}
              <button
                onClick={() => setShowLeadModal(true)}
                className="text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-2"
              >
                Add your company and role
              </button>{' '}
              to get a personalized follow-up.
            </p>
          </div>
        )}

        {/* Share */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400 mb-3">Share this audit with your team</p>
          <button
            onClick={copyLink}
            className="inline-flex items-center gap-2 border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <Share2 className="w-4 h-4" />
            {copied ? 'Link copied!' : 'Copy shareable link'}
          </button>
        </div>

        {/* Optimal lead */}
        {isOptimal && (
          <div className="mt-8 border border-gray-100 rounded-2xl p-6 bg-white shadow-sm text-center">
            <p className="text-sm text-gray-500 mb-2">
              Things change — AI pricing shifts every few months.
            </p>
            <p className="text-xs text-gray-400">
              Share this link so your team can re-audit when you add new tools.
            </p>
          </div>
        )}
      </div>

      {/* Hidden compact PDF report for download */}
      <div id="compact-pdf-content" style={{ display: 'none' }}>
        {audit && <CompactPDFReport audit={audit} />}
      </div>

      {showLeadModal && (
        <LeadCaptureModal
          auditId={auditId}
          totalMonthlySavings={totalMonthlySavings}
          isHighSavings={showCredex}
          onClose={() => setShowLeadModal(false)}
          onSuccess={() => {
            setShowLeadModal(false);
            setLeadCaptured(true);
          }}
        />
      )}
    </div>
  );
}
