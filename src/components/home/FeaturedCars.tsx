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

export const FeaturedCars: React.FC<FeaturedCarsProps> = ({ cars, onSelectCar, onQuickView, onViewAll, onExchangeSelect }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const navigate = useNavigate();

  const categories = ['All', 'SUV', 'Sedan', 'Hatchback', 'Luxury'];
  const featuredList = cars.filter(c => activeCategory === 'All' ? c.status === 'Available' : c.bodyType.toLowerCase() === activeCategory.toLowerCase());

  const handleViewAll = () => { if (onViewAll) onViewAll(); else { navigate('/inventory'); window.scrollTo({ top: 0, behavior: 'smooth' }); } };

  return (
    <section className="py-20 px-4 lg:px-8 relative z-10">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-700/50 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-amber-400 uppercase tracking-widest bg-amber-950/40 px-3.5 py-1 rounded-full border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Handpicked Collection
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">FEATURED PRE-OWNED INVENTORY</h2>
            <p className="text-xs text-slate-400 font-medium">Rigorously inspected 150-point certified cars ready for immediate delivery in Kalaburagi</p>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-5 py-2.5 text-xs font-extrabold rounded-xl transition-all shrink-0 ${activeCategory === cat ? 'bg-amber-600 text-white shadow-md' : 'glass-panel text-slate-300 hover:text-white hover:border-amber-500/30'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {featuredList.slice(0, 6).map(car => (
              <CarCard key={car.id} car={car} onSelectCar={onSelectCar} onQuickView={onQuickView} onExchangeSelect={onExchangeSelect} />
            ))}
          </AnimatePresence>
        </motion.div>

        <div className="text-center pt-6">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleViewAll} className="inline-flex items-center gap-2 px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg border border-amber-400/30">
            <span>View Full Inventory ({cars.length} Vehicles)</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </section>
  );
};
