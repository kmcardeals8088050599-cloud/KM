import { Car, DealershipInfo, Lead, ExchangeRequest } from '../types';

export const DEALERSHIP_INFO: DealershipInfo = {
  name: 'KM Car Deals',
  tagline: 'Trusted Multi Brand Pre-Owned Cars',
  address: 'Opposite Hyundai Showroom, Humnabad Road, Kapnoor',
  city: 'Kalaburagi',
  state: 'Karnataka',
  pincode: '585104',
  landmark: 'Opposite Hyundai Showroom',
  phones: ['+91 80880 50599', '+91 81239 91847'],
  whatsappNumber: '918088050599',
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
    variant: 'SX (O) Diesel Automatic',
    year: 2021,
    price: 13.95,
    rawPrice: 1395000,
    originalPrice: 14.50,
    kilometers: 32500,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    bodyType: 'SUV',
    ownerCount: '1st Owner',
    color: 'Phantom Black',
    location: 'Kalaburagi',
    status: 'Available',
    isFeatured: true,
    isCertified: true,
    registrationYear: 2021,
    insuranceType: 'Comprehensive (Valid till Nov 2026)',
    engineCapacity: '1493 cc',
    images: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200'
    ],
    features: [
      'Panoramic Sunroof',
      'Bose 8-Speaker Audio System',
      'Ventilated Front Seats',
      '10.25-inch Touchscreen Infotainment',
      'Wireless Phone Charging',
      'Push Button Start / Stop',
      '6 Airbags & ESP',
      'Rear View Camera with Sensors'
    ],
    description: 'Immaculate condition Hyundai Creta SX (O) Diesel Automatic in Phantom Black. Fully loaded top-end variant with panoramic sunroof, Bose premium audio, and ventilated leather seats. Single owner, non-accidental guarantee, 100% verified service history at authorized Hyundai center.',
    specs: {
      rto: 'KA-32 (Kalaburagi)',
      mileage: '18.5 kmpl',
      power: '113 bhp',
      seatingCapacity: 5,
      bootSpace: '433 Litres',
      groundClearance: '190 mm'
    },
    createdAt: '2026-07-20T10:00:00Z'
  },
  {
    id: 'car-2',
    title: 'Mahindra Thar LX 4x4 Hard Top Diesel',
    brand: 'Mahindra',
    model: 'Thar',
    variant: 'LX 4x4 Hard Top',
    year: 2022,
    price: 14.50,
    rawPrice: 1450000,
    originalPrice: 15.20,
    kilometers: 21000,
    fuelType: 'Diesel',
    transmission: 'Manual',
    bodyType: 'SUV',
    ownerCount: '1st Owner',
    color: 'Napoli Black',
    location: 'Kalaburagi',
    status: 'Available',
    isFeatured: true,
    isCertified: true,
    registrationYear: 2022,
    insuranceType: 'Comprehensive (Valid till Aug 2026)',
    engineCapacity: '2184 cc (mHawk 130)',
    images: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=1200'
    ],
    features: [
      'Shift-on-the-fly 4WD Transfer Case',
      '7-inch Touchscreen Navigation',
      'Drizzle-resistant Infotainment',
      '18-inch Deep Silver Alloy Wheels',
      'Roll Cage Architecture',
      'ESP with Roll Mitigation',
      'Cruise Control',
      'Roof Mounted Speakers'
    ],
    description: 'Iconic Mahindra Thar 4x4 Hard Top in showroom condition. Low kilometers driven, pristine interiors, zero off-road abuse. Fully certified with 150-point inspection certificate.',
    specs: {
      rto: 'KA-32 (Kalaburagi)',
      mileage: '15.2 kmpl',
      power: '130 bhp',
      seatingCapacity: 4,
      bootSpace: '385 Litres',
      groundClearance: '226 mm'
    },
    createdAt: '2026-07-19T14:30:00Z'
  },
  {
    id: 'car-3',
    title: 'Toyota Fortuner 2.8 4x2 Automatic Diesel',
    brand: 'Toyota',
    model: 'Fortuner',
    variant: '2.8 4x2 Automatic',
    year: 2020,
    price: 28.50,
    rawPrice: 2850000,
    originalPrice: 29.80,
    kilometers: 48000,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    bodyType: 'SUV',
    ownerCount: '1st Owner',
    color: 'Super White',
    location: 'Kalaburagi',
    status: 'Available',
    isFeatured: true,
    isCertified: true,
    registrationYear: 2020,
    insuranceType: 'Zero-Dep (Valid till Jan 2027)',
    engineCapacity: '2755 cc',
    images: [
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200'
    ],
    features: [
      'Powered Tailgate with Height Memory',
      'JBL 11-Speaker Audio System',
      '7 Airbags & Vehicle Stability Control',
      'Ventilated Front Seats',
      'Chamois Leather Upholstery',
      'Automatic Climate Control Dual Zone',
      'Paddle Shifters',
      'Drive Modes (Eco, Normal, Sport)'
    ],
    description: 'Commanding Toyota Fortuner 2.8 Automatic in Super White. Legendary reliability with full Toyota dealer service records. Single corporate owner, pristine condition inside out.',
    specs: {
      rto: 'KA-32 (Kalaburagi)',
      mileage: '14.2 kmpl',
      power: '201 bhp',
      seatingCapacity: 7,
      bootSpace: '296 Litres',
      groundClearance: '225 mm'
    },
    createdAt: '2026-07-18T11:00:00Z'
  },
  {
    id: 'car-4',
    title: 'Maruti Suzuki Swift ZXI Plus Petrol',
    brand: 'Maruti Suzuki',
    model: 'Swift',
    variant: 'ZXI Plus Top End',
    year: 2022,
    price: 6.75,
    rawPrice: 675000,
    originalPrice: 7.10,
    kilometers: 19500,
    fuelType: 'Petrol',
    transmission: 'Manual',
    bodyType: 'Hatchback',
    ownerCount: '1st Owner',
    color: 'Pearl Arctic White',
    location: 'Kalaburagi',
    status: 'Available',
    isFeatured: false,
    isCertified: true,
    registrationYear: 2022,
    insuranceType: 'Comprehensive (Valid till May 2027)',
    engineCapacity: '1197 cc DualJet',
    images: [
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1200'
    ],
    features: [
      'LED Projector Headlamps with DRLs',
      '7-inch SmartPlay Studio Infotainment',
      'Precision Cut Alloy Wheels',
      'Auto Folding ORVMs',
      'Cruise Control',
      'Automatic Climate Control',
      'Engine Push Start/Stop',
      'Dual Airbags & ABS with EBD'
    ],
    description: 'Top-of-the-line Swift ZXI Plus in pristine condition. High fuel efficiency DualJet engine, ideal for city & highway driving. Certified non-accidental with KM Car Deals seal.',
    specs: {
      rto: 'KA-32 (Kalaburagi)',
      mileage: '23.2 kmpl',
      power: '89 bhp',
      seatingCapacity: 5,
      bootSpace: '268 Litres',
      groundClearance: '163 mm'
    },
    createdAt: '2026-07-17T09:15:00Z'
  },
  {
    id: 'car-5',
    title: 'Tata Nexon XZA Plus Dark Edition Petrol',
    brand: 'Tata',
    model: 'Nexon',
    variant: 'XZA+ Dark Edition AMT',
    year: 2021,
    price: 9.25,
    rawPrice: 925000,
    originalPrice: 9.80,
    kilometers: 28000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    bodyType: 'SUV',
    ownerCount: '1st Owner',
    color: 'Atlas Black',
    location: 'Kalaburagi',
    status: 'Available',
    isFeatured: true,
    isCertified: true,
    registrationYear: 2021,
    insuranceType: 'Comprehensive (Valid till Feb 2027)',
    engineCapacity: '1199 cc Turbo',
    images: [
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200'
    ],
    features: [
      '5-Star Global NCAP Safety Rating',
      'Electric Sunroof',
      'Harman 8-Speaker Premium Sound',
      'iRA Connected Car Tech',
      'Dark Edition Leatherette Seats',
      'Blacked-out Alloy Wheels',
      'Drive Modes (Eco, City, Sport)',
      'Rear AC Vents'
    ],
    description: '5-Star Safety rated Tata Nexon Dark Edition Petrol Automatic. Striking stealth black appearance with electric sunroof and Harman audio system.',
    specs: {
      rto: 'KA-32 (Kalaburagi)',
      mileage: '17.0 kmpl',
      power: '118 bhp',
      seatingCapacity: 5,
      bootSpace: '350 Litres',
      groundClearance: '209 mm'
    },
    createdAt: '2026-07-16T16:00:00Z'
  },
  {
    id: 'car-6',
    title: 'Kia Seltos GTX Plus 1.4 Turbo DCT',
    brand: 'Kia',
    model: 'Seltos',
    variant: 'GTX+ Turbo Petrol DCT',
    year: 2022,
    price: 15.20,
    rawPrice: 1520000,
    originalPrice: 15.90,
    kilometers: 24000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    bodyType: 'SUV',
    ownerCount: '1st Owner',
    color: 'Intense Red',
    location: 'Kalaburagi',
    status: 'Available',
    isFeatured: false,
    isCertified: true,
    registrationYear: 2022,
    insuranceType: 'Zero-Dep (Valid till Oct 2026)',
    engineCapacity: '1353 cc Turbo',
    images: [
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200'
    ],
    features: [
      '360 Degree Surround View Camera',
      'Head-Up Display (HUD)',
      'Bose 8-Speaker Premium Sound',
      'Ventilated Front Seats',
      'Smart Pure Air Purifier',
      'Red GT Line Accents & Brake Calipers',
      '10.25-inch Touchscreen HD Display',
      '6 Airbags & ESP'
    ],
    description: 'Thrilling Kia Seltos GTX+ 1.4 Turbo DCT in Intense Red. Top GT-Line specs with HUD, 360 camera, Bose audio, and ventilated seats.',
    specs: {
      rto: 'KA-32 (Kalaburagi)',
      mileage: '16.5 kmpl',
      power: '138 bhp',
      seatingCapacity: 5,
      bootSpace: '433 Litres',
      groundClearance: '190 mm'
    },
    createdAt: '2026-07-15T12:00:00Z'
  },
  {
    id: 'car-7',
    title: 'Mercedes-Benz GLA 200d Sport',
    brand: 'Mercedes-Benz',
    model: 'GLA',
    variant: '200d Sport',
    year: 2019,
    price: 22.90,
    rawPrice: 2290000,
    originalPrice: 24.50,
    kilometers: 42000,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    bodyType: 'Luxury',
    ownerCount: '1st Owner',
    color: 'Iridium Silver',
    location: 'Kalaburagi',
    status: 'Available',
    isFeatured: true,
    isCertified: true,
    registrationYear: 2019,
    insuranceType: 'Comprehensive (Valid till Dec 2026)',
    engineCapacity: '2143 cc',
    images: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1200'
    ],
    features: [
      'Panoramic Dual-Pane Sunroof',
      'Memory Seats with 3 Presets',
      'Dynamic Select Drive Modes',
      'Off-Road Comfort Suspension',
      'Ambient Interior Lighting 64 Colors',
      'Attention Assist Safety System',
      'Power Tailgate',
      '18-inch 5-Spoke Alloy Wheels'
    ],
    description: 'Luxury German SUV Mercedes-Benz GLA 200d Sport in flawless Iridium Silver. Complete dealer service history, verified mileage, non-accidental guarantee.',
    specs: {
      rto: 'KA-32 (Kalaburagi)',
      mileage: '17.9 kmpl',
      power: '134 bhp',
      seatingCapacity: 5,
      bootSpace: '421 Litres',
      groundClearance: '183 mm'
    },
    createdAt: '2026-07-14T10:20:00Z'
  },
  {
    id: 'car-8',
    title: 'Honda City 1.5 ZX i-VTEC Manual',
    brand: 'Honda',
    model: 'City',
    variant: 'ZX i-VTEC Top Model',
    year: 2020,
    price: 9.80,
    rawPrice: 980000,
    originalPrice: 10.40,
    kilometers: 35000,
    fuelType: 'Petrol',
    transmission: 'Manual',
    bodyType: 'Sedan',
    ownerCount: '1st Owner',
    color: 'Platinum White Pearl',
    location: 'Kalaburagi',
    status: 'Available',
    isFeatured: false,
    isCertified: true,
    registrationYear: 2020,
    insuranceType: 'Comprehensive (Valid till Jul 2026)',
    engineCapacity: '1498 cc i-VTEC',
    images: [
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1200'
    ],
    features: [
      'Full LED Headlamps with Inline Shell',
      'One-Touch Electric Sunroof',
      'LaneWatch Camera System',
      '8-inch Touchscreen Infotainment',
      'Leatherette Seat Upholstery',
      'Walk Away Auto Lock',
      '6 Airbags & Agile Handling Assist',
      'Automatic Climate Control'
    ],
    description: 'Executive 5th Gen Honda City ZX i-VTEC. Smooth 1.5L engine, plush rear seat legroom, LaneWatch camera, and sunroof. Pristine condition.',
    specs: {
      rto: 'KA-32 (Kalaburagi)',
      mileage: '17.8 kmpl',
      power: '119 bhp',
      seatingCapacity: 5,
      bootSpace: '506 Litres',
      groundClearance: '165 mm'
    },
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
    name: 'Md Nawaz Khan',
    role: 'Managing Director & Founder',
    experience: '12+ Years Automotive Experience',
    phone: '+91 80880 50599',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
    bio: 'Pioneered KM Car Deals with a commitment to transparency, quality 150-point inspections, and customer satisfaction in Kalaburagi.'
  },
  {
    name: 'Md Nadeem Khan',
    role: 'Executive Director & Partner',
    experience: '10+ Years Management & Valuation',
    phone: '+91 80880 50599',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600',
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
  { name: 'Hyundai', logo: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=200' },
  { name: 'Maruti Suzuki', logo: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=200' },
  { name: 'Mahindra', logo: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=200' },
  { name: 'Tata Motors', logo: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=200' },
  { name: 'Toyota', logo: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=200' },
  { name: 'Kia Motors', logo: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=200' },
  { name: 'Honda', logo: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=200' },
  { name: 'Mercedes-Benz', logo: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=200' },
  { name: 'BMW', logo: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=200' }
];
