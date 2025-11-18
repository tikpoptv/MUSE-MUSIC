'use client';

import { useState } from 'react';

interface SetupNotificationProps {
  onSetup: () => void;
  onDismiss: () => void;
}

export default function SetupNotification({ onSetup, onDismiss }: SetupNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleSetup = () => {
    setIsVisible(false);
    onSetup();
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-xl shadow-lg p-4 max-w-sm z-50">
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-[#7B61FF] rounded-full flex items-center justify-center flex-shrink-0">
          <svg 
            className="w-4 h-4 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">
            Setup Incomplete
          </h3>
          <p className="text-xs text-gray-600 mb-3">
            Complete your setup to get personalized music recommendations.
          </p>
          
          <div className="flex space-x-2">
            <button
              onClick={handleSetup}
              className="text-xs bg-[#7B61FF] hover:bg-[#6B51EF] text-white px-3 py-1 rounded-lg transition-colors duration-200"
            >
              Complete Setup
            </button>
            <button
              onClick={handleDismiss}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 transition-colors duration-200"
            >
              Dismiss
            </button>
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
