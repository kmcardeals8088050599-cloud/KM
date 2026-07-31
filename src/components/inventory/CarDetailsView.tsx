import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Car } from '../../types';
import {
  ArrowLeft,
  ArrowRight,
  Share2,
  RefreshCw,
  Phone,
  MessageCircle,
  CheckCircle2,
  ChevronRight,
  Images
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
      navigator.share({
        title: car.title,
        text: `Check out this ${car.title} at KM Car Deals Kalaburagi!`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Car link copied to clipboard!');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="py-28 px-4 lg:px-8 bg-slate-50 min-h-screen text-slate-900"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm w-fit"
          >
            <ArrowLeft className="w-4 h-4 text-amber-600" />
            <span>Back to Inventory</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-600" />
              <span>Share</span>
            </button>

            <button
              onClick={() => onOpenExchangeModal(car)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Exchange Your Car</span>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200 uppercase tracking-wider">{car.brand}</span>
            <span className="text-slate-400">•</span>
            <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
              {car.status}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{car.title}</h1>
          <p className="text-xs text-slate-600 font-medium">
            Showroom Location: {DEALERSHIP_INFO.address}, Kalaburagi
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-4">
            <div className="relative aspect-[16/10] bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 shadow-premium group">
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
              {/* Cinematic bottom gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent pointer-events-none"></div>

              {/* Image counter badge */}
              <div className="absolute top-4 right-4 px-3 py-1.5 bg-slate-950/70 text-white text-[11px] font-bold rounded-full border border-white/20 backdrop-blur-sm flex items-center gap-1.5">
                <Images className="w-3.5 h-3.5 text-amber-400" />
                <span>{activeImageIndex + 1} / {car.images.length}</span>
              </div>

              {/* Prev / Next arrows */}
              {car.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex(prev => (prev - 1 + car.images.length) % car.images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-lg border border-white/60 transition-all hover:scale-105"
                    aria-label="Previous image"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex(prev => (prev + 1) % car.images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-lg border border-white/60 transition-all hover:scale-105"
                    aria-label="Next image"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {car.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1">
                {car.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-24 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 group/thumb ${
                      activeImageIndex === idx
                        ? 'border-amber-500 scale-105 shadow-md'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    {activeImageIndex === idx && (
                      <div className="absolute inset-0 bg-amber-500/20 ring-1 ring-inset ring-amber-500"></div>
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">Vehicle Details</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {[
                  { label: 'Model', value: car.model },
                  { label: 'Year', value: car.year },
                  { label: 'Transmission', value: car.transmission },
                  { label: 'Body Type', value: car.bodyType },
                  { label: 'Fuel Type', value: car.fuelType },
                  { label: 'RTO', value: car.specs.rto?.split(' ')[0] || '—' },
                ].map(d => (
                  <div key={d.label} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-slate-500 block text-[9px] uppercase font-black">{d.label}</span>
                    <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-xl sticky top-32">
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Inquire / Book Test Drive</h4>

                {submitted ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Inquiry submitted! Our showroom team will contact you shortly.</span>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Your Full Name"
                        required
                        value={buyerName}
                        onChange={e => setBuyerName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <input
                        type="tel"
                        placeholder="Mobile Phone Number (+91)"
                        required
                        value={buyerPhone}
                        onChange={e => setBuyerPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs rounded-xl transition-all shadow-sm"
                    >
                      {submitting ? 'Submitting...' : 'Request Callback'}
                    </button>
                  </form>
                )}

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-md block text-center"
                >
                  <MessageCircle className="w-4 h-4 fill-white text-white" />
                  <span>Chat on WhatsApp Directly</span>
                </a>

                <a
                  href="tel:+918123991847"
                  className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm block text-center"
                >
                  <Phone className="w-4 h-4 text-amber-400" />
                  <span>Call +91 81239 91847</span>
                </a>

                <a
                  href="tel:+918088050599"
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-300 block text-center"
                >
                  <Phone className="w-4 h-4 text-slate-700" />
                  <span>Call +91 80880 50599</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {relatedCars && relatedCars.length > 0 && (
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">Similar {car.brand} Cars</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Other {car.brand} vehicles available at KM Car Deals</p>
            </div>
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedCars.slice(0, 3).map(rc => (
              <CarCard
                key={rc.id}
                car={rc}
                onSelectCar={onSelectCar}
                onQuickView={onSelectCar}
                onExchangeSelect={onOpenExchangeModal}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
