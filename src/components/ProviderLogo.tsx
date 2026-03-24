import React from 'react';
import { HardHat } from 'lucide-react';
import { cn } from '../lib/utils';

interface ProviderLogoProps {
  className?: string;
  theme?: 'light' | 'dark';
}

export const ProviderLogo: React.FC<ProviderLogoProps> = ({ className, theme = 'light' }) => {
  const isDark = theme === 'dark';
  
  return (
    <div className={cn("flex items-center gap-2.5 group select-none", className)}>
      <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-700 shadow-lg shadow-yellow-600/20 group-hover:scale-105 transition-transform duration-300">
        <HardHat className="w-5 h-5 text-black" strokeWidth={2.5} />
        <div className={cn(
          "absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-blue-500 rounded-full border-2",
          isDark ? "border-gray-900" : "border-white"
        )} />
      </div>
      <div className="flex flex-col justify-center">
        <span className={cn(
          "text-2xl font-black tracking-tight leading-none",
          isDark ? "text-white" : "text-slate-900"
        )}>
          Fixi<span className="text-yellow-600">Go</span>
        </span>
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-widest mt-0.5",
          isDark ? "text-slate-400" : "text-slate-500"
        )}>
          Partner Dashboard
        </span>
      </div>
    </div>
  );
};
