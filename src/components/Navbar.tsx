import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Logo } from './Logo';

export interface NavItem {
  id: string;
  label: string;
  href: string;
}

export interface NavbarProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  ctaText?: string;
  onCtaClick?: () => void;
  user?: { name: string; email: string; picture?: string } | null;
  onLogout?: () => void;
  className?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'explore', label: 'Explore', href: '#explore' },
  { id: 'how-it-works', label: 'How It Works', href: '#how-it-works' },
  { id: 'dashboard', label: 'Dashboard', href: '#dashboard' },
  { id: 'customer-care', label: 'Customer Care', href: '#customer-care' },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab: externalActiveTab,
  onTabChange,
  ctaText = 'Get Started',
  onCtaClick,
  user,
  onLogout,
  className = '',
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<string>('explore');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);

  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const handleNavClick = (id: string, href: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (onTabChange) {
      onTabChange(id);
    } else {
      setInternalActiveTab(id);
      if (id === 'explore') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* FULL WIDTH SEAMLESS NAVBAR */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 border-b ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-md border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]' 
            : 'bg-white/20 backdrop-blur-sm border-transparent'
        } ${className}`}
      >
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 h-[68px] flex items-center justify-between">
          
          {/* LOGO - FAR LEFT CORNER */}
          <div className="flex-1 flex items-center justify-start">
            <a
              href="#"
              onClick={(e) => handleNavClick('explore', '#explore', e)}
              aria-label="Saarthi AI Homepage"
              className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 p-1 -m-1"
            >
              <Logo />
            </a>
          </div>

          {/* CENTER FLOATING NAVIGATION MENU - DEAD CENTERED */}
          <div className="flex-none flex items-center justify-center">
            <motion.nav
              layoutRoot
              className="hidden md:flex items-center gap-1 p-1.5 rounded-full bg-[#F4F4F5] border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] relative z-20"
              aria-label="Main Navigation"
            >
              {NAV_ITEMS.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={(e) => handleNavClick(item.id, item.href, e)}
                    className={`relative px-5 py-2 text-xs sm:text-sm font-semibold transition-colors duration-200 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded-full ${
                      isActive
                        ? 'text-white'
                        : 'text-[#52525B] hover:text-[#0F172A]'
                    }`}
                  >
                    {/* Active Dark Capsule Highlight */}
                    {isActive && (
                      <motion.div
                        layoutId="active-pill-dark"
                        className="absolute inset-0 bg-[#18181B] rounded-full shadow-xs"
                        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      />
                    )}

                    <span className="relative z-10">{item.label}</span>
                  </a>
                );
              })}
            </motion.nav>
          </div>

          {/* RIGHT CTA & MOBILE TOGGLE - FAR RIGHT CORNER */}
          <div className="flex-1 flex items-center justify-end gap-3">
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/60 rounded-full pl-3 pr-2.5 py-1">
                  {user.picture ? (
                    <img src={user.picture} alt={user.name} className="w-5.5 h-5.5 rounded-full border border-slate-200" />
                  ) : (
                    <div className="w-5.5 h-5.5 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs select-none">
                      {user.name[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-bold text-slate-700">{user.name.split(' ')[0]}</span>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="text-[10px] font-extrabold uppercase text-slate-400 hover:text-rose-600 transition-colors border-l border-slate-200 pl-2.5 ml-0.5 cursor-pointer focus:outline-none"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onCtaClick}
                  className="px-5 py-2.5 sm:px-6 sm:py-2.5 rounded-full text-sm sm:text-base font-semibold text-white bg-[#0F172A] hover:bg-black transition-all duration-200 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  {ctaText}
                </button>
              )}
            </div>

            {/* MOBILE MENU TOGGLE */}
            <div className="flex md:hidden items-center">
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-[#0F172A] bg-[#F2F3F5] border border-slate-200/60 active:scale-95 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE NAVIGATION DRAWER */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="md:hidden mx-4 my-2 bg-white/95 backdrop-blur-2xl rounded-2xl border border-slate-200/80 p-4 shadow-xl overflow-hidden"
            >
              <div className="flex flex-col gap-1.5">
                {NAV_ITEMS.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <a
                      key={item.id}
                      href={item.href}
                      onClick={(e) => handleNavClick(item.id, item.href, e)}
                      className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all ${
                        isActive
                          ? 'bg-[#F2F3F5] text-[#0F172A] font-bold'
                          : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      )}
                    </a>
                  );
                })}

                <div className="pt-2 mt-1 border-t border-slate-100">
                  {user ? (
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-center gap-2.5 px-3 py-1">
                        {user.picture ? (
                          <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border border-slate-250" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm select-none">
                            {user.name[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 leading-none">{user.name}</h4>
                          <span className="text-[10px] text-slate-400 mt-0.5 inline-block">{user.email}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          if (onLogout) onLogout();
                        }}
                        className="w-full py-3 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors flex items-center justify-center cursor-pointer"
                      >
                        Logout Session
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (onCtaClick) onCtaClick();
                      }}
                      className="w-full py-3 rounded-full text-sm font-semibold text-white bg-[#0F172A] hover:bg-black transition-all flex items-center justify-center cursor-pointer"
                    >
                      {ctaText}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
};
