import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, ChevronDown } from 'lucide-react';
import { Logo } from '../shared/Logo';
import { useTranslation } from 'react-i18next';

export interface NavItem {
  id: string;
  labelKey: string;
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
  { id: 'explore', labelKey: 'navbar.explore', href: '#explore' },
  { id: 'how-it-works', labelKey: 'navbar.howItWorks', href: '#how-it-works' },
  { id: 'dashboard', labelKey: 'navbar.dashboard', href: '#dashboard' },
  { id: 'customer-care', labelKey: 'navbar.customerCare', href: '#customer-care' },
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
  const { t, i18n } = useTranslation();
  const [internalActiveTab, setInternalActiveTab] = useState<string>('explore');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);

  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    };

    if (langDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [langDropdownOpen]);

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

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setLangDropdownOpen(false);
  };

  const translatedCtaText = 
    ctaText === 'Dashboard' 
      ? t('common.buttons.dashboard') 
      : ctaText === 'Login' 
      ? t('common.buttons.login') 
      : ctaText === 'Get Started' 
      ? t('common.buttons.getStarted') 
      : ctaText;

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
        <div className="w-full px-6 sm:px-12 h-[76px] flex items-center justify-between">
          
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

                    <span className="relative z-10">{t(item.labelKey)}</span>
                  </a>
                );
              })}
            </motion.nav>
          </div>

          {/* RIGHT CTA & MOBILE TOGGLE - FAR RIGHT CORNER */}
          <div className="flex-1 flex items-center justify-end gap-5">
            <div className="hidden md:flex items-center gap-5">
              
              {/* Language Switcher Dropdown */}
              <div ref={langRef} className="relative">
                <button
                  type="button"
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="h-10 flex items-center justify-center gap-1.5 px-4.5 rounded-full text-xs font-bold text-slate-800 hover:text-blue-600 bg-white hover:bg-slate-50 border border-slate-300 hover:border-blue-500/40 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(37,99,235,0.06)] hover:-translate-y-0.5 transition-all duration-300 ease-out select-none cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    {i18n.language === 'hi' ? 'हिन्दी' : i18n.language === 'mr' ? 'मराठी' : 'English'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
 
                <AnimatePresence>
                  {langDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute right-0 mt-2 z-50 w-32 bg-white rounded-xl border border-slate-200/80 shadow-lg p-1.5 flex flex-col gap-0.5"
                    >
                      {[
                        { code: 'en', label: 'English' },
                        { code: 'hi', label: 'हिन्दी' },
                        { code: 'mr', label: 'मराठी' }
                      ].map((lang) => (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => changeLanguage(lang.code)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer hover:bg-slate-50 ${
                            i18n.language === lang.code ? 'text-blue-600 bg-blue-50/50' : 'text-slate-600'
                          }`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
 
              {user ? (
                <div className="h-10 flex items-center justify-center gap-3 bg-white border border-slate-200/80 hover:border-blue-200 rounded-full pl-3 pr-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(37,99,235,0.08)] hover:-translate-y-0.5 transition-all duration-300 ease-out">
                  {user.picture ? (
                    <img src={user.picture} alt={user.name} className="w-6 h-6 rounded-full border border-slate-100 shadow-xs transition-transform duration-300 hover:scale-105" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#2563EB] to-blue-500 text-white flex items-center justify-center font-black text-xs select-none shadow-sm transition-transform duration-300 hover:scale-105">
                      {user.name[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-bold text-slate-700 select-none tracking-tight">{user.name.split(' ')[0]}</span>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="text-[10px] font-black uppercase text-slate-400 hover:text-rose-600 hover:scale-105 transition-all border-l border-slate-200 pl-3 ml-0.5 cursor-pointer focus:outline-none active:scale-95"
                  >
                    {t('common.buttons.logout')}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onCtaClick}
                  className="h-10 flex items-center justify-center px-6 rounded-full text-xs font-bold text-white bg-black hover:bg-slate-900 transition-all duration-300 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 shadow-[0_4px_12px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.22)] hover:-translate-y-0.5"
                >
                  {translatedCtaText}
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
                      <span>{t(item.labelKey)}</span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      )}
                    </a>
                  );
                })}

                {/* Mobile Language Selector */}
                <div className="flex flex-col gap-1.5 mt-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" /> Select Language / भाषा निवडा / भाषा चुनें
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { code: 'en', label: 'English' },
                      { code: 'hi', label: 'हिन्दी' },
                      { code: 'mr', label: 'मराठी' }
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          changeLanguage(lang.code);
                          setMobileMenuOpen(false);
                        }}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          i18n.language === lang.code
                            ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>

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
                        {t('navbar.logoutSession')}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (onCtaClick) onCtaClick();
                      }}
                      className="w-full py-3.5 rounded-full text-sm font-bold text-white bg-black hover:bg-slate-900 transition-all flex items-center justify-center cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.1)] active:scale-98"
                    >
                      {translatedCtaText}
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
