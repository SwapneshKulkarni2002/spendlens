import { useState } from 'react';
import { X, Send, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Props {
  auditId: string;
  totalMonthlySavings: number;
  isHighSavings: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function LeadCaptureModal({
  auditId,
  totalMonthlySavings,
  isHighSavings,
  onClose,
  onSuccess,
}: Props) {
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    if (honeypot) return; // silent drop

    setLoading(true);
    setError(null);

    try {
      // Save lead to Supabase
      const { error: dbErr } = await supabase.from('leads').insert({
        audit_id: auditId,
        email,
        company_name: companyName,
        role,
        honeypot,
      });
      if (dbErr) throw new Error(dbErr.message);

      // Send confirmation email via edge function
      try {
        await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-confirmation`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              auditId,
              totalMonthlySavings,
              isHighSavings,
            }),
          }
        );
      } catch {
        // Email failure is non-critical — lead is saved
      }

      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            {isHighSavings ? 'Get your savings report' : 'Stay updated on your stack'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          {isHighSavings && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-sm text-emerald-700">
              We'll also connect you with a Credex specialist who can help you capture the{' '}
              <strong>${totalMonthlySavings.toFixed(0)}/mo in savings</strong> through discounted credits.
            </div>
          )}

          {/* Honeypot — hidden from real users */}
          <div className="hidden" aria-hidden="true">
            <input
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              name="website"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Work email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Company <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Acme Inc."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Your role <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Engineering Manager, CTO, Founder..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send my report
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
            <Shield className="w-3 h-3" />
            No spam. Unsubscribe any time.
          </div>
        </form>
      </div>
    </div>
  );
}
