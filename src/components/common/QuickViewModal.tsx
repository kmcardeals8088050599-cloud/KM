import React, { useState } from 'react';
import { Car } from '../../types';
import { X, MessageCircle, ArrowRight } from 'lucide-react';
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
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  if (!car) return null;

  const whatsappMsg = `Hi KM Car Deals, I am interested in inquiring about the ${car.year} ${car.title}. Please connect with me.`;
  const whatsappUrl = createWhatsAppLink(DEALERSHIP_INFO.whatsappNumber, whatsappMsg);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/60 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 text-slate-700 hover:text-white hover:bg-red-600 transition-all border border-slate-300"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-full md:w-1/2 bg-slate-100 p-4 flex flex-col justify-between">
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 border border-slate-300 group">
            <img
              src={car.images[activeImgIndex] || car.images[0]}
              alt={car.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none"></div>
            {car.images.length > 1 && (
              <div className="absolute top-3 right-3 px-2 py-1 bg-slate-950/70 text-white text-[10px] font-bold rounded-full border border-white/20 backdrop-blur-sm">
                {activeImgIndex + 1} / {car.images.length}
              </div>
            )}
          </div>

          {car.images.length > 1 && (
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
              {car.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImgIndex(idx)}
                  className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    activeImgIndex === idx ? 'border-amber-500 scale-105 shadow-md' : 'border-slate-300 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto bg-white">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">{car.brand}</span>
              <h2 className="text-xl font-black text-slate-900">{car.title}</h2>
              <p className="text-xs text-slate-500 font-medium mt-1">{car.model}</p>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              {[
                { label: 'Model', value: car.model },
                { label: 'Year', value: car.year },
                { label: 'Transmission', value: car.transmission },
                { label: 'Body Type', value: car.bodyType },
                { label: 'Fuel', value: car.fuelType },
                { label: 'RTO', value: car.specs.rto?.split(' ')[0] || '—' },
              ].map(d => (
                <div key={d.label} className="bg-slate-50 p-1.5 rounded-lg border border-slate-200 text-center">
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">{d.label}</span>
                  <span className="font-bold text-slate-900 text-[11px]">{d.value}</span>
                </div>
              ))}
            </div>
          </div>

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
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors shadow-xs"
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
