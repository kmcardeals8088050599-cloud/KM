import { supabase } from './supabase.ts';
import { Car, Lead, ExchangeRequest } from '../src/types/index.ts';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

// Convert snake_case DB row to camelCase app object
function rowToCar(row: any): Car {
  return {
    id: row.id,
    title: row.title,
    brand: row.brand,
    model: row.model,
    variant: row.variant || '',
    year: row.year,
    price: Number(row.price),
    rawPrice: Number(row.raw_price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    kilometers: row.kilometers,
    fuelType: row.fuel_type,
    transmission: row.transmission,
    bodyType: row.body_type,
    ownerCount: row.owner_count || '1st Owner',
    color: row.color || 'Black',
    location: row.location || 'Kalaburagi',
    status: row.status,
    isFeatured: row.is_featured,
    isCertified: row.is_certified,
    registrationYear: row.registration_year,
    insuranceType: row.insurance_type || 'Comprehensive',
    engineCapacity: row.engine_capacity,
    images: row.images || [],
    features: row.features || [],
    description: row.description || '',
    specs: row.specs || { rto: '', mileage: '', power: '', seatingCapacity: 5 },
    createdAt: row.created_at
  };
}

function rowToLead(row: any): Lead {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    carId: row.car_id,
    carTitle: row.car_title,
    type: row.type || 'Inquiry',
    message: row.message || '',
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at
  };
}

function rowToExchange(row: any): ExchangeRequest {
  return {
    id: row.id,
    customerName: row.customer_name,
    phone: row.phone,
    currentBrand: row.current_brand,
    currentModel: row.current_model,
    currentYear: row.current_year,
    currentKilometers: row.current_kilometers,
    fuelType: row.fuel_type,
    transmission: row.transmission,
    expectedPrice: Number(row.expected_price),
    comments: row.comments || '',
    images: row.images || [],
    targetCarId: row.target_car_id,
    targetCarTitle: row.target_car_title,
    status: row.status,
    createdAt: row.created_at
  };
}

function carToRow(car: Partial<Car>): Record<string, any> {
  const row: Record<string, any> = {};
  if (car.title !== undefined) row.title = car.title;
  if (car.brand !== undefined) row.brand = car.brand;
  if (car.model !== undefined) row.model = car.model;
  if (car.variant !== undefined) row.variant = car.variant;
  if (car.year !== undefined) row.year = car.year;
  if (car.price !== undefined) {
    row.price = car.price;
    row.raw_price = Math.round(car.price * 100000);
  }
  if (car.kilometers !== undefined) row.kilometers = car.kilometers;
  if (car.fuelType !== undefined) row.fuel_type = car.fuelType;
  if (car.transmission !== undefined) row.transmission = car.transmission;
  if (car.bodyType !== undefined) row.body_type = car.bodyType;
  if (car.ownerCount !== undefined) row.owner_count = car.ownerCount;
  if (car.color !== undefined) row.color = car.color;
  if (car.location !== undefined) row.location = car.location;
  if (car.status !== undefined) row.status = car.status;
  if (car.isFeatured !== undefined) row.is_featured = car.isFeatured;
  if (car.isCertified !== undefined) row.is_certified = car.isCertified;
  if (car.registrationYear !== undefined) row.registration_year = car.registrationYear;
  if (car.insuranceType !== undefined) row.insurance_type = car.insuranceType;
  if (car.engineCapacity !== undefined) row.engine_capacity = car.engineCapacity;
  if (car.images !== undefined) row.images = car.images;
  if (car.features !== undefined) row.features = car.features;
  if (car.description !== undefined) row.description = car.description;
  if (car.specs !== undefined) row.specs = car.specs;
  return row;
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// --- CAR OPERATIONS ---

export async function getAllCars(): Promise<Car[]> {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(`Failed to fetch cars: ${error.message}`);
  return (data || []).map(rowToCar);
}

export async function getCarById(id: string): Promise<Car | null> {
  const { data, error } = await supabase.from('cars').select('*').eq('id', id).single();
  if (error || !data) return null;
  return rowToCar(data);
}

export async function createCar(car: Omit<Car, 'id' | 'createdAt' | 'rawPrice'>): Promise<Car> {
  const id = generateId('car');
  const row = {
    id,
    ...carToRow(car),
    created_at: new Date().toISOString()
  };
  const { data, error } = await supabase.from('cars').insert(row).select().single();
  if (error) throw new Error(`Failed to create car: ${error.message}`);
  return rowToCar(data);
}

export async function updateCar(id: string, updates: Partial<Car>): Promise<Car> {
  const row = carToRow(updates);
  const { data, error } = await supabase.from('cars').update(row).eq('id', id).select().single();
  if (error) throw new Error(`Failed to update car: ${error.message}`);
  return rowToCar(data);
}

export async function deleteCar(id: string): Promise<void> {
  const { error } = await supabase.from('cars').delete().eq('id', id);
  if (error) throw new Error(`Failed to delete car: ${error.message}`);
}

// --- LEAD OPERATIONS ---

export async function getAllLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(`Failed to fetch leads: ${error.message}`);
  return (data || []).map(rowToLead);
}

