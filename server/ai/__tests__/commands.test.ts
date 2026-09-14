import { describe, it, expect } from 'vitest';
import { detectAdminCommand } from '../db.js';

describe('detectAdminCommand', () => {
  it('detects show pending', () => {
    expect(detectAdminCommand('show pending')).toEqual({ command: 'show_pending' });
  });
  it('detects show today', () => {
    expect(detectAdminCommand("show today's submissions")).toEqual({ command: 'show_today' });
  });
  it('detects approve with id', () => {
    const r = detectAdminCommand('approve vd-123');
    expect(r?.command).toBe('approve');
    expect(r?.draftId).toBe('vd-123');
  });
  it('detects change price', () => {
    const r = detectAdminCommand('change price of vd-4 to 31.75 lakh');
    expect(r?.command).toBe('change_price');
    expect(r?.draftId).toBe('vd-4');
    expect(r?.value).toContain('31.75');
  });
  it('detects publish', () => {
    expect(detectAdminCommand('publish vd-9')).toEqual({ command: 'publish', draftId: 'vd-9' });
  });
  it('detects mark sold', () => {
    expect(detectAdminCommand('mark sold vd-9')).toEqual({ command: 'mark_sold', draftId: 'vd-9' });
  });
  it('detects regenerate images', () => {
    expect(detectAdminCommand('regenerate images vd-2')).toEqual({ command: 'regenerate_images', draftId: 'vd-2' });
  });
  it('returns null for junk', () => {
    expect(detectAdminCommand('hello there')).toBeNull();
  });
  it('does NOT treat a car description containing a command word as a command', () => {
    expect(detectAdminCommand('ready to publish this Toyota Fortuner 2022, 48000 km')).toBeNull();
    expect(detectAdminCommand('I want to approve the loan for this Thar')).toBeNull();
    expect(detectAdminCommand('not rejected, just a scratch on the bumper')).toBeNull();
  });
  it('still detects an anchored command verb', () => {
    expect(detectAdminCommand('publish KMC-1042')?.command).toBe('publish');
    expect(detectAdminCommand('Mark KMC-1042 sold')?.command).toBe('mark_sold');
  });
});