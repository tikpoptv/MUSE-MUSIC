'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Maximize2, Minimize2, Play, Pause, SkipBack, SkipForward, Sun, Moon, Volume2, VolumeX, Volume1 } from 'lucide-react';
import type { SyncedLyricsLine } from './SyncedLyricsPlayer';
import { loadYouTubeIframeAPI } from '@/utils/youtubeLoader';
import { buildLineTimeCache, getLineTime as getLineTimeUtil } from '@/utils/lyricsMappingUtils';

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
  songStartTime?: number | null;
  youtubeVideoId?: string | null;
  onVolumeChange?: (volume: number) => void;
  onMuteToggle?: () => void;
  volume?: number;
  isMuted?: boolean;
}

type YouTubePlayer = {
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState?: () => number;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  mute?: () => void;
  destroy: () => void;
};


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
  isPlaying = false,
  songStartTime = null,
  youtubeVideoId = null,
  onVolumeChange,
  onMuteToggle,
  volume = 100,
  isMuted = false
}: LyricsTranslationViewerFullscreenProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [backgroundOpacity, setBackgroundOpacity] = useState(0.3); // 0-1 range for overlay darkness
  const containerRef = useRef<HTMLDivElement>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const fullscreenPlayerRef = useRef<YouTubePlayer | null>(null);
  const [isFullscreenPlayerReady, setIsFullscreenPlayerReady] = useState(false);
  const currentTimeRef = useRef(currentTime);
  const isPlayingRef = useRef(isPlaying);
  const hasAppliedInitialSeekRef = useRef(false);
  const isInitializingRef = useRef(false);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

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

  const pairs = parseTranslationPairs();
  const isSyncMode = currentTime > 0 && syncedLyricsLines.length > 0;
  
  const adjustedCurrentTime = songStartTime !== null && songStartTime !== undefined 
    ? currentTime - songStartTime 
    : currentTime;
  
  // Cache for line times to avoid recursive calls
  const lineTimeCache = useRef<Map<number, number | null>>(new Map());
  
  // Build cache for all pairs using utility function
  useEffect(() => {
    lineTimeCache.current = buildLineTimeCache(pairs, syncedLyricsLines);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translation, syncedLyricsLines]); // ใช้ translation แทน pairs เพื่อลด re-render
  
  const getLineTime = (pairIndex: number): number | null => {
    return getLineTimeUtil(pairIndex, lineTimeCache.current);
  };
  
  let activeIndex = -1;
  if (isSyncMode && pairs.length > 0) {
    for (let i = pairs.length - 1; i >= 0; i--) {
      const lineTime = getLineTime(i);
      if (lineTime !== null && adjustedCurrentTime >= lineTime) {
        activeIndex = i;
        break;
      }
    }
  }

  // Calculate song progress based on currentTime and songDuration
  const songProgress = songDuration && songDuration > 0 
    ? (currentTime / songDuration) * 100 
    : 0;

  // Handle click on progress bar to seek
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!songDuration || !onSeekToTime) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const seekTime = percentage * songDuration;
    
    onSeekToTime(seekTime);
  };

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


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Create separate YouTube player for fullscreen (muted, synced with main player)
  useEffect(() => {
    if (!youtubeVideoId) return;
    let isMounted = true;
    const containerElement = videoContainerRef.current;

    const setupPlayer = async () => {
      await loadYouTubeIframeAPI();
      if (!isMounted || !containerElement) return;

      if (fullscreenPlayerRef.current) {
        try {
          fullscreenPlayerRef.current.destroy();
        } catch {
          // ignore
        }
        fullscreenPlayerRef.current = null;
      }

      const playerId = `youtube-fullscreen-${youtubeVideoId}-${Date.now()}`;
      containerElement.id = playerId;

      try {
        fullscreenPlayerRef.current = new window.YT.Player(playerId, {
          videoId: youtubeVideoId,
          playerVars: {
            enablejsapi: 1,
            origin: window.location.origin,
            autoplay: 0,
            controls: 0,
            loop: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            mute: 1,
            playsinline: 1,
            iv_load_policy: 3,
            fs: 0,
            disablekb: 1,
            preload: 'auto'
          } as Record<string, number | string>,
          events: {
            onReady: (event: { target: YouTubePlayer }) => {
              fullscreenPlayerRef.current = event.target;
              
              const initializePlayer = (retryCount = 0) => {
                if (!fullscreenPlayerRef.current) return;
                
                if (retryCount > 20) {
                  setIsFullscreenPlayerReady(true);
                  return;
                }
                
                try {
                  // Check if video is loaded by checking duration
                  let duration = 0;
                  try {
                    duration = fullscreenPlayerRef.current.getDuration();
                  } catch {
                    setTimeout(() => initializePlayer(retryCount + 1), 100);
                    return;
                  }
                  
                  if (!duration || duration === 0 || isNaN(duration)) {
                    setTimeout(() => initializePlayer(retryCount + 1), 100);
                    return;
                  }
                  
                  setIsFullscreenPlayerReady(true);
                  
                  if (fullscreenPlayerRef.current.mute) {
                    fullscreenPlayerRef.current.mute();
                  }
                  
                  isInitializingRef.current = true;
                  
                  // Start playing from beginning first to load video
                  setTimeout(() => {
                    if (!fullscreenPlayerRef.current) return;
                    try {
                      if (typeof fullscreenPlayerRef.current.playVideo === 'function') {
                        fullscreenPlayerRef.current.playVideo();
                      }
                      
                      // After starting playback, seek to target time (longer delay for mobile)
                      const seekDelay = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? 800 : 500;
                      setTimeout(() => {
                        if (!fullscreenPlayerRef.current) return;
                        const targetTime = currentTimeRef.current;
                        if (targetTime > 0 && typeof fullscreenPlayerRef.current.seekTo === 'function') {
                          fullscreenPlayerRef.current.seekTo(targetTime, true);
                        }
                        
                        // Then adjust play/pause state (longer delay for mobile)
                        const stateDelay = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? 500 : 300;
                        setTimeout(() => {
                          if (!fullscreenPlayerRef.current) return;
                          try {
                            if (isPlayingRef.current && typeof fullscreenPlayerRef.current.playVideo === 'function') {
                              fullscreenPlayerRef.current.playVideo();
                            } else if (!isPlayingRef.current && typeof fullscreenPlayerRef.current.pauseVideo === 'function') {
                              fullscreenPlayerRef.current.pauseVideo();
                            }
                            hasAppliedInitialSeekRef.current = true;
                            isInitializingRef.current = false;
                          } catch {
                            // Ignore
                          }
                        }, stateDelay);
                      }, seekDelay);
                    } catch {
                      // Ignore
                    }
                  }, 100);
                } catch {
                  setTimeout(() => initializePlayer(retryCount + 1), 100);
                }
              };
              
              setTimeout(() => initializePlayer(0), 100);
            },
            onStateChange: (event: { data: number }) => {
              // Handle state changes if needed
              if (event.data === 1 && !isPlayingRef.current && hasAppliedInitialSeekRef.current) {
                // Player started playing but main player is paused (only after initial seek is done)
                if (fullscreenPlayerRef.current && typeof fullscreenPlayerRef.current.pauseVideo === 'function') {
                  try {
                    fullscreenPlayerRef.current.pauseVideo();
                  } catch {
                    // Ignore
                  }
                }
              }
            }
          }
        });
      } catch {
        setTimeout(setupPlayer, 200);
      }
    };

    setupPlayer();

    return () => {
      isMounted = false;
      if (fullscreenPlayerRef.current) {
        try {
          fullscreenPlayerRef.current.destroy();
        } catch {
          // Ignore
        }
        fullscreenPlayerRef.current = null;
      }
      if (containerElement) {
        containerElement.id = '';
      }
      setIsFullscreenPlayerReady(false);
      hasAppliedInitialSeekRef.current = false;
      isInitializingRef.current = false;
    };
  }, [youtubeVideoId]);

  // Sync fullscreen player with main player's currentTime
  useEffect(() => {
    if (!youtubeVideoId || !fullscreenPlayerRef.current || !isFullscreenPlayerReady) return;
    // รอให้ทำ initial seek ครั้งแรกให้เสร็จก่อน ค่อยเริ่ม sync ตามเวลาหลัก
    if (!hasAppliedInitialSeekRef.current || isInitializingRef.current) return;

    const syncTime = () => {
      if (!fullscreenPlayerRef.current || isInitializingRef.current) return;

      try {
        if (typeof fullscreenPlayerRef.current.getCurrentTime !== 'function' ||
            typeof fullscreenPlayerRef.current.seekTo !== 'function') {
          return;
        }

        // ไม่ควร seek ขณะกำลัง buffering (state 3)
        const playerState = fullscreenPlayerRef.current.getPlayerState?.();
        if (playerState === 3) {
          return;
        }

        const playerTime = fullscreenPlayerRef.current.getCurrentTime();
        const targetTime = currentTimeRef.current;
        const diff = Math.abs(playerTime - targetTime);

        // ถ้าคลาดเคลื่อนเล็กน้อย (< 1s) ปล่อยผ่านไป - เพิ่ม tolerance
        if (diff <= 1) return;

        fullscreenPlayerRef.current.seekTo(targetTime);
      } catch {
        // Ignore
      }
    };

    if (!isPlayingRef.current) {
      // Align once when paused to avoid looping
      syncTime();
      return;
    }

    syncTime();
    const intervalId = setInterval(syncTime, 1000); // ช้าลง จาก 500ms เป็น 1000ms
    return () => clearInterval(intervalId);
  }, [youtubeVideoId, isFullscreenPlayerReady, isPlaying]);

  // Sync fullscreen player with main player's isPlaying
  useEffect(() => {
    if (!youtubeVideoId || !fullscreenPlayerRef.current || !isFullscreenPlayerReady) return;
    // รอให้ initialization เสร็จก่อน
    if (!hasAppliedInitialSeekRef.current || isInitializingRef.current) return;

    const syncPlayState = () => {
      if (!fullscreenPlayerRef.current || isInitializingRef.current) return;

      try {
        const playerState = fullscreenPlayerRef.current.getPlayerState?.();
        // Don't sync if player is unstarted
        if (playerState === -1) {
          return;
        }

        if (isPlayingRef.current) {
          if (playerState !== 1 && typeof fullscreenPlayerRef.current.playVideo === 'function') {
            fullscreenPlayerRef.current.playVideo();
          }
        } else {
          if (playerState !== 2 && typeof fullscreenPlayerRef.current.pauseVideo === 'function') {
            fullscreenPlayerRef.current.pauseVideo();
          }
        }
        if (fullscreenPlayerRef.current.mute && typeof fullscreenPlayerRef.current.mute === 'function') {
          fullscreenPlayerRef.current.mute();
        }
      } catch {
        // Ignore
      }
    };

    syncPlayState();
  }, [youtubeVideoId, isFullscreenPlayerReady, isPlaying]);

  // Removed the syncOnReady effect - initialization is now handled in the onReady callback

  useEffect(() => {
    // Prevent zoom on mobile
    const viewport = document.querySelector('meta[name="viewport"]');
    const originalContent = viewport?.getAttribute('content') || '';
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    }

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
      .youtube-background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
        pointer-events: none;
        overflow: hidden;
        opacity: 1;
        visibility: visible;
      }
      .youtube-background iframe {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100vw;
        height: 100vh;
        min-width: 100vw;
        min-height: 100vh;
        max-width: 100vw;
        max-height: 100vh;
        transform: translate(-50%, -50%) scale(1.1);
        object-fit: cover;
        opacity: 1;
        visibility: visible;
        display: block;
      }
      @media (max-width: 640px) {
        .youtube-background iframe {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 177.78vh;
          height: 100vh;
          min-width: 100vw;
          min-height: 56.25vw;
          transform: translate(-50%, -50%);
          object-fit: cover;
        }
        @media (orientation: portrait) {
          .youtube-background iframe {
            width: 177.78vh;
            height: 100vh;
            min-width: 100vw;
            min-height: 56.25vw;
            transform: translate(-50%, -50%) scale(1.5);
          }
        }
      }
      .fullscreen-content {
        position: relative;
        z-index: 1;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
      // Restore original viewport
      if (viewport && originalContent) {
        viewport.setAttribute('content', originalContent);
      }
    };
  }, []);

  if (!translation) return null;

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[9999] flex flex-col overflow-hidden ${youtubeVideoId ? 'bg-black' : 'fullscreen-gradient'}`}
      style={{ 
        display: 'flex', 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        width: '100vw',
        height: '100vh',
        maxWidth: '100vw',
        maxHeight: '100vh',
        touchAction: 'pan-y pinch-zoom'
      }}
    >
      {youtubeVideoId && (
        <>
          <div
            ref={videoContainerRef}
            className="youtube-background"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
          />
          {/* Background Overlay for darkness control */}
          <div
            className="absolute inset-0 bg-black transition-opacity duration-200"
            style={{
              zIndex: 0.5,
              opacity: backgroundOpacity,
              pointerEvents: 'none'
            }}
          />
        </>
      )}
      <div className="fullscreen-content flex flex-col flex-1" style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
      <div 
        className="flex flex-col bg-black/60 backdrop-blur-md"
        style={{
          backdropFilter: 'blur(12px)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.4)'
        }}
      >
        <div className="flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <button
            onClick={onClose}
            className="p-2 sm:p-2 hover:bg-white/20 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 flex-shrink-0"
            aria-label="Close"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </button>
          <div className="flex flex-col min-w-0 flex-1">
            {songName && (
              <h2 className="text-white text-base sm:text-xl font-bold truncate">{songName}</h2>
            )}
            {artistName && (
              <p className="text-white/80 text-xs sm:text-sm truncate">{artistName}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {songDuration && (
            <div className="text-white text-xs sm:text-sm font-medium hidden sm:block">
              {formatTime(currentTime)} / {formatTime(songDuration)}
            </div>
          )}
          {/* Volume Controls */}
          {onVolumeChange && (
            <div className="flex items-center gap-2 bg-black/40 rounded-lg px-3 py-1.5">
              <button
                onClick={onMuteToggle}
                className="p-1 text-white hover:bg-white/20 rounded transition-colors flex-shrink-0"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : volume < 50 ? (
                  <Volume1 className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const newVolume = parseInt(e.target.value);
                  if (onVolumeChange) {
                    onVolumeChange(newVolume);
                  }
                  if (newVolume === 0 && !isMuted && onMuteToggle) {
                    onMuteToggle();
                  } else if (newVolume > 0 && isMuted && onMuteToggle) {
                    onMuteToggle();
                  }
                }}
                className="w-20 sm:w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white/80"
                style={{
                  background: `linear-gradient(to right, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.3) ${isMuted ? 0 : volume}%, rgba(255,255,255,0.1) ${isMuted ? 0 : volume}%, rgba(255,255,255,0.1) 100%)`
                }}
                aria-label="Volume control"
              />
            </div>
          )}
          {/* Background Darkness Control - Hidden on mobile */}
          {youtubeVideoId && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-lg">
              <Sun className="h-4 w-4 text-white/80" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={backgroundOpacity}
                onChange={(e) => setBackgroundOpacity(parseFloat(e.target.value))}
                className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white/80"
                style={{
                  background: `linear-gradient(to right, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.3) ${backgroundOpacity * 100}%, rgba(255,255,255,0.1) ${backgroundOpacity * 100}%, rgba(255,255,255,0.1) 100%)`
                }}
                aria-label="Adjust background darkness"
              />
              <Moon className="h-4 w-4 text-white/80" />
            </div>
          )}
          <button
            onClick={toggleFullscreen}
            className="p-2 sm:p-2 hover:bg-white/20 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 flex-shrink-0"
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            ) : (
              <Maximize2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            )}
          </button>
        </div>
        </div>
      </div>

      <div
        ref={lyricsContainerRef}
        className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 sm:py-12"
        style={{
          scrollBehavior: 'smooth'
        }}
      >
        <div className="max-w-4xl w-full mx-auto space-y-4 sm:space-y-8">
          {pairs.map((pair, index) => {
            const lineTime = getLineTime(index);
            const isActive = isSyncMode
              ? (lineTime !== null && adjustedCurrentTime >= lineTime)
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
                onClick={() => {
                  if (lineTime !== null && onSeekToTime) {
                    const videoTime = songStartTime !== null && songStartTime !== undefined 
                      ? lineTime + songStartTime 
                      : lineTime;
                    onSeekToTime(videoTime);
                  }
                }}
                style={{
                  opacity: isActive ? 1 : 0.3,
                  transform: isCurrentLine ? 'scale(1.08) translateY(-5px)' : 'scale(1) translateY(0)',
                  transition: 'transform 0.25s ease, opacity 0.25s ease, filter 0.25s ease',
                  filter: isCurrentLine ? 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.5))' : 'none',
                }}
              >
                {pair.original.trim() && (
                  <p
                    className={`font-bold mb-1 sm:mb-2 text-xl sm:text-3xl ${
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
                    className={`text-lg sm:text-2xl ${
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
          {/* Disclaimer */}
          {translation && pairs.length > 0 && (
            <div className="mt-6 sm:mt-12 pt-4 sm:pt-8 border-t border-white/20 flex justify-center w-full">
              <p className="text-xs text-white/60 text-center px-4">
                All data is generated using LLM OSS 120B. Results are AI predictions and may not be accurate.
              </p>
            </div>
          )}
        </div>
      </div>

      {onPlayPause && (
          <div className="flex flex-col bg-black/60 backdrop-blur-md">
            {/* Song Progress Bar - อยู่ด้านบนของ control bar */}
            <div 
              className="w-full h-2 sm:h-1.5 bg-black/50 relative cursor-pointer group touch-none"
              onClick={handleProgressBarClick}
            >
              <div 
                className="h-full bg-white/80 transition-all duration-150 ease-out"
                style={{
                  width: `${Math.max(0, Math.min(100, songProgress))}%`
                }}
              />
              {/* Hover indicator */}
              <div 
                className="absolute top-0 left-0 h-full bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  width: `${Math.max(0, Math.min(100, songProgress))}%`
                }}
              />
            </div>
            <div className="px-4 sm:px-8 py-4 sm:py-6">
              <div className="max-w-4xl mx-auto flex items-center justify-center gap-4 sm:gap-6">
            <button
              onClick={handleSeekBack}
                  className="p-3 sm:p-3 hover:bg-white/20 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 touch-manipulation"
              aria-label="Seek back 5 seconds"
              style={{
                backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                    minWidth: '44px',
                    minHeight: '44px'
              }}
            >
                  <SkipBack className="h-6 w-6 sm:h-6 sm:w-6 text-white" />
            </button>
            <button
              onClick={onPlayPause}
                  className="p-4 sm:p-4 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 touch-manipulation"
              aria-label={isPlaying ? 'Pause' : 'Play'}
              style={{
                backdropFilter: 'blur(10px)',
                boxShadow: isPlaying 
                  ? '0 0 20px rgba(255, 255, 255, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)'
                  : '0 4px 12px rgba(0, 0, 0, 0.2)',
                    animation: isPlaying ? 'pulse 2s ease-in-out infinite' : 'none',
                    minWidth: '64px',
                    minHeight: '64px'
              }}
            >
              {isPlaying ? (
                    <Pause className="h-8 w-8 sm:h-8 sm:w-8 text-white" />
              ) : (
                    <Play className="h-8 w-8 sm:h-8 sm:w-8 text-white" />
              )}
            </button>
            <button
              onClick={handleSeekForward}
                  className="p-3 sm:p-3 hover:bg-white/20 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 touch-manipulation"
              aria-label="Seek forward 5 seconds"
              style={{
                backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                    minWidth: '44px',
                    minHeight: '44px'
              }}
            >
                  <SkipForward className="h-6 w-6 sm:h-6 sm:w-6 text-white" />
            </button>
              </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

