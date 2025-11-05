'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Maximize2, Minimize2, Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import type { SyncedLyricsLine } from './SyncedLyricsPlayer';

interface LyricsTranslationViewerFullscreenProps {
  translation?: string;
  songName?: string;
  artistName?: string;
  currentTime?: number;
  syncedLyricsLines?: SyncedLyricsLine[];
  songDuration?: number;
  onSeekToTime?: (time: number) => void;
  onClose: () => void;
  onPlayPause?: () => void;
  isPlaying?: boolean;
}

export default function LyricsTranslationViewerFullscreen({
  translation,
  songName,
  artistName,
  currentTime = 0,
  syncedLyricsLines = [],
  songDuration,
  onSeekToTime,
  onClose,
  onPlayPause,
  isPlaying = false
}: LyricsTranslationViewerFullscreenProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Handle fullscreen API
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fullscreen API not supported or failed
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

  const pairs = parseTranslationPairs();
  const isSyncMode = currentTime > 0 && syncedLyricsLines.length > 0;
  
  // Find the currently active line index
  let activeIndex = -1;
  if (isSyncMode && pairs.length > 0) {
    for (let i = pairs.length - 1; i >= 0; i--) {
      const lineTime = getLineTime(i, pairs);
      if (lineTime !== null && currentTime >= lineTime) {
        activeIndex = i;
        break;
      }
    }
  }

  // Auto-scroll to active line
  useEffect(() => {
    if (isSyncMode && activeIndex >= 0 && lyricsContainerRef.current) {
      const container = lyricsContainerRef.current;
      const activeLine = lineRefs.current.get(activeIndex);
      
      if (!activeLine) return;
      
      const containerScrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const activeLineOffsetTop = activeLine.offsetTop;
      const activeLineHeight = activeLine.offsetHeight;
      
      const targetScrollTop = activeLineOffsetTop - (containerHeight / 2) + (activeLineHeight / 2);
      
      const currentCenter = containerScrollTop + (containerHeight / 2);
      const activeLineCenter = activeLineOffsetTop + (activeLineHeight / 2);
      const tolerance = 100;
      
      if (Math.abs(currentCenter - activeLineCenter) > tolerance) {
        container.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
      }
    }
  }, [activeIndex, isSyncMode, pairs.length]);

  // Seek functions
  const handleSeekBack = () => {
    if (!onSeekToTime || currentTime === undefined) return;
    const newTime = Math.max(0, currentTime - 5);
    onSeekToTime(newTime);
  };

  const handleSeekForward = () => {
    if (!onSeekToTime || currentTime === undefined || !songDuration) return;
    const newTime = Math.min(songDuration, currentTime + 5);
    onSeekToTime(newTime);
  };

  const handleLineClick = (lineTime: number | null) => {
    if (lineTime !== null && onSeekToTime) {
      onSeekToTime(lineTime);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes gradientShift {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      .fullscreen-gradient {
        background: linear-gradient(135deg, #7B61FF 0%, #8B6DFF 25%, #9B7AFF 50%, #8B6DFF 75%, #6B51EF 100%);
        background-size: 400% 400%;
        animation: gradientShift 15s ease infinite;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden fullscreen-gradient"
      style={{ display: 'flex' }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-8 py-4 bg-black/20 backdrop-blur-sm"
        style={{
          backdropFilter: 'blur(10px)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
        }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
            aria-label="Close"
          >
            <X className="h-6 w-6 text-white" />
          </button>
          <div className="flex flex-col">
            {songName && (
              <h2 className="text-white text-xl font-bold">{songName}</h2>
            )}
            {artistName && (
              <p className="text-white/80 text-sm">{artistName}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {songDuration && (
            <div className="text-white text-sm font-medium">
              {formatTime(currentTime)} / {formatTime(songDuration)}
            </div>
          )}
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-white/20 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="h-6 w-6 text-white" />
            ) : (
              <Maximize2 className="h-6 w-6 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Lyrics Content */}
      <div
        ref={lyricsContainerRef}
        className="flex-1 overflow-y-auto px-8 py-12"
        style={{
          scrollBehavior: 'smooth'
        }}
      >
        <div className="max-w-4xl w-full mx-auto space-y-8">
          {pairs.map((pair, index) => {
            const lineTime = getLineTime(index, pairs);
            const isActive = isSyncMode
              ? (lineTime !== null && currentTime >= lineTime)
              : true;
            const isCurrentLine = isSyncMode && activeIndex === index;
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
                className={`text-center ${
                  isClickable ? 'cursor-pointer hover:opacity-90' : ''
                }`}
                onClick={() => handleLineClick(lineTime)}
                style={{
                  opacity: isActive ? 1 : 0.3,
                  transform: isCurrentLine ? 'scale(1.08) translateY(-5px)' : 'scale(1) translateY(0)',
                  transition: 'transform 0.25s ease, opacity 0.25s ease, filter 0.25s ease',
                  filter: isCurrentLine ? 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.5))' : 'none',
                }}
              >
                {pair.original.trim() && (
                  <p
                    className={`font-bold mb-2 text-3xl ${
                      isCurrentLine ? 'text-white' : isActive ? 'text-white/90' : 'text-white/40'
                    }`}
                    style={{
                      textShadow: isCurrentLine
                        ? '0 0 20px rgba(255, 255, 255, 0.8), 0 4px 12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(123, 97, 255, 0.6)'
                        : isActive
                        ? '0 2px 8px rgba(0, 0, 0, 0.3), 0 0 10px rgba(255, 255, 255, 0.2)'
                        : '0 2px 4px rgba(0, 0, 0, 0.2)',
                      textAlign: 'center',
                      letterSpacing: '0.02em'
                    }}
                  >
                    {pair.original}
                  </p>
                )}
                {pair.translation.trim() && (
                  <p
                    className={`text-2xl ${
                      isCurrentLine ? 'text-white/95' : isActive ? 'text-white/80' : 'text-white/30'
                    }`}
                    style={{
                      textShadow: isCurrentLine
                        ? '0 0 15px rgba(255, 255, 255, 0.6), 0 2px 8px rgba(0, 0, 0, 0.4), 0 0 30px rgba(123, 97, 255, 0.4)'
                        : isActive
                        ? '0 2px 6px rgba(0, 0, 0, 0.3), 0 0 8px rgba(255, 255, 255, 0.15)'
                        : '0 1px 3px rgba(0, 0, 0, 0.2)',
                      textAlign: 'center',
                      letterSpacing: '0.01em'
                    }}
                  >
                    {pair.translation}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls Bar */}
      {onPlayPause && (
        <div className="bg-black/30 backdrop-blur-sm px-8 py-6">
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-6">
            <button
              onClick={handleSeekBack}
              className="p-3 hover:bg-white/20 rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
              aria-label="Seek back 5 seconds"
              style={{
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
              }}
            >
              <SkipBack className="h-6 w-6 text-white" />
            </button>
            <button
              onClick={onPlayPause}
              className="p-4 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
              aria-label={isPlaying ? 'Pause' : 'Play'}
              style={{
                backdropFilter: 'blur(10px)',
                boxShadow: isPlaying 
                  ? '0 0 20px rgba(255, 255, 255, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)'
                  : '0 4px 12px rgba(0, 0, 0, 0.2)',
                animation: isPlaying ? 'pulse 2s ease-in-out infinite' : 'none'
              }}
            >
              {isPlaying ? (
                <Pause className="h-8 w-8 text-white" />
              ) : (
                <Play className="h-8 w-8 text-white" />
              )}
            </button>
            <button
              onClick={handleSeekForward}
              className="p-3 hover:bg-white/20 rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
              aria-label="Seek forward 5 seconds"
              style={{
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
              }}
            >
              <SkipForward className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

