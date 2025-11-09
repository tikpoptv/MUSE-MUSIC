"use client"
import * as React from "react";
import { Line, LineChart, CartesianGrid, XAxis, Bar, BarChart, Cell } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import AdminMenu from '@/components/AdminMenu';
import BigStatCard from '@/components/BigStatCard';
import { ChartArea, Music2, SearchCheck, Activity } from 'lucide-react';

const chartData = [
    { date: "2024-05-01", desktop: 165, mobile: 220 },
    { date: "2024-05-02", desktop: 293, mobile: 310 },
    { date: "2024-05-03", desktop: 247, mobile: 190 },
    { date: "2024-05-04", desktop: 385, mobile: 420 },
    { date: "2024-05-05", desktop: 481, mobile: 390 },
    { date: "2024-05-06", desktop: 498, mobile: 520 },
    { date: "2024-05-07", desktop: 388, mobile: 300 },
    { date: "2024-05-08", desktop: 149, mobile: 210 },
    { date: "2024-05-09", desktop: 227, mobile: 180 },
    { date: "2024-05-10", desktop: 293, mobile: 330 },
    { date: "2024-05-11", desktop: 335, mobile: 270 },
    { date: "2024-05-12", desktop: 197, mobile: 240 },
    { date: "2024-05-13", desktop: 197, mobile: 160 },
    { date: "2024-05-14", desktop: 448, mobile: 490 },
    { date: "2024-05-15", desktop: 473, mobile: 380 },
    { date: "2024-05-16", desktop: 338, mobile: 400 },
    { date: "2024-05-17", desktop: 499, mobile: 420 },
    { date: "2024-05-18", desktop: 315, mobile: 350 },
    { date: "2024-05-19", desktop: 235, mobile: 180 },
    { date: "2024-05-20", desktop: 177, mobile: 230 },
    { date: "2024-05-21", desktop: 82, mobile: 140 },
    { date: "2024-05-22", desktop: 81, mobile: 120 },
    { date: "2024-05-23", desktop: 252, mobile: 290 },
    { date: "2024-05-24", desktop: 294, mobile: 220 },
    { date: "2024-05-25", desktop: 201, mobile: 250 },
    { date: "2024-05-26", desktop: 213, mobile: 170 },
    { date: "2024-05-27", desktop: 420, mobile: 460 },
    { date: "2024-05-28", desktop: 233, mobile: 190 },
    { date: "2024-05-29", desktop: 78, mobile: 130 },
    { date: "2024-05-30", desktop: 340, mobile: 280 },
    { date: "2024-05-31", desktop: 178, mobile: 230 },
    { date: "2024-06-01", desktop: 178, mobile: 200 },
    { date: "2024-06-02", desktop: 470, mobile: 410 },
    { date: "2024-06-03", desktop: 103, mobile: 160 },
    { date: "2024-06-04", desktop: 439, mobile: 380 },
    { date: "2024-06-05", desktop: 88, mobile: 140 },
    { date: "2024-06-06", desktop: 294, mobile: 250 },
    { date: "2024-06-07", desktop: 323, mobile: 370 },
    { date: "2024-06-08", desktop: 385, mobile: 320 },
    { date: "2024-06-09", desktop: 438, mobile: 480 },
    { date: "2024-06-10", desktop: 155, mobile: 200 },
    { date: "2024-06-11", desktop: 92, mobile: 150 },
    { date: "2024-06-12", desktop: 492, mobile: 420 },
    { date: "2024-06-13", desktop: 81, mobile: 130 },
    { date: "2024-06-14", desktop: 426, mobile: 380 },
    { date: "2024-06-15", desktop: 307, mobile: 350 },
    { date: "2024-06-16", desktop: 371, mobile: 310 },
    { date: "2024-06-17", desktop: 475, mobile: 520 },
    { date: "2024-06-18", desktop: 107, mobile: 170 },
    { date: "2024-06-19", desktop: 341, mobile: 290 },
    { date: "2024-06-20", desktop: 408, mobile: 450 },
    { date: "2024-06-21", desktop: 169, mobile: 210 },
    { date: "2024-06-22", desktop: 317, mobile: 270 },
    { date: "2024-06-23", desktop: 480, mobile: 530 },
    { date: "2024-06-24", desktop: 132, mobile: 180 },
    { date: "2024-06-25", desktop: 141, mobile: 190 },
    { date: "2024-06-26", desktop: 434, mobile: 380 },
    { date: "2024-06-27", desktop: 448, mobile: 490 },
    { date: "2024-06-28", desktop: 149, mobile: 200 },
    { date: "2024-06-29", desktop: 103, mobile: 160 },
    { date: "2024-06-30", desktop: 446, mobile: 400 },
]
const chartConfig_line = {
    traffic: {
        label: "Traffic",
        color: "#9333ea",
    },
} satisfies ChartConfig

