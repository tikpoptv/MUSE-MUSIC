import { RecommendedAlbum } from "@/types/user";

export const fetchRecommendedAlbums = async (): Promise<RecommendedAlbum[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: "1",
          title: "AM I THE DRAMA",
          artist: "Cardi B",
          coverImage: "/images/drama.jpg",
          mood: "happy",
          genre: "hip-hop",
        },
        {
          id: "2",
          title: "LOVE YOURSELF",
          artist: "BTS",
          coverImage: "/images/love.jpg",
          mood: "romantic",
          genre: "pop",
        },
        {
          id: "3",
          title: "GHOST TOWN",
          artist: "Kanye West",
          coverImage: "/images/butterfly.jpg",
          mood: "calm",
          genre: "soul",
        },
        {
          id: "4",
          title: "DAYLIGHT",
          artist: "David Kushner",
          coverImage: "/images/xoxo.jpg",
          mood: "melancholic",
          genre: "alternative",
        },
        {
          id: "5",
          title: "About you",
          artist: "The 1975",
          coverImage: "/images/cover.jpg",
          mood: "warm",
          genre: "pop",
        },
      ]);
    }, 500);
  });
};
