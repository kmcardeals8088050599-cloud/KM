import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getResolvedPhotos, ShowroomPhoto } from '../../data/realImages';
import { MapPin, Phone, Eye, X, Camera } from 'lucide-react';

export const ShowroomGallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activePhoto, setActivePhoto] = useState<ShowroomPhoto | null>(null);
  const [photos, setPhotos] = useState<ShowroomPhoto[]>(getResolvedPhotos());

  useEffect(() => {
    const handleUpdate = () => setPhotos(getResolvedPhotos());
    window.addEventListener('km_photos_updated', handleUpdate);
    return () => window.removeEventListener('km_photos_updated', handleUpdate);
  }, []);

  const categories = ['All', 'Storefront', 'Showroom Interior', 'Leadership', 'Team'];
  const filteredPhotos = selectedCategory === 'All' ? photos : photos.filter(p => p.category === selectedCategory);

  return (
    <section className="py-20 px-4 lg:px-8 border-t border-slate-800/50 relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-10">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-950/40 px-4 py-1.5 rounded-full border border-amber-500/20">
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>Showroom & Leadership Showcase</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">INSIDE KM CAR DEALS KALABURAGI</h2>
          <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-2xl mx-auto">
            Explore our real multi-brand showroom, our extensive inventory yard on Humnabad Road, and meet Managing Director <strong className="text-white font-extrabold">Md Nadeem Khan</strong>, Executive Director <strong className="text-white font-extrabold">Md Nawaz Khan</strong>, and our executive leadership team in Kalaburagi.
          </p>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${selectedCategory === cat ? 'bg-amber-600 text-white border-amber-500 shadow-md' : 'glass-panel text-slate-300 border-slate-700/50 hover:text-white hover:border-amber-500/30'}`}>
              {cat}
            </button>
          ))}
        </div>

        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredPhotos.map(photo => (
              <motion.div layout initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} whileHover={{ y: -6 }} transition={{ duration: 0.3 }} key={photo.id} onClick={() => setActivePhoto(photo)} className="glass-panel rounded-3xl overflow-hidden group cursor-pointer border border-slate-700/50 hover:border-amber-500/30 transition-all duration-300 hover:shadow-lg flex flex-col justify-between relative">
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-900 flex items-center justify-center">
                  <img src={photo.imageUrl} alt={photo.title} referrerPolicy="no-referrer" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20"></div>
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="text-[10px] font-bold text-white bg-slate-900/80 px-3 py-1 rounded-full border border-slate-700">{photo.category}</span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg border border-slate-700 scale-90 group-hover:scale-100 transition-transform">
                      <Eye className="w-5 h-5 text-amber-400" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-xs text-slate-200 font-bold flex items-center gap-1.5 drop-shadow-md">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{photo.locationTag}</span>
                  </div>
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="text-base font-black text-white line-clamp-1 group-hover:text-amber-300 transition-colors">{photo.title}</h3>
                  <p className="text-xs text-slate-400 font-medium line-clamp-2">{photo.description}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {activePhoto && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4" onClick={() => setActivePhoto(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-panel rounded-3xl max-w-4xl w-full border border-slate-700/50 overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
              <button onClick={() => setActivePhoto(null)} className="absolute top-4 right-4 z-10 p-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-full transition-colors shadow-lg"><X className="w-5 h-5" /></button>
              <div className="relative aspect-[16/10] bg-slate-900">
                <img src={activePhoto.imageUrl} alt={activePhoto.title} referrerPolicy="no-referrer" className="w-full h-full object-contain" />
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-amber-400 bg-amber-950/40 px-3 py-1 rounded-full border border-amber-500/20">{activePhoto.category}</span>
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-500" />{activePhoto.locationTag}</span>
                </div>
                <h3 className="text-2xl font-black text-white">{activePhoto.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">{activePhoto.description}</p>
                <div className="pt-4 border-t border-slate-700/50 flex justify-end">
                  <a href="tel:+918123991847" className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /><span>Call Showroom</span></a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
