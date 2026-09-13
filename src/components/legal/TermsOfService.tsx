import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, Car, CheckCircle2, CircleDollarSign, Dot } from 'lucide-react';

const Clause = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
  <section className="glass-panel rounded-2xl p-6 space-y-3">
    <div className="flex items-center gap-3">
      <span className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center">
        <Icon className="w-5 h-5 text-slate-700" />
      </span>
      <h2 className="text-lg font-black text-slate-900">{title}</h2>
    </div>
    <div className="text-[13px] leading-relaxed text-slate-600 space-y-2">{children}</div>
  </section>
);

export function TermsOfService() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="pt-28 pb-16 px-4 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-200 border border-slate-300 text-xs font-black text-slate-700 uppercase tracking-widest">
              <Scale className="w-3.5 h-3.5" /> Legal
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">Terms &amp; Conditions</h1>
            <p className="text-xs text-slate-500 font-medium">Last updated: September 2026</p>
          </div>

          <section className="glass-panel rounded-2xl p-6 text-[13px] leading-relaxed text-slate-600 space-y-2">
            <p>
              These terms govern your use of <strong className="text-slate-800">KM Car Deals</strong>' website and
              services. By using this website or messaging us, you agree to these terms. If you do not agree,
              please do not use our services.
            </p>
          </section>

          <Clause icon={Car} title="1. General Information">
            <p>KM Car Deals is a multi-brand pre-owned car showroom at Opposite Hyundai Showroom, Humnabad Road,
              Kapnoor, Kalaburagi - 585104, managed by Md Nadeem Khan. All vehicles displayed are subject to
              prior sale and availability.</p>
          </Clause>

          <Clause icon={Car} title="2. Vehicle Listings &amp; Accuracy">
            <p>We make reasonable efforts to ensure listings (price, year, kilometres, ownership, condition) are
              accurate. However, details are provided by vehicle owners and may change. Please confirm specifications,
              documents, and price before completing any transaction.</p>
          </Clause>

          <Clause icon={CheckCircle2} title="3. 150-Point Inspection &amp; Non-Accidental Status">
            <p>Each vehicle undergoes a 150-point technical check. While we diligently screen vehicles, "non-accidental"
              and "verified meter reading" statements are based on available history and inspection; they are not
              absolute guarantees of past events.</p>
          </Clause>

          <Clause icon={Dot} title="4. Business on Commission Basis">
            <p>Our services include sale, purchase, and exchange of pre-owned vehicles on a commission basis.
              Final pricing and commission terms are agreed on a transaction-by-transaction basis.</p>
          </Clause>

          <Clause icon={CircleDollarSign} title="5. Payments &amp; Documentation">
            <p>Payment methods, transfer of ownership documentation, and delivery are arranged in accordance with
              applicable Indian law (including the Motor Vehicles Act). We are not liable for delays caused by
              third-party registration or financial authorities.</p>
          </Clause>

          <Clause icon={Car} title="6. Exchange of Vehicles">
            <p>Exchange valuations are estimates based on inspection and prevailing market conditions. The final
              exchange value is confirmed after physical inspection and document verification at our showroom.</p>
          </Clause>

          <Clause icon={Car} title="7. Limitation of Liability">
            <p>To the maximum extent permitted by law, KM Car Deals shall not be liable for indirect, incidental,
              or consequential damages arising from use of this website or our services.</p>
          </Clause>

          <Clause icon={Scale} title="8. Governing Law &amp; Disputes">
            <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive
              jurisdiction of the courts at Kalaburagi, Karnataka.</p>
          </Clause>

          <Clause icon={CheckCircle2} title="9. Contact">
            <p>For questions about these terms, contact us at +91 81239 91847 or +91 80880 50599.</p>
          </Clause>

          <div className="flex justify-center">
            <Link to="/privacy" className="text-xs font-black text-amber-700 hover:underline">
              ← Read our Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}