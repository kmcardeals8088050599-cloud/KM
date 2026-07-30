export type FuelType = 'Petrol' | 'Diesel' | 'CNG' | 'Electric' | 'Hybrid';
export type Transmission = 'Manual' | 'Automatic';
export type BodyType = 'SUV' | 'Sedan' | 'Hatchback' | 'Luxury' | 'MUV';
export type CarStatus = 'Available' | 'Reserved' | 'Sold';

export interface Car {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  transmission: Transmission;
  bodyType: BodyType;
  fuelType: FuelType;
  ownerCount: string;
  status: CarStatus;
  images: string[];
  specs: {
    rto: string;
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
  ownerCount: string;
  bodyType: string;
  fuelType: string;
  transmission: string;
  status: string;
}
