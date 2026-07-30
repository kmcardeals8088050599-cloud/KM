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

  return (
    <div className="py-24 px-4 lg:px-8 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-black text-amber-400 uppercase tracking-widest bg-amber-950/40 px-4 py-1.5 rounded-full border border-amber-500/20">
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" /> Instant Vehicle Exchange Program
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            EXCHANGE YOUR CAR AT KM CAR DEALS
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed font-medium">
            Upgrade your existing car easily. Get high market valuation, doorstep physical evaluation in Kalaburagi, and hassle-free instant paper transfer.
          </p>
        </div>

        {/* Selected Upgrade Vehicle Notification */}
        {targetCar && (
          <div className="glass-panel border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-amber-400 font-black uppercase tracking-wider block">Target Upgrade Vehicle</span>
              <h4 className="text-sm font-black text-white">{targetCar.title} ({targetCar.year})</h4>
            </div>
            <img src={targetCar.images[0]} alt="" className="w-20 h-14 object-cover rounded-xl shrink-0 border border-slate-700/50" referrerPolicy="no-referrer" />
          </div>
        )}

        {/* Main Exchange Form */}
        {submitted ? (
          <div className="glass-panel border border-emerald-500/30 p-10 rounded-3xl text-center space-y-4 shadow-md animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-950/50 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-white">Exchange Details Received!</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed font-medium">
              We have opened WhatsApp with your details. Our sales manager at KM Car Deals will evaluate your vehicle and connect with you shortly for doorstep inspection.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl transition-colors shadow-sm"
            >
              Submit Another Exchange Request
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-panel border border-slate-700/50 rounded-3xl p-6 sm:p-10 space-y-8">
            {/* Step 1: Customer Contact */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider border-l-2 border-amber-500 pl-3">
                1. Customer Contact Info
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patil"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full glass-input rounded-xl p-3 text-xs font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Mobile / WhatsApp Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98450 12345"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full glass-input rounded-xl p-3 text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Vehicle Specs */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider border-l-2 border-amber-500 pl-3">
                2. Details of Your Existing Car
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Car Brand *</label>
                  <select
                    value={currentBrand}
                    onChange={e => setCurrentBrand(e.target.value)}
                    className="w-full glass-input rounded-xl p-3 text-xs font-bold focus:outline-none"
                  >
                    {['Hyundai', 'Maruti Suzuki', 'Mahindra', 'Tata', 'Toyota', 'Honda', 'Kia', 'Volkswagen', 'Ford', 'Renault', 'BMW', 'Mercedes-Benz', 'Other'].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Model &amp; Variant *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Swift ZXI / Creta SX"
                    value={currentModel}
                    onChange={e => setCurrentModel(e.target.value)}
                    className="w-full glass-input rounded-xl p-3 text-xs font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Registration Year</label>
                  <select
                    value={currentYear}
                    onChange={e => setCurrentYear(parseInt(e.target.value))}
                    className="w-full glass-input rounded-xl p-3 text-xs font-bold focus:outline-none"
                  >
                    {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Fuel Type</label>
                  <select
                    value={fuelType}
                    onChange={e => setFuelType(e.target.value as FuelType)}
                    className="w-full glass-input rounded-xl p-3 text-xs font-bold focus:outline-none"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="CNG">CNG</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Transmission</label>
                  <select
                    value={transmission}
                    onChange={e => setTransmission(e.target.value as Transmission)}
                    className="w-full glass-input rounded-xl p-3 text-xs font-bold focus:outline-none"
                  >
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Kilometers Driven</label>
                  <input
                    type="number"
                    value={currentKilometers}
                    onChange={e => setCurrentKilometers(parseInt(e.target.value) || 0)}
                    className="w-full glass-input rounded-xl p-3 text-xs font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Expected Price (in ₹ Lakhs)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={expectedPrice}
                    onChange={e => setExpectedPrice(parseFloat(e.target.value) || 0)}
                    className="w-full glass-input rounded-xl p-3 text-amber-400 font-black focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Photos & Remarks */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider border-l-2 border-amber-500 pl-3">
                3. Vehicle Photos &amp; Comments
              </h3>

              <ImageUploader images={uploadedPhotos} onChange={setUploadedPhotos} kind="exchange" maxImages={5} label="Upload Photos of Your Existing Car (Optional)" />

              <div>
                <label className="block text-xs text-slate-700 font-bold mb-1">Condition Notes / Remarks</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Non-accidental, single owner, insurance valid till 2026..."
                  value={comments}
                  onChange={e => setComments(e.target.value)}
                  className="w-full glass-input rounded-xl p-3 text-xs font-bold focus:outline-none"
                ></textarea>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-700/50">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-white text-white" />
                <span>{loading ? 'Processing...' : 'Submit Request & Open WhatsApp Evaluation'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
