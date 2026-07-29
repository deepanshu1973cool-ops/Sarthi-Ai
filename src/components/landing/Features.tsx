import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface FeatureItem {
  id: string;
  titleKey: string;
  descKey: string;
  labelKey: string;
}

export const Features: React.FC = () => {
  const { t } = useTranslation();

  const features: FeatureItem[] = [
    {
      id: '01',
      titleKey: 'features.items.matching.title',
      descKey: 'features.items.matching.desc',
      labelKey: 'features.items.matching.label',
    },
    {
      id: '02',
      titleKey: 'features.items.guide.title',
      descKey: 'features.items.guide.desc',
      labelKey: 'features.items.guide.label',
    },
    {
      id: '03',
      titleKey: 'features.items.docs.title',
      descKey: 'features.items.docs.desc',
      labelKey: 'features.items.docs.label',
    },
    {
      id: '04',
      titleKey: 'features.items.deadlines.title',
      descKey: 'features.items.deadlines.desc',
      labelKey: 'features.items.deadlines.label',
    },
    {
      id: '05',
      titleKey: 'features.items.notifications.title',
      descKey: 'features.items.notifications.desc',
      labelKey: 'features.items.notifications.label',
    },
  ];

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
          {t('features.label')}
        </span>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] tracking-tight leading-[1.1]">
          {t('features.title')}<span className="text-[#2563EB] drop-shadow-[0_2px_8px_rgba(37,99,235,0.45)]">.</span>
        </h2>
        <p className="text-base sm:text-lg text-slate-500 font-normal leading-relaxed mt-1 max-w-md">
          {t('features.subtitle')}
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
          {features.map((feature, index) => (
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
                  0{index + 1} &mdash; {t(feature.labelKey)}
                </span>

                {/* Feature Title */}
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  {t(feature.titleKey)}
                </h3>

                {/* Feature Description */}
                <p className="text-base sm:text-[18px] text-slate-500 font-normal leading-relaxed mt-3 max-w-xl">
                  {t(feature.descKey)}
                </p>
              </div>

              {/* Elegant separator between rows (except last item) */}
              {index !== features.length - 1 && (
                <div className="w-full h-[1px] bg-slate-100/80 mt-10 sm:mt-12 pointer-events-none" />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
