import React, { useState } from 'react';
import { FilterState } from '../../types';
import { Search, RotateCcw, Grid, List, SlidersHorizontal, X } from 'lucide-react';

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
  const [sheetOpen, setSheetOpen] = useState(false);

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
      status: 'All'
    });
  };

  const availableModels =
    filters.brand && filters.brand !== 'All'
      ? INDIAN_CAR_BRANDS[filters.brand] ?? []
      : [];

  const handleBrandChange = (brand: string) => {
    setFilters(prev => ({ ...prev, brand, model: 'All' }));
  };

  const activeFilterCount = [
    filters.brand !== 'All',
    filters.model !== 'All',
    filters.bodyType !== 'All',
    filters.fuelType !== 'All',
    filters.transmission !== 'All',
    filters.rto !== 'All',
    filters.ownerCount !== 'All'
  ].filter(Boolean).length;

  // Shared select controls — rendered once, used inside both the desktop
  // inline panel and the mobile bottom-sheet.
  const selectControls = (
    <>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Brand</label>
          <select
            value={filters.brand}
            onChange={e => handleBrandChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400"
          >
            <option value="All">All Brands</option>
            {Object.keys(INDIAN_CAR_BRANDS).map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Model</label>
          <select
            value={filters.model}
            onChange={e => setFilters(prev => ({ ...prev, model: e.target.value }))}
            disabled={filters.brand === 'All' || availableModels.length === 0}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="All">All Models</option>
            {availableModels.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Body Style</label>
          <select
            value={filters.bodyType}
            onChange={e => setFilters(prev => ({ ...prev, bodyType: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400"
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

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Fuel Type</label>
          <select
            value={filters.fuelType}
            onChange={e => setFilters(prev => ({ ...prev, fuelType: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400"
          >
            <option value="All">All Fuels</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="CNG">CNG</option>
            <option value="Electric">Electric</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Gearbox</label>
          <select
            value={filters.transmission}
            onChange={e => setFilters(prev => ({ ...prev, transmission: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400"
          >
            <option value="All">All Transmission</option>
            <option value="Automatic">Automatic</option>
            <option value="Manual">Manual</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">RTO</label>
          <select
            value={filters.rto}
            onChange={e => setFilters(prev => ({ ...prev, rto: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400"
          >
            <option value="All">All RTOs</option>
            {KARNATAKA_RTO_CODES.map(rto => {
              const code = rto.split(' ')[0];
              return (
                <option key={code} value={code}>{rto}</option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Owner</label>
          <select
            value={filters.ownerCount}
            onChange={e => setFilters(prev => ({ ...prev, ownerCount: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400"
          >
            <option value="All">All Owners</option>
            <option value="1st Owner">1st Owner</option>
            <option value="2nd Owner">2nd Owner</option>
            <option value="3rd Owner">3rd Owner</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={handleReset}
            className="w-full py-3 px-3 bg-slate-900 hover:bg-black text-white font-semibold text-sm rounded-2xl transition-all flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* ===== Desktop / tablet — bold inline panel with real depth ===== */}
      <div className="hidden md:block bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-7 shadow-premium">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5 pb-6 border-b border-slate-200">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" strokeWidth={1.75} />
            <input
              type="text"
              placeholder="Search by model, brand, colour..."
              value={filters.search}
              onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-11 pr-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:bg-white transition-all font-medium"
            />
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <span className="text-sm text-slate-500">
              <strong className="text-slate-900 font-bold text-base">{totalResults}</strong> vehicles
            </span>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-full transition-all ${
                  viewMode === 'grid' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" strokeWidth={1.75} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-full transition-all ${
                  viewMode === 'list' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </div>

        {selectControls}
      </div>

      {/* ===== Mobile — persistent trigger bar + bottom sheet ===== */}
      <div className="md:hidden sticky top-16 z-30 -mx-4 px-4 py-3 bg-slate-50/95 backdrop-blur-lg border-b border-slate-200/80 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Search cars..."
            value={filters.search}
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full bg-white border border-slate-200 rounded-full pl-10 pr-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 shadow-sm"
          />
        </div>

        <button
          onClick={() => setSheetOpen(true)}
          className="relative shrink-0 flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 text-white rounded-full text-xs font-semibold shadow-md"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={1.75} />
          Filters
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-600 text-[10px] font-bold text-white flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          className="shrink-0 w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-700 shadow-sm"
        >
          {viewMode === 'grid' ? <List className="w-4 h-4" strokeWidth={1.75} /> : <Grid className="w-4 h-4" strokeWidth={1.75} />}
        </button>
      </div>

      <div className="md:hidden -mt-1 flex items-center justify-between text-xs text-slate-500 px-1">
        <span><strong className="text-slate-900 font-bold">{totalResults}</strong> vehicles found</span>
      </div>

      {sheetOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSheetOpen(false)}
          />
          <div className="bottom-sheet animate-sheet-up">
            <div className="bottom-sheet-handle" />
            <div className="px-5 pb-6 pt-1">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Filter Vehicles</h3>
                <button
                  onClick={() => setSheetOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-600"
                >
                  <X className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </div>

              {selectControls}

              <button
                onClick={() => setSheetOpen(false)}
                className="btn-accent-apple w-full mt-5 !py-3.5 text-sm"
              >
                Show {totalResults} Vehicles
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
