'use client';

import Image from 'next/image';
import type { ProcessingDetail, MoodItem } from '@/services/songService';

interface MoodAnalyzeSectionProps {
  processingData: ProcessingDetail | null;
}

export default function MoodAnalyzeSection({ 
  processingData: _processingData
}: MoodAnalyzeSectionProps) {

  // Parse mood data - TODO: Replace with real API data when available
  // Currently using mock data
  const parseMoodData = (): MoodItem[] => {
    // TODO: Uncomment when API returns real mood data
    // const processingData = _processingData;
    // if (!processingData) return [];

    // // If mood data is already in array format (from API response)
    // if (processingData.mood && Array.isArray(processingData.mood)) {
    //   return processingData.mood;
    // }

    // // If mood is an object with multiple moods (e.g., { Proud: 40, Powerful: 25, ... })
    // if (processingData.mood && typeof processingData.mood === 'object' && !Array.isArray(processingData.mood)) {
    //   return Object.entries(processingData.mood as Record<string, number>).map(([type, percentage]) => ({
    //     type,
    //     percentage: typeof percentage === 'number' ? percentage : 0
    //   }));
    // }

    // // Fallback: if only moodType exists, use it
    // if (processingData.moodType) {
    //   return [{
    //     type: processingData.moodType,
    //     percentage: processingData.moodScore ? (processingData.moodScore <= 1 ? processingData.moodScore * 100 : processingData.moodScore) : 0
    //   }];
    // }

    // Mock data - replace with real data from API
    return [
      { type: 'Proud', percentage: 40 },
      { type: 'Powerful', percentage: 25 },
      { type: 'Happy', percentage: 30 },
      { type: 'Joyful', percentage: 5 }
    ];
  };

  const moodData = parseMoodData();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      alignSelf: 'stretch',
      borderRadius: '12px',
      background: '#FFF',
      boxShadow: '0 2px 40px -3px rgba(255, 239, 143, 0.50)'
    }}>
      {/* Header Section */}
      <div className="flex items-center gap-2 px-6 w-full" style={{ backgroundColor: '#F5F5F5', height: '70px', flexShrink: 0 }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M25.6667 12.8334V14C25.6549 16.3548 24.9308 18.6508 23.5897 20.5863C22.2486 22.5218 20.3531 24.0061 18.1526 24.8443C15.9521 25.6824 13.5494 25.835 11.2605 25.282C8.97164 24.7291 6.90364 23.4964 5.32841 21.7462C3.75317 19.9959 2.74443 17.8099 2.4348 15.4756C2.12518 13.1414 2.52915 10.768 3.59362 8.6676C4.65809 6.5672 6.33323 4.83807 8.39882 3.70752C10.4644 2.57697 12.8238 2.09793 15.1667 2.33338" stroke="#7B61FF" strokeWidth="2.33333" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9.33325 16.3335C9.33325 16.3335 11.0833 18.6668 13.9999 18.6668C16.9166 18.6668 18.6666 16.3335 18.6666 16.3335" stroke="#7B61FF" strokeWidth="2.33333" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10.5 10.5H10.5117" stroke="#7B61FF" strokeWidth="2.33333" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M17.5 10.5H17.5117" stroke="#7B61FF" strokeWidth="2.33333" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M18.6667 5.8335H25.6667" stroke="#7B61FF" strokeWidth="2.33333" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M22.1667 2.3335V9.3335" stroke="#7B61FF" strokeWidth="2.33333" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h2 className="text-xl font-semibold text-gray-900">Mood Analyze</h2>
      </div>

      {/* Content Section - 30% left, 70% right */}
      {moodData.length > 0 ? (
        <div className="flex w-full px-6 gap-6 pt-6 pb-6">
          {/* Left side - 30% - Icon */}
          <div className="flex-shrink-0" style={{ width: '30%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Image
              src="/images/songiconhappy.svg"
              alt="Mood Icon"
              width={100}
              height={100}
              className="w-full h-auto max-w-[100px]"
            />
          </div>

          {/* Right side - 70% - Mood bars */}
          <div className="flex-1" style={{ width: '70%' }}>
            <div className="space-y-4">
              {moodData.map((mood, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{mood.type}</span>
                    <span className="text-sm text-gray-600">{mood.percentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#7B61FF] h-2 rounded-full transition-all"
                      style={{ 
                        width: `${mood.percentage}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-6 px-6">
          <p className="text-gray-500 text-center">Mood analysis not available</p>
        </div>
      )}

    </div>
  );
}

