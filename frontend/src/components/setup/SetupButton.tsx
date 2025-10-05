'use client';

import { ReactNode } from 'react';

interface SetupButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'gradient';
}

export default function SetupButton({ 
  onClick, 
  disabled = false, 
  children, 
  className = "",
  variant = 'primary'
}: SetupButtonProps) {
  const baseClasses = "w-full px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2";
  
  const variantClasses = {
    primary: disabled 
      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
      : 'bg-[#7B61FF] hover:bg-[#6B51EF] text-white cursor-pointer',
    gradient: disabled
      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
      : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
