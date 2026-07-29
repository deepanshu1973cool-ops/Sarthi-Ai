import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Sparkles, X } from 'lucide-react';

interface FloatingChatButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ isOpen, onClick }) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ 
        scale: 1.08,
        boxShadow: "0 20px 40px rgba(37, 99, 235, 0.35)"
      }}
      whileTap={{ scale: 0.93 }}
      className="fixed bottom-6 right-6 z-50 w-15 h-15 bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 text-white rounded-full shadow-[0_12px_36px_rgba(37,99,235,0.28)] flex items-center justify-center cursor-pointer border border-white/20 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-500/25 transition-shadow duration-300"
    >
      <div className="relative flex items-center justify-center">
        {isOpen ? (
          <motion.div
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <X className="w-6 h-6 stroke-[2.5]" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="relative flex items-center justify-center"
          >
            <MessageSquare className="w-6 h-6 stroke-[2]" />
            <Sparkles className="w-3.5 h-3.5 text-amber-300 absolute -top-2 -right-2 animate-pulse fill-current" />
          </motion.div>
        )}
      </div>
    </motion.button>
  );
};
