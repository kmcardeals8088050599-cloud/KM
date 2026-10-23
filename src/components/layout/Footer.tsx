import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
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
    <footer className="bg-slate-100 text-slate-600 border-t border-slate-200">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 pt-12 pb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 pb-8 border-b border-slate-300/60">
          <div className="col-span-2 sm:col-span-1 space-y-3">
            <KmLogo variant="gold" size="sm" />
            <p className="text-[13px] leading-relaxed text-slate-500 max-w-xs">
              Kalaburagi's multi-brand pre-owned car dealership. 150-point inspected, non-accidental guaranteed.
            </p>
          </div>

          {columns.map(col => (
            <div key={col.title} className="space-y-3">
              <h4 className="text-[13px] font-semibold text-slate-900">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map(link => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-slate-500">
          <p>
            Copyright © {new Date().getFullYear()} KM Car Deals. {DEALERSHIP_INFO.address}, {DEALERSHIP_INFO.city},{' '}
            {DEALERSHIP_INFO.state} {DEALERSHIP_INFO.pincode}.
          </p>

          <div className="flex items-center gap-4">
            {DEALERSHIP_INFO.phones.map((p, idx) => (
              <a key={idx} href={`tel:${p}`} className="hover:text-slate-900 transition-colors">
                {p}
              </a>
            ))}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 transition-colors font-medium"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
