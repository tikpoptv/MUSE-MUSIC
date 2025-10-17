import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Smile } from "lucide-react";

interface MusicCardProps {
  image: string;
  title: string;
  artist: string;
  href: string;
}

const MusicCard: React.FC<MusicCardProps> = ({ image, title, artist, href }) => {
  return (
    <Link href={href}>
      <div 
        className="relative w-[195px] h-[235px] rounded-xl overflow-hidden shadow-md bg-white cursor-pointer hover:scale-105 transition-transform duration-300"
        role="button"
        tabIndex={0}
        aria-label={`Listen to ${title} by ${artist}`}
      >
        <Image 
          src={image} 
          alt={title} 
          width={195} 
          height={192}
          className="w-full h-[192px] object-cover rounded-xl"
          priority={false}
          loading="lazy"
        />
        <div className="absolute bottom-[46px] right-[8px] bg-white/80 p-1.5 rounded-lg shadow-sm">
          <Smile size={20} className="text-[#7B61FF]" />
        </div>
        <div className="mt-1 px-1">
          <p className="text-sm font-semibold leading-tight truncate">{title}</p>
          <p className="text-xs text-[#7B61FF] font-medium">{artist}</p>
        </div>
      </div>
    </Link>
  );
};

export default MusicCard;
