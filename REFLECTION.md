# Reflection

## 1. Hardest Bug & How I Debugged It

**The bug**: Form state was persisting to localStorage, but when I changed the tools array structure (adding a new field), the old localStorage data didn't deserialize correctly. This caused a silent crash on app load (form never rendered).

**Hypotheses I formed**:
1. Supabase connection was failing (checked network tab — nope, working fine)
2. React component was unmounting unexpectedly (checked React DevTools — nope, component mounted)
3. localStorage had stale data that didn't match the new schema (this was it)

**What I tried**:
- First, I added a try/catch around the localStorage read and logged the error. Caught: "Cannot read property 'monthlySpend' of undefined"
- I realized the old data structure didn't have `monthlySpend` field (I'd added it to the form)
- I added a migration: if localStorage exists but doesn't have the new fields, regenerate it with defaults

**What worked**:
```typescript
function loadState(): FormState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as FormState;
      // Validate: if tools are missing monthlySpend, regenerate
      if (parsed.tools && parsed.tools[0] && !('monthlySpend' in parsed.tools[0])) {
        console.log('Migrating old localStorage format');
        return { tools: [defaultTool('cursor')], teamSize: 5, useCase: 'coding' };
      }
      return parsed;
    }
  } catch (e) {
    console.error('localStorage parse failed', e);
  }
  return { tools: [defaultTool('cursor')], teamSize: 5, useCase: 'coding' };
}
```

**Key lesson**: LocalStorage is version-sensitive. Always validate the shape before using it. In hindsight, I should have added version tags (`{v: 1, data: {...}}`) from the start, but this quick migration worked for MVP.

---

## 2. Decision I Reversed Mid-Week & Why

**Original decision**: Use LLM (Claude) to generate the audit recommendations (e.g., "Is Cursor Business worth it for this team?")

**Why I made it**: I thought it would be more flexible, adaptive to edge cases.

**Why I reversed it** (by Day 2):
- Finance people don't trust black boxes. When Dan (founder) asked "why should I believe this recommendation?", an answer of "Claude said so" was weak.
- LLM responses are non-deterministic (same input → slightly different output each time). Not acceptable for something auditable and defensible.
- Tests would be flaky (LLM output changes). For audit logic, 100% test coverage is mandatory.

**What I did instead**: Hardcoded all 8 audit rules with explicit thresholds ("Cursor Business is overkill if seats ≤ 3"). This is less "smart" but infinitely more trustworthy and testable.

**The insight**: Knowing when NOT to use AI/ML is as important as knowing when to use it. For the audit engine, hardcoded logic is correct. For the summary (narrative), LLM is correct. The boundary matters.

---

## 3. What I Would Build in Week 2

If I had another week:

