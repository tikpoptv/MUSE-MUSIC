'use client';

import Image from 'next/image';
import { Heart, Waves, Moon, Sparkles, Meh, Thermometer, Loader, HeartCrack, Sun, SmilePlus, HeartPulse, Sparkle, UserCircle } from 'lucide-react';
import type { ProcessingDetail, MoodItem } from '@/services/songService';

interface MoodAnalyzeSectionProps {
  processingData: ProcessingDetail | null;
}

export default function MoodAnalyzeSection({ 
  processingData: _processingData
}: MoodAnalyzeSectionProps) {

  const moodIconMap: Record<string, { type: 'svg' | 'lucide', path?: string, icon?: React.ComponentType<{ className?: string }> }> = {
    // Class 0: Happy - 🙂 😄 😁 😆 😀 😊 😃
    happy: { type: 'svg', path: '/icons/happy-icon.svg' },
    // Class 1: Sad - 😢 😥 😰 😓 🙁 😟 😞 😔 😣 😫 😩
    sad: { type: 'svg', path: '/icons/sad-icon.svg' },
    // Class 2: Anger - 😡 😠 😤 😖
    anger: { type: 'svg', path: '/icons/anger-icon.svg' },
    // Class 3: Disgust - 🙄 😒 😑 😕
    disgust: { type: 'svg', path: '/icons/disgust-icon.svg' },
    // Class 4, 5: Fear - 😱 😨 😧 😦
    fear: { type: 'svg', path: '/icons/fear-icon.svg' },
    // Class 6: Surprise - 😮 😲 😯
    surprise: { type: 'svg', path: '/icons/surprise-icon.svg' },
    // Class 7: Sleepy - 😴 😪
    sleepy: { type: 'lucide', icon: Moon },
    // Class 8: Playful - 😋 😜 😝 😛
    playful: { type: 'lucide', icon: Sparkles },
    // Class 9: Love - 😍 💕 😘 😚 😙 😗
    love: { type: 'lucide', icon: Heart },
    // Class 10: Calm - 😌
    calm: { type: 'lucide', icon: Waves },
    // Class 11: Neutral - 😐
    neutral: { type: 'lucide', icon: Meh },
    // Class 12: Sick - 😷
    sick: { type: 'lucide', icon: Thermometer },
    // Class 13: Embarrassed - 😳
    embarrassed: { type: 'lucide', icon: UserCircle },
    // Class 14: Dizzy - 😵
    dizzy: { type: 'lucide', icon: Loader },
    // Class 15: Broken Heart - 💔
    'broken heart': { type: 'lucide', icon: HeartCrack },
    // Class 16: Cool - 😎 😈
    cool: { type: 'lucide', icon: Sun },
    // Class 17: Mixed - 🙃 😏 😂 😭 (อารมณ์ผสม: ประชด, ขำ, ร้องไห้)
    mixed: { type: 'lucide', icon: SmilePlus },
    // Class 18: Awkward - 😬 😅 😶
    awkward: { type: 'lucide', icon: SmilePlus },
    // Class 19: Wink - 😉
    wink: { type: 'lucide', icon: SmilePlus },
    // Class 20: Hearts - 💖 💙 💚 💗 💓 💜 💘 💛 (หัวใจหลากสี)
    hearts: { type: 'lucide', icon: HeartPulse },
    // Class 21: Angel - 😇
    angel: { type: 'lucide', icon: Sparkle }
  };

  const parseMoodData = (): MoodItem[] => {
    const processingData = _processingData;
    if (!processingData) return [];

    if (processingData.mood && Array.isArray(processingData.mood)) {
      return processingData.mood.map(m => ({
        type: m.type,
        percentage: typeof m.percentage === 'number' ? m.percentage : 0
      }));
    }

    if (processingData.moodType) {
      try {
        const parsed = JSON.parse(processingData.moodType);
        if (Array.isArray(parsed)) {
          return parsed.map(m => ({
            type: m.type,
            percentage: typeof m.percentage === 'number' ? m.percentage : 0
          }));
        }
      } catch {
      }
      
      if (processingData.moodScore !== undefined && processingData.moodScore !== null) {
        return [{
          type: processingData.moodType,
          percentage: processingData.moodScore <= 1 ? processingData.moodScore * 100 : processingData.moodScore
        }];
      }
    }

    return [];
  };

  const moodData = parseMoodData()
    .filter(mood => mood.percentage > 0) // Filter out moods with 0%
    .sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
  const topMood = moodData.length > 0 ? moodData[0] : null;
  
  // Normalize mood type: lowercase and handle spaces
  const normalizeMoodKey = (moodType: string): string => {
    if (!moodType) return '';
    return moodType.toLowerCase().trim().replace(/\s+/g, ' ');
  };
  
  const topMoodKey = topMood?.type ? normalizeMoodKey(topMood.type) : '';
  const topMoodIcon = topMoodKey ? moodIconMap[topMoodKey] : undefined;
  
  // Debug: log if mood icon not found
  if (topMood && topMoodKey && !topMoodIcon && process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.warn('Mood icon not found for:', topMood.type, 'normalized:', topMoodKey, 'available keys:', Object.keys(moodIconMap));
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      alignSelf: 'stretch',
      borderRadius: '12px',
      background: '#FFF',
      boxShadow: '0 2px 40px -3px rgba(255, 239, 143, 0.50)'
    }}>
      {/* Header Section */}
      <div className="flex items-center gap-2 px-6 w-full" style={{ backgroundColor: '#F5F5F5', height: '70px', flexShrink: 0 }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M25.6667 12.8334V14C25.6549 16.3548 24.9308 18.6508 23.5897 20.5863C22.2486 22.5218 20.3531 24.0061 18.1526 24.8443C15.9521 25.6824 13.5494 25.835 11.2605 25.282C8.97164 24.7291 6.90364 23.4964 5.32841 21.7462C3.75317 19.9959 2.74443 17.8099 2.4348 15.4756C2.12518 13.1414 2.52915 10.768 3.59362 8.6676C4.65809 6.5672 6.33323 4.83807 8.39882 3.70752C10.4644 2.57697 12.8238 2.09793 15.1667 2.33338" stroke="#7B61FF" strokeWidth="2.33333" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9.33325 16.3335C9.33325 16.3335 11.0833 18.6668 13.9999 18.6668C16.9166 18.6668 18.6666 16.3335 18.6666 16.3335" stroke="#7B61FF" strokeWidth="2.33333" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10.5 10.5H10.5117" stroke="#7B61FF" strokeWidth="2.33333" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M17.5 10.5H17.5117" stroke="#7B61FF" strokeWidth="2.33333" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M18.6667 5.8335H25.6667" stroke="#7B61FF" strokeWidth="2.33333" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M22.1667 2.3335V9.3335" stroke="#7B61FF" strokeWidth="2.33333" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h2 className="text-xl font-semibold text-gray-900">Mood Analyze</h2>
      </div>

      {/* Content Section - 30% left, 70% right */}
      {moodData.length > 0 ? (
        <div className="flex w-full px-6 gap-6 pt-6 pb-6">
          {/* Left side - 30% - Dynamic mood icon */}
          <div className="flex-shrink-0" style={{ width: '30%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {topMoodIcon ? (
              <div
                aria-label={`Top mood: ${topMood?.type}`}
                className="flex items-center justify-center rounded-2xl"
                style={{ width: 100, height: 100, backgroundColor: '#F3F0FF' }}
              >
                {topMoodIcon.type === 'svg' && topMoodIcon.path ? (
                  <Image
                    src={topMoodIcon.path}
                    alt={`${topMood?.type} mood icon`}
                    width={64}
                    height={64}
                    className="w-16 h-16"
                  />
                ) : topMoodIcon.type === 'lucide' && topMoodIcon.icon ? (
                  <topMoodIcon.icon className="w-16 h-16 text-[#7B61FF]" />
                ) : null}
              </div>
            ) : (
              <Image
                src="/images/songiconhappy.svg"
                alt="Mood Icon"
                width={100}
                height={100}
                className="w-full h-auto max-w-[100px]"
              />
            )}
          </div>

          {/* Right side - 70% - Mood bars */}
          <div className="flex-1" style={{ width: '70%' }}>
            <div className="space-y-4">
              {moodData.map((mood, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{mood.type}</span>
                    <span className="text-sm text-gray-600">{mood.percentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#7B61FF] h-2 rounded-full transition-all"
                      style={{ 
                        width: `${mood.percentage}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ width: '100%' }} className="py-8 px-6 flex flex-col items-center justify-center min-h-[200px]">
          <div className="text-gray-400 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12h.01M15 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>
          <p className="text-gray-500 text-center text-sm">Mood analysis not available</p>
          <p className="text-gray-400 text-center text-xs mt-1">Please perform mood analysis first</p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="px-6 pb-4 flex justify-center w-full">
        <p className="text-xs text-gray-400 text-center">
          All data is generated using LLM OSS 120B. Results are AI predictions and may not be accurate.
        </p>
      </div>

    </div>
  );
}

