'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ChartArea } from 'lucide-react';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import { songService, type SearchSongResult } from '@/services/songService';
import { UserData } from '@/types/user';
import StartAnalysisModal from './modals/StartAnalysisModal';
import SetupNotification from './SetupNotification';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchSongResult[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showStartAnalysisModal, setShowStartAnalysisModal] = useState<boolean>(false);
  const [pendingSearchQuery, setPendingSearchQuery] = useState<string>('');
  const [pendingSongID, setPendingSongID] = useState<string | null>(null);
  const [showSetupNotification, setShowSetupNotification] = useState<boolean>(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchWrapRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const shouldHideSearch = pathname === '/test'|| pathname === '/login' || pathname === '/register' || pathname === '/forgot-password' || pathname === '/account/settings' || pathname.startsWith('/setup');

  useEffect(() => {
    const handleResize = () => {
      const searchContainer = document.getElementById('search-container');
      const navContainer = document.getElementById('nav-container');
      const hamburgerButton = document.getElementById('hamburger-button');
      const mobileMenu = document.getElementById('mobile-menu');

      if (window.innerWidth <= 1100) {
        // Mobile mode
        setIsMobile(true);
        if (searchContainer) searchContainer.style.display = 'none';
        if (navContainer) navContainer.style.display = 'none';
        if (hamburgerButton) hamburgerButton.style.display = 'inline-flex';
        if (mobileMenu) mobileMenu.style.display = 'block';
      } else {
        // Desktop mode
        setIsMobile(false);
        if (searchContainer) searchContainer.style.display = 'block';
        if (navContainer) navContainer.style.display = 'flex';
        if (hamburgerButton) hamburgerButton.style.display = 'none';
        if (mobileMenu) mobileMenu.style.display = 'none';
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const isAuth = authService.isAuthenticated();
    const user = authService.getUserData();
    
    setIsAuthenticated(isAuth);
    setUserData(isAuth ? user : null);
    
    if (isAuth && user) {
      const userRole = user.role?.toLowerCase();
      setIsAdmin(userRole === 'admin' || userRole === 'super_admin');
      
      if (user.setupSkipped && !user.setupCompleted && !pathname.startsWith('/setup')) {
        setShowSetupNotification(true);
      }
      
      // Load profile picture
      userService.getUserSettings()
        .then(settings => {
          setProfilePicture(settings.profilePicture);
        })
        .catch(() => {
          // Silently fail if settings can't be loaded
        });
    } else {
      setIsAdmin(false);
      setProfilePicture(null);
      setShowSetupNotification(false);
    }
  }, [pathname]);

  const handleProfileClick = () => {
    router.push('/account/settings');
  };

  // Handle search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSearching(true);
        const results = await songService.searchSongs(searchQuery.trim(), 5);
        setSearchResults(results);
        setShowSearchDropdown(true);
      } catch {
        // If search fails, just show empty results
        setSearchResults([]);
        setShowSearchDropdown(false);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchWrapRef.current && !searchWrapRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    }

    if (showSearchDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearchDropdown]);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      return;
    }

    // First, try to search in system
    try {
      const results = await songService.searchSongs(searchQuery.trim(), 1);
      if (results.length > 0 && results[0].hasProcessing && results[0].processingID) {
        // Found in system, redirect to song detail
        router.push(`/song/${results[0].songID}?processingID=${results[0].processingID}`);
        setSearchQuery('');
        setShowSearchDropdown(false);
        return;
      }
      if (results.length > 0) {
        const firstResult = results[0];
        setPendingSearchQuery(`${firstResult.songName} - ${firstResult.artistName}`);
        setPendingSongID(firstResult.songID);
        setShowStartAnalysisModal(true);
        setShowSearchDropdown(false);
        return;
      }
    } catch {
      // Continue to fallback
    }

    // Not found in system, show modal to ask if user wants to start analysis
    setPendingSearchQuery(searchQuery.trim());
    setPendingSongID(null);
    setShowStartAnalysisModal(true);
    setShowSearchDropdown(false);
  };

  const dispatchHomeAutoStart = (detail: { songID?: string; query?: string }) => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('muse-navbar-start-analysis', { detail }));
  };

  const handleStartAnalysisConfirm = () => {
    const query = pendingSearchQuery;
    const songID = pendingSongID;
    setShowStartAnalysisModal(false);
    setPendingSearchQuery('');
    setPendingSongID(null);
    setSearchQuery('');
    if (songID) {
      if (pathname === '/') {
        dispatchHomeAutoStart({ songID });
      } else {
        router.push(`/?songID=${encodeURIComponent(songID)}`);
      }
      return;
    }
    if (query) {
      if (pathname === '/') {
        dispatchHomeAutoStart({ query });
      } else {
        router.push(`/?q=${encodeURIComponent(query)}`);
      }
    }
  };

  const handleStartAnalysisCancel = () => {
    setShowStartAnalysisModal(false);
    setPendingSearchQuery('');
    setPendingSongID(null);
  };

  const handleResultClick = (
    e: React.MouseEvent,
    songID: string,
    processingID: string | null,
    hasProcessing: boolean,
    songName: string,
    artistName: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Close dropdown first
    setShowSearchDropdown(false);
    const currentQuery = searchQuery;
    setSearchQuery('');
    
    // Navigate to song detail page only if has processing
    if (hasProcessing && processingID && processingID !== 'null' && processingID !== 'undefined' && processingID.trim() !== '') {
      const url = `/song/${songID}?processingID=${processingID}`;
      // eslint-disable-next-line no-console
      console.log('Navigating to:', url, { songID, processingID, hasProcessing });
      router.push(url);
    } else {
      // If no processingID, show modal to start analysis
      // eslint-disable-next-line no-console
      console.log('No processing available, prompting start analysis', { songID, processingID, hasProcessing });
      const label = songName && artistName ? `${songName} - ${artistName}` : (songName || currentQuery.trim());
      setPendingSearchQuery(label);
      setPendingSongID(songID);
      setShowStartAnalysisModal(true);
    }
  };


  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200 dark:bg-white dark:border-gray-200" style={{ colorScheme: 'light' }}>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="flex items-center justify-between h-16 md:h-20 lg:h-[100px]">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
              <Image 
                src="/icons/music-icon.svg" 
                alt="Music Icon" 
                width={24} 
                height={24} 
                className="w-5 h-5 sm:w-6 sm:h-6"
              />
              
              <span className="text-sm md:text-sm xl:text-2xl font-bold text-black dark:text-black tracking-wider">
                MUSE MUSIC
              </span>
            </Link>
            
            {!shouldHideSearch && !isMobile && (
              <div className="ml-4 pr-2 flex-shrink" id="search-container" style={{ display: 'block' }}>
                <div className="relative" ref={searchWrapRef}>
                  <form onSubmit={handleSearchSubmit}>
                    <input
                      type="text"
                      placeholder="Search song by name, artist, etc."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => {
                        if (searchResults.length > 0) {
                          setShowSearchDropdown(true);
                        }
                      }}
                      className="px-4 pl-4 pr-10 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7B61FF] focus:border-transparent text-sm"
                      style={{ width: '435px', height: '40px', color: '#1a1a1a', borderRadius: '12px', minWidth: '200px', maxWidth: '435px' }}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg 
                        className="h-4 w-4" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        style={{ color: '#8A73FF' }}
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                        />
                      </svg>
                    </div>
                  </form>
                  {showSearchDropdown && searchQuery && (
                    <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-h-80 overflow-auto">
                      {isSearching ? (
                        <div className="text-sm text-gray-500">Searching...</div>
                      ) : searchResults.length === 0 ? (
                        <div className="py-2 px-2 text-sm text-gray-500">
                          No results found
                        </div>
                      ) : (
                        <ul className="divide-y divide-gray-100">
                          {searchResults.map((result) => (
                            <li
                              key={result.songID}
                              className="py-2 px-2 rounded cursor-pointer hover:bg-gray-50"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleResultClick(
                                  e as unknown as React.MouseEvent,
                                  result.songID,
                                  result.processingID || null,
                                  result.hasProcessing,
                                  result.songName,
                                  result.artistName
                                );
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-gray-900 truncate">{result.songName}</p>
                                  <p className="text-xs text-[#7B61FF] truncate">{result.artistName}</p>
                                </div>
                                {result.hasProcessing && (
                                  <span className="ml-3 text-[10px] text-green-600 flex-shrink-0">Available</span>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="items-center space-x-8" id="nav-container" style={{ display: 'flex' }}>
            <Link 
              href="/" 
              className={`transition-colors duration-200 font-medium text-xs md:text-xs xl:text-sm ${
                pathname === '/' 
                  ? 'text-violet-600 dark:text-violet-600 font-semibold' 
                  : 'text-gray-700 dark:text-gray-700 hover:text-black dark:hover:text-black'
              }`}
            >
              Home
            </Link>
            <Link 
              href="/for-you" 
              className={`transition-colors duration-200 font-medium text-xs md:text-xs xl:text-sm ${
                pathname === '/for-you' 
                  ? 'text-violet-600 dark:text-violet-600 font-semibold' 
                  : 'text-gray-700 dark:text-gray-700 hover:text-black dark:hover:text-black'
              }`}
            >
              For you
            </Link>
            <Link 
              href="/archive" 
              className={`transition-colors duration-200 font-medium text-xs md:text-xs xl:text-sm ${
                pathname === '/archive' 
                  ? 'text-violet-600 dark:text-violet-600 font-semibold' 
                  : 'text-gray-700 dark:text-gray-700 hover:text-black dark:hover:text-black'
              }`}
            >
              Archive
            </Link>
            {isAdmin && (
              <Link 
                href="/admin/dashboard" 
                className={`flex items-center gap-1.5 transition-colors duration-200 font-medium text-xs md:text-xs xl:text-sm ${
                  pathname === '/admin' || pathname === '/admin/dashboard' || pathname.startsWith('/admin/dashboard')
                    ? 'text-violet-600 dark:text-violet-600 font-semibold' 
                    : 'text-violet-600 dark:text-violet-600 hover:text-violet-700 dark:hover:text-violet-700'
                }`}
              >
                <ChartArea className="w-4 h-4" />
                Dashboard
              </Link>
            )}
            
            {isAuthenticated ? (
              <button 
                onClick={handleProfileClick}
                className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer overflow-hidden transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#7B61FF] focus:ring-offset-2 ${
                  profilePicture ? 'bg-transparent' : 'bg-[#7B61FF] hover:bg-[#6B51EF]'
                }`}
              >
                {profilePicture ? (
                  <Image
                    src={profilePicture}
                    alt="Profile Picture"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-sm font-medium">
                    {userData?.fullName?.charAt(0) || userData?.username?.charAt(0) || 'U'}
                  </span>
                )}
              </button>
            ) : (
              <Link 
                href="/login"
                className="bg-[#7B61FF] hover:bg-[#6B51EF] text-white rounded-2xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 text-xs md:text-xs xl:text-sm"
                style={{ width: '142px', height: '48px' }}
              >
                <span>Sign in</span>
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.75" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  viewBox="0 0 29 28"
                >
                  <path d="M14.5 15.1667C17.7216 15.1667 20.3333 12.555 20.3333 9.33333C20.3333 6.11167 17.7216 3.5 14.5 3.5C11.2783 3.5 8.66663 6.11167 8.66663 9.33333C8.66663 12.555 11.2783 15.1667 14.5 15.1667Z"/>
                  <path d="M23.8333 24.5C23.8333 22.0246 22.85 19.6507 21.0996 17.9003C19.3493 16.15 16.9753 15.1667 14.5 15.1667C12.0246 15.1667 9.65064 16.15 7.9003 17.9003C6.14996 19.6507 5.16663 22.0246 5.16663 24.5"/>
                </svg>
              </Link>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-black hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#7B61FF] transition-colors duration-200"
            aria-label="Toggle menu"
            id="hamburger-button"
            style={{ display: 'none' }}
          >
            <svg 
              className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6 transition-opacity duration-200`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg 
              className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6 transition-opacity duration-200`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={`transition-all duration-300 ease-in-out ${
          isMenuOpen 
            ? 'max-h-96 opacity-100' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`} id="mobile-menu" style={{ display: 'none' }}>
          <div className="px-2 pt-2 pb-4 space-y-1 bg-white dark:bg-white border-t border-gray-200 dark:border-gray-200">
            {!shouldHideSearch && (
              <div className="px-3 py-3">
                <div className="relative" ref={searchWrapRef}>
                  <form onSubmit={handleSearchSubmit}>
                    <input
                      type="text"
                      placeholder="Search song by name, artist, etc."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => {
                        if (searchResults.length > 0) {
                          setShowSearchDropdown(true);
                        }
                      }}
                      className="w-full px-4 pl-4 pr-10 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7B61FF] focus:border-transparent text-sm"
                      style={{ height: '40px', color: '#1a1a1a', borderRadius: '12px' }}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg 
                        className="h-4 w-4" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        style={{ color: '#8A73FF' }}
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                        />
                      </svg>
                    </div>
                  </form>
                  {showSearchDropdown && searchQuery && (
                    <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-h-80 overflow-auto">
                      {isSearching ? (
                        <div className="text-sm text-gray-500">Searching...</div>
                      ) : searchResults.length === 0 ? (
                        <div className="py-2 px-2 text-sm text-gray-500">
                          No results found
                        </div>
                      ) : (
                        <ul className="divide-y divide-gray-100">
                          {searchResults.map((result) => (
                            <li
                              key={result.songID}
                              className="py-2 px-2 rounded cursor-pointer hover:bg-gray-50"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleResultClick(
                                  e as unknown as React.MouseEvent,
                                  result.songID,
                                  result.processingID || null,
                                  result.hasProcessing,
                                  result.songName,
                                  result.artistName
                                );
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-gray-900 truncate">{result.songName}</p>
                                  <p className="text-xs text-[#7B61FF] truncate">{result.artistName}</p>
                                </div>
                                {result.hasProcessing && (
                                  <span className="ml-3 text-[10px] text-green-600 flex-shrink-0">Available</span>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <Link 
              href="/" 
              className={`block px-3 py-3 rounded-md font-medium transition-colors duration-200 ${
                pathname === '/' 
                  ? 'text-violet-600 bg-violet-50 font-semibold' 
                  : 'text-gray-700 hover:text-black hover:bg-gray-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/for-you" 
              className={`block px-3 py-3 rounded-md font-medium transition-colors duration-200 ${
                pathname === '/for-you' 
                  ? 'text-violet-600 bg-violet-50 font-semibold' 
                  : 'text-gray-700 hover:text-black hover:bg-gray-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              For you
            </Link>
            <Link 
              href="/archive" 
              className={`block px-3 py-3 rounded-md font-medium transition-colors duration-200 ${
                pathname === '/archive' 
                  ? 'text-violet-600 bg-violet-50 font-semibold' 
                  : 'text-gray-700 hover:text-black hover:bg-gray-50'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Archive
            </Link>
            {isAdmin && (
              <Link 
                href="/admin/dashboard" 
                className={`flex items-center gap-2 px-3 py-3 rounded-md font-medium transition-colors duration-200 ${
                  pathname === '/admin' || pathname === '/admin/dashboard' || pathname.startsWith('/admin/dashboard')
                    ? 'text-violet-600 bg-violet-50 font-semibold' 
                    : 'text-violet-600 hover:text-violet-700 hover:bg-violet-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <ChartArea className="w-4 h-4" />
                Dashboard
              </Link>
            )}
            
            <div className="pt-2">
              {isAuthenticated ? (
                <div className="flex items-center justify-center px-3 py-2">
                  <button 
                    onClick={() => {
                      handleProfileClick();
                      setIsMenuOpen(false);
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#7B61FF] focus:ring-offset-2 ${
                      profilePicture ? 'bg-transparent' : 'bg-[#7B61FF] hover:bg-[#6B51EF]'
                    }`}
                  >
                    {profilePicture ? (
                      <Image
                        src={profilePicture}
                        alt="Profile Picture"
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-sm font-medium">
                        {userData?.fullName?.charAt(0) || userData?.username?.charAt(0) || 'U'}
                      </span>
                    )}
                  </button>
                </div>
              ) : (
                <Link 
                  href="/login"
                  className="block w-full bg-[#7B61FF] hover:bg-[#6B51EF] text-white rounded-2xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 py-3 px-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>Sign in</span>
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="1.75" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    viewBox="0 0 29 28"
                  >
                    <path d="M14.5 15.1667C17.7216 15.1667 20.3333 12.555 20.3333 9.33333C20.3333 6.11167 17.7216 3.5 14.5 3.5C11.2783 3.5 8.66663 6.11167 8.66663 9.33333C8.66663 12.555 11.2783 15.1667 14.5 15.1667Z"/>
                    <path d="M23.8333 24.5C23.8333 22.0246 22.85 19.6507 21.0996 17.9003C19.3493 16.15 16.9753 15.1667 14.5 15.1667C12.0246 15.1667 9.65064 16.15 7.9003 17.9003C6.14996 19.6507 5.16663 22.0246 5.16663 24.5"/>
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <StartAnalysisModal
        isOpen={showStartAnalysisModal}
        onClose={handleStartAnalysisCancel}
        onConfirm={handleStartAnalysisConfirm}
        searchQuery={pendingSearchQuery}
      />

      {showSetupNotification && (
        <SetupNotification
          onSetup={() => {
            const user = authService.getUserData();
            if (user?.provider === 'google') {
              router.push('/setup/step1');
            } else {
              router.push('/setup/step2');
            }
          }}
          onDismiss={() => {
            setShowSetupNotification(false);
          }}
        />
      )}
    </nav>
  );
}