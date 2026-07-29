import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useTranslation } from 'react-i18next';

interface StepItem {
  id: string;
  titleKey: string;
  descKey: string;
  bulletsKey: string;
}

export const HowItWorks: React.FC = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(0); // Open the first item by default

  const toggleItem = (index: number) => {
    setOpenIndex(prevIndex => prevIndex === index ? null : index);
  };

  const steps: StepItem[] = [
    {
      id: '01',
      titleKey: 'howItWorks.steps.step1.title',
      descKey: 'howItWorks.steps.step1.desc',
      bulletsKey: 'howItWorks.steps.step1.bullets'
    },
    {
      id: '02',
      titleKey: 'howItWorks.steps.step2.title',
      descKey: 'howItWorks.steps.step2.desc',
      bulletsKey: 'howItWorks.steps.step2.bullets'
    },
    {
      id: '03',
      titleKey: 'howItWorks.steps.step3.title',
      descKey: 'howItWorks.steps.step3.desc',
      bulletsKey: 'howItWorks.steps.step3.bullets'
    },
    {
      id: '04',
      titleKey: 'howItWorks.steps.step4.title',
      descKey: 'howItWorks.steps.step4.desc',
      bulletsKey: 'howItWorks.steps.step4.bullets'
    },
    {
      id: '05',
      titleKey: 'howItWorks.steps.step5.title',
      descKey: 'howItWorks.steps.step5.desc',
      bulletsKey: 'howItWorks.steps.step5.bullets'
    }
  ];

  return (
    <section id="how-it-works" className="w-full bg-white text-[#0F172A] pt-8 pb-10 sm:pt-12 sm:pb-12 relative overflow-hidden font-sans border-t border-slate-100/50">
      {/* SECTION HEADER */}
      <div className="max-w-4xl mx-auto text-center px-6 mb-16 sm:mb-20 flex flex-col items-center gap-2.5">
        <span className="text-xs sm:text-sm font-semibold tracking-[0.2em] text-[#2563EB] uppercase">
          {t('howItWorks.label')}
        </span>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] tracking-tight leading-[1.1]">
          {t('howItWorks.title')}<span className="text-[#2563EB] drop-shadow-[0_2px_8px_rgba(37,99,235,0.45)]">.</span>
        </h2>
        <p className="text-base sm:text-lg text-slate-500 font-normal leading-relaxed mt-1">
          {t('howItWorks.subtitle')}
        </p>
      </div>

      {/* ACCORDION CONTAINER */}
      <div className="max-w-3xl mx-auto px-6 flex flex-col border-t border-slate-200/80">
        {steps.map((step, index) => {
          const isOpen = openIndex === index;
          const bullets = t(step.bulletsKey, { returnObjects: true }) as string[] || [];

          return (
            <div
              key={step.id}
              className="w-full border-b border-slate-200/80"
            >
              {/* Accordion Trigger Header */}
              <button
                onClick={() => toggleItem(index)}
                className="flex items-center justify-between w-full text-left py-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 rounded-lg group cursor-pointer"
              >
                <span className="inline-block text-xl font-bold text-[#0F172A] tracking-tight group-hover:text-[#2563EB] group-hover:translate-x-1.5 transition-all duration-300">
                  {t(step.titleKey)}
                </span>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 text-slate-400 transition-transform duration-300 ease-in-out shrink-0 ml-4 group-hover:text-slate-600",
                    isOpen && "rotate-180 text-[#2563EB] group-hover:text-[#2563EB]"
                  )}
                />
              </button>

              {/* Accordion Expandable Content Wrapper */}
              <AnimatePresence initial={false}>
                {isOpen && (
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
                    <div className="pb-8 pr-6 flex flex-col items-start">
                      {/* Description */}
                      <p className="text-base sm:text-lg text-slate-500 font-normal leading-relaxed">
                        {t(step.descKey)}
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
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
};
