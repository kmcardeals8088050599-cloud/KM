import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BRAND_LOGOS } from '../../data/mockData';

interface BrandCarouselProps {
  onBrandClick: (brand: string) => void;
}

export const BrandCarousel: React.FC<BrandCarouselProps> = ({ onBrandClick }) => {
  const navigate = useNavigate();

  return (
    <section className="py-14 relative overflow-hidden bg-slate-50 border-y border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center mb-6">
        <p className="section-eyebrow">
          Trusted multi-brand selection available at KM Car Deals
        </p>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar max-w-7xl mx-auto px-4 justify-start md:justify-center py-2">
        {BRAND_LOGOS.map((brand, i) => (
          <button
            key={i}
            onClick={() => {
              onBrandClick(brand.name);
              navigate('/inventory');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white shadow-card hover:shadow-premium transition-all duration-300 shrink-0 group focus:outline-none hover:-translate-y-0.5"
          >
            <span className="font-medium text-[13px] text-slate-700 group-hover:text-slate-900 tracking-tight">
              {brand.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};
