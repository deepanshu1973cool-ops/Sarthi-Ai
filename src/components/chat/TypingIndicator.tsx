import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const TypingIndicator: React.FC = () => {
  const { t } = useTranslation();
  const dotVariants = {
    initial: { y: 0 },
    animate: {
      y: [0, -6, 0],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="flex w-full items-end gap-2.5 my-3.5 justify-start">
      <div className="w-8.5 h-8.5 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
        <Bot className="w-4.5 h-4.5 stroke-[2]" />
      </div>

      <div className="bg-white border border-slate-100 rounded-[20px] rounded-bl-[4px] px-4.5 py-3 flex items-center gap-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <span className="text-xs font-semibold text-slate-500 mr-1.5 select-none">{t('chat.typing')}</span>
        <motion.span
          variants={dotVariants}
          initial="initial"
          animate="animate"
          className="w-1.5 h-1.5 bg-blue-600 rounded-full"
        />
        <motion.span
          variants={dotVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.15 }}
          className="w-1.5 h-1.5 bg-blue-600 rounded-full"
        />
        <motion.span
          variants={dotVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.3 }}
          className="w-1.5 h-1.5 bg-blue-600 rounded-full"
        />
      </div>
    </div>
  );
};
