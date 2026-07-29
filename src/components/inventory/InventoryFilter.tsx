import React from 'react';
import { FilterState } from '../../types';
import { Search, RotateCcw, Grid, List } from 'lucide-react';

// Comprehensive Indian car brand → models map
export const INDIAN_CAR_BRANDS: Record<string, string[]> = {
  'Maruti Suzuki': [
    'Alto K10', 'Alto 800', 'S-Presso', 'Celerio', 'Wagon R', 'Swift',
    'Baleno', 'Dzire', 'Ignis', 'FRONX', 'Brezza', 'Grand Vitara',
    'Ertiga', 'XL6', 'Invicto', 'Jimny', 'Ciaz', 'S-Cross', 'Vitara Brezza'
  ],
  'Hyundai': [
    'Santro', 'Grand i10 Nios', 'i20', 'Aura', 'Verna', 'Exter',
    'Venue', 'Creta', 'Alcazar', 'Tucson', 'Ioniq 5', 'Kona Electric',
    'i10', 'Sonata', 'Santa Fe'
  ],
  'Tata': [
    'Tiago', 'Punch', 'Altroz', 'Nexon', 'Harrier', 'Safari',
    'Tigor', 'Manza', 'Indica', 'Zest', 'Bolt', 'Hexa',
    'Nexon EV', 'Tiago EV', 'Punch EV', 'Sierra', 'Curvv', 'Curvv EV',
    'Avinya'
  ],
  'Mahindra': [
    'Alto', 'KUV100', 'Bolero', 'Bolero Neo', 'Scorpio', 'Scorpio N',
    'Scorpio Classic', 'Thar', 'Thar Roxx', 'XUV300', 'XUV400',
    'XUV700', 'XUV3XO', 'Marazzo', 'TUV300', 'Verito', 'e2o',
    'BE 6', 'XEV 9e', 'Pik Up'
  ],
  'Toyota': [
    'Glanza', 'Rumion', 'Urban Cruiser Hyryder', 'Innova Crysta',
    'Innova HyCross', 'Fortuner', 'Fortuner Legender', 'Land Cruiser',
    'Vellfire', 'Camry', 'Hilux', 'Urban Cruiser', 'Yaris', 'Corolla',
    'Etios', 'Liva'
  ],
  'Kia': [
    'Sonet', 'Seltos', 'Carens', 'EV6', 'EV9', 'Carnival', 'Syros',
    'Sorento', 'Stinger'
  ],
  'Honda': [
    'Brio', 'Amaze', 'City', 'City e:HEV', 'Elevate', 'WR-V',
    'Jazz', 'CR-V', 'BR-V', 'Accord', 'ZR-V'
  ],
  'Renault': [
    'Kwid', 'Triber', 'Kiger', 'Duster', 'Lodgy', 'Captur', 'Pulse'
  ],
  'Nissan': [
    'Magnite', 'Kicks', 'Terrano', 'Sunny', 'Micra', 'Tekton', 'X-Trail'
  ],
  'Skoda': [
    'Rapid', 'Octavia', 'Superb', 'Kushaq', 'Slavia', 'Kodiaq',
    'Karoq', 'Enyaq'
  ],
  'Volkswagen': [
    'Polo', 'Vento', 'Taigun', 'Virtus', 'Tiguan', 'Tiguan Allspace',
    'T-Roc', 'Touareg', 'ID.4', 'Tera'
  ],
  'MG': [
    'Hector', 'Hector Plus', 'ZS EV', 'Gloster', 'Astor', 'Comet EV',
    'Windsor EV', 'Cloud EV', 'Cyberster', 'Majestor'
  ],
  'Ford': [
    'Figo', 'Freestyle', 'Aspire', 'EcoSport', 'Endeavour', 'Mustang'
  ],
  'Jeep': [
    'Compass', 'Meridian', 'Wrangler', 'Grand Cherokee', 'Grand Cherokee L'
  ],
  'Mercedes-Benz': [
    'A-Class', 'C-Class', 'E-Class', 'S-Class', 'GLA', 'GLB', 'GLC',
    'GLE', 'GLS', 'AMG GT', 'EQS', 'EQB', 'EQE', 'Maybach S-Class'
  ],
  'BMW': [
    '3 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'X7',
    'M3', 'M5', 'i4', 'iX', 'i7', '2 Series', '6 Series GT'
  ],
  'Audi': [
    'A4', 'A6', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron', 'RS5', 'TT'
  ],
  'Volvo': [
    'XC40', 'XC60', 'XC90', 'S60', 'S90', 'V60', 'C40', 'EX90'
  ],
  'Lexus': [
    'NX', 'RX', 'ES', 'LS', 'UX', 'LX', 'RC'
  ],
  'Land Rover': [
    'Range Rover', 'Range Rover Sport', 'Range Rover Evoque',
    'Range Rover Velar', 'Discovery', 'Discovery Sport', 'Defender'
  ],
  'Porsche': [
    'Cayenne', 'Macan', 'Panamera', '911', 'Taycan', '718 Cayman'
  ],
  'Citroen': [
    'C3', 'C3 Aircross', 'C5 Aircross', 'Basalt'
  ],
};

