import { Car, DealershipInfo, Lead, ExchangeRequest } from '../types';

export const DEALERSHIP_INFO: DealershipInfo = {
  name: 'KM Car Deals',
  tagline: 'Trusted Multi Brand Pre-Owned Cars',
  address: 'Opposite Hyundai Showroom, Humnabad Road, Kapnoor',
  city: 'Kalaburagi',
  state: 'Karnataka',
  pincode: '585104',
  landmark: 'Opposite Hyundai Showroom',
  phones: ['+91 81239 91847', '+91 80880 50599'],
  whatsappNumber: '918123991847',
  googleRating: 5.0,
  googleReviewsCount: 128,
  workingHours: 'Monday - Sunday: 9:30 AM - 8:30 PM',
  email: 'contact@kmcardeals.com',
  googleMapLink: 'https://maps.app.goo.gl/fFs2L42c5ZtYjSkk9?g_st=ic',
  mapEmbedUrl: 'https://maps.google.com/maps?q=KM%20CAR%20DEALS%20Opposite%20Hyundai%20Showroom%20Humnabad%20Road%20Kapnoor%20Kalaburagi%20Karnataka%20585104&t=&z=16&ie=UTF8&iwloc=&output=embed'
};

export const INITIAL_CARS: Car[] = [
  {
    id: 'car-1',
    title: 'Hyundai Creta 1.5 SX (O) Diesel Auto',
    brand: 'Hyundai',
    model: 'Creta',
    year: 2021,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    bodyType: 'SUV',
    ownerCount: '1st Owner',
    status: 'Available',
    images: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200'
    ],
    specs: { rto: 'KA-32 (Kalaburagi)' },
    createdAt: '2026-07-20T10:00:00Z'
  },
  {
    id: 'car-2',
    title: 'Mahindra Thar LX 4x4 Hard Top Diesel',
    brand: 'Mahindra',
    model: 'Thar',
    year: 2022,
    fuelType: 'Diesel',
    transmission: 'Manual',
    bodyType: 'SUV',
    ownerCount: '1st Owner',
    status: 'Available',
    images: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=1200'
    ],
    specs: { rto: 'KA-32 (Kalaburagi)' },
    createdAt: '2026-07-19T14:30:00Z'
  },
  {
    id: 'car-3',
    title: 'Toyota Fortuner 2.8 4x2 Automatic Diesel',
    brand: 'Toyota',
    model: 'Fortuner',
    year: 2020,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    bodyType: 'SUV',
    ownerCount: '1st Owner',
    status: 'Available',
    images: [
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200'
    ],
    specs: { rto: 'KA-32 (Kalaburagi)' },
    createdAt: '2026-07-18T11:00:00Z'
  },
  {
    id: 'car-4',
    title: 'Maruti Suzuki Swift ZXI Plus Petrol',
    brand: 'Maruti Suzuki',
    model: 'Swift',
    year: 2022,
    fuelType: 'Petrol',
    transmission: 'Manual',
    bodyType: 'Hatchback',
    ownerCount: '1st Owner',
    status: 'Available',
    images: [
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1200'
    ],
    specs: { rto: 'KA-32 (Kalaburagi)' },
    createdAt: '2026-07-17T09:15:00Z'
  },
  {
    id: 'car-5',
    title: 'Tata Nexon XZA Plus Dark Edition Petrol',
    brand: 'Tata',
    model: 'Nexon',
    year: 2021,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    bodyType: 'SUV',
    ownerCount: '1st Owner',
    status: 'Available',
    images: [
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200'
    ],
    specs: { rto: 'KA-32 (Kalaburagi)' },
    createdAt: '2026-07-16T16:00:00Z'
  },
  {
    id: 'car-6',
    title: 'Kia Seltos GTX Plus 1.4 Turbo DCT',
    brand: 'Kia',
    model: 'Seltos',
    year: 2022,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    bodyType: 'SUV',
    ownerCount: '1st Owner',
    status: 'Available',
    images: [
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200'
    ],
    specs: { rto: 'KA-32 (Kalaburagi)' },
    createdAt: '2026-07-15T12:00:00Z'
  },
  {
    id: 'car-7',
    title: 'Mercedes-Benz GLA 200d Sport',
    brand: 'Mercedes-Benz',
    model: 'GLA',
    year: 2019,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    bodyType: 'Luxury',
    ownerCount: '1st Owner',
    status: 'Available',
    images: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1200'
    ],
    specs: { rto: 'KA-32 (Kalaburagi)' },
    createdAt: '2026-07-14T10:20:00Z'
  },
  {
    id: 'car-8',
    title: 'Honda City 1.5 ZX i-VTEC Manual',
    brand: 'Honda',
    model: 'City',
    year: 2020,
    fuelType: 'Petrol',
    transmission: 'Manual',
    bodyType: 'Sedan',
    ownerCount: '1st Owner',
    status: 'Available',
    images: [
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1200'
    ],
    specs: { rto: 'KA-32 (Kalaburagi)' },
    createdAt: '2026-07-13T15:45:00Z'
  }
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    name: 'Sample Customer',
    phone: '+91 99999 00001',
    email: 'sample@example.com',
    carId: 'car-1',
    carTitle: 'Hyundai Creta 1.5 SX (O) Diesel Auto',
    type: 'Inquiry',
    message: 'Interested in taking a test drive this weekend at the showroom.',
    status: 'New',
    createdAt: '2026-07-22T14:20:00Z'
  },
  {
    id: 'lead-2',
    name: 'Demo Lead',
    phone: '+91 99999 00002',
    type: 'TestDrive',
    carId: 'car-2',
    carTitle: 'Mahindra Thar LX 4x4 Hard Top Diesel',
    message: 'Want to inquire about finance options and exchange valuation.',
    status: 'Contacted',
    notes: 'Called customer, scheduled showroom visit.',
    createdAt: '2026-07-21T11:10:00Z'
  }
];

