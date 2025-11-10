'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Heart, Share2, MoreVertical } from 'lucide-react';
import MusicCard from '@/components/MusicCard';
import SkeletonCard from '@/components/SkeletonCard';
import LyricsTranslationViewer from '@/components/LyricsTranslationViewer';
import SummarySection from '@/components/SummarySection';
import MoodAnalyzeSection from '@/components/MoodAnalyzeSection';
import SongActionButtons from '@/components/SongActionButtons';
import FeedbackSection, { type FeedbackSectionRef } from '@/components/FeedbackSection';
import CoverImageUpload from '@/components/CoverImageUpload';
import SyncedLyricsPlayer, { type SyncedLyricsLine } from '@/components/SyncedLyricsPlayer';
import ProcessingVersionBar from '@/components/ProcessingVersionBar';
import { songService, type SongDetail, type ProcessingDetail } from '@/services/songService';
import { analysisService } from '@/services/analysisService';
import { recommendSongsService, type RecommendedSong } from '@/services/recommendSongsService';
import shareService from '@/services/shareService';
import ReAnalyzeConfirmModal from '@/components/modals/ReAnalyzeConfirmModal';
import toast from 'react-hot-toast';

const languageCodeToName: Record<string, string> = {
  'th': 'Thai',
  'en': 'English',
  'ja': 'Japanese',
  'ko': 'Korean',
  'English': 'English',
  'Thai': 'Thai',
  'Japanese': 'Japanese',
  'Korean': 'Korean'
};

