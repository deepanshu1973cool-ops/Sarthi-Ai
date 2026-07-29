import React from 'react';
import logoImg from '../../assets/logo.png';
import { cn } from '../../utils/cn';
import { useTranslation } from 'react-i18next';

interface LogoProps {
  className?: string;
  showTagline?: boolean;
  theme?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  showTagline = false,
  theme = 'light'
}) => {
  const { t } = useTranslation();
  const isDarkTheme = theme === 'dark';

  return (
    <div className={cn("flex items-center gap-1 select-none group cursor-pointer", className)}>
      {/* Exact Saarthi S-Arrow Icon image - slightly bigger */}
      <div className="relative w-[40px] h-[40px] sm:w-[48px] sm:h-[48px] flex items-center justify-center transition-transform duration-200 group-hover:scale-[1.03] overflow-hidden rounded-lg">
        <img
          src={logoImg}
          alt="Saarthi AI Logo"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Brand Typography - slightly bigger */}
      <div className="flex flex-col">
        <div className="flex items-center leading-none tracking-tight">
          <span className={cn(
            "font-bold text-2xl sm:text-[28px]",
            isDarkTheme ? "text-white" : "text-[#0F172A]"
          )}>
            Saarthi
          </span>
          <span className={cn(
            "font-normal text-2xl sm:text-[28px] ml-1.5",
            isDarkTheme ? "text-slate-200" : "text-[#0F172A]"
          )}>
            AI
          </span>
        </div>
        {showTagline && (
          <span className={cn(
            "text-[10.5px] font-medium tracking-wider uppercase mt-1",
            isDarkTheme ? "text-slate-400" : "text-slate-500"
          )}>
            {t('common.tagline') || 'Government Benefits. Made Simple.'}
          </span>
        )}
      </div>
    </div>
  );
};
