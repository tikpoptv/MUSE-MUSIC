import React from "react";
import { Smile } from "lucide-react";

interface MoodCardProps {
  moodType: string;
  percentage: number;
}

// Map mood types to display names and colors
const moodConfig: Record<string, { label: string; bgColor: string; textColor: string; iconColor: string }> = {
  happy: { label: 'Happy', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', iconColor: 'text-yellow-600' },
  sad: { label: 'Sad', bgColor: 'bg-blue-100', textColor: 'text-blue-700', iconColor: 'text-blue-600' },
  fear: { label: 'Fear', bgColor: 'bg-purple-100', textColor: 'text-purple-700', iconColor: 'text-purple-600' },
  anger: { label: 'Anger', bgColor: 'bg-red-100', textColor: 'text-red-700', iconColor: 'text-red-600' },
  disgust: { label: 'Disgust', bgColor: 'bg-green-100', textColor: 'text-green-700', iconColor: 'text-green-600' },
  surprise: { label: 'Surprise', bgColor: 'bg-orange-100', textColor: 'text-orange-700', iconColor: 'text-orange-600' },
  powerful: { label: 'Powerful', bgColor: 'bg-pink-100', textColor: 'text-pink-700', iconColor: 'text-pink-600' },
  calm: { label: 'Calm', bgColor: 'bg-cyan-100', textColor: 'text-cyan-700', iconColor: 'text-cyan-600' },
  energetic: { label: 'Energetic', bgColor: 'bg-amber-100', textColor: 'text-amber-700', iconColor: 'text-amber-600' },
};

const MoodCard: React.FC<MoodCardProps> = ({ moodType, percentage }) => {
  const config = moodConfig[moodType.toLowerCase()] || {
    label: moodType.charAt(0).toUpperCase() + moodType.slice(1),
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    iconColor: 'text-gray-600',
  };

  return (
    <div
      className="group cursor-pointer"
      role="button"
      tabIndex={0}
      aria-label={`${config.label} mood: ${percentage}%`}
    >
      <div className={`w-full aspect-square rounded-xl mb-3 relative overflow-hidden ${config.bgColor} transition-transform duration-300 group-hover:scale-[1.02]`}>
        {/* Mood icon centered */}
        <div className={`absolute inset-0 flex items-center justify-center ${config.iconColor}`}>
          <Smile className="w-20 h-20" strokeWidth={1.5} />
        </div>
        
        {/* Percentage badge */}
        <div className={`absolute top-2 right-2 ${config.textColor} text-xs font-bold`}>
          {percentage}%
        </div>
        
        {/* Small smile icon at bottom right */}
        {/* <div className="absolute bottom-0 right-0">
          <div className="w-12 h-12 bg-white/80 rounded-lg flex items-center justify-center">
            <Smile className="text-[#7B61FF]" size={20} />
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default MoodCard;

