'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/authService';
import { historyService } from '@/services/historyService';
import { favoriteService } from '@/services/favoriteService';
import { recommendSongsService } from '@/services/recommendSongsService';
import { userService } from '@/services/userService';
import toast from 'react-hot-toast';
import { UserData, UserStats, RecommendedAlbum, SavedTranslation, FavouriteSong } from '@/types/user';
import NavMenuItem from '@/components/NavMenuItem';
import MusicCard from '@/components/MusicCard';
import Image from 'next/image';
import { X } from 'lucide-react';

// Dev-only logger helper
const devLog = (...args: unknown[]) => {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.error(...args);
  }
};

export default function AccountSettingsPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recommendedAlbums, setRecommendedAlbums] = useState<RecommendedAlbum[]>([]);
  const [savedTranslations, setSavedTranslations] = useState<SavedTranslation[]>([]);
  const [favoriteSongs, setFavoriteSongs] = useState<FavouriteSong[]>([]);
  const [isLoadingFavourites, setIsLoadingFavourites] = useState(true);
  const [isLoadingSaveTranslation, setIsLoadingSaveTranslation] = useState(true);
  const [isLoadingRecommend, setIsLoadingRecommend] = useState(true);
  const [selectedFavorite, setSelectedFavorite] = useState<FavouriteSong | null>(null);
  const [selectedTranslation, setSelectedTranslation] = useState<SavedTranslation | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
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

  const fetchFavouriteSongs = async (): Promise<FavouriteSong[]> => {
    try {
      const result = await favoriteService.getUserFavorites(1, 50);
      
      if (!result || !result.favorites) {
        return [];
      }

      return result.favorites
        .filter(item => item.processingID)
        .map(item => ({
          id: item.songID,
          favoriteID: item.favoriteID,
          processingID: item.processingID!,
          title: item.songName,
          artist: item.artistName,
          album: '',
          coverImage: item.coverImage || '',
          originalLanguage: item.originalLanguage || 'Unknown',
          targetLanguage: item.targetLanguage || 'Unknown',
          addedAt: item.createdAt
        }));
    } catch (error) {
      devLog('Error fetching favorite songs:', error);
      return [];
    }
  };

  const fetchSavedTranslations = async (): Promise<SavedTranslation[]> => {
    try {
      const result = await historyService.getUserHistory(1, 50, 'save');
      
      if (!result || !result.history) {
        return [];
      }

      return result.history
        .filter(item => item.processingID && item.processing) // Only include items with processing data
        .map(item => ({
          id: item.historyID,
          songID: item.songID,
          processingID: item.processingID || '',
          songTitle: item.song.songName,
          artistName: item.song.artistName,
          coverImage: item.song.coverImage,
          originalLanguage: item.processing?.originalLanguage || 'Unknown',
          translatedLanguage: item.processing?.targetLanguage || 'Unknown',
          translation: item.processing?.translation || '',
          savedAt: item.timeStamp
        }));
    } catch (error) {
      devLog('Error fetching saved translations:', error);
      return [];
    }
  };


  const fetchRecommendedAlbums = async (): Promise<RecommendedAlbum[]> => {
    try {
      const songs = await recommendSongsService.getRecommendedSongsByLanguageAndMood(
        undefined,
        undefined,
        20
      );

      return songs.map(song => ({
        id: song.id,
        processingID: song.processingID,
        title: song.title,
        artist: song.artist,
        coverImage: song.image || null,
        mood: song.mood || null,
        genre: song.genre || 'Unknown'
      }));
    } catch (error) {
      devLog('Error fetching recommended albums:', error);
      return [];
    }
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

        // Load user settings to get profile picture
        try {
          const settings = await userService.getUserSettings();
          setProfilePicture(settings.profilePicture);
        } catch (error) {
          devLog('Error loading user settings:', error);
        }

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
        const favorites = await fetchFavouriteSongs();
        setFavoriteSongs(favorites);
        setIsLoadingFavourites(false);
      } catch (error) {
        devLog('Error loading favourites:', error);
        setIsLoadingFavourites(false);
      }
    };

    const loadSaveTranslation = async () => {
      try {
        const translations = await fetchSavedTranslations();
        setSavedTranslations(translations);
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
      <div className="min-h-screen flex items-center justify-center bg-white">
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
                <div className={`w-48 h-48 rounded-full flex items-center justify-center mb-4 overflow-hidden ${
                  profilePicture ? 'bg-transparent' : 'bg-gradient-to-br from-[#7B61FF] to-[#6B51EF]'
                }`}>
                  {profilePicture ? (
                    <Image
                      src={profilePicture}
                      alt="Profile Picture"
                      width={192}
                      height={192}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="text-white text-[44px] font-bold mb-2">+</div>
                      <div className="text-white text-xs">Add your picture!</div>
                    </div>
                  )}
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
              <div className="bg-white rounded-2xl shadow-sm p-6 h-[275px] overflow-y-auto border border-gray-200">
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
                ) : favoriteSongs.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-[#737373] text-lg mb-2">You don&apos;t have a favorite song yet.</p>
                    <p className="text-[#737373] mb-6">Start exploring and add your first fave here!</p>
                    <button 
                      onClick={() => router.push('/')}
                      className="bg-[#7B61FF] hover:bg-[#6B51EF] text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center space-x-2 mx-auto"
                    >
                      <span>Let&apos;s explore</span>
                      <Image src="/icons/star-icon.svg" alt="Star" width={20} height={20} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {favoriteSongs.map((song) => (
                      <button
                        key={song.id}
                        onClick={() => setSelectedFavorite(song)}
                        className="w-full text-left block p-5 bg-white rounded-xl hover:bg-gray-50 hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-[#7B61FF]/30 group cursor-pointer"
                      >
                        <div className="flex items-start gap-5">
                          <div className="flex-shrink-0">
                            {song.coverImage ? (
                              <div className="relative overflow-hidden rounded-xl shadow-sm group-hover:shadow-md transition-shadow duration-200">
                                <Image
                                  src={song.coverImage}
                                  alt={song.title}
                                  width={96}
                                  height={96}
                                  className="rounded-xl object-cover w-24 h-24"
                                />
                              </div>
                            ) : (
                              <div className="w-24 h-24 bg-gradient-to-br from-[#7B61FF] to-[#6B51EF] rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200">
                                <Image src="/icons/favourites-icon.svg" alt="Favorite" width={36} height={36} className="opacity-90" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 pt-1">
                            <h3 className="font-semibold text-gray-900 truncate mb-1.5 text-base group-hover:text-[#7B61FF] transition-colors duration-200">
                              {song.title}
                            </h3>
                            {song.artist && (
                              <p className="text-sm text-gray-600 truncate mb-3 font-medium">
                                {song.artist}
                              </p>
                            )}
                            <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-200/50">
                                {song.originalLanguage}
                              </span>
                              <span className="text-gray-400 text-sm">→</span>
                              <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-medium border border-purple-200/50">
                                {song.targetLanguage}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 font-medium">
                              Added {new Date(song.addedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
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
              <div className="bg-white rounded-2xl shadow-sm p-6 h-[275px] overflow-y-auto border border-gray-200">
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
                ) : savedTranslations.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-[#737373] text-lg mb-2">Oops, looks empty here! 🎶</p>
                    <p className="text-[#737373] mb-6">Save your first translation to start your collection.</p>
                    <button 
                      onClick={() => router.push('/')}
                      className="bg-[#7B61FF] hover:bg-[#6B51EF] text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center space-x-2 mx-auto"
                    >
                      <span>Find yours</span>
                      <Image src="/icons/search-icon.svg" alt="Search" width={20} height={20} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedTranslations.map((translation) => (
                      <button
                        key={translation.id}
                        onClick={() => setSelectedTranslation(translation)}
                        className="w-full text-left block p-5 bg-white rounded-xl hover:bg-gray-50 hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-[#7B61FF]/30 group cursor-pointer"
                      >
                        <div className="flex items-start gap-5">
                          <div className="flex-shrink-0">
                            {translation.coverImage ? (
                              <div className="relative overflow-hidden rounded-xl shadow-sm group-hover:shadow-md transition-shadow duration-200">
                                <Image
                                  src={translation.coverImage}
                                  alt={translation.songTitle}
                                  width={96}
                                  height={96}
                                  className="rounded-xl object-cover w-24 h-24"
                                />
                              </div>
                            ) : (
                              <div className="w-24 h-24 bg-gradient-to-br from-[#7B61FF] to-[#6B51EF] rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200">
                                <Image src="/icons/save-icon.svg" alt="Saved" width={36} height={36} className="opacity-90" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 pt-1">
                            <h3 className="font-semibold text-gray-900 truncate mb-1.5 text-base group-hover:text-[#7B61FF] transition-colors duration-200">
                              {translation.songTitle}
                            </h3>
                            {translation.artistName && (
                              <p className="text-sm text-gray-600 truncate mb-3 font-medium">
                                {translation.artistName}
                              </p>
                            )}
                            <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-200/50">
                                {translation.originalLanguage}
                              </span>
                              <span className="text-gray-400 text-sm">→</span>
                              <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-medium border border-purple-200/50">
                                {translation.translatedLanguage}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 font-medium">
                              Saved {new Date(translation.savedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
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
                recommendedAlbums.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-[#737373] text-lg mb-2">No recommendations available</p>
                    <p className="text-[#737373]">Check back later for new recommendations!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                    <div className="flex gap-4 min-w-max">
                      {recommendedAlbums.map((album) => (
                        <div key={album.id} className="flex-shrink-0 w-[180px] sm:w-[200px]">
                          <MusicCard
                            image={album.coverImage || undefined}
                            title={album.title}
                            artist={album.artist}
                            href={`/song/${album.id}?processingID=${album.processingID}`}
                            mood={album.mood}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Favorite Detail Modal */}
      {selectedFavorite && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
          onClick={() => setSelectedFavorite(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-gray-900">Favorite Song Details</h2>
              <button
                onClick={() => setSelectedFavorite(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="flex-shrink-0">
                  {selectedFavorite.coverImage ? (
                    <div className="relative overflow-hidden rounded-xl shadow-lg">
                      <Image
                        src={selectedFavorite.coverImage}
                        alt={selectedFavorite.title}
                        width={300}
                        height={300}
                        className="rounded-xl object-cover w-full max-w-[300px]"
                      />
                    </div>
                  ) : (
                    <div className="w-[300px] h-[300px] bg-gradient-to-br from-[#7B61FF] to-[#6B51EF] rounded-xl flex items-center justify-center shadow-lg">
                      <Image src="/icons/favourites-icon.svg" alt="Favorite" width={120} height={120} className="opacity-90" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">{selectedFavorite.title}</h3>
                  {selectedFavorite.artist && (
                    <p className="text-xl text-gray-600 mb-4">{selectedFavorite.artist}</p>
                  )}
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200/50">
                      {selectedFavorite.originalLanguage}
                    </span>
                    <span className="text-gray-400 text-lg">→</span>
                    <span className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium border border-purple-200/50">
                      {selectedFavorite.targetLanguage}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">
                    Added {new Date(selectedFavorite.addedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <Link
                    href={`/song/${selectedFavorite.id}?processingID=${selectedFavorite.processingID}`}
                    className="inline-block bg-[#7B61FF] hover:bg-[#6B51EF] text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200"
                  >
                    View Full Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved Translation Detail Modal */}
      {selectedTranslation && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
          onClick={() => setSelectedTranslation(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-gray-900">Saved Translation Details</h2>
              <button
                onClick={() => setSelectedTranslation(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="flex-shrink-0">
                  {selectedTranslation.coverImage ? (
                    <div className="relative overflow-hidden rounded-xl shadow-lg">
                      <Image
                        src={selectedTranslation.coverImage}
                        alt={selectedTranslation.songTitle}
                        width={300}
                        height={300}
                        className="rounded-xl object-cover w-full max-w-[300px]"
                      />
                    </div>
                  ) : (
                    <div className="w-[300px] h-[300px] bg-gradient-to-br from-[#7B61FF] to-[#6B51EF] rounded-xl flex items-center justify-center shadow-lg">
                      <Image src="/icons/save-icon.svg" alt="Saved" width={120} height={120} className="opacity-90" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">{selectedTranslation.songTitle}</h3>
                  {selectedTranslation.artistName && (
                    <p className="text-xl text-gray-600 mb-4">{selectedTranslation.artistName}</p>
                  )}
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200/50">
                      {selectedTranslation.originalLanguage}
                    </span>
                    <span className="text-gray-400 text-lg">→</span>
                    <span className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium border border-purple-200/50">
                      {selectedTranslation.translatedLanguage}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">
                    Saved {new Date(selectedTranslation.savedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  {selectedTranslation.translation && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Translation Preview:</h4>
                      <p className="text-sm text-gray-600 line-clamp-4 whitespace-pre-wrap">
                        {selectedTranslation.translation}
                      </p>
                    </div>
                  )}
                  <Link
                    href={`/song/${selectedTranslation.songID}?processingID=${selectedTranslation.processingID}`}
                    className="inline-block bg-[#7B61FF] hover:bg-[#6B51EF] text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200"
                  >
                    View Full Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
