import { useEffect } from 'react';

let lockCount = 0;

export const useBodyScrollLock = (isOpen: boolean) => {
  useEffect(() => {
    if (!isOpen) return;

    lockCount++;
    
    let preventDefaultTouch: (e: TouchEvent) => void;

    if (lockCount === 1) {
      // Calculate scrollbar width to prevent horizontal layout jumping
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Set overflow styles
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        const header = document.querySelector('header');
        if (header) {
          header.style.paddingRight = `${scrollbarWidth}px`;
        }
      }

      // Prevent background touch scrolling on mobile iOS devices
      preventDefaultTouch = (e: TouchEvent) => {
        const target = e.target as HTMLElement;
        if (target && !target.closest('[role="dialog"]') && !target.closest('.modal-scrollbar') && !target.closest('.overflow-y-auto')) {
          if (e.cancelable) {
            e.preventDefault();
          }
        }
      };

      document.addEventListener('touchmove', preventDefaultTouch, { passive: false });

      // Save restore handler
      (document as any)._restoreScrollLock = () => {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        
        const header = document.querySelector('header');
        if (header) {
          header.style.paddingRight = '';
        }

        if (preventDefaultTouch) {
          document.removeEventListener('touchmove', preventDefaultTouch);
        }
      };
    }

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0 && (document as any)._restoreScrollLock) {
        (document as any)._restoreScrollLock();
        delete (document as any)._restoreScrollLock;
      }
    };
  }, [isOpen]);
};
