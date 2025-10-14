'use client';

import SkipSetupButton from './SkipSetupButton';

interface SetupNavigationProps {
  onBack: () => void;
  backText?: string;
}

export default function SetupNavigation({ onBack, backText = "Back" }: SetupNavigationProps) {
  return (
    <div className="flex items-center justify-between">
      <SkipSetupButton />
      
      <button
        onClick={onBack}
        className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
      >
        {backText}
      </button>
    </div>
  );
}
