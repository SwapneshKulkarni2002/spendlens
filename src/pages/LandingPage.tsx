import { ArrowRight, BarChart3, CheckCircle, Zap, TrendingDown, Shield } from 'lucide-react';

interface Props {
  onStart: () => void;
  onPricing?: () => void;
}

const LOGOS = [
  'Cursor', 'GitHub Copilot', 'Claude', 'ChatGPT', 'Gemini', 'Windsurf',
];

const TESTIMONIALS = [
  {
    quote: 'Found $840/mo in savings in under 2 minutes. Should have done this months ago.',
    name: 'Marcus T.',
    role: 'CTO, Series A SaaS',
    savings: '$10,080/yr',
  },
  {
    quote: "We were on Cursor Business for a 2-person team. SpendLens caught it immediately.",
    name: 'Priya S.',
    role: 'Engineering Lead, Early-stage startup',
    savings: '$480/yr',
  },
  {
    quote: "Our API spend was over $2k/mo — didn't realize pre-purchased credits could cut that by 25%.",
    name: 'Dan W.',
    role: 'Founder, AI-native startup',
    savings: '$6,000/yr',
  },
];

export function LandingPage({ onStart, onPricing }: Props) {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-lg">SpendLens</span>
          </div>
          <div className="flex items-center gap-3">
            {onPricing && (
              <button
                onClick={onPricing}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Tool pricing
              </button>
            )}
            <button
              onClick={onStart}
              className="text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              Run free audit →
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-20 pb-16 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 text-sm text-emerald-700 font-medium mb-8">
            <Zap className="w-3.5 h-3.5" />
            Free AI spend audit — takes 2 minutes
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight tracking-tight mb-6">
            Are you overpaying<br />
            <span className="text-emerald-600">for AI tools?</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Most startups pay retail on AI subscriptions they've outgrown — or haven't grown into.
            SpendLens audits your stack in 2 minutes and shows exactly where to cut.
          </p>
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200 shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 hover:-translate-y-0.5"
          >
            Audit my AI spend
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="mt-4 text-sm text-gray-400">No signup required. See results first.</p>
        </div>
      </section>

      {/* Tools covered */}
      <section className="px-6 py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-gray-400 font-medium uppercase tracking-wider mb-6">
            Audits your full stack
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {LOGOS.map((name) => (
              <span
                key={name}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 shadow-sm"
              >
                {name}
              </span>
            ))}
            <span className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-400 shadow-sm">
              + OpenAI API, Anthropic API
            </span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How it works
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                icon: <BarChart3 className="w-6 h-6 text-emerald-600" />,
                step: '01',
                title: 'Enter your tools',
                desc: 'Tell us which AI tools you pay for, which plan, and how many seats.',
              },
              {
                icon: <Zap className="w-6 h-6 text-emerald-600" />,
                step: '02',
                title: 'Instant audit',
                desc: 'Our engine checks each tool against current pricing, team size fit, and use-case match.',
              },
              {
                icon: <CheckCircle className="w-6 h-6 text-emerald-600" />,
                step: '03',
                title: 'Clear recommendations',
                desc: 'See exactly what to downgrade, switch, or renegotiate — with the dollar savings per action.',
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="text-xs font-bold text-gray-200 text-8xl absolute -top-4 -left-2 select-none pointer-events-none">
                  {item.step}
                </div>
                <div className="relative bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="px-6 py-16 bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs text-center text-gray-400 font-medium uppercase tracking-wider mb-2">
            Mocked testimonials — indicative of real use cases
          </p>
          <div className="grid sm:grid-cols-3 gap-6 mt-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <p className="text-gray-700 text-sm leading-relaxed mb-4">"{t.quote}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm text-gray-900">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.role}</div>
                  </div>
                  <div className="text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-full">
                    {t.savings}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-400" />
              No account required
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-400" />
              Email captured after results
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-400" />
              Pricing sourced from official pages
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 bg-emerald-600 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">
            Find out what you're actually paying for
          </h2>
          <p className="text-emerald-100 mb-8 text-lg">
            Takes 2 minutes. No credit card. No account.
          </p>
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-emerald-700 font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Start your free audit
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-100 text-center text-sm text-gray-400">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-5 h-5 bg-emerald-600 rounded flex items-center justify-center">
            <TrendingDown className="w-3 h-3 text-white" />
          </div>
          <span className="font-medium text-gray-600">SpendLens</span>
        </div>
        <p>A free tool by <span className="text-emerald-600 font-medium">Credex</span> — discounted AI infrastructure credits</p>
      </footer>
    </div>
  );
}
