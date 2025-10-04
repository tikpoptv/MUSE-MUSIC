'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import TermsModal from '@/components/TermsModal';
import Image from 'next/image';

export default function SetupStep4() {
  const router = useRouter();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [genreColors, setGenreColors] = useState<{ [key: string]: string }>({});

  const genres = [
    'R&B / Soul', 'Pop', 'Lo-Fi / Chillhop', 'Indie / Alternative', 'EDM', 'Jazz',
    'Hip-Hop / Rap', 'Country', 'Rock', 'Classical', 'Blues', 'K-Pop',
    'Afrobeat', 'Folk / Acoustic', 'Latin / Reggaeton', 'J-Pop', 'T-Pop'
  ];

  const getRandomColor = () => {
    const colors = [
      // Red variations
      'bg-red-400', 'bg-red-500', 'bg-red-600', 'bg-rose-400', 'bg-rose-500', 'bg-rose-600',
      
      // Orange variations
      'bg-orange-400', 'bg-orange-500', 'bg-orange-600', 'bg-amber-400', 'bg-amber-500', 'bg-amber-600',
      
      // Yellow variations
      'bg-yellow-400', 'bg-yellow-500', 'bg-yellow-600', 'bg-lime-400', 'bg-lime-500', 'bg-lime-600',
      
      // Green variations
      'bg-green-400', 'bg-green-500', 'bg-green-600', 'bg-emerald-400', 'bg-emerald-500', 'bg-emerald-600',
      
      // Teal variations
      'bg-teal-400', 'bg-teal-500', 'bg-teal-600', 'bg-cyan-400', 'bg-cyan-500', 'bg-cyan-600',
      
      // Blue variations
      'bg-blue-400', 'bg-blue-500', 'bg-blue-600', 'bg-sky-400', 'bg-sky-500', 'bg-sky-600',
      
      // Indigo variations
      'bg-indigo-400', 'bg-indigo-500', 'bg-indigo-600', 'bg-violet-400', 'bg-violet-500', 'bg-violet-600',
      
      // Purple variations
      'bg-purple-400', 'bg-purple-500', 'bg-purple-600', 'bg-fuchsia-400', 'bg-fuchsia-500', 'bg-fuchsia-600',
      
      // Pink variations
      'bg-pink-400', 'bg-pink-500', 'bg-pink-600', 'bg-rose-400', 'bg-rose-500', 'bg-rose-600'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres(prev => {
      if (prev.includes(genre)) {
        // Remove genre and its color
        const newColors = { ...genreColors };
        delete newColors[genre];
        setGenreColors(newColors);
        return prev.filter(g => g !== genre);
      } else {
        // Add genre with random color
        const newColor = getRandomColor();
        setGenreColors(prev => ({ ...prev, [genre]: newColor }));
        return [...prev, genre];
      }
    });
  };

  const handleNext = () => {
    if (selectedGenres.length === 0) {
      toast.error('Please select at least one genre to continue');
      return;
    }
    router.push('/');
  };

  const handleSkip = () => {
    if (!acceptTerms) {
      setShowTermsModal(true);
      toast.error('Please accept terms and conditions before skipping setup');
      return;
    }
    router.push('/');
  };

  const handleAcceptTerms = () => {
    setAcceptTerms(true);
  };

  const handleBack = () => {
    router.push('/setup/step3');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden" 
      style={{ 
        backgroundImage: 'url(/login-background.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#ffffff'
      }}
    >
      <div className="bg-white rounded-2xl p-8 mx-4 shadow-2xl relative z-10 flex flex-col justify-center" style={{
        boxShadow: '0 0 50px rgba(94, 7, 202, 0.1), 0 0 100px rgba(94, 7, 202, 0.05), 0 0 150px rgba(94, 7, 202, 0.03), 0 0 200px rgba(94, 7, 202, 0.02), 0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        width: '480px',
        height: '700px'
      }}>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Set up your profile
          </h1>
          <p className="text-sm text-gray-600">
            Pick at least one genre to start shaping your music mood.
          </p>
        </div>

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
            <button
              onClick={handleNext}
              disabled={selectedGenres.length === 0}
              className={`w-full px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2 ${
                selectedGenres.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
              }`}
            >
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
            </button>
          
          <div className="flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              Skip Set up
            </button>
            
            <button
              onClick={handleBack}
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </div>

      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={handleAcceptTerms}
      />
    </div>
  );
}
