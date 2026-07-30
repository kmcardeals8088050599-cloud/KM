import React from 'react';
import { MapPin, Phone, Clock, MessageCircle, Navigation, ExternalLink } from 'lucide-react';
import { DEALERSHIP_INFO } from '../../data/mockData';
import { createWhatsAppLink } from '../../lib/api';

export const LocationSection: React.FC = () => {
  const whatsappUrl = createWhatsAppLink(DEALERSHIP_INFO.whatsappNumber, "Hi KM Car Deals, I'd like to visit your showroom opposite Hyundai Showroom in Kalaburagi.");

  return (
    <section className="py-20 px-4 lg:px-8 border-t border-slate-800/50 relative z-10">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-black text-amber-400 uppercase tracking-widest bg-amber-950/40 px-4 py-1.5 rounded-full border border-amber-500/20">Verified Showroom Location</span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">VISIT KM CAR DEALS SHOWROOM</h2>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">Conveniently located on Humnabad Road, Kapnoor, opposite Hyundai Showroom in Kalaburagi</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-5 glass-panel rounded-3xl p-8 flex flex-col justify-between space-y-6 border border-slate-700/50 shadow-xl">
            <div className="space-y-5">
              <div className="border-b border-slate-700/50 pb-4">
                <h3 className="text-2xl font-black text-white tracking-tight">{DEALERSHIP_INFO.name}</h3>
                <p className="text-xs text-amber-400 font-extrabold uppercase tracking-widest mt-1">{DEALERSHIP_INFO.tagline}</p>
              </div>
              <div className="space-y-5 text-xs">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0"><MapPin className="w-5 h-5 text-amber-400" /></div>
                  <div>
                    <span className="text-amber-400 font-black block uppercase text-[10px] tracking-wider">Exact Address</span>
                    <p className="font-black text-white leading-relaxed mt-0.5 text-sm">{DEALERSHIP_INFO.address}, {DEALERSHIP_INFO.city}, {DEALERSHIP_INFO.state} - {DEALERSHIP_INFO.pincode}</p>
                    <p className="text-amber-400 font-bold mt-1">Landmark: {DEALERSHIP_INFO.landmark}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0"><Phone className="w-5 h-5 text-amber-400" /></div>
                  <div>
                    <span className="text-amber-400 font-black block uppercase text-[10px] tracking-wider">Direct Phone Lines</span>
                    <div className="space-y-1 font-extrabold text-white mt-0.5 text-sm">
                      {DEALERSHIP_INFO.phones.map((p, idx) => <a key={idx} href={`tel:${p}`} className="block hover:text-amber-300 transition-colors">{p}</a>)}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0"><Clock className="w-5 h-5 text-amber-400" /></div>
                  <div>
                    <span className="text-amber-400 font-black block uppercase text-[10px] tracking-wider">Working Hours</span>
                    <p className="font-extrabold text-white mt-0.5 text-sm">{DEALERSHIP_INFO.workingHours}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-700/50 flex flex-col sm:flex-row gap-3">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md"><MessageCircle className="w-4 h-4 fill-white" /><span>WhatsApp Us</span></a>
              <a href={DEALERSHIP_INFO.googleMapLink} target="_blank" rel="noopener noreferrer" className="flex-1 py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-1.5 shadow-md border border-amber-400/30"><Navigation className="w-4 h-4" /><span>Get Live Directions</span><ExternalLink className="w-3.5 h-3.5" /></a>
            </div>
          </div>

          <div className="lg:col-span-7 glass-panel rounded-3xl overflow-hidden border border-slate-700/50 shadow-xl relative min-h-[380px] flex flex-col">
            <div className="absolute top-4 left-4 z-20 bg-slate-950/90 text-white backdrop-blur-md border border-amber-500/40 px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg">
              <MapPin className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>Opposite Hyundai Showroom, Humnabad Road, Kalaburagi</span>
            </div>
            <iframe src={DEALERSHIP_INFO.mapEmbedUrl} width="100%" height="100%" style={{ border: 0, minHeight: '400px' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="KM Car Deals Kalaburagi Location" className="w-full h-full flex-1 transition-all duration-500"></iframe>
            <div className="p-3 bg-slate-950 text-center">
              <a href={DEALERSHIP_INFO.googleMapLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-black text-amber-400 hover:text-amber-300 transition-colors">
                <span>Click here to open KM Car Deals location in Google Maps App</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
