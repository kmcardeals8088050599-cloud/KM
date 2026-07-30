import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Car } from '../../types';
import {
  ArrowLeft,
  Share2,
  RefreshCw,
  Phone,
  MessageCircle,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { createWhatsAppLink, submitLeadApi } from '../../lib/api';
import { DEALERSHIP_INFO } from '../../data/mockData';
import { CarCard } from '../common/CarCard';

interface CarDetailsViewProps {
  car: Car;
  onBack: () => void;
  onSelectCar: (car: Car) => void;
  onOpenExchangeModal: (car: Car) => void;
  relatedCars: Car[];
}

export const CarDetailsView: React.FC<CarDetailsViewProps> = ({
  car,
  onBack,
  onOpenExchangeModal,
  relatedCars,
  onSelectCar
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const whatsappMsg = `Hi KM Car Deals, I am interested in inquiring about the ${car.year} ${car.title} at Kalaburagi showroom. Phone: ${buyerPhone || 'Not specified'}`;
  const whatsappUrl = createWhatsAppLink(DEALERSHIP_INFO.whatsappNumber, whatsappMsg);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || !buyerPhone) return;
    setSubmitting(true);
    await submitLeadApi({
      name: buyerName,
      phone: buyerPhone,
      carId: car.id,
      carTitle: car.title,
      type: 'Inquiry',
      message: `Hi, I'm interested in the ${car.year} ${car.title}.`
    });
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: car.title, text: `Check out this ${car.title} at KM Car Deals Kalaburagi!`, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="py-28 px-4 lg:px-8 min-h-screen"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-700/50">
          <button onClick={onBack} className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors glass-panel px-4 py-2 rounded-xl w-fit">
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Back to Inventory</span>
          </button>
          <div className="flex items-center gap-3">
            <button onClick={handleShare} className="px-3.5 py-2 glass-panel hover:bg-slate-700/60 text-slate-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors">
              <Share2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Share</span>
            </button>
            <button onClick={() => onOpenExchangeModal(car)} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md">
              <RefreshCw className="w-3.5 h-3.5 text-white" />
              <span>Exchange Your Car</span>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-amber-400 bg-amber-950/40 px-2.5 py-0.5 rounded border border-amber-500/20 uppercase tracking-wider">{car.brand}</span>
            <span className="text-slate-600">•</span>
            <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded ${car.status === 'Available' ? 'text-emerald-300 bg-emerald-950/40 border border-emerald-500/20' : car.status === 'Reserved' ? 'text-amber-300 bg-amber-950/40 border border-amber-500/20' : 'text-slate-400 bg-slate-800 border border-slate-700'}`}>
              {car.status}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{car.title}</h1>
          <p className="text-xs text-slate-400 font-medium">{DEALERSHIP_INFO.address}, Kalaburagi</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-4">
            <div className="relative aspect-[16/10] rounded-3xl overflow-hidden border border-slate-700/50 shadow-xl bg-slate-900">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImageIndex}
                  src={car.images[activeImageIndex] || car.images[0]}
                  alt={car.title}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
            </div>

            {car.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {car.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-24 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      activeImageIndex === idx
                        ? 'border-amber-500 scale-105 shadow-lg shadow-amber-500/20'
                        : 'border-slate-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                  </button>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-slate-700/50">
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4">Vehicle Details</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {[
                  { label: 'Model', value: car.model },
                  { label: 'Year', value: car.year },
                  { label: 'Transmission', value: car.transmission },
                  { label: 'Body Type', value: car.bodyType },
                  { label: 'Fuel Type', value: car.fuelType },
                  { label: 'Owner', value: car.ownerCount },
                  { label: 'RTO', value: car.specs.rto?.split(' ')[0] || '—' },
                ].map(d => (
                  <div key={d.label} className="glass-panel p-3 rounded-xl">
                    <span className="text-slate-400 block text-[9px] uppercase font-black">{d.label}</span>
                    <span className="text-sm font-extrabold text-white mt-0.5 block">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel rounded-3xl p-6 space-y-6 shadow-xl sticky top-32">
              <div className="space-y-4">
                <h4 className="text-xs font-black text-white uppercase tracking-wider">Inquire / Book Test Drive</h4>

                {submitted ? (
                  <div className="p-4 bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>Inquiry submitted! Our team will contact you shortly.</span>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-3">
                    <input type="text" placeholder="Your Full Name" required value={buyerName} onChange={e => setBuyerName(e.target.value)} className="w-full glass-input rounded-xl p-3 text-xs font-bold focus:outline-none" />
                    <input type="tel" placeholder="Mobile Phone Number (+91)" required value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)} className="w-full glass-input rounded-xl p-3 text-xs font-bold focus:outline-none" />
                    <button type="submit" disabled={submitting} className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs rounded-xl transition-all shadow-md">
                      {submitting ? 'Submitting...' : 'Request Callback'}
                    </button>
                  </form>
                )}

                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-md block text-center">
                  <MessageCircle className="w-4 h-4 fill-white text-white" />
                  <span>Chat on WhatsApp Directly</span>
                </a>

                <a href="tel:+918123991847" className="w-full py-3 bg-slate-700/80 hover:bg-slate-600 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-600 block text-center">
                  <Phone className="w-4 h-4 text-amber-400" />
                  <span>Call +91 81239 91847</span>
                </a>

                <a href="tel:+918088050599" className="w-full py-3 bg-slate-800/60 hover:bg-slate-700 text-slate-200 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-700 block text-center">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>Call +91 80880 50599</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {relatedCars && relatedCars.length > 0 && (
        <div className="max-w-7xl mx-auto mt-12 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white">Similar {car.brand} Cars</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Other {car.brand} vehicles available at KM Car Deals</p>
            </div>
            <button onClick={onBack} className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedCars.slice(0, 3).map(rc => (
              <CarCard key={rc.id} car={rc} onSelectCar={onSelectCar} onQuickView={onSelectCar} onExchangeSelect={onOpenExchangeModal} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
