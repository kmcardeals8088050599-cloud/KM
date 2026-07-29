/**
 * WhatsApp notification helper for KM Car Deals
 * Uses the wa.me redirect trick (no API key needed for admin alerts).
 * For production server-side sending, set WHATSAPP_ADMIN_PHONE and
 * optionally integrate Twilio/WhatsApp Business Cloud API.
 *
 * Server-side: We log the message + return a wa.me link the admin
 * can click. If WHATSAPP_API_URL + WHATSAPP_API_TOKEN are set,
 * we POST to the Business Cloud API automatically.
 */

interface WAMessage {
  to: string;   // phone with country code, e.g. "918123991847"
  text: string;
}

export async function sendWhatsAppAlert(msg: WAMessage): Promise<void> {
  const apiUrl = process.env.WHATSAPP_API_URL;     // optional: Meta Cloud API
  const apiToken = process.env.WHATSAPP_API_TOKEN; // optional: Bearer token

  if (apiUrl && apiToken) {
    try {
      const body = {
        messaging_product: 'whatsapp',
        to: msg.to,
        type: 'text',
        text: { body: msg.text }
      };
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiToken}`
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.warn('[WhatsApp] Send failed:', err);
      } else {
        console.log('[WhatsApp] Alert sent to', msg.to);
      }
    } catch (err) {
      console.warn('[WhatsApp] Error sending alert:', err);
    }
  } else {
    // Fallback: just log the message so admin can see it in server logs
    console.log('[WhatsApp ALERT]', `To: ${msg.to}`);
    console.log('[WhatsApp ALERT]', msg.text);
  }
}

export function buildNewLeadMessage(lead: {
  name: string;
  phone: string;
  type: string;
  carTitle?: string;
  message?: string;
}): string {
  return [
    `🔔 *New Lead - KM Car Deals*`,
    ``,
    `👤 Customer: ${lead.name}`,
    `📞 Phone: ${lead.phone}`,
    `📋 Type: ${lead.type}`,
    lead.carTitle ? `🚗 Car: ${lead.carTitle}` : null,
    lead.message ? `💬 Message: ${lead.message}` : null,
    ``,
    `⏰ ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
    ``,
    `Reply to this lead: https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`
  ].filter(Boolean).join('\n');
}

export function buildNewExchangeMessage(ex: {
  customerName: string;
  phone: string;
  currentBrand: string;
  currentModel: string;
  currentYear: number;
  currentKilometers: number;
  expectedPrice: number;
  targetCarTitle?: string;
}): string {
  return [
    `🔄 *New Exchange Request - KM Car Deals*`,
    ``,
    `👤 Customer: ${ex.customerName}`,
    `📞 Phone: ${ex.phone}`,
    `🚗 Their Car: ${ex.currentBrand} ${ex.currentModel} (${ex.currentYear})`,
    `📊 KM Driven: ${ex.currentKilometers.toLocaleString('en-IN')} km`,
    `💰 Expected: ₹${ex.expectedPrice} Lakhs`,
    ex.targetCarTitle ? `🎯 Wants: ${ex.targetCarTitle}` : null,
    ``,
    `⏰ ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
    ``,
    `Reply: https://wa.me/${ex.phone.replace(/[^0-9]/g, '')}`
  ].filter(Boolean).join('\n');
}

export function buildDailySummaryMessage(stats: {
  totalCars: number;
  availableCars: number;
  soldCars: number;
  reservedCars: number;
  totalLeads: number;
  newLeads: number;
  totalExchanges: number;
  newExchanges: number;
  insuranceExpiring: { title: string; date: string }[];
}): string {
  const lines = [
    `📊 *KM Car Deals — Daily Summary*`,
    `📅 ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Kolkata' })}`,
    ``,
    `🚗 *Inventory*`,
    `  • Total Cars: ${stats.totalCars}`,
    `  • Available: ${stats.availableCars}`,
    `  • Reserved: ${stats.reservedCars}`,
    `  • Sold: ${stats.soldCars}`,
    ``,
    `📋 *Leads*`,
    `  • Total: ${stats.totalLeads}`,
    `  • 🔴 New (Pending): ${stats.newLeads}`,
    ``,
    `🔄 *Exchange Requests*`,
    `  • Total: ${stats.totalExchanges}`,
    `  • 🔴 New (Pending): ${stats.newExchanges}`,
  ];

  if (stats.insuranceExpiring.length > 0) {
    lines.push(``, `⚠️ *Insurance Expiring Soon*`);
    stats.insuranceExpiring.slice(0, 5).forEach(c => {
      lines.push(`  • ${c.title} — ${c.date}`);
    });
  }

  lines.push(``, `🏪 KM Car Deals, Kalaburagi | +91 81239 91847`);
  return lines.join('\n');
}

export function buildPriceDropMessage(car: {
  title: string;
  oldPrice: number;
  newPrice: number;
}, customerPhone: string): string {
  const saving = (car.oldPrice - car.newPrice).toFixed(2);
  return [
    `📉 *Price Drop Alert — KM Car Deals*`,
    ``,
    `🚗 ${car.title}`,
    `💰 Old Price: ₹${car.oldPrice.toFixed(2)} Lakh`,
    `✅ New Price: ₹${car.newPrice.toFixed(2)} Lakh`,
    `💵 You Save: ₹${saving} Lakh!`,
    ``,
    `Call us: +91 81239 91847`,
    `Visit: Opposite Hyundai Showroom, Kalaburagi`
  ].join('\n');
}
