"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import AdminMenu from "@/components/AdminMenu";
import { CalendarDays, Music2, Star, Bot, X } from "lucide-react";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
import { adminAnalysisService } from "@/services/adminAnalysisService";
import type { AdminAnalysisData, SubMoodDatum } from "@/types/adminAnalysis";
import toast from "react-hot-toast";


/* -------------------------
   Progress bar with knob
   ------------------------- */
function ProgressWithKnob({
  value,
  max = 100,
  className = "",
}: {
  value: number;
  max?: number;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={className}>
      <div className="relative h-2.5 w-full rounded-md bg-slate-100">
        <div
          className="absolute inset-y-0 left-0 rounded-md bg-gradient-to-r from-pink-500 to-pink-600"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute -top-1.5"
          style={{ left: `calc(${pct}% - 12px)` }}
        >
          <div className="h-5 w-5 rounded-full border-2 border-pink-600 bg-white shadow-sm" />
        </div>
      </div>
    </div>
  );
}


const moodPalette: Record<string, string> = {
  Happy: "#facc15",
  Anger: "#ef4444",
  Sad: "#60a5fa",
  Fear: "#a78bfa",
  Disgust: "#34d399",
  Surprise: "#fb923c",
};

function SubMoodCard({ 
  title, 
  data 
}: { 
  title: string;
  data: SubMoodDatum[];
}) {
  const color = moodPalette[title as string] || "#7B61FF";

  if (!data || data.length === 0) {
    return (
      <Card className="rounded-lg border border-slate-200 bg-white p-0 shadow-sm">
        <CardHeader className="px-3 sm:px-4 md:px-5 pb-0 pt-3 sm:pt-4 md:pt-5">
          <CardTitle className="text-sm sm:text-base font-medium text-slate-800">
            {title} sub-mood song
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-4 md:px-5 pb-3 sm:pb-4 md:pb-5">
          <p className="text-sm text-slate-500">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const chartHeight = Math.max(200, data.length * 40);

  return (
    <Card className="rounded-lg border border-slate-200 bg-white p-0 shadow-sm">
      <CardHeader className="px-3 sm:px-4 md:px-5 pb-0 pt-3 sm:pt-4 md:pt-5">
        <CardTitle className="text-sm sm:text-base font-medium text-slate-800">
          {title} sub-mood song
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-4 md:px-5 pb-3 sm:pb-4 md:pb-5">
        <ChartContainer
          className={`w-full`}
          style={{ height: chartHeight }}
          config={{ value: { label: "Count", color } }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              barSize={28}
              barCategoryGap={12}
              margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis type="number" hide domain={[0, 100]} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: "#475569" }}
                width={80}
              />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="value" radius={[3, 3, 3, 3]} fill={color} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default function AdminAnalysis() {
  const router = useRouter();
  const [analysisData, setAnalysisData] = useState<AdminAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [data] = await Promise.all([
          adminAnalysisService.getAnalysisData(),
          new Promise(resolve => setTimeout(resolve, 1000))
        ]);
        if (data) {
          setAnalysisData(data);
        } else {
          setError("Failed to load analysis data");
          toast.error("Failed to load analysis data");
        }
      } catch (err) {
        setError("An error occurred while loading analysis data");
        toast.error("An error occurred while loading analysis data");
        // eslint-disable-next-line no-console
        console.error("Error fetching analysis data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysisData();
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  if (isLoading) {
    return (
      <AdminMenu>
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>

          <Card className="rounded-lg border border-slate-200 bg-gradient-to-r from-[#f1e8ff] via-[#f7f2ff] to-white p-0 shadow-md animate-pulse">
            <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
              <div className="flex items-start justify-between gap-4 sm:gap-6">
                <div className="flex flex-col gap-1 sm:gap-2">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-12 w-32 bg-gray-200 rounded"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 bg-gray-200 rounded-md"></div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="rounded-lg border border-slate-200 bg-white p-3 sm:p-4 md:p-6 shadow-sm animate-pulse">
                <CardContent className="flex items-center gap-2 sm:gap-3 md:gap-4 p-0">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 bg-gray-200 rounded-md"></div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="h-4 w-16 bg-gray-200 rounded mb-2"></div>
                    <div className="h-6 w-12 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="rounded-lg border border-slate-200 bg-white p-0 shadow-md animate-pulse">
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-3 sm:py-4 md:py-5 px-4 sm:px-6">
              <div className="h-6 w-24 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 py-4 sm:py-6">
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="rounded-md border border-slate-200 bg-white p-3 sm:p-4 shadow-sm">
                  <div className="h-4 w-32 bg-gray-200 rounded mb-3"></div>
                  <div className="h-2.5 w-full bg-gray-200 rounded mb-3"></div>
                  <div className="h-8 w-24 bg-gray-200 rounded"></div>
                </div>
                <div className="rounded-md border border-slate-200 bg-white p-3 sm:p-4 shadow-sm">
                  <div className="h-4 w-32 bg-gray-200 rounded mb-3"></div>
                  <div className="h-2.5 w-full bg-gray-200 rounded mb-3"></div>
                  <div className="h-8 w-24 bg-gray-200 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg border border-slate-200 bg-white p-0 shadow-md animate-pulse">
            <CardHeader className="flex items-center justify-between gap-2 space-y-0 border-b py-3 sm:py-4 md:py-5 px-4 sm:px-6">
              <div className="h-6 w-32 bg-gray-200 rounded"></div>
              <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 py-4 sm:py-6">
              <div className="flex items-center justify-center h-[200px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
                  <p className="text-gray-500 font-medium">Loading analysis data...</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 md:grid-cols-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="rounded-lg border border-slate-200 bg-white p-0 shadow-sm animate-pulse">
                <CardHeader className="px-3 sm:px-4 md:px-5 pb-0 pt-3 sm:pt-4 md:pt-5">
                  <div className="h-5 w-40 bg-gray-200 rounded"></div>
                </CardHeader>
                <CardContent className="px-3 sm:px-4 md:px-5 pb-3 sm:pb-4 md:pb-5">
                  <div className="h-[200px] bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminMenu>
    );
  }

  if (error || !analysisData) {
    return (
      <AdminMenu>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-red-600">{error || "Failed to load analysis data"}</p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="text-sm"
            >
              Retry
            </Button>
          </div>
        </div>
      </AdminMenu>
    );
  }

  const mainMoods = ['Happy', 'Sad', 'Fear', 'Anger', 'Disgust', 'Surprise'];

  return (
    <AdminMenu>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-3">
          <Bot className="w-9 h-9 flex-shrink-0" style={{ color: "#7B61FF" }} />
          <p
            className="text-[20px] font-semibold"
            style={{
              color: "#7B61FF",
              textAlign: "left",
              fontFamily: "Inter",
              fontStyle: "normal",
              fontWeight: 600,
              lineHeight: "normal",
            }}
          >
            Analysis
          </p>
        </div>

        <Card className="rounded-lg border border-slate-200 bg-gradient-to-r from-[#f1e8ff] via-[#f7f2ff] to-white p-0 shadow-md">
          <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
            <div className="flex items-start justify-between gap-4 sm:gap-6">
              <div className="flex flex-col gap-1 sm:gap-2">
                <CardDescription className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-violet-500">
                  Total songs
                </CardDescription>
                <CardTitle className="text-3xl sm:text-4xl md:text-5xl font-semibold text-slate-900">
                  {formatNumber(analysisData.totalSongs)}
                </CardTitle>
                <p className="text-xs sm:text-sm font-medium text-slate-500">All moods</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 flex items-center justify-center rounded-md bg-white shadow-inner flex-shrink-0">
                <Music2 className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-violet-500" />
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {analysisData.moodStats.map((stat) => (
            <Card
              key={stat.label}
              className="rounded-lg border border-slate-200 bg-white p-3 sm:p-4 md:p-6 shadow-sm"
            >
              <CardContent className="flex items-center gap-2 sm:gap-3 md:gap-4 p-0">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 items-center justify-center rounded-md bg-gradient-to-br from-violet-100 via-white to-violet-50 text-violet-500 flex-shrink-0">
                  <Music2 className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs sm:text-sm font-medium text-slate-500 truncate">
                    {stat.label}
                  </span>
                  <span className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-900">
                    {formatNumber(stat.value)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="rounded-lg border border-slate-200 bg-white p-0 shadow-md">
          <CardHeader className="flex items-center gap-2 space-y-0 border-b py-3 sm:py-4 md:py-5 px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl">Rating</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 py-4 sm:py-6">
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="rounded-md border border-slate-200 bg-white p-3 sm:p-4 shadow-sm">
                <p className="text-xs sm:text-sm font-medium text-slate-800">Feedback User</p>
                <ProgressWithKnob value={analysisData.feedbackCount} max={100} className="mt-2 sm:mt-3" />
                <div className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-semibold text-pink-600">
                  {formatNumber(analysisData.feedbackCount)}
                </div>
              </div>
              <div className="rounded-md border border-slate-200 bg-white p-3 sm:p-4 shadow-sm">
                <p className="text-xs sm:text-sm font-medium text-slate-800">Rating (average)</p>
                <ProgressWithKnob value={analysisData.averageRating} max={5} className="mt-2 sm:mt-3" />
                <div className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-semibold text-pink-600">
                  {analysisData.averageRating.toFixed(1)} / 5
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border border-slate-200 bg-white p-0 shadow-md">
          <CardHeader className="flex items-center justify-between gap-2 space-y-0 border-b py-3 sm:py-4 md:py-5 px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl">Suggestion</CardTitle>
            <Button
              variant="outline"
              className="text-sm font-medium text-violet-600 border-violet-600 hover:bg-violet-50"
              onClick={() => setShowSuggestionsModal(true)}
            >
              View All
            </Button>
          </CardHeader>

          <CardContent className="px-4 sm:px-6 py-4 sm:py-6">
            {analysisData.suggestions.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No suggestions available</p>
            ) : (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
                {analysisData.suggestions.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="rounded-md border border-slate-200 bg-white p-4 sm:p-5 shadow-sm cursor-pointer transition-all hover:border-violet-400 hover:shadow-md"
                    onClick={() => {
                      if (item.songID && item.processingID) {
                        router.push(`/song/${item.songID}?processingID=${item.processingID}`);
                      }
                    }}
                  >
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
                      <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4 text-violet-500 flex-shrink-0" />
                      <span className="font-medium">{item.date || "N/A"}</span>
                    </div>
                    <h3 className="mt-2 sm:mt-3 text-sm sm:text-base font-semibold text-slate-900">
                      {item.songName}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-slate-600">
                      {item.comment}
                    </p>
                    <ProgressWithKnob value={item.rating} max={5} className="mt-2 sm:mt-3" />
                    <div className="mt-2 sm:mt-3 flex items-center gap-1 text-lg sm:text-xl font-semibold text-pink-600">
                      <Star className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                      <span>{item.rating.toFixed(1)} / 5</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 md:grid-cols-2">
          {mainMoods.map((mood) => (
            <SubMoodCard
              key={mood}
              title={mood}
              data={analysisData.subMoodData[mood] || []}
            />
          ))}
        </div>
      </div>

      {showSuggestionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowSuggestionsModal(false)}
          />
          <div className="relative z-10 w-full max-w-4xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">All Suggestions</h3>
                <p className="text-sm text-slate-500">
                  Showing {analysisData.suggestions.length} recent items
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSuggestionsModal(false)}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-6 py-4 space-y-4">
              {analysisData.suggestions.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  No suggestions available
                </p>
              ) : (
                analysisData.suggestions.map((item) => (
                  <div
                    key={`modal-${item.id}`}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm cursor-pointer transition-all hover:border-violet-400 hover:shadow-md"
                    onClick={() => {
                      if (item.songID && item.processingID) {
                        router.push(`/song/${item.songID}?processingID=${item.processingID}`);
                      }
                    }}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-base font-semibold text-slate-900">
                          {item.songName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.date || "No date"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-lg font-semibold text-pink-600">
                        <Star className="h-4 w-4" />
                        <span>{item.rating.toFixed(1)} / 5</span>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {item.comment || "No comment provided"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </AdminMenu>
  );
}
