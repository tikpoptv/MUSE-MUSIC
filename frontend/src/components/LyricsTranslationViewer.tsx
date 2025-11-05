'use client';

import { useState, useEffect, useRef } from 'react';
import { Languages as LanguagesIcon, Save, AlertTriangle, Maximize2 } from 'lucide-react';
import toast from 'react-hot-toast';

import type { SyncedLyricsLine } from './SyncedLyricsPlayer';
import LyricsTranslationViewerFullscreen from './LyricsTranslationViewerFullscreen';

interface LyricsTranslationViewerProps {
  translation?: string;
  originalLyrics?: string;
  defaultLanguage?: string;
  availableLanguages?: string[];
  onLanguageChange?: (language: string) => void;
  onSave?: () => void;
  hasRating?: boolean;
  onShakeFeedback?: () => void;
  songName?: string;
  artistName?: string;
  targetLanguage?: string;
  currentTime?: number; // Current video time in seconds
  syncedLyricsLines?: SyncedLyricsLine[]; // Parsed synced lyrics with timestamps
  durationMatch?: boolean | null; // Whether video duration matches song duration
  songDuration?: number; // Total song duration in seconds
  onSeekToTime?: (time: number) => void; // Callback to seek video to specific time
  onSelectedLanguageChange?: (language: string) => void; // Callback when selected language changes
  onPlayPause?: () => void; // Callback to play/pause video
  isPlaying?: boolean; // Whether video is currently playing
}

