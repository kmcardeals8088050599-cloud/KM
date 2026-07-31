import React from 'react';
import { motion } from 'motion/react';
import { Search, Eye, RefreshCw, CheckCircle2 } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Browse or Submit Vehicle',
      desc: 'Explore our multi-brand inventory online or submit details of your existing vehicle for trade-in valuation.',
      icon: <Search className="w-5 h-5 text-slate-800" />
    },
    {
      num: '02',
      title: 'Test Drive & Inspection',
      desc: 'Visit our showroom opposite Hyundai Showroom on Humnabad Road for a physical inspection and test drive.',
      icon: <Eye className="w-5 h-5 text-slate-800" />
    },
    {
      num: '03',
      title: 'Instant Loan & Valuation',
      desc: 'Get immediate bank finance approval or top market exchange trade-in credit for your old vehicle.',
      icon: <RefreshCw className="w-5 h-5 text-slate-800" />
    },
    {
      num: '04',
      title: 'Keys Handover & RC Transfer',
      desc: 'Drive home your dream car with complete peace of mind while we manage the legal RC ownership transfer.',
      icon: <CheckCircle2 className="w-5 h-5 text-slate-800" />
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
    <section className="py-20 px-4 lg:px-8 relative z-10 border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto space-y-3"
        >
          <span className="text-xs font-bold text-slate-800 uppercase tracking-widest bg-slate-100 px-4 py-1.5 rounded-full border border-slate-300">
            Simple &amp; Transparent Process
          </span>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                HOW BUYING &amp; EXCHANGE <span className="text-gradient-amber">WORKS</span>
              </h2>
          <p className="text-xs text-slate-600 font-medium">
            4 easy steps to buy your pre-owned vehicle or upgrade through car exchange in Kalaburagi
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative"
        >
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-slate-50 p-6 rounded-3xl relative overflow-hidden group border border-slate-200 hover:border-slate-400 transition-shadow duration-300 hover:shadow-lg"
            >
              <div className="text-5xl font-black text-slate-400/30 group-hover:text-slate-600/20 transition-colors absolute top-2 right-3 select-none">
                {step.num}
              </div>

              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-300 flex items-center justify-center mb-4 relative z-10 shadow-xs">
                {step.icon}
              </div>

              <h3 className="text-base font-black text-slate-900 mb-2 relative z-10">{step.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed relative z-10 font-medium">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
