import { describe, it, expect } from 'vitest';
import { normalizeExtraction } from '../extraction.js';

describe('normalizeExtraction', () => {
  const input = {
    conversationId: 'conv-test',
    transcript: 'Toyota Fortuner 2022 2.8 diesel automatic 48k first owner 32.5 lakh',
    existing: {},
    lockedFields: [],
  };

  it('maps a raw extraction into the canonical shape with provenance', () => {
    const result = normalizeExtraction(
      {
        brand: 'Toyota',
        model: 'Fortuner',
        manufacturing_year: 2022,
        fuel_type: 'Diesel',
        transmission: 'Automatic',
        odometer_km: 48000,
        owner_count: '1st Owner',
        price: 3250000,
        unknown: ['color', 'variant'],
        provenance: {
          brand: { source: 'whatsapp_text', confidence: 'high' },
          price: { source: 'whatsapp_text', confidence: 'high' },
        },
      },
      input
    );

    expect(result.data.brand).toBe('Toyota');
    expect(result.data.price).toBe(3250000);
    expect(result.data.odometerKm).toBe(48000);
    expect(result.provenance.brand?.source).toBe('whatsapp_text');
    expect(result.provenance.brand?.confidence).toBe('high');
    expect(result.unknown).toContain('color');
  });

  it('respects locked fields (human-edited values survive)', () => {
    const result = normalizeExtraction(
      {
        price: 1000,
        brand: 'Hacked',
      },
      {
        conversationId: 'conv',
        transcript: 'Toyota',
        existing: {
          brand: 'Toyota',
          model: 'Fortuner',
          price: 3250000,
        },
        lockedFields: ['price'],
      }
    );
    // price is locked → AI value cannot overwrite
    expect(result.data.price).toBe(3250000);
    // brand is not locked → update applies
    expect(result.data.brand).toBe('Hacked');
  });

  it('never fabricates: unknown values stay null', () => {
    const result = normalizeExtraction({ brand: 'Toyota' }, input);
    expect(result.data.model).toBeUndefined();
    expect(result.unknown.length).toBeGreaterThanOrEqual(0);
  });

  it('coerces a string features list before validation (Ollama quirk)', () => {
    const result = normalizeExtraction(
      { features: 'Sunroof, ABS, Airbags and Cruise Control' } as unknown as Parameters<typeof normalizeExtraction>[0],
      input
    );
    expect(result.data.features).toEqual(['Sunroof', 'ABS', 'Airbags', 'Cruise Control']);
  });

  it('coerces a string unknown list', () => {
    const result = normalizeExtraction(
      { unknown: 'color, variant' } as unknown as Parameters<typeof normalizeExtraction>[0],
      input
    );
    expect(result.unknown).toEqual(['color', 'variant']);
  });

  it('coerces loose numeric strings and drops malformed ones', () => {
    const result = normalizeExtraction(
      {
        engine_cc: '1200cc',
        odometer_km: '48,000 km',
        manufacturing_year: '2022',
        price: '32.5 lakh',
      } as unknown as Parameters<typeof normalizeExtraction>[0],
      input
    );
    expect(result.data.engineCc).toBe(1200);
    expect(result.data.odometerKm).toBe(48000);
    expect(result.data.manufacturingYear).toBe(2022);
    expect(result.data.price).toBe(3250000);
  });

  it('never lets a malformed numeric value abort normalization', () => {
    const result = normalizeExtraction(
      { engine_cc: 'abc', odometer_km: 'not-a-number' } as unknown as Parameters<typeof normalizeExtraction>[0],
      input
    );
    expect(result.data.engineCc).toBeUndefined();
    expect(result.data.odometerKm).toBeUndefined();
  });
});