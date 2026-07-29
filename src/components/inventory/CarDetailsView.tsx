import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Car } from '../../types';
import {
  ArrowLeft,
  ShieldCheck,
  Share2,
  RefreshCw,
  Phone,
  MessageCircle,
  CheckCircle2,
  Check,
  Award
} from 'lucide-react';
import { createWhatsAppLink, submitLeadApi } from '../../lib/api';
import { DEALERSHIP_INFO } from '../../data/mockData';
import { EmiCalculator } from '../common/EmiCalculator';

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
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'inspection' | 'emi'>('overview');

  // Inquiry Form State
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerMessage] = useState(`Hi, I'm interested in the ${car.year} ${car.title} (₹ ${car.price.toFixed(2)} Lakh).`);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const whatsappMsg = `Hi KM Car Deals, I am interested in inquiring about the ${car.year} ${car.title} (₹ ${car.price.toFixed(2)} Lakhs) at Kalaburagi showroom. Phone: ${buyerPhone || 'Not specified'}`;
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
      message: buyerMessage
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
        {/* Back Button & Header */}
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
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Exchange Your Car</span>
            </button>
          </div>
        </div>

        {/* Title & Badge Summary */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200 uppercase tracking-wider">{car.brand}</span>
            <span className="text-slate-400">•</span>
            <span className="text-xs font-extrabold text-slate-600">{car.ownerCount}</span>
            <span className="text-slate-400">•</span>
            <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
              {car.status}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 font-serif tracking-tight">{car.title}</h1>
          <p className="text-xs text-slate-600 font-medium">
            Showroom Location: {DEALERSHIP_INFO.address}, Kalaburagi
          </p>
        </div>

        {/* Gallery & Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Gallery Column */}
          <div className="lg:col-span-8 space-y-4">
            {/* Main Stage Image */}
            <div className="relative aspect-[16/10] bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 shadow-xl">
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

              {car.isCertified && (
                <div className="absolute top-4 left-4 bg-slate-950/90 border border-slate-800 text-amber-300 px-3 py-1.5 rounded-xl backdrop-blur-md text-xs font-extrabold flex items-center gap-1.5 shadow-lg">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Certified 150-Point Inspected</span>
                </div>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {car.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {car.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-24 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      activeImageIndex === idx
                        ? 'border-slate-900 scale-105 shadow-md'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}

            {/* View Details Navigation Tabs */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
                {[
                  { id: 'overview', label: 'Overview & Specs' },
                  { id: 'features', label: 'Features & Amenities' },
                  { id: 'inspection', label: '150-Point Inspection' },
                  { id: 'emi', label: 'EMI Calculator' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2 rounded-xl transition-all font-extrabold ${
                      activeTab === tab.id
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-white text-slate-700 hover:text-slate-950 border border-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              <div className="pt-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Specifications Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <span className="text-slate-500 block text-[10px] uppercase font-black">Year</span>
                        <span className="text-base font-extrabold text-slate-900 mt-1 block">{car.year}</span>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <span className="text-slate-500 block text-[10px] uppercase font-black">Kilometers</span>
                        <span className="text-base font-extrabold text-slate-900 mt-1 block">{car.kilometers.toLocaleString('en-IN')} km</span>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <span className="text-slate-500 block text-[10px] uppercase font-black">Fuel Type</span>
                        <span className="text-base font-extrabold text-slate-900 mt-1 block">{car.fuelType}</span>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <span className="text-slate-500 block text-[10px] uppercase font-black">Transmission</span>
                        <span className="text-base font-extrabold text-slate-900 mt-1 block">{car.transmission}</span>
                      </div>
                    </div>

                    {/* Detailed Specs Table */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider border-l-2 border-amber-500 pl-2 font-serif">
                        Technical Specifications
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-xs">
                        <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-600 font-medium">
                          <span>RTO Registration:</span>
                          <span className="font-extrabold text-slate-900">{car.specs.rto}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-600 font-medium">
                          <span>Insurance Validity:</span>
                          <span className="font-extrabold text-emerald-700">{car.insuranceType}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-600 font-medium">
                          <span>Engine Displacement:</span>
                          <span className="font-extrabold text-slate-900">{car.engineCapacity || 'Standard'}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-600 font-medium">
                          <span>Seating Capacity:</span>
                          <span className="font-extrabold text-slate-900">{car.specs.seatingCapacity} Persons</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-600 font-medium">
                          <span>Ground Clearance:</span>
                          <span className="font-extrabold text-slate-900">{car.specs.groundClearance || 'Standard'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-2 shadow-sm">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider font-serif">Vehicle Overview &amp; Condition</h3>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">{car.description}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'features' && (
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider font-serif">Key Features &amp; Equipment</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {car.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 font-bold text-slate-800">
                          <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'inspection' && (
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
                    <div className="flex items-center gap-2 text-amber-800">
                      <Award className="w-5 h-5 text-amber-600" />
                      <h3 className="text-sm font-black uppercase tracking-wider font-serif">150-Point Inspection Certification</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      {[
                        'Engine & Gearbox Diagnostics',
                        'Structural Frame & Chassis Check',
                        'Suspension & Brake Systems',
                        'Air Conditioning & Electronics',
                        'Verified Meter Reading Log',
                        'RC & RTO Document Validation'
                      ].map((item, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between font-bold text-slate-900">
                          <span>{item}</span>
                          <span className="text-[10px] uppercase font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" /> Passed
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'emi' && (
                  <EmiCalculator carPriceLakhs={car.price} />
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Pricing & Inquiry Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-xl sticky top-32">
              {/* Showroom Price */}
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-black block">Showroom Price</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-slate-900 font-serif tracking-tight">
                    ₹ {car.price.toFixed(2)} Lakh
                  </span>
                  {car.originalPrice && car.originalPrice > car.price && (
                    <span className="text-xs text-slate-400 line-through font-semibold">
                      ₹ {car.originalPrice.toFixed(2)} L
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg mt-2 inline-block">
                  Estimated EMI starting at ₹ {Math.round(car.price * 100000 * 0.018).toLocaleString('en-IN')}/month
                </p>
              </div>

              {/* Inquiry Form */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider font-serif">Inquire / Book Test Drive</h4>

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
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl transition-all shadow-md"
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
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-700 block text-center"
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
    </motion.div>
  );
};
