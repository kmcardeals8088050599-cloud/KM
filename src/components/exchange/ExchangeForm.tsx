import React, { useState } from 'react';
import { Car, FuelType, Transmission } from '../../types';
import { RefreshCw, CheckCircle2, MessageCircle } from 'lucide-react';
import { submitExchangeApi, createWhatsAppLink } from '../../lib/api';
import { DEALERSHIP_INFO } from '../../data/mockData';
import { ImageUploader } from '../common/ImageUploader';

interface ExchangeFormProps {
  targetCar?: Car | null;
  onSuccess?: () => void;
}

export const ExchangeForm: React.FC<ExchangeFormProps> = ({ targetCar, onSuccess }) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [currentBrand, setCurrentBrand] = useState('Hyundai');
  const [currentModel, setCurrentModel] = useState('');
  const [currentYear, setCurrentYear] = useState<number>(2020);
  const [currentKilometers, setCurrentKilometers] = useState<number>(45000);
  const [fuelType, setFuelType] = useState<FuelType>('Petrol');
  const [transmission, setTransmission] = useState<Transmission>('Manual');
  const [expectedPrice, setExpectedPrice] = useState<number>(5.5);
  const [comments, setComments] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone || !currentBrand || !currentModel) return;

    setLoading(true);

    const exchangeData = {
      customerName,
      phone,
      currentBrand,
      currentModel,
      currentYear,
      currentKilometers,
      fuelType,
      transmission,
      expectedPrice,
      comments,
      images: uploadedPhotos,
      targetCarId: targetCar?.id,
      targetCarTitle: targetCar?.title
    };

    await submitExchangeApi(exchangeData);

    setLoading(false);
    setSubmitted(true);

    // Format WhatsApp message
    const waText = `Hi KM Car Deals,\n\nI want to exchange my vehicle:\n• Name: ${customerName}\n• Phone: ${phone}\n• Car: ${currentBrand} ${currentModel} (${currentYear})\n• KM Driven: ${currentKilometers} km\n• Fuel & Trans: ${fuelType} ${transmission}\n• Expected Price: ₹ ${expectedPrice} Lakhs\n${targetCar ? `• Upgrade Target: ${targetCar.title}\n` : ''}Please provide exchange evaluation.`;

    const waUrl = createWhatsAppLink(DEALERSHIP_INFO.whatsappNumber, waText);
    window.open(waUrl, '_blank');

    if (onSuccess) onSuccess();
  };

  const inputClasses = "w-full bg-white border border-slate-300 rounded-xl px-4 py-3.5 text-slate-900 font-normal focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-shadow";

  const stepHeading = (num: string, label: string) => (
    <div className="flex items-center gap-3">
      <span className="w-8 h-8 rounded-full border border-slate-300 text-slate-900 font-bold text-sm flex items-center justify-center shrink-0">
        {num}
      </span>
      <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
        {label}
      </h3>
    </div>
  );

  return (
    <div className="pt-28 pb-28 lg:pb-24 px-4 lg:px-8 bg-white min-h-screen text-slate-800">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="relative text-center space-y-4 bg-slate-50 border border-slate-200 rounded-3xl py-14 px-6">
          <p className="section-eyebrow flex items-center justify-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-amber-600" /> Instant Vehicle Exchange Program
          </p>
          <h1 className="section-headline">
            Exchange your car at <span className="text-amber-600">KM Car Deals</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Upgrade your existing car easily. Get a fair market valuation, doorstep evaluation in Kalaburagi, and instant paper transfer.
          </p>
        </div>

        {/* Selected Upgrade Vehicle Notification */}
        {targetCar && (
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex items-center justify-between gap-4 shadow-sm">
            <div>
              <span className="text-[11px] text-amber-700 font-bold uppercase tracking-wide block mb-1">Target Upgrade Vehicle</span>
              <h4 className="text-sm font-semibold text-slate-900">{targetCar.title} ({targetCar.year})</h4>
            </div>
            <img src={targetCar.images[0]} alt="" className="w-20 h-14 object-cover rounded-xl shrink-0 border border-slate-200 shadow-md" referrerPolicy="no-referrer" />
          </div>
        )}

        {/* Main Exchange Form */}
        {submitted ? (
          <div className="bg-white border border-slate-200 p-12 rounded-3xl text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Exchange details received</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              We have opened WhatsApp with your details. Our sales manager at KM Car Deals will evaluate your vehicle and connect with you shortly for doorstep inspection.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="btn-secondary-apple"
            >
              Submit another exchange request
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-12 space-y-10 shadow-xl">
            {/* Step 1: Customer Contact */}
            <div className="space-y-5">
              {stepHeading('1', 'Customer contact info')}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                <div>
                  <label className="block text-slate-700 font-medium mb-1.5">Your full name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patil"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1.5">Mobile / WhatsApp number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98450 12345"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className={inputClasses}
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Vehicle Specs */}
            <div className="space-y-5 pt-6 border-t border-slate-100">
              {stepHeading('2', 'Details of your existing car')}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-sm">
                <div>
                  <label className="block text-slate-700 font-medium mb-1.5">Car brand *</label>
                  <select
                    value={currentBrand}
                    onChange={e => setCurrentBrand(e.target.value)}
                    className={inputClasses}
                  >
                    {['Hyundai', 'Maruti Suzuki', 'Mahindra', 'Tata', 'Toyota', 'Honda', 'Kia', 'Volkswagen', 'Ford', 'Renault', 'BMW', 'Mercedes-Benz', 'Other'].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1.5">Model &amp; variant *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Swift ZXI / Creta SX"
                    value={currentModel}
                    onChange={e => setCurrentModel(e.target.value)}
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1.5">Registration year</label>
                  <select
                    value={currentYear}
                    onChange={e => setCurrentYear(parseInt(e.target.value))}
                    className={inputClasses}
                  >
                    {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 text-sm">
                <div>
                  <label className="block text-slate-700 font-medium mb-1.5">Fuel type</label>
                  <select
                    value={fuelType}
                    onChange={e => setFuelType(e.target.value as FuelType)}
                    className={inputClasses}
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="CNG">CNG</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1.5">Transmission</label>
                  <select
                    value={transmission}
                    onChange={e => setTransmission(e.target.value as Transmission)}
                    className={inputClasses}
                  >
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1.5">Kilometers driven</label>
                  <input
                    type="number"
                    value={currentKilometers}
                    onChange={e => setCurrentKilometers(parseInt(e.target.value) || 0)}
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1.5">Expected price (₹ Lakhs)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={expectedPrice}
                    onChange={e => setExpectedPrice(parseFloat(e.target.value) || 0)}
                    className={`${inputClasses} text-amber-700 font-medium`}
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Photos & Remarks */}
            <div className="space-y-5 pt-6 border-t border-slate-100">
              {stepHeading('3', 'Vehicle photos & comments')}

              <ImageUploader images={uploadedPhotos} onChange={setUploadedPhotos} kind="exchange" maxImages={5} label="Upload photos of your existing car (optional)" />

              <div>
                <label className="block text-sm text-slate-700 font-medium mb-1.5">Condition notes / remarks</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Non-accidental, single owner, insurance valid till 2026..."
                  value={comments}
                  onChange={e => setComments(e.target.value)}
                  className={inputClasses}
                ></textarea>
              </div>
            </div>

            {/* Submit Button - desktop inline */}
            <div className="hidden lg:block pt-6 border-t border-slate-200">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-full transition-colors shadow-[0_8px_24px_-6px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{loading ? 'Processing...' : 'Submit request & open WhatsApp evaluation'}</span>
              </button>
            </div>

            {/* Submit Button - mobile sticky CTA so it's reachable from anywhere in the long form */}
            <div className="mobile-sticky-cta lg:hidden">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-full transition-colors shadow-[0_8px_24px_-6px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{loading ? 'Processing...' : 'Submit & open WhatsApp'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
