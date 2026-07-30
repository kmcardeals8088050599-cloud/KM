import React from 'react';
import { Car } from '../../types';
import { Calendar, Fuel, MessageCircle, ArrowRight, Eye, GitCompare } from 'lucide-react';
import { createWhatsAppLink } from '../../lib/api';
import { DEALERSHIP_INFO } from '../../data/mockData';

interface CarCardProps {
  car: Car;
  onSelectCar?: (car: Car) => void;
  onQuickView: (car: Car) => void;
  onExchangeSelect?: (car: Car) => void;
  onAddToCompare?: (car: Car) => void;
  isInCompare?: boolean;
}

export const CarCard: React.FC<CarCardProps> = ({
  car,
  onSelectCar,
  onQuickView,
  onAddToCompare,
  isInCompare,
}) => {
  const whatsappMsg = `Hi KM Car Deals, I am interested in inquiring about the ${car.year} ${car.title}. Please contact me with details.`;
  const whatsappUrl = createWhatsAppLink(DEALERSHIP_INFO.whatsappNumber, whatsappMsg);

  const handleCardClick = () => {
    if (onSelectCar) onSelectCar(car);
  };

  return (
    <div className="group relative glass-card rounded-2xl flex flex-col overflow-hidden">
      <div className="relative aspect-[16/10] overflow-hidden cursor-pointer" onClick={handleCardClick}>
        <img
          src={car.images[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200'}
          alt={car.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />

        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-slate-900/60 to-transparent pointer-events-none" />

        <div className="absolute top-3 left-3 flex items-center gap-2">
          {car.status === 'Available' ? (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-600/90 text-white rounded-lg backdrop-blur flex items-center gap-1 border border-emerald-400/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-pulse-glow"></span>
              Available
            </span>
          ) : car.status === 'Reserved' ? (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-amber-600/90 text-white rounded-lg backdrop-blur border border-amber-400/30">
              Reserved
            </span>
          ) : (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-900/90 text-slate-300 rounded-lg backdrop-blur border border-slate-700">
              Sold
            </span>
          )}
        </div>

        <button
          onClick={e => { e.stopPropagation(); onQuickView(car); }}
          className="absolute bottom-3 right-3 p-2 bg-slate-950/80 hover:bg-slate-900 text-slate-100 rounded-xl backdrop-blur border border-slate-700 transition-all opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-xs font-bold"
        >
          <Eye className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Quick View</span>
        </button>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="uppercase tracking-wider font-extrabold text-amber-400 bg-amber-950/40 border border-amber-500/20 px-2 py-0.5 rounded-md">
              {car.brand}
            </span>
          </div>

          <h3
            onClick={handleCardClick}
            className="text-base font-extrabold text-white line-clamp-1 group-hover:text-amber-300 transition-colors cursor-pointer tracking-tight mt-1.5"
          >
            {car.title}
          </h3>

          <div className="grid grid-cols-3 gap-1.5 my-3 text-[11px]">
            <div className="bg-slate-800/60 p-1.5 rounded-lg flex flex-col items-center text-center border border-slate-700/50">
              <Calendar className="w-3 h-3 text-slate-400 mb-0.5" />
              <span className="text-[10px] font-bold text-white">{car.year}</span>
            </div>
            <div className="bg-slate-800/60 p-1.5 rounded-lg flex flex-col items-center text-center border border-slate-700/50">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Trans</span>
              <span className="text-[10px] font-bold text-white">{car.transmission}</span>
            </div>
            <div className="bg-slate-800/60 p-1.5 rounded-lg flex flex-col items-center text-center border border-slate-700/50">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Body</span>
              <span className="text-[10px] font-bold text-white">{car.bodyType}</span>
            </div>
            <div className="bg-slate-800/60 p-1.5 rounded-lg flex flex-col items-center text-center border border-slate-700/50">
              <Fuel className="w-3 h-3 text-slate-400 mb-0.5" />
              <span className="text-[10px] font-bold text-white">{car.fuelType}</span>
            </div>
            <div className="bg-slate-800/60 p-1.5 rounded-lg flex flex-col items-center text-center border border-slate-700/50">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Owner</span>
              <span className="text-[10px] font-bold text-white">{car.ownerCount}</span>
            </div>
            <div className="bg-slate-800/60 p-1.5 rounded-lg flex flex-col items-center text-center border border-slate-700/50">
              <span className="text-[9px] font-bold text-slate-400 uppercase">RTO</span>
              <span className="text-[10px] font-bold text-white">{car.specs.rto?.split(' ')[0] || '—'}</span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-700/50 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCardClick}
              className="w-full py-2.5 px-3 bg-slate-700/80 hover:bg-slate-600 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
              onClick={e => e.stopPropagation()}
            >
              <MessageCircle className="w-3.5 h-3.5 fill-white text-white" />
              <span>WhatsApp</span>
            </a>
          </div>

          {onAddToCompare && (
            <button
              onClick={e => { e.stopPropagation(); onAddToCompare(car); }}
              className={`w-full py-2 text-[10px] font-extrabold rounded-xl flex items-center justify-center gap-1.5 border transition-all ${
                isInCompare
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-slate-800/40 text-slate-400 border-slate-700/50 hover:bg-slate-700/50 hover:text-slate-200'
              }`}
            >
              <GitCompare className="w-3 h-3" />
              {isInCompare ? 'Added to Compare' : 'Add to Compare'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