// Karnataka RTO codes
export const KARNATAKA_RTO_CODES = [
  'KA-01 (Bangalore Central)',
  'KA-02 (Bangalore North)',
  'KA-03 (Bangalore South)',
  'KA-04 (Bangalore East)',
  'KA-05 (Bangalore West)',
  'KA-41 (Bangalore Rural)',
  'KA-06 (Belagavi)',
  'KA-07 (Bidar)',
  'KA-08 (Vijayapura)',
  'KA-09 (Dharwad)',
  'KA-10 (Davanagere)',
  'KA-11 (Tumkur)',
  'KA-12 (Chitradurga)',
  'KA-13 (Hassan)',
  'KA-14 (Mysuru)',
  'KA-15 (Mandya)',
  'KA-16 (Kodagu)',
  'KA-17 (Dakshina Kannada)',
  'KA-18 (Udupi)',
  'KA-19 (Uttara Kannada)',
  'KA-20 (Shimoga)',
  'KA-21 (Chikmagalur)',
  'KA-22 (Bellary)',
  'KA-23 (Raichur)',
  'KA-24 (Gulbarga - Old)',
  'KA-25 (Yadgir)',
  'KA-26 (Koppal)',
  'KA-27 (Gadag)',
  'KA-28 (Haveri)',
  'KA-29 (Bagalkot)',
  'KA-30 (Chamarajanagara)',
  'KA-31 (Chikkaballapura)',
  'KA-32 (Kalaburagi)',
  'KA-33 (Ramanagara)',
  'KA-34 (Bangalore - ORR)',
  'KA-35 (Bangalore - Nelamangala)',
  'KA-36 (Bangalore - HKIA)',
  'KA-37 (Bangalore - Electronics City)',
  'KA-38 (Bangalore - Jayanagar)',
  'KA-50 (Vijayanagara)',
];

interface InventoryFilterProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  totalResults: number;
}

export const InventoryFilter: React.FC<InventoryFilterProps> = ({
  filters,
  setFilters,
  viewMode,
  setViewMode,
  totalResults
}) => {
  const handleReset = () => {
    setFilters({
      search: '',
      brand: 'All',
      model: 'All',
      rto: 'All',
      ownerCount: 'All',
      bodyType: 'All',
      fuelType: 'All',
      transmission: 'All',
      minPrice: 0,
      maxPrice: 50,
      minYear: 2010,
      maxYear: 2026,
      status: 'All',
      sort: 'newest'
    });
  };

  const availableModels =
    filters.brand && filters.brand !== 'All'
      ? INDIAN_CAR_BRANDS[filters.brand] ?? []
      : [];

  const handleBrandChange = (brand: string) => {
    setFilters(prev => ({ ...prev, brand, model: 'All' }));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-md">
      {/* Top Search & Layout Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200">
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by model, brand, color (e.g. Creta, Thar)..."
            value={filters.search}
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white shadow-xs"
          />
        </div>

        {/* View Toggle & Result Count */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <span className="text-xs text-slate-600 font-bold">
            Showing <strong className="text-slate-900 font-black">{totalResults}</strong> Vehicles
          </span>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-slate-900 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-slate-900 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Select Controls — Row 1 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
        {/* Brand */}
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Brand</label>
          <select
            value={filters.brand}
            onChange={e => handleBrandChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Brands</option>
            {Object.keys(INDIAN_CAR_BRANDS).map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>

        {/* Model — dynamic based on selected brand */}
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Model</label>
          <select
            value={filters.model}
            onChange={e => setFilters(prev => ({ ...prev, model: e.target.value }))}
            disabled={filters.brand === 'All' || availableModels.length === 0}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none focus:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="All">All Models</option>
            {availableModels.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>

        {/* Body Type */}
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Body Style</label>
          <select
            value={filters.bodyType}
            onChange={e => setFilters(prev => ({ ...prev, bodyType: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Styles</option>
            <option value="Hatchback">Hatchback</option>
            <option value="Sedan">Sedan</option>
            <option value="SUV">SUV</option>
            <option value="MUV">MUV</option>
            <option value="Luxury">Luxury</option>
            <option value="Coupe">Coupe</option>
            <option value="Convertible">Convertible</option>
            <option value="Pickup">Pickup / Truck</option>
          </select>
        </div>

        {/* Fuel Type */}
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Fuel Type</label>
          <select
            value={filters.fuelType}
            onChange={e => setFilters(prev => ({ ...prev, fuelType: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Fuels</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="CNG">CNG</option>
            <option value="Electric">Electric</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>
      </div>

      {/* Filter Select Controls — Row 2 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
        {/* Transmission */}
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Gearbox</label>
          <select
            value={filters.transmission}
            onChange={e => setFilters(prev => ({ ...prev, transmission: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Transmission</option>
            <option value="Automatic">Automatic</option>
            <option value="Manual">Manual</option>
          </select>
        </div>

        {/* Owner Count */}
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Owner</label>
          <select
            value={filters.ownerCount}
            onChange={e => setFilters(prev => ({ ...prev, ownerCount: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
          >
            <option value="All">Any Owner</option>
            <option value="1st Owner">1st Owner</option>
            <option value="2nd Owner">2nd Owner</option>
            <option value="3rd Owner">3rd Owner</option>
            <option value="4th Owner">4th Owner</option>
            <option value="5th Owner">5th Owner</option>
            <option value="6th Owner">6th Owner</option>
            <option value="7th Owner">7th Owner</option>
            <option value="8th Owner">8th Owner</option>
            <option value="9th Owner">9th Owner</option>
            <option value="10th Owner">10th Owner</option>
          </select>
        </div>

        {/* RTO */}
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">RTO</label>
          <select
            value={filters.rto}
            onChange={e => setFilters(prev => ({ ...prev, rto: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
          >
            <option value="All">All RTOs</option>
            {KARNATAKA_RTO_CODES.map(rto => {
              const code = rto.split(' ')[0]; // e.g. "KA-32"
              return (
                <option key={code} value={code}>{rto}</option>
              );
            })}
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Sort By</label>
          <select
            value={filters.sort}
            onChange={e => setFilters(prev => ({ ...prev, sort: e.target.value as FilterState['sort'] }))}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        {/* Reset */}
        <div className="flex items-end">
          <button
            onClick={handleReset}
            className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition-all flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
};
