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
import ReAnalyzeConfirmModal from '@/components/modals/ReAnalyzeConfirmModal';
import toast from 'react-hot-toast';

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
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [syncedLyricsLines, setSyncedLyricsLines] = useState<SyncedLyricsLine[]>([]);
  const [durationMatch, setDurationMatch] = useState<boolean | null>(null);
  const [seekToTime, setSeekToTime] = useState<number | undefined>(undefined);
  const [isReAnalyzeModalOpen, setIsReAnalyzeModalOpen] = useState(false);
  const [isReAnalyzing, setIsReAnalyzing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Thai');

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

  const handleReAnalyzeClick = () => {
    setIsReAnalyzeModalOpen(true);
  };

  const handleReAnalyzeConfirm = async () => {
    if (!processingID || processingID === 'undefined') {
      toast.error('Invalid processing ID');
      return;
    }

    try {
      setIsReAnalyzing(true);
      
      await analysisService.reAnalyze(processingID, {
        actions: {
          translate: true,
          mood: true
        },
        translationConfig: {
          targetLanguage: selectedLanguage
        }
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
          }
          toast.success('Re-analysis completed!');
        } catch {
          toast.error('Failed to reload data');
        } finally {
          setIsReAnalyzing(false);
          setIsReAnalyzeModalOpen(false);
        }
      }, 2000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to re-analyze');
      setIsReAnalyzing(false);
      setIsReAnalyzeModalOpen(false);
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
          {/* ฝั่งย่อ (40%) */}
          <div className="space-y-6">
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
                <button className="p-3 rounded-full hover:bg-gray-100 transition-colors">
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
            <div className="flex flex-col items-center mx-auto" style={{ width: '304px' }}>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 w-full">Recommend with language</h2>
              <div className="grid grid-cols-2 gap-3 w-full">
                <MusicCard
                  image="/placeholder.jpg"
                  title="Saranghe"
                  artist="HUNTR/X"
                  href="/songs/1"
                />
                <MusicCard
                  image="/placeholder.jpg"
                  title="Takedown"
                  artist="HUNTR/X"
                  href="/songs/2"
                />
              </div>
            </div>

            {/* Recommend with Mood */}
            <div className="flex flex-col items-center mx-auto" style={{ width: '304px' }}>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 w-full">Recommend with Mood</h2>
              <div className="grid grid-cols-2 gap-3 w-full">
                <MusicCard
                  image="/placeholder.jpg"
                  title="Good"
                  artist="B"
                  href="/songs/3"
                />
                <MusicCard
                  image="/placeholder.jpg"
                  title="Lalala"
                  artist="YEP."
                  href="/songs/4"
                />
              </div>
            </div>
          </div>

          {/* ฝั่งรายละเอียด (60%) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
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
                onSelectedLanguageChange={setSelectedLanguage}
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
                  seekToTime={seekToTime}
                  readonly={true}
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
        onClose={() => setIsReAnalyzeModalOpen(false)}
        onConfirm={handleReAnalyzeConfirm}
        isProcessing={isReAnalyzing}
        targetLanguage={selectedLanguage}
      />
    </main>
  );
}

