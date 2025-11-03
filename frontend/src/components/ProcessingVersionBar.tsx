'use client';

import { Star } from 'lucide-react';

interface ProcessingVersionBarProps {
  versionNumber: number;
  processingID: string;
  rating?: number;
  onNewAnalyze?: () => void;
}

export default function ProcessingVersionBar({
  versionNumber,
  processingID,
  rating,
  onNewAnalyze
}: ProcessingVersionBarProps) {
  return (
    <div className="w-full flex items-center justify-between">
      {/* Left Side - Version Badge and Button (Centered) */}
      <div className="flex items-center gap-3">
        {/* Version Badge */}
        <div 
          className="flex flex-col justify-center items-center rounded-lg"
          style={{
            width: '26px',
            height: '26px',
            padding: '5px 9px',
            background: '#F5F5F5',
            flexShrink: 0,
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
            className="flex flex-col justify-center items-center text-white font-medium transition-colors hover:opacity-90"
            style={{
              height: '26px',
              padding: '5px 9px',
              gap: '10px',
              borderRadius: '8px',
              background: '#FEB21A'
            }}
          >
            New analyze
          </button>
        )}
      </div>

      {/* Right Side - Rating Stars and Processing ID (Same Card, Vertical) */}
      <div className="flex flex-col items-end">
        {/* Rating Stars - Top */}
        <div className="flex items-center gap-1 mb-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={star <= (rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-yellow-400'}
              style={{ 
                width: '20px', 
                height: '20px' 
              }}
            />
          ))}
        </div>

        {/* Processing ID - Below Stars */}
        <div 
          style={{
            color: 'rgba(0, 0, 0, 0.40)',
            fontFamily: 'Inter',
            fontSize: '10px',
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

