import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, ShieldCheck, Star, RefreshCw, ArrowRight, MapPin, Sparkles, Phone, ChevronDown } from 'lucide-react';
import { getResolvedPhotos } from '../../data/realImages';
import { KmLogo } from '../common/KmLogo';

interface HeroSectionProps {
  onSearch: (query: string, brand: string, bodyType: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
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
  const isCustomStorefront = storefrontImage?.startsWith('data:') ?? false;

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch('', selectedBrand, selectedBodyType);
    navigate('/inventory');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <section className="relative min-h-[100vh] lg:min-h-[92vh] flex items-center justify-center pt-28 lg:pt-32 pb-28 lg:pb-20 px-4 lg:px-8 overflow-hidden bg-gradient-obsidian">
      {/* Storefront Yard Background - Ken Burns cinematic zoom */}
      <div className="absolute inset-0">
        <picture>
          {/* Portrait crop on mobile so the scene fits the tall phone viewport */}
          {!isCustomStorefront && (
            <source media="(max-width: 767px)" srcSet="/storeFront-portrait.jpeg" />
          )}
          <img
            src={storefrontImage}
            alt="KM Car Deals storefront yard in Kalaburagi"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center animate-kenburns opacity-90"
          />
        </picture>
        {/* Dramatic directional scrim: deep obsidian on the left (text zone), fading toward the image — desktop */}
        <div className="absolute inset-0 hidden lg:block bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-slate-900/30"></div>
        {/* Mobile: strong top/bottom scrims so copy and the finder card stay legible over the photo */}
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-slate-950/90 via-slate-950/50 to-transparent lg:hidden"></div>
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent lg:hidden"></div>
        {/* Subtle bottom fade into next section */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
        {/* Vignette for cinematic depth */}
        <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_50%,rgba(2,6,23,0.5)_100%)]"></div>
        {/* Noise for texture, luxury print feel */}
        <div className="absolute inset-0 bg-noise opacity-40 mix-blend-overlay"></div>
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-10 items-center">
        {/* Left Column: Executive Branding */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-7 space-y-5 lg:space-y-6 text-left"
        >
          {/* Badges — desktop: inline pills; mobile: swipeable row so they don't wrap into clutter */}
          <motion.div variants={itemVariants} className="swipe-row gap-2 -mx-4 px-4 lg:mx-0 lg:px-0 lg:flex-wrap lg:overflow-visible">
            <div className="swipe-item inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-white text-[12px] font-medium backdrop-blur-md border border-white/10 whitespace-nowrap">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" strokeWidth={1.75} />
              <span>100% Non-Accidental Certificate</span>
            </div>

            <a
              href="tel:+918123991847"
              className="swipe-item inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/95 text-white font-medium text-[12px] hover:bg-emerald-500 transition-colors whitespace-nowrap"
            >
              <Phone className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>+91 81239 91847</span>
            </a>

            <a
              href="tel:+918088050599"
              className="swipe-item inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 text-white font-medium text-[12px] backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors whitespace-nowrap"
            >
              <Phone className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>+91 80880 50599</span>
            </a>

            <div className="swipe-item inline-flex items-center gap-1.5 text-white font-medium text-[12px] bg-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-md border border-white/10 whitespace-nowrap">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>5.0 Rated Showroom</span>
            </div>
          </motion.div>

          {/* Main Title */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div>
              <KmLogo variant="amber" size="xl" />
            </div>

            <h1 className="section-headline-light text-shadow-hero !text-[clamp(2.1rem,8vw,4.5rem)] lg:!text-[clamp(2.5rem,6vw,4.5rem)]">
              Kalaburagi's most trusted <span className="text-gradient-amber">pre-owned</span> showroom
            </h1>

            <div className="inline-flex items-center gap-2 text-[12px] font-bold text-amber-200 uppercase tracking-widest bg-white/10 px-3.5 py-1 rounded-full backdrop-blur-md border border-white/10 text-shadow-hero">
              <span>Sale</span>
              <span className="text-white/40">•</span>
              <span>Purchase</span>
              <span className="text-white/40">•</span>
              <span>Exchange</span>
            </div>
          </motion.div>

          {/* Banner Pill */}
          <motion.div variants={itemVariants}>
            <span className="inline-block bg-gradient-gold text-slate-950 font-bold text-[12px] px-4 py-2 rounded-full shadow-[0_8px_20px_-6px_rgba(176,141,74,0.5)]">
              Business on commission basis
            </span>
          </motion.div>

          {/* Description */}
          <motion.p variants={itemVariants} className="text-sm sm:text-[15px] text-slate-200 leading-relaxed max-w-2xl text-shadow-hero">
            Visit our multi-brand pre-owned hub opposite Hyundai Showroom in Kalaburagi. Managed by <strong className="text-white font-semibold">Md Nadeem Khan</strong>. Every car undergoes a stringent 150-point technical check with guaranteed non-accidental status &amp; verified meter reading.
          </motion.p>

          {/* Action Buttons — hidden on mobile where the sticky CTA bar takes over */}
          <motion.div variants={itemVariants} className="hidden lg:flex flex-wrap items-center gap-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              onClick={() => {
                navigate('/inventory');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="btn-accent-apple cursor-pointer"
            >
              <span>Explore Inventory</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              onClick={() => {
                navigate('/exchange');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="btn-ghost-light"
            >
              <RefreshCw className="w-4 h-4" strokeWidth={1.75} />
              <span>Exchange Vehicle</span>
            </motion.button>
          </motion.div>

          {/* Location Footer Bar */}
          <motion.div variants={itemVariants} className="inline-flex p-3 bg-white/10 rounded-2xl text-[12px] text-white font-medium items-center gap-2 backdrop-blur-md border border-white/10">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" strokeWidth={1.75} />
            <span>Opposite Hyundai Showroom, Humnabad Road, Kapnoor, Kalaburagi - 585104.</span>
          </motion.div>
        </motion.div>

        {/* Right Column: Quick Vehicle Finder */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-5"
        >
          <div className="glass-dark rounded-3xl p-6 shadow-premium border border-white/15">
            <form onSubmit={handleQuickSearch} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-gradient-gold flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-slate-950" strokeWidth={1.75} />
                  </span>
                  <span>Quick Vehicle Finder</span>
                </div>
                <span className="text-[10px] font-semibold text-amber-200 bg-amber-500/15 border border-amber-400/30 px-2.5 py-1 rounded-full whitespace-nowrap">
                  150-Point Inspected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Brand</label>
                  <select
                    value={selectedBrand}
                    onChange={e => setSelectedBrand(e.target.value)}
                    className="w-full bg-white/10 border border-white/15 rounded-xl p-2.5 text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-shadow [&>option]:text-slate-900"
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
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Body Type</label>
                  <select
                    value={selectedBodyType}
                    onChange={e => setSelectedBodyType(e.target.value)}
                    className="w-full bg-white/10 border border-white/15 rounded-xl p-2.5 text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-shadow [&>option]:text-slate-900"
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
              </div>

              <div>
                <button
                  type="submit"
                  className="btn-accent-apple w-full"
                >
                  <Search className="w-4 h-4" strokeWidth={1.75} />
                  <span>Search Vehicles</span>
                </button>
              </div>
            </form>

            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-[13px]">
              <a
                href="tel:+918123991847"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-full flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" strokeWidth={1.75} />
                Call Now
              </a>
              <span className="w-2 shrink-0"></span>
              <a
                href="https://wa.me/918123991847"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 bg-white/10 border border-white/15 hover:bg-white/20 text-white font-medium rounded-full flex items-center justify-center gap-1.5 transition-colors"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator — desktop only, mobile uses the sticky CTA bar instead */}
      <motion.a
        href="#featured-cars"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="hidden lg:flex absolute bottom-5 left-1/2 -translate-x-1/2 z-10 text-slate-300 flex-col items-center gap-1 group"
      >
        <span className="text-[10px] font-medium uppercase tracking-widest group-hover:text-white transition-colors">Scroll</span>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-4 h-4 group-hover:text-white" strokeWidth={1.75} />
        </motion.span>
      </motion.a>

      {/* Mobile bespoke sticky CTA bar — persistent Call / WhatsApp / Explore */}
      <div className="mobile-sticky-cta lg:hidden flex items-center gap-2">
        <a
          href="tel:+918123991847"
          className="flex-1 py-3 bg-emerald-600 text-white font-semibold text-[13px] rounded-full flex items-center justify-center gap-1.5"
        >
          <Phone className="w-4 h-4" strokeWidth={1.75} />
          Call
        </a>
        <a
          href="https://wa.me/918123991847"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-3 bg-slate-900 text-white font-semibold text-[13px] rounded-full flex items-center justify-center gap-1.5"
        >
          WhatsApp
        </a>
        <button
          onClick={() => {
            navigate('/inventory');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex-1 btn-accent-apple !py-3 !px-3 !text-[13px]"
        >
          Explore
        </button>
      </div>
    </section>
  );
};
