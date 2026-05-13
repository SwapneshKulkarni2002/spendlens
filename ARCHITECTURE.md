# Architecture

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         SpendLens Frontend (React + TS)         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │ Landing Page     │  │ Audit Form       │  │ Results Page │  │
│  │ (Hero CTA)       │→ │ (Spend Input)    │→ │ (Breakdown)  │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
│                               ↓                       ↓           │
│                        runAudit()                 Lead Capture    │
│                       (hardcoded logic)           (Modal)         │
│                               ↓                       ↓           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Recommendation Array + Totals (in-memory)              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          ↓       ↓                                │
│         ┌────────────────┴───────┴────────────────┐             │
│         ↓                                          ↓              │
│  ┌─────────────────────┐             ┌──────────────────────┐   │
│  │ Edge Fn             │             │ Supabase Postgres    │   │
│  │ generate-summary    │             │                      │   │
│  │ (Anthropic API)     │             │ audits (public)      │   │
│  │ returns null if     │             │ leads (private RLS)  │   │
│  │ no key configured   │             │                      │   │
│  └─────────────────────┘             └──────────────────────┘   │
│         ↓ (fallback if null)                  ↑ ↑               │
│  generateFallbackSummary()            insert insert             │
│    (runs in frontend)                                            │
│         ↓                                                         │
│  ┌──────────────────────────────────────────┐                  │
│  │ AI summary (AI-generated or templated)  │                  │
│  └──────────────────────────────────────────┘                  │
│         ↓                                                         │
│  Audit displayed with summary, results table                    │
│         ↓                                                         │
│  User shares or captures lead                                   │
│         ↓                                                         │
│  Email edge function (optional, non-critical)                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow: Input to Audit

1. **User Input** → AuditFormPage
   - Tool selections, plans, seats, spend, team size, use case
   - State persisted to localStorage on every change

2. **Audit Submission**
   - Input serialized to `AuditInput` type
   - `runAudit(input)` runs in frontend (synchronous)
   - Returns recommendations, totals, flags (isOptimal, showCredex)

3. **AI Summary Attempt**
   - Edge function called with input + auditResult
   - If Anthropic key exists: Claude generates ~100-word summary
   - If no key: returns null (frontend catches, uses fallback)
   - Fallback: `generateFallbackSummary()` runs locally

4. **Database Insert**
   - Audit record created: tools_data, results, ai_summary, savings
   - Assigned UUID on insert
   - RLS policy allows insert from anon/authenticated (read-only for others)

5. **Shared View**
   - Public URL: `/audit/{uuid}`
   - SharedAuditPage fetches from database
   - Strips email/company from display (public safety)

6. **Lead Capture** (optional)
   - User enters email (required), company (optional)
   - Honeypot field prevents bot spam
   - Leads inserted to Supabase with audit_id foreign key
   - Email confirmation attempt (non-critical failure)

## Tech Stack Decisions

### Frontend: React + TypeScript + Tailwind
- **React**: Component-driven, familiar ecosystem, strong typing support with TS
- **TypeScript**: Catch bugs early (types prevent runtime errors in audit logic)
- **Tailwind**: Rapid UI development, responsive by default, no external design system needed
- **Lucide React**: Lightweight icons (no FontAwesome bloat)

**Tradeoffs**:
- React adds 40KB (gzipped), but necessary for interactive form UX
- TypeScript adds ~5% build time, huge payoff in correctness
- Tailwind is verbose, but shipping faster than custom CSS

### Backend: Supabase (PostgreSQL + Auth)
- **PostgreSQL**: Structured data (audits, leads), RLS for security
- **Supabase Auth**: Built-in user management (future: track user audits)
- **Edge Functions**: Deno-based, near-instant cold start for summary generation

**Tradeoffs**:
- Supabase lock-in (proprietary SDK), but generous free tier
- Postgres: overkill for MVP (could use SQLite), but scales without rearchitecture
- Edge Functions: Limited to Supabase ecosystem, but latency minimal (<100ms from US)

### Audit Engine: Hardcoded TypeScript
- **Why not ML/LLM?** Audits require explainability (why downgrade from Business to Pro?). Finance leads need to trust the math.
- **Why hardcoded over config files?** Reduces hidden logic; changes are code reviews, not data migration risks.
- **Why TypeScript?** Tests and types ensure no off-by-one errors in savings calculations.

### Email: Optional (Resend or None)
- **Why Resend?** Free tier (100 emails/day), clean API, good reputation
- **Why optional?** If no API key, leads still saved (core value preserved). Email is marketing, not core.

## Scaling to 10k Audits/Day

### Current bottlenecks
1. **Edge function cold start**: ~500ms first call, then cached (~50ms)
2. **Anthropic API latency**: 500–1000ms per summary request
3. **Postgres connection pooling**: Supabase free tier has limited connections

### Changes needed for 10k/day
1. **Summary generation**
   - Batch summaries asynchronously (don't block audit save)
   - Queue audits, process in background (Supabase Functions + pg_cron)
   - Cache summaries by input hash (identical stacks get identical summaries)

2. **Database**
   - Upgrade from free tier to paid Supabase (more connections)
   - Add read replicas for SharedAuditPage views
   - Archive old audits (>6 months) to cold storage

3. **API Gateway**
   - Use Cloudflare Workers to cache SharedAuditPage responses (24h TTL)
   - Rate limit by IP: 10 audits/hour (prevent bot spam)

4. **Code changes**
   - Split RunAudit → submit audit immediately → generate summary async
   - Audit response includes sharable URL before summary is ready
   - Summary loads via polling or WebSocket if needed

### Estimated cost at scale
- Supabase Pro: $25/mo (1GB storage)
- Edge Functions: $25/mo (based on 10M invocations)
- Anthropic API: ~$500/mo (10k summaries × 500 tokens × $0.008/1K tokens)
- **Total**: ~$550/mo for infrastructure

## Frontend Framework Justification

**Why React over Next.js?**
- This is a single-page app (form → results → share)
- No server-side rendering needed (Supabase handles data)
- Simpler deployment (static site)
- Build time faster without Next.js overhead

**Why not Vue/Svelte?**
- React ecosystem dominates for real-world apps
- Employer signal (React dev skills more valuable)
- Larger community (easier to hire later)

**Why Vite over Create React App?**
- 10x faster dev build (50ms vs 500ms)
- Modern ESM-first approach
- Smaller bundle by default

## Security Model

### Authentication
- No login (public tool)
- Supabase RLS on audits: anyone can read (public sharing)
- Supabase RLS on leads: anon can insert, only service role reads all

### API Keys in Edge Functions
- Stored as Supabase secrets (environment variables)
- Never in repo (checked by .gitignore)
- Graceful degradation if missing (returns null, frontend uses fallback)

### Honeypot Spam Protection
- Hidden form field (CSS `display: none`)
- If field has value, lead rejected silently
- Catches bots that fill all fields

### Rate Limiting (future)
- For 10k/day scaling: add IP-based rate limit to edge function
- Currently: rely on Honeypot + user friction (small dataset)

## Deployment Target

Designed for **Vercel** (frontend) + **Supabase** (backend):
- Frontend: `npm run build` → dist/ → Vercel
- Edge Functions: auto-deployed via `mcp__supabase__deploy_edge_function` tool
- Database: managed by Supabase (no manual SQL)
- Secrets: Supabase environment variables (auto-populated)

Can also deploy frontend to Netlify/Cloudflare Pages (same static build).
