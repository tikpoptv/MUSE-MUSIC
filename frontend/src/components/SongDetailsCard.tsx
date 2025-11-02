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
    <div className="p-6">
      <div className="flex flex-col gap-4">
        {/* Song Name */}
        <div className="flex items-center" style={{ gap: '12px' }}>
          <label className="whitespace-nowrap" style={{ color: '#000', fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, lineHeight: '14px', width: '100px' }}>
            Song Name
          </label>
          <input
            type="text"
            value={songData?.songName || ''}
            placeholder="Enter the name of song."
            className="px-4 text-gray-900"
            style={{ width: '300px', height: '36px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFF' }}
            readOnly
          />
        </div>

        {/* Song Name (English) */}
        <div className="flex items-center" style={{ gap: '12px' }}>
          <label style={{ color: '#000', fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, lineHeight: '20px', width: '100px' }}>
            Song Name<br />(English)
          </label>
          <input
            type="text"
            value={songNameEnglish}
            onChange={handleSongNameEnglishChange}
            placeholder="Enter the English name of song."
            className="px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7B61FF] focus:border-[#7B61FF]"
            style={{ width: '300px', height: '36px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFF' }}
          />
        </div>

        {/* Artist */}
        <div className="flex items-center" style={{ gap: '12px' }}>
          <label className="whitespace-nowrap" style={{ color: '#000', fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, lineHeight: '14px', width: '100px' }}>
            Artist
          </label>
          <input
            type="text"
            value={songData?.artistName || ''}
            placeholder="Enter the name of artist."
            className="px-4 text-gray-900"
            style={{ width: '300px', height: '36px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFF' }}
            readOnly
          />
        </div>

        {/* Country */}
        <div className="flex items-center" style={{ gap: '12px' }}>
          <label className="whitespace-nowrap" style={{ color: '#000', fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, lineHeight: '14px', width: '100px' }}>
            Country
          </label>
          <select
            value={country}
            onChange={handleCountryChange}
            className="text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7B61FF] focus:border-[#7B61FF]"
            style={{ 
              width: '300px', 
              height: '36px', 
              borderRadius: '6px', 
              border: '1px solid #CBD5E1', 
              background: '#FFF',
              paddingLeft: '16px',
              paddingRight: '40px',
              appearance: 'none',
              backgroundImage: 'url("/icons/dropdown-arrow.svg")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 16px center',
              backgroundSize: '16px'
            }}
          >
            <option value="">Select country.</option>
            <option value="us">United States</option>
            <option value="th">Thailand</option>
            <option value="jp">Japan</option>
            <option value="kr">South Korea</option>
          </select>
        </div>

        {/* Language */}
        <div className="flex items-center" style={{ gap: '12px' }}>
          <label className="whitespace-nowrap" style={{ color: '#000', fontFamily: 'Inter', fontSize: '14px', fontWeight: 500, lineHeight: '14px', width: '100px' }}>
            Language
          </label>
          <select
            value={processingData?.originalLanguage || songData?.language || ''}
            className="text-gray-900"
            style={{ 
              width: '300px', 
              height: '36px', 
              borderRadius: '6px', 
              border: '1px solid #CBD5E1', 
              background: '#FFF',
              paddingLeft: '16px',
              paddingRight: '40px',
              appearance: 'none',
              backgroundImage: 'url("/icons/dropdown-arrow.svg")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 16px center',
              backgroundSize: '16px'
            }}
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

