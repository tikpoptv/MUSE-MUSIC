import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Smile, Music, Heart, Waves, Moon, Sparkles, Meh, Thermometer, Loader, HeartCrack, Sun, SmilePlus, HeartPulse, Sparkle, UserCircle } from "lucide-react";

interface MusicCardProps {
  image?: string;
  title: string;
  artist: string;
  href: string;
  mood?: {
    type: string;
    percentage: number;
  } | null;
}

const moodIconMap: Record<string, { type: 'svg' | 'lucide', path?: string, icon?: React.ComponentType<{ className?: string }> }> = {
  happy: { type: 'svg', path: '/icons/happy-icon.svg' },
  sad: { type: 'svg', path: '/icons/sad-icon.svg' },
  anger: { type: 'svg', path: '/icons/anger-icon.svg' },
  disgust: { type: 'svg', path: '/icons/disgust-icon.svg' },
  fear: { type: 'svg', path: '/icons/fear-icon.svg' },
  surprise: { type: 'svg', path: '/icons/surprise-icon.svg' },
  sleepy: { type: 'lucide', icon: Moon },
  playful: { type: 'lucide', icon: Sparkles },
  love: { type: 'lucide', icon: Heart },
  calm: { type: 'lucide', icon: Waves },
  neutral: { type: 'lucide', icon: Meh },
  sick: { type: 'lucide', icon: Thermometer },
  embarrassed: { type: 'lucide', icon: UserCircle },
  dizzy: { type: 'lucide', icon: Loader },
  'broken heart': { type: 'lucide', icon: HeartCrack },
  cool: { type: 'lucide', icon: Sun },
  mixed: { type: 'lucide', icon: SmilePlus },
  awkward: { type: 'lucide', icon: SmilePlus },
  wink: { type: 'lucide', icon: SmilePlus },
  hearts: { type: 'lucide', icon: HeartPulse },
  angel: { type: 'lucide', icon: Sparkle }
};

const MusicCard: React.FC<MusicCardProps> = ({ image, title, artist, href, mood }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const hasImage = image && image.trim() !== '' && image !== '/images/cover.jpg' && !imageError;

  // Get mood icon
  const normalizeMoodKey = (moodType: string): string => {
    if (!moodType) return '';
    return moodType.toLowerCase().trim().replace(/\s+/g, ' ');
  };

  const moodKey = mood?.type ? normalizeMoodKey(mood.type) : '';
  const moodIcon = moodKey ? moodIconMap[moodKey] : null;

  return (
    <Link href={href}>
      <div
        className="group cursor-pointer"
        role="button"
        tabIndex={0}
        aria-label={`Listen to ${title} by ${artist}`}
      >
        <div className="w-full aspect-square rounded-xl mb-3 relative overflow-hidden bg-gradient-to-br from-[#7B61FF] to-[#6B51EF] transition-transform duration-300 group-hover:scale-[1.02]">                                                                    
          {hasImage ? (
            image.startsWith('/api/images') || image.startsWith('http') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt={title}
                className={`object-cover absolute inset-0 w-full h-full transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}                                                                                                              
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            ) : (
              <Image
                src={image}
                alt={title}
                fill
                sizes="(max-width: 768px) 50vw, 200px"
                className={`object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                priority={false}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            )
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Music className="text-white/80" size={64} />
            </div>
          )}
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-0 right-0">
            <div className="w-12 h-12 bg-white/80 rounded-lg flex items-center justify-center">
              {moodIcon ? (
                moodIcon.type === 'svg' && moodIcon.path ? (
                  <Image
                    src={moodIcon.path}
                    alt={`${mood?.type} mood icon`}
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                ) : moodIcon.type === 'lucide' && moodIcon.icon ? (
                  <moodIcon.icon className="text-[#7B61FF]" size={20} />
                ) : (
                  <Smile className="text-[#7B61FF]" size={20} />
                )
              ) : (
                <Smile className="text-[#7B61FF]" size={20} />
              )}
            </div>
          </div>
        </div>
        <h3 className="font-bold text-gray-900 text-sm truncate">{title}</h3>
        <p className="text-[#7B61FF] text-xs truncate">{artist}</p>
      </div>
    </Link>
  );
};

export default MusicCard;
