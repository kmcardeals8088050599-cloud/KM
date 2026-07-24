import React from 'react';
import { FilterState } from '../../types';
import { Search, RotateCcw, Grid, List } from 'lucide-react';

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

      {/* Filter Select Controls Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        {/* Brand */}
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Brand</label>
          <select
            value={filters.brand}
            onChange={e => setFilters(prev => ({ ...prev, brand: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Brands</option>
            <option value="Hyundai">Hyundai</option>
            <option value="Maruti Suzuki">Maruti Suzuki</option>
            <option value="Mahindra">Mahindra</option>
            <option value="Toyota">Toyota</option>
            <option value="Tata">Tata</option>
            <option value="Kia">Kia</option>
            <option value="Honda">Honda</option>
            <option value="Mercedes-Benz">Mercedes-Benz</option>
            <option value="BMW">BMW</option>
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
            <option value="SUV">SUV</option>
            <option value="Sedan">Sedan</option>
            <option value="Hatchback">Hatchback</option>
            <option value="Luxury">Luxury</option>
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
          </select>
        </div>

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

        {/* Sort */}
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Sort By</label>
          <select
            value={filters.sort}
            onChange={e => setFilters(prev => ({ ...prev, sort: e.target.value as any }))}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price_low_high">Price: Low to High</option>
            <option value="price_high_low">Price: High to Low</option>
            <option value="km_low_high">Lowest Mileage</option>
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
