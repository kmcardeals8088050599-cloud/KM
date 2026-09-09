import { describe, it, expect } from 'vitest';
import { computeCompletion, validateDraft, detectConflicts } from '../validation.js';
import type { VehicleExtractedData } from '../../../src/types/ai.js';

const complete: VehicleExtractedData = {
  brand: 'Toyota',
  model: 'Fortuner',
  manufacturingYear: 2022,
  fuelType: 'Diesel',
  transmission: 'Automatic',
  bodyType: 'SUV',
  ownerCount: '1st Owner',
  price: 3250000,
  odometerKm: 48000,
};

describe('computeCompletion', () => {
  it('counts required + desired', () => {
    const r = computeCompletion(complete);
    expect(r.missingRequired).toHaveLength(0);
    expect(r.requiredTotal).toBeGreaterThan(0);
    expect(r.desiredPresent).toBeGreaterThanOrEqual(1);
  });

  it('flags missing price', () => {
    const r = computeCompletion({ ...complete, price: undefined });
    expect(r.missingRequired).toContain('price');
  });
});

describe('validateDraft', () => {
  it('is ready to review when complete', () => {
    const r = validateDraft(complete);
    expect(r.readyToReview).toBe(true);
  });

  it('produces a compact follow-up request', () => {
    const r = validateDraft({ ...complete, price: undefined, odometerKm: undefined });
    expect(r.readyToReview).toBe(false);
    expect(r.missingFieldRequest?.message).toContain('need');
    expect(r.missingFieldRequest?.missing).toContain('price');
  });
});

describe('detectConflicts', () => {
  it('catches registration year before manufacturing year', () => {
    const issues = detectConflicts({
      ...complete,
      manufacturingYear: 2022,
      registrationYear: 2021,
    });
    expect(issues.length).toBeGreaterThan(0);
  });

  it('no conflicts on a clean vehicle', () => {
    const issues = detectConflicts({
      ...complete,
      manufacturingYear: 2022,
      registrationYear: 2022,
    });
    expect(issues).toHaveLength(0);
  });
});