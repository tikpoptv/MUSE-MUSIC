'use client';

import { Star } from 'lucide-react';

interface ProcessingVersionBarProps {
  versionNumber: number;
  processingID: string;
  rating?: number;
  onNewAnalyze?: () => void;
  newAnalyzeLabel?: string;
}

export default function ProcessingVersionBar({
  versionNumber,
  processingID,
  rating,
  onNewAnalyze,
  newAnalyzeLabel = 'New analyze'
}: ProcessingVersionBarProps) {
  return (
    <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
      {/* Left Side - Version Badge and Button (Centered) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Version Badge */}
        <div 
          className="flex flex-col justify-center items-center rounded-lg flex-shrink-0"
          style={{
            width: '26px',
            height: '26px',
            padding: '5px 9px',
            background: '#F5F5F5',
            gap: '10px'
          }}
        >
          <span 
            className="font-semibold"
            style={{
              color: '#000',
              fontSize: '16px',
              fontWeight: 600,
              lineHeight: 'normal'
            }}
          >
            {versionNumber}
          </span>
        </div>

        {/* New Analyze Button */}
        {onNewAnalyze && (
          <button
            onClick={onNewAnalyze}
            className="flex flex-col justify-center items-center text-white font-medium transition-colors hover:opacity-90 whitespace-nowrap text-sm sm:text-base"
            style={{
              height: '26px',
              padding: '5px 9px',
              gap: '10px',
              borderRadius: '8px',
              background: '#FEB21A'
            }}
          >
            {newAnalyzeLabel}
          </button>
        )}
      </div>

      {/* Right Side - Rating Stars and Processing ID (Same Card, Vertical) */}
      <div className="flex flex-col items-start sm:items-end w-full sm:w-auto">
        {/* Rating Stars - Top */}
        <div className="flex items-center gap-0.5 sm:gap-1 mb-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`${star <= (rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-yellow-400'} w-4 h-4 sm:w-5 sm:h-5`}
            />
          ))}
        </div>

        {/* Processing ID - Below Stars */}
        <div 
          className="text-xs sm:text-[10px] break-all sm:break-normal text-left sm:text-right"
          style={{
            color: 'rgba(0, 0, 0, 0.40)',
            fontFamily: 'Inter',
            fontStyle: 'normal',
            fontWeight: 300,
            lineHeight: 'normal'
          }}
        >
          ({processingID})
        </div>
      </div>
    </div>
  );
}