export const INITIAL_EXCHANGES: ExchangeRequest[] = [
  {
    id: 'ex-1',
    customerName: 'Sample Customer',
    phone: '+91 99999 00003',
    currentBrand: 'Maruti Suzuki',
    currentModel: 'Brezza ZDI',
    currentYear: 2018,
    currentKilometers: 54000,
    fuelType: 'Diesel',
    transmission: 'Manual',
    expectedPrice: 6.20,
    comments: 'Well maintained, no accident history. Looking to trade in for Hyundai Creta or Mahindra Thar.',
    targetCarId: 'car-1',
    targetCarTitle: 'Hyundai Creta 1.5 SX (O) Diesel Auto',
    status: 'New',
    createdAt: '2026-07-22T16:00:00Z'
  }
];

export const TEAM_MEMBERS = [
  {
    name: 'Md Nadeem Khan',
    role: 'Managing Director',
    experience: '12+ Years Automotive Experience',
    phone: '+91 80880 50599',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600',
    bio: 'Pioneered KM Car Deals with a commitment to transparency, quality 150-point inspections, and customer satisfaction in Kalaburagi.'
  },
  {
    name: 'Md Nawaz Khan',
    role: 'Executive Director',
    experience: '10+ Years Management & Valuation',
    phone: '+91 80880 50599',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
    bio: 'Oversees multi-brand car procurement, client partnerships, and deal approvals at KM Car Deals Kalaburagi.'
  },
  {
    name: 'KM Car Deals Executive Team',
    role: 'Core Management & Loan Division',
    experience: '5 Member Executive Leadership Team',
    phone: '+91 81239 91847',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600',
    bio: 'Specialists in RTO RC documentation transfer, instant bank loan processing, and multi-brand exchange valuation.'
  }
];

export const TESTIMONIALS = [
  {
    id: 't-1',
    name: 'Suresh Rathod',
    location: 'Kapnoor, Kalaburagi',
    carPurchased: 'Hyundai Creta 2021',
    rating: 5,
    date: 'July 2026',
    review: 'Bought my Hyundai Creta from KM Car Deals. The vehicle condition was exactly as described, zero non-accidental guarantee verified. The team made the RC transfer super smooth in just 4 days!'
  },
  {
    id: 't-2',
    name: 'Dr. Priyanka Patil',
    location: 'Sedam Road, Kalaburagi',
    carPurchased: 'Kia Seltos 2022',
    rating: 5,
    date: 'June 2026',
    review: 'Exchanged my old Swift for Kia Seltos here. Got the best exchange valuation in entire Kalaburagi compared to other dealers. Honest pricing and genuine kilometer reading!'
  },
  {
    id: 't-3',
    name: 'Mohammed Mansoor',
    location: 'Humnabad Road',
    carPurchased: 'Toyota Fortuner 2020',
    rating: 5,
    date: 'May 2026',
    review: 'Top class pre-owned cars! The showroom feel is premium, and their 150-point inspection check gave me total peace of mind. Highly recommended multi-brand showroom.'
  }
];

export const BRAND_LOGOS = [
  { name: 'Maruti Suzuki', logo: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=200' },
  { name: 'Hyundai', logo: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=200' },
  { name: 'Tata', logo: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=200' },
  { name: 'Mahindra', logo: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=200' },
  { name: 'Toyota', logo: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=200' },
  { name: 'Kia', logo: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=200' },
  { name: 'Honda', logo: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=200' },
  { name: 'Renault', logo: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=200' },
  { name: 'Nissan', logo: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=200' },
  { name: 'Skoda', logo: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=200' },
  { name: 'Volkswagen', logo: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=200' },
  { name: 'MG', logo: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=200' },
  { name: 'Jeep', logo: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=200' },
  { name: 'Mercedes-Benz', logo: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=200' },
  { name: 'BMW', logo: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=200' },
  { name: 'Audi', logo: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80&w=200' },
];
