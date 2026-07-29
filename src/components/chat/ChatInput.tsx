import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  disabled: boolean;
  placeholderText?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled, placeholderText = "Type your query here..." }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSendMessage(text.trim());
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-slate-100 p-4 bg-white/95 backdrop-blur-md flex items-center gap-2.5 shrink-0">
      <div className="flex-1 h-10.5 bg-slate-50/80 border border-slate-200/60 rounded-2xl px-4 flex items-center transition-all duration-200 focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:bg-white">
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholderText}
          className="w-full bg-transparent text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none resize-none min-h-[20px] max-h-[20px] leading-[20px]"
          style={{ height: '20px' }}
        />
      </div>
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className={cn(
          "w-10.5 h-10.5 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer disabled:cursor-not-allowed shrink-0 shadow-sm",
          text.trim() && !disabled
            ? "bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white active:scale-95 shadow-md shadow-blue-500/10"
            : "bg-slate-100 text-slate-400"
        )}
      >
        <Send className="w-4 h-4 fill-current" />
      </button>
    </form>
  );
};
