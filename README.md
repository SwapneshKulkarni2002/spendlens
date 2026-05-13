# SpendLens — Free AI Spend Audit

**SpendLens** helps startup founders and engineering managers audit their AI tool spending in 2 minutes. Get instant recommendations on where you're overspending, what to downgrade, and how much you could save annually. Built for lead generation for Credex (discounted AI infrastructure credits).

## Quick Summary

- **What**: Free web app that audits Cursor, Claude, ChatGPT, GitHub Copilot, Gemini, Windsurf, and API spend
- **Who it's for**: Founders and engineering managers at startups who want a second opinion on AI tool costs
- **How it works**: Input your current tools → instant audit results → optional email capture → shareable public link
- **Why it matters**: Most startups don't know they're overpaying. This surfaces specific savings opportunities.

---

## Screenshots & Demo

### Landing Page
![Landing Page](./Screenshot%202026-05-13%20211746.png)

### Pricing Rule Page
![Pricing Rule Page](./Screenshot%202026-05-13%20214537.png)

### Audit Form
![Audit Form](./Screenshot%202026-05-13%20212102.png)

### Results Dashboard
![Results Dashboard](./Screenshot%202026-05-13%20212405.png)

### Email Breakdown
![Savings Breakdown](./Screenshot%202026-05-13%20213042.png)

### PDF View
![Shareable Audit View](./Screenshot%202026-05-13%20213222.png)

🚀 **Try SpendLens Live:**  
[See live deployment at: (
https://ai-spend-audit-tool-48fp.bolt.host/)]

### Key Pages
1. **Landing**: Hero copy, how it works, social proof
2. **Audit Form**: Multi-step tool selector with spend input
3. **Results**: Per-tool breakdown, total savings, AI summary, email capture
4. **Shared View**: Public audit link (no PII, shareable on Twitter/Slack)

---

## Quick Start

### Install
```bash
git clone <repo>
cd project
npm install
```

### Run locally
```bash
npm run dev
```
Visit `http://localhost:5173`

### Build for production
```bash
npm run build
# Output: dist/
```

### Deploy
**Vercel** (recommended):
```bash
vercel
```

**Netlify or Cloudflare Pages**:
```bash
npm run build
# Upload dist/ folder
```

**Environment Variables** (.env):
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for system diagrams, data flow, scaling notes, and tech stack rationale.

---

## Features

### MVP (All 6 Implemented)
1. ✅ **Spend Input Form**: 8 AI tools, plan/seats/spend fields, form state persists
2. ✅ **Audit Engine**: Defensible hardcoded logic (no LLM here), per-tool recommendations
3. ✅ **Results Page**: Hero savings block, per-tool breakdown, Credex CTA for high savings
4. ✅ **AI Summary**: Claude Haiku generates ~100-word personalized summary (with local fallback)
5. ✅ **Lead Capture**: Email, company, role; honeypot spam protection; Supabase storage
6. ✅ **Shareable URL**: Unique `/audit/{uuid}` with OG tags for Twitter/Slack preview

### Code Quality
- ✅ **TypeScript**: Full type safety, no `any`
- ✅ **Tests**: 9 passing tests covering audit engine logic
- ✅ **CI/CD**: GitHub Actions runs lint + tests on every push

---

## Decisions

### 1. Hardcoded Audit Logic (Not LLM-Powered)
**Why**: Finance decisions need explainability. "Cursor Business is overkill for 2 seats because it adds SSO/audit logs, which aren't needed until 10+ users" is defensible. "The AI thinks..." is not.
**Tradeoff**: Rules are static (need updates if pricing changes). Quick wins: easier to test, faster (<5ms vs 500ms per audit).

### 2. No Login Required
**Why**: Cold visitors from Twitter/HN should audit instantly without friction. Email is optional, captured *after* value is shown.
**Tradeoff**: Can't track user audits over time. Acceptable for MVP (lead gen is the goal, not user retention).

### 3. Graceful API Degradation (No Anthropic Key = Local Fallback)
**Why**: Assignment says "no hardcoded secrets." Without API key, app still works perfectly—AI summary falls back to template.
**Tradeoff**: Template summaries are less personalized. Still 100% correct and helpful.

### 4. Supabase Over Self-Hosted Postgres
**Why**: Managed infrastructure (auth, RLS, edge functions out of the box). Minimal ops. Generous free tier.
**Tradeoff**: Vendor lock-in. Pays off in speed (MVP in 1 week vs 2 weeks).

### 5. React Over Next.js
**Why**: Single-page app (no server-side rendering needed). Faster build, simpler deployment (static site).
**Tradeoff**: Slightly larger bundle. Negligible at this scale.

---

## Testing

```bash
# Run tests once
npm test

# Watch mode
npm run test:watch
```

**Coverage**: 9 tests covering all audit engine branches (hardcoded logic only; UI tested manually).

See [TESTS.md](./TESTS.md) for details on each test.

---

## Documentation

- **[PRICING_DATA.md](./PRICING_DATA.md)**: Every price point with official vendor URLs
- **[PROMPTS.md](./PROMPTS.md)**: AI summary prompts, what we tried, why we chose what we did
- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: System diagrams, scaling notes, tech choices
- **[GTM.md](./GTM.md)**: Go-to-market strategy (target users, channels, traction metrics)
- **[ECONOMICS.md](./ECONOMICS.md)**: Unit economics (lead value, CAC, conversion rates)
- **[USER_INTERVIEWS.md](./USER_INTERVIEWS.md)**: 3 interviews with potential users
- **[DEVLOG.md](./DEVLOG.md)**: 7-day build log (daily progress, blockers, learnings)
- **[REFLECTION.md](./REFLECTION.md)**: 5 reflection questions on the build

---

## Performance

- **Lighthouse (deployed)**: Performance ≥85, Accessibility ≥90, Best Practices ≥90
- **Build size**: ~330KB JavaScript (gzipped ~95KB), ~18KB CSS
- **Page load**: <2s on 4G (Supabase + edge functions cached)

---

## Compliance

- **No secrets in repo**: API keys stored as Supabase environment variables
- **GDPR ready**: Email addresses stored (can be deleted per user request)
- **Honeypot spam protection**: Bot submissions silently rejected
- **RLS**: Supabase row-level security on all data

---

## Roadmap (Post-MVP)

- PDF export of audit report
- Benchmark mode ("your spend per developer vs. companies your size")
- Referral codes (share the tool, both parties get a discount code)
- Custom pricing rules (let power users adjust assumptions)

---

## Feedback & Issues

This is an open-source submission for evaluation. Feedback welcome—file an issue or open a PR.

---

## License

MIT. Use freely for portfolio, learning, commercial projects.

---

**Built in 7 days by Claude + human oversight.**

**Deployed at**: [https://ai-spend-audit-tool-48fp.bolt.host/]  
**GitHub**: [https://github.com/SwapneshKulkarni2002/spendlens.git]
