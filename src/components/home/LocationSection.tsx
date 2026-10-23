import React from 'react';
import { MapPin, Phone, Clock, MessageCircle, Navigation, ExternalLink } from 'lucide-react';
import { DEALERSHIP_INFO } from '../../data/mockData';
import { createWhatsAppLink } from '../../lib/api';

export const LocationSection: React.FC = () => {
  const whatsappUrl = createWhatsAppLink(
    DEALERSHIP_INFO.whatsappNumber,
    "Hi KM Car Deals, I'd like to visit your showroom opposite Hyundai Showroom in Kalaburagi."
  );

  return (
    <section className="section-pad relative z-10 bg-mesh-light overflow-hidden">
      <div className="apple-container space-y-14 relative z-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <p className="section-eyebrow">Verified Showroom Location</p>
          <h2 className="section-headline">
            Visit KM Car Deals showroom
          </h2>
          <p className="text-sm text-slate-500">
            Conveniently located on Humnabad Road, Kapnoor, opposite Hyundai Showroom in Kalaburagi.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Address Details Panel */}
          <div className="lg:col-span-5 executive-card rounded-3xl p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-5">
                <h3 className="text-2xl font-semibold text-slate-900 tracking-tight">{DEALERSHIP_INFO.name}</h3>
                <p className="text-[13px] text-amber-600 font-medium mt-1">{DEALERSHIP_INFO.tagline}</p>
              </div>

              <div className="space-y-5 text-xs">
                <div className="flex items-start gap-3.5 text-slate-600">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                  <div>
                    <span className="text-slate-400 font-medium block text-[11px]">Exact Address</span>
                    <p className="font-medium text-slate-900 leading-relaxed mt-0.5 text-sm">
                      {DEALERSHIP_INFO.address}, {DEALERSHIP_INFO.city}, {DEALERSHIP_INFO.state} - {DEALERSHIP_INFO.pincode}
                    </p>
                    <p className="text-amber-600 font-medium mt-1 text-xs">Landmark: {DEALERSHIP_INFO.landmark}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 text-slate-600">
                  <Phone className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                  <div>
                    <span className="text-slate-400 font-medium block text-[11px]">Direct Phone Lines</span>
                    <div className="space-y-1 font-medium text-slate-900 mt-0.5 text-sm">
                      {DEALERSHIP_INFO.phones.map((p, idx) => (
                        <a key={idx} href={`tel:${p}`} className="block hover:text-amber-600 transition-colors">
                          {p}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 text-slate-600">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                  <div>
                    <span className="text-slate-400 font-medium block text-[11px]">Working Hours</span>
                    <p className="font-medium text-slate-900 mt-0.5 text-sm">{DEALERSHIP_INFO.workingHours}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-h-[44px] bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[0.9rem] rounded-full flex items-center justify-center gap-2 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
              >
                <MessageCircle className="w-4 h-4" strokeWidth={1.75} />
                <span>WhatsApp Us</span>
              </a>

              <a
                href={DEALERSHIP_INFO.googleMapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-accent-apple flex-1"
              >
                <Navigation className="w-4 h-4" strokeWidth={1.75} />
                <span>Get Live Directions</span>
                <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.75} />
              </a>
            </div>
          </div>

          {/* Live Map Preview with Google Map Navigation Badge */}
          <div className="lg:col-span-7 executive-card rounded-3xl overflow-hidden relative min-h-[380px] flex flex-col">
            <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur text-slate-900 px-3.5 py-2 rounded-full text-[12px] font-medium flex items-center gap-2 shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-amber-600" strokeWidth={1.75} />
              <span>Opposite Hyundai Showroom, Humnabad Road, Kalaburagi</span>
            </div>

            <iframe
              src={DEALERSHIP_INFO.mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '400px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="KM Car Deals Kalaburagi Location"
              className="w-full h-full flex-1 transition-all duration-500"
            ></iframe>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <a
                href={DEALERSHIP_INFO.googleMapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[12px] font-medium text-amber-600 hover:text-amber-700 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 rounded"
              >
                <span>Click here to open KM Car Deals location in Google Maps App</span>
                <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.75} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
