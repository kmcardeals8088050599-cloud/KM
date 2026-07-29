/**
 * Price Drop Alert system for KM Car Deals
 *
 * Customers subscribe to a car by phone number.
 * When that car's price is updated (downward), they get a WhatsApp alert.
 *
 * Supabase table required (run in Supabase SQL editor):
 *
 *   CREATE TABLE IF NOT EXISTS price_alerts (
 *     id TEXT PRIMARY KEY,
 *     car_id TEXT NOT NULL,
 *     car_title TEXT NOT NULL,
 *     phone TEXT NOT NULL,
 *     subscribed_at TIMESTAMP DEFAULT now(),
 *     notified_at TIMESTAMP,
 *     is_active BOOLEAN DEFAULT true
 *   );
 *   CREATE INDEX IF NOT EXISTS idx_price_alerts_car ON price_alerts(car_id);
 */

import { supabase } from './supabase.js';

export interface PriceAlert {
  id: string;
  carId: string;
  carTitle: string;
  phone: string;
  subscribedAt: string;
  notifiedAt?: string;
  isActive: boolean;
}

function generateAlertId(): string {
  return `alert-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function subscribePriceAlert(
  carId: string,
  carTitle: string,
  phone: string
): Promise<PriceAlert> {
  // Check if already subscribed
  const { data: existing } = await supabase
    .from('price_alerts')
    .select('*')
    .eq('car_id', carId)
    .eq('phone', phone)
    .eq('is_active', true)
    .single();

  if (existing) {
    return {
      id: existing.id,
      carId: existing.car_id,
      carTitle: existing.car_title,
      phone: existing.phone,
      subscribedAt: existing.subscribed_at,
      notifiedAt: existing.notified_at,
      isActive: existing.is_active
    };
  }

  const id = generateAlertId();
  const { data, error } = await supabase
    .from('price_alerts')
    .insert({
      id,
      car_id: carId,
      car_title: carTitle,
      phone,
      is_active: true,
      subscribed_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create price alert: ${error.message}`);
  return {
    id: data.id,
    carId: data.car_id,
    carTitle: data.car_title,
    phone: data.phone,
    subscribedAt: data.subscribed_at,
    isActive: data.is_active
  };
}

export async function getAlertsForCar(carId: string): Promise<PriceAlert[]> {
  const { data, error } = await supabase
    .from('price_alerts')
    .select('*')
    .eq('car_id', carId)
    .eq('is_active', true);

  if (error) return [];
  return (data || []).map(r => ({
    id: r.id,
    carId: r.car_id,
    carTitle: r.car_title,
    phone: r.phone,
    subscribedAt: r.subscribed_at,
    notifiedAt: r.notified_at,
    isActive: r.is_active
  }));
}

export async function markAlertNotified(alertId: string): Promise<void> {
  await supabase
    .from('price_alerts')
    .update({ notified_at: new Date().toISOString(), is_active: false })
    .eq('id', alertId);
}

export async function getAllActiveAlerts(): Promise<PriceAlert[]> {
  const { data } = await supabase
    .from('price_alerts')
    .select('*')
    .eq('is_active', true)
    .order('subscribed_at', { ascending: false });
  return (data || []).map(r => ({
    id: r.id,
    carId: r.car_id,
    carTitle: r.car_title,
    phone: r.phone,
    subscribedAt: r.subscribed_at,
    notifiedAt: r.notified_at,
    isActive: r.is_active
  }));
}
