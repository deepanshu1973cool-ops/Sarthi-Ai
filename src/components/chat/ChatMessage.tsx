import React from 'react';
import { Bot, User } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div
      className={cn(
        "flex w-full items-end gap-2.5 my-3.5",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* Bot Icon on the left for AI messages */}
      {!isUser && (
        <div className="w-8.5 h-8.5 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
          <Bot className="w-4.5 h-4.5 stroke-[2]" />
        </div>
      )}

      {/* Bubble Container */}
      <div
        className={cn(
          "max-w-[76%] px-4.5 py-3 rounded-[20px] text-sm leading-relaxed shadow-[0_2px_8px_rgba(0,0,0,0.02)] break-words transition-all duration-300 font-medium",
          isUser
            ? "bg-[#2563EB] text-white rounded-br-[4px] border border-blue-500/20"
            : "bg-white border border-slate-100 text-slate-800 rounded-bl-[4px]"
        )}
      >
        <p className="whitespace-pre-line text-sm leading-relaxed">{message.text}</p>
        <span
          className={cn(
            "text-[9px] mt-1.5 block text-right tracking-wide font-semibold",
            isUser ? "text-blue-200" : "text-slate-400"
          )}
        >
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* User Icon on the right for User messages */}
      {isUser && (
        <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm border border-blue-500/20">
          <User className="w-4.5 h-4.5 stroke-[2]" />
        </div>
      )}
    </div>
  );
};
