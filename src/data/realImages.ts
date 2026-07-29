// Real Showroom and Leadership Assets for KM Car Deals, Kalaburagi
import { getCustomPhotos } from '../utils/photoStorage';

export interface ShowroomPhoto {
  id: string;
  title: string;
  subtitle: string;
  category: 'Storefront' | 'Showroom Interior' | 'Leadership' | 'Team';
  imageUrl: string;
  description: string;
  locationTag: string;
  details?: string[];
  photoKey?: 'nawazPortrait' | 'nawazSunglasses' | 'executiveTeam' | 'storefrontYard' | 'showroomInterior';
}

export const REAL_SHOWROOM_PHOTOS: ShowroomPhoto[] = [
  {
    id: 'photo-1',
    title: 'KM Car Deals Main Storefront & Yard',
    subtitle: 'Opposite Hyundai Showroom, Humnabad Road, Kapnoor, Kalaburagi',
    category: 'Storefront',
    photoKey: 'storefrontYard',
    imageUrl: '/storeFront.jpeg',
    description: 'Our physical multi-brand showroom in Kalaburagi featuring a prominent storefront banner: "KM CAR DEALS MULTI BRAND PRE OWNED CARS - SALE | PURCHASE | BUSINESS ON COMMISSION BASIS". Display yard filled with inspected pre-owned models including BMW X3, Volkswagen Polo, Hyundai Creta, and Suzuki Dzire.',
    locationTag: 'Humnabad Road, Kapnoor, Kalaburagi',
    details: [
      'Storefront Banner: SALE | PURCHASE | BUSINESS ON COMMISSION BASIS',
      'Wide Outdoor Display Yard with Luxury & SUV Inventory',
      'Direct Contact: +91 80880 50599 / +91 81239 91847',
      '100% Non-Accidental Guarantee & Mileage Verification'
    ]
  },
  {
    id: 'photo-2',
    title: 'Showroom Interior & Luxury Car Lounge',
    subtitle: 'White Jaguar XF & Premium Sedan Lineup',
    category: 'Showroom Interior',
    photoKey: 'showroomInterior',
    imageUrl: '/indoorGarage.jpeg',
    description: 'Inside our Kalaburagi showroom featuring top-tier luxury inventory like the Jaguar XF. Transparent pricing and complete RC document verification.',
    locationTag: 'Indoor Showroom Lounge, Kalaburagi',
    details: [
      'Pristine Indoor Display for Premium Luxury Vehicles',
      'Consultation Lounge with KM Car Deals Advisors',
      'Transparent Price Negotiation & RC History Check',
      'Instant On-Spot Test Drive Assistance'
    ]
  },
  {
    id: 'photo-3',
    title: 'Md Nawaz Khan - Managing Director',
    subtitle: 'Founder & Managing Director - KM Car Deals',
    category: 'Leadership',
    photoKey: 'nawazPortrait',
    imageUrl: '/nawazPortrait.jpeg',
    description: 'Md Nawaz Khan, Founder & Managing Director of KM Car Deals Kalaburagi.',
    locationTag: 'Kalaburagi Headquarters',
    details: [
      'Founder & Managing Director - KM Car Deals',
      'Pioneered Non-Accidental Mandate in Kalaburagi',
      'Direct Customer Care: +91 80880 50599'
    ]
  },
  {
    id: 'photo-4',
    title: 'Md Nadeem Khan - Executive Director',
    subtitle: 'Executive Director - KM Car Deals',
    category: 'Leadership',
    photoKey: 'nawazSunglasses',
    imageUrl: '/nadeemPortrait.jpeg',
    description: 'Md Nadeem Khan, Executive Director at KM Car Deals Kalaburagi, leading vehicle procurement, customer relations, and transparent deal approvals.',
    locationTag: 'Executive Suite, Kalaburagi',
    details: [
      'Executive Director & Partner - KM Car Deals',
      'Vehicle Trade-In & Valuation Specialist',
      'Direct Customer Care & Deal Approval'
    ]
  },
  {
    id: 'photo-5',
    title: 'KM Car Deals 5-Member Core Management Team',
    subtitle: 'Core Management Team',
    category: 'Team',
    photoKey: 'executiveTeam',
    imageUrl: '/executiveTeam.jpeg',
    description: 'Our 5-member Core Management team in our headquarters. Specializing in executive operations, RTO RC transfers, vehicle valuations, and bank financing.',
    locationTag: 'KM Car Deals Headquarters',
    details: [
      '5 Core Management Members',
      'Dedicated Specialists in RTO Legal Work & Bank Financing',
      'Over 500+ Satisfied Car Buyers Served in Kalaburagi',
      '100% Transparent Documentation & Transfer Guarantee'
    ]
  }
];

export const getResolvedPhotos = (): ShowroomPhoto[] => {
  const custom = getCustomPhotos();
  return REAL_SHOWROOM_PHOTOS.map(photo => {
    if (photo.photoKey && custom[photo.photoKey]) {
      return {
        ...photo,
        imageUrl: custom[photo.photoKey]!
      };
    }
    return photo;
  });
};
