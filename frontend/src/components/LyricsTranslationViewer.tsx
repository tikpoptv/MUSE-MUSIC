'use client';

import { useState } from 'react';
import { Languages as LanguagesIcon, Save } from 'lucide-react';
import toast from 'react-hot-toast';

interface LyricsTranslationViewerProps {
  translation?: string;
  originalLyrics?: string;
  defaultLanguage?: string;
  availableLanguages?: string[];
  onLanguageChange?: (language: string) => void;
  onSave?: () => void;
  hasRating?: boolean;
  onShakeFeedback?: () => void;
}

export default function LyricsTranslationViewer({
  translation,
  originalLyrics,
  defaultLanguage = 'Thai',
  availableLanguages = ['Thai', 'English', 'Japanese', 'Korean'],
  onLanguageChange,
  onSave,
  hasRating = false,
  onShakeFeedback
}: LyricsTranslationViewerProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(defaultLanguage);
  const [isShaking, setIsShaking] = useState(false);

  const handleSave = () => {
    if (!hasRating) {
      setIsShaking(true);
      toast.error('Please rate us first! ⭐');
      setTimeout(() => setIsShaking(false), 500);
      if (onShakeFeedback) {
        onShakeFeedback();
      }
      return;
    }
    
    if (onSave) {
      onSave();
    }
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    if (onLanguageChange) {
      onLanguageChange(language);
    }
  };

  const renderTranslation = () => {
    if (!translation) return null;

    // Remove "Translation per line" prefix if exists
    const cleanedTranslation = translation.replace(/^Translation per line\s*/i, '').trim();

    return (
      <div className="space-y-1 text-sm leading-relaxed">
        {cleanedTranslation.split('\n').map((line, index) => {
          // Check if line contains Thai characters
          const isThai = /[\u0E00-\u0E7F]/.test(line);
          const isEmpty = !line.trim();
          
          if (isEmpty) {
            return <div key={index} className="h-2" />;
          }
          
          return (
            <p 
              key={index}
              className={isThai ? 'text-[#7B61FF] font-medium' : 'text-gray-500'}
            >
              {line}
            </p>
          );
        })}
      </div>
    );
  };

  const renderOriginalLyrics = () => {
    if (!originalLyrics) return null;

    return (
      <div className="space-y-2 text-sm leading-relaxed whitespace-pre-wrap">
        {originalLyrics.split('\n').map((line, index) => (
          <p key={index} className="text-gray-700">
            {line || '\u00A0'}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div style={{ width: '100%', height: '466px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      {/* Header with Language Selector and Save Icon */}
      <div className="flex items-center justify-between px-4 w-full" style={{ height: '70px', flexShrink: 0, backgroundColor: '#F5F5F5', boxSizing: 'border-box' }}>
        <div className="flex items-center gap-2">
          <LanguagesIcon className="h-5 w-5 text-[#7B61FF]" />
          <select
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            style={{
              width: '148px',
              height: '38px',
              paddingLeft: '16px',
              paddingRight: '40px',
              paddingTop: '0px',
              paddingBottom: '0px',
              flexShrink: 0,
              borderRadius: '14px',
              border: '1px solid rgba(187, 180, 221, 0.70)',
              background: '#FFF',
              color: '#000',
              fontSize: '14px',
              lineHeight: '38px',
              appearance: 'none',
              backgroundImage: 'url("/icons/dropdown-arrow.svg")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 16px center',
              backgroundSize: '16px'
            }}
            className="focus:outline-none focus:ring-2 focus:ring-[#7B61FF]"
          >
            {availableLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
        <button 
          onClick={handleSave}
          className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${isShaking ? 'animate-shake' : ''}`}
        >
          <Save className="h-5 w-5 text-[#7B61FF]" />
        </button>
      </div>

      {/* Translation Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 overflow-y-auto w-full" style={{ height: '396px', flexShrink: 0, boxSizing: 'border-box' }}>
        {translation ? (
          renderTranslation()
        ) : originalLyrics ? (
          renderOriginalLyrics()
        ) : (
          <p className="text-gray-500 text-center py-8">No lyrics available</p>
        )}
      </div>
    </div>
  );
}

