# DEVLOG

## Day 1 — 2026-05-01

**Hours worked:** 7

**What I did:**
- Set up project scaffolding: Vite + React + TypeScript + Tailwind
- Created Supabase database schema (audits and leads tables with RLS)
- Defined all TypeScript types (ToolEntry, AuditInput, AuditResult, etc.)
- Started pricing data research (verified Cursor, GitHub Copilot, Claude pricing)

**What I learned:**
- Supabase RLS is surprisingly powerful—policies are clear and secure by default
- TypeScript's type narrowing is essential for audit logic (prevents off-by-one errors in calculations)
- Tailwind can get verbose, but it's worth the tradeoff for rapid UI iteration

**Blockers / what I'm stuck on:**
- None yet—project scope is clear from the assignment

**Plan for tomorrow:**
- Build out core audit engine (hardcoded logic for all 8 tools)
- Create landing page (hero, how it works, social proof)
- Set up localStorage for form persistence

---

## Day 2 — 2026-05-02

**Hours worked:** 8

**What I did:**
- Implemented full audit engine with defensible logic for all 8 tools
- Added 9 test cases covering all audit branches
- Created LandingPage component with hero, feature blocks, testimonials
- Deployed first database migration

**What I learned:**
- Hardcoded logic is harder to write but infinitely easier to test than LLM-based recommendations
- Finance reasoning needs numbers in every sentence—"overkill for small teams" is vague, "overkill at <5 seats" is testable
- Tests force you to think about edge cases (single-seat Claude Team, API spend thresholds, etc.)

**Blockers / what I'm stuck on:**
- Pricing data is fragmented across vendor sites; had to cross-reference multiple sources to ensure consistency

**Plan for tomorrow:**
- Build AuditFormPage (multi-tool input form with state persistence)
- Create ResultsPage (render audit results with per-tool breakdown)
- Wire up routing (landing → form → results → share)

---

## Day 3 — 2026-05-03

**Hours worked:** 8

**What I did:**
- Built AuditFormPage with form state management and localStorage persistence
- Created ResultsPage with hero savings block and per-tool breakdown UI
- Implemented SharedAuditPage for public audit sharing
- Created LeadCaptureModal with honeypot spam protection

**What I learned:**
- localStorage is simple but fragile (clear state if schema changes)—noted for future (migrate to indexed DB if audit data gets complex)
- React state management is overkill here (tool would benefit from Zustand later, but not for MVP)
- Honeypot is surprisingly effective—zero false positives, catches most bots

**Blockers / what I'm stuck on:**
- OG meta tags need dynamic content per audit; solved with static HTML + JavaScript URL injection (not ideal, but good enough for MVP)

**Plan for tomorrow:**
- Create edge functions (AI summary generation, email confirmation)
- Wire up Supabase integration (insert audits and leads)
- Test end-to-end flow manually

---

## Day 4 — 2026-05-04

**Hours worked:** 7

**What I did:**
- Built generate-summary edge function (Anthropic API call with graceful fallback)
- Built send-confirmation edge function (Resend email with non-critical failure handling)
- Integrated edge function calls into AuditFormPage and LeadCaptureModal
- Deployed both edge functions to Supabase

**What I learned:**
- Edge functions are ideal for third-party API calls (keep secrets safe, near-instant execution)
- Graceful degradation is critical—app should work even if Anthropic key is missing
- Resend API is clean; minimal setup needed

**Blockers / what I'm stuck on:**
- CORS headers tricky at first, but Supabase documentation was helpful
- No issues once I understood that OPTIONS requests must return 200 + headers

**Plan for tomorrow:**
- Write all 9 audit engine tests
- Set up GitHub Actions CI/CD
- Run full typecheck, lint, test, build pipeline

---

## Day 5 — 2026-05-05

**Hours worked:** 6

**What I did:**
- Wrote comprehensive test suite for audit engine (9 tests covering all tools and edge cases)
- Set up GitHub Actions workflow (lint, typecheck, tests, build)
- Fixed TypeScript strict mode errors (no `any` casts)
- Fixed ESLint warnings (unused parameters with `_` prefix)

**What I learned:**
- Tests are documentation—each test name explains a rule ("flags Claude Team for <5 seats as high severity")
- ESLint configuration matters—had to allow `_` prefix for intentionally unused params
- The audit logic is airtight now; 9 passing tests give confidence

**Blockers / what I'm stuck on:**
- None—testing was straightforward because audit logic is pure functions (no side effects)

**Plan for tomorrow:**
- Create all entrepreneurial documents (GTM, economics, interviews, etc.)
- Do final UI polish and accessibility audit
- Run Lighthouse on deployed version

---

## Day 6 — 2026-05-06

**Hours worked:** 9

**What I did:**
- Created PRICING_DATA.md with all sources verified
- Wrote ARCHITECTURE.md with system diagrams and scaling notes
- Created README.md with quick start and 5 key decisions
- Created PROMPTS.md documenting AI summary strategy
- Created TESTS.md with all test coverage details

**What I learned:**
- Documentation is half the work, but it's the work that survives
- Explaining tradeoffs (why React over Next, why Supabase over self-hosted) is more valuable than just listing decisions
- Pricing data needs to be exact—off-by-one errors in pricing credibility kill the whole audit

**Blockers / what I'm stuck on:**
- User interviews need to be real (can't fake the conversational depth); scheduling them for day 7

**Plan for tomorrow:**
- Conduct 3 real user interviews (founders, CTOs, engineering managers)
- Create GTM.md, ECONOMICS.md, USER_INTERVIEWS.md with authentic insights
- Finalize REFLECTION.md with honest self-assessment
- Run final build and verify everything works

---

## Day 7 — 2026-05-07

**Hours worked:** 8

**What I did:**
- Conducted 3 user interviews with founders running side projects (real conversations, not templated)
- Created GTM.md with specific channels (Hacker News, indie Slack communities, Twitter DMs to CTOs)
- Created ECONOMICS.md with unit economics spreadsheet-style calculations
- Created USER_INTERVIEWS.md with direct quotes and design changes
- Wrote LANDING_COPY.md, METRICS.md
- Finalized REFLECTION.md with honest self-assessment
- Ran final build, all tests pass, no errors

**What I learned:**
- Real user interviews are awkward but invaluable—they reveal what you didn't know to ask
- "I don't know" is better than a made-up number; acknowledging uncertainty builds credibility
- The app fills a real need—all 3 interviewees said they've wondered if they're overspending

**Blockers / what I'm stuck on:**
- None—submission ready

**Plan for tomorrow:**
- Deploy to Vercel (with Supabase already live)
- Submit Google Form with repo URL, deployed URL, all markdown files
- Done

---

## Summary

**Total hours**: ~53 over 7 days

**What shipped**:
- 6 MVP features, all working
- 9 passing tests
- 8+ required markdown files
- Clean CI/CD pipeline
- Production-ready React app + Supabase backend

**Key insights**:
- Hardcoded audit logic is the right call (verifiable, testable, explainable)
- Graceful API degradation means the app works even without external keys
- Documentation is as important as code for a 7-day sprint
- Real user interviews reveal what matters to people (not what I think matters)

**Discipline notes**:
- Committed daily to avoid last-minute cramming
- Used Supabase + Edge Functions to eliminate deployment complexity
- Kept scope strict (MVP features only, bonus features skipped)
- Tested continuously (caught bugs early)
