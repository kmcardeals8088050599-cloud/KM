import { Car, Lead, ExchangeRequest, FilterState } from '../types';
import { INITIAL_CARS } from '../data/mockData';

const AUTH_TOKEN_KEY = 'km_admin_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export function filterCarsLocal(cars: Car[], filters: Partial<FilterState>): Car[] {
  let result = [...cars];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      c =>
        c.title.toLowerCase().includes(q) ||
        c.brand.toLowerCase().includes(q) ||
        c.model.toLowerCase().includes(q) ||
        c.color.toLowerCase().includes(q)
    );
  }

  if (filters.brand && filters.brand !== 'All') {
    result = result.filter(c => c.brand.toLowerCase() === filters.brand?.toLowerCase());
  }

  if (filters.model && filters.model !== 'All') {
    result = result.filter(c => c.model.toLowerCase() === filters.model?.toLowerCase());
  }

  if (filters.rto && filters.rto !== 'All') {
    result = result.filter(c => c.specs.rto.toLowerCase().includes(filters.rto?.toLowerCase() || ''));
  }

  if (filters.bodyType && filters.bodyType !== 'All') {
    result = result.filter(c => c.bodyType.toLowerCase() === filters.bodyType?.toLowerCase());
  }

  if (filters.fuelType && filters.fuelType !== 'All') {
    result = result.filter(c => c.fuelType.toLowerCase() === filters.fuelType?.toLowerCase());
  }

  if (filters.transmission && filters.transmission !== 'All') {
    result = result.filter(c => c.transmission.toLowerCase() === filters.transmission?.toLowerCase());
  }

  if (filters.status && filters.status !== 'All') {
    result = result.filter(c => c.status === filters.status);
  }

  if (filters.minPrice !== undefined) {
    result = result.filter(c => c.price >= (filters.minPrice || 0));
  }

  if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
    result = result.filter(c => c.price <= (filters.maxPrice || 100));
  }

  if (filters.minYear !== undefined) {
    result = result.filter(c => c.year >= (filters.minYear || 2010));
  }

  if (filters.maxYear !== undefined) {
    result = result.filter(c => c.year <= (filters.maxYear || 2026));
  }

  if (filters.sort === 'price-asc') {
    result.sort((a, b) => a.price - b.price);
  } else if (filters.sort === 'price-desc') {
    result.sort((a, b) => b.price - a.price);
  } else if (filters.sort === 'km-asc') {
    result.sort((a, b) => a.kilometers - b.kilometers);
  } else {
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return result;
}

export function createWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

// --- PUBLIC API (no auth required) ---

export async function fetchCars(): Promise<Car[]> {
  try {
    const res = await fetch('/api/cars');
    if (!res.ok) throw new Error('Failed to fetch from API');
    return await res.json();
  } catch (err) {
    console.warn('API unavailable, using local dataset:', err);
    return INITIAL_CARS;
  }
}

export async function submitLeadApi(lead: Partial<Lead>): Promise<Lead> {
  const res = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead)
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to submit inquiry');
  }
  return res.json();
}

export async function submitExchangeApi(data: Partial<ExchangeRequest>): Promise<ExchangeRequest> {
  const res = await fetch('/api/exchange-requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to submit exchange request');
  }
  return res.json();
}

// --- AUTH API ---

export async function loginApi(username: string, password: string): Promise<{ token: string; user: { name: string; role: string } }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Invalid credentials');
  }
  return res.json();
}

// --- ADMIN API (auth required) ---

export async function fetchAdminCars(): Promise<Car[]> {
  const res = await fetch('/api/cars', { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch cars');
  return res.json();
}

export async function fetchAdminLeads(): Promise<Lead[]> {
  const res = await fetch('/api/leads', { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch leads');
  return res.json();
}

export async function fetchAdminExchanges(): Promise<ExchangeRequest[]> {
  const res = await fetch('/api/exchange-requests', { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch exchange requests');
  return res.json();
}

export async function fetchAdminStats(): Promise<{
  totalCars: number;
  availableCars: number;
  soldCars: number;
  totalLeads: number;
  pendingLeads: number;
  totalExchanges: number;
}> {
  const res = await fetch('/api/stats', { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function createCarApi(car: Omit<Car, 'id' | 'createdAt' | 'rawPrice'>): Promise<Car> {
  const res = await fetch('/api/cars', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(car)
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to create car');
  }
  return res.json();
}

export async function updateCarApi(id: string, car: Partial<Car>): Promise<Car> {
  const res = await fetch(`/api/cars/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(car)
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to update car');
  }
  return res.json();
}

export async function deleteCarApi(id: string): Promise<boolean> {
  const res = await fetch(`/api/cars/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete car');
  return true;
}

export async function updateLeadStatusApi(id: string, status: string, notes?: string): Promise<Lead> {
  const res = await fetch(`/api/leads/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status, notes })
  });
  if (!res.ok) throw new Error('Failed to update lead');
  return res.json();
}

export async function updateExchangeStatusApi(id: string, status: string): Promise<ExchangeRequest> {
  const res = await fetch(`/api/exchange-requests/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update exchange request');
  return res.json();
}
