'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { setupService } from '@/services/setupService';
import { authService } from '@/services/authService';
import { SetupLayout, SetupHeader, SetupNavigation, SetupButton } from '@/components/setup';

export default function SetupStep4() {
  const router = useRouter();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [genreColors, setGenreColors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const genres = [
    'R&B / Soul', 'Pop', 'Lo-Fi / Chillhop', 'Indie / Alternative', 'EDM', 'Jazz',
    'Hip-Hop / Rap', 'Country', 'Rock', 'Classical', 'Blues', 'K-Pop',
    'Afrobeat', 'Folk / Acoustic', 'Latin / Reggaeton', 'J-Pop', 'T-Pop'
  ];

  const getRandomColor = () => {
    const colors = [
      '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', 
      '#8b5cf6', '#ec4899', '#f43f5e', '#84cc16', '#06b6d4', '#6366f1',
      '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#14b8a6', '#0ea5e9',
      '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#ef4444', '#f97316'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres(prev => {
      if (prev.includes(genre)) {
        // Remove genre and its color
        setGenreColors(prevColors => {
          const newColors = { ...prevColors };
          delete newColors[genre];
          return newColors;
        });
        return prev.filter(g => g !== genre);
      } else {
        // Add genre with random color
        const newColor = getRandomColor();
        setGenreColors(prevColors => ({ ...prevColors, [genre]: newColor }));
        return [...prev, genre];
      }
    });
  };

  const handleNext = async () => {
    if (selectedGenres.length === 0) {
      toast.error('Please select at least one genre to continue');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Step 1: Save genres
      toast.loading('Saving your music preferences...', { id: 'save-genres' });
      await setupService.saveSetupStep('step4', { genres: selectedGenres });
      toast.success('Genres saved!', { id: 'save-genres' });
      
      // Step 2: Complete setup
      toast.loading('Completing your setup...', { id: 'complete-setup' });
      await setupService.completeSetup();
      toast.success('Setup completed!', { id: 'complete-setup' });
      
      // Step 3: Fetch latest data
      toast.loading('Syncing your profile...', { id: 'sync-profile' });
      const latestUserData = await authService.fetchUserData();
      authService.setUserData(latestUserData);
      toast.success('Profile synced!', { id: 'sync-profile' });
      
      // Final success
      toast.success('🎉 Setup completed successfully! Welcome to MUSE Music!');
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch {
      toast.dismiss();
      toast.error('Failed to complete setup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleBack = () => {
    router.push('/setup/step3');
  };

  useEffect(() => {
    const fetchSetupStatus = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          toast.error('Please login first');
          setTimeout(() => {
            router.push('/login');
          }, 1500);
          return;
        }

            const data = await setupService.getSetupStatus();
        
        if (data.stepStatus && data.stepStatus.step4) {
          if (data.stepData && data.stepData.step4?.genres) {
            setSelectedGenres(data.stepData.step4.genres);
            const colors: { [key: string]: string } = {};
            data.stepData.step4.genres.forEach((genre: string) => {
              colors[genre] = getRandomColor();
            });
            setGenreColors(colors);
            toast.success('Genres loaded from previous setup!');
          } else {
            toast.success('Genres already set up! Redirecting to homepage...');
            setTimeout(() => {
              router.push('/');
            }, 1500);
            return;
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching setup status:', error);
        toast.error('Authentication failed. Please login again.');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      }
    };

    fetchSetupStatus();
  }, [router]);

  return (
    <SetupLayout isLoading={isLoading}>
      <SetupHeader 
        title="Set up your profile"
        description="Pick at least one genre to start shaping your music mood."
      />

        <div className="mb-8">
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            justifyContent: 'center',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            {genres.map((genre) => {
              const isSelected = selectedGenres.includes(genre);
              
              return (
                <button
                  key={genre}
                  onClick={() => handleGenreToggle(genre)}
                  style={{
                    padding: '12px 16px',
                    height: '32px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'colors 0.2s',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isSelected ? (genreColors[genre] || '#000000') : '#f3f4f6',
                    color: isSelected ? '#ffffff' : '#374151',
                    border: 'none',
                    cursor: 'pointer',
                    minWidth: 'fit-content',
                    width: 'auto'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = '#e5e7eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }
                  }}
                >
                  {genre}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <SetupButton
            onClick={handleNext}
            disabled={selectedGenres.length === 0 || isSubmitting}
            variant="gradient"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Setting up your profile...</span>
              </>
            ) : (
              <>
                <span>Start Vibin&apos;</span>
                <Image 
                  src="/icons/star-icon.svg" 
                  alt="Star" 
                  width={16} 
                  height={16}
                  className={`w-4 h-4 ${
                    selectedGenres.length === 0
                      ? 'filter brightness-0 opacity-50'
                      : 'filter brightness-0 invert'
                  }`}
                />
              </>
            )}
          </SetupButton>
          
          <SetupNavigation onBack={handleBack} />
        </div>
    </SetupLayout>
  );
}
