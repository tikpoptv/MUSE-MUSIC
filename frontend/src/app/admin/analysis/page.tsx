"use client"

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
import { CalendarDays, Music2, Star, Bot } from "lucide-react";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";


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

/* -------------------------
   Static mock data
   ------------------------- */
const moodStats = [
  { label: "Happy", value: 1120 },
  { label: "Sad", value: 870 },
  { label: "Fear", value: 720 },
  { label: "Anger", value: 520 },
  { label: "Disgust", value: 260 },
  { label: "Surprise", value: 185 },
];

const suggestions = [
  {
    date: "2025-09-12",
    title: "Keep the slang concise",
    description:
      "Some phrases feel a bit off in tone and a little more accuracy in slang.",
    rating: "4.5 / 5",
  },
  {
    date: "2025-09-12",
    title: "Refine the verse transitions",
    description:
      "Give a touch more detail on the bridge and make it flow into the last chorus.",
    rating: "4.3 / 5",
  },
  {
    date: "2025-09-12",
    title: "Balance emotional cues",
    description:
      "Highlight the emotional arc a little clearer so listeners grasp the mood changes.",
    rating: "4.5 / 5",
  },
];

const FEEDBACK_COUNT = 24;
const AVERAGE_RATING = 4.5;

/* -------------------------
   NEW: Sub‑mood bar chart data (matches screenshot)
   ------------------------- */

type Datum = { name: string; value: number };

const subMoodData: Record<string, Datum[]> = {
  Happy: [
    { name: "Joyful", value: 95 },
    { name: "Interested", value: 82 },
    { name: "Proud", value: 60 },
    { name: "Accepted", value: 48 },
    { name: "Powerful", value: 40 },
    { name: "Peaceful", value: 32 },
    { name: "Intimate", value: 24 },
    { name: "Optimistic", value: 12 },
  ],
  Anger: [
    { name: "Hurt", value: 88 },
    { name: "Threatened", value: 80 },
    { name: "Hateful", value: 50 },
    { name: "Mad", value: 36 },
  ],
  Sad: [
    { name: "Bored", value: 92 },
    { name: "Lonely", value: 68 },
    { name: "Depressed", value: 40 },
    { name: "Despair", value: 22 },
  ],
  Fear: [
    { name: "Scared", value: 96 },
    { name: "Anxious", value: 72 },
  ],
  Disgust: [
    { name: "Disapproval", value: 92 },
    { name: "Disappointed", value: 64 },
    { name: "Awful", value: 52 },
  ],
  Surprise: [
    { name: "Amazed", value: 92 },
    { name: "Confused", value: 76 },
    { name: "Startled", value: 56 },
    { name: "Excited", value: 20 },
  ],
};

const moodPalette: Record<string, string> = {
  Happy: "#facc15",
  Anger: "#ef4444",
  Sad: "#60a5fa",
  Fear: "#a78bfa",
  Disgust: "#34d399",
  Surprise: "#fb923c",
};

function SubMoodCard({ title }: { title: keyof typeof subMoodData }) {
  const data = subMoodData[title];
  const color = moodPalette[title as string];

  // make bars visually thicker and give more breathing room
  // Responsive height: smaller on mobile, larger on desktop
  const chartHeight = Math.max(200, data.length * 40); // scales height with rows, smaller base for mobile

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
                  3,675
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
          {moodStats.map((stat) => (
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
                    {stat.value}
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
                <ProgressWithKnob value={FEEDBACK_COUNT} max={100} className="mt-2 sm:mt-3" />
                <div className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-semibold text-pink-600">
                  {FEEDBACK_COUNT}
                </div>
              </div>
              <div className="rounded-md border border-slate-200 bg-white p-3 sm:p-4 shadow-sm">
                <p className="text-xs sm:text-sm font-medium text-slate-800">Rating (average)</p>
                <ProgressWithKnob value={AVERAGE_RATING} max={5} className="mt-2 sm:mt-3" />
                <div className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-semibold text-pink-600">
                  {AVERAGE_RATING} / 5
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
            >
              View All
            </Button>
          </CardHeader>

          <CardContent className="px-4 sm:px-6 py-4 sm:py-6">
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
              {suggestions.map((item) => {
                const ratingNumber =
                  typeof item.rating === "string"
                    ? parseFloat(item.rating)
                    : (item.rating as unknown as number);

                return (
                  <div
                    key={`${item.date}-${item.title}`}
                    className="rounded-md border border-slate-200 bg-white p-4 sm:p-5 shadow-sm"
                  >
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
                      <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4 text-violet-500 flex-shrink-0" />
                      <span className="font-medium">{item.date}</span>
                    </div>
                    <h3 className="mt-2 sm:mt-3 text-sm sm:text-base font-semibold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-slate-600">
                      {item.description}
                    </p>
                    <ProgressWithKnob value={ratingNumber} max={5} className="mt-2 sm:mt-3" />
                    <div className="mt-2 sm:mt-3 flex items-center gap-1 text-lg sm:text-xl font-semibold text-pink-600">
                      <Star className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                      <span>
                        {typeof item.rating === "string"
                          ? item.rating
                          : `${ratingNumber} / 5`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* SECTION: Sub‑mood charts (2 per line) */}
        <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 md:grid-cols-2">
          <SubMoodCard title="Happy" />
          <SubMoodCard title="Anger" />
          <SubMoodCard title="Sad" />
          <SubMoodCard title="Fear" />
          <SubMoodCard title="Disgust" />
          <SubMoodCard title="Surprise" />
        </div>
      </div>
    </AdminMenu>
  );
}