export async function createLead(lead: Omit<Lead, 'id' | 'createdAt'>): Promise<Lead> {
  const id = generateId('lead');
  const row = {
    id,
    name: lead.name,
    phone: lead.phone,
    email: lead.email || null,
    car_id: lead.carId || null,
    car_title: lead.carTitle || null,
    type: lead.type || 'Inquiry',
    message: lead.message || '',
    status: lead.status || 'New',
    created_at: new Date().toISOString()
  };
  const { data, error } = await supabase.from('leads').insert(row).select().single();
  if (error) throw new Error(`Failed to create lead: ${error.message}`);
  return rowToLead(data);
}

export async function updateLead(id: string, updates: { status?: string; notes?: string }): Promise<Lead> {
  const row: Record<string, any> = {};
  if (updates.status) row.status = updates.status;
  if (updates.notes !== undefined) row.notes = updates.notes;
  const { data, error } = await supabase.from('leads').update(row).eq('id', id).select().single();
  if (error) throw new Error(`Failed to update lead: ${error.message}`);
  return rowToLead(data);
}

// --- EXCHANGE OPERATIONS ---

export async function getAllExchanges(): Promise<ExchangeRequest[]> {
  const { data, error } = await supabase
    .from('exchange_requests')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(`Failed to fetch exchanges: ${error.message}`);
  return (data || []).map(rowToExchange);
}

export async function createExchange(exchange: Omit<ExchangeRequest, 'id' | 'createdAt'>): Promise<ExchangeRequest> {
  const id = generateId('ex');
  const row = {
    id,
    customer_name: exchange.customerName,
    phone: exchange.phone,
    current_brand: exchange.currentBrand,
    current_model: exchange.currentModel,
    current_year: exchange.currentYear,
    current_kilometers: exchange.currentKilometers,
    fuel_type: exchange.fuelType,
    transmission: exchange.transmission,
    expected_price: exchange.expectedPrice,
    comments: exchange.comments || '',
    images: exchange.images || [],
    target_car_id: exchange.targetCarId || null,
    target_car_title: exchange.targetCarTitle || null,
    status: exchange.status || 'New',
    created_at: new Date().toISOString()
  };
  const { data, error } = await supabase.from('exchange_requests').insert(row).select().single();
  if (error) throw new Error(`Failed to create exchange: ${error.message}`);
  return rowToExchange(data);
}

export async function updateExchange(id: string, updates: { status?: string }): Promise<ExchangeRequest> {
  const row: Record<string, any> = {};
  if (updates.status) row.status = updates.status;
  const { data, error } = await supabase.from('exchange_requests').update(row).eq('id', id).select().single();
  if (error) throw new Error(`Failed to update exchange: ${error.message}`);
  return rowToExchange(data);
}

// --- AUTH OPERATIONS ---

export async function findUserByUsername(username: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();
  if (error || !data) return null;
  return data;
}

export async function createUser(username: string, password: string, name: string, role: string = 'admin') {
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const { data, error } = await supabase
    .from('users')
    .insert({ username, password_hash: hash, name, role })
    .select()
    .single();
  if (error) throw new Error(`Failed to create user: ${error.message}`);
  return data;
}

export async function ensureDefaultAdmin() {
  const defaultPassword = process.env.ADMIN_PASSWORD || 'kmadmin2026';
  const existing = await findUserByUsername('admin');
  if (!existing) {
    await createUser('admin', defaultPassword, 'KM Admin', 'admin');
    console.log(`[AUTH] Default admin created. Username: admin, Password: ${defaultPassword}`);
    console.log('[AUTH] CHANGE THIS PASSWORD IN PRODUCTION!');
  }
}
