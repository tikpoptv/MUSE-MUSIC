'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Heart, Share2, MoreVertical, Link2, ExternalLink, Flag, ShieldCheck, ShieldOff } from 'lucide-react';
import MusicCard from '@/components/MusicCard';
import SkeletonCard from '@/components/SkeletonCard';
import LyricsTranslationViewer from '@/components/LyricsTranslationViewer';
import SongDetailsCard from '@/components/SongDetailsCard';
import SummarySection from '@/components/SummarySection';
import MoodAnalyzeSection from '@/components/MoodAnalyzeSection';
import SongActionButtons from '@/components/SongActionButtons';
import FeedbackSection, { type FeedbackSectionRef } from '@/components/FeedbackSection';
import CoverImageUpload from '@/components/CoverImageUpload';
import SyncedLyricsPlayer, { type SyncedLyricsLine } from '@/components/SyncedLyricsPlayer';
import ProcessingVersionBar from '@/components/ProcessingVersionBar';
import { songService, type SongDetail, type ProcessingDetail, type ProcessingVersion } from '@/services/songService';
import { analysisService } from '@/services/analysisService';
import { recommendSongsService, type RecommendedSong } from '@/services/recommendSongsService';
import { adminSongsService } from '@/services/adminSongsService';
import shareService from '@/services/shareService';
import { authService } from '@/services/authService';
import { historyService } from '@/services/historyService';
import { favoriteService } from '@/services/favoriteService';
import ReAnalyzeConfirmModal from '@/components/modals/ReAnalyzeConfirmModal';
import NavigateAwayConfirmModal from '@/components/modals/NavigateAwayConfirmModal';
import SocialShareModal from '@/components/SocialShareModal';
import ApproveRejectModal from '@/components/modals/ApproveRejectModal';
import toast from 'react-hot-toast';
import { languageNameToCode, languageCodeToName, DEFAULT_TARGET_LANGUAGE, getLanguageNames, getLanguageCodeByName, getLanguageNameByCode } from '@/utils/languageUtils';

