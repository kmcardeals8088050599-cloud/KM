import React, { useState } from 'react';
import { DEALERSHIP_INFO } from '../../data/mockData';
import { MapPin, Phone, Clock, MessageCircle, Send, CheckCircle2, User, ExternalLink } from 'lucide-react';
import { createWhatsAppLink, submitLeadApi } from '../../lib/api';
import { KmLogo } from '../common/KmLogo';

export const ContactView: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const whatsappUrl = createWhatsAppLink(
    '918123991847',
    "Hi KM Car Deals, I want to inquire about visiting your showroom opposite Hyundai Showroom in Kalaburagi."
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    setSubmitting(true);
    await submitLeadApi({
      name,
      phone,
      email,
      type: 'General',
      message: message || 'General contact inquiry'
    });
    setSubmitting(false);
    setSubmitted(true);
    setName('');
    setPhone('');
    setEmail('');
    setMessage('');
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="py-28 px-4 lg:px-8 bg-slate-50 min-h-screen text-slate-900">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-black text-amber-900 uppercase tracking-widest bg-amber-100/90 px-4 py-1.5 rounded-full border border-amber-300 shadow-sm">
            Showroom Location &amp; Direct Contact
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-serif">
            CONTACT KM CAR DEALS
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Have questions about buying, selling, or exchanging a vehicle in Kalaburagi? We are here to help!
          </p>
        </div>

        {/* Card Template Showcase Banner */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl max-w-4xl mx-auto relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            {/* Top Row: Owner & Phone */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-amber-600" />
                </div>
                <span className="font-black text-slate-900 text-base font-serif">Md Nadeem Khan</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="tel:+918123991847"
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-full font-extrabold text-sm shadow-md"
                >
                  <Phone className="w-4 h-4 fill-white" />
                  <span>+91 81239 91847</span>
                </a>
                <a
                  href="tel:+918088050599"
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-1.5 rounded-full font-bold text-sm border border-slate-300"
                >
                  <Phone className="w-4 h-4 text-slate-600" />
                  <span>+91 80880 50599</span>
                </a>
              </div>
            </div>

            {/* Center Logo & Title */}
            <div className="text-center space-y-3 flex flex-col items-center">
              <KmLogo variant="amber" size="xl" />

              <div className="pt-2 flex items-center justify-center gap-2 text-xs font-black">
                <span className="text-slate-900 bg-slate-100 border border-slate-300 px-3 py-1 rounded-md">
                  SALE
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-900 bg-slate-100 border border-slate-300 px-3 py-1 rounded-md">
                  PURCHASE
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-900 bg-slate-100 border border-slate-300 px-3 py-1 rounded-md">
                  EXCHANGE
                </span>
              </div>

              <div className="pt-2">
                <span className="inline-block bg-slate-900 text-white font-extrabold text-xs uppercase tracking-wider px-4 py-1.5 rounded-full shadow-md">
                  BUSINESS ON COMMISSION BASIS
                </span>
              </div>
            </div>

            {/* Address Row */}
            <div className="pt-4 border-t border-slate-200 text-center text-xs space-y-1">
              <p className="font-black text-slate-900 flex items-center justify-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Opposite Hyundai Showroom, Humnabad Road, Kapnoor, Kalaburagi - 585104</span>
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column: Form vs Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Form */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <h3 className="text-xl font-black text-slate-900 font-serif">Send Us a Direct Message</h3>

            {submitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <span>Thank you! Your message has been received. Our team will contact you shortly.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Enter mobile number"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Message / Inquiry Details</label>
                  <textarea
                    rows={4}
                    placeholder="How can we help you? (e.g. Car inquiry, price estimate, test drive)"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-amber-500"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>{submitting ? 'Sending Message...' : 'Send Message'}</span>
                </button>
              </form>
            )}

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3 text-xs">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>WhatsApp</span>
              </a>

              <a
                href="tel:+918123991847"
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl flex items-center justify-center gap-1.5"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>+91 81239 91847</span>
              </a>

              <a
                href="tel:+918088050599"
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold rounded-xl flex items-center justify-center gap-1.5 border border-slate-300"
              >
                <Phone className="w-4 h-4 text-slate-700" />
                <span>+91 80880 50599</span>
              </a>
            </div>
          </div>

          {/* Map Preview */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl min-h-[420px] relative flex flex-col">
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  Opposite Hyundai Showroom, Kalaburagi
                </span>
                <a
                  href={DEALERSHIP_INFO.googleMapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <span>Open Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <iframe
                src={DEALERSHIP_INFO.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '380px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="KM Car Deals Kalaburagi Map"
                className="w-full h-full flex-1"
              ></iframe>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 shadow-md text-xs">
              <h4 className="font-black text-slate-900 uppercase tracking-wider font-serif">Showroom Working Hours</h4>
              <div className="flex items-center gap-2 text-slate-700 font-bold">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>{DEALERSHIP_INFO.workingHours}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