export default function LyricsTranslationViewer({
  translation,
  originalLyrics,
  defaultLanguage = 'Thai',
  availableLanguages = ['Thai', 'English', 'Japanese', 'Korean'],
  onLanguageChange,
  onSave,
  hasRating = false,
  onShakeFeedback,
  songName,
  artistName,
  targetLanguage,
  currentTime = 0,
  syncedLyricsLines = [],
  durationMatch = null,
  songDuration,
  onSeekToTime,
  onSelectedLanguageChange,
  onPlayPause,
  isPlaying = false
}: LyricsTranslationViewerProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(targetLanguage || defaultLanguage);
  const [isShaking, setIsShaking] = useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (targetLanguage) {
      setSelectedLanguage(targetLanguage);
    } else if (defaultLanguage) {
      setSelectedLanguage(defaultLanguage);
    }
  }, [targetLanguage, defaultLanguage]);

  const downloadLyricsAsTxt = () => {
    if (!originalLyrics || !translation) {
      toast.error('No lyrics available to download');
      return;
    }

    const songNameText = songName || 'song';
    const artistNameText = artistName || 'Unknown Artist';
    const originalLyricsText = originalLyrics || '';
    const translationText = translation.replace(/^Translation per line\s*/i, '').trim();
    const targetLanguageText = targetLanguage || 'Translation';

    // Create content with song info, original lyrics, and translation
    const content = [
      `Song: ${songNameText}`,
      `Artist: ${artistNameText}`,
      '',
      '=== Original Lyrics ===',
      '',
      originalLyricsText,
      '',
      `=== ${targetLanguageText} Translation ===`,
      '',
      translationText,
      ''
    ].join('\n');

    // Create blob and download
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${songNameText} - ${artistNameText}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Lyrics downloaded successfully!');
  };

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
    
    downloadLyricsAsTxt();
    
    if (onSave) {
      onSave();
    }
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    if (onLanguageChange) {
      onLanguageChange(language);
    }
    if (onSelectedLanguageChange) {
      onSelectedLanguageChange(language);
    }
  };

  // Parse translation into pairs
  const parseTranslationPairs = () => {
    if (!translation) return [];

    const cleanedTranslation = translation.replace(/^Translation per line\s*/i, '').trim();
    const allLines = cleanedTranslation.split('\n');
    
    const pairs: Array<{ original: string; translation: string }> = [];
    let i = 0;
    while (i < allLines.length) {
      const line1 = allLines[i]?.trim() || '';
      const line2 = allLines[i + 1]?.trim() || '';
      
      if (!line1 && !line2) {
        i += 1;
        continue;
      }
      
      if (line1 && line2) {
        pairs.push({ original: line1, translation: line2 });
        i += 2;
      } else if (line1) {
        pairs.push({ original: line1, translation: '' });
        i += 1;
      } else {
        pairs.push({ original: '', translation: line2 });
        i += 1;
      }
      
      if (i < allLines.length && !allLines[i]?.trim()) {
        i += 1;
      }
    }
    
    return pairs;
  };

  // Get line time by index
  const getLineTime = (pairIndex: number, pairs: Array<{ original: string; translation: string }>): number | null => {
    if (syncedLyricsLines.length === 0) return null;
    
    const pair = pairs[pairIndex];
    if (!pair || !pair.original.trim()) return null;
    
    const originalTrimmed = pair.original.trim();
    
    if (pairIndex < syncedLyricsLines.length) {
      const syncedLine = syncedLyricsLines[pairIndex];
      const syncedText = syncedLine.text.trim();
      
      if (syncedText === originalTrimmed) {
        return syncedLine.time;
      }
    }
    
    const match = syncedLyricsLines.find(syncedLine => {
      return syncedLine.text.trim() === originalTrimmed;
    });
    
    if (match) {
      return match.time;
    }
    
    if (pairIndex < syncedLyricsLines.length) {
      return syncedLyricsLines[pairIndex].time;
    }
    
    return null;
  };

  // Parse translation pairs
  const pairs = parseTranslationPairs();

  // Determine if we're in sync mode (playing with synced lyrics)
  const isSyncMode = currentTime > 0 && syncedLyricsLines.length > 0;
  
  // Find the currently active line index for auto-scroll
  let activeIndex = -1;
  let lastLyricsTime = 0;
  if (isSyncMode && pairs.length > 0) {
    for (let i = pairs.length - 1; i >= 0; i--) {
      const lineTime = getLineTime(i, pairs);
      if (lineTime !== null) {
        lastLyricsTime = Math.max(lastLyricsTime, lineTime);
        if (currentTime >= lineTime) {
          activeIndex = i;
          break;
        }
      }
    }
  }
  
  // Check if song is still playing but lyrics have ended
  const hasTimeRemaining = songDuration ? currentTime < songDuration - 5 : true;
  const lyricsEnded = isSyncMode && lastLyricsTime > 0 && currentTime > lastLyricsTime + 2 && hasTimeRemaining;

  // Auto-scroll to active line when playing (center it)
  useEffect(() => {
    if (isSyncMode && activeIndex >= 0 && lyricsContainerRef.current) {
      const container = lyricsContainerRef.current;
      const activeLine = lineRefs.current.get(activeIndex);
      
      if (!activeLine) return;
      
      // Calculate scroll position to center the active line
      const containerScrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const activeLineOffsetTop = activeLine.offsetTop;
      const activeLineHeight = activeLine.offsetHeight;
      
      // Calculate where the active line should be positioned (center of viewport)
      const targetScrollTop = activeLineOffsetTop - (containerHeight / 2) + (activeLineHeight / 2);
      
      // Only scroll if the active line is not already centered (with some tolerance)
      const currentCenter = containerScrollTop + (containerHeight / 2);
      const activeLineCenter = activeLineOffsetTop + (activeLineHeight / 2);
      const tolerance = 50; // pixels
      
      if (Math.abs(currentCenter - activeLineCenter) > tolerance) {
        container.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
      }
    }
  }, [activeIndex, isSyncMode, pairs.length]);

  const renderTranslation = () => {
    if (!translation || !originalLyrics || pairs.length === 0) return null;

    return (
      <div className="space-y-3 text-sm leading-relaxed">
        {pairs.map((pair, index) => {
          if (!pair.original.trim() && !pair.translation.trim()) {
            return <div key={index} className="h-2" />;
          }

          // Get time for this line by index (only for highlighting, not changing content)
          const lineTime = getLineTime(index, pairs);
          // If not in sync mode (not playing or no synced lyrics), show all as active (normal mode)
          const isActive = isSyncMode 
            ? (lineTime !== null && currentTime >= lineTime)
            : true; // Normal mode: show all as active (not grayed out)
          
          const handleLineClick = () => {
            if (lineTime !== null && onSeekToTime) {
              onSeekToTime(lineTime);
            }
          };

          const isClickable = lineTime !== null && onSeekToTime !== undefined;
          
          return (
            <div 
              key={index} 
              ref={(el) => {
                if (el) {
                  lineRefs.current.set(index, el);
                } else {
                  lineRefs.current.delete(index);
                }
              }}
              className={`space-y-1 ${isClickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
              onClick={handleLineClick}
            >
              {pair.original.trim() && (
                <p className={`font-medium transition-colors ${
                  isActive ? 'text-[#7B61FF]' : 'text-gray-400'
                }`}>
                  {pair.original}
                </p>
              )}
              {pair.translation.trim() && (
                <p className={`transition-colors ${
                  isActive ? 'text-gray-700' : 'text-gray-400'
                }`}>
                  {pair.translation}
                </p>
              )}
            </div>
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullscreenOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Open fullscreen"
            title="Fullscreen"
          >
            <Maximize2 className="h-5 w-5 text-[#7B61FF]" />
          </button>
          <button 
            onClick={handleSave}
            className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${isShaking ? 'animate-shake' : ''}`}
          >
            <Save className="h-5 w-5 text-[#7B61FF]" />
          </button>
        </div>
      </div>

      {/* Translation Content */}
      <div 
        ref={lyricsContainerRef}
        className="bg-white border border-gray-200 rounded-lg overflow-y-auto w-full relative" 
        style={{ height: '396px', flexShrink: 0, boxSizing: 'border-box' }}
      >
        {/* Duration Mismatch Warning (Sticky at top, full width and height) */}
        {durationMatch === false && isSyncMode && (
          <div 
            className="sticky top-0 z-10 flex flex-col items-center justify-center transition-all"
            style={{ 
              background: 'linear-gradient(135deg, rgba(123, 97, 255, 0.9) 0%, rgba(123, 97, 255, 0.75) 100%)',
              backdropFilter: 'blur(4px)',
              padding: '20px',
              width: '100%',
              height: '396px',
              boxSizing: 'border-box',
              position: 'sticky',
              top: 0
            }}
          >
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mb-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                <AlertTriangle style={{ width: '32px', height: '32px', color: 'white' }} strokeWidth={2} />
              </div>
              <p className="text-white text-center text-base font-semibold">
                Pretty please?
              </p>
              <p className="text-white text-center text-sm font-medium opacity-95">
                Video duration doesn&apos;t match the song! Lyrics sync may be incorrect.
              </p>
            </div>
          </div>
        )}
        
        <div className="p-6 relative">
          {/* Lyrics Ended Warning (small notification at top right, sticky to scroll) */}
          {lyricsEnded && (
            <div 
              className="sticky top-4 z-20 flex items-center gap-2 transition-all rounded-lg"
              style={{ 
                background: 'linear-gradient(135deg, rgba(123, 97, 255, 0.95) 0%, rgba(123, 97, 255, 0.85) 100%)',
                backdropFilter: 'blur(8px)',
                padding: '12px 16px',
                maxWidth: '320px',
                boxSizing: 'border-box',
                boxShadow: '0 8px 24px rgba(123, 97, 255, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)',
                animation: 'float 3s ease-in-out infinite, fadeIn 0.3s ease-out',
                width: 'fit-content',
                marginLeft: 'auto',
                marginBottom: '12px',
                pointerEvents: 'none'
              }}
            >
              <AlertTriangle style={{ width: '20px', height: '20px', color: 'white', flexShrink: 0 }} strokeWidth={2} />
              <p className="text-white text-xs font-medium leading-relaxed">
                The content may be instrumental or lyrics may be incomplete. We apologize for any inconvenience.
              </p>
            </div>
          )}
          {translation ? (
            renderTranslation()
          ) : originalLyrics ? (
            renderOriginalLyrics()
          ) : (
            <p className="text-gray-500 text-center py-8">No lyrics available</p>
          )}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreenOpen && (
        <LyricsTranslationViewerFullscreen
          translation={translation}
          songName={songName}
          artistName={artistName}
          currentTime={currentTime}
          syncedLyricsLines={syncedLyricsLines}
          songDuration={songDuration}
          onSeekToTime={onSeekToTime}
          onClose={() => setIsFullscreenOpen(false)}
          onPlayPause={onPlayPause}
          isPlaying={isPlaying}
        />
      )}
    </div>
  );
}

