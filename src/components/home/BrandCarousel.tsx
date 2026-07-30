import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BRAND_LOGOS } from '../../data/mockData';

interface BrandCarouselProps { onBrandClick: (brand: string) => void; }

export const BrandCarousel: React.FC<BrandCarouselProps> = ({ onBrandClick }) => {
  const navigate = useNavigate();

  return (
    <section className="py-12 relative overflow-hidden border-y border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center mb-6">
        <p className="text-xs font-black uppercase tracking-widest text-amber-400">Trusted Multi-Brand Selection Available at KM Car Deals</p>
      </div>
      <div className="flex items-center gap-4 overflow-x-auto max-w-7xl mx-auto px-4 justify-start md:justify-center py-2">
        {BRAND_LOGOS.map((brand, i) => (
          <button key={i} onClick={() => { onBrandClick(brand.name); navigate('/inventory'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl glass-panel border border-slate-700/50 hover:border-amber-500/40 hover:shadow-[0_8px_25px_rgba(245,158,11,0.15)] transition-all duration-300 shrink-0 group focus:outline-none hover:-translate-y-1">
            <span className="font-black text-xs text-slate-200 group-hover:text-amber-300 tracking-wide">{brand.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
};
