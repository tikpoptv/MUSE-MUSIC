'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';
import { UserData, UserStats, RecommendedAlbum } from '@/types/user';
import NavMenuItem from '@/components/NavMenuItem';
import Image from 'next/image';

// Dev-only logger helper
const devLog = (...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.error(...args);
  }
};

export default function AccountSettingsPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recommendedAlbums, setRecommendedAlbums] = useState<RecommendedAlbum[]>([]);
  const [isLoadingFavourites, setIsLoadingFavourites] = useState(true);
  const [isLoadingSaveTranslation, setIsLoadingSaveTranslation] = useState(true);
  const [isLoadingRecommend, setIsLoadingRecommend] = useState(true);
  const router = useRouter();

  // Mock data functions
  const fetchUserStats = async (): Promise<UserStats> => {
    // TODO: Replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          favourites: 0,
          analyzing: 0,
          happy: 0,
          sad: 0,
          fear: 0,
          anger: 0,
          disgust: 0,
          surprise: 0
        });
      }, 500);
    });
  };

  const fetchFavouriteSongs = async () => {
    // TODO: Replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([]);
      }, 800);
    });
  };

  const fetchSavedTranslations = async () => {
    // TODO: Replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([]);
      }, 600);
    });
  };


  const fetchRecommendedAlbums = async (): Promise<RecommendedAlbum[]> => {
    // TODO: Replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            title: 'AM I THE DRAMA',
            artist: 'CARDI B',
            coverImage: '/api/placeholder/200/200',
            mood: 'happy',
            genre: 'hip-hop'
          },
          {
            id: '2',
            title: 'BUTTERFLY EFFECT',
            artist: 'Travis Scott',
            coverImage: '/api/placeholder/200/200',
            mood: 'happy',
            genre: 'hip-hop'
          },
          {
            id: '3',
            title: 'Safe (feat. Kehlani)',
            artist: 'CARDI B, Kehlani',
            coverImage: '/api/placeholder/200/200',
            mood: 'happy',
            genre: 'hip-hop'
          },
          {
            id: '4',
            title: 'XOXO',
            artist: 'David',
            coverImage: '/api/placeholder/200/200',
            mood: 'happy',
            genre: 'pop'
          },
          {
            id: '5',
            title: 'Pick It Up (feat. Selena Gomez)',
            artist: 'CARDI B, Selena Gomez',
            coverImage: '/api/placeholder/200/200',
            mood: 'happy',
            genre: 'pop'
          }
        ]);
      }, 400);
    });
  };

  useEffect(() => {
    const loadData = async () => {
      const isAuth = authService.isAuthenticated();
      
      if (!isAuth) {
        toast.error('Please login first');
        router.push('/login');
        return;
      }

      try {
        const user = authService.getUserData();
        setUserData(user);

        // Load user stats first
        const stats = await fetchUserStats();
        setUserStats(stats);

        // Load each section separately
        loadFavourites();
        loadSaveTranslation();
        loadRecommend();
      } catch (error) {
        devLog('Error loading data:', error);
        toast.error('Error loading data');
      }
    };

    const loadFavourites = async () => {
      try {
        await fetchFavouriteSongs();
        setIsLoadingFavourites(false);
      } catch (error) {
        devLog('Error loading favourites:', error);
        setIsLoadingFavourites(false);
      }
    };

    const loadSaveTranslation = async () => {
      try {
        await fetchSavedTranslations();
        setIsLoadingSaveTranslation(false);
      } catch (error) {
        devLog('Error loading save translation:', error);
        setIsLoadingSaveTranslation(false);
      }
    };

    const loadRecommend = async () => {
      try {
        const recommendations = await fetchRecommendedAlbums();
        setRecommendedAlbums(recommendations);
        setIsLoadingRecommend(false);
      } catch (error) {
        devLog('Error loading recommendations:', error);
        setIsLoadingRecommend(false);
      }
    };

    loadData();
  }, [router]);


  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">User data not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-8xl mx-auto px-8 sm:px-12 lg:px-16 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar - Profile & Navigation */}
          <div className="lg:col-span-2">
            <div className="p-6 h-full pl-0">
              
              {/* Profile Picture */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-48 h-48 bg-gradient-to-br from-[#7B61FF] to-[#6B51EF] rounded-full flex items-center justify-center mb-4">
                  <div className="text-center">
                    <div className="text-white text-[44px] font-bold mb-2">+</div>
                    <div className="text-white text-xs">Add your picture!</div>
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="text-left mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 text-sm">Profile</span>
                  <Link href="/account/settings" className="text-[#7B61FF] text-sm hover:underline">Setting</Link>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">{userData.fullName || userData.username}</h2>
                
                {/* Logout Button */}
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={async () => {
                      try {
                        const result = await authService.logout();
                        if (result.success) {
                          toast.success('Logged out successfully!');
                        } else {
                          toast.error(result.message || 'Logout completed with warnings');
                        }
                        setTimeout(() => {
                          window.location.href = '/';
                        }, 1500);
                      } catch (error) {
                        devLog('Logout error:', error);
                        toast.error('Logout failed. Please try again.');
                      }
                    }}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 text-red-600 hover:text-red-700 hover:bg-red-100 border border-red-200 rounded-lg transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="font-medium text-sm">Logout</span>
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 mb-6"></div>

              {/* Navigation Menu */}
              <div className="space-y-4">
                <NavMenuItem
                  icon="/icons/favourites-icon.svg"
                  label="Favourites"
                  count={userStats?.favourites || 0}
                />
                <NavMenuItem
                  icon="/icons/analyzing-icon.svg"
                  label="Analyzing"
                  count={userStats?.analyzing || 0}
                />
                <NavMenuItem
                  icon="/icons/happy-icon.svg"
                  label="Happy"
                  count={userStats?.happy || 0}
                />
                <NavMenuItem
                  icon="/icons/sad-icon.svg"
                  label="Sad"
                  count={userStats?.sad || 0}
                />
                <NavMenuItem
                  icon="/icons/fear-icon.svg"
                  label="Fear"
                  count={userStats?.fear || 0}
                />
                <NavMenuItem
                  icon="/icons/anger-icon.svg"
                  label="Anger"
                  count={userStats?.anger || 0}
                />
                <NavMenuItem
                  icon="/icons/disgust-icon.svg"
                  label="Disgust"
                  count={userStats?.disgust || 0}
                />
                <NavMenuItem
                  icon="/icons/surprise-icon.svg"
                  label="Surprise"
                  count={userStats?.surprise || 0}
                />
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-10 space-y-8 h-full">
            
            {/* Favourite Section */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <Image src="/icons/favourites-icon.svg" alt="Favourites" width={28} height={28} />
                <h2 className="text-2xl font-bold text-gray-900">Favourite</h2>
              </div>
              <div className="bg-[#F5F5F5] rounded-2xl shadow-sm p-6 h-[275px] overflow-y-auto">
                {isLoadingFavourites ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="flex justify-center mb-4">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-[#7B61FF] rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-[#7B61FF] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-[#7B61FF] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                      <p className="text-[#737373]">Loading...</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-[#737373] text-lg mb-2">You don&apos;t have a favorite song yet.</p>
                    <p className="text-[#737373] mb-6">Start exploring and add your first fave here!</p>
                    <button className="bg-[#7B61FF] hover:bg-[#6B51EF] text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center space-x-2 mx-auto">
                      <span>Let&apos;s explore</span>
                      <Image src="/icons/star-icon.svg" alt="Star" width={20} height={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Save Translation Section */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <Image src="/icons/save-icon.svg" alt="Save" width={28} height={28} />
                <h2 className="text-2xl font-bold text-gray-900">Save Translation</h2>
              </div>
              <div className="bg-[#F5F5F5] rounded-2xl shadow-sm p-6 h-[275px] overflow-y-auto">
                {isLoadingSaveTranslation ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="flex justify-center mb-4">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-[#7B61FF] rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-[#7B61FF] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-[#7B61FF] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                      <p className="text-[#737373]">Loading...</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-[#737373] text-lg mb-2">Oops, looks empty here! 🎶</p>
                    <p className="text-[#737373] mb-6">Save your first translation to start your collection.</p>
                    <button className="bg-[#7B61FF] hover:bg-[#6B51EF] text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center space-x-2 mx-auto">
                      <span>Find yours</span>
                      <Image src="/icons/search-icon.svg" alt="Search" width={20} height={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Recommend Section */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <Image src="/icons/champion.svg" alt="Champion" width={28} height={28} />
                <h2 className="text-2xl font-bold text-gray-900">Recommend</h2>
              </div>
              
              {isLoadingRecommend ? (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-4">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-[#7B61FF] rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-[#7B61FF] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-[#7B61FF] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                  <p className="text-[#737373]">Loading...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {recommendedAlbums.map((album) => (
                    <div key={album.id} className="relative group cursor-pointer">
                      <div className="w-full aspect-square bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl mb-3 relative overflow-hidden">
                        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                        <div className="absolute bottom-0 right-0">
                          <div className="w-[49.42px] h-[49.42px] bg-white bg-opacity-80 rounded-lg flex items-center justify-center">
                            <svg className="w-[28.93px] h-[28.93px] text-[#7B61FF]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-1.5 5.5a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm">{album.title}</h3>
                      <p className="text-[#7B61FF] text-xs">{album.artist}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
