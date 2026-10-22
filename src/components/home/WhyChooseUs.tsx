import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Gauge, FileCheck, Landmark, Award, HeartHandshake } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const pillars = [
    {
      icon: <ShieldCheck className="w-5 h-5 text-slate-900" strokeWidth={1.5} />,
      title: '100% Non-Accidental Guarantee',
      desc: 'Every vehicle in our inventory undergoes structural frame and chassis validation to guarantee zero major collision history.'
    },
    {
      icon: <Gauge className="w-5 h-5 text-slate-900" strokeWidth={1.5} />,
      title: 'Genuine Meter Reading',
      desc: 'We verify odometer readings directly with authorized service center logs to ensure 100% authentic kilometers.'
    },
    {
      icon: <FileCheck className="w-5 h-5 text-slate-900" strokeWidth={1.5} />,
      title: '150-Point Technical Inspection',
      desc: 'From engine compression to electronics, suspension, and air conditioning, every car passes strict quality benchmarks.'
    },
    {
      icon: <Landmark className="w-5 h-5 text-slate-900" strokeWidth={1.5} />,
      title: 'Instant Bank Finance Approval',
      desc: 'Tie-ups with leading banks (HDFC, ICICI, SBI, Axis) for quick low-interest car loans with flexible EMIs.'
    },
    {
      icon: <Award className="w-5 h-5 text-slate-900" strokeWidth={1.5} />,
      title: 'Legal RC Transfer Guarantee',
      desc: 'Complete assistance for seamless Regional Transport Office (RTO) ownership transfer without hassle.'
    },
    {
      icon: <HeartHandshake className="w-5 h-5 text-slate-900" strokeWidth={1.5} />,
      title: 'Trusted Local Reputation',
      desc: 'Proudly rated 5.0 Stars on Google by hundreds of satisfied car owners in Kalaburagi and surrounding districts.'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' }
    }
  };

  return (
    <section className="py-20 sm:py-28 px-4 lg:px-8 relative z-10 bg-white">
      <div className="max-w-7xl mx-auto space-y-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto space-y-3"
        >
          <p className="section-eyebrow">Unmatched Quality Standards</p>
          <h2 className="section-headline">
            Why buy &amp; exchange at KM Car Deals
          </h2>
          <p className="text-sm text-slate-500">
            Building lifelong trust in Kalaburagi through honest vehicle condition reporting and transparent pricing.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {pillars.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-slate-50 p-7 rounded-3xl transition-shadow duration-300 hover:shadow-card"
            >
              <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center mb-5 shadow-card">
                {item.icon}
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
