import type { ToolDefinition } from '../types';

// Pricing verified May 2026 — sources in PRICING_DATA.md
export const TOOLS: ToolDefinition[] = [
  {
    id: 'cursor',
    name: 'Cursor',
    category: 'coding',
    plans: [
      { id: 'hobby', label: 'Hobby (Free)', pricePerSeat: 0 },
      { id: 'pro', label: 'Pro', pricePerSeat: 20 },
      { id: 'business', label: 'Business', pricePerSeat: 40 },
      { id: 'enterprise', label: 'Enterprise', pricePerSeat: 40 }, // custom, floor estimate
    ],
  },
  {
    id: 'github_copilot',
    name: 'GitHub Copilot',
    category: 'coding',
    plans: [
      { id: 'individual', label: 'Individual', pricePerSeat: 10 },
      { id: 'business', label: 'Business', pricePerSeat: 19 },
      { id: 'enterprise', label: 'Enterprise', pricePerSeat: 39 },
    ],
  },
  {
    id: 'claude',
    name: 'Claude (Anthropic)',
    category: 'general',
    plans: [
      { id: 'free', label: 'Free', pricePerSeat: 0 },
      { id: 'pro', label: 'Pro', pricePerSeat: 20 },
      { id: 'max_5x', label: 'Max (5x)', pricePerSeat: 100 },
      { id: 'max_20x', label: 'Max (20x)', pricePerSeat: 200 },
      { id: 'team', label: 'Team', pricePerSeat: 30, minSeats: 5 },
      { id: 'enterprise', label: 'Enterprise', pricePerSeat: 30 }, // floor estimate
      { id: 'api', label: 'API Direct', pricePerSeat: 0 }, // usage-based, user enters spend
    ],
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT (OpenAI)',
    category: 'general',
    plans: [
      { id: 'plus', label: 'Plus', pricePerSeat: 20 },
      { id: 'team', label: 'Team', pricePerSeat: 30, minSeats: 2 },
      { id: 'enterprise', label: 'Enterprise', pricePerSeat: 30 }, // floor estimate
      { id: 'api', label: 'API Direct', pricePerSeat: 0 }, // usage-based
    ],
  },
  {
    id: 'anthropic_api',
    name: 'Anthropic API',
    category: 'api',
    plans: [
      { id: 'api', label: 'API (pay-as-you-go)', pricePerSeat: 0 },
    ],
  },
  {
    id: 'openai_api',
    name: 'OpenAI API',
    category: 'api',
    plans: [
      { id: 'api', label: 'API (pay-as-you-go)', pricePerSeat: 0 },
    ],
  },
  {
    id: 'gemini',
    name: 'Gemini (Google)',
    category: 'general',
    plans: [
      { id: 'free', label: 'Free', pricePerSeat: 0 },
      { id: 'pro', label: 'Gemini Advanced (Pro)', pricePerSeat: 19.99 },
      { id: 'business', label: 'Gemini for Google Workspace Business', pricePerSeat: 24 },
      { id: 'enterprise', label: 'Enterprise', pricePerSeat: 30 },
      { id: 'api', label: 'API Direct', pricePerSeat: 0 },
    ],
  },
  {
    id: 'windsurf',
    name: 'Windsurf (Codeium)',
    category: 'coding',
    plans: [
      { id: 'free', label: 'Free', pricePerSeat: 0 },
      { id: 'pro', label: 'Pro', pricePerSeat: 15 },
      { id: 'teams', label: 'Teams', pricePerSeat: 35 },
      { id: 'enterprise', label: 'Enterprise', pricePerSeat: 35 }, // floor estimate
    ],
  },
];

export const TOOL_MAP = Object.fromEntries(TOOLS.map((t) => [t.id, t])) as Record<
  string,
  ToolDefinition
>;
