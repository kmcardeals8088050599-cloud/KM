import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getResolvedPhotos, ShowroomPhoto } from '../../data/realImages';
import { MapPin, Phone, Eye, X, Camera } from 'lucide-react';

export const ShowroomGallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activePhoto, setActivePhoto] = useState<ShowroomPhoto | null>(null);
  const [photos, setPhotos] = useState<ShowroomPhoto[]>(getResolvedPhotos());

  useEffect(() => {
    const handleUpdate = () => {
      setPhotos(getResolvedPhotos());
    };
    window.addEventListener('km_photos_updated', handleUpdate);
    return () => window.removeEventListener('km_photos_updated', handleUpdate);
  }, []);

  const categories = ['All', 'Storefront', 'Showroom Interior', 'Leadership', 'Team'];

  const filteredPhotos = selectedCategory === 'All'
    ? photos
    : photos.filter(p => p.category === selectedCategory);

  return (
    <section className="py-20 sm:py-28 px-4 lg:px-8 relative z-10 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto space-y-3"
        >
          <div className="inline-flex items-center gap-2 section-eyebrow">
            <Camera className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>Showroom &amp; Leadership Showcase</span>
          </div>
          <h2 className="section-headline">
            Inside KM Car Deals, Kalaburagi
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Explore our real multi-brand showroom, our extensive inventory yard on Humnabad Road, and meet Managing Director <strong className="text-slate-900 font-medium">Md Nadeem Khan</strong>, Executive Director <strong className="text-slate-900 font-medium">Md Nawaz Khan</strong>, and our executive leadership team in Kalaburagi.
          </p>
        </motion.div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery — mobile: swipe showcase carousel of big photography. Desktop: elevated grid. */}
        <div className="swipe-row gap-5 -mx-4 px-4 md:hidden">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setActivePhoto(photo)}
              className="swipe-item w-[85vw] max-w-sm executive-card rounded-3xl overflow-hidden cursor-pointer relative"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent"></div>
                <div className="absolute top-3 left-3">
                  <span className="text-[11px] font-semibold text-slate-900 bg-white/90 backdrop-blur px-3 py-1 rounded-full">
                    {photo.category}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 space-y-1">
                  <h3 className="text-lg font-bold text-white text-shadow-hero line-clamp-1">{photo.title}</h3>
                  <div className="text-[11px] text-white/80 font-medium flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
                    <span className="truncate">{photo.locationTag}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <motion.div layout className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredPhotos.map((photo) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                key={photo.id}
                onClick={() => setActivePhoto(photo)}
                className="executive-card rounded-3xl overflow-hidden group cursor-pointer flex flex-col justify-between relative"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 flex items-center justify-center">
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Badge Overlay */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-900 bg-white/90 backdrop-blur px-3 py-1 rounded-full">
                      {photo.category}
                    </span>
                  </div>

                  {/* Quick View Hover Icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-gradient-gold text-slate-950 flex items-center justify-center shadow-premium scale-90 group-hover:scale-100 transition-transform">
                      <Eye className="w-4.5 h-4.5" strokeWidth={1.75} />
                    </div>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-[11px] text-white font-medium flex items-center gap-1.5 text-shadow-hero">
                    <MapPin className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
                    <span className="truncate">{photo.locationTag}</span>
                  </div>
                </div>

                <div className="p-5 space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                    {photo.title}
                  </h3>
                  <p className="text-[13px] text-slate-500 line-clamp-2">
                    {photo.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activePhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
            onClick={() => setActivePhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-premium relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActivePhoto(null)}
                className="absolute top-4 right-4 z-10 p-2.5 bg-white/90 backdrop-blur text-slate-900 hover:bg-white rounded-full transition-colors shadow-sm"
              >
                <X className="w-4 h-4" strokeWidth={1.75} />
              </button>

              <div className="relative aspect-[16/10] bg-slate-100">
                <img
                  src={activePhoto.imageUrl}
                  alt={activePhoto.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-6 space-y-3 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-900 bg-slate-100 px-3 py-1 rounded-full">
                    {activePhoto.category}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" strokeWidth={1.75} />
                    {activePhoto.locationTag}
                  </span>
                </div>

                <h3 className="text-2xl font-semibold text-slate-900">{activePhoto.title}</h3>
                <p className="text-[13px] text-slate-500 leading-relaxed">{activePhoto.description}</p>

                <div className="pt-4 flex justify-end">
                  <a
                    href="tel:+918123991847"
                    className="btn-accent-apple !text-[13px]"
                  >
                    <Phone className="w-3.5 h-3.5" strokeWidth={1.75} />
                    <span>Call Showroom</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
