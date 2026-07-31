import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Car } from '../../types';
import { Calendar, Fuel, MessageCircle, ArrowRight, Eye, Images } from 'lucide-react';
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
  const navigate = useNavigate();
  const whatsappMsg = `Hi KM Car Deals, I am interested in inquiring about the ${car.year} ${car.title}. Please contact me with details.`;
  const whatsappUrl = createWhatsAppLink(DEALERSHIP_INFO.whatsappNumber, whatsappMsg);

  const handleCardClick = () => {
    if (onSelectCar) {
      onSelectCar(car);
    } else {
      navigate(`/car/${car.id}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -6, transition: { duration: 0.25, ease: 'easeOut' } }}
      className="group relative bg-white rounded-2xl flex flex-col overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-premium hover:border-amber-300/70 transition-all duration-300"
    >
      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden cursor-pointer" onClick={handleCardClick}>
        <motion.img
          src={car.images[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200'}
          alt={car.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.07 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          loading="lazy"
        />
        {/* Cinematic bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-80"></div>

        <div className="absolute top-3 left-3 flex items-center gap-2">
          {car.status === 'Available' ? (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white rounded-lg shadow-xs flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-200 animate-pulse"></span>
              Available
            </span>
          ) : car.status === 'Reserved' ? (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-amber-600 text-white rounded-lg shadow-xs">
              Reserved
            </span>
          ) : (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-600 text-white rounded-lg shadow-xs">
              Sold Out
            </span>
          )}
        </div>

        {/* Photo count badge */}
        {car.images.length > 1 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-slate-950/70 text-white text-[10px] font-bold rounded-lg border border-white/20 backdrop-blur-sm">
            <Images className="w-3 h-3 text-amber-400" />
            <span>{car.images.length} Photos</span>
          </div>
        )}

        <button
          onClick={e => {
            e.stopPropagation();
            onQuickView(car);
          }}
          className="absolute bottom-3 right-3 p-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl shadow-md border border-slate-200 transition-all opacity-90 group-hover:opacity-100 flex items-center gap-1.5 text-xs font-bold"
          title="Quick Inspect"
        >
          <Eye className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden sm:inline">Quick View</span>
        </button>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="uppercase tracking-wider font-extrabold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
              {car.brand}
            </span>
          </div>

          <h3
            onClick={handleCardClick}
            className="text-base font-extrabold text-slate-900 line-clamp-1 group-hover:text-amber-700 transition-colors cursor-pointer tracking-tight mt-1.5"
          >
            {car.title}
          </h3>

          <div className="grid grid-cols-3 gap-1.5 my-3 text-[11px]">
            <div className="bg-slate-50 p-1.5 rounded-lg flex flex-col items-center text-center border border-slate-200/80">
              <Calendar className="w-3 h-3 text-slate-600 mb-0.5" />
              <span className="text-[10px] font-bold text-slate-800">{car.year}</span>
            </div>
            <div className="bg-slate-50 p-1.5 rounded-lg flex flex-col items-center text-center border border-slate-200/80">
              <span className="text-[9px] font-bold text-slate-500 uppercase leading-tight">Trans</span>
              <span className="text-[10px] font-bold text-slate-800">{car.transmission}</span>
            </div>
            <div className="bg-slate-50 p-1.5 rounded-lg flex flex-col items-center text-center border border-slate-200/80">
              <span className="text-[9px] font-bold text-slate-500 uppercase leading-tight">Body</span>
              <span className="text-[10px] font-bold text-slate-800">{car.bodyType}</span>
            </div>
            <div className="bg-slate-50 p-1.5 rounded-lg flex flex-col items-center text-center border border-slate-200/80">
              <Fuel className="w-3 h-3 text-slate-600 mb-0.5" />
              <span className="text-[10px] font-bold text-slate-800">{car.fuelType}</span>
            </div>
            <div className="bg-slate-50 p-1.5 rounded-lg flex flex-col items-center text-center border border-slate-200/80 col-span-2">
              <span className="text-[9px] font-bold text-slate-500 uppercase leading-tight">RTO</span>
              <span className="text-[10px] font-bold text-slate-800">{car.specs.rto?.split(' ')[0] || '—'}</span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 space-y-3">
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleCardClick}
              className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
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
                  ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {isInCompare ? '✓ Added to Compare' : 'Add to Compare'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
