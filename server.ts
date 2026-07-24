import 'dotenv/config';
import express from 'express';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  getAllCars,
  getCarById,
  createCar as dbCreateCar,
  updateCar as dbUpdateCar,
  deleteCar as dbDeleteCar,
  getAllLeads,
  createLead as dbCreateLead,
  updateLead as dbUpdateLead,
  getAllExchanges,
  createExchange as dbCreateExchange,
  updateExchange as dbUpdateExchange,
  findUserByUsername,
  ensureDefaultAdmin
} from './server/db.js';
import { authenticateAdmin, JWT_SECRET } from './server/middleware/auth.js';
import {
  loginSchema,
  createCarSchema,
  updateCarSchema,
  createLeadSchema,
  updateLeadSchema,
  createExchangeSchema,
  updateExchangeSchema
} from './server/validations.js';
import { Car, Lead, ExchangeRequest } from './src/types/index.js';
import { carUploadToken, exchangeUploadToken, deleteBlobsForUrls } from './server/upload.js';

const LOGIN_RATE_LIMIT = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

const API_RATE_LIMIT = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false
});

const UPLOAD_RATE_LIMIT = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many upload requests. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function sanitizeObject(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === 'string') {
      result[key] = sanitizeInput(val);
    } else if (Array.isArray(val)) {
      result[key] = val.map(v => typeof v === 'string' ? sanitizeInput(v) : v);
    } else if (val && typeof val === 'object') {
      result[key] = sanitizeObject(val);
    } else {
      result[key] = val;
    }
  }
  return result;
}

