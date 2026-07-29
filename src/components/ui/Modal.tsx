import React, { useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  headerExtra?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  headerExtra,
  footer,
  children,
  className
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(isOpen);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const motionProps = useMemo(() => {
    if (prefersReducedMotion) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.15 }
      };
    }
    return {
      initial: { opacity: 0, scale: 0.97, y: 10 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.97, y: 10 },
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
    };
  }, [prefersReducedMotion]);

  // Focus trap and auto-focus close button or first focusable element
  useEffect(() => {
    if (isOpen) {
      const focusableElementsString = 'button, [href], input, select, textarea, [tabindex="0"]';
      const modalElement = modalRef.current;
      if (!modalElement) return;

      const firstFocusableElement = modalElement.querySelector(focusableElementsString) as HTMLElement;
      if (firstFocusableElement) {
        setTimeout(() => firstFocusableElement.focus(), 50);
      }

      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;
        const focusableContent = modalElement.querySelectorAll(focusableElementsString);
        if (focusableContent.length === 0) return;
        
        const first = focusableContent[0] as HTMLElement;
        const last = focusableContent[focusableContent.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      };

      window.addEventListener('keydown', handleTab);
      return () => {
        window.removeEventListener('keydown', handleTab);
      };
    }
  }, [isOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 select-none">
          {/* Backdrop Overlay with Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/30 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            {...motionProps}
            className={cn(
              "relative bg-white border border-slate-200/50 shadow-[0_24px_64px_rgba(15,23,42,0.12),0_8px_24px_rgba(15,23,42,0.06)] flex flex-col w-[95%] sm:w-[90%] md:w-full md:max-w-[500px] h-auto max-h-[80vh] rounded-[16px] sm:rounded-[20px] overflow-hidden z-10 font-sans select-text",
              className
            )}
          >

            {/* Sticky Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100/60 sticky top-0 z-20 bg-white/90 backdrop-blur-md shrink-0">
              <div className="flex-1 min-w-0 pr-3">
                {title}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {headerExtra}
                <button
                  onClick={onClose}
                  aria-label="Close modal"
                  className="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-700 hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Scrollable Body Content */}
            <div className="overflow-y-auto overscroll-contain px-5 py-4 flex-1 modal-scrollbar bg-white">
              {children}
            </div>

            {/* Sticky Footer */}
            {footer && (
              <div className="px-5 py-3 border-t border-slate-100/60 sticky bottom-0 z-20 bg-white/90 backdrop-blur-md flex items-center justify-end gap-2.5 shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
