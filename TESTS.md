# Test Coverage

## Audit Engine Tests

**File**: `src/lib/auditEngine.test.ts`

### Test Suite: auditEngine (9 tests)

1. **flags Cursor Business for small team as high severity**
   - Verifies: Small teams (2-3 seats) on Cursor Business are flagged as overspending
   - Expected: severity='high', savings > 0, recommendedPlan='Pro'

2. **marks Cursor Pro as optimal**
   - Verifies: Cursor Pro is never downgraded
   - Expected: severity='optimal', totalMonthlySavings=0

3. **flags Claude Team with fewer than 5 seats as high severity**
   - Verifies: Claude Team (which requires 5-seat minimum) is overspend for smaller teams
   - Expected: severity='high', monthlySavings > 0

4. **flags GitHub Copilot Enterprise for small team as high severity**
   - Verifies: Copilot Enterprise unnecessary for <5 seats
   - Expected: severity='high', downgrade to Business recommended

5. **flags high Anthropic API spend with credexOpportunity**
   - Verifies: Anthropic API > $1k/mo triggers credexOpportunity flag
   - Expected: credexOpportunity=true, monthlySavings > 0

6. **sets showCredex=true when savings exceed $500/mo**
   - Verifies: Multi-tool audit with >$500 total monthly savings shows Credex CTA
   - Expected: showCredex=true, totalMonthlySavings > 500

7. **correctly calculates total monthly and annual savings**
   - Verifies: Annual savings = monthly savings × 12
   - Expected: totalAnnualSavings = totalMonthlySavings * 12

8. **marks Windsurf Teams for small team as high severity**
   - Verifies: Windsurf Teams overkill for 1-2 seats
   - Expected: severity='high'

9. **isOptimal is true when savings are under $100**
   - Verifies: Low-savings audits correctly marked as already-optimized
   - Expected: isOptimal=true

### How to Run

```bash
# Run once
npm test

# Watch mode
npm run test:watch
```

Both commands use Vitest (already installed in devDependencies).

## Coverage Gaps (Acceptable)

The following are not tested (by design):

- **UI components**: Requires jsdom/react-testing-library. Pure logic (audit engine) is tested; UI is verified manually during development.
- **Supabase integration**: Would require mocking Supabase client. Focus is on business logic.
- **Edge functions**: Would require Deno test environment. Verified via manual deployment.

## CI/CD Integration

Tests run automatically on every push to main via `.github/workflows/ci.yml`. See that file for the workflow definition.

## Test Philosophy

Tests cover the **core audit logic** — the part that generates recommendations. This is the "source of truth" for financial reasoning. If these tests pass, the audit recommendations are correct by definition.

UI/UX testing is done manually during development (faster feedback loop, more context for design decisions).