export async function createApp() {
  const app = express();

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  }));
  app.use(cors({
    origin: process.env.ALLOWED_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  app.use(express.json({ limit: '5mb' }));
  app.use('/api', API_RATE_LIMIT);

  // Seed default admin user
  await ensureDefaultAdmin();

  // --- PUBLIC API ENDPOINTS ---

  app.get('/api/health', async (_req, res) => {
    try {
      await getAllCars();
      res.json({ status: 'ok', database: 'connected' });
    } catch (err: any) {
      res.status(500).json({ status: 'error', database: 'disconnected', error: err.message });
    }
  });

  // GET Cars (public)
  app.get('/api/cars', async (req, res) => {
    try {
      const { brand, bodyType, fuelType, search, featured, status } = req.query;
      let filtered = await getAllCars();

      if (brand && typeof brand === 'string' && brand !== 'All') {
        filtered = filtered.filter(c => c.brand.toLowerCase() === brand.toLowerCase());
      }
      if (bodyType && typeof bodyType === 'string' && bodyType !== 'All') {
        filtered = filtered.filter(c => c.bodyType.toLowerCase() === bodyType.toLowerCase());
      }
      if (fuelType && typeof fuelType === 'string' && fuelType !== 'All') {
        filtered = filtered.filter(c => c.fuelType.toLowerCase() === fuelType.toLowerCase());
      }
      if (status && typeof status === 'string' && status !== 'All') {
        filtered = filtered.filter(c => c.status.toLowerCase() === status.toLowerCase());
      }
      if (featured === 'true') {
        filtered = filtered.filter(c => c.isFeatured);
      }
      if (search && typeof search === 'string') {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          c =>
            c.title.toLowerCase().includes(q) ||
            c.brand.toLowerCase().includes(q) ||
            c.model.toLowerCase().includes(q) ||
            c.color.toLowerCase().includes(q)
        );
      }

      res.json(filtered);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch cars', details: err.message });
    }
  });

  // GET Single Car (public)
  app.get('/api/cars/:id', async (req, res) => {
    try {
      const car = await getCarById(req.params.id);
      if (!car) {
        res.status(404).json({ error: 'Car not found' });
        return;
      }
      res.json(car);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch car', details: err.message });
    }
  });

  // POST New Lead (public, rate limited)
  app.post('/api/leads', async (req, res) => {
    try {
      const validation = createLeadSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: 'Validation failed', details: validation.error.issues });
        return;
      }

      const data = sanitizeObject(validation.data);
      const newLead = await dbCreateLead({
        name: data.name,
        phone: data.phone,
        email: data.email,
        carId: data.carId,
        carTitle: data.carTitle,
        type: data.type || 'Inquiry',
        message: data.message || '',
        status: 'New'
      });

      res.status(201).json(newLead);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to submit inquiry', details: err.message });
    }
  });

  // POST New Exchange Request (public, rate limited)
  app.post('/api/exchange-requests', async (req, res) => {
    try {
      const validation = createExchangeSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: 'Validation failed', details: validation.error.issues });
        return;
      }

      const data = sanitizeObject(validation.data);
      const newExchange = await dbCreateExchange({
        customerName: data.customerName,
        phone: data.phone,
        currentBrand: data.currentBrand,
        currentModel: data.currentModel,
        currentYear: Number(data.currentYear) || 2020,
        currentKilometers: Number(data.currentKilometers) || 50000,
        fuelType: data.fuelType || 'Petrol',
        transmission: data.transmission || 'Manual',
        expectedPrice: Number(data.expectedPrice) || 0,
        comments: data.comments || '',
        images: data.images || [],
        targetCarId: data.targetCarId,
        targetCarTitle: data.targetCarTitle,
        status: 'New'
      });

      res.status(201).json(newExchange);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to submit exchange request', details: err.message });
    }
  });

  // --- AUTH ENDPOINT ---

  app.post('/api/auth/login', LOGIN_RATE_LIMIT, async (req, res) => {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: 'Invalid input' });
        return;
      }

      const { username, password } = validation.data;
      const user = await findUserByUsername(username);

      if (!user) {
        res.status(401).json({ error: 'Invalid username or password' });
        return;
      }

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        res.status(401).json({ error: 'Invalid username or password' });
        return;
      }

      const token = jwt.sign(
        { username: user.username, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '8h' }
      );

      res.json({
        token,
        user: { name: user.name, role: user.role }
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Login failed', details: err.message });
    }
  });

  // --- IMAGE UPLOAD ENDPOINTS ---

  app.post('/api/upload/token/car', authenticateAdmin, carUploadToken);
  app.post('/api/upload/token/exchange', UPLOAD_RATE_LIMIT, exchangeUploadToken);

  // --- ADMIN-ONLY ENDPOINTS (all require JWT) ---

  app.get('/api/leads', authenticateAdmin, async (_req, res) => {
    try {
      const leads = await getAllLeads();
      res.json(leads);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch leads', details: err.message });
    }
  });

  app.patch('/api/leads/:id', authenticateAdmin, async (req, res) => {
    try {
      const validation = updateLeadSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: 'Validation failed', details: validation.error.issues });
        return;
      }
      const lead = await dbUpdateLead(req.params.id, validation.data);
      res.json(lead);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update lead', details: err.message });
    }
  });

  app.get('/api/exchange-requests', authenticateAdmin, async (_req, res) => {
    try {
      const exchanges = await getAllExchanges();
      res.json(exchanges);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch exchanges', details: err.message });
    }
  });

  app.patch('/api/exchange-requests/:id', authenticateAdmin, async (req, res) => {
    try {
      const validation = updateExchangeSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: 'Validation failed', details: validation.error.issues });
        return;
      }
      const exchange = await dbUpdateExchange(req.params.id, validation.data);
      res.json(exchange);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update exchange', details: err.message });
    }
  });

  app.get('/api/stats', authenticateAdmin, async (_req, res) => {
    try {
      const [cars, leads, exchanges] = await Promise.all([getAllCars(), getAllLeads(), getAllExchanges()]);
      res.json({
        totalCars: cars.length,
        availableCars: cars.filter(c => c.status === 'Available').length,
        soldCars: cars.filter(c => c.status === 'Sold').length,
        totalLeads: leads.length,
        pendingLeads: leads.filter(l => l.status === 'New').length,
        totalExchanges: exchanges.length
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch stats', details: err.message });
    }
  });

  app.post('/api/cars', authenticateAdmin, async (req, res) => {
    try {
      const validation = createCarSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: 'Validation failed', details: validation.error.issues });
        return;
      }
      const data = sanitizeObject(validation.data);
      const newCar = await dbCreateCar({
        title: data.title,
        brand: data.brand,
        model: data.model,
        variant: data.variant || '',
        year: data.year,
        price: Number(data.price) || 10,
        kilometers: data.kilometers || 0,
        fuelType: data.fuelType,
        transmission: data.transmission,
        bodyType: data.bodyType,
        ownerCount: data.ownerCount || '1st Owner',
        color: data.color || 'Black',
        location: data.location || 'Kalaburagi',
        status: data.status || 'Available',
        isFeatured: data.isFeatured ?? true,
        isCertified: data.isCertified ?? true,
        registrationYear: data.registrationYear || data.year,
        insuranceType: data.insuranceType || 'Comprehensive',
        images: data.images || [],
        features: data.features || [],
        description: data.description || '',
        specs: data.specs || {
          rto: 'KA-32 (Kalaburagi)',
          mileage: '16.5 kmpl',
          power: '115 bhp',
          seatingCapacity: 5
        }
      });
      res.status(201).json(newCar);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to create car', details: err.message });
    }
  });

  app.put('/api/cars/:id', authenticateAdmin, async (req, res) => {
    try {
      const validation = updateCarSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: 'Validation failed', details: validation.error.issues });
        return;
      }
      const data = sanitizeObject(validation.data);
      const existing = await getCarById(req.params.id);
      const updated = await dbUpdateCar(req.params.id, data);
      if (existing && Array.isArray(data.images)) {
        const removedImages = existing.images.filter(url => !data.images.includes(url));
        if (removedImages.length > 0) {
          deleteBlobsForUrls(removedImages).catch(() => {});
        }
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update car', details: err.message });
    }
  });

  app.delete('/api/cars/:id', authenticateAdmin, async (req, res) => {
    try {
      const existing = await getCarById(req.params.id);
      await dbDeleteCar(req.params.id);
      if (existing && existing.images.length > 0) {
        deleteBlobsForUrls(existing.images).catch(() => {});
      }
      res.json({ success: true, message: 'Car deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to delete car', details: err.message });
    }
  });

  app.get('/api/settings', (_req, res) => {
    res.json({
      name: 'KM Car Deals',
      tagline: 'Multi Brand Pre-Owned Cars',
      city: 'Kalaburagi'
    });
  });

  return app;
}

// Standalone server entrypoint (local dev / non-Vercel hosting).
// On Vercel, api/index.ts imports createApp() directly as a serverless function
// and Vercel's static hosting + rewrites handle the frontend and SPA fallback instead.
async function startServer() {
  const app = await createApp();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KM Car Deals server running on http://0.0.0.0:${PORT}`);
    console.log('[DB] Connected to Supabase');
    console.log('[AUTH] JWT token expiry: 8 hours');
  });
}

if (!process.env.VERCEL) {
  startServer();
}
