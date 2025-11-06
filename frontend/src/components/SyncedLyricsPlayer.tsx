'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Youtube, Music, Play, Pause, Search, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { songService } from '@/services/songService';
import { youtubeService } from '@/services/youtubeService';
import type { YouTubeVideo } from '@/types/youtube';

export interface SyncedLyricsLine {
  time: number; // in seconds
  text: string;
}

interface SyncedLyricsPlayerProps {
  syncedLyrics: string;
  songDuration?: number;
  processingID?: string;
  initialYoutubeVideoId?: string | null;
  songName?: string;
  artistName?: string;
  onCurrentTimeChange?: (currentTime: number) => void;
  onSyncedLyricsParsed?: (lines: SyncedLyricsLine[]) => void;
  onDurationMatchChange?: (matches: boolean | null) => void;
  onIsPlayingChange?: (isPlaying: boolean) => void;
  onPlayPauseRequest?: (api: { playPause: () => void }) => void;
  seekToTime?: number;
  readonly?: boolean;
  initialSyncConfirmed?: boolean;
  initialSongStartTime?: number | null;
  onSyncSettingsChange?: (syncConfirmed: boolean, songStartTime: number | null) => void;
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
  songName,
  artistName,
  onCurrentTimeChange,
  onSyncedLyricsParsed,
  onDurationMatchChange,
  onIsPlayingChange,
  onPlayPauseRequest,
  seekToTime,
  readonly = false,
  initialSyncConfirmed = false,
  initialSongStartTime = null,
  onSyncSettingsChange
}: SyncedLyricsPlayerProps) {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [searchResults, setSearchResults] = useState<YouTubeVideo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [hasAutoSearched, setHasAutoSearched] = useState(false);
  
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

  useEffect(() => {
    if (!initialYoutubeVideoId && syncedLyrics && songName && songName.trim() !== '' && !hasAutoSearched && !readonly) {
      const autoSearch = async () => {
        try {
          setIsSearching(true);
          const searchQuery = songName.trim();
          const searchArtist = artistName?.trim() || undefined;
          const results = await youtubeService.searchVideos(searchQuery, searchArtist, 5);
          if (results.length > 0) {
            setSearchResults(results);
            setShowSearchResults(true);
            toast.success(`Found ${results.length} YouTube video${results.length > 1 ? 's' : ''}`);
          } else {
            toast.error('No YouTube videos found');
          }
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Failed to search YouTube');
        } finally {
          setIsSearching(false);
          setHasAutoSearched(true);
        }
      };
      
      autoSearch();
    }
  }, [initialYoutubeVideoId, syncedLyrics, songName, artistName, hasAutoSearched, readonly]);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [durationMatch, setDurationMatch] = useState<boolean | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [syncConfirmed, setSyncConfirmed] = useState(initialSyncConfirmed);
  const [songStartTime, setSongStartTime] = useState<number | null>(initialSongStartTime);
  const [isSavingSyncSettings, setIsSavingSyncSettings] = useState(false);
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

  const handleSearchClick = async () => {
    if (!songName) {
      toast.error('Song name is required for search');
      return;
    }

    try {
      setIsSearching(true);
      const results = await youtubeService.searchVideos(songName, artistName, 5);
      setSearchResults(results);
      setShowSearchResults(true);
      if (results.length === 0) {
        toast.error('No YouTube videos found');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to search YouTube');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectVideo = (selectedVideo: YouTubeVideo) => {
    setVideoId(selectedVideo.videoId);
    setVideoUrl(`https://www.youtube.com/watch?v=${selectedVideo.videoId}`);
    setShowSearchResults(false);
    setSearchResults([]);
  };

  useEffect(() => {
    if (readonly) return; // Don't auto-save in readonly mode
    
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
  }, [videoId, processingID, initialYoutubeVideoId, readonly]);

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
                            if (syncConfirmed) {
                              toast.success(`✓ Sync confirmed as correct (Video: ${Math.round(duration)}s, Song: ${songDuration}s)`, {
                                duration: 4000
                              });
                            } else {
                              toast.error(`⚠ Duration mismatch: Video (${Math.round(duration)}s) vs Song (${songDuration}s)`);
                            }
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
                                  if (syncConfirmed) {
                                    toast.success(`✓ Sync confirmed as correct (Video: ${Math.round(duration)}s, Song: ${songDuration}s)`, {
                                      duration: 4000
                                    });
                                  } else {
                                    toast.error(`⚠ Duration mismatch: Video (${Math.round(duration)}s) vs Song (${songDuration}s)`);
                                  }
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
                const playing = event.data === 1;
                setIsPlaying(playing);
                if (onIsPlayingChange) {
                  onIsPlayingChange(playing);
                }
                if (playing) {
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
  }, [videoId, songDuration, startSync, stopSync, onDurationMatchChange, onIsPlayingChange, syncConfirmed]);

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

  const handlePlayPause = useCallback(() => {
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
  }, [isPlaying]);

  useEffect(() => {
    if (onPlayPauseRequest) {
      // Expose playPause function to parent
      const api = {
        playPause: handlePlayPause
      };
      onPlayPauseRequest(api);
    }
  }, [handlePlayPause, onPlayPauseRequest]);

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
              onChange={readonly ? undefined : handleUrlChange}
              placeholder="https://www.youtube.com/watch?v=..."
              disabled={readonly}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B61FF] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
          {!readonly && songName && (
            <button
              onClick={handleSearchClick}
              disabled={isSearching}
              className="px-4 py-2 bg-[#FEB21A] text-white rounded-lg hover:bg-[#E8A219] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Search</span>
                </>
              )}
            </button>
          )}
          {videoId && (
            <button
              onClick={handlePlayPause}
              className="px-4 py-2 bg-[#7B61FF] text-white rounded-lg hover:bg-[#6B51EF] transition-colors font-medium"
            >
              Ready
            </button>
          )}
        </div>
        
        {/* Search Results */}
        {showSearchResults && searchResults.length > 0 && (
          <div className="mt-3 border border-gray-200 rounded-lg bg-white shadow-lg max-h-64 overflow-y-auto">
            <div className="p-2 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-700">Search Results</p>
            </div>
            <div className="divide-y divide-gray-200">
              {searchResults.map((video) => (
                <button
                  key={video.videoId}
                  onClick={() => handleSelectVideo(video)}
                  className="w-full p-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-24 h-18 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">{video.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{video.channelTitle}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
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
              syncConfirmed ? (
                <p className="text-xs text-green-600 font-semibold">✓ Sync confirmed as correct</p>
              ) : (
                <p className="text-xs text-amber-600 font-semibold">ℹ️ Duration differs - Please confirm sync if correct</p>
              )
            )}
          </div>
        )}

        {/* Sync Settings */}
        {!readonly && processingID && videoId && (
          <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Sync Settings</h4>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="syncConfirmed"
                checked={syncConfirmed}
                onChange={(e) => {
                  const newValue = e.target.checked;
                  setSyncConfirmed(newValue);
                  if (onSyncSettingsChange) {
                    onSyncSettingsChange(newValue, songStartTime);
                  }
                  if (processingID) {
                    const saveSettings = async () => {
                      try {
                        setIsSavingSyncSettings(true);
                        await songService.updateSyncSettings(processingID, newValue, songStartTime);
                        toast.success('Sync settings saved!');
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : 'Failed to save sync settings');
                        setSyncConfirmed(!newValue);
                        if (onSyncSettingsChange) {
                          onSyncSettingsChange(!newValue, songStartTime);
                        }
                      } finally {
                        setIsSavingSyncSettings(false);
                      }
                    };
                    const timeoutId = setTimeout(saveSettings, 500);
                    return () => clearTimeout(timeoutId);
                  }
                }}
                disabled={isSavingSyncSettings}
                className="w-4 h-4 text-[#7B61FF] border-gray-300 rounded focus:ring-[#7B61FF] disabled:opacity-50"
              />
              <label htmlFor="syncConfirmed" className="text-sm text-gray-700 cursor-pointer">
                Confirm sync is correct (even if timing doesn&apos;t match)
              </label>
            </div>

            <div className="space-y-1">
              <label htmlFor="songStartTime" className="block text-sm text-gray-700">
                Song Start Time (seconds)
              </label>
              <input
                type="number"
                id="songStartTime"
                value={songStartTime ?? ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? null : parseFloat(e.target.value);
                  setSongStartTime(value);
                  if (onSyncSettingsChange) {
                    onSyncSettingsChange(syncConfirmed, value);
                  }
                  if (processingID) {
                    const saveSettings = async () => {
                      try {
                        setIsSavingSyncSettings(true);
                        await songService.updateSyncSettings(processingID, syncConfirmed, value);
                        toast.success('Sync settings saved!');
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : 'Failed to save sync settings');
                      } finally {
                        setIsSavingSyncSettings(false);
                      }
                    };
                    const timeoutId = setTimeout(saveSettings, 1000);
                    return () => clearTimeout(timeoutId);
                  }
                }}
                placeholder="0.0"
                step="0.1"
                disabled={isSavingSyncSettings}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7B61FF] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              />
              <p className="text-xs text-gray-500">
                Adjust if the song starts at a different time than the video
              </p>
            </div>
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