export default function SongDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const songID = params.songID as string;
  
  // Check if this is the analysis route (editable) or detail route (read-only)
  const isAnalysisRoute = pathname?.includes('/analysis/');
  const processingID = isAnalysisRoute 
    ? (params.processingID as string)
    : (searchParams.get('processingID') || '');
  const isDetailRoute = !isAnalysisRoute;

  const [songData, setSongData] = useState<SongDetail | null>(null);
  const [processingData, setProcessingData] = useState<ProcessingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSubmittedRating, setHasSubmittedRating] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const feedbackSectionRef = useRef<FeedbackSectionRef>(null);
  
  const handleRatingSubmitted = useCallback(() => {
    setHasSubmittedRating(true);
  }, []);

  const handleIsPlayingChange = useCallback((playing: boolean) => {
    setIsPlaying(playing);
  }, []);
  
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isSavingCoverImage, setIsSavingCoverImage] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [syncedLyricsLines, setSyncedLyricsLines] = useState<SyncedLyricsLine[]>([]);
  const [durationMatch, setDurationMatch] = useState<boolean | null>(null);
  const [seekToTime, setSeekToTime] = useState<number | undefined>(undefined);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const playerPlayPauseRef = useRef<(() => void) | null>(null);
  const playerVolumeRef = useRef<{
    setVolume: (volume: number) => void;
    getVolume: () => number;
    mute: () => void;
    unmute: () => void;
    isMuted: () => boolean;
  } | null>(null);
  const [isReAnalyzeModalOpen, setIsReAnalyzeModalOpen] = useState(false);
  const [isReAnalyzing, setIsReAnalyzing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(DEFAULT_TARGET_LANGUAGE);
  const [isNavigateAwayModalOpen, setIsNavigateAwayModalOpen] = useState(false);
  const [pendingLanguageChange, setPendingLanguageChange] = useState<string | null>(null);
  const [pendingProcessingID, setPendingProcessingID] = useState<string | null>(null);
  const [newAnalysisShareRequest, setNewAnalysisShareRequest] = useState<boolean>(true);
  const [recommendedByLanguage, setRecommendedByLanguage] = useState<RecommendedSong[]>([]);
  const [recommendedByMood, setRecommendedByMood] = useState<RecommendedSong[]>([]);
  const [loadingRecommendationsByLanguage, setLoadingRecommendationsByLanguage] = useState(false);
  const [loadingRecommendationsByMood, setLoadingRecommendationsByMood] = useState(false);
  const [isCreatingShareLink, setIsCreatingShareLink] = useState(false);
  const [isSocialShareModalOpen, setIsSocialShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCheckingFavorite, setIsCheckingFavorite] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [processingVersions, setProcessingVersions] = useState<ProcessingVersion[]>([]);
  const [currentVersionNumber, setCurrentVersionNumber] = useState<number>(1);
  const [moreMenuTarget, setMoreMenuTarget] = useState<'desktop' | 'mobile' | null>(null);
  const [adminModalType, setAdminModalType] = useState<'approve' | 'reject' | null>(null);
  const [isAdminActionProcessing, setIsAdminActionProcessing] = useState(false);
  const desktopMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const feedbackSectionAnchorId = 'feedback-section-anchor';

  const effectiveProcessingID = useMemo(() => {
    if (processingID && processingID !== 'undefined' && processingID !== '') {
      return processingID;
    }
    return processingData?.processingID || '';
  }, [processingID, processingData?.processingID]);

  const toggleMoreMenu = (target: 'desktop' | 'mobile') => {
    setMoreMenuTarget((prev) => (prev === target ? null : target));
  };

  const closeMoreMenu = () => setMoreMenuTarget(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!moreMenuTarget) return;

      const target = event.target as Node;
      if (
        (desktopMenuRef.current && desktopMenuRef.current.contains(target)) ||
        (mobileMenuRef.current && mobileMenuRef.current.contains(target))
      ) {
        return;
      }

      setMoreMenuTarget(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [moreMenuTarget]);

  const checkFavoriteStatus = useCallback(async () => {
    if (!songID || songID === 'undefined' || !authService.isAuthenticated()) {
      return;
    }

    if (!effectiveProcessingID || effectiveProcessingID === 'undefined') {
      return;
    }

    try {
      setIsCheckingFavorite(true);
      const favorite = await favoriteService.checkFavorite(effectiveProcessingID);
      setIsFavorite(favorite);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to check favorite status:', error);
    } finally {
      setIsCheckingFavorite(false);
    }
  }, [songID, effectiveProcessingID]);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (authService.isAuthenticated()) {
        try {
          const adminStatus = await authService.checkAdminStatus();
          setIsAdmin(adminStatus);
        } catch {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, []);

  const fetchSongData = useCallback(async () => {
      if (!songID || songID === 'undefined') {
        toast.error('Invalid song ID');
        router.push('/');
        return;
      }

      if (!processingID || processingID === 'undefined') {
        toast.error('Invalid processing ID');
        router.push('/');
        return;
      }

      try {
        setLoading(true);
        
        // Check admin status fresh to avoid race condition
        let currentIsAdmin = isAdmin;
        if (authService.isAuthenticated()) {
          try {
            currentIsAdmin = await authService.checkAdminStatus();
          } catch {
            currentIsAdmin = false;
          }
        }
        
        const data = await songService.getSongDetail(songID, processingID);
        
        setSongData(data.song);
        if (data.processing) {
          const processing = data.processing;
          
          if (isAnalysisRoute) {
            const isApproved = processing.approvalStatus === 'approved' && processing.shareStatus === 'public_approved';
            
            // If approved, only admin can access (everyone else including owner cannot edit after approval)
            if (isApproved && !currentIsAdmin) {
              toast.error('This processing has been reviewed and approved. Only admin can access analysis mode.');
              window.location.href = `/song/${songID}?processingID=${processingID}`;
              return;
            }
            // If not approved, anyone can access (no need to check owner/login status)
          }
          
          setProcessingData(processing);
          if (processing.coverImage) {
            setCoverImage(processing.coverImage);
          }
          if (processing.targetLanguage) {
            setSelectedLanguage(processing.targetLanguage);
          }
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load song details');
        router.push('/');
      } finally {
        setLoading(false);
      }
  }, [songID, processingID, router, isAnalysisRoute, isAdmin]);

  useEffect(() => {
    fetchSongData();
  }, [fetchSongData]);

  const handleCopyLink = useCallback(async () => {
    if (!effectiveProcessingID || effectiveProcessingID === 'undefined') {
      toast.error('Processing ID not available');
      closeMoreMenu();
      return;
    }

    try {
      const shareLink = await shareService.createShareLink(effectiveProcessingID);
      await navigator.clipboard.writeText(shareLink.shareUrl);
      toast.success('Short link copied to clipboard');
    } catch (error) {
      toast.error('Failed to create short link');
      // eslint-disable-next-line no-console
      console.error('Copy link error:', error);
    } finally {
      closeMoreMenu();
    }
  }, [effectiveProcessingID]);

  const handleToggleViewMode = useCallback(async () => {
    if (!songID || !effectiveProcessingID) {
      toast.error('Processing data not available');
      closeMoreMenu();
      return;
    }

    // Check admin status fresh to avoid race condition
    let currentIsAdmin = isAdmin;
    if (authService.isAuthenticated()) {
      try {
        currentIsAdmin = await authService.checkAdminStatus();
      } catch {
        currentIsAdmin = false;
      }
    }

    // Check if processing is approved
    const isApproved = processingData?.approvalStatus === 'approved' && processingData?.shareStatus === 'public_approved';

    // Admin can always access analysis mode
    if (currentIsAdmin) {
      if (isAnalysisRoute) {
        router.push(`/song/${songID}?processingID=${effectiveProcessingID}`);
      } else {
        router.push(`/song/${songID}/analysis/${effectiveProcessingID}`);
      }
      closeMoreMenu();
      return;
    }

    // If approved, only admin can access (block everyone else)
    if (isApproved) {
      toast.error('This processing has been reviewed and approved. Only admin can access analysis mode.');
      closeMoreMenu();
      return;
    }

    // If not approved yet, anyone can access (including non-logged-in users)
    if (isAnalysisRoute) {
      router.push(`/song/${songID}?processingID=${effectiveProcessingID}`);
    } else {
      router.push(`/song/${songID}/analysis/${effectiveProcessingID}`);
    }
    closeMoreMenu();
  }, [router, songID, effectiveProcessingID, isAnalysisRoute, isAdmin, processingData?.approvalStatus, processingData?.shareStatus]);

  const handleReportIssue = useCallback(() => {
    if (typeof document !== 'undefined') {
      const anchor =
        document.getElementById(feedbackSectionAnchorId) ||
        document.getElementById(`${feedbackSectionAnchorId}-mobile`);
      if (anchor) {
        anchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Shake feedback section after scroll (like when saving without rating)
        setTimeout(() => {
          feedbackSectionRef.current?.shake();
        }, 500);
      }
    }
    closeMoreMenu();
  }, []);

  const openShareModalFromMenu = async () => {
    const effectiveProcessingID = processingID || processingData?.processingID || '';
    if (!effectiveProcessingID || effectiveProcessingID === 'undefined') {
      toast.error('No processing ID available');
      closeMoreMenu();
      return;
    }

    try {
      setIsCreatingShareLink(true);
      const shareLink = await shareService.createShareLink(effectiveProcessingID);
      setShareUrl(shareLink.shareUrl);
      setIsSocialShareModalOpen(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create share link');
    } finally {
      setIsCreatingShareLink(false);
      closeMoreMenu();
    }
  };

  const openAdminModal = (type: 'approve' | 'reject') => {
    setAdminModalType(type);
    closeMoreMenu();
  };

  const handleAdminActionConfirm = useCallback(async () => {
    if (!adminModalType || !processingData?.processingID) {
      return;
    }

    try {
      setIsAdminActionProcessing(true);
      if (adminModalType === 'approve') {
        await adminSongsService.approveSong(processingData.processingID);
        toast.success('Processing approved successfully');
      } else {
        await adminSongsService.rejectSong(processingData.processingID);
        toast.success('Processing rejected successfully');
      }
      await fetchSongData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update processing';
      toast.error(message);
    } finally {
      setIsAdminActionProcessing(false);
      setAdminModalType(null);
    }
  }, [adminModalType, processingData?.processingID, fetchSongData]);

  const canApprove = isAdmin && processingData?.approvalStatus !== 'approved';
  const canReject = isAdmin && processingData?.approvalStatus !== 'rejected';

  useEffect(() => {
    if (songID && songID !== 'undefined' && authService.isAuthenticated()) {
      checkFavoriteStatus();
    }
  }, [songID, checkFavoriteStatus]);

  useEffect(() => {
    const fetchProcessingVersions = async () => {
      if (!songID || songID === 'undefined' || !isDetailRoute) {
        return;
      }

      try {
        const targetLanguage = processingData?.targetLanguage || null;
        const versions = await songService.getProcessingVersions(
          songID,
          targetLanguage || undefined
        );
        setProcessingVersions(versions);

        if (effectiveProcessingID && effectiveProcessingID !== 'undefined') {
          const currentVersion = versions.find(
            (v) => v.processingID === effectiveProcessingID
          );
          if (currentVersion) {
            setCurrentVersionNumber(currentVersion.versionNumber);
          } else {
            setCurrentVersionNumber(1);
          }
        } else {
          setCurrentVersionNumber(1);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch processing versions:', error);
        setProcessingVersions([]);
        setCurrentVersionNumber(1);
      }
    };

    if (isDetailRoute && songID && songID !== 'undefined') {
      fetchProcessingVersions();
    }
  }, [songID, processingData?.targetLanguage, effectiveProcessingID, isDetailRoute]);

  useEffect(() => {
    const fetchRecommendationsByLanguage = async () => {
      if (!processingData?.originalLanguage) return;

      try {
        setLoadingRecommendationsByLanguage(true);
        
        const originalLang = processingData.originalLanguage;
        let languageCode: string | null = null;

        // Try to get language code from name
        const codeFromName = getLanguageCodeByName(originalLang);
        if (codeFromName && codeFromName !== originalLang.toLowerCase().substring(0, 2)) {
          languageCode = codeFromName;
        } else {
          // Check if it's already a code
        const langLower = originalLang.toLowerCase();
        if (languageCodeToName[langLower]) {
          languageCode = langLower;
        } else {
            // Try to find by matching name
          const matchedKey = Object.keys(languageCodeToName).find(key => 
            languageCodeToName[key] === originalLang || key.toLowerCase() === langLower
          );
          languageCode = matchedKey || null;
          }
        }

        if (languageCode) {
          const languageSongs = await recommendSongsService.getRecommendedSongsByLanguageAndMood(
            languageCode, 
            undefined, 
            2,
            songID
          );
          setRecommendedByLanguage(languageSongs);
        }
      } catch {
        // Silently fail - recommendations are optional
      } finally {
        setLoadingRecommendationsByLanguage(false);
      }
    };

    if (processingData?.originalLanguage) {
      fetchRecommendationsByLanguage();
    }
  }, [processingData?.originalLanguage, songID]);

  useEffect(() => {
    const fetchRecommendationsByMood = async () => {
      if (!processingData) return;

      let topMood: string | null = null;
      
      if (processingData.mood && Array.isArray(processingData.mood) && processingData.mood.length > 0) {
        const sortedMoods = [...processingData.mood].sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
        topMood = sortedMoods[0].type;
      } else if (processingData.moodType) {
        try {
          const parsed = JSON.parse(processingData.moodType) as Array<{ type: string; percentage: number }>;
          if (Array.isArray(parsed) && parsed.length > 0) {
            const sortedMoods = [...parsed].sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
            topMood = sortedMoods[0].type;
          }
        } catch {
          topMood = processingData.moodType;
        }
      }

      if (!topMood || !processingData.originalLanguage) return;

      try {
        setLoadingRecommendationsByMood(true);
        
        const moodSongs = await recommendSongsService.getRecommendedSongsByLanguageAndMood(
          processingData.originalLanguage,
          topMood,
          2,
          songID
        );
        setRecommendedByMood(moodSongs);
      } catch {
      } finally {
        setLoadingRecommendationsByMood(false);
      }
    };

    if (processingData) {
      fetchRecommendationsByMood();
    }
  }, [processingData, songID]);

  const handleLanguageChange = async (language: string) => {
    if (!songID || songID === 'undefined') return;
    
    const languageCode = getLanguageCodeByName(language) || languageNameToCode[language];
    if (!languageCode) {
      toast.error('Invalid language selected');
      return;
    }

    if (language === processingData?.targetLanguage) {
      return;
    }

    try {
      setPendingLanguageChange(language);
      const checkResult = await songService.checkProcessingByLanguage(songID, languageCode);

      if (checkResult.exists && checkResult.processingID) {
        if (isAnalysisRoute) {
          setPendingProcessingID(checkResult.processingID);
          setIsNavigateAwayModalOpen(true);
        } else {
          toast.success('Found existing translation for this language');
          window.location.href = `/song/${songID}?processingID=${checkResult.processingID}`;
        }
      } else {
        if (isDetailRoute) {
          setNewAnalysisShareRequest(true);
        }
        setIsReAnalyzeModalOpen(true);
        setPendingLanguageChange(language);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to check processing');
      setPendingLanguageChange(null);
    }
  };

  const handleNavigateAwayConfirm = () => {
    if (pendingProcessingID) {
      window.location.href = `/song/${songID}?processingID=${pendingProcessingID}`;
    } else {
      setIsNavigateAwayModalOpen(false);
      setPendingLanguageChange(null);
      setPendingProcessingID(null);
    }
  };

  const handleNavigateAwayCancel = () => {
    setIsNavigateAwayModalOpen(false);
    setPendingLanguageChange(null);
    setPendingProcessingID(null);
  };

  const handleReAnalyzeClick = () => {
    if (isDetailRoute) {
      setNewAnalysisShareRequest(true);
    }
    setIsReAnalyzeModalOpen(true);
  };

  const handleShare = async () => {
    const effectiveProcessingID = processingID || processingData?.processingID || '';
    if (!effectiveProcessingID || effectiveProcessingID === 'undefined') {
      toast.error('No processing ID available');
      return;
    }

    try {
      setIsCreatingShareLink(true);
      const shareLink = await shareService.createShareLink(effectiveProcessingID);
      setShareUrl(shareLink.shareUrl);
      setIsSocialShareModalOpen(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create share link');
    } finally {
      setIsCreatingShareLink(false);
    }
  };

  const handleReAnalyzeConfirm = async () => {
    if (!songID || songID === 'undefined') {
      toast.error('Invalid song ID');
      return;
    }

    if (!processingData) {
      toast.error('Processing data not loaded');
      return;
    }

    const rawTarget = pendingLanguageChange 
      ? pendingLanguageChange 
      : processingData.targetLanguage || selectedLanguage;
    const targetLanguage = getLanguageNameByCode(rawTarget) || languageCodeToName[rawTarget as keyof typeof languageCodeToName] || rawTarget;

    const rawOriginal = processingData.originalLanguage;
    const originalLanguage = rawOriginal ? (getLanguageNameByCode(rawOriginal) || languageCodeToName[rawOriginal as keyof typeof languageCodeToName] || rawOriginal) : undefined;

    if (!targetLanguage) {
      toast.error('Target language is required');
      return;
    }

    if (!isAnalysisRoute) {
      try {
        setIsReAnalyzing(true);
        toast.loading('Starting new analysis...', { id: 'new-analysis' });

        const result = await analysisService.newAnalysis({
          lyricsRecord: { songID },
          actions: {
            translate: true,
            mood: true
          },
          translationConfig: {
            targetLanguage,
            ...(originalLanguage ? { originalLanguage } : {})
          },
          shareRequest: newAnalysisShareRequest
        });

        if (!result || !result.songID || !result.processingID) {
          throw new Error('Invalid response from server');
        }

        toast.success('New analysis started!', { id: 'new-analysis' });
        setIsReAnalyzeModalOpen(false);
        setPendingLanguageChange(null);
        setNewAnalysisShareRequest(true);
        router.push(`/song/${result.songID}/analysis/${result.processingID}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to start new analysis', { id: 'new-analysis' });
        setIsReAnalyzeModalOpen(false);
        setPendingLanguageChange(null);
        setNewAnalysisShareRequest(true);
      } finally {
        setIsReAnalyzing(false);
      }

      return;
    }

    if (!processingID || processingID === 'undefined') {
      toast.error('Invalid processing ID');
      return;
    }

    try {
      setIsReAnalyzing(true);
      
      await analysisService.reAnalyze(processingID, {
        actions: {
          translate: true,
          mood: true
        },
        translationConfig: { originalLanguage, targetLanguage }
      });

      toast.success('Re-analyzing... Please wait a moment.');
      
      setTimeout(async () => {
        try {
          const data = await songService.getSongDetail(songID, processingID);
          setSongData(data.song);
          if (data.processing) {
            setProcessingData(data.processing);
            if (data.processing.coverImage) {
              setCoverImage(data.processing.coverImage);
            }
            if (pendingLanguageChange) {
              setSelectedLanguage(pendingLanguageChange);
            }
          }
          toast.success('Re-analysis completed!');
        } catch {
          toast.error('Failed to reload data');
        } finally {
          setIsReAnalyzing(false);
          setIsReAnalyzeModalOpen(false);
          setPendingLanguageChange(null);
        }
      }, 2000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to re-analyze');
      setIsReAnalyzing(false);
      setIsReAnalyzeModalOpen(false);
      setPendingLanguageChange(null);
    }
  };

  const handleSaveTranslation = async () => {
    if (!songID || !processingID || songID === 'undefined' || processingID === 'undefined') {
      return;
    }

    if (!authService.isAuthenticated()) {
      toast.error('Please login to save translation');
      return;
    }

    try {
      const result = await historyService.saveTranslation({
        songID,
        processingID
      });

      if (result) {
        toast.success('Translation saved to your archive!');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to save translation:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!songID || songID === 'undefined') {
      return;
    }

    if (!effectiveProcessingID || effectiveProcessingID === 'undefined') {
      toast.error('Processing ID is missing');
      return;
    }

    if (!authService.isAuthenticated()) {
      toast.error('Please login to add favorites');
      return;
    }

    try {
      setIsTogglingFavorite(true);
      
      if (isFavorite) {
        const removed = await favoriteService.removeFavorite({ processingID: effectiveProcessingID });
        if (removed) {
          setIsFavorite(false);
          toast.success('Removed from favorites');
        } else {
          toast.error('Failed to remove favorite');
        }
      } else {
        const result = await favoriteService.addFavorite({ processingID: effectiveProcessingID });
        if (result) {
          setIsFavorite(true);
          toast.success('Added to favorites');
        } else {
          toast.error('Failed to add favorite');
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to toggle favorite:', error);
      toast.error('Failed to update favorite');
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleCoverImageChange = async (imageUrl: string | null) => {
    if (!isAnalysisRoute) return;
    
    // ตรวจสอบว่าเพลงได้รับการอนุมัติหรือไม่ และผู้ใช้เป็นแอดมินหรือไม่
    const isApproved = processingData?.approvalStatus === 'approved' && processingData?.shareStatus === 'public_approved';
    if (isApproved && !isAdmin) {
      toast.error('Cannot edit cover image: This processing has been approved. Only admin can edit approved songs.');
      return;
    }
    
    setCoverImage(imageUrl);
    if (processingID && processingID !== 'undefined') {
      try {
        setIsSavingCoverImage(true);
        await songService.updateCoverImage(processingID, imageUrl || '');
        if (processingData) {
          setProcessingData({
            ...processingData,
            coverImage: imageUrl || ''
          });
        }
        if (imageUrl) {
          toast.success('Cover image saved!');
        } else {
          toast.success('Cover image removed!');
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to save cover image');
      } finally {
        setIsSavingCoverImage(false);
      }
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-64 mb-4 mx-auto"></div>
            <div className="h-9 bg-gray-200 rounded w-96 mb-8 mx-auto"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-8">
              {/* ฝั่งย่อ Skeleton */}
              <div className="space-y-6">
                {/* Centered Section */}
                <div className="flex flex-col items-center">
                  {/* Song Cover Skeleton */}
                  <div className="bg-gray-200 rounded-lg" style={{ width: '304px', height: '302px' }}></div>
                  
                  {/* Action Icons Skeleton */}
                  <div className="flex items-center gap-4 justify-center mt-6">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  </div>
                  
                  {/* Feedback Section Skeleton */}
                  <div 
                    className="flex flex-col items-center rounded-xl bg-white mt-6"
                    style={{ 
                      width: '304px', 
                      height: '324px', 
                      padding: '24px', 
                      gap: '19px', 
                      flexShrink: 0,
                      borderRadius: '12px',
                      background: '#FFF',
                      boxShadow: '0 0 18px 0 rgba(255, 0, 102, 0.25)'
                    }}
                  >
                    {/* Title Skeleton */}
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    
                    {/* Star Rating Skeleton */}
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="bg-gray-200 rounded" style={{ width: '32px', height: '32px' }}></div>
                      ))}
                    </div>
                    
                    {/* Textarea Skeleton */}
                    <div 
                      className="bg-gray-200 rounded"
                      style={{
                        height: '80px',
                        alignSelf: 'stretch',
                        borderRadius: '6px'
                      }}
                    ></div>
                    
                    {/* Submit Button Skeleton */}
                    <div 
                      className="bg-gray-200 rounded"
                      style={{
                        height: '40px',
                        alignSelf: 'stretch',
                        borderRadius: '6px'
                      }}
                    ></div>
                  </div>
                </div>
                
                {/* Recommend with language Skeleton */}
                <div className="flex flex-col items-center mx-auto" style={{ width: '304px' }}>
                  <div className="h-6 bg-gray-200 rounded w-40 mb-3"></div>
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                </div>
                
                {/* Recommend with Mood Skeleton */}
                <div className="flex flex-col items-center mx-auto" style={{ width: '304px' }}>
                  <div className="h-6 bg-gray-200 rounded w-40 mb-3"></div>
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                </div>
              </div>
              
              {/* ฝั่งรายละเอียด Skeleton */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '54px', width: '100%' }}>
                {/* Song Details Card Skeleton (only in analysis route) */}
                {isAnalysisRoute && (
                  <div className="p-6 w-full">
                    <div className="flex flex-col gap-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center" style={{ gap: '12px' }}>
                          <div className="h-4 bg-gray-200 rounded" style={{ width: '100px' }}></div>
                          <div className="bg-gray-200 rounded" style={{ width: '300px', height: '36px', borderRadius: '6px' }}></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Summary Skeleton */}
                <div style={{ width: '100%' }}>
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-1 bg-gray-200 mb-4" style={{ width: '100%' }}></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
                
                {/* Lyrics Translation Viewer Skeleton */}
                <div style={{ width: '100%', height: '466px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
                  {/* Header Skeleton */}
                  <div className="flex items-center justify-between px-4 w-full bg-gray-200" style={{ height: '70px', flexShrink: 0, boxSizing: 'border-box', borderRadius: '12px 12px 0 0' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gray-300 rounded"></div>
                      <div className="bg-gray-300 rounded" style={{ width: '148px', height: '38px', borderRadius: '14px' }}></div>
                    </div>
                    <div className="w-5 h-5 bg-gray-300 rounded"></div>
                  </div>
                  
                  {/* Content Skeleton */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 overflow-y-auto w-full" style={{ height: '396px', flexShrink: 0, boxSizing: 'border-box', borderRadius: '0 0 12px 12px' }}>
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div 
                          key={i} 
                          className="h-4 bg-gray-200 rounded" 
                          style={{ width: `${[95, 80, 70, 85, 90, 75, 88, 82][i - 1] || 80}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Mood Analyze Section Skeleton */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  alignSelf: 'stretch',
                  borderRadius: '12px',
                  background: '#FFF',
                  boxShadow: '0 2px 40px -3px rgba(255, 239, 143, 0.50)'
                }}>
                  {/* Header Skeleton */}
                  <div className="flex items-center gap-2 px-6 w-full bg-gray-200" style={{ height: '70px', flexShrink: 0, borderRadius: '12px 12px 0 0' }}>
                    <div className="w-7 h-7 bg-gray-300 rounded"></div>
                    <div className="h-6 bg-gray-300 rounded w-32"></div>
                  </div>
                  
                  {/* Content Skeleton */}
                  <div className="flex w-full px-6 gap-6 pt-6 pb-6">
                    {/* Left side - 30% - Icon */}
                    <div className="flex-shrink-0" style={{ width: '30%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div className="w-20 h-20 bg-gray-200 rounded"></div>
                    </div>
                    
                    {/* Right side - 70% - Mood bars */}
                    <div className="flex-1" style={{ width: '70%' }}>
                      <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i}>
                            <div className="flex justify-between items-center mb-1">
                              <div className="h-4 bg-gray-200 rounded w-16"></div>
                              <div className="h-4 bg-gray-200 rounded w-10"></div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-gray-300 h-2 rounded-full" style={{ width: `${[40, 25, 30, 5][i - 1]}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                </div>
                
                {/* Action Buttons Skeleton */}
                <div className="flex items-center justify-between w-full" style={{ gap: '22px' }}>
                  {/* Re-analyze Button Skeleton */}
                  <div className="bg-gray-200 rounded-lg" style={{ height: '60px', width: '140px', borderRadius: '14px' }}></div>
                  {/* One more song Button Skeleton */}
                  <div className="bg-gray-200 rounded-lg" style={{ height: '60px', flex: 1, maxWidth: '400px', borderRadius: '14px' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  } 

  // Generate structured data (JSON-LD) for SEO
  const structuredData = songData && processingData ? {
    '@context': 'https://schema.org',
    '@type': 'MusicRecording',
    name: songData.songName,
    byArtist: {
      '@type': 'MusicGroup',
      name: songData.artistName,
    },
    ...(processingData.targetLanguage && { inLanguage: processingData.targetLanguage }),
    ...(Array.isArray(processingData.mood) && processingData.mood.length > 0 && {
      genre: (processingData.mood as Array<{ type: string; percentage?: number }>)
        .map((m) => m.type)
        .slice(0, 4),
    }),
    ...(processingData.translation && {
      description: `Lyrics translation of ${songData.songName} by ${songData.artistName} to ${processingData.targetLanguage || DEFAULT_TARGET_LANGUAGE}`,
    }),
    ...(coverImage && {
      image: coverImage.startsWith('http') ? coverImage : `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://musemusic.phitik.com'}${coverImage}`,
    }),
    url: `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://musemusic.phitik.com'}/song/${songID}?processingID=${processingID}`,
  } : null;

  return (
    <main className="min-h-screen bg-white">
      {/* Structured Data for SEO */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Title - Different based on route */}
        {isAnalysisRoute ? (
          <h1 className="text-center text-black font-semibold mb-8" style={{ fontFamily: 'Inter', fontSize: '32px', fontWeight: 600 }}>
            You&apos;re the First Explorer of this song!
          </h1>
        ) : (
          <>
            <p className="text-center mb-4" style={{ fontFamily: 'Inter', fontSize: '24px', fontStyle: 'normal', fontWeight: 600, lineHeight: 'normal', color: '#000' }}>
              We Gave It Another Spin.
            </p>
            <h1 className="text-center mb-8" style={{ fontFamily: 'Inter', fontSize: '32px', fontStyle: 'normal', fontWeight: 700, lineHeight: 'normal', color: '#000' }}>
              {songData?.songName && songData?.artistName ? (
                <>
                  {songData.songName} - {songData.artistName}
                  {songData.country && ` (${songData.country})`}
                </>
              ) : (
                'Song Details'
              )}
            </h1>
          </>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-8">
          {/* ฝั่งย่อ (40%) - Desktop only */}
          <div className="hidden lg:block space-y-6">
            {/* Centered Section */}
            <div className="flex flex-col items-center">
              {/* Song Cover Card */}
              <CoverImageUpload
                width={304}
                height={302}
                onImageChange={isAnalysisRoute ? handleCoverImageChange : undefined}
                initialImage={coverImage}
                isSaving={isSavingCoverImage}
                readonly={!isAnalysisRoute}
              />

              {/* Action Icons */}
              <div className="flex items-center gap-4 justify-center mt-6">
                <button 
                  onClick={handleToggleFavorite}
                  disabled={isTogglingFavorite || isCheckingFavorite}
                  className="p-3 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart 
                    className="h-6 w-6" 
                    style={{ color: '#7B61FF' }} 
                    fill={isFavorite ? '#7B61FF' : 'none'}
                  />
                </button>
                <button 
                  onClick={handleShare}
                  disabled={isCreatingShareLink || !(processingID || processingData?.processingID)}
                  className="p-3 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Share2 className="h-6 w-6" style={{ color: '#7B61FF' }} />
                </button>
                <div className="relative" ref={desktopMenuRef}>
                  <button
                    type="button"
                    onClick={() => toggleMoreMenu('desktop')}
                    className="p-3 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="More actions"
                  >
                  <MoreVertical className="h-6 w-6" style={{ color: '#7B61FF' }} />
                </button>
                  {moreMenuTarget === 'desktop' && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl py-2 z-20">
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Link2 className="h-4 w-4 text-gray-500" />
                        Copy song link
                      </button>
                      <button
                        type="button"
                        onClick={handleToggleViewMode}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <ExternalLink className="h-4 w-4 text-gray-500" />
                        {isAnalysisRoute ? 'Open detail view' : 'Open analysis mode'}
                      </button>
                      <button
                        type="button"
                        onClick={handleReportIssue}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Flag className="h-4 w-4 text-gray-500" />
                        Report / give feedback
                      </button>
                      <button
                        type="button"
                        onClick={openShareModalFromMenu}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Share2 className="h-4 w-4 text-gray-500" />
                        Share with friends
                      </button>
                      {isAdmin && (
                        <>
                          <div className="my-2 border-t border-gray-100" />
                          <button
                            type="button"
                            onClick={() => openAdminModal('approve')}
                            disabled={!canApprove}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-green-700 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ShieldCheck className="h-4 w-4" />
                            Approve processing
                          </button>
                          <button
                            type="button"
                            onClick={() => openAdminModal('reject')}
                            disabled={!canReject}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ShieldOff className="h-4 w-4" />
                            Reject processing
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Feedback Section */}
              <div id={feedbackSectionAnchorId} className="w-full flex justify-center">
              <FeedbackSection 
                ref={feedbackSectionRef}
                processingID={processingID} 
                onRatingSubmitted={handleRatingSubmitted}
              />
              </div>
            </div>

            {/* Recommend with language */}
            {processingData?.originalLanguage && (
              <div className="flex flex-col items-center mx-auto" style={{ width: '304px' }}>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 w-full">Recommend with language</h2>
                {loadingRecommendationsByLanguage ? (
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                ) : recommendedByLanguage.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 w-full">
                    {recommendedByLanguage.map((song) => (
                      <MusicCard
                        key={`${song.id}-${song.processingID}`}
                        image={song.image}
                        title={song.title}
                        artist={song.artist}
                        href={`/song/${song.id}?processingID=${song.processingID}`}
                        mood={song.mood || null}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center w-full">No recommendations available</p>
                )}
              </div>
            )}

            {/* Recommend with Mood */}
            {processingData?.moodType && (
              <div className="flex flex-col items-center mx-auto" style={{ width: '304px' }}>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 w-full">Recommend with Mood</h2>
                {loadingRecommendationsByMood ? (
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                ) : recommendedByMood.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 w-full">
                    {recommendedByMood.map((song) => (
                      <MusicCard
                        key={`${song.id}-${song.processingID}`}
                        image={song.image}
                        title={song.title}
                        artist={song.artist}
                        href={`/song/${song.id}?processingID=${song.processingID}`}
                        mood={song.mood || null}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center w-full">No recommendations available</p>
                )}
              </div>
            )}
          </div>

          {/* Mobile: Cover + Action Icons */}
          <div className="lg:hidden flex flex-col items-center mb-6">
            <CoverImageUpload
              width={304}
              height={302}
              onImageChange={isAnalysisRoute ? handleCoverImageChange : undefined}
              initialImage={coverImage}
              isSaving={isSavingCoverImage}
              readonly={!isAnalysisRoute}
            />
            <div className="flex items-center gap-4 justify-center mt-6">
              <button 
                onClick={handleToggleFavorite}
                disabled={isTogglingFavorite || isCheckingFavorite}
                className="p-3 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart 
                  className="h-6 w-6" 
                  style={{ color: '#7B61FF' }} 
                  fill={isFavorite ? '#7B61FF' : 'none'}
                />
              </button>
              <button 
                onClick={handleShare}
                disabled={isCreatingShareLink || !(processingID || processingData?.processingID)}
                className="p-3 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Share"
              >
                <Share2 className="h-6 w-6" style={{ color: '#7B61FF' }} />
              </button>
              <div className="relative" ref={mobileMenuRef}>
                <button
                  type="button"
                  onClick={() => toggleMoreMenu('mobile')}
                  className="p-3 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="More actions"
                >
                <MoreVertical className="h-6 w-6" style={{ color: '#7B61FF' }} />
              </button>
                {moreMenuTarget === 'mobile' && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl py-2 z-20">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Link2 className="h-4 w-4 text-gray-500" />
                      Copy song link
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleViewMode}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <ExternalLink className="h-4 w-4 text-gray-500" />
                      {isAnalysisRoute ? 'Open detail view' : 'Open analysis mode'}
                    </button>
                    <button
                      type="button"
                      onClick={handleReportIssue}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Flag className="h-4 w-4 text-gray-500" />
                      Report / give feedback
                    </button>
                    <button
                      type="button"
                      onClick={openShareModalFromMenu}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Share2 className="h-4 w-4 text-gray-500" />
                      Share with friends
                    </button>
                    {isAdmin && (
                      <>
                        <div className="my-2 border-t border-gray-100" />
                        <button
                          type="button"
                          onClick={() => openAdminModal('approve')}
                          disabled={!canApprove}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-green-700 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ShieldCheck className="h-4 w-4" />
                          Approve processing
                        </button>
                        <button
                          type="button"
                          onClick={() => openAdminModal('reject')}
                          disabled={!canReject}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ShieldOff className="h-4 w-4" />
                          Reject processing
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ฝั่งรายละเอียด (60%) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }} className="lg:items-start items-center">
            {/* Processing Version Bar (read-only route) or Song Details Card (analysis route) */}
            {isAnalysisRoute ? (
              <div style={{ marginBottom: '54px', width: '100%' }}>
                <SongDetailsCard songData={songData} processingData={processingData} />
              </div>
            ) : (
              processingData && (
                <div style={{ width: '100%', marginBottom: '16px' }}>
                  <ProcessingVersionBar
                    versionNumber={currentVersionNumber}
                    processingID={processingData.processingID}
                    rating={processingData.averageRating ? Math.round(processingData.averageRating) : undefined}
                    onNewAnalyze={handleReAnalyzeClick}
                    newAnalyzeLabel={isDetailRoute ? 'New analyze' : 'Re-analyze'}
                    versions={processingVersions.map(v => ({ 
                      versionNumber: v.versionNumber, 
                      processingID: v.processingID,
                      averageRating: v.averageRating
                    }))}
                    onVersionClick={(clickedProcessingID) => {
                      if (clickedProcessingID !== effectiveProcessingID) {
                        window.location.href = `/song/${songID}?processingID=${clickedProcessingID}`;
                      }
                    }}
                    currentProcessingID={effectiveProcessingID}
                  />
                </div>
              )
            )}

            {/* Summary */}
            <div style={{ marginBottom: '54px', width: '100%' }}>
              <SummarySection processingData={processingData} />
            </div>

            {/* Lyrics Section */}
            <div style={{ marginBottom: '54px', width: '100%' }}>
              <LyricsTranslationViewer
                translation={processingData?.translation}
                originalLyrics={songData?.lyrics}
                defaultLanguage={processingData?.targetLanguage || DEFAULT_TARGET_LANGUAGE}
                availableLanguages={getLanguageNames()}
                hasRating={hasSubmittedRating}
                onShakeFeedback={() => feedbackSectionRef.current?.shake()}
                songName={songData?.songName}
                artistName={songData?.artistName}
                targetLanguage={processingData?.targetLanguage}
                currentTime={currentTime}
                syncedLyricsLines={syncedLyricsLines}
                durationMatch={durationMatch}
                songDuration={songData?.duration}
                onSeekToTime={(time) => setSeekToTime(time)}
                onLanguageChange={handleLanguageChange}
                onSelectedLanguageChange={setSelectedLanguage}
                onPlayPause={() => playerPlayPauseRef.current?.()}
                isPlaying={isPlaying}
                onVolumeChange={(vol) => {
                  if (playerVolumeRef.current) {
                    playerVolumeRef.current.setVolume(vol);
                    setVolume(vol);
                    if (vol === 0) {
                      setIsMuted(true);
                    } else if (isMuted) {
                      setIsMuted(false);
                    }
                  }
                }}
                onMuteToggle={() => {
                  if (playerVolumeRef.current) {
                    if (isMuted) {
                      playerVolumeRef.current.unmute();
                      setIsMuted(false);
                    } else {
                      playerVolumeRef.current.mute();
                      setIsMuted(true);
                    }
                  }
                }}
                volume={volume}
                isMuted={isMuted}
                syncConfirmed={processingData?.syncConfirmed || false}
                songStartTime={processingData?.songStartTime || null}
                onSave={handleSaveTranslation}
                youtubeVideoId={processingData?.youtubeVideoId || null}
              />
            </div>

            {/* Synced Lyrics Player */}
            <div style={{ marginBottom: '54px', width: '100%' }}>
              {songData?.syncedLyrics ? (
                <SyncedLyricsPlayer
                  syncedLyrics={songData.syncedLyrics}
                  songDuration={songData.duration || undefined}
                  processingID={processingID}
                  initialYoutubeVideoId={processingData?.youtubeVideoId || null}
                  songName={songData.songName}
                  artistName={songData.artistName}
                  onCurrentTimeChange={setCurrentTime}
                  onSyncedLyricsParsed={setSyncedLyricsLines}
                  onDurationMatchChange={setDurationMatch}
                  onIsPlayingChange={handleIsPlayingChange}
                  onPlayPauseRequest={(api) => {
                    playerPlayPauseRef.current = api.playPause;
                  }}
                  onVolumeRequest={(api) => {
                    playerVolumeRef.current = api;
                  }}
                  seekToTime={seekToTime}
                  readonly={!isAnalysisRoute}
                  initialSyncConfirmed={processingData?.syncConfirmed || false}
                  initialSongStartTime={processingData?.songStartTime || null}
                  onSyncSettingsChange={isAnalysisRoute ? ((syncConfirmed, songStartTime) => {
                    if (processingData) {
                      setProcessingData({
                        ...processingData,
                        syncConfirmed,
                        songStartTime
                      });
                    }
                  }) : undefined}
                  isApproved={processingData?.approvalStatus === 'approved' && processingData?.shareStatus === 'public_approved'}
                  isAdmin={isAdmin}
                />
              ) : (
                <div className="w-full">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 text-center">
                      ⚠️ This song does not have synchronized lyrics available.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Mood Analyze Section */}
            <MoodAnalyzeSection processingData={processingData} />

            {/* Mobile: Feedback Section - อยู่หลัง Mood Analyze */}
            <div
              id={`${feedbackSectionAnchorId}-mobile`}
              className="lg:hidden mt-6 w-full flex justify-center"
            >
              <FeedbackSection 
                ref={feedbackSectionRef}
                processingID={processingID} 
                onRatingSubmitted={handleRatingSubmitted}
              />
            </div>

            {/* Mobile: Recommend with language - อยู่หลัง Mood Analyze */}
            {processingData?.originalLanguage && (
              <div className="lg:hidden flex flex-col items-center mx-auto mt-6 mb-6" style={{ width: '100%', maxWidth: '304px' }}>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 w-full">Recommend with language</h2>
                {loadingRecommendationsByLanguage ? (
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                ) : recommendedByLanguage.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 w-full">
                    {recommendedByLanguage.map((song) => (
                      <MusicCard
                        key={`${song.id}-${song.processingID}`}
                        image={song.image}
                        title={song.title}
                        artist={song.artist}
                        href={`/song/${song.id}?processingID=${song.processingID}`}
                        mood={song.mood || null}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center w-full">No recommendations available</p>
                )}
              </div>
            )}

            {/* Mobile: Recommend with Mood - อยู่หลัง Mood Analyze */}
            {processingData?.moodType && (
              <div className="lg:hidden flex flex-col items-center mx-auto mt-6" style={{ width: '100%', maxWidth: '304px' }}>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 w-full">Recommend with Mood</h2>
                {loadingRecommendationsByMood ? (
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                ) : recommendedByMood.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 w-full">
                    {recommendedByMood.map((song) => (
                      <MusicCard
                        key={`${song.id}-${song.processingID}`}
                        image={song.image}
                        title={song.title}
                        artist={song.artist}
                        href={`/song/${song.id}?processingID=${song.processingID}`}
                        mood={song.mood || null}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center w-full">No recommendations available</p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <SongActionButtons 
              onActionClick={handleReAnalyzeClick}
              isProcessing={isReAnalyzing}
              actionLabel={isAnalysisRoute ? 'Re-analyze' : 'New analyze'}
              processingLabel={isAnalysisRoute ? 'Re-analyzing...' : 'Starting...'}
            />
          </div>
        </div>
      </div>

      {/* Navigate Away Confirm Modal - Only in analysis route */}
      {isAnalysisRoute && (
        <NavigateAwayConfirmModal
          isOpen={isNavigateAwayModalOpen}
          onClose={handleNavigateAwayCancel}
          onConfirm={handleNavigateAwayConfirm}
          targetLanguage={pendingLanguageChange || selectedLanguage}
        />
      )}

      {/* Social Share Modal */}
      <SocialShareModal
        isOpen={isSocialShareModalOpen}
        shareUrl={shareUrl}
        title={songData?.songName ? `${songData.songName}${songData.artistName ? ` - ${songData.artistName}` : ''}` : 'Check out this song!'}
        description={processingData?.summary || ''}
        onClose={() => setIsSocialShareModalOpen(false)}
      />

      {/* Re-Analyze Confirm Modal */}
      <ReAnalyzeConfirmModal
        isOpen={isReAnalyzeModalOpen}
        onClose={() => {
          setIsReAnalyzeModalOpen(false);
          setPendingLanguageChange(null);
          if (isDetailRoute) {
            setNewAnalysisShareRequest(true);
          }
        }}
        onConfirm={handleReAnalyzeConfirm}
        isProcessing={isReAnalyzing}
        targetLanguage={pendingLanguageChange || selectedLanguage}
        mode={isAnalysisRoute ? 're-analyze' : 'new-analysis'}
        shareRequest={isAnalysisRoute ? undefined : newAnalysisShareRequest}
        onShareRequestChange={isAnalysisRoute ? undefined : setNewAnalysisShareRequest}
      />
      <ApproveRejectModal
        isOpen={adminModalType !== null}
        onClose={() => {
          if (!isAdminActionProcessing) {
            setAdminModalType(null);
          }
        }}
        onConfirm={handleAdminActionConfirm}
        type={adminModalType ?? 'approve'}
        songName={songData?.songName || 'this song'}
        isProcessing={isAdminActionProcessing}
      />
    </main>
  );
}
