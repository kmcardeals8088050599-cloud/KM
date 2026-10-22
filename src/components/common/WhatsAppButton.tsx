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
      className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-lg transition-colors flex items-center justify-center"
      aria-label="WhatsApp Contact"
    >
      <MessageCircle className="w-6 h-6" strokeWidth={1.75} />
    </a>
  );
};
