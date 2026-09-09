import { describe, it, expect } from 'vitest';
import { parseIndianPrice, parseOdometer, parseYear } from '../config.js';

describe('parseIndianPrice', () => {
  it('parses "32.5 lakh"', () => {
    expect(parseIndianPrice('32.5 lakh')).toBe(3250000);
  });
  it('parses "32.5L"', () => {
    expect(parseIndianPrice('32.5L')).toBe(3250000);
  });
  it('parses "₹32,50,000"', () => {
    expect(parseIndianPrice('₹32,50,000')).toBe(3250000);
  });
  it('parses "3250000"', () => {
    expect(parseIndianPrice('3250000')).toBe(3250000);
  });
  it('treats a small bare number as lakh', () => {
    expect(parseIndianPrice('12')).toBe(1200000);
  });
  it('returns null on nonsense', () => {
    expect(parseIndianPrice('not a price')).toBeNull();
  });
});

describe('parseOdometer', () => {
  it('parses "48,000 km"', () => {
    expect(parseOdometer('48,000 km')).toBe(48000);
  });
  it('parses "48k"', () => {
    expect(parseOdometer('48k')).toBe(48000);
  });
  it('parses "48000"', () => {
    expect(parseOdometer('48000')).toBe(48000);
  });
  it('returns null on nonsense', () => {
    expect(parseOdometer('forty k')).toBeNull();
  });
});

describe('parseYear', () => {
  it('parses "2022 model"', () => {
    expect(parseYear('2022 model')).toBe(2022);
  });
  it('parses "22" as 2022', () => {
    expect(parseYear('22')).toBe(2022);
  });
  it('parses "2019"', () => {
    expect(parseYear('2019')).toBe(2019);
  });
});