'use client';
import { useEffect, useRef, useState } from 'react';
import { Search, Languages, RefreshCcw, AudioLines } from 'lucide-react';
import MusicCard from '@/components/MusicCard';
import SkeletonCard from '@/components/SkeletonCard';
import { fetchHomeContent } from '@/services/homeService';
import { lyricsService } from '@/services/lyricsService';
import { analysisService } from '@/services/analysisService';
import type { LyricsRecord } from '@/types/lyrics';
import { LocalStorageManager } from '@/utils/localStorageManager';
import { localStorageKeys } from '@/utils/localStorageKeys';
import type { HomeResponse } from '@/types/home';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { TranslationLanguageModal } from '@/components/modals';

export default function Home() {
  const [data, setData] = useState<HomeResponse>({ hero: [], sections: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [actions, setActions] = useState<{ translate: boolean; mood: boolean }>({ translate: false, mood: false });
  const [query, setQuery] = useState<string>('');
  const [searching, setSearching] = useState<boolean>(false);
  const [results, setResults] = useState<LyricsRecord[]>([]);
  const [rateLimited, setRateLimited] = useState<boolean>(false);
  const [selected, setSelected] = useState<LyricsRecord | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [showLanguageModal, setShowLanguageModal] = useState<boolean>(false);
  const [translationConfig, setTranslationConfig] = useState<{ originalLanguage: string; targetLanguage: string }>({
    originalLanguage: 'Auto Detect',
    targetLanguage: 'Thai'
  });
  const skipNextSearchRef = useRef<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const searchWrapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const formatDuration = (secs: number): string => {
    const total = Math.max(0, Math.round(secs));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const run = async () => {
      const res = await fetchHomeContent();
      setData(res);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setLoading(false);
    };
    run();
  }, []);

  useEffect(() => {
    let active = true;
    if (skipNextSearchRef.current) {
      // Skip one debounced execution when query is set programmatically
      skipNextSearchRef.current = false;
      return () => { active = false; };
    }
    const handler = setTimeout(async () => {
      if (!query.trim()) {
        if (active) {
          setResults([]);
          setRateLimited(false);
          setShowDropdown(false);
        }
        return;
      }
      try {
        setSearching(true);
        setRateLimited(false);
        const data = await lyricsService.search({ q: query.trim() });
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
  }, [query]);

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

  const handleLanguageConfirm = async (originalLanguage: string, targetLanguage: string) => {
    setTranslationConfig({ originalLanguage, targetLanguage });
    
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
        }
      });

      // eslint-disable-next-line no-console
      console.log('Analysis result:', result);

      if (!result || !result.songID || result.songID === 'undefined') {
        toast.error('Invalid song ID returned from server', { id: 'analysis' });
        // eslint-disable-next-line no-console
        console.error('Invalid songID:', result?.songID);
        return;
      }

      if (!result.processingID || result.processingID === 'undefined') {
        toast.error('Invalid processing ID returned from server', { id: 'analysis' });
        // eslint-disable-next-line no-console
        console.error('Invalid processingID:', result?.processingID);
        return;
      }

      toast.success('Analysis completed!', { id: 'analysis' });
      
      // eslint-disable-next-line no-console
      console.log('Redirecting to:', `/song/${result.songID}?processingID=${result.processingID}`);
      router.push(`/song/${result.songID}?processingID=${result.processingID}`);
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
          <div ref={searchWrapRef} className="relative flex items-center justify-between gap-[20px] rounded-xl border border-gray-200 shadow-sm w-full h-[48px] px-3 md:w-[640px] md:h-[59px] md:px-[10px]">
            <input
              ref={inputRef}
              className="flex-1 outline-none text-sm px-3"
              placeholder="Find song or paste YouTube link to..."
              aria-label="Search song or paste link"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => {
                if (results.length > 0) setShowDropdown(true);
              }}
            />
            <Search className="h-4 w-4 text-gray-400" />
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
                  <ul className="divide-y divide-gray-100">
                    {results.slice(0, 10).map((r) => (
                      <li
                        key={r.id}
                        className="py-2 flex items-center justify-between cursor-pointer hover:bg-gray-50 px-2 rounded"
                        role="option"
                        aria-selected="false"
                        tabIndex={0}
                        onClick={() => {
                          setSelected(r);
                          skipNextSearchRef.current = true;
                          setQuery(`${r.trackName} - ${r.artistName}`);
                          setResults([]);
                          setShowDropdown(false);
                          if (inputRef.current) inputRef.current.blur();
                          LocalStorageManager.set<number>(localStorageKeys.SELECTED_LRCLIB_ID, r.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelected(r);
                            skipNextSearchRef.current = true;
                            setQuery(`${r.trackName} - ${r.artistName}`);
                            setResults([]);
                            setShowDropdown(false);
                            if (inputRef.current) inputRef.current.blur();
                            LocalStorageManager.set<number>(localStorageKeys.SELECTED_LRCLIB_ID, r.id);
                          }
                        }}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{r.trackName}</p>
                          <p className="text-xs text-[#7B61FF] truncate">{r.artistName} • {r.albumName}</p>
                        </div>
                        <span className="ml-3 text-[10px] text-gray-400">{formatDuration(r.duration)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>


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
            disabled={analyzing || !selected}
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
        <h2 className="text-[24px] font-bold text-black mb-3">English</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
          {loading
            ? Array.from({ length: 5 }).map((_, idx) => (
                <SkeletonCard key={`skeleton-hero-${idx}`} />
              ))
            : data.hero.map((a, idx) => (
                <MusicCard key={`en-${idx}`} image={a.image} title={a.title} artist={a.artist} href={a.href} />
        ))}
      </div>

        {data.sections.map((section, sIdx) => (
          <div key={`section-${sIdx}`} className={sIdx === 0 ? 'mt-10' : 'mt-10'}>
            <h2 className="text-[24px] font-bold text-black mb-3">{section.title}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
              {loading
                ? Array.from({ length: 5 }).map((_, idx) => (
                    <SkeletonCard key={`skeleton-${sIdx}-${idx}`} />
                  ))
                : section.items.map((a, idx) => (
                    <MusicCard key={`${section.title}-${idx}`} image={a.image} title={a.title} artist={a.artist} href={a.href} />
                  ))}
        </div>
      </div>
        ))}
      </section>

      {/* Footer removed here to avoid duplication with global layout */}

      <TranslationLanguageModal
        isOpen={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        onConfirm={handleLanguageConfirm}
        defaultOriginalLanguage={translationConfig.originalLanguage}
        defaultTargetLanguage={translationConfig.targetLanguage}
      />
    </main>
  );
}
