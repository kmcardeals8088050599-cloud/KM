import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'motion/react';
import { Search, ShieldCheck, Star, RefreshCw, ArrowRight, MapPin, Sparkles, Phone } from 'lucide-react';
import { getResolvedPhotos } from '../../data/realImages';
import { KmLogo } from '../common/KmLogo';

interface HeroSectionProps { onSearch: (query: string, brand: string, bodyType: string) => void; }

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
  const [searchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedBodyType, setSelectedBodyType] = useState('All');
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [photos, setPhotos] = useState(getResolvedPhotos());
  const navigate = useNavigate();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 120, damping: 18 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 18 });
  const rotateX = useTransform(springY, [-0.5, 0.5], ['8deg', '-8deg']);
  const rotateY = useTransform(springX, [-0.5, 0.5], ['-8deg', '8deg']);

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct); mouseY.set(yPct);
  };

  const handleCardMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  useEffect(() => {
    const handleUpdate = () => setPhotos(getResolvedPhotos());
    window.addEventListener('km_photos_updated', handleUpdate);
    return () => window.removeEventListener('km_photos_updated', handleUpdate);
  }, []);

  const heroPhotos = [
    { title: 'Storefront Yard & Inventory', tag: 'Opposite Hyundai Showroom', img: photos[0]?.imageUrl, desc: 'SALE • PURCHASE • EXCHANGE • COMMISSION BASIS' },
    { title: 'Indoor Luxury Lounge', tag: 'Jaguar XF & Luxury Lineup', img: photos[1]?.imageUrl, desc: 'Transparent Pricing & Complete RC Document Check' },
    { title: 'Md Nadeem Khan (Managing Director)', tag: 'Managing Director', img: photos[2]?.imageUrl, desc: 'Managing Director of KM Car Deals Kalaburagi' },
    { title: 'KM Car Deals Executive Team', tag: '5-Member Core Management', img: photos[4]?.imageUrl, desc: '5-Member Core Management Team' }
  ];

  const handleQuickSearch = (e: React.FormEvent) => { e.preventDefault(); onSearch(searchQuery, selectedBrand, selectedBodyType); navigate('/inventory'); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 24, filter: 'blur(4px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center pt-32 pb-16 px-4 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="lg:col-span-7 space-y-6 text-left">
          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold border border-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>100% Non-Accidental Certificate</span>
            </div>
            <a href="tel:+918123991847" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 font-bold text-xs hover:bg-emerald-950/60 transition-colors">
              <Phone className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              <span>+91 81239 91847</span>
            </a>
            <a href="tel:+918088050599" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-panel text-slate-300 font-bold text-xs hover:text-white transition-colors">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>+91 80880 50599</span>
            </a>
            <div className="inline-flex items-center gap-1 text-slate-300 font-bold text-xs glass-panel px-3 py-1 rounded-full">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>5.0 Rated Showroom</span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-3">
            <div><KmLogo variant="amber" size="xl" /></div>
            <div className="inline-flex items-center gap-2 text-xs font-extrabold text-amber-400 uppercase tracking-widest bg-amber-950/40 px-3.5 py-1 rounded-lg border border-amber-500/20">
              <span>SALE</span><span className="text-amber-600">•</span><span>PURCHASE</span><span className="text-amber-600">•</span><span>EXCHANGE</span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <span className="inline-block bg-amber-600 text-white font-extrabold text-xs uppercase tracking-wider px-4 py-2 rounded-full shadow-md border border-amber-400/30">BUSINESS ON COMMISSION BASIS</span>
          </motion.div>

          <motion.p variants={itemVariants} className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-2xl">
            Visit our multi-brand pre-owned hub opposite Hyundai Showroom in Kalaburagi. Managed by <strong className="text-white font-extrabold">Md Nadeem Khan</strong>. Every car undergoes a stringent 150-point technical check with guaranteed non-accidental status & verified meter reading.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3 pt-2">
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => { navigate('/inventory'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="px-7 py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-md hover:shadow-xl flex items-center gap-2 cursor-pointer">
              <span>Explore Inventory</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => { navigate('/exchange'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="px-6 py-3.5 glass-panel hover:bg-slate-700/60 text-slate-200 border border-slate-700/50 font-extrabold text-xs rounded-xl transition-all flex items-center gap-2 shadow-xs hover:shadow-md cursor-pointer">
              <RefreshCw className="w-4 h-4 text-amber-400" />
              <span>Exchange Vehicle</span>
            </motion.button>
          </motion.div>

          <motion.div variants={itemVariants} className="p-3 glass-panel rounded-xl text-xs text-slate-300 font-bold flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Opposite Hyundai Showroom, Humnabad Road, Kapnoor, Kalaburagi - 585104.</span>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }} onMouseMove={handleCardMouseMove} onMouseLeave={handleCardMouseLeave} style={{ perspective: 1000 }} className="lg:col-span-5 relative space-y-4 cursor-pointer">
          <motion.div style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }} className="relative rounded-2xl p-2 glass-panel border border-slate-700/50 transition-shadow hover:shadow-2xl">
            <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-900 group">
              <AnimatePresence mode="wait">
                <motion.img key={activePhotoIndex} src={heroPhotos[activePhotoIndex].img} alt={heroPhotos[activePhotoIndex].title} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.4 }} referrerPolicy="no-referrer" className="w-full h-full object-cover object-center" />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
              <div className="absolute top-3 left-3 bg-slate-950/90 border border-slate-800 text-white px-2.5 py-1 rounded-lg shadow-md backdrop-blur flex items-center gap-2"><KmLogo variant="white" iconOnly size="xs" /><span className="text-[10px] font-black uppercase tracking-wide">KM CAR DEALS</span></div>
              <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl glass-panel backdrop-blur-md border border-slate-700/50 shadow-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">{heroPhotos[activePhotoIndex].tag}</span>
                  <h4 className="text-xs font-black text-white mt-0.5">{heroPhotos[activePhotoIndex].title}</h4>
                </div>
                <a href="tel:+918123991847" className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg flex items-center gap-1 shrink-0"><Phone className="w-3.5 h-3.5" /><span>Call Us</span></a>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-4 gap-2">
            {heroPhotos.map((photo, idx) => (
              <button key={idx} onClick={() => setActivePhotoIndex(idx)} className={`p-2 rounded-xl text-left transition-all border ${activePhotoIndex === idx ? 'bg-amber-600 text-white border-amber-500 shadow-sm font-bold' : 'glass-panel text-slate-300 border-slate-700/50 hover:border-amber-500/30'}`}>
                <span className="text-[9px] uppercase font-bold tracking-wider block text-slate-500">0{idx + 1}</span>
                <span className="text-[10px] font-extrabold truncate block">{photo.title}</span>
              </button>
            ))}
          </div>

          <div className="glass-panel border border-slate-700/50 rounded-2xl p-4 shadow-md">
            <form onSubmit={handleQuickSearch} className="space-y-3">
              <div className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Quick Vehicle Finder</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <select value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)} className="w-full glass-select rounded-xl p-2.5 font-bold focus:outline-none">
                    <option value="All">All Brands</option>
                    <option value="Maruti Suzuki">Maruti Suzuki</option><option value="Hyundai">Hyundai</option><option value="Tata">Tata</option><option value="Mahindra">Mahindra</option><option value="Toyota">Toyota</option><option value="Kia">Kia</option><option value="Honda">Honda</option><option value="Renault">Renault</option><option value="Nissan">Nissan</option><option value="Skoda">Skoda</option><option value="Volkswagen">Volkswagen</option><option value="MG">MG</option><option value="Ford">Ford</option><option value="Jeep">Jeep</option><option value="Mercedes-Benz">Mercedes-Benz</option><option value="BMW">BMW</option><option value="Audi">Audi</option><option value="Volvo">Volvo</option><option value="Lexus">Lexus</option><option value="Land Rover">Land Rover</option><option value="Porsche">Porsche</option><option value="Citroen">Citroen</option>
                  </select>
                </div>
                <div>
                  <select value={selectedBodyType} onChange={e => setSelectedBodyType(e.target.value)} className="w-full glass-select rounded-xl p-2.5 font-bold focus:outline-none">
                    <option value="All">All Body Types</option>
                    <option value="Hatchback">Hatchback</option><option value="Sedan">Sedan</option><option value="SUV">SUV</option><option value="MUV">MUV</option><option value="Luxury">Luxury</option>
                  </select>
                </div>
                <div>
                  <button type="submit" className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm">
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
