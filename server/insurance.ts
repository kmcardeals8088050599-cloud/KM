/**
 * Insurance expiry utilities for KM Car Deals
 * Parses insuranceType strings like "Comprehensive (Valid till Nov 2026)"
 * or "Zero-Dep (Valid till Jan 2027)"
 */

const MONTH_MAP: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
};

/**
 * Parses "Valid till MMM YYYY" from insuranceType string.
 * Returns a Date set to the last day of that month, or null if not parseable.
 */
export function parseInsuranceExpiry(insuranceType: string): Date | null {
  if (!insuranceType) return null;
  // Match patterns like: "till Nov 2026" / "till Jan 2027" / "till Dec 2025"
  const match = insuranceType.match(/till\s+([A-Za-z]{3})\s+(\d{4})/i);
  if (!match) return null;
  const monthKey = match[1].toLowerCase();
  const year = parseInt(match[2]);
  const month = MONTH_MAP[monthKey];
  if (month === undefined || isNaN(year)) return null;
  // Last day of that month
  const d = new Date(year, month + 1, 0);
  return d;
}

export interface InsuranceAlert {
  carId: string;
  title: string;
  insuranceType: string;
  expiryDate: Date;
  daysUntilExpiry: number;
  isExpired: boolean;
}

/**
 * Returns cars whose insurance expires within `withinDays` days (default 60).
 * Also returns already-expired cars (daysUntilExpiry < 0).
 */
export function getInsuranceAlerts(
  cars: { id: string; title: string; insuranceType: string; status: string }[],
  withinDays = 60
): InsuranceAlert[] {
  const now = new Date();
  const alerts: InsuranceAlert[] = [];

  for (const car of cars) {
    if (car.status === 'Sold') continue; // sold cars don't matter
    const expiry = parseInsuranceExpiry(car.insuranceType);
    if (!expiry) continue;
    const msLeft = expiry.getTime() - now.getTime();
    const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
    if (daysLeft <= withinDays) {
      alerts.push({
        carId: car.id,
        title: car.title,
        insuranceType: car.insuranceType,
        expiryDate: expiry,
        daysUntilExpiry: daysLeft,
        isExpired: daysLeft < 0
      });
    }
  }

  return alerts.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
}
