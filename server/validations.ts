import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required').max(50),
  password: z.string().min(1, 'Password is required').max(100)
});

export const createCarSchema = z.object({
  title: z.string().min(1).max(200),
  brand: z.string().min(1).max(50),
  model: z.string().min(1).max(100),
  year: z.number().int().min(1990).max(2030),
  fuelType: z.enum(['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid']),
  transmission: z.enum(['Manual', 'Automatic']),
  bodyType: z.enum(['SUV', 'Sedan', 'Hatchback', 'Luxury', 'MUV']),
  ownerCount: z.string().max(20).optional(),
  status: z.enum(['Available', 'Reserved', 'Sold']).optional(),
  images: z.array(z.string().url().or(z.string().startsWith('/'))).max(10).optional(),
  specs: z.object({
    rto: z.string().optional()
  }).optional()
});

export const updateCarSchema = createCarSchema.partial();

export const createLeadSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().min(5).max(20),
  email: z.string().email().max(200).optional(),
  carId: z.string().optional(),
  carTitle: z.string().max(200).optional(),
  type: z.enum(['Inquiry', 'TestDrive', 'Sell', 'General']).optional(),
  message: z.string().max(2000).optional()
});

export const updateLeadSchema = z.object({
  status: z.enum(['New', 'Contacted', 'Test Drive Scheduled', 'Closed']).optional(),
  notes: z.string().max(2000).optional()
});

export const createExchangeSchema = z.object({
  customerName: z.string().min(1).max(100),
  phone: z.string().min(5).max(20),
  currentBrand: z.string().min(1).max(50),
  currentModel: z.string().min(1).max(100),
  currentYear: z.number().int().min(1990).max(2030).optional(),
  currentKilometers: z.number().int().min(0).max(999999).optional(),
  fuelType: z.enum(['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid']).optional(),
  transmission: z.enum(['Manual', 'Automatic']).optional(),
  expectedPrice: z.number().min(0).max(500).optional(),
  comments: z.string().max(2000).optional(),
  images: z.array(z.string()).max(10).optional(),
  targetCarId: z.string().optional(),
  targetCarTitle: z.string().max(200).optional()
});

export const updateExchangeSchema = z.object({
  status: z.enum(['New', 'Reviewing', 'Accepted', 'Rejected', 'Closed']).optional()
});
