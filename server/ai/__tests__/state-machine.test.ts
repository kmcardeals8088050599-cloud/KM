import { describe, it, expect } from 'vitest';
import { canTransition, assertTransition, derivePostExtractionState } from '../state-machine.js';

describe('state machine', () => {
  it('allows RECEIVED → PROCESSING via system', () => {
    expect(canTransition('RECEIVED', 'PROCESSING', 'system')).toBe(true);
  });

  it('allows PROCESSING → READY_FOR_REVIEW via system', () => {
    expect(canTransition('PROCESSING', 'READY_FOR_REVIEW', 'system')).toBe(true);
  });

  it('allows PROCESSING → INCOMPLETE via system', () => {
    expect(canTransition('PROCESSING', 'INCOMPLETE', 'system')).toBe(true);
  });

  it('allows READY_FOR_REVIEW → APPROVED via admin or system (auto-publish)', () => {
    expect(canTransition('READY_FOR_REVIEW', 'APPROVED', 'admin')).toBe(true);
    expect(canTransition('READY_FOR_REVIEW', 'APPROVED', 'system')).toBe(true);
  });

  it('allows APPROVED → PUBLISHED via system', () => {
    expect(canTransition('APPROVED', 'PUBLISHED', 'system')).toBe(true);
  });

  it('allows PROCESSING_FAILED → PROCESSING via system (retry)', () => {
    expect(canTransition('PROCESSING_FAILED', 'PROCESSING', 'system')).toBe(true);
  });

  it('blocks invalid transitions with a throw', () => {
    expect(() => assertTransition('RECEIVED', 'PUBLISHED', 'system')).toThrow();
  });

  it('blocks system from publishing without approval', () => {
    expect(canTransition('READY_FOR_REVIEW', 'PUBLISHED', 'system')).toBe(false);
  });
});

describe('derivePostExtractionState', () => {
  it('reviews when all required present', () => {
    expect(derivePostExtractionState(7, 7, 4, 10)).toBe('READY_FOR_REVIEW');
  });
  it('incomplete when partial', () => {
    expect(derivePostExtractionState(5, 8, 5, 10)).toBe('INCOMPLETE');
  });
  it('failed when barely anything extracted', () => {
    expect(derivePostExtractionState(1, 8, 1, 10)).toBe('PROCESSING_FAILED');
  });
});