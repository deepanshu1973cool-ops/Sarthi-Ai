import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

interface AccordionItem {
  id: string;
  title: string;
  description: string;
  bullets: string[];
}

const STEPS: AccordionItem[] = [
  {
    id: '01',
    title: '01. Create Your Profile.',
    description: 'Tell us about yourself once and let Saarthi do the rest.',
    bullets: [
      'Age & State',
      'Education & Occupation',
      'Income & Category'
    ]
  },
  {
    id: '02',
    title: '02. Check Your Eligibility.',
    description: 'We automatically match opportunities based on your profile.',
    bullets: [
      'Personalized Eligibility Checks',
      'Instant Matching',
      'No Manual Searching'
    ]
  },
  {
    id: '03',
    title: '03. Discover Opportunities.',
    description: 'Explore benefits curated exclusively for you.',
    bullets: [
      'Scholarships',
      'Government Schemes',
      'Startup Benefits'
    ]
  },
  {
    id: '04',
    title: '04. Apply With Confidence.',
    description: 'Everything you need before submitting your application.',
    bullets: [
      'Required Documents',
      'Application Guidelines',
      'Official Sources'
    ]
  },
  {
    id: '05',
    title: '05. Track Deadlines.',
    description: 'Stay informed and never miss an opportunity.',
    bullets: [
      'Deadline Tracking',
      'Opportunity Alerts',
      'Real-time Notifications'
    ]
  }
];

export const HowItWorks: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // Open the first item by default

  const toggleItem = (index: number) => {
    setOpenIndex(prevIndex => prevIndex === index ? null : index);
  };

  return (
    <section id="how-it-works" className="w-full bg-white text-[#0F172A] pt-8 pb-10 sm:pt-12 sm:pb-12 relative overflow-hidden font-sans border-t border-slate-100/50">
      {/* SECTION HEADER */}
      <div className="max-w-4xl mx-auto text-center px-6 mb-16 sm:mb-20 flex flex-col items-center gap-2.5">
        <span className="text-xs sm:text-sm font-semibold tracking-[0.2em] text-[#2563EB] uppercase">
          Application Path
        </span>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] tracking-tight leading-[1.1]">
          How Saarthi Works<span className="text-[#2563EB] drop-shadow-[0_2px_8px_rgba(37,99,235,0.45)]">.</span>
        </h2>
        <p className="text-base sm:text-lg text-slate-500 font-normal leading-relaxed mt-1">
          Simple. Personalized. Effortless.
        </p>
      </div>

      {/* ACCORDION CONTAINER */}
      <div className="max-w-3xl mx-auto px-6 flex flex-col border-t border-slate-200/80">
        {STEPS.map((step, index) => {
          const isOpen = openIndex === index;

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
                  {step.title}
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
                        {step.description}
                      </p>

                      {/* Bullet Items */}
                      <ul className="mt-4 space-y-2.5">
                        {step.bullets.map((bullet, bIdx) => (
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
