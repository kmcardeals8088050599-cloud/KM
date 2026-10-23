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

  const mainImage = car.images[activeImageIndex] || car.images[0] || null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="pt-6 md:pt-28 pb-28 md:pb-16 bg-slate-50 min-h-screen text-slate-900"
    >
      <div className="apple-container space-y-8 md:space-y-10">
        <div className="hidden md:flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors duration-300 w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 rounded"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
            <span>Back to Inventory</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="btn-secondary-apple btn-sm"
            >
              <Share2 className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Share</span>
            </button>

            <button
              onClick={() => onOpenExchangeModal(car)}
              className="btn-accent-apple btn-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Exchange Your Car</span>
            </button>
          </div>
        </div>

        {/* Mobile top bar — compact back + share */}
        <div className="md:hidden flex items-center justify-between -mt-2">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 transition-colors duration-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 rounded"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
            <span>Back</span>
          </button>
          <button
            onClick={handleShare}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
          >
            <Share2 className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{car.brand} · {car.status}</p>
          <h1 className="section-headline !text-3xl sm:!text-5xl">{car.title}</h1>
          <p className="text-sm text-slate-500">
            {DEALERSHIP_INFO.address}, Kalaburagi
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            {/* Hero gallery — large on desktop, taller full-bleed feel on mobile */}
            <div className="relative aspect-[4/3] md:aspect-[16/10] bg-slate-900 rounded-2xl md:rounded-3xl overflow-hidden shadow-premium group -mx-4 md:mx-0">
              {mainImage ? (
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImageIndex}
                    src={mainImage}
                    alt={car.title}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 flex items-center justify-center">
                  <div className="text-center">
                    <Images className="w-12 h-12 text-slate-600 mx-auto" />
                    <p className="text-[11px] font-bold text-slate-500 mt-3 uppercase tracking-[0.2em]">KM Car Deals</p>
                    <p className="text-[10px] text-slate-600 font-semibold mt-1">Photos on request · Kalaburagi</p>
                  </div>
                </div>
              )}
              {/* Cinematic bottom gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none"></div>

              {/* Image counter */}
              {car.images.length > 0 && (
                <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/60 text-white text-[11px] font-semibold rounded-full">
                  {activeImageIndex + 1} / {car.images.length}
                </div>
              )}

              {/* Prev / Next arrows */}
              {car.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex(prev => (prev - 1 + car.images.length) % car.images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
                    aria-label="Previous image"
                  >
                    <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex(prev => (prev + 1) % car.images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
                    aria-label="Next image"
                  >
                    <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail strip — swipe carousel on mobile, regular row on desktop */}
            {car.images.length > 1 && (
              <div className="swipe-row md:flex md:overflow-x-auto items-center gap-3 pb-2 pt-1 -mx-4 px-4 md:mx-0 md:px-0">
                {car.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`swipe-item relative w-24 h-16 rounded-xl overflow-hidden transition-all duration-300 shrink-0 mr-3 md:mr-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 ${
                      activeImageIndex === idx
                        ? 'ring-2 ring-amber-500 scale-105 shadow-md'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}

            <div className="pt-6 border-t border-slate-200">
              <h3 className="section-eyebrow mb-4">Vehicle Details</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                {[
                  { label: 'Model', value: car.model },
                  { label: 'Year', value: car.year },
                  { label: 'Transmission', value: car.transmission },
                  { label: 'Body Type', value: car.bodyType },
                  { label: 'Fuel Type', value: car.fuelType },
                  { label: 'Kilometres', value: typeof car.odometerKm === 'number' ? `${car.odometerKm.toLocaleString('en-IN')} km` : '—' },
                  { label: 'Colour', value: car.color || '—' },
                  { label: 'RTO', value: (car.specs?.rto || car.location || '').split(' ')[0] || '—' },
                ].map(d => (
                  <div key={d.label} className="executive-card p-4 rounded-2xl">
                    <span className="text-slate-500 block text-[11px] uppercase tracking-wide font-semibold">{d.label}</span>
                    <span className="text-sm font-semibold text-slate-900 mt-1 block">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Inquiry card — hidden on mobile (replaced by sticky CTA bar) */}
          <div className="lg:col-span-4 space-y-6 hidden md:block">
            <div className="highlight-card p-6 space-y-5 sticky top-32">
              <div className="space-y-4">
                <h4 className="section-eyebrow">Inquire / Book Test Drive</h4>

                {submitted ? (
                  <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" strokeWidth={1.75} />
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
                        className="w-full bg-slate-50 border border-transparent rounded-xl p-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
                      />
                    </div>

                    <div>
                      <input
                        type="tel"
                        placeholder="Mobile Phone Number (+91)"
                        required
                        value={buyerPhone}
                        onChange={e => setBuyerPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-transparent rounded-xl p-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary-apple w-full"
                    >
                      {submitting ? 'Submitting...' : 'Request Callback'}
                    </button>
                  </form>
                )}

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[0.9rem] rounded-full transition-colors duration-300 flex items-center justify-center gap-2 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
                >
                  <MessageCircle className="w-4 h-4" strokeWidth={1.75} />
                  <span>Chat on WhatsApp</span>
                </a>

                <a
                  href="tel:+918123991847"
                  className="flex items-center justify-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 py-1 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 rounded"
                >
                  <Phone className="w-3.5 h-3.5" strokeWidth={1.75} />
                  +91 81239 91847
                </a>
              </div>
            </div>
          </div>

          {/* Mobile-only inquiry form (inline, below gallery/specs — CTA actions live in sticky bar) */}
          <div className="lg:col-span-4 md:hidden">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 space-y-4 shadow-card">
              <h4 className="section-eyebrow">Inquire / Book Test Drive</h4>
              {submitted ? (
                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" strokeWidth={1.75} />
                  <span>Inquiry submitted! Our showroom team will contact you shortly.</span>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Your Full Name"
                    required
                    value={buyerName}
                    onChange={e => setBuyerName(e.target.value)}
                    className="w-full bg-slate-50 border border-transparent rounded-xl p-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
                  />
                  <input
                    type="tel"
                    placeholder="Mobile Phone Number (+91)"
                    required
                    value={buyerPhone}
                    onChange={e => setBuyerPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-transparent rounded-xl p-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary-apple w-full"
                  >
                    {submitting ? 'Submitting...' : 'Request Callback'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {relatedCars && relatedCars.length > 0 && (
        <div className="apple-container space-y-6 mt-16">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Similar {car.brand} Cars</h2>
              <p className="text-sm text-slate-500 mt-0.5">Other {car.brand} vehicles available at KM Car Deals</p>
            </div>
            <button
              onClick={onBack}
              className="hidden md:flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 rounded"
            >
              View All <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>
          </div>
          <div>
            {/* Desktop grid */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            {/* Mobile swipe carousel */}
            <div className="swipe-row md:hidden -mx-4 px-4 gap-4">
              {relatedCars.slice(0, 5).map(rc => (
                <div key={rc.id} className="swipe-item w-[78%] mr-4">
                  <CarCard
                    car={rc}
                    onSelectCar={onSelectCar}
                    onQuickView={onSelectCar}
                    onExchangeSelect={onOpenExchangeModal}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile persistent action bar */}
      <div className="mobile-sticky-cta md:hidden grid grid-cols-3 gap-2">
        <a
          href="tel:+918123991847"
          className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl bg-slate-100 text-slate-900 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
        >
          <Phone className="w-4 h-4" strokeWidth={1.75} />
          <span className="text-[10px] font-semibold">Call</span>
        </a>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl bg-emerald-600 text-white shadow-md transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
        >
          <MessageCircle className="w-4 h-4" strokeWidth={1.75} />
          <span className="text-[10px] font-semibold">WhatsApp</span>
        </a>
        <button
          onClick={() => onOpenExchangeModal(car)}
          className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl bg-amber-600 text-white shadow-md transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
        >
          <RefreshCw className="w-4 h-4" strokeWidth={1.75} />
          <span className="text-[10px] font-semibold">Exchange</span>
        </button>
      </div>
    </motion.div>
  );
};
