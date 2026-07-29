import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { ChatMessage, Message } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { sendChatMessage } from '../../services/aiService';
import { useTranslation } from 'react-i18next';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ isOpen, onClose }) => {
  const { i18n } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentLang = i18n.language || 'en';

  // Determine strings depending on the selected language
  const getLanguageStrings = (lang: string) => {
    switch (lang) {
      case 'hi':
        return {
          title: "सारथी सहायक",
          welcome: "नमस्ते! मैं आपका सारथी सहायक हूँ। आज मैं सरकारी योजनाओं और छात्रवृत्तियों को खोजने या आवेदन करने में आपकी क्या सहायता कर सकता हूँ?",
          placeholder: "एक सवाल पूछें...",
          error: "सारथी एआई से संपर्क करने में असमर्थ। कृपया पुनः प्रयास करें।"
        };
      case 'mr':
        return {
          title: "सारथी सहाय्यक",
          welcome: "नमस्कार! मी आपला सारथी सहाय्यक आहे. आज मी आपल्याला सरकारी योजना आणि शिष्यवृत्त्या शोधण्यात किंवा अर्ज करण्यास कशी मदत करू?",
          placeholder: "प्रश्न विचारा...",
          error: "सारथी एआयशी संपर्क साधू शकत नाही. कृपया पुन्हा प्रयत्न करा।"
        };
      default:
        return {
          title: "Saarthi Assistant",
          welcome: "Hello! I am your Saarthi Assistant. How can I help you find or apply for government schemes and scholarships today?",
          placeholder: "Ask a question...",
          error: "Unable to reach Saarthi AI. Please try again."
        };
    }
  };

  const strings = getLanguageStrings(currentLang);

  // Initialize welcoming message on mount or update its translation if language changes
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 0) {
        return [
          {
            id: 'welcome',
            sender: 'ai',
            text: strings.welcome,
            timestamp: new Date()
          }
        ];
      }
      return prev.map((msg) =>
        msg.id === 'welcome' ? { ...msg, text: strings.welcome } : msg
      );
    });
  }, [currentLang, strings.welcome]);

  // Auto-scroll to the newest message whenever message count or loading state updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const reply = await sendChatMessage(text, currentLang);
      const aiMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        sender: 'ai',
        text: reply,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        id: `msg-${Date.now()}-err`,
        sender: 'ai',
        text: strings.error,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 25 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-24 right-6 z-50 w-[365px] sm:w-[410px] h-[540px] max-h-[calc(100vh-120px)] bg-slate-50 rounded-[28px] border border-blue-500/10 shadow-[0_24px_60px_-15px_rgba(15,23,42,0.18),0_8px_32px_-8px_rgba(37,99,235,0.08)] overflow-hidden flex flex-col font-sans"
        >
          {/* Header Panel */}
          <div className="bg-gradient-to-r from-[#0F172A] via-slate-900 to-[#1E293B] text-white px-5.5 py-4.5 flex items-center justify-between shadow-sm relative shrink-0 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9.5 h-9.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white border border-blue-400/20 shadow-md">
                <Sparkles className="w-5 h-5 fill-current text-amber-300" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm tracking-tight">{strings.title}</span>
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8.5 h-8.5 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer text-slate-300 hover:text-white border border-white/5 active:scale-95 focus:outline-none"
            >
              <X className="w-4.5 h-4.5 stroke-[2.5]" />
            </button>
          </div>
 
          {/* Messages Area */}
          <div 
            className="flex-1 overflow-y-auto p-5 bg-gradient-to-b from-slate-50/30 to-white/70 flex flex-col gap-1.5 scroll-smooth"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(148, 163, 184, 0.2) transparent' }}
          >
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={scrollRef} />
          </div>
 
          {/* User Input controls */}
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isLoading}
            placeholderText={strings.placeholder}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
