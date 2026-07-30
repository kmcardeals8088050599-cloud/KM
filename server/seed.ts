import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { INITIAL_CARS } from '../src/data/mockData.ts';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function seed() {
  console.log(`[SEED] Seeding ${INITIAL_CARS.length} cars into Supabase...`);

  const rows = INITIAL_CARS.map(car => ({
    id: car.id,
    title: car.title,
    brand: car.brand,
    model: car.model,
    year: car.year,
    fuel_type: car.fuelType,
    transmission: car.transmission,
    body_type: car.bodyType,
    owner_count: car.ownerCount,
    status: car.status,
    images: car.images,
    specs: car.specs,
    created_at: car.createdAt
  }));

  const { data, error } = await supabase.from('cars').upsert(rows, { onConflict: 'id' });
  if (error) {
    console.error('[SEED] Error:', error.message);
    process.exit(1);
  }
  console.log(`[SEED] Successfully seeded ${rows.length} cars`);
}

seed();
