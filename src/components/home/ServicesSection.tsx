import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, RefreshCw, Tag, Briefcase, ArrowRight, CheckCircle } from 'lucide-react';

interface ServicesSectionProps { setActiveTab?: (tab: string) => void; }

export const ServicesSection: React.FC<ServicesSectionProps> = () => {
  const navigate = useNavigate();
  const services = [
    { id: 'buy', title: 'Buy Pre-Owned Cars', icon: <ShoppingBag className="w-6 h-6 text-amber-400" />, description: 'Explore certified pre-owned multi-brand vehicles with 100% transparent pricing, full service records, and non-accidental guarantees.', features: ['150-Point Quality Inspection', 'Instant RC Name Transfer', 'Bank Finance & Low Interest Rates'], actionLabel: 'Browse Inventory', route: '/inventory', badge: 'Certified Quality' },
    { id: 'exchange', title: 'Vehicle Exchange (Trade-In)', icon: <RefreshCw className="w-6 h-6 text-amber-400" />, description: 'Submit your existing car to upgrade seamlessly to any vehicle in our showroom with top market exchange valuation.', features: ['Instant On-Spot Evaluation', 'Highest Exchange Value Offered', 'Zero Hassle Paperwork'], actionLabel: 'Exchange Your Vehicle', route: '/exchange', badge: 'Most Popular' },
    { id: 'sell', title: 'Sell Your Car Directly', icon: <Tag className="w-6 h-6 text-amber-400" />, description: 'Get instant cash payment or bank transfer for your car. We offer fair market prices with immediate legal name transfer.', features: ['Same-Day Direct Payment', 'Free Vehicle Doorstep Appraisal', 'Safe Legal Transfer Protection'], actionLabel: 'Sell My Car', route: '/buy-sell', badge: 'Best Value' },
    { id: 'brokerage', title: 'Commission Brokerage', icon: <Briefcase className="w-6 h-6 text-amber-400" />, description: 'Sell your vehicle to genuine end-buyers through our extensive network in Kalaburagi while earning maximum return on minimal commission.', features: ['Genuine Buyer Verification', 'Professional Showroom Display', 'Safe Escrow & Payment Handling'], actionLabel: 'Brokerage Consultation', route: '/buy-sell', badge: 'Trusted Network' }
  ];

  return (
    <section className="py-20 px-4 lg:px-8 relative z-10 border-t border-slate-800/50">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-black text-amber-400 uppercase tracking-widest bg-amber-950/40 px-4 py-1.5 rounded-full border border-amber-500/20">Our Core Automotive Services</span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">SALE • PURCHASE • EXCHANGE • BROKERAGE</h2>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">Whether you want to buy, sell, exchange, or place your car on brokerage in Kalaburagi, KM Car Deals provides complete transparency and peace of mind.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map(service => (
            <div key={service.id} className="glass-panel rounded-3xl p-6 flex flex-col justify-between border border-slate-700/50 hover:border-amber-500/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-2 group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">{service.icon}</div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-500/20">{service.badge}</span>
                </div>
                <h3 className="text-xl font-black text-white group-hover:text-amber-300 transition-colors">{service.title}</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">{service.description}</p>
                <div className="space-y-2 pt-2 border-t border-slate-700/50">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-300 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-6">
                <button onClick={() => { navigate(service.route); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs rounded-2xl transition-all shadow-md border border-amber-400/30 flex items-center justify-center gap-2">
                  <span>{service.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
