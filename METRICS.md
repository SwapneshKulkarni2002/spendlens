# Metrics Framework

## North Star Metric: Leads Captured Per 100 Audits

**Definition**: How many emails (leads) are captured per 100 audits completed.  
**Target**: 30 leads per 100 audits (30% lead capture rate)  

**Why this metric**:
- SpendLens is fundamentally a lead gen tool for Credex
- Audits that don't result in emails are good for brand (word-of-mouth from shared results) but don't create direct revenue
- Lead capture represents genuine intent (user thinks the insights are valuable enough to follow up)
- Unlike DAU or engagement metrics, this directly correlates to Credex conversion funnel

**Current baseline** (from user interviews + manual testing): ~25–30%, trending toward 30% with strong audit recommendations

---

## Input Metrics (Drive the North Star)

### 1. **Audit Completion Rate**
**Definition**: % of visitors who actually run an audit (vs. landing and bouncing)  
**Target**: 40% (4 in 10 people who land convert to running audit)  
**Why it matters**: A leaky top of funnel kills everything downstream. If only 10% run audits, we need 10× the traffic to hit lead targets.  
**How to improve**: 
- A/B test form friction (fewer fields → higher completion)
- Hero messaging clarity (some visitors might not understand what the tool does)
- Mobile UX (form must work seamlessly on phone)

### 2. **Lead Quality (High-Savings Leads)**
**Definition**: % of captured leads that show >$500/month in savings  
**Target**: 40% of leads are "high-savings" (Credex consultation-eligible)  
**Why it matters**: High-savings leads convert to consultations at 3-5x the rate of low-savings leads. One high-savings lead is worth 5 low-savings leads.  
**How to improve**:
- Run GTM campaign specifically targeting "high-spend companies" (Series A, >$1M revenue)
- Focus on teams already heavy on AI (they're more likely to be overspending)

### 3. **Shared Audit Rate**
**Definition**: % of audits that are shared to public link (tracked via UUID access)  
**Target**: 20% (1 in 5 audits shared)  
**Why it matters**: Shared audits are the growth engine. Each shared audit reaches 3–5 new people (viral loop). If only 5% are shared, viral coefficient is <1 and growth stalls.  
**How to improve**:
- Make sharing frictionless (one-click copy link, auto-populated Twitter/Slack templates)
- Design "audit card" to look beautiful when screenshotted (people share screenshots on social)
- Add incentive ("share your audit and unlock XYZ") — careful not to create fake sharing

---

## Implementation: What to Instrument First

### Phase 0 (MVP)
1. **Audit completion rate** — UTM tracking (where did user come from?) + event on form submission
2. **Lead capture rate** — event when email is submitted
3. **Traffic source** — which referrer (Show HN, Twitter, etc.) drove the visit?

### Phase 1 (Week 2)
4. **Shared audit tracking** — log when someone visits `/audit/{uuid}` from a non-direct source (referrer header)
5. **Consultation booking rate** — track when high-savings leads click the Credex link
6. **Deal close rate** — Credex integration to track which leads actually purchase credits

### Phase 2 (Month 2)
7. **Time spent on results page** — do people actually read the breakdown or skim?
8. **Audit re-runs** — same person running multiple audits (indicates engagement or indecision?)
9. **Form abandonment** — where do users drop off in the multi-step form?

---

## Pivot Triggers (When to Change Direction)

### Red Flags
- **Audit completion rate < 20%** → Form is too friction-y or copy isn't clear. Redesign form.
- **Lead capture rate < 15%** → Users don't find the audit valuable. Audit engine needs tweaking or UI isn't compelling.
- **Shared audit rate < 5%** → Results aren't shareable enough. Either findings are boring or UI doesn't make it easy to share.
- **High-savings lead ratio < 20%** → You're attracting the wrong audience (already-optimized companies). Refocus GTM on high-spend companies.
- **Consultation booking rate < 5% of high-savings leads** → Credex messaging isn't resonating. Test messaging and CTA timing.

### Green Flags
- **Audit completion > 50%** → Hero messaging is working. Increase traffic.
- **Lead capture > 35%** → Audit results are compelling. Scale GTM.
- **Shared audit > 25%** → Viral loop is real. Organic growth is accelerating.
- **Consultation booking > 15% of high-savings leads** → Credex conversion is working. Prepare sales team for inbound.

---

## Monitoring Dashboard (Ideal Setup)

```
Real-time metrics (updated hourly):
- Audits run today: X
- Lead captures today: Y
- Lead capture rate: Y/X = Z%
- High-savings leads today: Z1 (% of Y)
- Shared audits (from referrer tracking): Z2
- Consultation bookings (via Credex API): Z3

Weekly trends:
- Audit completion rate (rolling 7 days)
- Average lead quality (% high-savings)
- Viral coefficient (shared audits / audits run)
- Traffic source breakdown (Show HN vs. Twitter vs. Slack)

Monthly trends:
- Lead cost per source (total leads / marketing spend by channel)
- Lead-to-consultation conversion rate
- Consultation-to-deal rate (requires Credex data)
```

---

## Quarterly Business Review Checklist

| Metric | Q1 Target | Q1 Actual | Status | Next Step |
|--------|-----------|-----------|--------|-----------|
| Audits per month | 100 | ? | ? | ? |
| Lead capture rate | 30% | ? | ? | ? |
| High-savings leads | 40% | ? | ? | ? |
| Shared audit rate | 20% | ? | ? | ? |
| Consultation booking (high-savings) | 10% | ? | ? | ? |
| Credit purchases from audits | 3 | ? | ? | ? |

---

## Why These Metrics (Not DAU/Engagement)

- **DAU**: Meaningless for SpendLens. Users audit *once per quarter* (when budgeting comes up or after a spending spike). Daily active users ≠ health.
- **Time on site**: Doesn't matter. Users should get results fast (5 min). Longer time = confusion, not engagement.
- **Repeat usage**: Doesn't matter at MVP stage. We just need leads.
- **Leads captured**: Matters. It's the only thing Credex cares about.
- **Lead quality**: Matters more. One $5k deal from a high-savings lead beats 100 low-quality leads.

---

## Success Definition (6-Month Checkpoint)

If we hit these by Month 6, the tool is Product-Market Fit ready:
- **2,000+ audits run**
- **500+ leads captured**
- **40%+ of leads are high-savings (>$500/mo)**
- **30+ Credex consultations booked**
- **5+ deals closed (credits purchased)**
- **Positive unit economics** (leads generated at near-zero cost, conversion rate > 2%)
