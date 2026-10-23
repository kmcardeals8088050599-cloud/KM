import React from 'react';
import { motion } from 'motion/react';
import { Search, Eye, RefreshCw, CheckCircle2 } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Browse or Submit Vehicle',
      desc: 'Explore our multi-brand inventory online or submit details of your existing vehicle for trade-in valuation.',
      icon: <Search className="w-5 h-5 text-slate-900" strokeWidth={1.5} />
    },
    {
      num: '02',
      title: 'Test Drive & Inspection',
      desc: 'Visit our showroom opposite Hyundai Showroom on Humnabad Road for a physical inspection and test drive.',
      icon: <Eye className="w-5 h-5 text-slate-900" strokeWidth={1.5} />
    },
    {
      num: '03',
      title: 'Instant Loan & Valuation',
      desc: 'Get immediate bank finance approval or top market exchange trade-in credit for your old vehicle.',
      icon: <RefreshCw className="w-5 h-5 text-slate-900" strokeWidth={1.5} />
    },
    {
      num: '04',
      title: 'Keys Handover & RC Transfer',
      desc: 'Drive home your dream car with complete peace of mind while we manage the legal RC ownership transfer.',
      icon: <CheckCircle2 className="w-5 h-5 text-slate-900" strokeWidth={1.5} />
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  };

  return (
    <section className="section-pad relative z-10 bg-slate-50">
      <div className="apple-container space-y-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto space-y-3"
        >
          <p className="section-eyebrow">Simple &amp; Transparent Process</p>
          <h2 className="section-headline">
            How buying &amp; exchange works
          </h2>
          <p className="text-sm text-slate-500">
            4 easy steps to buy your pre-owned vehicle or upgrade through car exchange in Kalaburagi.
          </p>
        </motion.div>

        {/* Mobile: swipe carousel of numbered steps */}
        <div className="swipe-row gap-4 -mx-4 px-4 sm:hidden">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="swipe-item w-[78vw] max-w-xs executive-card p-6 rounded-3xl relative overflow-hidden"
            >
              <div className="text-7xl font-extrabold text-slate-100 absolute -top-3 right-2 select-none leading-none">
                {step.num}
              </div>
              <div className="w-11 h-11 rounded-2xl bg-slate-900 flex items-center justify-center mb-5 relative z-10">
                {React.cloneElement(step.icon, { className: 'w-5 h-5 text-amber-400', strokeWidth: 1.75 })}
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2 relative z-10">{step.title}</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed relative z-10">{step.desc}</p>
            </div>
          ))}
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-6 relative"
        >
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="executive-card p-6 rounded-3xl relative overflow-hidden"
            >
              <div className="text-7xl font-extrabold text-slate-100 absolute -top-3 right-2 select-none leading-none">
                {step.num}
              </div>

              <div className="w-11 h-11 rounded-2xl bg-slate-900 flex items-center justify-center mb-5 relative z-10">
                {React.cloneElement(step.icon, { className: 'w-5 h-5 text-amber-400', strokeWidth: 1.75 })}
              </div>

              <h3 className="text-base font-semibold text-slate-900 mb-2 relative z-10">{step.title}</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed relative z-10">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
