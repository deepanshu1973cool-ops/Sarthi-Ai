import React, { useState } from 'react';
import { Logo } from '../shared/Logo';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  Mail, 
  Send 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface FooterProps {
  onTabChange?: (tabId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onTabChange }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      alert(`Subscribed ${email} to Saarthi updates!`);
      setEmail('');
    }
  };

  const handleLinkClick = (tabId: string, elementId: string, e: React.MouseEvent) => {
    if (onTabChange) {
      e.preventDefault();
      onTabChange(tabId);
      setTimeout(() => {
        if (elementId === '#explore') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          const element = document.querySelector(elementId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }, 180);
    }
  };

  return (
    <footer className="w-full bg-[#0B0F19] text-slate-400 border-t border-slate-900 py-10 sm:py-14 font-sans">
      <div className="max-w-6xl mx-auto px-6 flex flex-col gap-8 sm:gap-10">
        
        {/* FOUR-COLUMN CONTENT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          
          {/* Column 1: Brand Info & Socials */}
          <div className="flex flex-col gap-6 items-start">
            <Logo showTagline={false} theme="dark" />
            <p className="text-sm text-slate-400 font-normal leading-relaxed max-w-[240px]">
              {t('footer.brandDesc')}
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-5 mt-2">
              <a href="#" className="text-slate-500 hover:text-white transition-colors duration-200">
                <Facebook className="w-5 h-5 stroke-[1.75]" />
              </a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors duration-200">
                <Instagram className="w-5 h-5 stroke-[1.75]" />
              </a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors duration-200">
                <Twitter className="w-5 h-5 stroke-[1.75]" />
              </a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors duration-200">
                <Youtube className="w-5 h-5 stroke-[1.75]" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-6">
            <h4 className="font-bold text-white tracking-tight text-base">
              {t('footer.quickLinks')}
            </h4>
            <ul className="flex flex-col gap-3.5">
              <li>
                <a 
                  href="#explore" 
                  onClick={(e) => handleLinkClick('explore', '#explore', e)}
                  className="text-sm hover:text-white transition-colors duration-200"
                >
                  {t('opportunities.title')}
                </a>
              </li>
              <li>
                <a 
                  href="#how-it-works" 
                  onClick={(e) => handleLinkClick('how-it-works', '#how-it-works', e)}
                  className="text-sm hover:text-white transition-colors duration-200"
                >
                  {t('howItWorks.title')}
                </a>
              </li>
              <li>
                <a 
                  href="#features" 
                  onClick={(e) => handleLinkClick('explore', '#features', e)}
                  className="text-sm hover:text-white transition-colors duration-200"
                >
                  {t('features.title')}
                </a>
              </li>
              <li>
                <a 
                  href="#why-saarthi" 
                  onClick={(e) => handleLinkClick('explore', '#why-saarthi', e)}
                  className="text-sm hover:text-white transition-colors duration-200"
                >
                  {t('whySaarthi.title')}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div className="flex flex-col gap-6">
            <h4 className="font-bold text-white tracking-tight text-base">
              {t('footer.customerCare')}
            </h4>
            <ul className="flex flex-col gap-3.5">
              <li>
                <a 
                  href="#customer-care" 
                  onClick={(e) => handleLinkClick('customer-care', '#customer-care', e)}
                  className="text-sm hover:text-white transition-colors duration-200"
                >
                  {t('customerCare.title')}
                </a>
              </li>
              <li>
                <a 
                  href="#customer-care" 
                  onClick={(e) => handleLinkClick('customer-care', '#customer-care', e)}
                  className="text-sm hover:text-white transition-colors duration-200"
                >
                  FAQs &amp; Support
                </a>
              </li>
              <li>
                <a 
                  href="#customer-care" 
                  onClick={(e) => handleLinkClick('customer-care', '#customer-care', e)}
                  className="text-sm hover:text-white transition-colors duration-200"
                >
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Stay Connected & Newsletter */}
          <div className="flex flex-col gap-6">
            <h4 className="font-bold text-white tracking-tight text-base">
              {t('footer.stayConnected')}
            </h4>
            <p className="text-sm text-slate-400 font-normal leading-relaxed">
              {t('footer.newsletter')}
            </p>
            
            {/* Email form */}
            <form onSubmit={handleSubscribe} className="flex gap-2.5 w-full max-w-[280px]">
              <input
                type="email"
                required
                placeholder={t('footer.placeholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-slate-900/60 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder:text-slate-500"
              />
              <button
                type="submit"
                className="bg-[#2563EB] hover:bg-blue-600 text-white rounded-lg p-2.5 flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 fill-current" />
              </button>
            </form>

            {/* Support Mail link */}
            <a 
              href="mailto:support@saarthi.ai" 
              className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-white transition-colors mt-2"
            >
              <Mail className="w-4 h-4 text-slate-500" />
              <span>support@saarthi.ai</span>
            </a>
          </div>

        </div>

        {/* BOTTOM CENTER BLOCK */}
        <div className="flex flex-col items-center justify-center gap-3 border-t border-slate-900 pt-8 text-center">
          <p className="text-xs text-slate-500 font-normal">
            &copy; {new Date().getFullYear()} Saarthi AI. All rights reserved.
          </p>
          <div className="flex items-center gap-2.5 text-xs text-slate-500">
            <a href="#" className="hover:text-slate-350 transition-colors duration-250">
              {t('footer.privacy')}
            </a>
            <span>|</span>
            <a href="#" className="hover:text-slate-350 transition-colors duration-250">
              {t('footer.terms')}
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
