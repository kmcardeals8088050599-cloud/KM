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

  const inputClasses = "w-full p-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 focus:border-slate-900 transition-shadow duration-300";

  return (
    <div className="pb-28 lg:pb-24 bg-white min-h-screen text-slate-900">
      <div className="apple-container space-y-16">
        {/* Title - light band */}
        <div className="relative -mx-6 lg:-mx-8 bg-slate-50 border-b border-slate-200 px-6 lg:px-8 pt-32 pb-16">
          <div className="relative z-10 text-center max-w-3xl mx-auto space-y-4">
            <p className="section-eyebrow">Showroom Location &amp; Direct Contact</p>
            <h1 className="section-headline">
              Contact <span className="text-amber-600">KM Car Deals</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              Have questions about buying, selling, or exchanging a vehicle in Kalaburagi? We are here to help.
            </p>
          </div>
        </div>

        {/* Owner & Showroom Summary */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 max-w-4xl mx-auto text-center space-y-5">
          <KmLogo variant="amber" size="xl" />
          <p className="text-sm text-slate-500">Sale &middot; Purchase &middot; Exchange &middot; Commission Brokerage</p>

          <div className="pt-5 border-t border-slate-200 flex flex-wrap items-center justify-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 font-medium text-slate-900">
              <User className="w-4 h-4 text-amber-600" strokeWidth={1.5} />
              Md Nadeem Khan
            </span>
            <a href="tel:+918123991847" className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none rounded-sm">
              <Phone className="w-4 h-4" strokeWidth={1.5} /> +91 81239 91847
            </a>
            <a href="tel:+918088050599" className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none rounded-sm">
              <Phone className="w-4 h-4" strokeWidth={1.5} /> +91 80880 50599
            </a>
          </div>

          <p className="pt-4 border-t border-slate-200 text-sm text-slate-600 flex items-center justify-center gap-1.5">
            <MapPin className="w-4 h-4 text-amber-600 shrink-0" strokeWidth={1.5} />
            Opposite Hyundai Showroom, Humnabad Road, Kapnoor, Kalaburagi - 585104
          </p>
        </div>

        {/* 2-Column: Form vs Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Form */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 space-y-6 shadow-xl">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Send us a direct message</h3>

            {submitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-sm flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" strokeWidth={1.75} />
                <span>Thank you! Your message has been received. Our team will contact you shortly.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-700 font-medium mb-1.5">Your full name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-700 font-medium mb-1.5">Phone number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Enter mobile number"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-700 font-medium mb-1.5">Email address (optional)</label>
                  <input
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-700 font-medium mb-1.5">Message / inquiry details</label>
                  <textarea
                    rows={4}
                    placeholder="How can we help you? (e.g. Car inquiry, price estimate, test drive)"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className={inputClasses}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-accent-apple w-full flex items-center justify-center gap-2 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none"
                >
                  <Send className="w-4 h-4" strokeWidth={1.75} />
                  <span>{submitting ? 'Sending message...' : 'Send message'}</span>
                </button>
              </form>
            )}

            <div className="hidden lg:flex pt-4 border-t border-slate-200 items-center justify-between gap-3 text-sm">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-h-[44px] py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-full flex items-center justify-center gap-1.5 transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none"
              >
                <MessageCircle className="w-4 h-4" strokeWidth={1.75} />
                <span>WhatsApp</span>
              </a>

              <a
                href="tel:+918123991847"
                className="flex-1 min-h-[44px] py-3 bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm rounded-full flex items-center justify-center gap-1.5 transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none"
              >
                <Phone className="w-4 h-4" strokeWidth={1.75} />
                Call now
              </a>

              <a
                href="tel:+918088050599"
                className="flex-1 min-h-[44px] py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-full flex items-center justify-center gap-1.5 transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none"
              >
                <Phone className="w-4 h-4 text-slate-500" strokeWidth={1.75} />
                <span>+91 80880 50599</span>
              </a>
            </div>
          </div>

          {/* Map Preview */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl min-h-[420px] relative flex flex-col">
              <div className="p-4 bg-slate-50 border-b border-slate-200 text-slate-900 flex items-center justify-between text-sm font-semibold">
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-600" strokeWidth={1.75} />
                  Opposite Hyundai Showroom, Kalaburagi
                </span>
                <a
                  href={DEALERSHIP_INFO.googleMapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none rounded-sm"
                >
                  <span>Open Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.75} />
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

            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 shadow-sm text-sm">
              <h4 className="font-bold text-slate-900 uppercase tracking-wide text-xs">Showroom Working Hours</h4>
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <Clock className="w-4 h-4 text-amber-600" strokeWidth={1.75} />
                <span>{DEALERSHIP_INFO.workingHours}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky Call / WhatsApp / Directions bar */}
      <div className="mobile-sticky-cta lg:hidden flex items-center gap-2">
        <a
          href="tel:+918123991847"
          className="flex-1 min-h-[44px] py-3 bg-amber-600 text-white font-medium text-xs rounded-full flex items-center justify-center gap-1.5 transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none"
        >
          <Phone className="w-4 h-4" strokeWidth={1.75} />
          <span>Call</span>
        </a>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-h-[44px] py-3 bg-emerald-600 text-white font-medium text-xs rounded-full flex items-center justify-center gap-1.5 shadow-[0_6px_16px_-4px_rgba(16,185,129,0.5)] transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none"
        >
          <MessageCircle className="w-4 h-4" strokeWidth={1.75} />
          <span>WhatsApp</span>
        </a>
        <a
          href={DEALERSHIP_INFO.googleMapLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-h-[44px] py-3 bg-slate-100 text-slate-700 font-medium text-xs rounded-full flex items-center justify-center gap-1.5 transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none"
        >
          <MapPin className="w-4 h-4" strokeWidth={1.75} />
          <span>Directions</span>
        </a>
      </div>
    </div>
  );
};
