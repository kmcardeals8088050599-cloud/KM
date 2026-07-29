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
    variant: car.variant || '',
    year: car.year,
    price: car.price,
    raw_price: car.rawPrice,
    original_price: car.originalPrice || null,
    kilometers: car.kilometers,
    fuel_type: car.fuelType,
    transmission: car.transmission,
    body_type: car.bodyType,
    owner_count: car.ownerCount,
    color: car.color,
    location: car.location,
    status: car.status,
    is_featured: car.isFeatured,
    is_certified: car.isCertified,
    registration_year: car.registrationYear,
    insurance_type: car.insuranceType,
    engine_capacity: car.engineCapacity || null,
    images: car.images,
    features: car.features,
    description: car.description,
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
