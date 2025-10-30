import api from './api';
import type { HomeResponse, HomeSection, HomeTrackItem } from '@/types/home';

/**
 * Fetch home content from backend. Endpoint can be adjusted without changing callers.
 * Expected BE response shape: { success: boolean, data: HomeResponse }
 */
// ใช้ mock เป็นค่าเริ่มต้น; หากต้องการเรียก API จริง ให้ตั้ง NEXT_PUBLIC_USE_MOCKS="false"
const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== 'false';

const MOCK_HOME: HomeResponse = {
  hero: [
    { id: '1', title: 'AMI THE DRAMA', artist: 'CARDI B', image: '/images/cover.jpg', href: '#' },
    { id: '2', title: 'BUTTERFLY EFFECT', artist: 'Travis Scott', image: '/images/cover.jpg', href: '#' },
    { id: '3', title: 'Safe (feat. Kehlani)', artist: 'CARDI B, Kehlani', image: '/images/cover.jpg', href: '#' },
    { id: '4', title: 'XOXO', artist: 'David', image: '/images/cover.jpg', href: '#' },
    { id: '5', title: 'Pick It Up', artist: 'CARDI B, Selena Gomez', image: '/images/cover.jpg', href: '#' },
  ],
  sections: [
    {
      title: 'Korean',
      items: Array.from({ length: 5 }).map((_, i) => ({
        id: `kr-${i}`,
        title: i % 2 === 0 ? 'Red lollipop' : 'Messy',
        artist: i % 2 === 0 ? 'God' : 'FLUX',
        image: '/images/cover.jpg',
        href: '#',
      })),
    },
    {
      title: 'Happy',
      items: Array.from({ length: 5 }).map((_, i) => ({
        id: `happy-${i}`,
        title: i % 2 === 0 ? 'Red lollipop' : 'Messy',
        artist: i % 2 === 0 ? 'God' : 'FLUX',
        image: '/images/cover.jpg',
        href: '#',
      })),
    },
    {
      title: 'Sad',
      items: Array.from({ length: 5 }).map((_, i) => ({
        id: `sad-${i}`,
        title: i % 2 === 0 ? 'Red lollipop' : 'Messy',
        artist: i % 2 === 0 ? 'God' : 'FLUX',
        image: '/images/cover.jpg',
        href: '#',
      })),
    },
  ],
};

export async function fetchHomeContent(): Promise<HomeResponse> {
  if (USE_MOCKS) return MOCK_HOME;

  // Delay 3s to avoid early fetch issues and to simulate loading realistically
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const { success, data, error } = await api.get<HomeResponse | { hero?: HomeTrackItem[]; sections?: Record<string, HomeTrackItem[]> }>('/api/home');

  if (success && data) {
    const payload = data as Partial<HomeResponse> & { sections?: HomeSection[] | Record<string, HomeTrackItem[]> };
    // Normalize sections: allow either array or object map { English: [], Korean: [] }
    if (payload.sections && !Array.isArray(payload.sections)) {
      const sectionsObj: Record<string, HomeTrackItem[]> = payload.sections;
      const sectionsArr: HomeSection[] = Object.entries(sectionsObj).map(([title, items]) => ({ title, items }));
      return { hero: payload.hero ?? [], sections: sectionsArr } as HomeResponse;
    }
    return payload as HomeResponse;
  }

  // Graceful fallback to mocks when API not available
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn('[homeService] Using mock due to error:', error);
  }
  return MOCK_HOME;
}
const homeApi = { fetchHomeContent };
export default homeApi;

