import React from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Building2, 
  Rocket, 
  Target, 
  HeartHandshake 
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useTranslation } from 'react-i18next';

interface CardItem {
  id: string;
  titleKey: string;
  descKey: string;
  colSpan: string;
  icon: React.ReactNode;
}

export const OpportunitiesShowcase: React.FC = () => {
  const { t } = useTranslation();

  const opportunities: CardItem[] = [
    {
      id: '01',
      titleKey: 'opportunities.cards.scholarships.title',
      descKey: 'opportunities.cards.scholarships.desc',
      colSpan: 'md:col-span-2',
      icon: <GraduationCap className="w-6 h-6 text-slate-700" />,
    },
    {
      id: '02',
      titleKey: 'opportunities.cards.schemes.title',
      descKey: 'opportunities.cards.schemes.desc',
      colSpan: 'md:col-span-1',
      icon: <Building2 className="w-6 h-6 text-slate-700" />,
    },
    {
      id: '03',
      titleKey: 'opportunities.cards.startups.title',
      descKey: 'opportunities.cards.startups.desc',
      colSpan: 'md:col-span-1',
      icon: <Rocket className="w-6 h-6 text-slate-700" />,
    },
    {
      id: '04',
      titleKey: 'opportunities.cards.skills.title',
      descKey: 'opportunities.cards.skills.desc',
      colSpan: 'md:col-span-2',
      icon: <Target className="w-6 h-6 text-slate-700" />,
    },
    {
      id: '05',
      titleKey: 'opportunities.cards.welfare.title',
      descKey: 'opportunities.cards.welfare.desc',
      colSpan: 'md:col-span-3',
      icon: <HeartHandshake className="w-6 h-6 text-slate-700" />,
    },
  ];

  return (
    <section id="explore" className="w-full bg-white text-[#0F172A] pt-16 pb-8 sm:pt-24 sm:pb-12 relative overflow-hidden font-sans border-t border-slate-100/50">
      {/* SECTION HEADER */}
      <div className="max-w-4xl mx-auto text-center px-6 mb-16 sm:mb-20 flex flex-col items-center gap-2.5">
        <span className="text-xs sm:text-sm font-semibold tracking-[0.2em] text-[#2563EB] uppercase">
          {t('opportunities.label')}
        </span>
        <motion.h2 
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] tracking-tight leading-[1.1] select-none"
        >
          {t('opportunities.title')}<span className="text-[#2563EB] drop-shadow-[0_2px_8px_rgba(37,99,235,0.45)]">.</span>
        </motion.h2>
      </div>

      {/* BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-6 relative z-10">
        {opportunities.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "group flex flex-col justify-between rounded-[20px] bg-[#F5F5F7] p-8 min-h-[280px] border border-transparent hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer select-none",
              item.colSpan
            )}
          >
            {/* Top Area: Icon */}
            <div className="flex items-start justify-between w-full">
              <div className="group-hover:scale-110 group-hover:text-[#2563EB] transition-all duration-300">
                {item.icon}
              </div>
            </div>

            {/* Bottom Area */}
            <div className="w-full text-left">
              <h3 className="font-bold text-xl text-slate-900 tracking-tight mb-2">
                {t(item.titleKey)}
              </h3>
              <p className="text-sm text-slate-500 font-normal leading-relaxed max-w-2xl">
                {t(item.descKey)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
