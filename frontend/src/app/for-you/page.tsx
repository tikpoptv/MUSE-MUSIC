'use client';
import { useEffect, useState } from 'react';
import { Smile, Clock } from 'lucide-react';
import MusicCard from '@/components/MusicCard';
import MoodCard from '@/components/MoodCard';
import SkeletonCard from '@/components/SkeletonCard';
import { fetchForYouContent } from '@/services/forYouService';
import type { ForYouResponse } from '@/types/forYou';

export default function ForYouPage() {
  const [data, setData] = useState<ForYouResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchForYouContent();
        setData(result);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error loading For You content:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-6xl px-6 pt-12 pb-6">
        <h1 className="text-[32px] md:text-[40px] font-bold text-black text-center mb-6">
          Your vibe! Your feeling!
        </h1>

        {/* Your Mood and Recently Search Section - Side by Side */}
        <div className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-0">
            {/* Your Mood Section - Left Side */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Smile className="h-6 w-6 text-[#7B61FF]" />
                <h2 className="text-[24px] font-bold text-black">Your Mood</h2>
              </div>
              <div className="w-full max-w-[75%]">
                {loading ? (
                  <SkeletonCard />
                ) : data?.moods && data.moods.length > 0 ? (
                  <MoodCard
                    moodType={data.moods[0].moodType}
                    percentage={data.moods[0].percentage}
                  />
                ) : (
                  <p className="text-sm text-gray-500">No mood data available</p>
                )}
              </div>
            </div>

            {/* Recently Search Section - Right Side */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-6 w-6 text-[#7B61FF]" />
                <h2 className="text-[24px] font-bold text-black">Recently search</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                {loading
                  ? Array.from({ length: 4 }).map((_, idx) => (
                      <SkeletonCard key={`skeleton-recent-${idx}`} />
                    ))
                  : data?.recentlySearched && data.recentlySearched.length > 0
                  ? data.recentlySearched.map((item, idx) => (
                      <MusicCard
                        key={`recent-${idx}`}
                        image={item.image}
                        title={item.title}
                        artist={item.artist}
                        href={`/song/${item.id}${item.processingID ? `?processingID=${item.processingID}` : ''}`}
                      />
                    ))
                  : (
                      <p className="text-sm text-gray-500 col-span-full">No recently searched songs</p>
                    )}
              </div>
            </div>
          </div>
        </div>

        {/* Top-Hits Section - Show recommendations instead */}
        {data?.recommendations && data.recommendations.subsections && data.recommendations.subsections.length > 0 && (
          <div className="mb-12">
            <h2 className="text-[24px] font-bold text-black mb-6">Top-Hits.</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
              {loading
                ? Array.from({ length: 5 }).map((_, idx) => (
                    <SkeletonCard key={`skeleton-top-${idx}`} />
                  ))
                : (() => {
                    const allItems = data.recommendations.subsections
                      .flatMap(subsection => subsection.items || [])
                      .slice(0, 5);
                    
                    return allItems.length > 0
                      ? allItems.map((item, idx) => (
                          <MusicCard
                            key={`top-${idx}`}
                            image={item.image}
                            title={item.title}
                            artist={item.artist}
                            href={`/song/${item.id}${item.processingID ? `?processingID=${item.processingID}` : ''}`}
                          />
                        ))
                      : (
                          <p className="text-sm text-gray-500 col-span-full">No recommendations available</p>
                        );
                  })()}
            </div>
          </div>
        )}

        {/* Our Recommend For You Section */}
        {data?.recommendations && (
          <div className="mb-12">
            <h2 className="text-[24px] font-bold text-black mb-2">
              {data.recommendations.title}
            </h2>
            <p className="text-sm text-gray-600 mb-6 max-w-2xl">
              {data.recommendations.description}
            </p>

            {data.recommendations.subsections && data.recommendations.subsections.length > 0
              ? data.recommendations.subsections.map((subsection, subIdx) => (
                  <div key={`subsection-${subIdx}`} className={subIdx > 0 ? 'mt-10' : ''}>
                    <h3 className="text-[20px] font-bold text-black mb-4">
                      {subsection.title}.
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
                      {loading
                        ? Array.from({ length: 5 }).map((_, idx) => (
                            <SkeletonCard key={`skeleton-${subsection.title}-${idx}`} />
                          ))
                        : subsection.items && subsection.items.length > 0
                        ? subsection.items.map((item, idx) => (
                            <MusicCard
                              key={`${subsection.title}-${idx}`}
                              image={item.image}
                              title={item.title}
                              artist={item.artist}
                              href={`/song/${item.id}${item.processingID ? `?processingID=${item.processingID}` : ''}`}
                            />
                          ))
                        : (
                            <p className="text-sm text-gray-500 col-span-full">No items in this section</p>
                          )}
                    </div>
                  </div>
                ))
              : (
                  <p className="text-sm text-gray-500">No recommendations available</p>
                )}
          </div>
        )}
      </section>
    </main>
  );
}

