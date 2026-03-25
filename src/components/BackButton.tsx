import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';

interface BackButtonProps {
  className?: string;
  label?: string;
  to?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'dark';
}

export const BackButton: React.FC<BackButtonProps> = ({ 
  className, 
  label = 'Back', 
  to,
  variant = 'default'
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  const variants = {
    default: "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm",
    outline: "bg-transparent text-gray-600 hover:text-black border border-gray-300",
    ghost: "bg-transparent text-gray-500 hover:text-black hover:bg-gray-100",
    dark: "bg-gray-900 text-white hover:bg-gray-800 border border-gray-800 shadow-lg"
  };

  return (
    <button
      onClick={handleBack}
      className={cn(
        "inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 group",
        variants[variant],
        className
      )}
    >
      <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
      {label}
    </button>
  );
};
