import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, MapPin, Phone, Clock, Star } from 'lucide-react';
import { DEALERSHIP_INFO } from '../../data/mockData';
import { createWhatsAppLink } from '../../lib/api';
import { KmLogo } from '../common/KmLogo';

export const Footer: React.FC = () => {
  const whatsappUrl = createWhatsAppLink(
    DEALERSHIP_INFO.whatsappNumber,
    "Hi KM Car Deals, I'm interested in viewing your available pre-owned vehicles in Kalaburagi."
  );

  const columns = [
    {
      title: 'Explore',
      links: [
        { path: '/inventory', label: 'Inventory' },
        { path: '/exchange', label: 'Exchange your car' },
        { path: '/buy-sell', label: 'Buy & sell' },
        { path: '/compare', label: 'Compare vehicles' },
      ],
    },
    {
      title: 'Company',
      links: [
        { path: '/about', label: 'About us' },
        { path: '/contact', label: 'Location & hours' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { path: '/privacy', label: 'Privacy policy' },
        { path: '/terms', label: 'Terms & conditions' },
      ],
    },
  ];

  return (
    <footer className="bg-gradient-obsidian text-slate-400 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[32rem] h-[32rem] bg-amber-500/[0.06] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[28rem] h-[28rem] bg-emerald-500/[0.05] rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-16 pb-8 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          <div className="col-span-2 space-y-4">
            <KmLogo variant="white" size="sm" />
            <p className="text-[13.5px] leading-relaxed text-slate-400 max-w-xs">
              Kalaburagi's premier multi-brand pre-owned car dealership, managed by{' '}
              <span className="text-white font-semibold">Md Nadeem Khan</span>. 150-point inspected, non-accidental
              guaranteed.
            </p>
            <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 text-xs font-semibold text-amber-300">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              5.0 Rated on Google
            </div>
          </div>

          {columns.map(col => (
            <div key={col.title} className="space-y-3.5">
              <h4 className="text-[13px] font-bold text-white tracking-wide">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map(link => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="text-[13.5px] text-slate-400 hover:text-amber-300 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="space-y-3.5 col-span-2 sm:col-span-1">
            <h4 className="text-[13px] font-bold text-white tracking-wide">Visit us</h4>
            <div className="space-y-3 text-[13px]">
              <p className="flex items-start gap-2 text-slate-400">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  {DEALERSHIP_INFO.address}, {DEALERSHIP_INFO.city}
                </span>
              </p>
              <p className="flex items-center gap-2 text-slate-400">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                {DEALERSHIP_INFO.workingHours}
              </p>
              {DEALERSHIP_INFO.phones.map((p, idx) => (
                <a key={idx} href={`tel:${p}`} className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors font-medium">
                  <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                  {p}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-slate-500">
          <p>Copyright © {new Date().getFullYear()} KM Car Deals. All rights reserved.</p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors font-semibold"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </footer>
  );
};
