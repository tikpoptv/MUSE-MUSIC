'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Heart, Share2, MoreVertical } from 'lucide-react';
import MusicCard from '@/components/MusicCard';
import SkeletonCard from '@/components/SkeletonCard';
import LyricsTranslationViewer from '@/components/LyricsTranslationViewer';
import SongDetailsCard from '@/components/SongDetailsCard';
import SummarySection from '@/components/SummarySection';
import MoodAnalyzeSection from '@/components/MoodAnalyzeSection';
import SongActionButtons from '@/components/SongActionButtons';
import FeedbackSection, { type FeedbackSectionRef } from '@/components/FeedbackSection';
import ShareModal from '@/components/ShareModal';
import CoverImageUpload from '@/components/CoverImageUpload';
import { songService, type SongDetail, type ProcessingDetail } from '@/services/songService';
import toast from 'react-hot-toast';

export default function SongAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const songID = params.songID as string;
  const processingID = params.processingID as string;

  const [songData, setSongData] = useState<SongDetail | null>(null);
  const [processingData, setProcessingData] = useState<ProcessingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const feedbackSectionRef = useRef<FeedbackSectionRef>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);

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
                }
        
        // eslint-disable-next-line no-console
        console.log('Fetched song data:', data);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching song:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to load song details');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchSongData();
  }, [songID, processingID, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="animate-pulse">
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
                {/* Song Details Card Skeleton */}
                <div className="p-6 w-full">
                  <div className="flex flex-col gap-4">
                    {/* Song Name */}
                    <div className="flex items-center" style={{ gap: '12px' }}>
                      <div className="h-4 bg-gray-200 rounded" style={{ width: '100px' }}></div>
                      <div className="bg-gray-200 rounded" style={{ width: '300px', height: '36px', borderRadius: '6px' }}></div>
                    </div>
                    {/* Song Name English */}
                    <div className="flex items-center" style={{ gap: '12px' }}>
                      <div className="h-4 bg-gray-200 rounded" style={{ width: '100px' }}></div>
                      <div className="bg-gray-200 rounded" style={{ width: '300px', height: '36px', borderRadius: '6px' }}></div>
                    </div>
                    {/* Artist */}
                    <div className="flex items-center" style={{ gap: '12px' }}>
                      <div className="h-4 bg-gray-200 rounded" style={{ width: '100px' }}></div>
                      <div className="bg-gray-200 rounded" style={{ width: '300px', height: '36px', borderRadius: '6px' }}></div>
                    </div>
                    {/* Country */}
                    <div className="flex items-center" style={{ gap: '12px' }}>
                      <div className="h-4 bg-gray-200 rounded" style={{ width: '100px' }}></div>
                      <div className="bg-gray-200 rounded" style={{ width: '300px', height: '36px', borderRadius: '6px' }}></div>
                    </div>
                    {/* Language */}
                    <div className="flex items-center" style={{ gap: '12px' }}>
                      <div className="h-4 bg-gray-200 rounded" style={{ width: '100px' }}></div>
                      <div className="bg-gray-200 rounded" style={{ width: '300px', height: '36px', borderRadius: '6px' }}></div>
                    </div>
                  </div>
                </div>
                
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
        <h1 className="text-center text-black font-semibold mb-8" style={{ fontFamily: 'Inter', fontSize: '32px', fontWeight: 600 }}>
          You&apos;re the First Explorer of this song!
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-8">
          {/* ฝั่งย่อ (40%) */}
          <div className="space-y-6">
            {/* Centered Section */}
            <div className="flex flex-col items-center">
              {/* Song Cover Card */}
              <CoverImageUpload
                width={304}
                height={302}
                onImageChange={setCoverImage}
                initialImage={coverImage}
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
                onRatingChange={setRating}
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '54px', width: '100%' }}>
            {/* Song Details Card */}
            <SongDetailsCard songData={songData} processingData={processingData} />

            {/* Summary */}
            <SummarySection processingData={processingData} />

            {/* Lyrics Section */}
            <LyricsTranslationViewer
              translation={processingData?.translation}
              originalLyrics={songData?.lyrics}
              defaultLanguage={processingData?.targetLanguage || 'Thai'}
              availableLanguages={['Thai', 'English', 'Japanese', 'Korean']}
              hasRating={rating > 0}
              onSave={() => setShowShareModal(true)}
              onShakeFeedback={() => feedbackSectionRef.current?.shake()}
            />

            {/* Mood Analyze Section */}
            <MoodAnalyzeSection processingData={processingData} />

            {/* Action Buttons */}
            <SongActionButtons />
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onConfirm={() => {
          setShowShareModal(false);
          // TODO: Call API to share result
          toast.success('แชร์ผลลัพธ์เรียบร้อยแล้ว');
        }}
        onCancel={() => {
          setShowShareModal(false);
        }}
      />
    </main>
  );
}

