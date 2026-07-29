export type FuelType = 'Petrol' | 'Diesel' | 'CNG' | 'Electric' | 'Hybrid';
export type Transmission = 'Manual' | 'Automatic';
export type BodyType = 'SUV' | 'Sedan' | 'Hatchback' | 'Luxury' | 'MUV';
export type CarStatus = 'Available' | 'Reserved' | 'Sold';

export interface Car {
  id: string;
  title: string;
  brand: string;
  model: string;
  variant?: string;
  year: number;
  price: number; // in Lakhs (e.g., 14.5 for ₹ 14.50 Lakh)
  rawPrice: number; // in Rupees (e.g. 1450000)
  originalPrice?: number; // for discount display in Lakhs
  kilometers: number;
  fuelType: FuelType;
  transmission: Transmission;
  bodyType: BodyType;
  ownerCount: string; // e.g. "1st Owner", "2nd Owner"
  color: string;
  location: string;
  status: CarStatus;
  isFeatured: boolean;
  isCertified: boolean; // 150+ point inspected
  registrationYear: number;
  insuranceType: string; // e.g. "Comprehensive (Valid till Dec 2026)"
  engineCapacity?: string; // e.g. "1493 cc"
  images: string[];
  features: string[];
  description: string;
  specs: {
    rto: string; // e.g. "KA-32 Kalaburagi"
    mileage: string; // e.g. "18.5 kmpl"
    power: string; // e.g. "113 bhp"
    seatingCapacity: number;
    bootSpace?: string;
    groundClearance?: string;
  };
  createdAt: string;
}

export type LeadStatus = 'New' | 'Contacted' | 'Test Drive Scheduled' | 'Closed';
export type LeadType = 'Inquiry' | 'TestDrive' | 'Sell' | 'General';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  carId?: string;
  carTitle?: string;
  type: LeadType;
  message: string;
  status: LeadStatus;
  notes?: string;
  createdAt: string;
}

export type ExchangeStatus = 'New' | 'Reviewing' | 'Accepted' | 'Rejected' | 'Closed';

export interface ExchangeRequest {
  id: string;
  customerName: string;
  phone: string;
  currentBrand: string;
  currentModel: string;
  currentYear: number;
  currentKilometers: number;
  fuelType: FuelType;
  transmission: Transmission;
  expectedPrice: number; // in Lakhs or Rupees
  comments?: string;
  images?: string[];
  targetCarId?: string;
  targetCarTitle?: string;
  status: ExchangeStatus;
  createdAt: string;
}

export interface DealershipInfo {
  name: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  phones: string[];
  whatsappNumber: string;
  googleRating: number;
  googleReviewsCount: number;
  workingHours: string;
  email: string;
  mapEmbedUrl: string;
  googleMapLink: string;
}

export interface FilterState {
  search: string;
  brand: string;
  model: string;
  rto: string;
  bodyType: string;
  fuelType: string;
  transmission: string;
  minPrice: number;
  maxPrice: number;
  minYear: number;
  maxYear: number;
  status: string;
  sort: 'newest' | 'price-asc' | 'price-desc' | 'km-asc';
}
