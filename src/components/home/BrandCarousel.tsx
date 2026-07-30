import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BRAND_LOGOS } from '../../data/mockData';

interface BrandCarouselProps {
  onBrandClick: (brand: string) => void;
}

export const BrandCarousel: React.FC<BrandCarouselProps> = ({ onBrandClick }) => {
  const navigate = useNavigate();

  return (
    <section className="py-12 relative overflow-hidden bg-slate-100 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center mb-6">
        <p className="text-xs font-black uppercase tracking-widest text-amber-700 font-serif">
          Trusted Multi-Brand Selection Available at KM Car Deals
        </p>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar max-w-7xl mx-auto px-4 justify-start md:justify-center py-2">
        {BRAND_LOGOS.map((brand, i) => (
          <button
            key={i}
            onClick={() => {
              onBrandClick(brand.name);
              navigate('/inventory');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-amber-500/60 hover:shadow-[0_8px_25px_rgba(245,158,11,0.25)] transition-all duration-300 shrink-0 group focus:outline-none hover:-translate-y-1"
          >
            <span className="font-black text-xs text-slate-800 group-hover:text-amber-600 tracking-wide font-serif">
              {brand.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};
