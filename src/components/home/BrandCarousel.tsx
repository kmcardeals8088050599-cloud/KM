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
      <div className="apple-container text-center mb-6">
        <p className="section-eyebrow">
          Trusted multi-brand selection available at KM Car Deals
        </p>
      </div>

      {/* Mobile: bespoke swipe-snap carousel of brand chips. Desktop: centered wrapped row. */}
      <div className="swipe-row gap-3 px-4 md:hidden">
        {BRAND_LOGOS.map((brand, i) => (
          <button
            key={i}
            onClick={() => {
              onBrandClick(brand.name);
              navigate('/inventory');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="swipe-item flex items-center gap-2 px-6 py-3 rounded-full bg-white shadow-card active:shadow-premium transition-all duration-300 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 whitespace-nowrap"
          >
            <span className="font-semibold text-[13px] text-slate-700 group-hover:text-slate-900 tracking-tight">
              {brand.name}
            </span>
          </button>
        ))}
      </div>
      <div className="hidden md:flex flex-wrap items-center gap-3 apple-container justify-center py-2">
        {BRAND_LOGOS.map((brand, i) => (
          <button
            key={i}
            onClick={() => {
              onBrandClick(brand.name);
              navigate('/inventory');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white shadow-card hover:shadow-premium transition-all duration-300 shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 hover:-translate-y-0.5"
          >
            <span className="font-semibold text-[13px] text-slate-700 group-hover:text-slate-900 tracking-tight">
              {brand.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};
