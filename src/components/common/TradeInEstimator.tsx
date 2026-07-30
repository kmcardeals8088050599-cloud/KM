import React, { useState } from 'react';
import { RefreshCw, ArrowRight, ShieldCheck, Car as CarIcon, DollarSign } from 'lucide-react';

interface TradeInEstimatorProps {
  onProceedExchange: (data: { brand: string; year: number; km: number; model: string }) => void;
}

export const TradeInEstimator: React.FC<TradeInEstimatorProps> = ({ onProceedExchange }) => {
  const [brand, setBrand] = useState('Hyundai');
  const [model, setModel] = useState('i20 / Creta');
  const [year, setYear] = useState(2020);
  const [km, setKm] = useState(45000);

  // Quick heuristic valuation calculation in Lakhs
  const basePriceMap: Record<string, number> = {
    Hyundai: 6.5,
    'Maruti Suzuki': 5.5,
    Mahindra: 9.0,
    Tata: 6.0,
    Toyota: 12.0,
    Honda: 6.0,
    Kia: 8.0,
    BMW: 18.0,
    'Mercedes-Benz': 20.0
  };

  const base = basePriceMap[brand] || 6.0;
  const yearFactor = Math.max(0.4, 1 - (2026 - year) * 0.08);
  const kmFactor = Math.max(0.6, 1 - (km / 100000) * 0.25);
  const estimatedPriceLakhs = (base * yearFactor * kmFactor).toFixed(2);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-xs">
          <RefreshCw className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Instant Car Exchange Valuation</h3>
          <p className="text-xs text-slate-500 font-medium">Estimate market trade-in value for your existing car in 10 seconds</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Select Brand</label>
            <select
              value={brand}
              onChange={e => setBrand(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none focus:border-amber-600"
            >
              {['Hyundai', 'Maruti Suzuki', 'Mahindra', 'Tata', 'Toyota', 'Honda', 'Kia', 'BMW', 'Mercedes-Benz'].map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Model Name / Variant</label>
            <input
              type="text"
              value={model}
              onChange={e => setModel(e.target.value)}
              placeholder="e.g. Creta SX / Swift ZXI"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-amber-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Manufacturing Year</label>
              <select
                value={year}
                onChange={e => setYear(parseInt(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none focus:border-amber-600"
              >
                {[2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Kilometers Driven</label>
              <input
                type="number"
                value={km}
                onChange={e => setKm(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>
        </div>

        {/* Valuation Result */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider block">Estimated Trade-In Range</span>
            <div>
              <div className="text-3xl font-black text-amber-800 tracking-tight">
                ₹ {estimatedPriceLakhs} Lakhs
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Based on Kalaburagi market trends & condition</p>
            </div>

            <div className="pt-3 border-t border-slate-200 space-y-1 text-xs text-slate-700 font-medium">
              <p className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Free door-step physical evaluation
              </p>
              <p className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Instant payment & same-day transfer
              </p>
            </div>
          </div>

          <button
            onClick={() => onProceedExchange({ brand, model, year, km })}
            className="w-full mt-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <span>Submit Full Exchange Request</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
