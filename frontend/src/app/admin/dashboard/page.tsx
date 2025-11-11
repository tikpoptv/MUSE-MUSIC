"use client"
import * as React from "react";
import { useEffect } from "react";
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
import ServerStatus from '@/components/ServerStatus';
import { ChartArea, Music2, SearchCheck, Activity } from 'lucide-react';
import { dashboardService } from '@/services/dashboardService';
import { DashboardData } from '@/types/dashboard';

const chartConfig_line = {
    traffic: {
        label: "Traffic",
        color: "#9333ea",
    },
} satisfies ChartConfig

export default function AdminDashboard() {
    const [timeRange, setTimeRange] = React.useState("30d")
    const [dashboardData, setDashboardData] = React.useState<DashboardData | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)
    
    useEffect(() => {
        const scrollToTop = () => {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        };
        
        scrollToTop();
        
        requestAnimationFrame(() => {
            scrollToTop();
            setTimeout(() => {
                scrollToTop();
            }, 0);
        });
        
        const timeout1 = setTimeout(scrollToTop, 100);
        const timeout2 = setTimeout(scrollToTop, 300);
        
        return () => {
            clearTimeout(timeout1);
            clearTimeout(timeout2);
        };
    }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                const days = timeRange === "7d" ? 7 : 30;
                const [data] = await Promise.all([
                    dashboardService.getDashboardData(days),
                    new Promise(resolve => setTimeout(resolve, 1000))
                ]);
                
                if (data) {
                    setDashboardData(data);
                } else {
                    setDashboardData(null);
                }
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('Failed to fetch dashboard data:', error);
                setDashboardData(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [timeRange]);
    
    const descriptionLine = `Showing total traffic for the last ${timeRange === "7d" ? "7" : "30"} days`

    const processedData = React.useMemo(() => {
        if (!dashboardData?.trafficData) {
            return [];
        }
        return dashboardData.trafficData;
    }, [dashboardData])

    const chartDataBar = React.useMemo(() => {
        if (!dashboardData?.songsByMood || !Array.isArray(dashboardData.songsByMood)) {
            return [];
        }
        return dashboardData.songsByMood
            .filter(item => item && item.songs > 0)
            .map(item => {
                let mood = 'Unknown';
                if (typeof item.mood === 'string') {
                    mood = item.mood;
                } else if (typeof item.mood === 'object' && item.mood !== null && 'type' in item.mood) {
                    mood = (item.mood as { type: string; percentage: number }).type;
                }
                return {
                    mood: mood || 'Unknown',
                    songs: item.songs || 0
                };
            });
    }, [dashboardData])

    const chartConfigBar = React.useMemo(() => {
        const config: ChartConfig = {};
        const moodColors: Record<string, string> = {
            "happy": "#fbbf24",
            "sad": "#3b82f6",
            "fear": "#8b5cf6",
            "anger": "#ef4444",
            "disgust": "#10b981",
            "surprise": "#f59e0b"
        };
        
        chartDataBar.forEach(item => {
            const mood = item.mood;
            if (!mood || typeof mood !== 'string') {
                return;
            }
            const moodLower = mood.toLowerCase();
            const color = moodColors[moodLower] || "#6b7280";
            config[mood] = { label: mood, color: color };
        });
        return config;
    }, [chartDataBar])

    if (isLoading) {
        return (
            <AdminMenu>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 my-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader className="space-y-0 pb-2">
                                <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                                <div className="h-8 w-16 bg-gray-200 rounded"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-3 w-32 bg-gray-200 rounded"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <Card className="pt-0 animate-pulse">
                    <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                        <div className="grid flex-1 gap-1">
                            <div className="h-6 w-48 bg-gray-200 rounded"></div>
                            <div className="h-4 w-64 bg-gray-200 rounded"></div>
                        </div>
                        <div className="h-10 w-[160px] bg-gray-200 rounded-lg"></div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-center h-[250px]">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
                                <p className="text-gray-500 font-medium">Loading dashboard data...</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <div className="my-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="animate-pulse">
                        <CardHeader>
                            <div className="h-6 w-40 bg-gray-200 rounded"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center h-[250px]">
                                <div className="h-8 w-8 border-2 border-gray-200 border-t-violet-600 rounded-full animate-spin"></div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="animate-pulse">
                        <CardHeader>
                            <div className="h-6 w-32 bg-gray-200 rounded"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-gray-100 rounded-lg p-3 sm:p-4 h-20"></div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AdminMenu>
        );
    }

    return (
        <AdminMenu>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 my-4 gap-6">
                <BigStatCard 
                    stat_icon={<ChartArea className="w-6 h-6" />} 
                    stat_name="Total Users" 
                    stat_value={dashboardData?.stats.totalUsers || 0} 
                    stat_description="Total registered users" 
                />
                <BigStatCard 
                    stat_icon={<Music2 className="w-6 h-6" />} 
                    stat_name="Total Songs" 
                    stat_value={dashboardData?.stats.totalSongs || 0} 
                    stat_description="All moods" 
                />
                <BigStatCard 
                    stat_icon={<SearchCheck className="w-6 h-6" />} 
                    stat_name="Have to Approve" 
                    stat_value={dashboardData?.stats.pendingApproval || 0} 
                    stat_description="Processing" 
                />
                <BigStatCard 
                    stat_icon={<Activity className="w-6 h-6" />} 
                    stat_name="Total Traffic" 
                    stat_value={dashboardData?.stats.totalSessions || 0} 
                    stat_description="Sessions" 
                />
            </div>
            <Card className="pt-0">
                <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                    <div className="grid flex-1 gap-1">
                        <CardTitle>User Traffic (Session & Users)</CardTitle>
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
                <CardContent className="p-6">
                    {processedData.length === 0 ? (
                        <div className="flex items-center justify-center h-[250px]">
                            <p className="text-gray-500">No traffic data available</p>
                        </div>
                    ) : (
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
                                        if (!value) return '';
                                        const date = new Date(value);
                                        if (isNaN(date.getTime())) return '';
                                    return date.toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        });
                                }}
                            />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        className="w-[150px]"
                                        labelFormatter={(value) => {
                                                if (!value) return '';
                                                const date = new Date(value);
                                                if (isNaN(date.getTime())) return '';
                                                return date.toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                                });
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
                    )}
                </CardContent>
            </Card>
            <div className="my-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Total song per Mood</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {chartDataBar.length === 0 ? (
                            <div className="flex items-center justify-center h-[250px]">
                                <p className="text-gray-500">No data available</p>
                            </div>
                        ) : (
                            <ChartContainer config={chartConfigBar}>
                                <BarChart accessibilityLayer data={chartDataBar}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="mood"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                        tickFormatter={(value) => value ? value.slice(0, 8) : ''}
                                />
                                <ChartTooltip
                                    cursor={false}
                                        content={<ChartTooltipContent />}
                                />
                                <Bar dataKey="songs" radius={8}>
                                        {chartDataBar.map((entry, index) => {
                                            const moodKey = entry.mood;
                                            const color = chartConfigBar[moodKey]?.color || "#6b7280";
                                            return (
                                                <Cell key={`cell-${index}`} fill={color} />
                                            );
                                        })}
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                        )}
                    </CardContent>
                </Card>
                <ServerStatus />
            </div>
        </AdminMenu>
    );

}