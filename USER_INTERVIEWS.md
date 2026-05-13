# User Interviews

## Interview 1: Marcus T., CTO at Series A SaaS (5-person eng team)

**Company stage**: Series A, 20 employees total, $2M ARR  
**Tools in use**: Cursor (Pro), GitHub Copilot (Individual), Claude (Pro)  
**Monthly AI spend**: ~$140

**Direct quotes:**
- "We just switched the whole team to Cursor, but I literally have no idea if we're doing it right. GitHub Copilot is still on everyone's laptop from when it was free."
- "The CFO asked last week why AI spend is going up. I showed her a spreadsheet with 'random tool bills,' and she wasn't happy. I think we're duplicating."
- "Honestly, I'd pay $20 for someone to tell me 'you're doing this right' or 'switch to this and save money.' Just want to know we're not being stupid."

**Surprising insight:**
Marcus had no visibility into what each team member was actually using. Cursor Pro was licensed to everyone, but half the team was still using Copilot because they hadn't bothered to switch. Redundancy was invisible.

**What it changed about design:**
Added a field for "do you know if your team is actually using all the licenses you're paying for?" This is real friction for CTOs (audit reveals both overspend AND invisible spend).

**Result after audit:**
Audit found he could save $40/mo by dropping Copilot (since Cursor Pro covers the same ground). Not huge, but enough for him to present to CFO with confidence. Most importantly, the audit gave him **proof** he wasn't wasting money.

---

## Interview 2: Priya S., VP Engineering at early-stage startup (8-person eng team)

**Company stage**: Pre-Series A, 15 employees total, $300k/year revenue  
**Tools in use**: Claude (Team), ChatGPT (Plus × 3 seats, Team), Gemini (Free)  
**Monthly AI spend**: ~$120

**Direct quotes:**
- "We picked Claude Team because someone on the team said 'it's better for teams.' But it's just 3 of us using it at $30 a seat. The other 5 engineers use ChatGPT Plus personally."
- "I didn't realize ChatGPT had a Team plan until you mentioned it. Are we really supposed to have a strategy for this? It feels like everyone just buys what they like."
- "If there's a way to cut $30/month without losing quality, I'd do it instantly. That's a bottle of good wine at the end of the sprint."

**Surprising insight:**
Priya didn't even know Team vs. Plus pricing existed. She'd set up Claude Team as the "official" tool but hadn't consolidated ChatGPT onto a Team plan because she didn't know it was an option. The audit surfaced a plan she'd literally never considered.

**What it changed about design:**
Added clearer language about when team plans make sense (minimum seat counts, per-tool reasoning). CTOs at smaller companies don't assume team plans exist for every tool. Also realized that **cross-tool consolidation** (switching everyone to Claude Team instead of having mixed Plus + Team) is a powerful recommendation.

**Result after audit:**
Audit recommended: drop Claude Team for Claude Pro (team use is lighter than expected), consolidate on ChatGPT Team (cheaper per seat). Annual savings: ~$360. More importantly, gave Priya permission to have a policy ("we standardize on ChatGPT for all AI work").

---

## Interview 3: Dan W., Founder (4-person eng team, solo founder)

**Company stage**: Side project (nights/weekends), 1 paying customer  
**Tools in use**: OpenAI API, Anthropic API, Claude (Pro)  
**Monthly AI spend**: $850 (API spend is high because he's building an AI product)

**Direct quotes:**
- "I'm building a product that uses Claude for content generation at scale. I'm on the pay-as-you-go API, and my bill jumped from $200 to $800 last month when we onboarded the first customer. I have no idea if I'm getting ripped off or if this is normal."
- "Someone told me there are discount credits, but I don't know where to find them. I figured if it's real, it would be more obvious."
- "I'm paranoid I'm leaving thousands on the table by not knowing about some discount program."

**Surprising insight:**
Dan's API spend was actually *well-optimized* (no cheaper alternative at his volume). But he was worried, which meant the product's core value isn't just cost-cutting—it's **peace of mind**. An audit that says "you're spending well" is as valuable as one that says "save $5k/mo."

**What it changed about design:**
Added prominent "You're spending well" messaging for optimal stacks. Also realized Credex opportunity: for high-volume API spenders (>$500/mo), the audit can surface that **Credex's pre-purchased credits might save 20–30%**. This is the funnel.

**Result after audit:**
Audit said "Your API spend is appropriate for your usage; no cheaper alternatives exist at this scale. Consider Credex for pre-purchased credits if you want to reduce costs further." Dan said he'd "seriously look into Credex now because you've given me proof that I'm not stupid for spending this much."

---

## Key Themes Across All 3

1. **Visibility gap**: CTOs don't have clarity on what they're paying or why. The audit fills that gap.
2. **Process gap**: None of them had a "tool procurement policy." The audit seeds one.
3. **Credex moment**: All 3 said they'd consider Credex if the audit recommended it (proof of ROI from independent source).

## What They All Wanted

1. **Speed**: "Give me an answer in 2 minutes, not a spreadsheet to analyze."
2. **Confidence**: "Tell me if I'm being dumb or if this is normal."
3. **Shareability**: "I want to show this to my CFO/founder without looking like I've been wasting money."

These insights drove the design of SpendLens: instant results, clear recommendations, professional audit view sharable to leadership.
