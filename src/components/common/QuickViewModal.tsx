import React, { useState } from 'react';
import { Car } from '../../types';
import { X, ShieldCheck, Calendar, Gauge, Fuel, SlidersHorizontal, Check, MessageCircle, Phone, ArrowRight } from 'lucide-react';
import { createWhatsAppLink } from '../../lib/api';
import { DEALERSHIP_INFO } from '../../data/mockData';

interface QuickViewModalProps {
  car: Car | null;
  onClose: () => void;
  onFullDetails: (car: Car) => void;
  onExchangeSelect: (car: Car) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  car,
  onClose,
  onFullDetails,
  onExchangeSelect
}) => {
  if (!car) return null;

  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const whatsappMsg = `Hi KM Car Deals, I am interested in inquiring about the ${car.year} ${car.title} listed at ₹ ${car.price.toFixed(2)} Lakhs. Please connect with me.`;
  const whatsappUrl = createWhatsAppLink(DEALERSHIP_INFO.whatsappNumber, whatsappMsg);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 text-slate-700 hover:text-white hover:bg-red-600 transition-all border border-slate-300"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Gallery Preview Column */}
        <div className="w-full md:w-1/2 bg-slate-100 p-4 flex flex-col justify-between">
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 border border-slate-300">
            <img
              src={car.images[activeImgIndex] || car.images[0]}
              alt={car.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 text-xs font-bold uppercase bg-white/90 text-amber-800 border border-amber-300 rounded-lg backdrop-blur-md flex items-center gap-1 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> 150+ Inspection
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {car.images.length > 1 && (
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
              {car.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImgIndex(idx)}
                  className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    activeImgIndex === idx ? 'border-red-600 scale-105 shadow-xs' : 'border-slate-300 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details Column */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto bg-white">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-600">{car.brand}</span>
              <h2 className="text-xl font-black text-slate-900">{car.title}</h2>
              <p className="text-xs text-slate-500 font-medium mt-1">{car.variant || car.model} • {car.location}</p>
            </div>

            {/* Price Banner */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Special Price</span>
                <div className="text-2xl font-black text-slate-900">₹ {car.price.toFixed(2)} Lakh</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase font-bold">RTO Passed</span>
                <p className="text-xs font-bold text-amber-700">{car.specs.rto}</p>
              </div>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Year</span>
                <span className="font-bold text-slate-900">{car.year}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Kilometers</span>
                <span className="font-bold text-slate-900">{car.kilometers.toLocaleString('en-IN')} km</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Fuel</span>
                <span className="font-bold text-slate-900">{car.fuelType}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Transmission</span>
                <span className="font-bold text-slate-900">{car.transmission}</span>
              </div>
            </div>

            {/* Highlights */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase mb-2">Key Highlights</h4>
              <div className="space-y-1 text-xs text-slate-700 font-medium">
                {car.features.slice(0, 4).map((feat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-slate-200 space-y-2 mt-4">
            <div className="grid grid-cols-2 gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Inquire WhatsApp</span>
              </a>

              <button
                onClick={() => {
                  onClose();
                  onExchangeSelect(car);
                }}
                className="py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-xs"
              >
                <span>Exchange For This</span>
              </button>
            </div>

            <button
              onClick={() => {
                onClose();
                onFullDetails(car);
              }}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors shadow-xs"
            >
              <span>Full Specifications & Gallery</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
