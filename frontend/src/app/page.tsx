'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Search, Languages, RefreshCcw, AudioLines, Music, Youtube as YoutubeIcon } from 'lucide-react';
import MusicCard from '@/components/MusicCard';
import SkeletonCard from '@/components/SkeletonCard';
import { fetchHomeContent } from '@/services/homeService';
import { lyricsService } from '@/services/lyricsService';
import { analysisService } from '@/services/analysisService';
import { songService } from '@/services/songService';
import { youtubeService } from '@/services/youtubeService';
import type { YouTubeTranscriptResponse, YouTubeVideoDetailsResponse } from '@/types/youtube';
import type { AnalysisRequest } from '@/types/analysis';
import type { LyricsRecord } from '@/types/lyrics';
import { LocalStorageManager } from '@/utils/localStorageManager';
import { localStorageKeys } from '@/utils/localStorageKeys';
import type { HomeResponse, HomeSection } from '@/types/home';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { TranslationLanguageModal } from '@/components/modals';
import {
  languages,
  DEFAULT_ORIGINAL_LANGUAGE,
  DEFAULT_TARGET_LANGUAGE,
  DEFAULT_TRANSCRIPT_LANGUAGE_CODE,
  getLanguageNameByCode
} from '@/utils/languageUtils';

type SelectedRecord = AnalysisRequest['lyricsRecord'];
type NavbarStartDetail = {
  songID?: string;
  query?: string;
};

const NAVBAR_START_EVENT = 'muse-navbar-start-analysis';

