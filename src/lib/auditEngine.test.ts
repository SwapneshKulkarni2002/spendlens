import { describe, it, expect } from 'vitest';
import { runAudit } from './auditEngine';
import type { AuditInput } from '../types';

describe('auditEngine', () => {
  it('flags Cursor Business for small team as high severity', () => {
    const input: AuditInput = {
      tools: [{ toolId: 'cursor', plan: 'business', seats: 2, monthlySpend: 80 }],
      teamSize: 2,
      useCase: 'coding',
    };
    const result = runAudit(input);
    const rec = result.recommendations[0];
    expect(rec.severity).toBe('high');
    expect(rec.monthlySavings).toBeGreaterThan(0);
    expect(rec.recommendedPlan).toBe('Pro');
  });

  it('marks Cursor Pro as optimal', () => {
    const input: AuditInput = {
      tools: [{ toolId: 'cursor', plan: 'pro', seats: 3, monthlySpend: 60 }],
      teamSize: 3,
      useCase: 'coding',
    };
    const result = runAudit(input);
    expect(result.recommendations[0].severity).toBe('optimal');
    expect(result.totalMonthlySavings).toBe(0);
  });

  it('flags Claude Team with fewer than 5 seats as high severity', () => {
    const input: AuditInput = {
      tools: [{ toolId: 'claude', plan: 'team', seats: 3, monthlySpend: 90 }],
      teamSize: 3,
      useCase: 'writing',
    };
    const result = runAudit(input);
    const rec = result.recommendations[0];
    expect(rec.severity).toBe('high');
    expect(rec.monthlySavings).toBeGreaterThan(0);
  });

  it('flags GitHub Copilot Enterprise for small team as high severity', () => {
    const input: AuditInput = {
      tools: [{ toolId: 'github_copilot', plan: 'enterprise', seats: 4, monthlySpend: 156 }],
      teamSize: 4,
      useCase: 'coding',
    };
    const result = runAudit(input);
    const rec = result.recommendations[0];
    expect(rec.severity).toBe('high');
    expect(rec.monthlySavings).toBeGreaterThan(0);
  });

  it('flags high Anthropic API spend with credexOpportunity', () => {
    const input: AuditInput = {
      tools: [{ toolId: 'anthropic_api', plan: 'api', seats: 1, monthlySpend: 1500 }],
      teamSize: 5,
      useCase: 'mixed',
    };
    const result = runAudit(input);
    const rec = result.recommendations[0];
    expect(rec.credexOpportunity).toBe(true);
    expect(rec.monthlySavings).toBeGreaterThan(0);
  });

  it('sets showCredex=true when savings exceed $500/mo', () => {
    const input: AuditInput = {
      tools: [
        { toolId: 'claude', plan: 'max_20x', seats: 5, monthlySpend: 1000 },
        { toolId: 'openai_api', plan: 'api', seats: 1, monthlySpend: 2000 },
      ],
      teamSize: 5,
      useCase: 'mixed',
    };
    const result = runAudit(input);
    expect(result.showCredex).toBe(true);
    expect(result.totalMonthlySavings).toBeGreaterThan(500);
  });

  it('correctly calculates total monthly and annual savings', () => {
    const input: AuditInput = {
      tools: [
        { toolId: 'cursor', plan: 'business', seats: 3, monthlySpend: 120 },
        { toolId: 'github_copilot', plan: 'enterprise', seats: 3, monthlySpend: 117 },
      ],
      teamSize: 3,
      useCase: 'coding',
    };
    const result = runAudit(input);
    expect(result.totalMonthlySavings).toBeGreaterThan(0);
    expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12);
  });

  it('marks Windsurf Teams for small team as high severity', () => {
    const input: AuditInput = {
      tools: [{ toolId: 'windsurf', plan: 'teams', seats: 2, monthlySpend: 70 }],
      teamSize: 2,
      useCase: 'coding',
    };
    const result = runAudit(input);
    expect(result.recommendations[0].severity).toBe('high');
  });

  it('isOptimal is true when savings are under $100', () => {
    const input: AuditInput = {
      tools: [{ toolId: 'cursor', plan: 'pro', seats: 2, monthlySpend: 40 }],
      teamSize: 2,
      useCase: 'coding',
    };
    const result = runAudit(input);
    expect(result.isOptimal).toBe(true);
  });
});
