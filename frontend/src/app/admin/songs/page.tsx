"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AdminMenu from "@/components/AdminMenu";
import SongDetailsCard from "@/components/SongDetailsCard";
import CoverImageUpload from "@/components/CoverImageUpload";
import EditableLyricsPairs from "@/components/EditableLyricsPairs";
import SummarySection from "@/components/SummarySection";
import MoodAnalyzeSection from "@/components/MoodAnalyzeSection";
import ApproveRejectModal from "@/components/modals/ApproveRejectModal";
import { SquareDashedMousePointer, Music, CheckCircle2, XCircle, User, Search, ChevronLeft, ChevronRight, Loader2, ExternalLink, Eye, RefreshCw } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import toast from "react-hot-toast";
import { songService, type SongDetail, type ProcessingDetail } from '@/services/songService';
import { adminSongsService, type StatusFilter } from '@/services/adminSongsService';

interface Song {
    id: number;
    code: string;
    engName: string;
    songName: string;
    language: string;
    targetLanguage?: string;
    status: string;
    checked: boolean;
    highlight?: boolean;
    songID?: string;
    processingID?: string;
    artistName?: string;
    country?: string;
    lyrics?: string;
    coverImage?: string;
    createdBy?: string;
    createdByUsername?: string;
    createdByAvatar?: string;
}