const descriptionBar = "A bar chart"
const chartData_bar = [
    { mood: "Happy", songs: 186 },
    { mood: "Sad", songs: 305 },
    { mood: "Fear", songs: 237 },
    { mood: "Anger", songs: 73 },
    { mood: "Disgust", songs: 209 },
    { mood: "Surprise", songs: 214 },
]


const chartConfig_bar = {
    Happy: {
        label: "Happy",
        color: "#fbbf24", // Yellow/Amber
    },
    Sad: {
        label: "Sad",
        color: "#3b82f6", // Blue
    },
    Fear: {
        label: "Fear",
        color: "#8b5cf6", // Purple
    },
    Anger: {
        label: "Anger",
        color: "#ef4444", // Red
    },
    Disgust: {
        label: "Disgust",
        color: "#10b981", // Green
    },
    Surprise: {
        label: "Surprise",
        color: "#f59e0b", // Orange
    },
} satisfies ChartConfig

export default function AdminDashboard() {
    const [timeRange, setTimeRange] = React.useState("30d")
    
    // Dynamic description based on time range
    const descriptionLine = `Showing total traffic for the last ${timeRange === "7d" ? "7" : "30"} days`

    // Combine desktop and mobile into traffic and filter by time range
    const processedData = React.useMemo(() => {
        const combinedData = chartData.map(item => ({
            date: item.date,
            traffic: item.desktop + item.mobile
        }))

        const referenceDate = new Date("2024-06-30")
        const daysToSubtract = timeRange === "7d" ? 7 : 30
        const startDate = new Date(referenceDate)
        startDate.setDate(startDate.getDate() - daysToSubtract)

        return combinedData.filter(item => {
            const date = new Date(item.date)
            return date >= startDate
        })
    }, [timeRange])

    return (
        <div className="w-full px-8 sm:px-12 lg:px-16">
            <div className="my-4">
                <AdminMenu />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 my-4 gap-6">
                <BigStatCard stat_icon={<ChartArea className="w-6 h-6" />} stat_name="Total Users" stat_value={232} stat_description="Increase of 12 user" />
                <BigStatCard stat_icon={<Music2 className="w-6 h-6" />} stat_name="Total Songs" stat_value={3675} stat_description="All moods" />
                <BigStatCard stat_icon={<SearchCheck className="w-6 h-6" />} stat_name="Have to Approve" stat_value={12} stat_description="Songs" />
                <BigStatCard stat_icon={<Activity className="w-6 h-6" />} stat_name="Total Traffic" stat_value={128} stat_description="Sessions" />
            </div>
            <Card className="pt-0">
                <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                    <div className="grid flex-1 gap-1">
                        <CardTitle>Area Chart - Interactive</CardTitle>
                        <CardDescription>{descriptionLine}</CardDescription>
                    </div>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger
                            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
                            aria-label="Select time range"
                        >
                            <SelectValue placeholder="Last 30 days" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="30d" className="rounded-lg">
                                Last 30 days
                            </SelectItem>
                            <SelectItem value="7d" className="rounded-lg">
                                Last 7 days
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent className="px-2 sm:p-6">
                    <ChartContainer
                        config={chartConfig_line}
                        className="aspect-auto h-[250px] w-full"
                    >
                        <LineChart
                            accessibilityLayer
                            data={processedData}
                            margin={{
                                left: 12,
                                right: 12,
                            }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={32}
                                tickFormatter={(value) => {
                                    const date = new Date(value)
                                    return date.toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                    })
                                }}
                            />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        className="w-[150px]"
                                        labelFormatter={(value) => {
                                            return new Date(value).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })
                                        }}
                                    />
                                }
                            />
                            <Line
                                dataKey="traffic"
                                type="monotone"
                                stroke="var(--color-traffic)"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <div className="my-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Bar Chart</CardTitle>
                        <CardDescription>{descriptionBar}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig_bar}>
                            <BarChart accessibilityLayer data={chartData_bar}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="mood"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                    tickFormatter={(value) => value.slice(0, 8)}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Bar dataKey="songs" radius={8}>
                                    {chartData_bar.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={`var(--color-${entry.mood})`} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}