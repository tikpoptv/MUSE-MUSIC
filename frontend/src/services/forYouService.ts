import api from './api';
import type { ForYouResponse } from '@/types/forYou';

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== 'false';

// Helper function to calculate mood percentages from stats
function calculateMoodStats(userStats: {
  happy: number;
  sad: number;
  fear: number;
  anger: number;
  disgust: number;
  surprise: number;
}): Array<{ moodType: string; count: number; percentage: number }> {
  const moods = [
    { type: 'happy', count: userStats.happy },
    { type: 'sad', count: userStats.sad },
    { type: 'fear', count: userStats.fear },
    { type: 'anger', count: userStats.anger },
    { type: 'disgust', count: userStats.disgust },
    { type: 'surprise', count: userStats.surprise },
  ];

  const total = moods.reduce((sum, m) => sum + m.count, 0);
  if (total === 0) return [];

  return moods
    .filter(m => m.count > 0)
    .map(m => ({
      moodType: m.type,
      count: m.count,
      percentage: Math.round((m.count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count); // Sort by count descending
}

const MOCK_FOR_YOU: ForYouResponse = {
  moods: [
    { moodType: 'happy', count: 15, percentage: 45 },
    { moodType: 'powerful', count: 8, percentage: 24 },
    { moodType: 'calm', count: 7, percentage: 21 },
    { moodType: 'energetic', count: 3, percentage: 9 },
  ],
  recentlySearched: [
    {
      id: 'recent-1',
      title: 'GO!',
      artist: 'CORTIS',
      image: '/images/cover.jpg',
      href: '#',
    },
    {
      id: 'recent-2',
      title: 'Golden',
      artist: 'HUNTR/X',
      image: '/images/cover.jpg',
      href: '#',
    },
    {
      id: 'recent-3',
      title: 'Takedown',
      artist: 'HUNTR/X',
      image: '/images/cover.jpg',
      href: '#',
    },
    {
      id: 'recent-4',
      title: 'Orange',
      artist: 'CHANNEL',
      image: '/images/cover.jpg',
      href: '#',
    },
  ],
  recommendations: {
    title: 'Our recommend for you',
    description: "Here's the track that matches your mood right now. Hit play and let the rhythm speak for itself.",
    subsections: [
      {
        title: 'Powerful',
        items: [
          {
            id: 'powerful-1',
            title: 'AM I THE DRAMA',
            artist: 'CARDI B',
            image: '/images/cover.jpg',
            href: '#',
          },
          {
            id: 'powerful-2',
            title: 'BUTTERFLY EFFECT',
            artist: 'Travis Scott',
            image: '/images/cover.jpg',
            href: '#',
          },
          {
            id: 'powerful-3',
            title: 'Safe (feat. Kehlani)',
            artist: 'CARDI B, Kehlani',
            image: '/images/cover.jpg',
            href: '#',
          },
          {
            id: 'powerful-4',
            title: 'XOXO',
            artist: 'David',
            image: '/images/cover.jpg',
            href: '#',
          },
          {
            id: 'powerful-5',
            title: 'Pick It Up (feat. Selena Gomez)',
            artist: 'CARDI B, Selena Gomez',
            image: '/images/cover.jpg',
            href: '#',
          },
        ],
      },
      {
        title: 'Korean',
        items: [
          {
            id: 'korean-1',
            title: 'Golden',
            artist: 'HUNTR/X',
            image: '/images/cover.jpg',
            href: '#',
          },
          {
            id: 'korean-2',
            title: 'Takedown',
            artist: 'HUNTR/X',
            image: '/images/cover.jpg',
            href: '#',
          },
          {
            id: 'korean-3',
            title: 'Red lolipop',
            artist: 'God',
            image: '/images/cover.jpg',
            href: '#',
          },
          {
            id: 'korean-4',
            title: 'Messy',
            artist: 'FLUX',
            image: '/images/cover.jpg',
            href: '#',
          },
          {
            id: 'korean-5',
            title: 'Purplr lolipop',
            artist: 'God',
            image: '/images/cover.jpg',
            href: '#',
          },
        ],
      },
    ],
  },
  topHits: [
    {
      id: 'top-1',
      title: 'AM I THE DRAMA',
      artist: 'CARDI B',
      image: '/images/cover.jpg',
      href: '#',
    },
    {
      id: 'top-2',
      title: 'BUTTERFLY EFFECT',
      artist: 'Travis Scott',
      image: '/images/cover.jpg',
      href: '#',
    },
    {
      id: 'top-3',
      title: 'Safe (feat. Kehlani)',
      artist: 'CARDI B, Kehlani',
      image: '/images/cover.jpg',
      href: '#',
    },
    {
      id: 'top-4',
      title: 'XOXO',
      artist: 'David',
      image: '/images/cover.jpg',
      href: '#',
    },
    {
      id: 'top-5',
      title: 'Pick It Up (feat. Selena Gomez)',
      artist: 'CARDI B, Selena Gomez',
      image: '/images/cover.jpg',
      href: '#',
    },
  ],
};

export async function fetchForYouContent(): Promise<ForYouResponse> {
  if (USE_MOCKS) return MOCK_FOR_YOU;

  await new Promise((resolve) => setTimeout(resolve, 1500));

  try {
    // Try to fetch user stats for mood calculation
    const statsRes = await api.get<{ success: boolean; data?: { happy: number; sad: number; fear: number; anger: number; disgust: number; surprise: number } }>('/api/user/stats');
    
    const forYouRes = await api.get<Omit<ForYouResponse, 'moods'>>('/api/for-you');

    if (forYouRes.success && forYouRes.data) {
      // If we have user stats, calculate moods from them
      if (statsRes.success && statsRes.data) {
        const userStats: { happy: number; sad: number; fear: number; anger: number; disgust: number; surprise: number } = statsRes.data as unknown as { happy: number; sad: number; fear: number; anger: number; disgust: number; surprise: number };
        const moods = calculateMoodStats(userStats);
        return {
          ...forYouRes.data,
          moods: moods.length > 0 ? moods : MOCK_FOR_YOU.moods,
        };
      }
      
      // Otherwise use provided moods or fallback to mock
      return {
        ...forYouRes.data,
        moods: (forYouRes.data as ForYouResponse).moods || MOCK_FOR_YOU.moods,
      };
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[forYouService] Error fetching data:', error);
    }
  }

  return MOCK_FOR_YOU;
}

const forYouApi = { fetchForYouContent };
export default forYouApi;

