import React from 'react';
import { motion } from 'framer-motion';

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  label: string;
}

const FEATURES: FeatureItem[] = [
  {
    id: '01',
    title: 'Personalized Matching',
    description: 'Discover opportunities tailored to your profile. Our system analyzes qualifications to match you with matching scholarships and welfare initiatives.',
    label: 'Profile Matching',
  },
  {
    id: '02',
    title: 'Application Guide',
    description: 'Step-by-step guidance for every application. Navigate instructions, requirements, and filing deadlines without confusion.',
    label: 'Filing Guidance',
  },
  {
    id: '03',
    title: 'Required Documents',
    description: 'Know exactly what documents you need. Get dynamic checklists sorted by priority to prevent delays in approval.',
    label: 'Document Audit',
  },
  {
    id: '04',
    title: 'Deadline Tracking',
    description: 'Never miss an important deadline. Monitor opening and closing dates for all matching government opportunities.',
    label: 'Timeline Tracking',
  },
  {
    id: '05',
    title: 'Smart Notifications',
    description: 'Stay updated with new opportunities. Receive real-time alerts whenever a new program matches your criteria.',
    label: 'Alert Updates',
  },
];

export const Features: React.FC = () => {
  // Stagger variants for the vertical elements
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1] 
      }
    },
  };

  return (
    <section id="features" className="w-full bg-[#FAFBFC] text-[#0F172A] pt-10 pb-24 sm:pt-12 sm:pb-32 relative overflow-hidden font-sans border-t border-slate-100/60">
      {/* Background soft grid accents */}
      <div className="absolute inset-0 bg-[radial-gradient(#E2E8F0_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.25] pointer-events-none" />

      {/* SECTION HEADER */}
      <div className="max-w-4xl mx-auto text-center px-6 mb-16 sm:mb-20 flex flex-col items-center gap-2.5 relative z-10">
        <span className="text-xs sm:text-sm font-semibold tracking-[0.2em] text-[#2563EB] uppercase">
          Saarthi Capabilities
        </span>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] tracking-tight leading-[1.1]">
          Features<span className="text-[#2563EB] drop-shadow-[0_2px_8px_rgba(37,99,235,0.45)]">.</span>
        </h2>
        <p className="text-base sm:text-lg text-slate-500 font-normal leading-relaxed mt-1 max-w-md">
          Everything you need in one place.
        </p>
      </div>

      {/* TIMELINE CONTAINER */}
      <div className="max-w-3xl mx-auto px-6 relative z-10">
        {/* Continuous Vertical Timeline Track Line */}
        <div className="absolute left-[20px] sm:left-[30px] top-6 bottom-6 w-[1px] bg-slate-200/60 pointer-events-none" />

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10% 0px" }}
          className="flex flex-col w-full"
        >
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.id}
              variants={itemVariants}
              className="relative pl-12 sm:pl-20 pt-8 pb-8 sm:pt-10 sm:pb-10 first:pt-4 last:pb-4 group flex flex-col items-start"
            >
              {/* Timeline Circular Indicator Node */}
              <div className="absolute left-[10px] sm:left-[20px] top-[36px] sm:top-[44px] -translate-x-1/2 w-[21px] h-[21px] rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all duration-300 group-hover:border-[#2563EB] group-hover:scale-110 group-hover:shadow-[0_0_8px_rgba(37,99,235,0.15)] z-10">
                <div className="w-[7px] h-[7px] rounded-full bg-slate-300 transition-all duration-300 group-hover:bg-[#2563EB] group-hover:scale-125" />
              </div>

              {/* Text block that translates smoothly on hover */}
              <div className="group-hover:translate-x-1.5 transition-transform duration-300 flex flex-col items-start w-full">
                {/* Sub-label showing feature code */}
                <span className="font-mono text-xs sm:text-sm font-semibold tracking-wider text-slate-400 mb-2">
                  0{index + 1} &mdash; {feature.label}
                </span>

                {/* Feature Title */}
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  {feature.title}
                </h3>

                {/* Feature Description */}
                <p className="text-base sm:text-[18px] text-slate-500 font-normal leading-relaxed mt-3 max-w-xl">
                  {feature.description}
                </p>
              </div>

              {/* Elegant low-contrast separator between rows (except last item) */}
              {index !== FEATURES.length - 1 && (
                <div className="w-full h-[1px] bg-slate-100/80 mt-10 sm:mt-12 pointer-events-none" />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
