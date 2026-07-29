import React, { useState, useEffect } from 'react';
import { DEALERSHIP_INFO } from '../../data/mockData';
import { ShieldCheck, Award, HeartHandshake, MapPin, Phone } from 'lucide-react';
import { ShowroomGallery } from '../home/ShowroomGallery';
import { getResolvedPhotos } from '../../data/realImages';
import { KmLogo } from '../common/KmLogo';

export const AboutView: React.FC = () => {
  const [photos, setPhotos] = useState(getResolvedPhotos());

  useEffect(() => {
    const handleUpdate = () => {
      setPhotos(getResolvedPhotos());
    };
    window.addEventListener('km_photos_updated', handleUpdate);
    return () => window.removeEventListener('km_photos_updated', handleUpdate);
  }, []);

  const storefrontPhoto = photos[0]?.imageUrl;
  const nadeemPortrait = photos[2]?.imageUrl;
  const nawazPortrait = photos[3]?.imageUrl;
  const executiveTeam = photos[4]?.imageUrl;

  return (
    <div className="py-20 px-4 lg:px-8 bg-slate-50 min-h-screen text-slate-900 pt-32">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Story Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="flex justify-center mb-2">
            <KmLogo variant="amber" size="xl" />
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black text-amber-900 uppercase tracking-widest bg-amber-100/90 px-4 py-1.5 rounded-full border border-amber-300 shadow-sm">
            About KM Car Deals Kalaburagi
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-serif">
            YOUR TRUSTED MULTI-BRAND PRE-OWNED CAR DESTINATION
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            Founded with a vision to eliminate opacity in the used-car market, <strong className="text-amber-700 font-extrabold">KM Car Deals</strong> brings enterprise-grade quality inspection, honest pricing, and instant ownership transfer to car lovers across Kalaburagi and Karnataka.
          </p>
        </div>

        {/* Storefront Visual & Core Pillars */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 relative rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-xl p-2 group">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900">
              <img
                src={storefrontPhoto}
                alt="KM Car Deals Showroom Storefront"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/storeFront.jpeg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>

              <div className="absolute bottom-4 left-4 right-4 p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 text-xs shadow-md">
                <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{DEALERSHIP_INFO.address}, Kalaburagi</span>
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif">
              THE KM CAR DEALS PROMISE
            </h2>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start gap-3 shadow-sm">
                <ShieldCheck className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
                <div>
                  <h3 className="text-sm font-black text-slate-900 font-serif">100% Non-Accidental Certificate</h3>
                  <p className="text-xs text-slate-600 font-medium mt-1">We refuse cars with structural damage, frame repairs, or flooded engines. Every car is certified safe.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start gap-3 shadow-sm">
                <Award className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
                <div>
                  <h3 className="text-sm font-black text-slate-900 font-serif">Verified Kilometer Meter Reading</h3>
                  <p className="text-xs text-slate-600 font-medium mt-1">No meter tampering or odometer manipulation. All readings match official service network logs.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start gap-3 shadow-sm">
                <HeartHandshake className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
                <div>
                  <h3 className="text-sm font-black text-slate-900 font-serif">Fair Commission &amp; Trade-In Value</h3>
                  <p className="text-xs text-slate-600 font-medium mt-1">Transparent evaluation without hidden deductions or last-minute price cuts.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Team Section */}
        <div className="space-y-8 border-t border-slate-200 pt-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-black uppercase text-amber-800 tracking-widest bg-amber-100/90 px-4 py-1.5 rounded-full border border-amber-300">
              Leadership &amp; Management
            </span>
            <h2 className="text-3xl font-black text-slate-900 font-serif">MEET OUR DIRECTORS &amp; TEAM</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md flex flex-col justify-between">
              <div className="rounded-2xl overflow-hidden bg-slate-900 mb-4">
                <img src={nadeemPortrait} alt="Md Nadeem Khan" className="w-full h-auto object-contain" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-1 rounded-md">Managing Director</span>
                <h3 className="text-lg font-black text-slate-900 font-serif mt-2">Md Nadeem Khan</h3>
                <p className="text-xs text-slate-600 mt-1 font-medium">Founder &amp; Managing Director leading operations, client relations, and vehicle certification at KM Car Deals.</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md flex flex-col justify-between">
              <div className="rounded-2xl overflow-hidden bg-slate-900 mb-4">
                <img src={nawazPortrait} alt="Md Nawaz Khan" className="w-full h-auto object-contain" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-1 rounded-md">Executive Director</span>
                <h3 className="text-lg font-black text-slate-900 font-serif mt-2">Md Nawaz Khan</h3>
                <p className="text-xs text-slate-600 mt-1 font-medium">Oversees sales evaluation, trade-in exchange appraisals, and customer experience management.</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md flex flex-col justify-between">
              <div className="rounded-2xl overflow-hidden bg-slate-900 mb-4">
                <img src={executiveTeam} alt="KM Car Deals Core Management Team" className="w-full h-auto object-contain" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-1 rounded-md">Core Team</span>
                <h3 className="text-lg font-black text-slate-900 font-serif mt-2">5-Member Executive Team</h3>
                <p className="text-xs text-slate-600 mt-1 font-medium">Dedicated professionals handling technical inspections, RTO documentation, and bank finance facilitation.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Inclusion */}
        <ShowroomGallery />
      </div>
    </div>
  );
};
