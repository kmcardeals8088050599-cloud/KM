import React from 'react';
import { Star, CheckCircle2 } from 'lucide-react';
import { TESTIMONIALS, DEALERSHIP_INFO } from '../../data/mockData';

export const Testimonials: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 px-4 lg:px-8 relative z-10 bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-14">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3">
            <p className="section-eyebrow">Verified Buyer Feedback</p>
            <h2 className="section-headline">
              What our customers say
            </h2>
            <p className="text-sm text-slate-500">
              Read authentic reviews from happy car buyers across Kalaburagi.
            </p>
          </div>

          <div className="bg-white px-6 py-4 rounded-3xl flex items-center gap-4 shadow-card shrink-0">
            <div className="text-3xl font-semibold text-slate-900">{DEALERSHIP_INFO.googleRating}.0</div>
            <div>
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                ))}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Google Verified Dealership ({DEALERSHIP_INFO.googleReviewsCount}+ Reviews)
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(item => (
            <div
              key={item.id}
              className="bg-white p-7 rounded-3xl flex flex-col justify-between space-y-4 shadow-card hover:shadow-premium transition-shadow duration-300"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">{item.date}</span>
                </div>

                <p className="text-[13px] text-slate-600 italic leading-relaxed">
                  "{item.review}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-semibold text-slate-900">{item.name}</h4>
                  <p className="text-[11px] text-slate-500">{item.location}</p>
                </div>
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" strokeWidth={1.75} />
                  {item.carPurchased}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
