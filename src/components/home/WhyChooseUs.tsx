import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Gauge, FileCheck, Landmark, Award, HeartHandshake } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const pillars = [
    { icon: <ShieldCheck className="w-6 h-6 text-amber-400" />, title: '100% Non-Accidental Guarantee', desc: 'Every vehicle in our inventory undergoes structural frame and chassis validation to guarantee zero major collision history.' },
    { icon: <Gauge className="w-6 h-6 text-amber-400" />, title: 'Genuine Meter Reading', desc: 'We verify odometer readings directly with authorized service center logs to ensure 100% authentic kilometers.' },
    { icon: <FileCheck className="w-6 h-6 text-amber-400" />, title: '150-Point Technical Inspection', desc: 'From engine compression to electronics, suspension, and air conditioning, every car passes strict quality benchmarks.' },
    { icon: <Landmark className="w-6 h-6 text-amber-400" />, title: 'Instant Bank Finance Approval', desc: 'Tie-ups with leading banks (HDFC, ICICI, SBI, Axis) for quick low-interest car loans with flexible EMIs.' },
    { icon: <Award className="w-6 h-6 text-amber-400" />, title: 'Legal RC Transfer Guarantee', desc: 'Complete assistance for seamless Regional Transport Office (RTO) ownership transfer without hassle.' },
    { icon: <HeartHandshake className="w-6 h-6 text-amber-400" />, title: 'Trusted Local Reputation', desc: 'Proudly rated 5.0 Stars on Google by hundreds of satisfied car owners in Kalaburagi and surrounding districts.' }
  ];

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } } };

  return (
    <section className="py-20 px-4 lg:px-8 relative z-10 border-t border-slate-800/50">
      <div className="max-w-7xl mx-auto space-y-12">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-950/40 px-4 py-1.5 rounded-full border border-amber-500/20">Unmatched Quality Standards</span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">WHY BUY & EXCHANGE AT KM CAR DEALS?</h2>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">Building lifelong trust in Kalaburagi through honest vehicle condition reporting and transparent pricing.</p>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((item, index) => (
            <motion.div key={index} variants={itemVariants} whileHover={{ y: -6, transition: { duration: 0.2 } }} className="glass-panel p-6 rounded-3xl border border-slate-700/50 hover:border-amber-500/30 transition-all duration-300 hover:shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">{item.icon}</div>
              <h3 className="text-lg font-black text-white mb-2">{item.title}</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
