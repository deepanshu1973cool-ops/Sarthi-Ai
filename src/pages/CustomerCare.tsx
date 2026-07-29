import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  MessageSquare, 
  Users, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useTranslation } from 'react-i18next';

export const CustomerCare: React.FC = () => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Suggestion');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && message) {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setName('');
        setEmail('');
        setMessage('');
      }, 5000);
    }
  };

  return (
    <div className="w-full bg-[#F5F5F7]/70 py-12 px-6 sm:px-10 lg:px-12 font-sans text-slate-800 relative z-10 pt-28 min-h-[85vh]">
      <div className="max-w-5xl mx-auto flex flex-col gap-10">
        
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('customerCare.title')}
          </h1>
          <p className="text-sm text-slate-500 font-normal mt-1 leading-relaxed">
            {t('customerCare.desc')}
          </p>
        </div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          
          {/* Left panel: Info & FAQ links (5/12 cols) */}
          <div className="md:col-span-5 bg-white rounded-[24px] border border-slate-100 shadow-[0_12px_36px_rgba(0,0,0,0.03)] p-6 sm:p-8 flex flex-col justify-between gap-8">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#2563EB]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 tracking-tight">
                    {t('customerCare.submit')}
                  </h3>
                  <p className="text-xs text-slate-400">We respond within 24 hours</p>
                </div>
              </div>

              <p className="text-sm text-slate-500 font-normal leading-relaxed">
                {t('customerCare.descLeft')}
              </p>

              {/* Stats badges */}
              <div className="flex flex-col gap-3.5 mt-2">
                <div className="flex items-center gap-2.5 text-xs text-slate-600 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{t('customerCare.ssl')}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-600 font-semibold">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>{t('customerCare.welfareDesk')}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-600 font-semibold">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>{t('customerCare.aiRouter')}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('customerCare.directHotline')}</span>
              <a href="mailto:support@saarthi.ai" className="text-sm font-bold text-[#2563EB] hover:underline flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>support@saarthi.ai</span>
              </a>
            </div>
          </div>

          {/* Right panel: Suggestion Form (7/12 cols) */}
          <div className="md:col-span-7 bg-white rounded-[24px] border border-slate-100 shadow-[0_12px_36px_rgba(0,0,0,0.03)] p-6 sm:p-8 relative overflow-hidden flex flex-col justify-center">
            
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form 
                  key="form"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-4"
                >
                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('auth.fullName')}</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('auth.enterName')}
                      className="w-full bg-slate-50 hover:bg-slate-100/50 border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/60 transition-all duration-200"
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('auth.email')}</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-slate-50 hover:bg-slate-100/50 border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/60 transition-all duration-200"
                    />
                  </div>

                  {/* Suggestion Category */}
                  <div className="flex flex-col gap-1.5 relative">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Topic Category</label>
                    <input type="hidden" name="category" value={category} />
                    
                    <button
                      type="button"
                      onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                      className="w-full bg-slate-50 hover:bg-slate-100/50 border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 text-left focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/60 transition-all duration-200 cursor-pointer flex items-center justify-between"
                    >
                      <span>
                        {category === 'Suggestion' && 'General Suggestion'}
                        {category === 'Scheme Request' && 'Request a New Scheme'}
                        {category === 'Eligibility Issue' && 'Profile / Eligibility Bug'}
                        {category === 'Other' && 'Other Query'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>

                    {isCategoryDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsCategoryDropdownOpen(false)} />
                        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-150 rounded-xl shadow-xl p-1.5 flex flex-col gap-1">
                          {[
                            { value: 'Suggestion', label: 'General Suggestion' },
                            { value: 'Scheme Request', label: 'Request a New Scheme' },
                            { value: 'Eligibility Issue', label: 'Profile / Eligibility Bug' },
                            { value: 'Other', label: 'Other Query' }
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setCategory(opt.value);
                                setIsCategoryDropdownOpen(false);
                              }}
                              className={cn(
                                "w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer select-none active:scale-98",
                                category === opt.value
                                  ? "text-[#2563EB] bg-blue-50/50"
                                  : "text-slate-600 hover:bg-slate-50"
                              )}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Message</label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="How can we improve Saarthi?"
                      className="w-full bg-slate-50 hover:bg-slate-100/50 border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/60 transition-all duration-200 resize-none"
                    />
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    className="w-full bg-[#2563EB] hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-all cursor-pointer select-none text-sm text-center active:scale-98 shadow-sm flex items-center justify-center gap-2 mt-2"
                  >
                    <span>{t('customerCare.submit')}</span>
                    <Send className="w-3.5 h-3.5 fill-current" />
                  </button>
                </motion.form>
              ) : (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="flex flex-col items-center justify-center text-center gap-4 py-12"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shadow-sm animate-bounce">
                    <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xl text-slate-900">{t('customerCare.submitted')}</h3>
                    <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">
                      {t('customerCare.submittedThanks', { name })}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
          </div>

        </div>

      </div>
    </div>
  );
};
