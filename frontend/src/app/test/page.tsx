'use client';

import React, { useState, useEffect } from 'react';
import { Languages, SmilePlus } from 'lucide-react';
import { recommendSongsService } from '@/services/recommendSongsService';
import { fetchRecommendedAlbums } from '@/songs/fetchRecommendedAlbums';
import { RecommendedAlbum } from "@/types/user";
import MusicCard from '@/components/MusicCard';

export default function LandingPage() {
  const [loading, setLoading] = useState(true); // State for loading
  const [albums, setAlbums] = useState<RecommendedAlbum[]>([]); // State for albums

  useEffect(() => {
    // Fetch recommended albums on component mount
    const fetchAlbums = async () => {
      try {
        // Try to fetch from API first
        const songs = await recommendSongsService.getRecommendedSongsByLanguageAndMood(
          undefined,
          undefined,
          20
        );

        // If API returns data, use it
        if (songs && songs.length > 0) {
          const albumsData: RecommendedAlbum[] = songs.map(song => ({
            id: song.id,
            processingID: song.processingID,
            title: song.title,
            artist: song.artist,
            coverImage: song.image || null,
            mood: song.mood || null,
            genre: song.genre || 'Unknown'
          }));

          setAlbums(albumsData);
        } else {
          // Fallback to mock data if API returns empty or no data
          const mockData = await fetchRecommendedAlbums();
          setAlbums(mockData);
        }
      } catch (error) {
        // Fallback to mock data on error (e.g., API unavailable in CI/test environment)
        console.error("Error fetching albums from API, using mock data:", error);
        try {
          const mockData = await fetchRecommendedAlbums();
          setAlbums(mockData);
        } catch (mockError) {
          console.error("Error loading mock data:", mockError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  return (
    <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 bg-white min-h-screen">
      {/* Header */}
      <div className="mt-12 mb-10 text-center px-4">
        <p className="mb-6 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-black">
          Discover the soul of music!
        </p>
        <p className="text-xs xs:text-base leading-relaxed text-gray-700">
          Ever heard a song and thought, “What does this even mean?” or “Why does this hit me right in the feels?”<br />
          At MUSE MUSIC, we’re all about decoding the lyrics, uncovering hidden meanings, and capturing the mood behind every beat.<br />
          Whether it’s heartbreak, hype, or just plain weird — we’ve got you.
        </p>
      </div>

      {/* Search bar */}
      <div className="w-full max-w-[640px] mx-auto mt-4 px-4">
        <div className="relative w-full h-[60px]">
          <input
            type="text"
            placeholder="Search song by name, artist, etc."
            className="w-full h-full px-6 pr-10 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7B61FF] focus:border-transparent text-sm rounded-xl"
          />
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <svg
              className="h-6 w-6 text-[#8A73FF]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Analyze Menu */}
      <div className="flex flex-wrap gap-4 p-4 w-full max-w-[640px] mx-auto">
        <div className="flex-1 min-w-[280px] bg-gray-100 rounded-xl flex items-center justify-between gap-2 p-4">
          <p className="text-violet-600 text-sm sm:text-base">Translate to understand</p>
          <Languages className="text-violet-600 w-6 h-6" />
        </div>

        <div className="flex-1 min-w-[280px] bg-gray-100 rounded-xl flex items-center justify-between gap-2 p-4">
          <p className="text-violet-600 text-sm sm:text-base">Check the Mood</p>
          <SmilePlus className="text-violet-600 w-6 h-6" />
        </div>
      </div>

      {/* Recommend Section */}
      <section className="mt-16 text-left text-black">
        <h2 className="text-lg font-semibold mb-4">Recommend</h2>

        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : (
          <div className="flex flex-wrap justify-center md:justify-start gap-6">
            {albums.map((album) => (
              <MusicCard
                key={album.id}
                image={album.coverImage || undefined}
                title={album.title}
                artist={album.artist}
                href={`/songs/${album.id}`}
                mood={album.mood}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}