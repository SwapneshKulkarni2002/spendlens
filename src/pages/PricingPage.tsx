import { TrendingDown, Check, ArrowRight } from 'lucide-react';

interface Tool {
  name: string;
  category: string;
  plans: Array<{
    tier: string;
    price: string;
    description: string;
  }>;
}

const tools: Tool[] = [
  {
    name: 'Claude (Anthropic)',
    category: 'AI Chat & API',
    plans: [
      { tier: 'Free', price: '$0/mo', description: 'Basic usage' },
      { tier: 'Pro', price: '$20/mo', description: 'Higher message limits' },
      { tier: 'Max', price: '$100-200/mo', description: '5-20x message limits' },
      { tier: 'Enterprise', price: 'Custom', description: 'Dedicated support' },
    ],
  },
  {
    name: 'ChatGPT (OpenAI)',
    category: 'AI Chat & API',
    plans: [
      { tier: 'Plus', price: '$20/mo', description: 'Enhanced features' },
      { tier: 'Team', price: '$30/mo', description: 'Workspace collaboration' },
      { tier: 'Enterprise', price: 'Custom', description: 'Full control' },
    ],
  },
  {
    name: 'Cursor',
    category: 'Code Editor',
    plans: [
      { tier: 'Hobby', price: '$0/mo', description: 'Limited usage' },
      { tier: 'Pro', price: '$20/mo', description: 'Unlimited fast requests' },
      { tier: 'Business', price: '$40/mo', description: 'Team admin controls' },
    ],
  },
  {
    name: 'GitHub Copilot',
    category: 'Code Completion',
    plans: [
      { tier: 'Individual', price: '$10/mo', description: 'Single user' },
      { tier: 'Business', price: '$19/mo', description: 'Org management' },
      { tier: 'Enterprise', price: '$39/mo', description: 'Advanced security' },
    ],
  },
  {
    name: 'Gemini (Google)',
    category: 'AI Chat & API',
    plans: [
      { tier: 'Free', price: '$0/mo', description: 'Limited usage' },
      { tier: 'Advanced', price: '$19.99/mo', description: 'Enhanced capabilities' },
      { tier: 'Business', price: '$24/mo', description: 'Workspace integration' },
    ],
  },
  {
    name: 'Windsurf (Codeium)',
    category: 'Code Editor',
    plans: [
      { tier: 'Free', price: '$0/mo', description: 'Community edition' },
      { tier: 'Pro', price: '$15/mo', description: 'Priority support' },
      { tier: 'Teams', price: '$35/mo', description: 'Team management' },
    ],
  },
];

const categories = ['AI Chat & API', 'Code Editor', 'Code Completion'];

export function PricingPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">SpendLens</span>
          </div>
          <button
            onClick={onBack}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Back
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Tool Pricing Reference
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Current pricing for popular AI tools and code editors. Use our audit tool to find savings
            across your stack.
          </p>
        </div>

        {/* Pricing by category */}
        <div className="space-y-12">
          {categories.map((category) => {
            const categoryTools = tools.filter((t) => t.category === category);
            return (
              <div key={category}>
                <h2 className="text-xl font-bold text-gray-900 mb-6">{category}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryTools.map((tool) => (
                    <div
                      key={tool.name}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="p-6 border-b border-gray-100">
                        <h3 className="font-bold text-lg text-gray-900 mb-1">
                          {tool.name}
                        </h3>
                        <p className="text-sm text-gray-500">{tool.category}</p>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {tool.plans.map((plan, idx) => (
                          <div key={idx} className="px-6 py-4 flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm">
                                {plan.tier}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {plan.description}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-bold text-emerald-600 text-sm">
                                {plan.price}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Key insights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
              <Check className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Most tools have free tiers</h3>
            <p className="text-sm text-gray-600">
              Many AI tools offer free or low-cost plans for individuals and small teams.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
              <Check className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Team plans often cost less</h3>
            <p className="text-sm text-gray-600">
              Per-user costs for team plans are sometimes lower than individual subscriptions.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
              <Check className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">API pricing varies widely</h3>
            <p className="text-sm text-gray-600">
              Pay-as-you-go options let you scale costs with actual usage.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 bg-emerald-600 rounded-3xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-3">Find savings across your stack</h2>
          <p className="text-emerald-100 mb-6 max-w-lg mx-auto">
            Run our free audit to identify optimization opportunities for your AI tool subscriptions.
          </p>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 bg-white text-emerald-600 font-semibold px-6 py-3 rounded-xl hover:bg-emerald-50 transition-colors"
          >
            Run an audit
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