export default function Page() {
    const router = useRouter();
    const [songs, setSongs] = useState<Song[]>([]);
    const [selectedSongs, setSelectedSongs] = useState<Set<number>>(new Set());
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("not_approve");
    const [shareStatusFilter, setShareStatusFilter] = useState<'all' | 'private' | 'public'>('public');
    const [isLoading, setIsLoading] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [selectedSong, setSelectedSong] = useState<Song | null>(null);
    const [songDetail, setSongDetail] = useState<SongDetail | null>(null);
    const [processingDetail, setProcessingDetail] = useState<ProcessingDetail | null>(null);
    const [originalLyricsBaseline, setOriginalLyricsBaseline] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalSongs, setTotalSongs] = useState(0);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [pendingActionSong, setPendingActionSong] = useState<Song | null>(null);
    const pageSize = 10;
    const detailPanelRef = useRef<HTMLDivElement>(null);

    const fetchSongs = async () => {
        setIsLoading(true);
        try {
            let finalStatusFilter: StatusFilter = 'all';
            
            if (statusFilter === 'rejected') {
                finalStatusFilter = 'rejected' as StatusFilter;
            } else if (shareStatusFilter !== 'all') {
                if (shareStatusFilter === 'private') {
                    finalStatusFilter = 'private' as StatusFilter;
                } else if (shareStatusFilter === 'public') {
                    if (statusFilter === 'not_approve') {
                        finalStatusFilter = 'public_pending' as StatusFilter;
                    } else if (statusFilter === 'done') {
                        finalStatusFilter = 'public_approved' as StatusFilter;
                    } else {
                        finalStatusFilter = 'public_approved' as StatusFilter;
                    }
                }
            } else {
                finalStatusFilter = statusFilter;
            }
            
            const [result] = await Promise.all([
                adminSongsService.getSongs(
                    currentPage,
                    pageSize,
                    searchQuery,
                    finalStatusFilter
                ),
                new Promise(resolve => setTimeout(resolve, 1000))
            ]);

            if (result) {
                const mappedSongs: Song[] = result.songs.map((song, index) => ({
                    id: (currentPage - 1) * pageSize + index + 1,
                    code: song.code,
                    engName: song.songNameEnglish,
                    songName: song.songName,
                    language: song.language,
                    targetLanguage: song.targetLanguage,
                    status: song.status,
                    checked: false,
                    highlight: song.highlight,
                    songID: song.songID,
                    processingID: song.processingID,
                    artistName: song.artistName,
                    country: song.language,
                    coverImage: song.coverImage || undefined,
                    createdBy: song.createdBy,
                    createdByUsername: song.createdByUsername,
                    createdByAvatar: song.createdByAvatar || undefined,
                }));

                setSongs(mappedSongs);
                setTotalPages(result.pagination.totalPages);
                setTotalSongs(result.pagination.total);
            }
        } catch {
            toast.error("Failed to fetch songs");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPendingCount = async () => {
        try {
            const count = await adminSongsService.getPendingCount();
            setPendingCount(count);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error("Failed to fetch pending count:", error);
        }
    };

    useEffect(() => {
        fetchSongs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, statusFilter, shareStatusFilter]);

    useEffect(() => {
        fetchPendingCount();
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (currentPage === 1) {
                fetchSongs();
            } else {
                setCurrentPage(1);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = filteredSongs.map(song => song.id);
            setSelectedSongs(new Set(allIds));
        } else {
            setSelectedSongs(new Set());
        }
    };

    const handleSelectSong = (songId: number, checked: boolean) => {
        const newSelected = new Set(selectedSongs);
        if (checked) {
            newSelected.add(songId);
        } else {
            newSelected.delete(songId);
        }
        setSelectedSongs(newSelected);
    };

    const handleViewDetail = (song: Song, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }
        if (song.songID) {
            router.push(`/song/${song.songID}${song.processingID ? `?processingID=${song.processingID}` : ''}`);
        } else {
            toast.error("Song ID not available");
        }
    };

    const handleRowClick = async (song: Song) => {
        if (!song.songID) {
            toast.error("Song ID not available");
            return;
        }

        // Clear previous detail data first to show loading state
        setSongDetail(null);
        setProcessingDetail(null);
        setOriginalLyricsBaseline(null);
        setSelectedSong(song);

        // Scroll to detail panel immediately when loading starts
        setTimeout(() => {
            detailPanelRef.current?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 50);

        try {
            setIsLoading(true);
            
            // Fetch full song detail using existing songService (reuse from detail page)
            const songDetailResponse = await songService.getSongDetail(song.songID, song.processingID);
            
            if (songDetailResponse.song) {
                const fetchedSong = songDetailResponse.song;
                const fetchedProcessing = songDetailResponse.processing;
                
                // Map country name to code if needed
                let countryCode = fetchedSong.country || "";
                if (countryCode && !['us', 'th', 'jp', 'kr'].includes(countryCode)) {
                    const countryCodeToName: Record<string, string> = {
                        'us': 'United States',
                        'th': 'Thailand',
                        'jp': 'Japan',
                        'kr': 'South Korea'
                    };
                    const foundCode = Object.entries(countryCodeToName).find(([_, name]) => 
                        name.toLowerCase() === countryCode.toLowerCase() || 
                        name === countryCode
                    )?.[0];
                    countryCode = foundCode || "";
                }
                
                // Auto-set country based on language if country is not set
                if (!countryCode && fetchedSong.language) {
                    const languageToCountry: Record<string, string> = {
                        'Thai': 'th',
                        'English': 'us',
                        'Japanese': 'jp',
                        'Korean': 'kr'
                    };
                    countryCode = languageToCountry[fetchedSong.language] || "";
                }
                
                // Use fetched data directly (reuse from detail page)
                const detail: SongDetail = {
                    songID: fetchedSong.songID,
                    songName: fetchedSong.songName,
                    songNameEnglish: fetchedSong.songNameEnglish || song.engName || "",
                    artistName: fetchedSong.artistName,
                    genre: fetchedSong.genre || "",
                    lyrics: fetchedSong.lyrics || "",
                    syncedLyrics: fetchedSong.syncedLyrics,
                    duration: fetchedSong.duration || 0,
                    country: countryCode,
                    language: fetchedSong.language || song.language || "",
                    createdAt: fetchedSong.createdAt,
                    updatedAt: fetchedSong.updatedAt
                };
                // Keep baseline from API for strict validation
                setOriginalLyricsBaseline(fetchedSong.lyrics || "");
                
                const processing: ProcessingDetail = fetchedProcessing || {
                    processingID: song.processingID || "",
                    songID: song.songID,
                    aiModel: "",
                    status: 'completed',
                    originalLanguage: fetchedSong.language || song.language || "",
                    targetLanguage: "",
                    isCompleteProcessing: true,
                    createdAt: "",
                    updatedAt: ""
                };
                
                setSongDetail(detail);
                setProcessingDetail(processing);
                setSelectedSong({
                    ...song,
                    lyrics: fetchedSong.lyrics || ""
                });
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error("Failed to fetch song detail:", error);
            toast.error("Failed to load song details");
        } finally {
            setIsLoading(false);
        }
    };


    const handleSongNameEnglishChange = (value: string) => {
        if (songDetail) {
            setSongDetail(prev => prev ? { ...prev, songNameEnglish: value } : null);
        }
    };

    const handleCountryChange = (value: string) => {
        if (songDetail) {
            setSongDetail(prev => prev ? { ...prev, country: value } : null);
        }
    };

    const handleSaveLyrics = async (lyricsToSave?: string) => {
        const lyrics = lyricsToSave || songDetail?.lyrics;
        if (!selectedSong?.processingID || !lyrics) {
            toast.error("Missing required information to save lyrics");
            return;
        }

        try {
            setIsLoading(true);
            const result = await adminSongsService.updateLyrics(
                selectedSong.processingID,
                lyrics
            );

            if (result) {
                toast.success("Lyrics saved successfully");
                // Update processing detail with new translation
                if (processingDetail) {
                    setProcessingDetail(prev => prev ? {
                        ...prev,
                        translation: result.translation,
                        updatedAt: result.updatedAt
                    } : null);
                }
            } else {
                toast.error("Failed to save lyrics");
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error("Failed to save lyrics:", error);
            toast.error("Failed to save lyrics");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCoverImageChange = async (imageUrl: string | null) => {
        if (!selectedSong) return;
        if (!selectedSong.processingID) {
            toast.error("Processing ID not available");
            return;
        }
        
        try {
            setIsLoading(true);
            await songService.updateCoverImage(selectedSong.processingID, imageUrl || '');
            
            // Update local state
            setSongs(prev => prev.map(s => 
                s.id === selectedSong.id
                    ? { ...s, coverImage: imageUrl || undefined }
                    : s
            ));
            
            if (songDetail) {
                // Update songDetail if needed for display
                setSelectedSong(prev => prev ? { ...prev, coverImage: imageUrl || undefined } : null);
            }

            // Also reflect into processing detail if present
            setProcessingDetail(prev => prev ? { ...prev, coverImage: imageUrl || null } : prev);

            toast.success("Cover image updated");
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Failed to update cover image:', err);
            toast.error("Failed to update cover image");
        } finally {
            setIsLoading(false);
        }
    };

    const handleApproveClick = (song: Song) => {
        setPendingActionSong(song);
        setIsApproveModalOpen(true);
    };

    const handleRejectClick = (song: Song) => {
        setPendingActionSong(song);
        setIsRejectModalOpen(true);
    };

    const handleApprove = async () => {
        if (!pendingActionSong || !pendingActionSong.processingID) {
            toast.error("Processing ID not available");
            setIsApproveModalOpen(false);
            setPendingActionSong(null);
            return;
        }

        try {
            setIsLoading(true);
            const result = await adminSongsService.approveSong(pendingActionSong.processingID);
            
            if (result) {
                toast.success(`Song "${pendingActionSong.songName || pendingActionSong.engName}" approved successfully`);
                await fetchSongs();
                await fetchPendingCount();
                setIsApproveModalOpen(false);
                setPendingActionSong(null);
                
                setSelectedSong(null);
                setSongDetail(null);
                setProcessingDetail(null);
                setOriginalLyricsBaseline(null);
            } else {
                toast.error("Failed to approve song");
            }
            
            setSelectedSongs(prev => {
                const newSet = new Set(prev);
                newSet.delete(pendingActionSong.id);
                return newSet;
            });
        } catch {
            toast.error("Failed to approve song");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = async () => {
        if (!pendingActionSong || !pendingActionSong.processingID) {
            toast.error("Processing ID not available");
            setIsRejectModalOpen(false);
            setPendingActionSong(null);
            return;
        }

        try {
            setIsLoading(true);
            const result = await adminSongsService.rejectSong(pendingActionSong.processingID);
            
            if (result) {
                toast.success(`Song "${pendingActionSong.songName || pendingActionSong.engName}" rejected`);
                await fetchSongs();
                await fetchPendingCount();
                setIsRejectModalOpen(false);
                setPendingActionSong(null);
                
                setSelectedSong(null);
                setSongDetail(null);
                setProcessingDetail(null);
                setOriginalLyricsBaseline(null);
            } else {
                toast.error("Failed to reject song");
            }
            
            setSelectedSongs(prev => {
                const newSet = new Set(prev);
                newSet.delete(pendingActionSong.id);
                return newSet;
            });
        } catch {
            toast.error("Failed to reject song");
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Rejected':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'Not Approve':
            case 'Pending':
                return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'Done':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'Approved (Private)':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'Approved':
                return 'text-emerald-600 bg-emerald-50 border-emerald-200';
            default:
                return 'text-slate-600 bg-slate-50 border-slate-200';
        }
    };

    const filteredSongs = songs;

    const isAllSelected = filteredSongs.length > 0 && filteredSongs.every(song => selectedSongs.has(song.id));
    const isIndeterminate = selectedSongs.size > 0 && selectedSongs.size < filteredSongs.length;

    if (isLoading && songs.length === 0) {
        return (
            <AdminMenu>
                <div className="w-full space-y-4 sm:space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                    </div>

                    <Card className="animate-pulse">
                        <CardHeader className="space-y-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                    <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
                                    <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
                                    <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
                                    <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
                                    <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
                                    <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
                                </div>
                            </div>
                            <div className="relative flex-1 max-w-md">
                                <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-hidden rounded-lg border border-slate-200">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full border-collapse text-left">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="w-12 px-4 sm:px-6 py-3 sm:py-4">
                                                    <div className="h-4 w-4 bg-gray-200 rounded"></div>
                                                </th>
                                                <th className="px-4 sm:px-6 py-3 sm:py-4">
                                                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                                </th>
                                                <th className="px-4 sm:px-6 py-3 sm:py-4">
                                                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                                                </th>
                                                <th className="px-4 sm:px-6 py-3 sm:py-4">
                                                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                                                <tr key={i} className="border-b border-slate-100">
                                                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                                                        <div className="h-4 w-4 bg-gray-200 rounded"></div>
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                                                        <div className="flex items-center gap-2 sm:gap-3">
                                                            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-200 rounded-full"></div>
                                                            <div className="h-4 w-48 bg-gray-200 rounded"></div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                                            <div className="h-4 w-28 bg-gray-200 rounded"></div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                                                            <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </CardContent>
                        <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between px-4 sm:px-6">
                            <div className="h-4 w-48 bg-gray-200 rounded"></div>
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-20 bg-gray-200 rounded-lg"></div>
                                <div className="h-8 w-20 bg-gray-200 rounded-lg"></div>
                            </div>
                        </div>
                    </Card>
                </div>
            </AdminMenu>
        );
    }

    return (
        <AdminMenu>
            <div className="w-full space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3">
                    <Music className="w-9 h-9 flex-shrink-0" style={{ color: "#7B61FF" }} />
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
                            Song Approved
                    </p>
                </div>
                
                <Card className="rounded-lg border border-slate-200 bg-gradient-to-r from-[#f1e8ff] via-[#f7f2ff] to-white p-0 shadow-md">
                    <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
                        <div className="flex items-start justify-between gap-4 sm:gap-6">
                            <div className="flex flex-col gap-1 sm:gap-2">
                                <CardDescription className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-violet-500">
                                    Pending Approval
                                </CardDescription>
                                <CardTitle className="text-3xl sm:text-4xl md:text-5xl font-semibold text-slate-900">
                                    {pendingCount}
                                </CardTitle>
                                <p className="text-xs sm:text-sm font-medium text-slate-500">processing records</p>
                    </div>
                            <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 flex items-center justify-center rounded-md bg-white shadow-inner flex-shrink-0">
                                <Music className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-violet-500" />
                    </div>
                </div>
                    </CardHeader>
                </Card>
                <Card className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-sm">
                    <CardHeader className="p-0 pb-4 sm:pb-6">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-900">
                            Songs
                                </CardTitle>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 flex-wrap">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <span className="text-sm sm:text-base font-medium text-slate-700">
                                            Status:
                                        </span>
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <button
                                                onClick={() => {
                                                    setStatusFilter(statusFilter === "not_approve" ? "all" : "not_approve");
                                                    setCurrentPage(1);
                                                }}
                                                className={`inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
                                                    statusFilter === "not_approve"
                                                        ? "text-white bg-orange-500"
                                                        : "text-orange-600 bg-orange-100 hover:bg-orange-200"
                                                }`}
                                            >
                                                Not Approve
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setStatusFilter(statusFilter === "done" ? "all" : "done");
                                                    setCurrentPage(1);
                                                }}
                                                className={`inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
                                                    statusFilter === "done"
                                                        ? "text-green-800 bg-green-300"
                                                        : "text-green-800 bg-green-200 hover:bg-green-300"
                                                }`}
                                            >
                                                Done
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setStatusFilter(statusFilter === "rejected" ? "all" : "rejected");
                                                    setCurrentPage(1);
                                                }}
                                                className={`inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
                                                    statusFilter === "rejected"
                                                        ? "text-white bg-red-600"
                                                        : "text-red-600 bg-red-100 hover:bg-red-200"
                                                }`}
                                            >
                                                Rejected
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <span className="text-sm sm:text-base font-medium text-slate-700">
                                            Share:
                                        </span>
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <button
                                                onClick={() => {
                                                    setShareStatusFilter("all");
                                                    setCurrentPage(1);
                                                }}
                                                className={`inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
                                                    shareStatusFilter === "all"
                                                        ? "text-white bg-slate-600"
                                                        : "text-slate-600 bg-slate-100 hover:bg-slate-200"
                                                }`}
                                            >
                                                All
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShareStatusFilter(shareStatusFilter === "private" ? "all" : "private");
                                                    setCurrentPage(1);
                                                }}
                                                className={`inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
                                                    shareStatusFilter === "private"
                                                        ? "text-white bg-blue-600"
                                                        : "text-blue-600 bg-blue-100 hover:bg-blue-200"
                                                }`}
                                            >
                                                Private
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShareStatusFilter(shareStatusFilter === "public" ? "all" : "public");
                                                    setCurrentPage(1);
                                                }}
                                                className={`inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
                                                    shareStatusFilter === "public"
                                                        ? "text-white bg-purple-600"
                                                        : "text-purple-600 bg-purple-100 hover:bg-purple-200"
                                                }`}
                                            >
                                                Public
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search by song name, artist, or language..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-hidden rounded-lg border border-slate-200">
                            <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse text-left">
                                    <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
                            <tr>
                                            <th className="w-12 px-4 sm:px-6 py-3 sm:py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={isAllSelected}
                                                    ref={(input) => {
                                                        if (input) input.indeterminate = isIndeterminate;
                                                    }}
                                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                                    className="h-4 w-4 rounded border-slate-300 cursor-pointer"
                                                />
                                </th>
                                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-sm font-semibold text-slate-900">
                                                Song Name <span className="text-slate-400">↕</span>
                                </th>
                                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-sm font-semibold text-slate-900">Languages</th>
                                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-sm font-semibold text-slate-900">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                                        {filteredSongs.map((song) => (
                                <tr
                                    key={song.id}
                                                onClick={() => handleRowClick(song)}
                                                className={`border-b border-slate-100 cursor-pointer ${
                                                    selectedSong?.id === song.id ? "bg-violet-50" : song.highlight ? "bg-slate-50" : "bg-white"
                                                } hover:bg-slate-50 transition-colors`}
                                >
                                                <td className="px-4 sm:px-6 py-3 sm:py-4" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                        checked={selectedSongs.has(song.id)}
                                                        onChange={(e) => handleSelectSong(song.id, e.target.checked)}
                                                        className="h-4 w-4 rounded border-slate-300 focus:ring-0 cursor-pointer"
                                                        style={{ accentColor: song.highlight ? "#7B61FF" : "#7B61FF" }}
                                            />
                                    </td>
                                                <td className={`px-4 sm:px-6 py-3 sm:py-4 max-w-[200px] sm:max-w-[300px] ${
                                                    song.highlight ? "text-blue-600 underline" : "text-slate-600"
                                                }`}>
                                                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                                        <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-slate-100 text-xs sm:text-sm font-semibold text-slate-700 flex-shrink-0">
                                                            {song.code}
                                                        </div>
                                                        <div className={`text-xs sm:text-sm truncate min-w-0 ${
                                                            song.highlight ? "font-semibold" : ""
                                                        }`} title={song.songName}>
                                                            {song.songName}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm max-w-[180px]">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="truncate" title={song.language}>
                                                            <span className="font-semibold text-[#7B61FF]">Original:</span> <span className="text-slate-900">{song.language}</span>
                                                        </div>
                                                        {song.targetLanguage && (
                                                            <div className="truncate" title={song.targetLanguage}>
                                                                <span className="font-semibold text-emerald-600">Target:</span> <span className="text-slate-700">{song.targetLanguage}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 sm:px-6 py-3 sm:py-4">
                                                    <div className="flex flex-col sm:flex-row w-full items-start sm:items-center justify-between gap-2 sm:gap-4">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs sm:text-sm font-semibold border ${getStatusColor(song.highlight ? "Not Approve" : song.status)}`}>
                                                            {song.highlight ? "Not Approve" : song.status}
                                                        </span>
                                                        <div className="flex items-center gap-2 sm:gap-4">
                                                            <button
                                                                onClick={(e) => handleViewDetail(song, e)}
                                                                className="rounded-lg border border-dashed border-slate-300 p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 transition-colors"
                                                                aria-label="Open song detail"
                                                                title="View Detail"
                                                            >
                                                                <SquareDashedMousePointer size={14} strokeWidth={1.5} />
                                                            </button>
                                                        </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>
                    </CardContent>
                    {totalPages > 1 && (
                        <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                            <div className="text-sm text-slate-600">
                                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalSongs)} of {totalSongs} processing records
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1 || isLoading}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                    Previous
                                </button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum: number;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                disabled={isLoading}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                                    currentPage === pageNum
                                                        ? "text-white bg-violet-600"
                                                        : "text-slate-700 bg-white border border-slate-300 hover:bg-slate-50"
                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages || isLoading}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </Card>

                {selectedSong && (
                    <div ref={detailPanelRef}>
                        <Card className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-sm">
                        {isLoading && !songDetail ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="h-10 w-10 text-[#7B61FF] animate-spin mb-4" />
                                <p className="text-base text-gray-600 font-medium">Loading song details...</p>
                                <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the information</p>
                            </div>
                        ) : (
                            <>
                        <CardHeader className="p-0 pb-4 sm:pb-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-slate-600">Send by</span>
                                    <div className="flex items-center gap-2">
                                        {selectedSong.createdByAvatar ? (
                                            <Image 
                                                src={selectedSong.createdByAvatar} 
                                                alt={selectedSong.createdByUsername || "User"}
                                                width={32}
                                                height={32}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                                                <User size={16} className="text-slate-500" />
                                            </div>
                                        )}
                                        <span className="text-sm font-medium text-slate-900">
                                            {selectedSong.createdByUsername || "Unknown"}
                                        </span>
                                    </div>
                                </div>
                                {selectedSong.processingID && (
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-slate-600">Processing ID:</span>
                                            <span className="text-sm font-mono font-medium text-slate-900 bg-slate-100 px-2 py-1 rounded">
                                                {selectedSong.processingID}
                                            </span>
                                        </div>
                                        {selectedSong?.songID && selectedSong?.processingID && (
                                            <a
                                                href={`/song/${selectedSong.songID}/analysis/${selectedSong.processingID}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs text-white bg-[#7B61FF] rounded-md hover:bg-[#6B51EF] transition-colors"
                                            >
                                                <Eye className="w-3 h-3" />
                                                Preview
                                            </a>
                                        )}
                                        <button
                                            onClick={() => selectedSong && handleRowClick(selectedSong)}
                                            disabled={isLoading || !selectedSong}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            title="Refetch song details"
                                        >
                                            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                                            Refetch
                                        </button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 space-y-6">
                            <div className="flex flex-col sm:flex-row gap-6">
                                <div className="flex-shrink-0 pl-3 sm:pl-6">
                                    <CoverImageUpload
                                        width={280}
                                        height={280}
                                        initialImage={selectedSong.coverImage || null}
                                        onImageChange={handleCoverImageChange}
                                        readonly={false}
                                    />
                                </div>

                                <div className="flex-1">
                                    <SongDetailsCard
                                        songData={songDetail}
                                        processingData={processingDetail}
                                        onSongNameEnglishChange={handleSongNameEnglishChange}
                                        onCountryChange={handleCountryChange}
                                    />
                                    
                                    {/* YouTube Sync */}
                                    {processingDetail?.youtubeVideoId && (
                                        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-1.5 sm:gap-3">
                                            <label className="whitespace-nowrap text-gray-900 text-xs sm:text-sm font-medium leading-tight sm:leading-4">
                                                YouTube Sync:
                                            </label>
                                            <a
                                                href={`https://www.youtube.com/watch?v=${processingDetail.youtubeVideoId}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs sm:text-sm text-[#7B61FF] hover:text-[#6B51EF] hover:underline flex items-center gap-1.5 font-medium"
                                            >
                                                {processingDetail.youtubeVideoId}
                                                <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="w-full mt-6">
                                <SummarySection processingData={processingDetail} />
                            </div>

                            <div className="flex flex-col gap-1.5 sm:gap-3 w-full">
                                <label className="whitespace-nowrap text-gray-900 text-xs sm:text-sm font-medium leading-tight sm:leading-4">
                                    Lyrics
                                </label>
                                <div className="w-full">
                                    <EditableLyricsPairs
                                        lyrics={songDetail?.lyrics || ""}
                                        translation={processingDetail?.translation}
                                        onChange={(newLyrics) => {
                                            setSongDetail(prev => prev ? { ...prev, lyrics: newLyrics } : null);
                                        }}
                                        onSave={(lyrics) => handleSaveLyrics(lyrics)}
                                        baselineOriginalLyrics={originalLyricsBaseline || undefined}
                                    />
                                </div>
                            </div>

                            <div className="w-full mt-6">
                                <MoodAnalyzeSection processingData={processingDetail} />
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => selectedSong && handleRejectClick(selectedSong)}
                                    disabled={isLoading || !selectedSong}
                                    className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Reject
                                </button>
                                <button
                                    onClick={() => selectedSong && handleApproveClick(selectedSong)}
                                    disabled={isLoading || !selectedSong}
                                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Approve
                                </button>
                            </div>
                        </CardContent>
                            </>
                        )}
                    </Card>
                    </div>
                )}
            </div>

            <ApproveRejectModal
                isOpen={isApproveModalOpen}
                onClose={() => {
                    setIsApproveModalOpen(false);
                    setPendingActionSong(null);
                }}
                onConfirm={handleApprove}
                type="approve"
                songName={pendingActionSong?.songName || pendingActionSong?.engName || ''}
                isProcessing={isLoading}
            />

            <ApproveRejectModal
                isOpen={isRejectModalOpen}
                onClose={() => {
                    setIsRejectModalOpen(false);
                    setPendingActionSong(null);
                }}
                onConfirm={handleReject}
                type="reject"
                songName={pendingActionSong?.songName || pendingActionSong?.engName || ''}
                isProcessing={isLoading}
            />
        </AdminMenu>
    );
}
