import React from 'react';
import { Star, CheckCircle2 } from 'lucide-react';
import { TESTIMONIALS, DEALERSHIP_INFO } from '../../data/mockData';

export const Testimonials: React.FC = () => {
  return (
    <section className="py-20 px-4 lg:px-8 border-t border-slate-800/50 relative z-10">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs font-black text-amber-400 uppercase tracking-widest bg-amber-950/40 px-4 py-1.5 rounded-full border border-amber-500/20">Verified Buyer Feedback</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-2">WHAT OUR CUSTOMERS SAY</h2>
            <p className="text-xs text-slate-400 font-medium mt-1">Read authentic reviews from happy car buyers across Kalaburagi</p>
          </div>
          <div className="glass-panel border border-slate-700/50 px-6 py-4 rounded-3xl flex items-center gap-4 shadow-md">
            <div className="text-3xl font-black text-white">{DEALERSHIP_INFO.googleRating}.0</div>
            <div>
              <div className="flex items-center gap-1 text-amber-500">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-500" />)}</div>
              <span className="text-[11px] text-slate-400 font-bold">Google Verified Dealership ({DEALERSHIP_INFO.googleReviewsCount}+ Reviews)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(item => (
            <div key={item.id} className="glass-panel p-6 rounded-3xl flex flex-col justify-between space-y-4 border border-slate-700/50 hover:border-amber-500/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">{[...Array(item.rating)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />)}</div>
                  <span className="text-[10px] text-slate-500 font-semibold">{item.date}</span>
                </div>
                <p className="text-xs text-slate-300 italic leading-relaxed font-medium">"{item.review}"</p>
              </div>
              <div className="pt-4 border-t border-slate-700/50 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-black text-white">{item.name}</h4>
                  <p className="text-[10px] text-slate-400 font-medium">{item.location}</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />{item.carPurchased}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
