import React, { useState } from 'react';
import { ShoppingBag, Tag, CheckCircle2, ArrowRight } from 'lucide-react';
import { submitLeadApi } from '../../lib/api';
import { TradeInEstimator } from '../common/TradeInEstimator';

interface BuySellViewProps {
  setActiveTab: (tab: string) => void;
  onOpenExchangeModal: () => void;
}

export const BuySellView: React.FC<BuySellViewProps> = ({ setActiveTab }) => {
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [carDetails, setCarDetails] = useState('');
  const [askingPrice, setAskingPrice] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSellSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerName || !sellerPhone) return;

    await submitLeadApi({
      name: sellerName,
      phone: sellerPhone,
      type: 'Sell',
      message: `Car Details: ${carDetails} | Asking Price: ₹ ${askingPrice} Lakhs`
    });

    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  const inputClasses = "p-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-shadow";

  return (
    <div className="pb-28 px-4 lg:px-8 bg-white min-h-screen text-slate-800">
      <div className="max-w-7xl mx-auto space-y-20">
        {/* Header - dark hero band for bold presence */}
        <div className="relative -mx-4 lg:-mx-8 bg-gradient-obsidian px-4 lg:px-8 pt-32 pb-20 overflow-hidden shadow-xl">
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_70%_10%,rgba(201,169,110,0.35),transparent_55%)]" />
          <div className="relative z-10 text-center max-w-3xl mx-auto space-y-4">
            <p className="section-eyebrow-light">Buy, Sell, Exchange &amp; Brokerage</p>
            <h1 className="section-headline-light">
              Buy &amp; sell pre-owned cars with <span className="text-gradient-amber">confidence</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Whether you want to purchase a certified car with bank loan assistance, sell your existing vehicle for same-day cash, or exchange for an upgrade in Kalaburagi, we guarantee transparent deals.
            </p>
          </div>
        </div>

        {/* 2-Column Grid: Buy vs Sell */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Buy Card */}
          <div className="executive-card rounded-3xl p-10 space-y-8 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-[0_8px_20px_-4px_rgba(201,169,110,0.5)]">
                <ShoppingBag className="w-6 h-6 text-slate-950" strokeWidth={1.75} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Buy a certified pre-owned car</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Browse our multi-brand inventory featuring Hyundai, Maruti, Mahindra, Toyota, Tata, Kia, and luxury cars.
              </p>

              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={1.75} />
                  <span>100% non-accidental structural guarantee</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={1.75} />
                  <span>Verified kilometers with dealer records</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={1.75} />
                  <span>Fast bank finance &amp; low EMI rates</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                setActiveTab('inventory');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="btn-primary-apple w-full flex items-center justify-center gap-2"
            >
              <span>Explore available inventory</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>

          {/* Sell / Brokerage Card */}
          <div className="executive-card rounded-3xl p-10 space-y-8 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-[0_8px_20px_-4px_rgba(201,169,110,0.5)]">
                <Tag className="w-6 h-6 text-slate-950" strokeWidth={1.75} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sell / commission brokerage</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Get maximum market value for your vehicle with direct showroom display or instant cash sale.
              </p>

              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={1.75} />
                  <span>Doorstep physical inspection in Kalaburagi</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={1.75} />
                  <span>Immediate bank payment &amp; name transfer guarantee</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={1.75} />
                  <span>Low commission rates for brokerage display</span>
                </li>
              </ul>
            </div>

            {submitted ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl text-center">
                Details received! Our manager will call you for doorstep inspection.
              </div>
            ) : (
              <form onSubmit={handleSellSubmit} className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Your name"
                    value={sellerName}
                    onChange={e => setSellerName(e.target.value)}
                    className={inputClasses}
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Phone number"
                    value={sellerPhone}
                    onChange={e => setSellerPhone(e.target.value)}
                    className={inputClasses}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Car brand & model (e.g. Swift 2021)"
                    value={carDetails}
                    onChange={e => setCarDetails(e.target.value)}
                    className={inputClasses}
                  />
                  <input
                    type="number"
                    placeholder="Asking price (Lakhs)"
                    value={askingPrice}
                    onChange={e => setAskingPrice(e.target.value)}
                    className={`${inputClasses} text-amber-700`}
                  />
                </div>
                <button
                  type="submit"
                  className="btn-accent-apple w-full"
                >
                  Submit car for valuation
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Trade-In Estimator Widget */}
        <TradeInEstimator />
      </div>
    </div>
  );
};
