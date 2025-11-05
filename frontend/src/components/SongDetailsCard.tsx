'use client';

import { useState, useEffect } from 'react';
import type { SongDetail, ProcessingDetail } from '@/services/songService';

// Map language to country code
const languageToCountry: Record<string, string> = {
  'Thai': 'th',
  'English': 'us',
  'Japanese': 'jp',
  'Korean': 'kr'
};

interface SongDetailsCardProps {
  songData: SongDetail | null;
  processingData: ProcessingDetail | null;
  onSongNameEnglishChange?: (value: string) => void;
  onCountryChange?: (value: string) => void;
}

export default function SongDetailsCard({ 
  songData, 
  processingData,
  onSongNameEnglishChange,
  onCountryChange
}: SongDetailsCardProps) {
  const [songNameEnglish, setSongNameEnglish] = useState(songData?.songNameEnglish || '');
  const [country, setCountry] = useState(songData?.country || '');

  const currentLanguage = processingData?.originalLanguage || songData?.language || '';

  useEffect(() => {
    setSongNameEnglish(songData?.songNameEnglish || '');
    
    // Auto-set country based on language if country is not set
    if (currentLanguage && languageToCountry[currentLanguage]) {
      const mappedCountry = languageToCountry[currentLanguage];
      // Only auto-set if country is empty or matches the mapped country
      if (!songData?.country || songData.country === mappedCountry) {
        setCountry(mappedCountry);
        if (onCountryChange) {
          onCountryChange(mappedCountry);
        }
      } else {
        setCountry(songData.country);
      }
    } else {
      setCountry(songData?.country || '');
    }
  }, [songData, currentLanguage, onCountryChange]);

  const handleSongNameEnglishChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSongNameEnglish(value);
    if (onSongNameEnglishChange) {
      onSongNameEnglishChange(value);
    }
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCountry(value);
    if (onCountryChange) {
      onCountryChange(value);
    }
  };
  return (
    <div className="p-3 sm:p-6 w-full max-w-full overflow-hidden">
      <div className="flex flex-col gap-3 sm:gap-4 w-full">
        {/* Song Name */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 w-full">
          <label className="whitespace-nowrap text-gray-900 text-xs sm:text-sm font-medium leading-tight sm:leading-4 sm:w-[100px] sm:flex-shrink-0 mb-0.5 sm:mb-0">
            Song Name
          </label>
          <input
            type="text"
            value={songData?.songName || ''}
            placeholder="Enter the name of song."
            className="box-border px-3 sm:px-4 text-sm sm:text-base text-gray-900 w-full sm:w-[300px] sm:flex-1 h-10 sm:h-[36px] rounded-md border border-slate-300 bg-white min-w-0"
            readOnly
          />
        </div>

        {/* Song Name (English) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 w-full">
          <label className="text-gray-900 text-xs sm:text-sm font-medium leading-tight sm:leading-5 sm:w-[100px] sm:flex-shrink-0 mb-0.5 sm:mb-0">
            Song Name<br />(English)
          </label>
          <input
            type="text"
            value={songNameEnglish}
            onChange={handleSongNameEnglishChange}
            placeholder="Enter the English name of song."
            className="box-border px-3 sm:px-4 text-sm sm:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7B61FF] focus:border-[#7B61FF] w-full sm:w-[300px] sm:flex-1 h-10 sm:h-[36px] rounded-md border border-slate-300 bg-white min-w-0"
          />
        </div>

        {/* Artist */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 w-full">
          <label className="whitespace-nowrap text-gray-900 text-xs sm:text-sm font-medium leading-tight sm:leading-4 sm:w-[100px] sm:flex-shrink-0 mb-0.5 sm:mb-0">
            Artist
          </label>
          <input
            type="text"
            value={songData?.artistName || ''}
            placeholder="Enter the name of artist."
            className="box-border px-3 sm:px-4 text-sm sm:text-base text-gray-900 w-full sm:w-[300px] sm:flex-1 h-10 sm:h-[36px] rounded-md border border-slate-300 bg-white min-w-0"
            readOnly
          />
        </div>

        {/* Country */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 w-full">
          <label className="whitespace-nowrap text-gray-900 text-xs sm:text-sm font-medium leading-tight sm:leading-4 sm:w-[100px] sm:flex-shrink-0 mb-0.5 sm:mb-0">
            Country
          </label>
          <select
            value={country}
            onChange={handleCountryChange}
            className="box-border text-sm sm:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7B61FF] focus:border-[#7B61FF] w-full sm:w-[300px] sm:flex-1 h-10 sm:h-[36px] rounded-md border border-slate-300 bg-white pl-3 sm:pl-4 pr-10 appearance-none bg-[url('/icons/dropdown-arrow.svg')] bg-no-repeat bg-[right_12px_center] sm:bg-[right_16px_center] bg-[length:14px] sm:bg-[length:16px] min-w-0"
          >
            <option value="">Select country.</option>
            <option value="us">United States</option>
            <option value="th">Thailand</option>
            <option value="jp">Japan</option>
            <option value="kr">South Korea</option>
          </select>
        </div>

        {/* Language */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 w-full">
          <label className="whitespace-nowrap text-gray-900 text-xs sm:text-sm font-medium leading-tight sm:leading-4 sm:w-[100px] sm:flex-shrink-0 mb-0.5 sm:mb-0">
            Language
          </label>
          <select
            value={processingData?.originalLanguage || songData?.language || ''}
            className="box-border text-sm sm:text-base text-gray-900 w-full sm:w-[300px] sm:flex-1 h-10 sm:h-[36px] rounded-md border border-slate-300 bg-white pl-3 sm:pl-4 pr-10 appearance-none bg-[url('/icons/dropdown-arrow.svg')] bg-no-repeat bg-[right_12px_center] sm:bg-[right_16px_center] bg-[length:14px] sm:bg-[length:16px] min-w-0 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled
          >
            <option value="">Select language.</option>
            <option value="English">English</option>
            <option value="Thai">Thai</option>
            <option value="Japanese">Japanese</option>
            <option value="Korean">Korean</option>
          </select>
        </div>
      </div>
    </div>
  );
}

