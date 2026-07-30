import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Car } from '../../types';
import { CarCard } from '../common/CarCard';
import { Sparkles, ArrowRight } from 'lucide-react';

interface FeaturedCarsProps {
  cars: Car[];
  onSelectCar: (car: Car) => void;
  onQuickView: (car: Car) => void;
  onViewAll?: () => void;
  onExchangeSelect: (car: Car) => void;
}

export const FeaturedCars: React.FC<FeaturedCarsProps> = ({
  cars,
  onSelectCar,
  onQuickView,
  onViewAll,
  onExchangeSelect
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const navigate = useNavigate();

  const categories = ['All', 'SUV', 'Sedan', 'Hatchback', 'Luxury'];

  const featuredList = cars.filter(c => {
    if (activeCategory === 'All') return c.status === 'Available';
    return c.bodyType.toLowerCase() === activeCategory.toLowerCase();
  });

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      navigate('/inventory');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-20 px-4 lg:px-8 relative z-10 bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Section Title & Category Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-slate-800 uppercase tracking-widest bg-slate-200 px-3.5 py-1 rounded-full border border-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Handpicked Collection
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-serif">
              FEATURED PRE-OWNED INVENTORY
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Rigorously inspected 150-point certified cars ready for immediate delivery in Kalaburagi
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 text-xs font-extrabold rounded-xl transition-all duration-300 shrink-0 ${
                  activeCategory === cat
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:text-slate-950 border border-slate-200 hover:border-slate-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Cars Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {featuredList.slice(0, 6).map(car => (
              <CarCard
                key={car.id}
                car={car}
                onSelectCar={onSelectCar}
                onQuickView={onQuickView}
                onExchangeSelect={onExchangeSelect}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Bottom CTA to view full inventory */}
        <div className="text-center pt-6">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleViewAll}
            className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg border border-slate-800"
          >
            <span>View Full Inventory ({cars.length} Vehicles)</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </motion.button>
        </div>
      </div>
    </section>
  );
};