export default function SongDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const songID = params.songID as string;
  const processingID = searchParams.get('processingID') || '';

  const [songData, setSongData] = useState<SongDetail | null>(null);
  const [processingData, setProcessingData] = useState<ProcessingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSubmittedRating, setHasSubmittedRating] = useState(false);
  const feedbackSectionRef = useRef<FeedbackSectionRef>(null);
  
  const handleRatingSubmitted = useCallback(() => {
    setHasSubmittedRating(true);
  }, []);

  const handleIsPlayingChange = useCallback((playing: boolean) => {
    setIsPlaying(playing);
  }, []);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [syncedLyricsLines, setSyncedLyricsLines] = useState<SyncedLyricsLine[]>([]);
  const [durationMatch, setDurationMatch] = useState<boolean | null>(null);
  const [seekToTime, setSeekToTime] = useState<number | undefined>(undefined);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerPlayPauseRef = useRef<(() => void) | null>(null);
  const [isReAnalyzeModalOpen, setIsReAnalyzeModalOpen] = useState(false);
  const [isReAnalyzing, setIsReAnalyzing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Thai');
  const [pendingLanguageChange, setPendingLanguageChange] = useState<string | null>(null);
  const [recommendedByLanguage, setRecommendedByLanguage] = useState<RecommendedSong[]>([]);
  const [recommendedByMood, setRecommendedByMood] = useState<RecommendedSong[]>([]);
  const [loadingRecommendationsByLanguage, setLoadingRecommendationsByLanguage] = useState(false);
  const [loadingRecommendationsByMood, setLoadingRecommendationsByMood] = useState(false);
  const [isCreatingShareLink, setIsCreatingShareLink] = useState(false);

  const languageNameToCode: Record<string, string> = {
    'Thai': 'th',
    'English': 'en',
    'Japanese': 'ja',
    'Korean': 'ko'
  };


  useEffect(() => {
    const fetchSongData = async () => {
      if (!songID || songID === 'undefined') {
        toast.error('Invalid song ID');
        router.push('/');
        return;
      }

      if (!processingID || processingID === 'undefined') {
        toast.error('Invalid processing ID');
        router.push('/');
        return;
      }

      try {
        setLoading(true);
        const data = await songService.getSongDetail(songID, processingID);
        
                setSongData(data.song);
                if (data.processing) {
                  setProcessingData(data.processing);
                  if (data.processing.coverImage) {
                    const coverImageUrl = data.processing.coverImage;
                    setCoverImage(coverImageUrl.startsWith('http') ? new URL(coverImageUrl).pathname : coverImageUrl);
                  }
                  if (data.processing.targetLanguage) {
                    setSelectedLanguage(data.processing.targetLanguage);
                  }
                }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load song details');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchSongData();
  }, [songID, processingID, router]);

  useEffect(() => {
    const fetchRecommendationsByLanguage = async () => {
      if (!processingData?.originalLanguage) return;

      try {
        setLoadingRecommendationsByLanguage(true);
        
        const originalLang = processingData.originalLanguage;
        let languageCode: string | null = null;

        const langLower = originalLang.toLowerCase();
        if (languageCodeToName[langLower]) {
          languageCode = langLower;
        } else if (languageCodeToName[originalLang]) {
          languageCode = originalLang;
        } else {
          const matchedKey = Object.keys(languageCodeToName).find(key => 
            languageCodeToName[key] === originalLang || key.toLowerCase() === langLower
          );
          languageCode = matchedKey || null;
        }

        if (languageCode) {
          const languageSongs = await recommendSongsService.getRecommendedSongsByLanguageAndMood(
            languageCode, 
            undefined, 
            2,
            songID
          );
          setRecommendedByLanguage(languageSongs);
        }
      } catch {
        // Silently fail - recommendations are optional
      } finally {
        setLoadingRecommendationsByLanguage(false);
      }
    };

    if (processingData?.originalLanguage) {
      fetchRecommendationsByLanguage();
    }
  }, [processingData?.originalLanguage, songID]);

  useEffect(() => {
    const fetchRecommendationsByMood = async () => {
      if (!processingData) return;

      let topMood: string | null = null;
      
      if (processingData.mood && Array.isArray(processingData.mood) && processingData.mood.length > 0) {
        const sortedMoods = [...processingData.mood].sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
        topMood = sortedMoods[0].type;
      } else if (processingData.moodType) {
        try {
          const parsed = JSON.parse(processingData.moodType) as Array<{ type: string; percentage: number }>;
          if (Array.isArray(parsed) && parsed.length > 0) {
            const sortedMoods = [...parsed].sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
            topMood = sortedMoods[0].type;
          }
        } catch {
          topMood = processingData.moodType;
        }
      }

      if (!topMood || !processingData.originalLanguage) return;

      try {
        setLoadingRecommendationsByMood(true);
        
        const moodSongs = await recommendSongsService.getRecommendedSongsByLanguageAndMood(
          processingData.originalLanguage,
          topMood,
          2,
          songID
        );
        setRecommendedByMood(moodSongs);
      } catch {
      } finally {
        setLoadingRecommendationsByMood(false);
      }
    };

    if (processingData) {
      fetchRecommendationsByMood();
    }
  }, [processingData, songID]);

  const handleLanguageChange = async (language: string) => {
    if (!songID || songID === 'undefined') return;
    
    const languageCode = languageNameToCode[language];
    if (!languageCode) {
      toast.error('Invalid language selected');
      return;
    }

    if (language === processingData?.targetLanguage) {
      return;
    }

    try {
      setPendingLanguageChange(language);
      const checkResult = await songService.checkProcessingByLanguage(songID, languageCode);

      if (checkResult.exists && checkResult.processingID) {
        toast.success('Found existing translation for this language');
        window.location.href = `/song/${songID}?processingID=${checkResult.processingID}`;
      } else {
        setIsReAnalyzeModalOpen(true);
        setPendingLanguageChange(language);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to check processing');
      setPendingLanguageChange(null);
    }
  };

  const handleReAnalyzeClick = () => {
    setIsReAnalyzeModalOpen(true);
  };

  const handleShare = async () => {
    if (!processingID || processingID === 'undefined') {
      toast.error('No processing ID available');
      return;
    }

    try {
      setIsCreatingShareLink(true);
      const shareLink = await shareService.createShareLink(processingID);
      
      await navigator.clipboard.writeText(shareLink.shareUrl);
      toast.success(shareLink.alreadyExists ? 'Share link copied to clipboard!' : 'Share link created and copied to clipboard!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create share link');
    } finally {
      setIsCreatingShareLink(false);
    }
  };

  const handleReAnalyzeConfirm = async () => {
    if (!processingID || processingID === 'undefined') {
      toast.error('Invalid processing ID');
      return;
    }

    if (!processingData) {
      toast.error('Processing data not loaded');
      return;
    }

    const rawTarget = pendingLanguageChange 
      ? pendingLanguageChange 
      : processingData.targetLanguage || selectedLanguage;
    const targetLanguage = languageCodeToName[rawTarget as keyof typeof languageCodeToName] || rawTarget;

    const rawOriginal = processingData.originalLanguage;
    const originalLanguage = rawOriginal ? (languageCodeToName[rawOriginal as keyof typeof languageCodeToName] || rawOriginal) : undefined;

    try {
      setIsReAnalyzing(true);
      
      await analysisService.reAnalyze(processingID, {
        actions: {
          translate: true,
          mood: true
        },
        translationConfig: { originalLanguage, targetLanguage }
      });

      toast.success('Re-analyzing... Please wait a moment.');
      
      setTimeout(async () => {
        try {
          const data = await songService.getSongDetail(songID, processingID);
          setSongData(data.song);
          if (data.processing) {
            setProcessingData(data.processing);
            if (data.processing.coverImage) {
              const coverImageUrl = data.processing.coverImage;
              setCoverImage(coverImageUrl.startsWith('http') ? new URL(coverImageUrl).pathname : coverImageUrl);
            }
            if (pendingLanguageChange) {
              setSelectedLanguage(pendingLanguageChange);
            }
          }
          toast.success('Re-analysis completed!');
        } catch {
          toast.error('Failed to reload data');
        } finally {
          setIsReAnalyzing(false);
          setIsReAnalyzeModalOpen(false);
          setPendingLanguageChange(null);
        }
      }, 2000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to re-analyze');
      setIsReAnalyzing(false);
      setIsReAnalyzeModalOpen(false);
      setPendingLanguageChange(null);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-64 mb-4 mx-auto"></div>
            <div className="h-9 bg-gray-200 rounded w-96 mb-8 mx-auto"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-8">
              {/* ฝั่งย่อ Skeleton */}
              <div className="space-y-6">
                {/* Centered Section */}
                <div className="flex flex-col items-center">
                  {/* Song Cover Skeleton */}
                  <div className="bg-gray-200 rounded-lg" style={{ width: '304px', height: '302px' }}></div>
                  
                  {/* Action Icons Skeleton */}
                  <div className="flex items-center gap-4 justify-center mt-6">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  </div>
                  
                  {/* Feedback Section Skeleton */}
                  <div 
                    className="flex flex-col items-center rounded-xl bg-white mt-6"
                    style={{ 
                      width: '304px', 
                      height: '324px', 
                      padding: '24px', 
                      gap: '19px', 
                      flexShrink: 0,
                      borderRadius: '12px',
                      background: '#FFF',
                      boxShadow: '0 0 18px 0 rgba(255, 0, 102, 0.25)'
                    }}
                  >
                    {/* Title Skeleton */}
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    
                    {/* Star Rating Skeleton */}
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="bg-gray-200 rounded" style={{ width: '32px', height: '32px' }}></div>
                      ))}
                    </div>
                    
                    {/* Textarea Skeleton */}
                    <div 
                      className="bg-gray-200 rounded"
                      style={{
                        height: '80px',
                        alignSelf: 'stretch',
                        borderRadius: '6px'
                      }}
                    ></div>
                    
                    {/* Submit Button Skeleton */}
                    <div 
                      className="bg-gray-200 rounded"
                      style={{
                        height: '40px',
                        alignSelf: 'stretch',
                        borderRadius: '6px'
                      }}
                    ></div>
                  </div>
                </div>
                
                {/* Recommend with language Skeleton */}
                <div className="flex flex-col items-center mx-auto" style={{ width: '304px' }}>
                  <div className="h-6 bg-gray-200 rounded w-40 mb-3"></div>
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                </div>
                
                {/* Recommend with Mood Skeleton */}
                <div className="flex flex-col items-center mx-auto" style={{ width: '304px' }}>
                  <div className="h-6 bg-gray-200 rounded w-40 mb-3"></div>
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                </div>
              </div>
              
              {/* ฝั่งรายละเอียด Skeleton */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '54px', width: '100%' }}>
                {/* Summary Skeleton */}
                <div style={{ width: '100%' }}>
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-1 bg-gray-200 mb-4" style={{ width: '100%' }}></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
                
                {/* Lyrics Translation Viewer Skeleton */}
                <div style={{ width: '100%', height: '466px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
                  {/* Header Skeleton */}
                  <div className="flex items-center justify-between px-4 w-full bg-gray-200" style={{ height: '70px', flexShrink: 0, boxSizing: 'border-box', borderRadius: '12px 12px 0 0' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gray-300 rounded"></div>
                      <div className="bg-gray-300 rounded" style={{ width: '148px', height: '38px', borderRadius: '14px' }}></div>
                    </div>
                    <div className="w-5 h-5 bg-gray-300 rounded"></div>
                  </div>
                  
                  {/* Content Skeleton */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 overflow-y-auto w-full" style={{ height: '396px', flexShrink: 0, boxSizing: 'border-box', borderRadius: '0 0 12px 12px' }}>
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div 
                          key={i} 
                          className="h-4 bg-gray-200 rounded" 
                          style={{ width: `${[95, 80, 70, 85, 90, 75, 88, 82][i - 1] || 80}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Mood Analyze Section Skeleton */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  alignSelf: 'stretch',
                  borderRadius: '12px',
                  background: '#FFF',
                  boxShadow: '0 2px 40px -3px rgba(255, 239, 143, 0.50)'
                }}>
                  {/* Header Skeleton */}
                  <div className="flex items-center gap-2 px-6 w-full bg-gray-200" style={{ height: '70px', flexShrink: 0, borderRadius: '12px 12px 0 0' }}>
                    <div className="w-7 h-7 bg-gray-300 rounded"></div>
                    <div className="h-6 bg-gray-300 rounded w-32"></div>
                  </div>
                  
                  {/* Content Skeleton */}
                  <div className="flex w-full px-6 gap-6 pt-6 pb-6">
                    {/* Left side - 30% - Icon */}
                    <div className="flex-shrink-0" style={{ width: '30%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div className="w-20 h-20 bg-gray-200 rounded"></div>
                    </div>
                    
                    {/* Right side - 70% - Mood bars */}
                    <div className="flex-1" style={{ width: '70%' }}>
                      <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i}>
                            <div className="flex justify-between items-center mb-1">
                              <div className="h-4 bg-gray-200 rounded w-16"></div>
                              <div className="h-4 bg-gray-200 rounded w-10"></div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-gray-300 h-2 rounded-full" style={{ width: `${[40, 25, 30, 5][i - 1]}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                </div>
                
                {/* Action Buttons Skeleton */}
                <div className="flex items-center justify-between w-full" style={{ gap: '22px' }}>
                  {/* Re-analyze Button Skeleton */}
                  <div className="bg-gray-200 rounded-lg" style={{ height: '60px', width: '140px', borderRadius: '14px' }}></div>
                  {/* One more song Button Skeleton */}
                  <div className="bg-gray-200 rounded-lg" style={{ height: '60px', flex: 1, maxWidth: '400px', borderRadius: '14px' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <p className="text-center mb-4" style={{ fontFamily: 'Inter', fontSize: '24px', fontStyle: 'normal', fontWeight: 600, lineHeight: 'normal', color: '#000' }}>
          We Gave It Another Spin.
        </p>
        <h1 className="text-center mb-8" style={{ fontFamily: 'Inter', fontSize: '32px', fontStyle: 'normal', fontWeight: 700, lineHeight: 'normal', color: '#000' }}>
          {songData?.songName && songData?.artistName ? (
            <>
              {songData.songName} - {songData.artistName}
              {songData.country && ` (${songData.country})`}
            </>
          ) : (
            'Song Details'
          )}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-8">
          {/* ฝั่งย่อ (40%) - Desktop only */}
          <div className="hidden lg:block space-y-6">
            {/* Centered Section */}
            <div className="flex flex-col items-center">
              {/* Song Cover Card - Read Only */}
              <CoverImageUpload
                width={304}
                height={302}
                onImageChange={undefined}
                initialImage={coverImage}
                isSaving={false}
                readonly={true}
              />

              {/* Action Icons */}
              <div className="flex items-center gap-4 justify-center mt-6">
                <button className="p-3 rounded-full hover:bg-gray-100 transition-colors">
                  <Heart className="h-6 w-6" style={{ color: '#7B61FF' }} />
                </button>
                <button 
                  onClick={handleShare}
                  disabled={isCreatingShareLink || !processingID}
                  className="p-3 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Share2 className="h-6 w-6" style={{ color: '#7B61FF' }} />
                </button>
                <button className="p-3 rounded-full hover:bg-gray-100 transition-colors">
                  <MoreVertical className="h-6 w-6" style={{ color: '#7B61FF' }} />
                </button>
              </div>

              {/* Feedback Section */}
              <FeedbackSection 
                ref={feedbackSectionRef}
                processingID={processingID} 
                onRatingSubmitted={handleRatingSubmitted}
              />
            </div>

            {/* Recommend with language */}
            {processingData?.originalLanguage && (
              <div className="flex flex-col items-center mx-auto" style={{ width: '304px' }}>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 w-full">Recommend with language</h2>
                {loadingRecommendationsByLanguage ? (
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                ) : recommendedByLanguage.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 w-full">
                    {recommendedByLanguage.map((song) => (
                      <MusicCard
                        key={`${song.id}-${song.processingID}`}
                        image={song.image}
                        title={song.title}
                        artist={song.artist}
                        href={`/song/${song.id}?processingID=${song.processingID}`}
                        mood={song.mood || null}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center w-full">No recommendations available</p>
                )}
              </div>
            )}

            {/* Recommend with Mood */}
            {processingData?.moodType && (
              <div className="flex flex-col items-center mx-auto" style={{ width: '304px' }}>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 w-full">Recommend with Mood</h2>
                {loadingRecommendationsByMood ? (
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                ) : recommendedByMood.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 w-full">
                    {recommendedByMood.map((song) => (
                      <MusicCard
                        key={`${song.id}-${song.processingID}`}
                        image={song.image}
                        title={song.title}
                        artist={song.artist}
                        href={`/song/${song.id}?processingID=${song.processingID}`}
                        mood={song.mood || null}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center w-full">No recommendations available</p>
                )}
              </div>
            )}
          </div>

          {/* Mobile: Cover + Action Icons */}
          <div className="lg:hidden flex flex-col items-center mb-6">
            <CoverImageUpload
              width={304}
              height={302}
              onImageChange={undefined}
              initialImage={coverImage}
              isSaving={false}
              readonly={true}
            />
            <div className="flex items-center gap-4 justify-center mt-6">
              <button className="p-3 rounded-full hover:bg-gray-100 transition-colors">
                <Heart className="h-6 w-6" style={{ color: '#7B61FF' }} />
              </button>
              <button className="p-3 rounded-full hover:bg-gray-100 transition-colors">
                <Share2 className="h-6 w-6" style={{ color: '#7B61FF' }} />
              </button>
              <button className="p-3 rounded-full hover:bg-gray-100 transition-colors">
                <MoreVertical className="h-6 w-6" style={{ color: '#7B61FF' }} />
              </button>
            </div>
          </div>

          {/* ฝั่งรายละเอียด (60%) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }} className="lg:items-start items-center">
            {/* Processing Version Bar */}
            {processingData && (
              <div style={{ width: '100%', marginBottom: '16px' }}>
                <ProcessingVersionBar
                  versionNumber={1}
                  processingID={processingData.processingID}
                  rating={processingData.averageRating ? Math.round(processingData.averageRating) : undefined}
                  onNewAnalyze={handleReAnalyzeClick}
                />
              </div>
            )}

            {/* Summary */}
            <div style={{ marginBottom: '54px', width: '100%' }}>
              <SummarySection processingData={processingData} />
            </div>

            {/* Lyrics Section */}
            <div style={{ marginBottom: '54px', width: '100%' }}>
              <LyricsTranslationViewer
                translation={processingData?.translation}
                originalLyrics={songData?.lyrics}
                defaultLanguage={processingData?.targetLanguage || 'Thai'}
                availableLanguages={['Thai', 'English', 'Japanese', 'Korean']}
                hasRating={hasSubmittedRating}
                onShakeFeedback={() => feedbackSectionRef.current?.shake()}
                songName={songData?.songName}
                artistName={songData?.artistName}
                targetLanguage={processingData?.targetLanguage}
                currentTime={currentTime}
                syncedLyricsLines={syncedLyricsLines}
                durationMatch={durationMatch}
                songDuration={songData?.duration}
                onSeekToTime={(time) => setSeekToTime(time)}
                onLanguageChange={handleLanguageChange}
                onSelectedLanguageChange={setSelectedLanguage}
                onPlayPause={() => playerPlayPauseRef.current?.()}
                isPlaying={isPlaying}
                syncConfirmed={processingData?.syncConfirmed || false}
                songStartTime={processingData?.songStartTime || null}
              />
            </div>

            {/* Synced Lyrics Player */}
            <div style={{ marginBottom: '54px', width: '100%' }}>
              {songData?.syncedLyrics ? (
                <SyncedLyricsPlayer
                  syncedLyrics={songData.syncedLyrics}
                  songDuration={songData.duration || undefined}
                  processingID={processingID}
                  initialYoutubeVideoId={processingData?.youtubeVideoId || null}
                  songName={songData.songName}
                  artistName={songData.artistName}
                  onCurrentTimeChange={setCurrentTime}
                  onSyncedLyricsParsed={setSyncedLyricsLines}
                  onDurationMatchChange={setDurationMatch}
                  onIsPlayingChange={handleIsPlayingChange}
                  onPlayPauseRequest={(api) => {
                    playerPlayPauseRef.current = api.playPause;
                  }}
                  seekToTime={seekToTime}
                  readonly={true}
                  initialSyncConfirmed={processingData?.syncConfirmed || false}
                  initialSongStartTime={processingData?.songStartTime || null}
                />
              ) : (
                <div className="w-full">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 text-center">
                      ⚠️ This song does not have synchronized lyrics available.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Mood Analyze Section */}
            <MoodAnalyzeSection processingData={processingData} />

            {/* Mobile: Feedback Section - อยู่หลัง Mood Analyze */}
            <div className="lg:hidden mt-6 w-full flex justify-center">
              <FeedbackSection 
                ref={feedbackSectionRef}
                processingID={processingID} 
                onRatingSubmitted={handleRatingSubmitted}
              />
            </div>

            {/* Mobile: Recommend with language - อยู่หลัง Mood Analyze */}
            {processingData?.originalLanguage && (
              <div className="lg:hidden flex flex-col items-center mx-auto mt-6 mb-6" style={{ width: '100%', maxWidth: '304px' }}>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 w-full">Recommend with language</h2>
                {loadingRecommendationsByLanguage ? (
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                ) : recommendedByLanguage.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 w-full">
                    {recommendedByLanguage.map((song) => (
                      <MusicCard
                        key={`${song.id}-${song.processingID}`}
                        image={song.image}
                        title={song.title}
                        artist={song.artist}
                        href={`/song/${song.id}?processingID=${song.processingID}`}
                        mood={song.mood || null}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center w-full">No recommendations available</p>
                )}
              </div>
            )}

            {/* Mobile: Recommend with Mood - อยู่หลัง Mood Analyze */}
            {processingData?.moodType && (
              <div className="lg:hidden flex flex-col items-center mx-auto mt-6" style={{ width: '100%', maxWidth: '304px' }}>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 w-full">Recommend with Mood</h2>
                {loadingRecommendationsByMood ? (
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                ) : recommendedByMood.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 w-full">
                    {recommendedByMood.map((song) => (
                      <MusicCard
                        key={`${song.id}-${song.processingID}`}
                        image={song.image}
                        title={song.title}
                        artist={song.artist}
                        href={`/song/${song.id}?processingID=${song.processingID}`}
                        mood={song.mood || null}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center w-full">No recommendations available</p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <SongActionButtons 
              onReAnalyzeClick={handleReAnalyzeClick}
              isReAnalyzing={isReAnalyzing}
            />
          </div>
        </div>
      </div>

      {/* Re-Analyze Confirm Modal */}
      <ReAnalyzeConfirmModal
        isOpen={isReAnalyzeModalOpen}
        onClose={() => {
          setIsReAnalyzeModalOpen(false);
          setPendingLanguageChange(null);
        }}
        onConfirm={handleReAnalyzeConfirm}
        isProcessing={isReAnalyzing}
        targetLanguage={pendingLanguageChange || selectedLanguage}
      />
    </main>
  );
}

