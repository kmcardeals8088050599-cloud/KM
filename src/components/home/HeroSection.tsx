import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, ShieldCheck, Star, RefreshCw, ArrowRight, MapPin, Sparkles, Phone } from 'lucide-react';
import { getResolvedPhotos } from '../../data/realImages';
import { KmLogo } from '../common/KmLogo';

interface HeroSectionProps {
  onSearch: (query: string, brand: string, bodyType: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
  const [searchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedBodyType, setSelectedBodyType] = useState('All');
  const [photos, setPhotos] = useState(getResolvedPhotos());
  const navigate = useNavigate();

  useEffect(() => {
    const handleUpdate = () => {
      setPhotos(getResolvedPhotos());
    };
    window.addEventListener('km_photos_updated', handleUpdate);
    return () => window.removeEventListener('km_photos_updated', handleUpdate);
  }, []);

  const storefrontImage = photos[0]?.imageUrl;

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery, selectedBrand, selectedBodyType);
    navigate('/inventory');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <section
      className="relative min-h-[85vh] flex items-center justify-center pt-32 pb-16 px-4 lg:px-8 overflow-hidden bg-slate-900"
    >
      {/* Storefront Yard Background */}
      <div className="absolute inset-0">
        <img
          src={storefrontImage}
          alt="KM Car Deals Storefront Yard"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-slate-900/40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/40"></div>
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Column: Executive Branding */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-7 space-y-6 text-left"
        >
          {/* Badges */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold shadow-xs border border-white/20 backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>100% Non-Accidental Certificate</span>
            </div>

            <a
              href="tel:+918123991847"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/90 text-white font-bold text-xs shadow-xs hover:bg-emerald-500 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 fill-white" />
              <span>+91 81239 91847</span>
            </a>

            <a
              href="tel:+918088050599"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white font-bold text-xs shadow-xs border border-white/20 hover:bg-white/20 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-slate-300" />
              <span>+91 80880 50599</span>
            </a>

            <div className="inline-flex items-center gap-1 text-white font-bold text-xs bg-white/10 px-3 py-1 rounded-full border border-white/20 backdrop-blur-md">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>5.0 Rated Showroom</span>
            </div>
          </motion.div>

          {/* Main Title Styled directly with KM Logo */}
          <motion.div variants={itemVariants} className="space-y-3">
            <div>
              <KmLogo variant="amber" size="xl" />
            </div>

            <div className="inline-flex items-center gap-2 text-xs font-extrabold text-amber-300 uppercase tracking-widest bg-white/10 px-3.5 py-1 rounded-lg border border-white/20 backdrop-blur-md">
              <span>SALE</span>
              <span className="text-white/40">•</span>
              <span>PURCHASE</span>
              <span className="text-white/40">•</span>
              <span>EXCHANGE</span>
            </div>
          </motion.div>

          {/* Banner Pill */}
          <motion.div variants={itemVariants}>
            <span className="inline-block bg-amber-500 text-white font-extrabold text-xs uppercase tracking-wider px-4 py-2 rounded-full shadow-md">
              BUSINESS ON COMMISSION BASIS
            </span>
          </motion.div>

          {/* Description */}
          <motion.p variants={itemVariants} className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed max-w-2xl">
            Visit our multi-brand pre-owned hub opposite Hyundai Showroom in Kalaburagi. Managed by <strong className="text-white font-extrabold">Md Nadeem Khan</strong>. Every car undergoes a stringent 150-point technical check with guaranteed non-accidental status &amp; verified meter reading.
          </motion.p>

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              onClick={() => {
                navigate('/inventory');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-7 py-3.5 bg-amber-500 hover:bg-amber-400 text-white font-extrabold text-xs rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Inventory</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              onClick={() => {
                navigate('/exchange');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/30 font-extrabold text-xs rounded-xl transition-all flex items-center gap-2 backdrop-blur-md"
            >
              <RefreshCw className="w-4 h-4 text-amber-400" />
              <span>Exchange Vehicle</span>
            </motion.button>
          </motion.div>

          {/* Location Footer Bar */}
          <motion.div variants={itemVariants} className="p-3 bg-white/10 rounded-xl border border-white/20 text-xs text-white font-bold flex items-center gap-2 backdrop-blur-md">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Opposite Hyundai Showroom, Humnabad Road, Kapnoor, Kalaburagi - 585104.</span>
          </motion.div>
        </motion.div>

        {/* Right Column: Quick Vehicle Finder */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-5"
        >
          <div className="bg-white/95 backdrop-blur-md border border-white/40 rounded-2xl p-5 shadow-2xl">
            <form onSubmit={handleQuickSearch} className="space-y-3">
              <div className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Quick Vehicle Finder</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-1 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Brand</label>
                  <select
                    value={selectedBrand}
                    onChange={e => setSelectedBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
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
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Body Type</label>
                  <select
                    value={selectedBodyType}
                    onChange={e => setSelectedBodyType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
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
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Search className="w-4 h-4 text-amber-200" />
                    <span>Search Vehicles</span>
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px]">
              <a
                href="tel:+918123991847"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Phone className="w-3.5 h-3.5 fill-white" />
                Call Now
              </a>
              <span className="w-2"></span>
              <a
                href="https://wa.me/918123991847"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
