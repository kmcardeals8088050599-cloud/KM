import React from 'react';
import { MessageCircle } from 'lucide-react';
import { DEALERSHIP_INFO } from '../../data/mockData';
import { createWhatsAppLink } from '../../lib/api';

export const WhatsAppButton: React.FC = () => {
  const url = createWhatsAppLink(
    DEALERSHIP_INFO.whatsappNumber,
    "Hi KM Car Deals, I want to inquire about available pre-owned cars or exchange options."
  );

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-[0_8px_24px_-4px_rgba(16,185,129,0.6)] hover:shadow-[0_10px_30px_-4px_rgba(16,185,129,0.8)] hover:scale-105 transition-all duration-300 ease-out flex items-center justify-center focus-visible:ring-2 focus-visible:ring-slate-900/30 focus-visible:outline-none"
      aria-label="WhatsApp Contact"
    >
      <span className="absolute inset-0 rounded-full bg-emerald-500/60 animate-ping" style={{ animationDuration: '2.2s' }} />
      <MessageCircle className="w-7 h-7 relative z-10" strokeWidth={1.75} />
    </a>
  );
};
