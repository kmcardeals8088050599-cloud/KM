import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Car } from '../../types';
import { ShieldCheck, Calendar, Gauge, Fuel, MessageCircle, ArrowRight, Eye, BarChart2 } from 'lucide-react';
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
  const whatsappMsg = `Hi KM Car Deals, I am interested in inquiring about the ${car.year} ${car.title} listed at ₹ ${car.price.toFixed(2)} Lakhs. Please contact me with details.`;
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
      className="group relative bg-white rounded-2xl flex flex-col overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-slate-400 transition-shadow duration-300"
    >
      {/* Top Image Container */}
      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden cursor-pointer" onClick={handleCardClick}>
        <motion.img
          src={car.images[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200'}
          alt={car.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          loading="lazy"
        />

        {/* Status & Certification Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {car.status === 'Available' ? (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-600/90 text-white rounded-lg backdrop-blur-md flex items-center gap-1 shadow-xs border border-emerald-400/30">
              <span className="w-2 h-2 rounded-full bg-emerald-200 animate-pulse"></span>
              Available
            </span>
          ) : car.status === 'Reserved' ? (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-amber-600/90 text-white rounded-lg backdrop-blur-md">
              Reserved
            </span>
          ) : (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-900/90 text-slate-200 rounded-lg backdrop-blur-md">
              Sold Out
            </span>
          )}

          {car.isCertified && (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-950/85 text-amber-300 border border-slate-800 rounded-lg backdrop-blur-md flex items-center gap-1 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              150+ Certified
            </span>
          )}
        </div>

        {/* Quick View Button */}
        <button
          onClick={e => {
            e.stopPropagation();
            onQuickView(car);
          }}
          className="absolute bottom-3 right-3 p-2 bg-slate-950/80 hover:bg-slate-900 text-slate-100 rounded-xl backdrop-blur-md border border-slate-800 transition-all opacity-90 group-hover:opacity-100 flex items-center gap-1.5 text-xs font-bold shadow-sm"
          title="Quick Inspect"
        >
          <Eye className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Quick View</span>
        </button>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Brand & Year Header */}
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="uppercase tracking-wider font-extrabold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
              {car.brand}
            </span>
            <span className="font-bold text-slate-500 text-[11px]">{car.ownerCount}</span>
          </div>

          {/* Car Title */}
          <h3
            onClick={handleCardClick}
            className="text-base font-extrabold text-slate-900 line-clamp-1 group-hover:text-amber-800 transition-colors cursor-pointer font-serif tracking-tight mt-1.5"
          >
            {car.title}
          </h3>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-2 my-3 text-[11px] text-slate-700">
            <div className="bg-slate-50 p-2 rounded-xl flex flex-col items-center text-center border border-slate-200/80 shadow-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-700 mb-0.5" />
              <span className="font-bold text-slate-900">{car.year}</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl flex flex-col items-center text-center border border-slate-200/80 shadow-xs">
              <Gauge className="w-3.5 h-3.5 text-slate-700 mb-0.5" />
              <span className="font-bold text-slate-900">{car.kilometers.toLocaleString('en-IN')} km</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl flex flex-col items-center text-center border border-slate-200/80 shadow-xs">
              <Fuel className="w-3.5 h-3.5 text-slate-700 mb-0.5" />
              <span className="font-bold text-slate-900">{car.fuelType}</span>
            </div>
          </div>
        </div>

        {/* Pricing & Call-to-Actions */}
        <div className="pt-3 border-t border-slate-200 space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Showroom Price</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-slate-900 tracking-tight font-serif">
                  ₹ {car.price.toFixed(2)} Lakh
                </span>
                {car.originalPrice && car.originalPrice > car.price && (
                  <span className="text-xs text-slate-400 line-through font-medium">
                    ₹ {car.originalPrice.toFixed(2)} L
                  </span>
                )}
              </div>
            </div>

            <span className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
              EMI ~ ₹ {Math.round((car.price * 100000 * 0.018)).toLocaleString('en-IN')}/mo
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleCardClick}
              className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm"
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
              <BarChart2 className="w-3 h-3" />
              {isInCompare ? '✓ Added to Compare' : 'Add to Compare'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
