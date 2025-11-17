import { RecommendedAlbum } from "@/types/user";

// Mock data for testing/fallback when API is unavailable
export const fetchRecommendedAlbums = async (): Promise<RecommendedAlbum[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: "1",
          processingID: "1",
          title: "AM I THE DRAMA",
          artist: "Cardi B",
          coverImage: "/images/drama.jpg",
          mood: { type: "happy", percentage: 80 },
          genre: "hip-hop",
        },
        {
          id: "2",
          processingID: "2",
          title: "LOVE YOURSELF",
          artist: "BTS",
          coverImage: "/images/love.jpg",
          mood: { type: "romantic", percentage: 75 },
          genre: "pop",
        },
        {
          id: "3",
          processingID: "3",
          title: "GHOST TOWN",
          artist: "Kanye West",
          coverImage: "/images/butterfly.jpg",
          mood: { type: "calm", percentage: 70 },
          genre: "soul",
        },
        {
          id: "4",
          processingID: "4",
          title: "DAYLIGHT",
          artist: "David Kushner",
          coverImage: "/images/xoxo.jpg",
          mood: { type: "melancholic", percentage: 65 },
          genre: "alternative",
        },
        {
          id: "5",
          processingID: "5",
          title: "About you",
          artist: "The 1975",
          coverImage: "/images/cover.jpg",
          mood: { type: "warm", percentage: 72 },
          genre: "pop",
        },
      ]);
    }, 100);
  });
};
