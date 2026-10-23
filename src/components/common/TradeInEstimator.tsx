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
    <div className="executive-card rounded-3xl p-6 sm:p-8">
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-200">
        <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
          <RefreshCw className="w-5 h-5" strokeWidth={1.75} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Instant Car Exchange Valuation</h3>
          <p className="text-xs text-slate-500">Estimate market trade-in value for your existing car in 10 seconds</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-600 mb-1.5">Select Brand</label>
            <select
              value={brand}
              onChange={e => setBrand(e.target.value)}
              className="select-plain w-full bg-slate-50 border border-transparent rounded-xl p-2.5 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
            >
              {['Hyundai', 'Maruti Suzuki', 'Mahindra', 'Tata', 'Toyota', 'Honda', 'Kia', 'BMW', 'Mercedes-Benz'].map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 mb-1.5">Model Name / Variant</label>
            <input
              type="text"
              value={model}
              onChange={e => setModel(e.target.value)}
              placeholder="e.g. Creta SX / Swift ZXI"
              className="w-full bg-slate-50 border border-transparent rounded-xl p-2.5 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 mb-1.5">Manufacturing Year</label>
              <select
                value={year}
                onChange={e => setYear(parseInt(e.target.value))}
                className="select-plain w-full bg-slate-50 border border-transparent rounded-xl p-2.5 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
              >
                {[2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-600 mb-1.5">Kilometers Driven</label>
              <input
                type="number"
                value={km}
                onChange={e => setKm(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-transparent rounded-xl p-2.5 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
              />
            </div>
          </div>
        </div>

        {/* Valuation Result — bold, substantial numeral treatment */}
        <div className="highlight-card p-6 sm:p-7 flex flex-col justify-between text-slate-900">
          <div className="space-y-3">
            <span className="section-eyebrow !text-[11px] block">Estimated Trade-In Range</span>
            <div>
              <div className="text-4xl sm:text-5xl font-semibold tracking-tight text-amber-600">
                ₹{estimatedPriceLakhs}L
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">Based on Kalaburagi market trends &amp; condition</p>
            </div>

            <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs text-slate-600">
              <p className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.75} /> Free door-step physical evaluation
              </p>
              <p className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.75} /> Instant payment &amp; same-day transfer
              </p>
            </div>
          </div>

          <button
            onClick={() => onProceedExchange({ brand, model, year, km })}
            className="btn-accent-apple w-full mt-6"
          >
            <span>Submit Full Exchange Request</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );
};
