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
    <section className="relative min-h-[92vh] flex flex-col justify-end overflow-hidden bg-slate-950">
      {/* Full-bleed moody backdrop — heavily darkened so it reads as texture, not a busy photo */}
      <div className="absolute inset-0">
        <img
          src="/indoorGarage.jpeg"
          alt=""
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-transparent to-transparent h-40" />
      </div>

      <div className="relative z-10 max-w-[1400px] w-full mx-auto px-6 lg:px-10 pt-40 pb-16">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="section-eyebrow-light mb-5"
        >
          Kalaburagi · Est. multi-brand showroom
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08 }}
          className="text-white font-bold tracking-tight leading-[0.98] text-[clamp(2.4rem,7vw,5rem)] max-w-3xl"
        >
          Pre-owned cars,
          <br />
          held to a higher standard.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.16 }}
          className="mt-6 text-slate-300 text-base max-w-xl leading-relaxed"
        >
          Every vehicle passes a 150-point inspection with a non-accidental guarantee and verified odometer reading —
          sale, purchase, exchange, or commission brokerage.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.24 }}
          className="mt-9 flex flex-wrap items-center gap-4"
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
            className="btn-ghost-light"
          >
            Exchange your car
          </button>
          <a href="tel:+918123991847" className="hidden sm:flex items-center gap-2 text-slate-300 text-sm font-medium ml-2 hover:text-white transition-colors">
            <Phone className="w-4 h-4" strokeWidth={1.75} />
            +91 81239 91847
          </a>
        </motion.div>
      </div>

      {/* Minimal single-row search bar — not a competing boxed widget */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.32 }}
        className="relative z-10 border-t border-white/10 bg-white/[0.04] backdrop-blur-xl"
      >
        <form
          onSubmit={handleQuickSearch}
          className="max-w-[1400px] mx-auto px-6 lg:px-10 py-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        >
          <span className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-400 shrink-0">
            <Search className="w-4 h-4" strokeWidth={1.75} />
            Find a car
          </span>

          <select
            value={selectedBrand}
            onChange={e => setSelectedBrand(e.target.value)}
            className="bg-transparent border-0 sm:border-l sm:border-white/10 sm:pl-4 text-white text-sm font-medium focus:outline-none [&>option]:text-slate-900"
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
            className="bg-transparent border-0 sm:border-l sm:border-white/10 sm:pl-4 text-white text-sm font-medium focus:outline-none [&>option]:text-slate-900"
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

          <button type="submit" className="btn-primary-apple sm:ml-auto !py-2.5 !px-6 !text-[13px]">
            Search
          </button>
        </form>
      </motion.div>
    </section>
  );
};
