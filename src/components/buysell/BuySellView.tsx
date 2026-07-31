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

  return (
    <div className="py-28 px-4 lg:px-8 bg-slate-50 min-h-screen text-slate-800">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-black text-amber-900 uppercase tracking-widest bg-amber-100/90 px-4 py-1.5 rounded-full border border-amber-300 shadow-sm">
            Buy, Sell, Exchange &amp; Brokerage
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            BUY &amp; SELL <span className="text-gradient-amber">PRE-OWNED CARS</span> WITH CONFIDENCE
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            Whether you want to purchase a certified car with bank loan assistance, sell your existing vehicle for same-day cash, or exchange for an upgrade in Kalaburagi, we guarantee transparent deals.
          </p>
        </div>

        {/* 2-Column Grid: Buy vs Sell */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Buy Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-xs">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Buy a Certified Pre-Owned Car</h2>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Browse our multi-brand inventory featuring Hyundai, Maruti, Mahindra, Toyota, Tata, Kia, and Luxury cars.
              </p>

              <ul className="space-y-2 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Non-Accidental Structural Guarantee</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verified Kilometers with Dealer Records</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Fast Bank Finance &amp; Low EMI Rates</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                setActiveTab('inventory');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Explore Available Inventory</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Sell / Brokerage Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-xs">
                <Tag className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Sell / Commission Brokerage</h2>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Get maximum market value for your vehicle with direct showroom display or instant cash sale.
              </p>

              <ul className="space-y-2 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Doorstep Physical Inspection in Kalaburagi</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Immediate Bank Payment &amp; Name Transfer Guarantee</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Low Commission Rates for Brokerage Display</span>
                </li>
              </ul>
            </div>

            {submitted ? (
              <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl text-center">
                Details received! Our manager will call you for doorstep inspection.
              </div>
            ) : (
              <form onSubmit={handleSellSubmit} className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={sellerName}
                    onChange={e => setSellerName(e.target.value)}
                    className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Phone Number"
                    value={sellerPhone}
                    onChange={e => setSellerPhone(e.target.value)}
                    className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Car Brand & Model (e.g. Swift 2021)"
                    value={carDetails}
                    onChange={e => setCarDetails(e.target.value)}
                    className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="number"
                    placeholder="Asking Price (Lakhs)"
                    value={askingPrice}
                    onChange={e => setAskingPrice(e.target.value)}
                    className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-amber-800 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl shadow-sm transition-colors"
                >
                  Submit Car for Valuation
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
