'use client';
import { useEffect, useState, useCallback } from 'react';
import { Smile, Clock, RefreshCcw } from 'lucide-react';
import MusicCard from '@/components/MusicCard';
import MoodCard from '@/components/MoodCard';
import SkeletonCard from '@/components/SkeletonCard';
import { fetchForYouContent } from '@/services/forYouService';
import type { ForYouResponse } from '@/types/forYou';

export default function ForYouPage() {
  const [data, setData] = useState<ForYouResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchForYouContent(100, 0);
        setData(result);
        setOffset(100);
        setHasMore(true); // Assume there's more, will be updated based on response
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error loading For You content:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !data) return;
    
    setLoadingMore(true);
    try {
      const result = await fetchForYouContent(100, offset);
      
      // Merge recommendations subsections
      const mergedSubsections: Record<string, typeof data.recommendations.subsections[0]> = {};
      
      // Add existing subsections
      data.recommendations.subsections.forEach(subsection => {
        mergedSubsections[subsection.title] = { ...subsection };
      });
      
      // Add new subsections
      result.recommendations.subsections.forEach(subsection => {
        if (mergedSubsections[subsection.title]) {
          mergedSubsections[subsection.title].items.push(...subsection.items);
        } else {
          mergedSubsections[subsection.title] = { ...subsection };
        }
      });
      
      setData({
        ...data,
        recommendations: {
          ...data.recommendations,
          subsections: Object.values(mergedSubsections)
        },
        topHits: [...data.topHits, ...result.topHits],
        recentlySearched: [...data.recentlySearched, ...result.recentlySearched]
      });
      setOffset(offset + 100);
      // Check if we got less than requested, means no more
      if (result.recommendations.subsections.length === 0 && result.topHits.length === 0) {
        setHasMore(false);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load more content:', error);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [data, offset, hasMore, loadingMore]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (loadingMore || !hasMore) return;
      
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      
      // Load more when user is 200px from bottom
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore, loadingMore, hasMore]);

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
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-6 w-6 text-[#7B61FF]" />
                <h2 className="text-[24px] font-bold text-black">Recently search</h2>
              </div>
              {loading ? (
                <div className="overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
                  <div className="flex gap-4 min-w-max">
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <div key={`skeleton-recent-${idx}`} className="flex-shrink-0 w-[180px] sm:w-[200px]">
                        <SkeletonCard />
                      </div>
                    ))}
                  </div>
                </div>
              ) : data?.recentlySearched && data.recentlySearched.length > 0 ? (
                <div className="overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
                  <div className="flex gap-4 min-w-max">
                    {data.recentlySearched.map((item, idx) => (
                      <div key={`recent-${idx}`} className="flex-shrink-0 w-[180px] sm:w-[200px]">
                      <MusicCard
                        image={item.image}
                        title={item.title}
                        artist={item.artist}
                        href={`/song/${item.id}${item.processingID ? `?processingID=${item.processingID}` : ''}`}
                        mood={item.mood || undefined}
                      />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No recently searched songs</p>
                    )}
            </div>
          </div>
        </div>

        {/* Top-Hits Section - Show recommendations instead */}
        {data?.recommendations && data.recommendations.subsections && data.recommendations.subsections.length > 0 && (
          <div className="mb-12">
            <h2 className="text-[24px] font-bold text-black mb-6">Top-Hits.</h2>
            {loading ? (
              <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                <div className="flex gap-4 min-w-max">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <div key={`skeleton-top-${idx}`} className="flex-shrink-0 w-[180px] sm:w-[200px]">
                      <SkeletonCard />
                    </div>
                  ))}
                </div>
              </div>
            ) : (() => {
                    const allItems = data.recommendations.subsections
                  .flatMap(subsection => subsection.items || []);
                    
                return allItems.length > 0 ? (
                  <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                    <div className="flex gap-4 min-w-max">
                      {allItems.map((item, idx) => (
                        <div key={`top-${idx}`} className="flex-shrink-0 w-[180px] sm:w-[200px]">
                          <MusicCard
                            image={item.image}
                            title={item.title}
                            artist={item.artist}
                            href={`/song/${item.id}${item.processingID ? `?processingID=${item.processingID}` : ''}`}
                            mood={item.mood || undefined}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No recommendations available</p>
                        );
                  })()}
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
                    {loading ? (
                      <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                        <div className="flex gap-4 min-w-max">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <div key={`skeleton-${subsection.title}-${idx}`} className="flex-shrink-0 w-[180px] sm:w-[200px]">
                              <SkeletonCard />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : subsection.items && subsection.items.length > 0 ? (
                      <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                        <div className="flex gap-4 min-w-max">
                          {subsection.items.map((item, idx) => (
                            <div key={`${subsection.title}-${idx}`} className="flex-shrink-0 w-[180px] sm:w-[200px]">
                            <MusicCard
                              image={item.image}
                              title={item.title}
                              artist={item.artist}
                              href={`/song/${item.id}${item.processingID ? `?processingID=${item.processingID}` : ''}`}
                              mood={item.mood || undefined}
                            />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No items in this section</p>
                          )}
                  </div>
                ))
              : (
                  <p className="text-sm text-gray-500">No recommendations available</p>
                )}
          </div>
        )}

        {loadingMore && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <RefreshCcw className="h-5 w-5 animate-spin" />
              <span>Loading more...</span>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