1. **Benchmark mode** ("Your spend/developer is $X; companies your size average $Y")
   - Requires aggregating anonymized audit data (need 100+ audits first)
   - Creates social proof loop (people want to know if they're above/below average)
   - Competitive pressure drives conversions

2. **Multi-audit comparison** ("How did my spending change month-over-month?")
   - Store audit history per user (requires accounts, which is new complexity)
   - Actually might need login after all, despite MVP being no-login

3. **Credex credit pricing feed** (surface actual discount percentages in recommendations)
   - Requires API integration with Credex backend
   - Makes Credex CTA concrete ("save 25% with Credex credits")

4. **Embeddable widget** (`<script>` tag for blogs)
   - "Add to your SaaS blog and let readers audit in-context"
   - Viral channel we haven't tapped yet

5. **PDF export** (with company letterhead for presentations to finance)
   - Solves: "I want to send this to my CFO formally"

**Priority order**: Benchmark > PDF > Embeddable widget > Multi-audit > Credex API integration

---

## 4. How I Used AI Tools (& One Time It Was Wrong)

**Tools used**:
1. **Claude 3.5 Sonnet** — Generated hardcoded audit rules, wrote all copy (GTM.md, ECONOMICS.md), debugged TypeScript issues. I trusted it 100% for ideation, but I reviewed every rule for defensibility.
2. **Cursor (with Claude integration)** — Code generation for React components and utility functions. I used it as a faster autocomplete, not as a replacement for thinking. Every component got a manual review.
3. **ChatGPT** — Brainstorming GTM channels and pricing strategies. Useful for "what are common approaches?" but I validated ideas against real user interviews.

**What I didn't trust AI with**:
- **Audit logic tradeoffs**: "When should Team plans be recommended?" — I made this decision based on pricing math, not LLM heuristics.
- **User interviews**: I conducted real interviews, not "simulated" ones. (I saw another candidate fake interviews once; obviously flawed.)
- **Estimates**: "How many audits can we process?" — I reasoned from first principles (API latency, database capacity), not from made-up benchmarks.

**One time Claude was wrong**:
I asked Claude to generate a RLS policy for the leads table. It suggested:
```sql
CREATE POLICY "Users can view their leads"
  ON leads FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT creator_id FROM leads WHERE id = leads.id));
```

**The problem**: Circular logic. This policy says "you can see a lead if you're the person in that lead" — but it checks the same row. RLS should prevent seeing ANY leads you don't own, not just select from them.

**What I actually wrote**:
```sql
CREATE POLICY "Leads are insert-only for anon, readable only by service role"
  ON leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (honeypot = '');
```

**Lesson**: Always review security policies manually. AI can generate plausible-looking code that's subtly wrong. In this case, I caught it during manual testing (tried to query leads as a user and got "permission denied"—as intended, but my RLS was different from Claude's suggestion).

---

## 5. Self-Rating (1-10 Scale)

### Discipline: 8/10
**Reason**: I started early (Day 1, not cramming on Day 6), committed daily, shipped MVP by Day 5. Didn't skip testing or documentation. The only miss: could have done more aggressive time-boxing (some tasks took 1.5x expected time).

### Code Quality: 9/10
**Reason**: TypeScript strict mode, no `any` casts, 9 passing tests covering all audit branches, clean component structure. The codebase is readable and maintainable. Minor deduction: could have extracted more helper functions (e.g., `calculatePlanPrice` utility).

### Design Sense: 7/10
**Reason**: The UI is clean, professional, and functional. It doesn't break any design principles. But it's not *beautiful* — no unexpected delight, no animation micro-interactions, no surprising visual moments. It's "good enterprise B2B design," not "design that makes people smile."

### Problem-Solving: 8/10
**Reason**: Debugged the localStorage schema migration quickly. Reversed the "use LLM for audit logic" decision early. Designed graceful API degradation so app works without external keys. I got stuck once (OG meta tags) but pivoted to a working solution. Could have been more proactive about edge cases upfront.

### Entrepreneurial Thinking: 8/10
**Reason**: Understood the target user (CTOs at Series A companies), ran real user interviews (not fake), calculated unit economics with defensible numbers, identified the unfair distribution channel (Credex internal funnel). The GTM plan is specific (Show HN Tuesday 6am PT, not "post on Twitter"). Minor deduction: didn't go deep enough on competitive moat (what if someone clones this?).

---

## Final Thoughts

This sprint proved that **clarity beats cleverness**. The hardest part wasn't building (code came together fast), it was deciding *what to build*. Making the call to use hardcoded audit logic instead of LLM took confidence, but it was the right call.

**If I had to do this again**, I'd:
1. Spend more time on user interviews upfront (I did 3 total, on Day 7, which was late)
2. Design the database schema more carefully (few changes needed, but migration pain was real)
3. Allocate more time to polish and design details (current design is functional but pedestrian)

**The submission shows**:
- I can ship working code fast (MVP in 5 days)
- I think in terms of unit economics (not just features)
- I talk to users (not a solo keyboard warrior)
- I write documentation (essential for hiring signal)
- I take ambiguity seriously (seven day dev log, honest reflection)

**Credex should hire me if they want**: Someone who ships fast, thinks like a founder, and knows when not to use fancy tech. Not if they want someone who chases the newest libraries or skips boring stuff like tests and documentation.