export default function Home() {
  const [data, setData] = useState<HomeResponse>({ hero: [], sections: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [actions, setActions] = useState<{ translate: boolean; mood: boolean }>({ translate: false, mood: false });
  const [query, setQuery] = useState<string>('');
  const [searching, setSearching] = useState<boolean>(false);
  const [results, setResults] = useState<LyricsRecord[]>([]);
  const [rateLimited, setRateLimited] = useState<boolean>(false);
  const [selected, setSelected] = useState<SelectedRecord | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [showLanguageModal, setShowLanguageModal] = useState<boolean>(false);
  const [translationConfig, setTranslationConfig] = useState<{ originalLanguage: string; targetLanguage: string }>({
    originalLanguage: DEFAULT_ORIGINAL_LANGUAGE,
    targetLanguage: DEFAULT_TARGET_LANGUAGE
  });
  const skipNextSearchRef = useRef<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const searchWrapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  const [fetchingYouTubeTranscript, setFetchingYouTubeTranscript] = useState<boolean>(false);
  const [youtubeTranscriptText, setYoutubeTranscriptText] = useState<string>('');
  const [youtubeTranscriptMeta, setYoutubeTranscriptMeta] = useState<{ languages: string[]; strategy: 'fallback' | 'multi' } | null>(null);
  const [youtubeVideoDetails, setYoutubeVideoDetails] = useState<YouTubeVideoDetailsResponse | null>(null);
  const [detectedOriginalLanguage, setDetectedOriginalLanguage] = useState<string | null>(null);
  const [selectedTranscriptLanguage, setSelectedTranscriptLanguage] = useState<string>(DEFAULT_TRANSCRIPT_LANGUAGE_CODE);
  const router = useRouter();

  const clearYouTubeState = useCallback(() => {
    setYoutubeVideoId(null);
    setYoutubeTranscriptText('');
    setYoutubeTranscriptMeta(null);
    setYoutubeVideoDetails(null);
    setSelectedTranscriptLanguage(DEFAULT_TRANSCRIPT_LANGUAGE_CODE);
    setDetectedOriginalLanguage(null);
  }, []);

  const extractYouTubeVideoId = useCallback((value: string): string | null => {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?#]+)/i,
      /(?:youtube\.com\/shorts\/)([^&\s?#]+)/i,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    for (const pattern of patterns) {
      const match = trimmed.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  }, []);

  const normalizeTranscriptText = useCallback((transcript: YouTubeTranscriptResponse['transcript']): string => {
    if (typeof transcript === 'string') {
      return transcript.trim();
    }

    if (Array.isArray(transcript)) {
      return transcript
        .map((entry) => entry?.text ?? '')
        .filter((line) => Boolean(line && line.trim()))
        .join('\n')
        .trim();
    }

    if (transcript && typeof transcript === 'object') {
      return Object.entries(transcript)
        .map(([language, value]) => {
          let block = '';
          if (Array.isArray(value)) {
            block = value
              .map((entry) => entry?.text ?? '')
              .filter((line) => Boolean(line && line.trim()))
              .join('\n')
              .trim();
          } else if (typeof value === 'string') {
            block = value.trim();
          }
          if (!block) return '';
          return `[${language}]${block ? `\n${block}` : ''}`;
        })
        .filter(Boolean)
        .join('\n\n')
        .trim();
    }

    return '';
  }, []);

  const handleFetchYouTubeTranscript = useCallback(async () => {
    if (!youtubeVideoId) return;
    try {
      setFetchingYouTubeTranscript(true);
      toast.loading('Fetching YouTube transcript...', { id: 'youtube-transcript' });
      const response = await youtubeService.getTranscript(youtubeVideoId, { 
        format: 'raw', 
        mode: 'fallback',
        languages: selectedTranscriptLanguage ? [selectedTranscriptLanguage] : undefined
      });
      const normalized = normalizeTranscriptText(response.transcript);
      if (!normalized) {
        throw new Error('Transcript is empty');
      }
      setYoutubeTranscriptText(normalized);
      setYoutubeTranscriptMeta({
        languages: response.languages,
        strategy: response.strategy
      });
      if (response.languages && response.languages.length > 0) {
        const firstLanguage = response.languages[0];
        const normalizedLanguageName =
          getLanguageNameByCode(firstLanguage) ||
          languages.find((lang) => lang.name.toLowerCase() === firstLanguage.toLowerCase())?.name ||
          firstLanguage;
        setDetectedOriginalLanguage(normalizedLanguageName);
      } else {
        setDetectedOriginalLanguage(null);
      }
      setYoutubeVideoDetails(response.videoDetails ?? null);
      toast.success('YouTube transcript ready', { id: 'youtube-transcript' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch YouTube transcript';
      toast.error(message, { id: 'youtube-transcript' });
      setYoutubeTranscriptText('');
      setYoutubeTranscriptMeta(null);
      setYoutubeVideoDetails(null);
    } finally {
      setFetchingYouTubeTranscript(false);
    }
  }, [normalizeTranscriptText, youtubeVideoId, selectedTranscriptLanguage]);

  const handleClearYouTubeTranscript = useCallback(() => {
    clearYouTubeState();
  }, [clearYouTubeState]);

  const selectLyricsRecord = useCallback((record: LyricsRecord) => {
    clearYouTubeState();
    setSelected(record);
    skipNextSearchRef.current = true;
    setQuery(`${record.trackName} - ${record.artistName}`);
    setResults([]);
    setShowDropdown(false);
    if (inputRef.current) inputRef.current.blur();
    LocalStorageManager.set<number>(localStorageKeys.SELECTED_LRCLIB_ID, record.id);
  }, [clearYouTubeState]);
  const formatDuration = (secs: number): string => {
    const total = Math.max(0, Math.round(secs));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const runImmediateLyricsSearch = useCallback(async (rawQuery: string) => {
    const trimmedQuery = rawQuery.trim();
    if (!trimmedQuery) return;
    const maybeYoutubeId = extractYouTubeVideoId(trimmedQuery);
    if (maybeYoutubeId) {
      setQuery(trimmedQuery);
      setYoutubeVideoId(maybeYoutubeId);
      setSelected(null);
      setResults([]);
      setShowDropdown(false);
      return;
    }
    setQuery(trimmedQuery);
    skipNextSearchRef.current = true;
    try {
      setSearching(true);
      setRateLimited(false);
      const data = await lyricsService.search({ q: trimmedQuery });
      if (data.length > 0) {
        selectLyricsRecord(data[0]);
      } else {
        setResults([]);
        setShowDropdown(true);
      }
    } catch {
      setRateLimited(true);
      setShowDropdown(true);
    } finally {
      setSearching(false);
    }
  }, [extractYouTubeVideoId, selectLyricsRecord]);

  const handleSongPrefetch = useCallback(async (rawSongID: string) => {
    const trimmedSongID = rawSongID.trim();
    if (!trimmedSongID) return;
    try {
      clearYouTubeState();
      setSearching(true);
      setRateLimited(false);
      const detail = await songService.getSongDetail(trimmedSongID);
      if (!detail?.song) {
        toast.error('Song not found in the library');
        return;
      }
      const { song } = detail;
      skipNextSearchRef.current = true;
      const displayQuery = song.artistName ? `${song.songName} - ${song.artistName}` : song.songName;
      setQuery(displayQuery);
      setSelected({
        songID: song.songID,
        trackName: song.songName,
        artistName: song.artistName,
        albumName: song.genre || '',
        duration: song.duration ?? 0,
        instrumental: false
      });
      setResults([]);
      setShowDropdown(false);
      if (inputRef.current) inputRef.current.blur();
      toast.success('Song is ready for analysis');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to preload song from navbar search', error);
      toast.error('Unable to prepare this song for analysis');
    } finally {
      setSearching(false);
    }
  }, [clearYouTubeState]);

  useEffect(() => {
    const run = async () => {
      const res = await fetchHomeContent(100, 0);
      setData(res);
      setOffset(100);
      setHasMore(res.pagination?.hasMore ?? false);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setLoading(false);
    };
    run();
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    try {
      const res = await fetchHomeContent(100, offset);
      
      // Merge sections by language
      const mergedSections: Record<string, HomeSection> = {};
      
      // Add existing sections
      data.sections.forEach(section => {
        mergedSections[section.title] = { ...section };
      });
      
      // Add new sections
      res.sections.forEach(section => {
        if (mergedSections[section.title]) {
          mergedSections[section.title].items.push(...section.items);
        } else {
          mergedSections[section.title] = { ...section };
        }
      });
      
      setData({
        ...data,
        sections: Object.values(mergedSections)
      });
      setOffset(offset + 100);
      setHasMore(res.pagination?.hasMore ?? false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load more content:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [data, offset, hasMore, loadingMore]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (loadingMore || !hasMore) return;
      
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      
      // Load more when user is 200px from bottom
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore, loadingMore, hasMore]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const rawSongID = urlParams.get('songID') ?? urlParams.get('songId');
    if (!rawSongID || !rawSongID.trim()) {
      return;
    }
    const trimmedSongID = rawSongID.trim();
    (async () => {
      try {
        await handleSongPrefetch(trimmedSongID);
      } finally {
        urlParams.delete('songID');
        urlParams.delete('songId');
        const search = urlParams.toString();
        const nextUrl = `${window.location.pathname}${search ? `?${search}` : ''}`;
        window.history.replaceState(null, '', nextUrl);
      }
    })();
  }, [handleSongPrefetch]);

  // Handle query parameter from URL (for external search)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('q');
    
    if (queryParam && queryParam.trim()) {
      const trimmedQuery = queryParam.trim();
      (async () => {
        try {
          await runImmediateLyricsSearch(trimmedQuery);
        } finally {
          urlParams.delete('q');
          const search = urlParams.toString();
          const nextUrl = `${window.location.pathname}${search ? `?${search}` : ''}`;
          window.history.replaceState(null, '', nextUrl);
        }
      })();
    }
  }, [runImmediateLyricsSearch]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<NavbarStartDetail>).detail || {};
      if (detail.songID) {
        void handleSongPrefetch(detail.songID);
      } else if (detail.query) {
        void runImmediateLyricsSearch(detail.query);
      }
    };
    window.addEventListener(NAVBAR_START_EVENT, handler as EventListener);
    return () => window.removeEventListener(NAVBAR_START_EVENT, handler as EventListener);
  }, [handleSongPrefetch, runImmediateLyricsSearch]);

  useEffect(() => {
    let active = true;
    if (skipNextSearchRef.current) {
      // Skip one debounced execution when query is set programmatically
      skipNextSearchRef.current = false;
      return () => { active = false; };
    }
    const handler = setTimeout(async () => {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) {
        if (active) {
          setResults([]);
          setRateLimited(false);
          setShowDropdown(false);
          clearYouTubeState();
        }
        return;
      }
      const maybeYoutubeId = extractYouTubeVideoId(trimmedQuery);
      if (maybeYoutubeId) {
        if (active) {
          setYoutubeVideoId(maybeYoutubeId);
          setSelected(null);
          setResults([]);
          setRateLimited(false);
          setShowDropdown(false);
        }
        return;
      }
      try {
        setSearching(true);
        setRateLimited(false);
        const data = await lyricsService.search({ q: trimmedQuery });
        if (active) {
          setResults(data);
          setShowDropdown(true);
        }
      } catch {
        // If apiService surfaces status, it would throw; as a fallback, detect 429 by message
        if (active) {
          setRateLimited(true);
          setShowDropdown(true);
        }
      } finally {
        if (active) setSearching(false);
      }
    }, 400);

    return () => {
      active = false;
      clearTimeout(handler);
    };
  }, [query, clearYouTubeState, extractYouTubeVideoId]);

  // click outside to close dropdown
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!showDropdown) return;
      const el = searchWrapRef.current;
      if (el && e.target instanceof Node && !el.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [showDropdown]);

  const handleStartAnalysis = async () => {
    if (youtubeVideoId && !selected) {
      if (!actions.translate && !actions.mood) {
        toast.error('Please select at least one action (Translate or Mood)');
        return;
      }
      setShowLanguageModal(true);
      return;
    }

    if (!selected) {
      toast.error('Please select a song first');
      return;
    }

    if (!actions.translate && !actions.mood) {
      toast.error('Please select at least one action (Translate or Mood)');
      return;
    }

    if (actions.translate) {
      setShowLanguageModal(true);
    } else {
      toast.error('Mood analysis is not yet available');
    }
  };

  const startYoutubeAnalysisFlow = useCallback(async (originalLanguage: string, targetLanguage: string, shareRequest: boolean) => {
    if (!youtubeVideoId) return;
    try {
      setAnalyzing(true);
      toast.loading('Starting analysis...', { id: 'analysis' });

      const result = await youtubeService.analyzeVideo({
        videoId: youtubeVideoId,
        actions,
        translationConfig: {
          originalLanguage,
          targetLanguage
        },
        shareRequest
      });

      if (!result || !result.songID || result.songID === 'undefined') {
        toast.error('Invalid song ID returned from server', { id: 'analysis' });
        return;
      }

      if (!result.processingID || result.processingID === 'undefined') {
        toast.error('Invalid processing ID returned from server', { id: 'analysis' });
        return;
      }

      if (result.alreadyExists) {
        toast.success('Song already exists in system', { id: 'analysis' });
        router.push(`/song/${result.songID}?processingID=${result.processingID}`);
        return;
      }

      toast.success('Analysis completed!', { id: 'analysis' });
      router.push(`/song/${result.songID}/analysis/${result.processingID}`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('YouTube analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start YouTube analysis', { id: 'analysis' });
    } finally {
      setAnalyzing(false);
    }
  }, [actions, router, youtubeVideoId]);

  const handleLanguageConfirm = async (originalLanguage: string, targetLanguage: string, shareRequest: boolean) => {
    setTranslationConfig({ originalLanguage, targetLanguage });
    
    if (!selected && youtubeVideoId) {
      await startYoutubeAnalysisFlow(originalLanguage, targetLanguage, shareRequest);
      return;
    }
    
    if (!selected) return;

    try {
      setAnalyzing(true);
      toast.loading('Starting analysis...', { id: 'analysis' });

      const result = await analysisService.startAnalysis({
        lyricsRecord: selected,
        actions,
        translationConfig: {
          originalLanguage,
          targetLanguage
        },
        shareRequest
      });

      if (!result || !result.songID || result.songID === 'undefined') {
        toast.error('Invalid song ID returned from server', { id: 'analysis' });
        return;
      }

      if (!result.processingID || result.processingID === 'undefined') {
        toast.error('Invalid processing ID returned from server', { id: 'analysis' });
        return;
      }

      if (result.alreadyExists) {
        toast.success('Song already exists in system', { id: 'analysis' });
        router.push(`/song/${result.songID}?processingID=${result.processingID}`);
        return;
      }

      toast.success('Analysis completed!', { id: 'analysis' });
      router.push(`/song/${result.songID}/analysis/${result.processingID}`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start analysis', { id: 'analysis' });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-6xl px-6 pt-12 pb-6">
        <h1 className="text-[32px] font-bold text-black text-center">Discover the soul of music!</h1>
        <p className="mt-3 text-center text-[12px] font-light text-black leading-normal max-w-3xl mx-auto">
          Ever heard a song and thought, &ldquo;What does this even mean?&rdquo; or &ldquo;Why does this hit me right in the feels?&rdquo;
        </p>
        <p className="mt-1 text-center text-[12px] font-light text-black leading-normal max-w-3xl mx-auto">
          At MUSE MUSIC, we&rsquo;re all about decoding the lyrics, uncovering hidden meanings, and capturing the mood behind every beat.
          Whether it&rsquo;s heartbreak, hype, or just plain weird &mdash; we&rsquo;ve got you.
        </p>

        <div className="mt-6 flex flex-col items-center gap-4">
          <div ref={searchWrapRef} className="relative flex items-center justify-between gap-2 md:gap-[20px] rounded-xl border border-gray-200 shadow-sm w-full max-w-full md:w-[640px] h-[48px] md:h-[59px] px-3 md:px-[10px]">
            <input
              ref={inputRef}
              className="flex-1 outline-none text-sm md:text-base px-2 md:px-3 min-w-0"
              placeholder="Find song or paste YouTube link to..."
              aria-label="Search song or paste link"
              value={query}
              onChange={(e) => {
                const nextValue = e.target.value;
                setQuery(nextValue);
                const maybeYoutubeId = extractYouTubeVideoId(nextValue);
                if (maybeYoutubeId) {
                  setYoutubeVideoId(maybeYoutubeId);
                  setSelected(null);
                  setShowDropdown(false);
                } else if (youtubeVideoId) {
                  clearYouTubeState();
                }
                setShowDropdown(true);
              }}
              onFocus={() => {
                if (results.length > 0) setShowDropdown(true);
              }}
            />
            {youtubeVideoId && (
              <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                <select
                  value={selectedTranscriptLanguage}
                  onChange={(e) => setSelectedTranscriptLanguage(e.target.value)}
                  disabled={fetchingYouTubeTranscript}
                  className="rounded-lg border border-gray-300 bg-white px-1.5 md:px-2 py-1 text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7B61FF] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    paddingRight: '24px',
                    appearance: 'none',
                    backgroundImage: 'url("/icons/dropdown-arrow.svg")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 6px center',
                    backgroundSize: '10px'
                  }}
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleFetchYouTubeTranscript}
                  disabled={fetchingYouTubeTranscript}
                  className="flex items-center gap-1 rounded-lg bg-red-500/90 px-2 md:px-3 py-1 text-xs font-medium text-white transition hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  <YoutubeIcon className="h-3 md:h-3.5 w-3 md:w-3.5" />
                  <span className="hidden md:inline">{fetchingYouTubeTranscript ? 'Fetching...' : 'Fetch YouTube'}</span>
                </button>
              </div>
            )}
            {!youtubeVideoId && <Search className="h-4 w-4 text-gray-400 flex-shrink-0 ml-1 md:ml-2" />}
            {/* Dropdown panel */}
            {showDropdown && query && (
              <div
                role="listbox"
                className="absolute left-0 right-0 top-full mt-2 z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-h-80 overflow-auto"
              >
                {rateLimited ? (
                  <div className="text-sm text-red-600">Guest quota reached. Please log in to continue searching.</div>
                ) : searching ? (
                  <div className="text-sm text-gray-500">Searching...</div>
                ) : results.length === 0 ? (
                  <div className="text-sm text-gray-500">No results</div>
                ) : (
                  <>
                    {/* Help text explaining the Music icon */}
                    <div className="mb-2 pb-2 border-b border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Music className="h-3 w-3 text-[#7B61FF]" />
                        <span>Song has synchronized lyrics available</span>
                      </div>
                    </div>
                    <ul className="divide-y divide-gray-100">
                      {results.slice(0, 10).map((r) => (
                      <li
                        key={r.id}
                        className="py-2 flex items-center justify-between cursor-pointer hover:bg-gray-50 px-2 rounded"
                        role="option"
                        aria-selected="false"
                        tabIndex={0}
                        onClick={() => selectLyricsRecord(r)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            selectLyricsRecord(r);
                          }
                        }}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900 truncate">{r.trackName}</p>
                            {/* Music icon indicates this song has synchronized lyrics (LRC format) available */}
                            {r.syncedLyrics && (
                              <div 
                                className="flex-shrink-0" 
                                title="This song has synchronized lyrics (LRC format) available - you can use the synchronized lyrics player"
                                aria-label="Has synchronized lyrics"
                              >
                                <Music className="h-4 w-4 text-[#7B61FF]" />
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-[#7B61FF] truncate">{r.artistName} • {r.albumName}</p>
                        </div>
                        <span className="ml-3 text-[10px] text-gray-400 flex-shrink-0">{formatDuration(r.duration)}</span>
                      </li>
                    ))}
                    </ul>
                  </>
                )}
              </div>
            )}
          </div>

          {youtubeVideoId && !youtubeTranscriptText && (
            <p className="text-xs text-gray-600 text-center max-w-2xl">
              Detected a YouTube link. Fetch the transcript to analyze lyrics directly from the video.
            </p>
          )}

          {youtubeTranscriptText && (
            <div className="w-full md:w-[640px] rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-gray-900">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex flex-col">
                  <span className="font-semibold text-purple-900">YouTube transcript ready</span>
                  <span className="text-xs text-purple-700">
                    Languages: {youtubeTranscriptMeta?.languages?.join(', ') || 'Unknown'} • Strategy: {youtubeTranscriptMeta?.strategy || 'fallback'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleClearYouTubeTranscript}
                    className="rounded-lg border border-transparent px-3 py-1 text-xs font-medium text-purple-900/70 hover:bg-purple-100"
                  >
                    Clear
                  </button>
                </div>
              </div>
              {youtubeVideoDetails && (
                <div className="mt-3 rounded-lg border border-purple-100 bg-white/70 p-3 text-sm text-gray-900 flex flex-col gap-1">
                  <div className="font-semibold text-gray-900">{youtubeVideoDetails.title}</div>
                  <div className="text-xs text-gray-600">
                    {youtubeVideoDetails.channelTitle} • {new Date(youtubeVideoDetails.publishedAt).toLocaleDateString()} • {formatDuration(youtubeVideoDetails.duration || 0)}
                  </div>
                  <div className="text-xs text-gray-500 line-clamp-3">
                    {youtubeVideoDetails.description || 'No description provided.'}
                  </div>
                </div>
              )}
              <div className="mt-3 max-h-60 overflow-auto rounded-lg bg-white/70 p-3 text-sm text-gray-900 whitespace-pre-wrap">
                {youtubeTranscriptText}
              </div>
            </div>
          )}


          <div className="flex flex-col md:flex-row gap-3 md:gap-8 w-full max-w-4xl justify-center">
            <button
              type="button"
              aria-pressed={actions.translate}
              onClick={() => setActions((s) => ({ ...s, translate: !s.translate }))}
              className={`w-full md:w-[303px] h-[60px] flex items-center justify-between rounded-xl border px-4 text-sm transition-colors ${
                actions.translate
                  ? 'bg-[#7B61FF] text-white border-[#7B61FF] hover:bg-[#6B51EF]'
                  : 'border-gray-200 text-[#7B61FF] hover:bg-gray-50'
              }`}
            >
              <span className="text-left">Translate to understand</span>
              <Languages className={`h-4 w-4 ${actions.translate ? 'text-white' : 'text-[#7B61FF]'}`} />
            </button>
            <button
              type="button"
              aria-pressed={actions.mood}
              onClick={() => setActions((s) => ({ ...s, mood: !s.mood }))}
              className={`w-full md:w-[303px] h-[60px] flex items-center justify-between rounded-xl border px-4 text-sm transition-colors ${
                actions.mood
                  ? 'bg-[#7B61FF] text-white border-[#7B61FF] hover:bg-[#6B51EF]'
                  : 'border-gray-200 text-[#7B61FF] hover:bg-gray-50'
              }`}
            >
              <span className="text-left">Check the mood</span>
              <RefreshCcw className={`h-4 w-4 ${actions.mood ? 'text-white' : 'text-[#7B61FF]'}`} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleStartAnalysis}
            disabled={analyzing || (!selected && !youtubeVideoId)}
            className={`mt-2 mx-auto flex items-center justify-center gap-[11px] rounded-full bg-[#7B61FF] w-full md:w-[249px] h-[70px] px-[19px] py-[14px] text-white shadow hover:opacity-90 shrink-0 max-w-md disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {analyzing ? (
              <>
                <span className="text-base">Analyzing...</span>
                <RefreshCcw className="h-8 w-8 animate-spin" />
              </>
            ) : (
              <>
                <span className="text-base">Start Analysis</span>
                <AudioLines className="h-8 w-8" />
              </>
            )}
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-12">
        {loading ? (
          <>
            <h2 className="text-[24px] font-bold text-black mb-3">Loading...</h2>
            <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              <div className="flex gap-4 min-w-max">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div key={`skeleton-${idx}`} className="flex-shrink-0 w-[180px] sm:w-[200px]">
                    <SkeletonCard />
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : data.sections.length > 0 ? (
          data.sections.map((section, sIdx) => (
            section.items.length > 0 && (
              <div key={`section-${sIdx}`} className={sIdx === 0 ? '' : 'mt-10'}>
                <h2 className="text-[24px] font-bold text-black mb-3">{section.title}</h2>
                <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                  <div className="flex gap-4 min-w-max">
                    {section.items.map((a, idx) => (
                      <div key={`${section.title}-${idx}`} className="flex-shrink-0 w-[180px] sm:w-[200px]">
                        <MusicCard 
                          image={a.image} 
                          title={a.title} 
                          artist={a.artist} 
                          href={`/song/${a.id}?processingID=${a.processingID}`}
                          mood={a.mood || null}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-[18px] text-gray-600">No recommended songs available at this time</p>
          </div>
        )}
        {loadingMore && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <RefreshCcw className="h-5 w-5 animate-spin" />
              <span>Loading more...</span>
            </div>
          </div>
        )}
      </section>

      {/* Footer removed here to avoid duplication with global layout */}

      <TranslationLanguageModal
        isOpen={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        onConfirm={handleLanguageConfirm}
        defaultOriginalLanguage={detectedOriginalLanguage ?? translationConfig.originalLanguage}
        defaultTargetLanguage={translationConfig.targetLanguage}
      />
    </main>
  );
}
