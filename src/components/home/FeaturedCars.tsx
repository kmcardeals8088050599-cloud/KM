import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Car } from '../../types';
import { CarCard } from '../common/CarCard';
import { ArrowRight } from 'lucide-react';

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
    <section id="featured-cars" className="py-20 sm:py-28 px-4 lg:px-8 relative z-10 bg-white">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Title & Category Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-3">
            <p className="section-eyebrow">Handpicked Collection</p>
            <h2 className="section-headline">
              Featured pre-owned inventory
            </h2>
            <p className="text-sm text-slate-500 max-w-md">
              Rigorously inspected, 150-point certified cars ready for immediate delivery in Kalaburagi.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 text-[13px] font-semibold rounded-full transition-all duration-300 shrink-0 ${
                  activeCategory === cat
                    ? 'bg-gradient-gold text-slate-950 shadow-[0_8px_20px_-6px_rgba(176,141,74,0.5)]'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Cars Grid — desktop: elevated 3-col grid. Mobile: bespoke swipe carousel, ~85vw cards with a peek of the next. */}
        <motion.div layout className="swipe-row gap-4 -mx-4 px-4 md:hidden">
          <AnimatePresence mode="popLayout">
            {featuredList.slice(0, 6).map(car => (
              <div key={car.id} className="swipe-item w-[85vw] max-w-sm">
                <CarCard
                  car={car}
                  onSelectCar={onSelectCar}
                  onQuickView={onQuickView}
                  onExchangeSelect={onExchangeSelect}
                />
              </div>
            ))}
          </AnimatePresence>
        </motion.div>

        <motion.div
          layout
          className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-8"
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
        <div className="text-center pt-4">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleViewAll}
            className="btn-primary-apple"
          >
            <span>View Full Inventory ({cars.length} Vehicles)</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
          </motion.button>
        </div>
      </div>
    </section>
  );
};
