import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, ArrowRight, Phone } from 'lucide-react';

interface HeroSectionProps {
  onSearch: (query: string, brand: string, bodyType: string) => void;
  setActiveTab?: (tab: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedBodyType, setSelectedBodyType] = useState('All');
  const navigate = useNavigate();

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch('', selectedBrand, selectedBodyType);
    navigate('/inventory');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="bg-white">
      <div className="apple-container-narrow pt-24 sm:pt-32 pb-14 sm:pb-20 text-center">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="section-eyebrow mb-3"
        >
          Kalaburagi · Multi-brand showroom
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.06 }}
          className="hero-headline"
        >
          Pre-owned cars,
          <br className="hidden sm:block" /> held to a higher standard.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="hero-subline mt-5 max-w-lg mx-auto"
        >
          Every vehicle passes a 150-point inspection with a non-accidental guarantee and verified odometer reading.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <button
            onClick={() => {
              navigate('/inventory');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="btn-accent-apple"
          >
            Explore Inventory
            <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
          </button>
          <button
            onClick={() => {
              navigate('/exchange');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="btn-secondary-apple"
          >
            Exchange your car
          </button>
        </motion.div>

        <motion.a
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.26 }}
          href="tel:+918123991847"
          className="mt-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Phone className="w-3.5 h-3.5" strokeWidth={1.75} />
          +91 81239 91847
        </motion.a>
      </div>

      {/* Apple-style configurator bar: plain, bordered, no card chrome */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.32 }}
        className="border-y border-slate-200 bg-slate-50"
      >
        <form
          onSubmit={handleQuickSearch}
          className="apple-container-narrow py-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-6"
        >
          <span className="hidden sm:flex items-center gap-2 text-sm text-slate-500 shrink-0">
            <Search className="w-4 h-4" strokeWidth={1.75} />
            Find a car
          </span>

          <select
            value={selectedBrand}
            onChange={e => setSelectedBrand(e.target.value)}
            className="select-plain bg-transparent border-0 sm:border-l sm:border-slate-200 sm:pl-6 text-slate-900 text-sm focus:outline-none"
          >
            <option value="All">All Brands</option>
            <option value="Maruti Suzuki">Maruti Suzuki</option>
            <option value="Hyundai">Hyundai</option>
            <option value="Tata">Tata</option>
            <option value="Mahindra">Mahindra</option>
            <option value="Toyota">Toyota</option>
            <option value="Kia">Kia</option>
            <option value="Honda">Honda</option>
            <option value="Renault">Renault</option>
            <option value="Nissan">Nissan</option>
            <option value="Skoda">Skoda</option>
            <option value="Volkswagen">Volkswagen</option>
            <option value="MG">MG</option>
            <option value="Ford">Ford</option>
            <option value="Jeep">Jeep</option>
            <option value="Mercedes-Benz">Mercedes-Benz</option>
            <option value="BMW">BMW</option>
            <option value="Audi">Audi</option>
            <option value="Volvo">Volvo</option>
            <option value="Lexus">Lexus</option>
            <option value="Land Rover">Land Rover</option>
            <option value="Porsche">Porsche</option>
            <option value="Citroen">Citroen</option>
          </select>

          <select
            value={selectedBodyType}
            onChange={e => setSelectedBodyType(e.target.value)}
            className="select-plain bg-transparent border-0 sm:border-l sm:border-slate-200 sm:pl-6 text-slate-900 text-sm focus:outline-none"
          >
            <option value="All">All Body Types</option>
            <option value="Hatchback">Hatchback</option>
            <option value="Sedan">Sedan</option>
            <option value="SUV">SUV</option>
            <option value="MUV">MUV</option>
            <option value="Luxury">Luxury</option>
            <option value="Coupe">Coupe</option>
            <option value="Convertible">Convertible</option>
            <option value="Pickup">Pickup / Truck</option>
          </select>

          <button type="submit" className="btn-primary-apple btn-sm sm:ml-auto">
            Search
          </button>
        </form>
      </motion.div>
    </section>
  );
};
