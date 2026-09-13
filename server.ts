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
  getCarExportRows,
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
import {
  sendWhatsAppAlert,
  buildNewLeadMessage,
  buildNewExchangeMessage,
  buildDailySummaryMessage
} from './server/whatsapp.js';
import aiRoutes from './server/ai/routes.js';
import { assertProductionConfig } from './server/prod-guards.js';

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
  // Refuse to boot with dev fallbacks / unreachable endpoints in production.
  assertProductionConfig(process.env);

  const app = express();

  // Behind a reverse proxy (Vercel/Render/VPS + nginx): respect X-Forwarded-For so
  // rate limiters see the real client IP instead of the proxy.
  if ((process.env.NODE_ENV || '').trim().toLowerCase() === 'production') {
    app.set('trust proxy', 1);
  }

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

  // GET Cars (public). Without an explicit status filter, non-admin callers only
  // ever see Available inventory — Sold/Reserved and drafts never leak.
  app.get('/api/cars', async (req, res) => {
    try {
      const { brand, bodyType, fuelType, search, featured, status } = req.query;
      const authed = isAuthorized(req);
      let filtered = await getAllCars();

      const effectiveStatus = !authed && !status ? 'Available' : (status as string | undefined);

      if (effectiveStatus && typeof effectiveStatus === 'string' && effectiveStatus !== 'All') {
        filtered = filtered.filter(c => c.status.toLowerCase() === effectiveStatus.toLowerCase());
      }
      if (brand && typeof brand === 'string' && brand !== 'All') {
        filtered = filtered.filter(c => c.brand.toLowerCase() === brand.toLowerCase());
      }
      if (bodyType && typeof bodyType === 'string' && bodyType !== 'All') {
        filtered = filtered.filter(c => c.bodyType.toLowerCase() === bodyType.toLowerCase());
      }
      if (fuelType && typeof fuelType === 'string' && fuelType !== 'All') {
        filtered = filtered.filter(c => c.fuelType.toLowerCase() === fuelType.toLowerCase());
      }
      if (search && typeof search === 'string') {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          c =>
            c.title.toLowerCase().includes(q) ||
            c.brand.toLowerCase().includes(q) ||
            c.model.toLowerCase().includes(q)
        );
      }
      if (featured && typeof featured === 'string' && featured !== 'false') {
        filtered = filtered.filter(c => (c as any).isFeatured === true);
      }

      // Asking price is admin-only — strip it from the public API responses.
      res.json(authed ? filtered : filtered.map(stripPublicPrice));
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch cars', details: err.message });
    }
  });

  // GET Catalogue export (admin only) — openable in Excel, product ids + prices included.
  // Registered before /api/cars/:id so the :id param never swallows "export".
  app.get('/api/cars/export', authenticateAdmin, async (_req, res) => {
    try {
      const rows = await getCarExportRows();
      const csv = buildCatalogueCsv(rows);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="km-car-deals-catalogue-${new Date().toISOString().slice(0, 10)}.csv"`
      );
      res.send(`\uFEFF${csv}`);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to export catalogue', details: err.message });
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
      res.json(isAuthorized(req) ? car : stripPublicPrice(car));
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

      // FEATURE 1: Auto WhatsApp alert to admin
      const adminPhone = process.env.WHATSAPP_ADMIN_PHONE || '918123991847';
      sendWhatsAppAlert({
        to: adminPhone,
        text: buildNewLeadMessage({
          name: data.name,
          phone: data.phone,
          type: data.type || 'Inquiry',
          carTitle: data.carTitle,
          message: data.message
        })
      }).catch(() => {}); // fire-and-forget, don't fail the request

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

      // FEATURE 1: Auto WhatsApp alert to admin
      const adminPhone = process.env.WHATSAPP_ADMIN_PHONE || '918123991847';
      sendWhatsAppAlert({
        to: adminPhone,
        text: buildNewExchangeMessage({
          customerName: data.customerName,
          phone: data.phone,
          currentBrand: data.currentBrand,
          currentModel: data.currentModel,
          currentYear: Number(data.currentYear) || 2020,
          currentKilometers: Number(data.currentKilometers) || 50000,
          expectedPrice: Number(data.expectedPrice) || 0,
          targetCarTitle: data.targetCarTitle
        })
      }).catch(() => {}); // fire-and-forget

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
        year: data.year,
        fuelType: data.fuelType,
        transmission: data.transmission,
        bodyType: data.bodyType,
        ownerCount: data.ownerCount || '1st Owner',
        status: data.status || 'Available',
        images: data.images || [],
        specs: data.specs || { rto: 'KA-32 (Kalaburagi)' }
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

  // -------------------------------------------------------
  // FEATURE 1: WhatsApp alert already hooked into leads/exchange below
  // (see POST /api/leads and POST /api/exchange-requests modifications)

  // -------------------------------------------------------
  // FEATURE 2: AI Car Description Generator (provider-agnostic via local AI facade)
  app.post('/api/admin/generate-description', authenticateAdmin, async (req, res) => {
    try {
      const { brand, model, year, fuelType, transmission, bodyType, ownerCount } = req.body;
      const system =
        'Write a compelling, honest, and professional 2-3 sentence car description for a pre-owned car listing at KM Car Deals, a trusted multi-brand used car dealership in Kalaburagi, Karnataka, India.\n' +
        'Rules: Keep it under 60 words. Mention condition positively but honestly. Include KM Car Deals 150-point inspection certified. No made-up specs. Professional tone for Indian used car market.';
      const prompt = `Car Details:\n- Brand: ${brand}\n- Model: ${model}\n- Year: ${year}\n- Fuel: ${fuelType}\n- Transmission: ${transmission}\n- Body Type: ${bodyType}\n- Owner: ${ownerCount || '1st Owner'}`;

      const [{ generateText }, { AiProviderError }] = await Promise.all([
        import('./server/ai/ai.js'),
        import('./server/ai/provider/types.js'),
      ]);

      let description: string;
      try {
        description = await generateText({ prompt, system, agent: 'description', event: 'generate_description' });
      } catch (err: any) {
        if (err instanceof AiProviderError && (err.code === 'not_configured' || err.code === 'config')) {
          res.status(400).json({ error: 'AI provider is not configured' });
        } else {
          res.status(500).json({ error: 'AI generation failed', details: err.message });
        }
        return;
      }
      res.json({ description });
    } catch (err: any) {
      res.status(500).json({ error: 'AI generation failed', details: err.message });
    }
  });

  // -------------------------------------------------------
  // FEATURE 4: Daily Summary Report → returns data + optionally sends WhatsApp
  app.post('/api/admin/daily-report', authenticateAdmin, async (req, res) => {
    try {
      const [cars, leads, exchanges] = await Promise.all([getAllCars(), getAllLeads(), getAllExchanges()]);
      const stats = {
        totalCars: cars.length,
        availableCars: cars.filter(c => c.status === 'Available').length,
        soldCars: cars.filter(c => c.status === 'Sold').length,
        reservedCars: cars.filter(c => c.status === 'Reserved').length,
        totalLeads: leads.length,
        newLeads: leads.filter(l => l.status === 'New').length,
        totalExchanges: exchanges.length,
        newExchanges: exchanges.filter(e => e.status === 'New').length
      };
      const message = buildDailySummaryMessage(stats);
      const adminPhone = process.env.WHATSAPP_ADMIN_PHONE || '918123991847';
      await sendWhatsAppAlert({ to: adminPhone, text: message });
      res.json({ success: true, stats, message });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to generate report', details: err.message });
    }
  });

  // -------------------------------------------------------
  // AI VEHICLE SYSTEM — WhatsApp ingestion, admin AI-ops, publishing.
  // WhatsApp webhook (public, verified) + /api/ai/* admin endpoints.
  app.use('/api', aiRoutes);

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

// True when the request carries a valid admin JWT (used to decide whether price data
// may be included in a /api/cars response).
function isAuthorized(req: express.Request): boolean {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return false;
  try {
    const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET) as { role?: string };
    return decoded.role === 'admin';
  } catch {
    return false;
  }
}

function stripPublicPrice(car: Car): Car {
  const { price, originalPrice, ...rest } = car;
  return rest as Car;
}

const EXPORT_HEADERS = [
  'Product ID',
  'Draft ID',
  'Draft State',
  'Title',
  'Brand',
  'Model',
  'Variant',
  'Year',
  'Price (Rs)',
  'Odometer (km)',
  'Fuel',
  'Transmission',
  'Body Type',
  'Owner Count',
  'Colour',
  'Location',
  'RTO',
  'Status',
  'Image Count',
  'Features',
  'Created At',
] as const;

const EXPORT_FIELDS: (keyof Awaited<ReturnType<typeof getCarExportRows>>[number])[] = [
  'productId',
  'draftId',
  'draftState',
  'title',
  'brand',
  'model',
  'variant',
  'year',
  'price',
  'odometerKm',
  'fuelType',
  'transmission',
  'bodyType',
  'ownerCount',
  'color',
  'location',
  'rto',
  'status',
  'imageCount',
  'features',
  'createdAt',
];

function buildCatalogueCsv(rows: Awaited<ReturnType<typeof getCarExportRows>>): string {
  const esc = (v: unknown): string => {
    const s = v === null || v === undefined ? '' : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const lines = [EXPORT_HEADERS.join(',')];
  for (const row of rows) {
    lines.push(EXPORT_FIELDS.map(f => esc(row[f])).join(','));
  }
  return lines.join('\r\n');
}
