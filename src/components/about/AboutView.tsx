import React, { useState, useEffect } from 'react';
import { DEALERSHIP_INFO } from '../../data/mockData';
import { ShieldCheck, Award, HeartHandshake, MapPin } from 'lucide-react';
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
    <div className="section-pad pt-32 bg-white min-h-screen text-slate-900">
      <div className="apple-container space-y-20">
        {/* Story Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="flex justify-center mb-2">
            <KmLogo variant="amber" size="xl" />
          </div>
          <p className="section-eyebrow">About KM Car Deals Kalaburagi</p>
          <h1 className="section-headline text-slate-900">
            Your trusted multi-brand pre-owned car destination
          </h1>
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
            Founded with a vision to eliminate opacity in the used-car market, <strong className="text-slate-700 font-semibold">KM Car Deals</strong> brings enterprise-grade quality inspection, honest pricing, and instant ownership transfer to car lovers across Kalaburagi and Karnataka.
          </p>
        </div>

        {/* Storefront Visual & Core Pillars */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 relative rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xl p-2">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100">
              <img
                src={storefrontPhoto}
                alt="KM Car Deals Showroom Storefront"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/storeFront.jpeg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent"></div>

              <div className="absolute bottom-4 left-4 right-4 p-4 glass-dark rounded-2xl text-sm shadow-lg">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0" strokeWidth={1.75} />
                  <span>{DEALERSHIP_INFO.address}, Kalaburagi</span>
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              The KM Car Deals promise
            </h2>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">100% non-accidental certificate</h3>
                  <p className="text-sm text-slate-500 mt-1">We refuse cars with structural damage, frame repairs, or flooded engines. Every car is certified safe.</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                <Award className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Verified kilometer meter reading</h3>
                  <p className="text-sm text-slate-500 mt-1">No meter tampering or odometer manipulation. All readings match official service network logs.</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                <HeartHandshake className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Fair commission &amp; trade-in value</h3>
                  <p className="text-sm text-slate-500 mt-1">Transparent evaluation without hidden deductions or last-minute price cuts.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Team Section */}
        <div className="space-y-10 border-t border-slate-200 pt-16">
          <div className="text-center space-y-3">
            <p className="section-eyebrow">Leadership &amp; Management</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Meet our directors &amp; team</h2>
          </div>

          {/* Mobile: swipe carousel. Desktop: grid */}
          <div className="swipe-row gap-5 px-1 -mx-1 sm:hidden">
            {[
              { img: nadeemPortrait, tag: 'Managing Director', name: 'Md Nadeem Khan', quote: '"Transparency isn\'t a policy here — it\'s the whole business."', desc: 'Founder & Managing Director leading operations, client relations, and vehicle certification at KM Car Deals.' },
              { img: nawazPortrait, tag: 'Executive Director', name: 'Md Nawaz Khan', quote: '"Every trade-in gets the same honest eye we\'d want for our own car."', desc: 'Oversees sales evaluation, trade-in exchange appraisals, and customer experience management.' },
              { img: executiveTeam, tag: 'Core Team', name: '5-Member executive team', quote: '"150 checkpoints, zero shortcuts."', desc: 'Dedicated professionals handling technical inspections, RTO documentation, and bank finance facilitation.' },
            ].map((person, i) => (
              <div key={i} className="swipe-item w-[82%] executive-card rounded-3xl p-5 flex flex-col justify-between">
                <div className="rounded-2xl overflow-hidden bg-slate-100 mb-4 aspect-[4/5]">
                  <img src={person.img} alt={person.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wide text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">{person.tag}</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-2">{person.name}</h3>
                  <p className="text-sm font-semibold text-slate-700 mt-2 leading-snug">{person.quote}</p>
                  <p className="text-sm text-slate-500 mt-2">{person.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden sm:grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="executive-card rounded-3xl p-6 flex flex-col justify-between">
              <div className="rounded-2xl overflow-hidden bg-slate-100 mb-4 aspect-[4/5]">
                <img src={nadeemPortrait} alt="Md Nadeem Khan" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wide text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">Managing Director</span>
                <h3 className="text-xl font-bold text-slate-900 mt-3">Md Nadeem Khan</h3>
                <p className="text-sm font-semibold text-slate-700 mt-2 leading-snug">&ldquo;Transparency isn&rsquo;t a policy here — it&rsquo;s the whole business.&rdquo;</p>
                <p className="text-sm text-slate-500 mt-2">Founder &amp; Managing Director leading operations, client relations, and vehicle certification at KM Car Deals.</p>
              </div>
            </div>

            <div className="executive-card rounded-3xl p-6 flex flex-col justify-between">
              <div className="rounded-2xl overflow-hidden bg-slate-100 mb-4 aspect-[4/5]">
                <img src={nawazPortrait} alt="Md Nawaz Khan" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wide text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">Executive Director</span>
                <h3 className="text-xl font-bold text-slate-900 mt-3">Md Nawaz Khan</h3>
                <p className="text-sm font-semibold text-slate-700 mt-2 leading-snug">&ldquo;Every trade-in gets the same honest eye we&rsquo;d want for our own car.&rdquo;</p>
                <p className="text-sm text-slate-500 mt-2">Oversees sales evaluation, trade-in exchange appraisals, and customer experience management.</p>
              </div>
            </div>

            <div className="executive-card rounded-3xl p-6 flex flex-col justify-between">
              <div className="rounded-2xl overflow-hidden bg-slate-100 mb-4 aspect-[4/5]">
                <img src={executiveTeam} alt="KM Car Deals Core Management Team" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wide text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">Core Team</span>
                <h3 className="text-xl font-bold text-slate-900 mt-3">5-Member executive team</h3>
                <p className="text-sm font-semibold text-slate-700 mt-2 leading-snug">&ldquo;150 checkpoints, zero shortcuts.&rdquo;</p>
                <p className="text-sm text-slate-500 mt-2">Dedicated professionals handling technical inspections, RTO documentation, and bank finance facilitation.</p>
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
