'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Youtube, Music, Play, Pause } from 'lucide-react';
import toast from 'react-hot-toast';
import { songService } from '@/services/songService';

export interface SyncedLyricsLine {
  time: number; // in seconds
  text: string;
}

interface SyncedLyricsPlayerProps {
  syncedLyrics: string;
  songDuration?: number; // Duration in seconds
  processingID?: string; // Processing ID for saving YouTube video ID
  initialYoutubeVideoId?: string | null; // Initial YouTube video ID from database
  onCurrentTimeChange?: (currentTime: number) => void;
  onSyncedLyricsParsed?: (lines: SyncedLyricsLine[]) => void;
  onDurationMatchChange?: (matches: boolean | null) => void;
  seekToTime?: number; // Time to seek video to (external control)
}

type YouTubePlayer = {
  getCurrentTime: () => number;
  getDuration: () => number;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number) => void;
  destroy: () => void;
};

declare global {
  interface Window {
    YT: {
      Player: new (elementId: string, config: {
        videoId: string;
        events: {
          onReady?: (event: { target: YouTubePlayer }) => void;
          onStateChange?: (event: { data: number; target: YouTubePlayer }) => void;
        };
        playerVars?: {
          enablejsapi?: number;
          origin?: string;
        };
      }) => YouTubePlayer;
      ready: (callback: () => void) => void;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export default function SyncedLyricsPlayer({ 
  syncedLyrics, 
  songDuration,
  processingID,
  initialYoutubeVideoId,
  onCurrentTimeChange,
  onSyncedLyricsParsed,
  onDurationMatchChange,
  seekToTime
}: SyncedLyricsPlayerProps) {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  
  useEffect(() => {
    if (initialYoutubeVideoId) {
      const url = `https://www.youtube.com/watch?v=${initialYoutubeVideoId}`;
      setVideoUrl(url);
      setVideoId(initialYoutubeVideoId);
    } else {
      setVideoUrl('');
      setVideoId('');
    }
  }, [initialYoutubeVideoId]);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [durationMatch, setDurationMatch] = useState<boolean | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerIdRef = useRef<string>('');
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const extractYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value.trim();
    setVideoUrl(url);
    
    const id = extractYouTubeId(url);
    if (id) {
      setVideoId(id);
    } else {
      setVideoId('');
    }
  };

  useEffect(() => {
    if (videoId && processingID && videoId !== initialYoutubeVideoId) {
      const saveVideoId = async () => {
        try {
          await songService.updateYouTubeVideoId(processingID, videoId);
          toast.success('YouTube video ID saved!');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to save YouTube video ID';
          toast.error(errorMessage);
        }
      };
      
      const timeoutId = setTimeout(saveVideoId, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [videoId, processingID, initialYoutubeVideoId]);

  useEffect(() => {
    if (!syncedLyrics) return;

    const lines = syncedLyrics.split('\n');
    const parsed: SyncedLyricsLine[] = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const match = trimmed.match(/^\[(\d{2}):(\d{2})[:.](\d{2})\]\s*(.+)$/);
      if (match) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const centiseconds = parseInt(match[3], 10);
        const time = minutes * 60 + seconds + centiseconds / 100;
        parsed.push({ time, text: match[4] });
      } else {
        const match2 = trimmed.match(/^\[(\d{2}):(\d{2})\]\s*(.+)$/);
        if (match2) {
          const minutes = parseInt(match2[1], 10);
          const seconds = parseInt(match2[2], 10);
          const time = minutes * 60 + seconds;
          parsed.push({ time, text: match2[3] });
        }
      }
    });

    const sorted = parsed.sort((a, b) => a.time - b.time);
    if (onSyncedLyricsParsed) {
      onSyncedLyricsParsed(sorted);
    }
  }, [syncedLyrics, onSyncedLyricsParsed]);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  const startSync = useCallback(() => {
    if (syncIntervalRef.current) return;
    
    syncIntervalRef.current = setInterval(() => {
      if (playerRef.current) {
        try {
          const currentTime = playerRef.current.getCurrentTime();
          if (onCurrentTimeChange) {
            onCurrentTimeChange(currentTime);
          }
        } catch {
          // Ignore
        }
      }
    }, 100);
  }, [onCurrentTimeChange]);

  const stopSync = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
  }, []);


  useEffect(() => {
    if (!videoId || !playerContainerRef.current) return;

    if (playerRef.current) {
      stopSync();
      playerRef.current.destroy();
      playerRef.current = null;
    }

    setVideoDuration(null);
    setDurationMatch(null);

    playerIdRef.current = `youtube-player-${videoId}-${Date.now()}`;
    if (playerContainerRef.current) {
      playerContainerRef.current.id = playerIdRef.current;
    }

    const initializePlayer = () => {
      if (window.YT && window.YT.Player && playerIdRef.current) {
        try {
          playerRef.current = new window.YT.Player(playerIdRef.current, {
            videoId: videoId,
            events: {
              onReady: () => {
                if (playerRef.current) {
                  setTimeout(() => {
                    if (playerRef.current) {
                      try {
                        const duration = playerRef.current.getDuration();
                        setVideoDuration(duration);
                        
                        if (songDuration) {
                          const difference = Math.abs(duration - songDuration);
                          const matches = difference <= 2;
                          setDurationMatch(matches);
                          
                          if (matches) {
                            toast.success(`✓ Duration matches! (${Math.round(duration)}s)`);
                          } else {
                            toast.error(`⚠ Duration mismatch: Video (${Math.round(duration)}s) vs Song (${songDuration}s)`);
                          }
                          
                          if (onDurationMatchChange) {
                            onDurationMatchChange(matches);
                          }
                        } else {
                          toast.success('Video player ready!');
                        }
                      } catch {
                        setTimeout(() => {
                          if (playerRef.current) {
                            try {
                              const duration = playerRef.current.getDuration();
                              setVideoDuration(duration);
                              
                              if (songDuration) {
                                const difference = Math.abs(duration - songDuration);
                                const matches = difference <= 2;
                                setDurationMatch(matches);
                                
                                if (matches) {
                                  toast.success(`✓ Duration matches! (${Math.round(duration)}s)`);
                                } else {
                                  toast.error(`⚠ Duration mismatch: Video (${Math.round(duration)}s) vs Song (${songDuration}s)`);
                                }
                                
                                if (onDurationMatchChange) {
                                  onDurationMatchChange(matches);
                                }
                              }
                            } catch {
                              // Ignore
                            }
                          }
                        }, 1000);
                      }
                    }
                  }, 500);
                }
              },
              onStateChange: (event: { data: number }) => {
                setIsPlaying(event.data === 1);
                if (event.data === 1) {
                  startSync();
                } else {
                  stopSync();
                }
              }
            },
            playerVars: {
              enablejsapi: 1,
              origin: window.location.origin
            }
          });
        } catch {
          setTimeout(initializePlayer, 1000);
        }
      } else {
        setTimeout(initializePlayer, 500);
      }
    };

    if (window.YT && window.YT.Player) {
      initializePlayer();
    } else {
      window.onYouTubeIframeAPIReady = () => {
        initializePlayer();
      };
    }

    return () => {
      stopSync();
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId, songDuration, startSync, stopSync, onDurationMatchChange]);

  // Handle external seek request
  useEffect(() => {
    if (seekToTime !== undefined && seekToTime >= 0 && playerRef.current) {
      try {
        playerRef.current.seekTo(seekToTime);
      } catch {
        // Ignore errors
      }
    }
  }, [seekToTime]);

  const handlePlayPause = () => {
    if (!playerRef.current) return;
    
    try {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    } catch {
      toast.error('Failed to control player');
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Music className="h-5 w-5 text-[#7B61FF]" />
        <h3 className="text-lg font-semibold text-gray-900">Synchronized Lyrics Player</h3>
      </div>

      {!syncedLyrics && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800 text-center">
            ⚠️ This song does not have synchronized lyrics available.
          </p>
        </div>
      )}

      {syncedLyrics && (
        <>

      {/* YouTube URL Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          YouTube Video URL or Video ID
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={videoUrl}
              onChange={handleUrlChange}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B61FF] focus:border-transparent"
            />
          </div>
          {videoId && (
            <button
              onClick={handlePlayPause}
              className="px-4 py-2 bg-[#7B61FF] text-white rounded-lg hover:bg-[#6B51EF] transition-colors font-medium"
            >
              Ready
            </button>
          )}
        </div>
        {videoId && (
          <div className="space-y-1">
            <p className="text-xs text-green-600">✓ Valid YouTube video ID detected</p>
            {videoDuration !== null && (
              <p className="text-xs text-gray-600">
                Video duration: {Math.round(videoDuration)}s
                {songDuration && ` (Song: ${songDuration}s)`}
              </p>
            )}
            {durationMatch === true && (
              <p className="text-xs text-green-600 font-semibold">✓ Duration matches song!</p>
            )}
            {durationMatch === false && (
              <p className="text-xs text-red-600 font-semibold">✗ Duration does not match song</p>
            )}
          </div>
        )}
        {videoUrl && !videoId && (
          <p className="text-xs text-red-600">✗ Invalid YouTube URL</p>
        )}
      </div>

      {/* YouTube Player Container with Play/Pause Button */}
      {videoId && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
          <div
            ref={playerContainerRef}
            className="w-full h-full"
          />
          {/* Play/Pause Overlay Button */}
          {playerRef.current && (
            <button
              onClick={handlePlayPause}
              className="absolute bottom-4 right-4 p-3 bg-[#7B61FF] text-white rounded-full hover:bg-[#6B51EF] transition-colors shadow-lg"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" fill="currentColor" />
              ) : (
                <Play className="h-6 w-6" fill="currentColor" />
              )}
            </button>
          )}
        </div>
      )}
        </>
      )}

    </div>
  );
}
