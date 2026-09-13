import { describe, it, expect } from 'vitest';
import { detectVehicleConflict } from '../intake.js';

describe('detectVehicleConflict', () => {
  const fortuner = { brand: 'Toyota', model: 'Fortuner', price: 3250000 };
  const thar = { brand: 'Mahindra', model: 'Thar LX' };
  const fortunerVariant = { brand: 'Toyota', model: 'Fortuner 2.8' };

  it('returns null when there is no prior data', () => {
    expect(detectVehicleConflict(null, fortuner as any)).toBeNull();
  });

  it('returns null when models match', () => {
    expect(detectVehicleConflict(fortuner as any, fortunerVariant as any)).toBeNull();
  });

  it('returns null when incoming model is still unknown', () => {
    expect(detectVehicleConflict(fortuner as any, { brand: 'Toyota', model: 'unknown' } as any)).toBeNull();
  });

  it('flags a genuinely different vehicle', () => {
    const reason = detectVehicleConflict(fortuner as any, thar as any);
    expect(reason).toContain('different vehicle');
    expect(reason).toContain('Thar');
  });

  it('flags the reverse direction too', () => {
    expect(detectVehicleConflict(thar as any, fortuner as any)).not.toBeNull();
  });
});