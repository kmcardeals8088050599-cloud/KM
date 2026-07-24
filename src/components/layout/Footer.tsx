import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, ShieldCheck, Star, ArrowUpRight, MessageCircle } from 'lucide-react';
import { DEALERSHIP_INFO } from '../../data/mockData';
import { createWhatsAppLink } from '../../lib/api';
import { KmLogo } from '../common/KmLogo';

export const Footer: React.FC = () => {
  const whatsappUrl = createWhatsAppLink(
    DEALERSHIP_INFO.whatsappNumber,
    "Hi KM Car Deals, I'm interested in viewing your available pre-owned vehicles in Kalaburagi."
  );

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-12 relative overflow-hidden">
      {/* Background Ambient Refractions */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none animate-orb-1"></div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <KmLogo variant="amber" size="lg" />
            </Link>

            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Kalaburagi's premier multi-brand pre-owned car dealership. Managed by <strong className="text-white font-bold">Md Nawaz Khan</strong>. Every car undergoes a stringent 150-point technical check with non-accidental guarantee.
            </p>

            <div className="pt-2 flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-bold text-amber-400 border border-amber-500/30">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>5.0 Star Rated on Google</span>
              </div>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-white uppercase tracking-wider border-l-2 border-amber-500 pl-2.5">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              {[
                { path: '/', label: 'Home Overview' },
                { path: '/inventory', label: 'Browse Vehicle Inventory' },
                { path: '/exchange', label: 'Submit Car for Exchange' },
                { path: '/buy-sell', label: 'Buy & Sell Services' },
                { path: '/about', label: 'About KM Car Deals' },
                { path: '/contact', label: 'Location & Working Hours' },
              ].map(link => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="hover:text-amber-400 transition-colors flex items-center gap-1.5 text-slate-300 font-medium"
                  >
                    <span className="text-amber-500 font-bold">›</span> {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services & Guarantees */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-white uppercase tracking-wider border-l-2 border-amber-500 pl-2.5">
              Services & Assurances
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Non-Accidental Vehicle Guarantee</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>150-Point Quality Inspection</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant Vehicle Exchange Trade-In</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Easy Bank Loan & EMI Approval</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Fast & Legal RC Transfer Support</span>
              </li>
            </ul>
          </div>

          {/* Address & Contact Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-white uppercase tracking-wider border-l-2 border-amber-500 pl-2.5">
              Showroom Location
            </h4>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">{DEALERSHIP_INFO.address}</p>
                  <p className="text-slate-400">{DEALERSHIP_INFO.city}, {DEALERSHIP_INFO.state} - {DEALERSHIP_INFO.pincode}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="space-y-0.5">
                  {DEALERSHIP_INFO.phones.map((p, idx) => (
                    <a key={idx} href={`tel:${p}`} className="block hover:text-amber-400 transition-colors font-bold text-white">
                      {p}
                    </a>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-slate-300 font-medium">{DEALERSHIP_INFO.workingHours}</span>
              </div>

              <div className="pt-2">
                <a
                  href={DEALERSHIP_INFO.googleMapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 text-xs font-black transition-colors"
                >
                  <span>Open Location in Google Maps</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Credits Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
          <p>© {new Date().getFullYear()} KM Car Deals. All rights reserved. Kalaburagi, Karnataka.</p>

          <div className="flex items-center gap-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors font-extrabold"
            >
              <MessageCircle className="w-4 h-4 fill-emerald-400" />
              <span>WhatsApp Direct Line</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
