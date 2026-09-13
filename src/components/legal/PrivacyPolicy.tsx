import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileText, Home, Phone, Mail, Lock, Database, Eye, RefreshCw } from 'lucide-react';

const Section = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
  <section className="glass-panel rounded-2xl p-6 space-y-3">
    <div className="flex items-center gap-3">
      <span className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
        <Icon className="w-5 h-5 text-amber-700" />
      </span>
      <h2 className="text-lg font-black text-slate-900">{title}</h2>
    </div>
    <div className="text-[13px] leading-relaxed text-slate-600 space-y-2">{children}</div>
  </section>
);

export function PrivacyPolicy() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="pt-28 pb-16 px-4 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-xs font-black text-amber-700 uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5" /> Legal
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
            <p className="text-xs text-slate-500 font-medium">Last updated: September 2026</p>
          </div>

          {/* Intro */}
          <section className="glass-panel rounded-2xl p-6 text-[13px] leading-relaxed text-slate-600 space-y-2">
            <p>
              KM Car Deals ("we", "our", "us") is a multi-brand pre-owned car showroom managed by
              <strong className="text-slate-800"> Md Nadeem Khan</strong>, located opposite Hyundai Showroom,
              Humnabad Road, Kapnoor, Kalaburagi - 585104.
            </p>
            <p>
              This policy explains how we collect, use, and protect your personal information when you use our
              website <Link to="/" className="text-amber-700 font-bold hover:underline">kmcardeals.com</Link>,
              contact us by phone or WhatsApp, or use our vehicle buying / selling / exchange services.
            </p>
          </section>

          <Section icon={Database} title="1. Information We Collect">
            <p><strong>Information you provide:</strong> your name, phone number, email address, vehicle details
              (brand, model, year, price, ownership, kilometres, condition), photos, and any messages you send us
              through WhatsApp or this website.</p>
            <p><strong>Information collected automatically:</strong> device type, browser, pages visited, and
              general usage data to improve our website.</p>
          </Section>

          <Section icon={Eye} title="2. How We Use Your Information">
            <p>We use your information to: respond to enquiries, assess vehicles offered for sale or exchange,
              prepare listings, provide price estimates, arrange inspection and purchase, send you updates about
              your vehicle enquiry, and improve our services.</p>
            <p>We do <strong>not</strong> sell your personal information to third parties.</p>
          </Section>

          <Section icon={Lock} title="3. WhatsApp &amp; Messaging">
            <p>Our WhatsApp business account (through Meta's WhatsApp Business Cloud API) collects your vehicle
              details and photos from conversations on
              <strong className="text-slate-800"> +91 73386 86562</strong>. Messages are used solely to process your
              enquiry. Message content and delivery information are processed by Meta as described in
              their privacy policy. If you do not wish to communicate over WhatsApp, call us directly instead.</p>
          </Section>

          <Section icon={RefreshCw} title="4. Data Sharing &amp; Third Parties">
            <p>We share personal information only with trusted service providers who help us operate our website
              and communications (for example, hosting and messaging infrastructure). Those providers are bound by
              confidentiality obligations. We may also disclose information where required by law.</p>
          </Section>

          <Section icon={Eye} title="5. Data Retention">
            <p>We retain personal information only as long as necessary to provide our services, maintain records
              for accounting and legal purposes, or as required by Indian law.</p>
          </Section>

          <Section icon={Lock} title="6. Data Security">
            <p>We apply reasonable technical and organisational safeguards to protect your information against
              unauthorised access, alteration, or loss. Data is transmitted over encrypted connections where
              supported.</p>
          </Section>

          <Section icon={ShieldCheck} title="7. Your Rights">
            <p>You may request access to, correction of, or deletion of your personal information at any time.
              To exercise these rights, contact us using the details below and we will act on your request within a
              reasonable timeframe.</p>
          </Section>

          <Section icon={FileText} title="8. Changes to This Policy">
            <p>We may update this policy from time to time. The latest version will always be available at this
              page with an updated "Last updated" date.</p>
          </Section>

          {/* Contact */}
          <section className="rounded-2xl bg-slate-900 text-white p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Phone className="w-5 h-5 text-amber-400" />
              </span>
              <h2 className="text-lg font-black">9. Contact Us</h2>
            </div>
            <div className="text-[13px] text-slate-300 space-y-2">
              <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-amber-400" /> +91 81239 91847 &nbsp;/&nbsp; +91 80880 50599</p>
              <p className="flex items-center gap-2"><Home className="w-4 h-4 text-amber-400" /> Opposite Hyundai Showroom, Humnabad Road, Kapnoor, Kalaburagi - 585104</p>
              <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-amber-400" /> WhatsApp: +91 73386 86562</p>
            </div>
          </section>

          <div className="flex justify-center pb-4">
            <Link to="/terms" className="text-xs font-black text-amber-700 hover:underline">
              Read our Terms &amp; Conditions →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}