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
  car, onClose, onFullDetails, onExchangeSelect
}) => {
  if (!car) return null;

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const whatsappMsg = `Hi KM Car Deals, I am interested in inquiring about the ${car.year} ${car.title}. Please connect with me.`;
  const whatsappUrl = createWhatsAppLink(DEALERSHIP_INFO.whatsappNumber, whatsappMsg);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose}>
      <div className="relative w-full max-w-4xl glass-panel rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-800/80 text-slate-400 hover:text-white hover:bg-red-600/80 transition-all border border-slate-700">
          <X className="w-5 h-5" />
        </button>

        <div className="w-full md:w-1/2 bg-slate-900/50 p-4 flex flex-col justify-between">
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
            <img src={car.images[activeImgIndex] || car.images[0]} alt={car.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          </div>
          {car.images.length > 1 && (
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
              {car.images.map((img, idx) => (
                <button key={idx} onClick={() => setActiveImgIndex(idx)} className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${activeImgIndex === idx ? 'border-amber-500 scale-105' : 'border-slate-700 opacity-50 hover:opacity-100'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">{car.brand}</span>
              <h2 className="text-xl font-black text-white">{car.title}</h2>
              <p className="text-xs text-slate-400 font-medium mt-1">{car.model}</p>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              {[
                { label: 'Model', value: car.model },
                { label: 'Year', value: car.year },
                { label: 'Transmission', value: car.transmission },
                { label: 'Body Type', value: car.bodyType },
                { label: 'Fuel', value: car.fuelType },
                { label: 'Owner', value: car.ownerCount },
              ].map(d => (
                <div key={d.label} className="bg-slate-800/60 p-1.5 rounded-lg border border-slate-700/50 text-center">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">{d.label}</span>
                  <span className="font-bold text-white text-[11px]">{d.value}</span>
                </div>
              ))}
            </div>

            <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-between text-xs">
              <span className="text-[10px] text-slate-400 uppercase font-bold">RTO</span>
              <span className="text-xs font-bold text-amber-400">{car.specs.rto?.split(' ')[0] || '—'}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700/50 space-y-2 mt-4">
            <div className="grid grid-cols-2 gap-2">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5">
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Inquire WhatsApp</span>
              </a>
              <button onClick={() => { onClose(); onExchangeSelect(car); }} className="py-2.5 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs rounded-xl flex items-center justify-center gap-1">
                <span>Exchange For This</span>
              </button>
            </div>
            <button onClick={() => { onClose(); onFullDetails(car); }} className="w-full py-2.5 bg-slate-700/80 hover:bg-slate-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors">
              <span>Full Specifications & Gallery</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
