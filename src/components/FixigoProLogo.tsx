import React from 'react';
import { Wrench } from 'lucide-react';
import { cn } from '../lib/utils';

interface FixigoProLogoProps {
  className?: string;
  theme?: 'light' | 'dark';
}

export const FixigoProLogo: React.FC<FixigoProLogoProps> = ({ className, theme = 'light' }) => {
  const isDark = theme === 'dark';
  
  return (
    <div className={cn("flex items-center gap-2.5 group select-none", className)}>
      <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform duration-300">
        <Wrench className="w-5 h-5 text-white transform -rotate-45" strokeWidth={2.5} />
        <div className={cn(
          "absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-orange-500 rounded-full border-2",
          isDark ? "border-gray-900" : "border-white"
        )} />
      </div>
      <div className="flex flex-col justify-center">
        <span className={cn(
          "text-2xl font-black tracking-tight leading-none",
          isDark ? "text-white" : "text-slate-900"
        )}>
          Fixigo<span className="text-blue-600">Pro</span>
        </span>
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-widest mt-0.5",
          isDark ? "text-slate-400" : "text-slate-500"
        )}>
          Provider Dashboard
        </span>
      </div>
    </div>
  );
};
