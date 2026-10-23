import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Car } from '../../types';
import { Calendar, Fuel, Gauge, MessageCircle, ArrowRight, Eye, Images, Car as CarIcon } from 'lucide-react';
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
      className="group relative executive-card rounded-3xl flex flex-col overflow-hidden"
    >
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden cursor-pointer" onClick={handleCardClick}>
        {car.images[0] ? (
          <motion.img
            src={car.images[0]}
            alt={car.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
            <div className="text-center">
              <CarIcon className="w-8 h-8 text-slate-300 mx-auto" strokeWidth={1.5} />
              <p className="text-[11px] font-medium text-slate-400 mt-2">KM Car Deals</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Photos on request · Kalaburagi</p>
            </div>
          </div>
        )}

        <div className="absolute top-3 left-3 flex items-center gap-2">
          {car.status === 'Available' ? (
            <span className="px-2.5 py-1 text-[11px] font-medium bg-white/90 backdrop-blur text-slate-900 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Available
            </span>
          ) : car.status === 'Reserved' ? (
            <span className="px-2.5 py-1 text-[11px] font-medium bg-white/90 backdrop-blur text-amber-700 rounded-full">
              Reserved
            </span>
          ) : (
            <span className="px-2.5 py-1 text-[11px] font-medium bg-white/90 backdrop-blur text-slate-500 rounded-full">
              Sold Out
            </span>
          )}
        </div>

        {/* Photo count badge */}
        {car.images.length > 1 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/55 text-white text-[11px] font-medium rounded-full backdrop-blur-sm">
            <Images className="w-3 h-3" strokeWidth={1.75} />
            <span>{car.images.length}</span>
          </div>
        )}

        <button
          onClick={e => {
            e.stopPropagation();
            onQuickView(car);
          }}
          className="absolute bottom-3 right-3 p-2.5 bg-white/90 backdrop-blur hover:bg-white text-slate-700 rounded-full shadow-sm transition-all duration-300 opacity-0 group-hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:opacity-100"
          title="Quick Inspect"
        >
          <Eye className="w-4 h-4" strokeWidth={1.75} />
        </button>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
        <div>
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
            {car.brand}
          </span>

          <h3
            onClick={handleCardClick}
            className="text-lg font-semibold text-slate-900 line-clamp-1 cursor-pointer tracking-tight mt-0.5"
          >
            {car.title}
          </h3>

          <div className="grid grid-cols-3 gap-2 mt-4 text-[11px]">
            <div className="flex flex-col items-center text-center gap-1 py-2 rounded-xl bg-slate-50">
              <Calendar className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.75} />
              <span className="font-medium text-slate-700">{car.year}</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1 py-2 rounded-xl bg-slate-50">
              <span className="text-slate-400">Trans</span>
              <span className="font-medium text-slate-700">{car.transmission}</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1 py-2 rounded-xl bg-slate-50">
              <span className="text-slate-400">Body</span>
              <span className="font-medium text-slate-700">{car.bodyType}</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1 py-2 rounded-xl bg-slate-50">
              <Fuel className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.75} />
              <span className="font-medium text-slate-700">{car.fuelType}</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1 py-2 rounded-xl bg-slate-50">
              <Gauge className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.75} />
              <span className="font-medium text-slate-700">
                {typeof car.odometerKm === 'number' ? `${car.odometerKm.toLocaleString('en-IN')} km` : '—'}
              </span>
            </div>
            <div className="flex flex-col items-center text-center gap-1 py-2 rounded-xl bg-slate-50">
              <span className="text-slate-400">RTO</span>
              <span className="font-medium text-slate-700">{(car.specs?.rto || car.location || '').split(' ')[0] || '—'}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCardClick}
              className="btn-accent-apple btn-sm w-full"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[36px] py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[0.8125rem] rounded-full transition-colors duration-300 flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
              onClick={e => e.stopPropagation()}
            >
              <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>WhatsApp</span>
            </a>
          </div>

          {onAddToCompare && (
            <button
              onClick={e => { e.stopPropagation(); onAddToCompare(car); }}
              className={`w-full py-2 text-[11px] font-medium rounded-full flex items-center justify-center gap-1.5 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 ${
                isInCompare
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900'
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
