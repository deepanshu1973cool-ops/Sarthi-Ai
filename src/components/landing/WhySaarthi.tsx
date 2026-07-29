import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useTranslation } from 'react-i18next';

interface ItemType {
  id: string;
  titleKey: string;
  descKey: string;
  bulletsKey: string;
}

// ILLUSTRATIONS RENDERER FOR THE RIGHT SIDE
const VisualShowcase: React.FC<{ activeIndex: number }> = ({ activeIndex }) => {
  const { t } = useTranslation();

  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      <AnimatePresence mode="wait">
        {activeIndex === 0 && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -15 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[280px] aspect-[4/3] bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-100 p-6 flex flex-col justify-between"
          >
            {/* Header profile row */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 font-bold font-mono text-lg border border-blue-100">
                S
              </div>
              <div className="flex flex-col gap-1.5 w-2/3">
                <div className="h-3 bg-slate-900 rounded w-full" />
                <div className="h-2.5 bg-slate-200 rounded w-2/3" />
              </div>
            </div>

            {/* Profile fields mock */}
            <div className="flex flex-col gap-2.5 mt-4">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                <span className="text-xs text-slate-400 font-medium">{t('whySaarthi.visual.state')}</span>
                <span className="text-xs text-slate-800 font-semibold bg-slate-100 px-2 py-0.5 rounded">Delhi</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                <span className="text-xs text-slate-400 font-medium">{t('whySaarthi.visual.income')}</span>
                <span className="text-xs text-slate-800 font-semibold bg-slate-100 px-2 py-0.5 rounded">&lt; 2.5 LPA</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-xs text-slate-400 font-medium">{t('whySaarthi.visual.category')}</span>
                <span className="text-xs text-slate-800 font-semibold bg-slate-100 px-2 py-0.5 rounded">OBC</span>
              </div>
            </div>

            {/* Float badge */}
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute -top-3 -right-3 bg-blue-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg shadow-blue-500/20 flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {t('whySaarthi.visual.verified')}
            </motion.div>
          </motion.div>
        )}

        {activeIndex === 1 && (
          <motion.div
            key="matching"
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -15 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[280px] flex items-center justify-center relative"
          >
            {/* Connection circles representing matching */}
            <svg className="w-48 h-48" viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="100" r="80" stroke="#F1F5F9" strokeWidth="2" strokeDasharray="4 4" />
              <circle cx="100" cy="100" r="50" stroke="#E2E8F0" strokeWidth="1.5" />
              
              {/* Outer nodes */}
              <circle cx="100" cy="20" r="10" fill="white" stroke="#CBD5E1" strokeWidth="2" />
              <circle cx="180" cy="100" r="10" fill="white" stroke="#CBD5E1" strokeWidth="2" />
              <circle cx="100" cy="180" r="10" fill="white" stroke="#CBD5E1" strokeWidth="2" />
              <circle cx="20" cy="100" r="10" fill="white" stroke="#CBD5E1" strokeWidth="2" />

              {/* Connecting paths */}
              <motion.path
                d="M100 20 L100 100 M180 100 L100 100 M100 180 L100 100 M20 100 L100 100"
                stroke="#2563EB"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />

              {/* Central Active match node */}
              <circle cx="100" cy="100" r="14" fill="#2563EB" className="animate-pulse" />
              <path d="M97 100 L99 102 L103 98" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        )}

        {activeIndex === 2 && (
          <motion.div
            key="oneplace"
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -15 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[280px] h-48 flex items-center justify-center relative"
          >
            {/* Isometric stacked folder mockup */}
            <div className="relative w-40 h-32 flex flex-col justify-end">
              {/* Layer 3 */}
              <motion.div 
                animate={{ y: [0, -12, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.4 }}
                className="absolute top-0 inset-x-4 h-16 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-slate-100/70 p-3 flex items-center justify-between z-10"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500" />
                  <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">{t('whySaarthi.visual.startups')}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">12 {t('whySaarthi.visual.active')}</span>
              </motion.div>

              {/* Layer 2 */}
              <motion.div 
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.2 }}
                className="absolute top-6 inset-x-2 h-16 bg-white rounded-xl shadow-[0_6px_16px_rgba(0,0,0,0.03)] border border-slate-100/80 p-3 flex items-center justify-between z-20"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-blue-500" />
                  <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">{t('whySaarthi.visual.scholarships')}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">45 {t('whySaarthi.visual.active')}</span>
              </motion.div>

              {/* Layer 1 */}
              <motion.div 
                className="absolute top-12 inset-x-0 h-16 bg-white rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.04)] border border-slate-100 p-3 flex items-center justify-between z-30"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">{t('whySaarthi.visual.schemes')}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">120 {t('whySaarthi.visual.active')}</span>
              </motion.div>
            </div>
          </motion.div>
        )}

        {activeIndex === 3 && (
          <motion.div
            key="deadlines"
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -15 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[280px] aspect-[4/3] bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-100 p-5 flex flex-col justify-between"
          >
            {/* Calendar Grid Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-800">{t('whySaarthi.visual.calendar')}</span>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            </div>

            {/* Calendar Blocks */}
            <div className="grid grid-cols-7 gap-2.5 my-3">
              {Array.from({ length: 14 }).map((_, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "aspect-square rounded flex items-center justify-center text-[10px] font-medium transition-all duration-300",
                    idx === 4 ? "bg-red-50 text-red-500 font-bold border border-red-100" :
                    idx === 10 ? "bg-blue-50 text-blue-500 font-bold border border-blue-100 animate-pulse" :
                    "bg-slate-50 text-slate-300"
                  )}
                >
                  {idx + 1}
                </div>
              ))}
            </div>

            {/* Notification alert banner */}
            <div className="bg-blue-50/50 border border-blue-100/50 rounded-lg p-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-600 font-bold">{t('whySaarthi.visual.alert')}</span>
                <span className="text-[10px] text-slate-500 truncate w-32">PM Scholarship closes tomorrow</span>
              </div>
              <span className="text-[9px] font-mono font-bold text-red-500">1d {t('whySaarthi.visual.left')}</span>
            </div>
          </motion.div>
        )}

        {activeIndex === 4 && (
          <motion.div
            key="trusted"
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -15 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[280px] h-48 flex items-center justify-center relative"
          >
            {/* Verified badge shield illustration */}
            <div className="relative flex items-center justify-center">
              {/* Outer ring */}
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.15, 0.3] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute w-36 h-36 rounded-full bg-blue-100/40 border border-blue-200/50 z-0"
              />
              
              {/* Shield container */}
              <div className="relative w-24 h-28 bg-white rounded-2xl border border-slate-100 shadow-[0_12px_36px_rgba(0,0,0,0.06)] flex items-center justify-center z-10">
                <svg className="w-16 h-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="1.5" 
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                  />
                </svg>
              </div>

              {/* Tiny tags floated */}
              <div className="absolute -bottom-2 -left-6 bg-white border border-slate-100 shadow-md text-[9px] font-bold text-slate-800 px-2.5 py-1 rounded-full uppercase tracking-wider z-20">
                {t('whySaarthi.visual.sources')}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const WhySaarthi: React.FC = () => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);

  const items: ItemType[] = [
    {
      id: '01',
      titleKey: 'whySaarthi.items.profile.title',
      descKey: 'whySaarthi.items.profile.desc',
      bulletsKey: 'whySaarthi.items.profile.bullets'
    },
    {
      id: '02',
      titleKey: 'whySaarthi.items.matching.title',
      descKey: 'whySaarthi.items.matching.desc',
      bulletsKey: 'whySaarthi.items.matching.bullets'
    },
    {
      id: '03',
      titleKey: 'whySaarthi.items.oneplace.title',
      descKey: 'whySaarthi.items.oneplace.desc',
      bulletsKey: 'whySaarthi.items.oneplace.bullets'
    },
    {
      id: '04',
      titleKey: 'whySaarthi.items.deadlines.title',
      descKey: 'whySaarthi.items.deadlines.desc',
      bulletsKey: 'whySaarthi.items.deadlines.bullets'
    },
    {
      id: '05',
      titleKey: 'whySaarthi.items.trusted.title',
      descKey: 'whySaarthi.items.trusted.desc',
      bulletsKey: 'whySaarthi.items.trusted.bullets'
    }
  ];

  return (
    <section id="why-saarthi" className="w-full bg-white text-[#0F172A] py-16 sm:py-24 relative overflow-hidden font-sans border-t border-slate-100/50">
      
      {/* SECTION HEADER */}
      <div className="max-w-4xl mx-auto text-center px-6 mb-16 sm:mb-20 flex flex-col items-center gap-2.5">
        <span className="text-xs sm:text-sm font-semibold tracking-[0.2em] text-[#2563EB] uppercase">
          {t('whySaarthi.label')}
        </span>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] tracking-tight leading-[1.1]">
          {t('whySaarthi.title')}<span className="text-[#2563EB] drop-shadow-[0_2px_8px_rgba(37,99,235,0.45)]">?</span>
        </h2>
        <p className="text-base sm:text-lg text-slate-500 font-normal leading-relaxed mt-1 max-w-md">
          {t('whySaarthi.subtitle')}
        </p>
      </div>

      {/* TWO-COLUMN ACCORDION SHOWCASE CONTAINER */}
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-start relative">
        
        {/* LEFT COLUMN: ACCORDION SELECTORS */}
        <div className="lg:col-span-3 flex flex-col border-t border-slate-200/80">
          {items.map((item, index) => {
            const isActive = activeIndex === index;
            const bullets = t(item.bulletsKey, { returnObjects: true }) as string[] || [];

            return (
              <div 
                key={item.id} 
                className="w-full border-b border-slate-200/80"
              >
                {/* Header row trigger */}
                <button
                  onClick={() => setActiveIndex(index)}
                  className="flex items-center justify-between w-full text-left py-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 rounded-lg group cursor-pointer"
                >
                  <span className={cn(
                    "inline-block text-lg sm:text-xl font-bold tracking-tight group-hover:translate-x-1.5 transition-all duration-300",
                    isActive ? "text-[#0F172A]" : "text-slate-400 group-hover:text-slate-600"
                  )}>
                    {t(item.titleKey)}
                  </span>
                  <ChevronRight 
                    className={cn(
                      "w-5 h-5 transition-all duration-300 shrink-0 ml-4",
                      isActive ? "text-[#2563EB] rotate-90" : "text-slate-300 group-hover:text-slate-400"
                    )}
                  />
                </button>

                {/* Collapsible details container */}
                <AnimatePresence initial={false}>
                  {isActive && (
                    <motion.div
                      initial="collapsed"
                      animate="open"
                      exit="collapsed"
                      variants={{
                        open: { opacity: 1, height: "auto" },
                        collapsed: { opacity: 0, height: 0 }
                      }}
                      transition={{ duration: 0.35, ease: [0.04, 0.62, 0.23, 0.98] }}
                      className="overflow-hidden"
                    >
                      <div className="pb-8 pr-6">
                        {/* Description */}
                        <p className="text-base sm:text-lg text-slate-500 font-normal leading-relaxed">
                          {t(item.descKey)}
                        </p>

                        {/* Bullet Items */}
                        <ul className="mt-4 space-y-2.5">
                          {bullets.map((bullet, bIdx) => (
                            <li 
                              key={bIdx} 
                              className="flex items-center gap-2.5 text-sm sm:text-base text-slate-600 font-normal"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]/85 shrink-0" />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Mobile-only mockup */}
                        <div className="lg:hidden mt-6 w-full bg-[#F5F5F7] rounded-[24px] border border-slate-100 flex items-center justify-center p-4">
                          <VisualShowcase activeIndex={index} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: STICKY VISUAL BOARD */}
        <div className="hidden lg:block lg:col-span-2 sticky top-[20vh]">
          <div className="w-full aspect-square bg-[#F5F5F7] rounded-[32px] border border-slate-100/50 flex items-center justify-center overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]">
            <VisualShowcase activeIndex={activeIndex} />
          </div>
        </div>

      </div>
    </section>
  );
};
