import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Tag, RefreshCw, Briefcase, ArrowRight, CheckCircle } from 'lucide-react';

interface ServicesSectionProps {
  setActiveTab?: (tab: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = () => {
  const navigate = useNavigate();

  const services = [
    {
      id: 'buy',
      title: 'Buy Pre-Owned Cars',
      icon: <ShoppingBag className="w-5 h-5 text-slate-900" strokeWidth={1.5} />,
      description: 'Explore certified pre-owned multi-brand vehicles with transparent pricing, full service records, and non-accidental guarantees.',
      features: ['150-Point Quality Inspection', 'Instant RC Name Transfer', 'Bank Finance & Low Interest Rates'],
      actionLabel: 'Browse Inventory',
      route: '/inventory',
      badge: 'Certified Quality'
    },
    {
      id: 'exchange',
      title: 'Vehicle Exchange (Trade-In)',
      icon: <RefreshCw className="w-5 h-5 text-slate-900" strokeWidth={1.5} />,
      description: 'Submit your existing car to upgrade seamlessly to any vehicle in our showroom with top market exchange valuation.',
      features: ['Instant On-Spot Physical Evaluation', 'Highest Exchange Value Offered', 'Zero Hassle Paperwork'],
      actionLabel: 'Exchange Your Vehicle',
      route: '/exchange',
      badge: 'Most Popular'
    },
    {
      id: 'sell',
      title: 'Sell Your Car Directly',
      icon: <Tag className="w-5 h-5 text-slate-900" strokeWidth={1.5} />,
      description: 'Get instant cash payment or bank transfer for your car. We offer fair market prices with immediate legal name transfer.',
      features: ['Same-Day Direct Payment', 'Free Vehicle Doorstep Appraisal', 'Safe Legal Transfer Protection'],
      actionLabel: 'Sell My Car',
      route: '/buy-sell',
      badge: 'Best Value'
    },
    {
      id: 'brokerage',
      title: 'Commission Brokerage',
      icon: <Briefcase className="w-5 h-5 text-slate-900" strokeWidth={1.5} />,
      description: 'Sell your vehicle to genuine end-buyers through our extensive network in Kalaburagi while earning maximum return on minimal commission.',
      features: ['Genuine Buyer Verification', 'Professional Showroom Display', 'Safe Escrow & Payment Handling'],
      actionLabel: 'Brokerage Consultation',
      route: '/buy-sell',
      badge: 'Trusted Network'
    }
  ];

  return (
    <section className="py-20 sm:py-28 px-4 lg:px-8 relative z-10 bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-14">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <p className="section-eyebrow">Our Core Automotive Services</p>
          <h2 className="section-headline">
            Sale, purchase, exchange, brokerage
          </h2>
          <p className="text-sm text-slate-500">
            Whether you want to buy, sell, exchange, or place your car on brokerage in Kalaburagi, KM Car Deals provides complete transparency and peace of mind.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-3xl p-7 flex flex-col justify-between shadow-card hover:shadow-premium transition-shadow duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center">
                    {service.icon}
                  </div>
                  <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                    {service.badge}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-slate-900">
                  {service.title}
                </h3>

                <p className="text-[13px] text-slate-500 leading-relaxed">
                  {service.description}
                </p>

                <div className="space-y-2 pt-3 border-t border-slate-100">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[12px] text-slate-600">
                      <CheckCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={1.75} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => {
                    navigate(service.route);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="btn-primary-apple w-full !text-[13px]"
                >
                  <span>{service.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
