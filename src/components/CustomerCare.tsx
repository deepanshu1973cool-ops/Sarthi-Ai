import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  MessageSquare, 
  Users, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const CustomerCare: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Suggestion');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

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
            Customer Care
          </h1>
          <p className="text-sm text-slate-500 font-normal mt-1 leading-relaxed">
            Send us your suggestions, report issues, or query eligibility guidelines directly.
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
                    Submit Suggestions
                  </h3>
                  <p className="text-xs text-slate-400">We respond within 24 hours</p>
                </div>
              </div>

              <p className="text-sm text-slate-500 font-normal leading-relaxed">
                Your feedback helps us refine Saarthi's opportunity matching algorithms. Share your experience or request benefits not currently listed.
              </p>

              {/* Stats badges */}
              <div className="flex flex-col gap-3.5 mt-2">
                <div className="flex items-center gap-2.5 text-xs text-slate-600 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Secure SSL Encryption</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-600 font-semibold">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>Dedicated Welfare Desk Support</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-600 font-semibold">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>AI Smart Ticket Router</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Direct Hotline</span>
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
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full bg-slate-50 hover:bg-slate-100/50 border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/60 transition-all duration-200"
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
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
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Topic Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-50 hover:bg-slate-100/50 border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/60 transition-all duration-200 cursor-pointer"
                    >
                      <option value="Suggestion">General Suggestion</option>
                      <option value="Scheme Request">Request a New Scheme</option>
                      <option value="Eligibility Issue">Profile / Eligibility Bug</option>
                      <option value="Other">Other Query</option>
                    </select>
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
                    <span>Submit Suggestion</span>
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
                    <h3 className="font-extrabold text-xl text-slate-900">Suggestion Submitted!</h3>
                    <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">
                      Thank you for your valuable feedback, <span className="font-semibold text-slate-700">{name}</span>. Our desk team has routed this ticket and will review it immediately.
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
