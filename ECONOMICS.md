# Unit Economics

## Lead Value Estimation

### Assumptions
- **Conversion rate (audit → consultation booked)**: 10% (only high-savings cases; >$500/mo)
- **Conversion rate (consultation → credit purchase)**: 20% (3-month sales cycle, requires trust + ROI proof)
- **Average credit purchase value**: $15,000 (12-month pre-purchase, typical deal size for Series A companies)
- **Credex margin on credits**: 25% (buy at 70% discount, sell at 95% discount = 25% margin)

### Calculation
```
Lead Value = (0.10 × 0.20) × $15,000 × 0.25
           = 0.02 × $15,000 × 0.25
           = $75 per qualified lead
```

**Interpretation**: Each audit that results in an email capture is worth ~$75 to Credex (if 2% convert to paid credit purchase).

**Sensitivity**:
- If conversion to consultation is 5% (not 10%): lead value = $37.50
- If conversion to purchase is 30% (not 20%): lead value = $112.50
- If average purchase is $25,000: lead value = $125

**Conservative estimate: $50–$100 per lead**

---

## CAC by Channel

### Channel 1: Show HN (Organic, $0 paid)
- **Cost to acquire**: $0 (infrastructure costs negligible)
- **Expected audits from Week 1 launch**: 30–50
- **Lead capture rate**: 30% of audits → 10–15 leads
- **CAC**: $0 (truly free)
- **LTV:CAC ratio**: Infinite (if lead value is $75)

### Channel 2: Twitter/X Outreach (Organic, $0 paid)
- **Cost to acquire**: $0 (time: ~2 hours for threads + DMs)
- **Expected audits**: 20–30 (from threads + direct DMs to 20 founders)
- **Lead capture rate**: 25% → 5–8 leads
- **CAC**: $0
- **LTV:CAC ratio**: Infinite

### Channel 3: Indie Hacker Communities (Organic, $0 paid)
- **Cost to acquire**: $0
- **Expected audits**: 10–15
- **Lead capture rate**: 25% → 2–4 leads
- **CAC**: $0
- **LTV:CAC ratio**: Infinite

### Channel 4: Credex Internal (Email list, owned audience)
- **Cost to acquire**: $0 (marginal cost, leveraging existing Credex customer base)
- **Expected audits** (if 5k existing prospects): 5–10% try = 250–500 audits
- **Lead capture rate**: 40% (higher intent) → 100–200 leads
- **CAC**: Essentially $0 (customer acquisition cost already paid for Credex prospects)
- **LTV:CAC ratio**: Extreme (these are warm leads, high conversion potential)

---

## Profitability Threshold

### Break-Even Analysis
```
Annual cost to run SpendLens:
- Supabase Pro: $25/mo × 12 = $300
- Anthropic API: $500/mo (if 10k audits/month) × 12 = $6,000
- Resend emails: $25/mo × 12 = $300
- Developer time: $0 (already paid for by Credex hiring budget)
- Infrastructure: $0 (Vercel free tier + Supabase managed)

Total annual cost: ~$6,600
```

### Revenue at Various Volumes
```
Scenario 1: 100 audits/month
- Leads captured (30%): 30/month = 360/year
- Leads converted to purchase (2%): 7.2 deals/year
- Revenue: 7.2 × $15,000 × 0.25 margin = $27,000/year
- Profit: $27,000 - $6,600 = $20,400/year ✓ POSITIVE

Scenario 2: 500 audits/month (aggressive)
- Leads captured (30%): 150/month = 1,800/year
- Leads converted to purchase (2%): 36 deals/year
- Revenue: 36 × $15,000 × 0.25 = $135,000/year
- Profit: $135,000 - $6,600 = $128,400/year ✓ VERY POSITIVE

Scenario 3: 1,000 audits/month (viral)
- Leads captured (30%): 300/month = 3,600/year
- Leads converted to purchase (2%): 72 deals/year
- Revenue: 72 × $15,000 × 0.25 = $270,000/year
- Profit: $270,000 - $6,600 = $263,400/year ✓ EXCELLENT
```

**Breakeven point**: ~40 audits/month (12–15 leads/month, given 2% conversion)

---

## Path to $1M ARR in 18 Months

### Requirements
```
$1,000,000 / $75 per lead = 13,333 leads needed

At 30% lead capture rate: 44,444 audits needed

At 50 audits/day (aggressive but not unrealistic with viral loop):
44,444 audits / 50 per day = 888 days ≈ 29 months

BUT with growth curve:
- Months 1-3: 50 audits/day average (slow start)
- Months 4-9: 100 audits/day average (viral loop kicks in)
- Months 10-18: 200+ audits/day (word-of-mouth + Credex internal funnel)

Total audits: (50×90) + (100×180) + (200×270) = 4,500 + 18,000 + 54,000 = 76,500 audits
Total leads: 76,500 × 0.30 = 22,950 leads
Total converted deals: 22,950 × 0.02 = 459 deals
Total revenue: 459 × $15,000 × 0.25 = $1,721,250 ✓ TARGET EXCEEDED
```

### Critical Success Factors for $1M
1. **Viral loop works** (viral coefficient > 1.0 on shared audits)
2. **Credex internal funnel converts** (existing prospects have high propensity to buy credits if they're audit-qualified)
3. **Conversion rate improves over time** (2% floor → 3-5% with optimized sales process)
4. **Product stays lean** (marginal cost per audit approaches $0 with scale)

---

## Conservative vs. Optimistic

### Conservative Case
- 30 audits/month, 10 leads/month, 0.2 deals/month
- Annual revenue: 2.4 deals × $15,000 × 0.25 = $9,000
- Not profitable at current infrastructure costs
- **Verdict**: Product needs to prove viral loop to scale beyond niche

### Optimistic Case (18-month outlook)
- 200 audits/day by month 18 (shared audit viral loop + Credex internal funnel)
- 6,000 audits/month → 1,800 leads/month → 36 deals/month
- Annual ARR: $162,000 (just from month 18 run rate)
- **Verdict**: $1M ARR plausible if execution is solid

### Most Likely Case (Base Case)
- 50–100 audits/month in months 1-6 (organic growth + Show HN bump)
- 200–300 audits/month by month 12 (word-of-mouth + Credex internal)
- $50k–$100k ARR by 18 months
- **Verdict**: Profitable niche play, path to $1M requires viral loop to hold

---

## Key Metrics to Track

1. **Audit completion rate** (% of visits that run an audit)
2. **Lead capture rate** (% of audits that capture email)
3. **Shared audit rate** (% of audits shared to public link)
4. **Consultation booking rate** (% of leads that book Credex call)
5. **Deal close rate** (% of consultations that result in credit purchase)

**If any of these metrics are below expected threshold, debug before scaling.**

---

## Sensitivity Analysis

| Assumption | Low Case | Base Case | High Case |
|-----------|---------|----------|-----------|
| Audits/month (month 12) | 50 | 150 | 400 |
| Lead capture rate | 20% | 30% | 40% |
| Consultation booking rate | 5% | 10% | 15% |
| Deal close rate | 1% | 2% | 3% |
| **Annual ARR (month 12)** | **$4,500** | **$20,250** | **$72,000** |

Even in the low case, product pays for itself. High case is venture-scale (path to millions).

---

## Conclusion

SpendLens is **profitable at scale** (>50 audits/month). The unit economics are defensible:
- CAC: $0 (organic growth)
- LTV: $50–$100 per lead
- LTV:CAC ratio: Infinite

**To reach $1M ARR**: Viral loop (shared audits) + Credex internal funnel + sales optimization required. Realistic 18-month timeline if execution is disciplined.
