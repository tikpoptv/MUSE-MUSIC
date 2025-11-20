"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PenLine, RefreshCw, Save, Loader2, Edit2, X, Search, Play } from "lucide-react";
import { n8nWorkflowService } from "@/services/n8nWorkflowService";
import { songService } from "@/services/songService";
import { lyricsService } from "@/services/lyricsService";
import { promptTestService, type PromptTestResponse } from "@/services/promptTestService";
import { promptService } from "@/services/promptService";
import type { LyricsRecord } from "@/types/lyrics";
import toast from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EditPromptPanel() {
  const [prompt, setPrompt] = useState<string>("");
  const [originalPrompt, setOriginalPrompt] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [workflowInfo, setWorkflowInfo] = useState<{
    id: string;
    name: string;
    active: boolean;
  } | null>(null);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // Preview states
  const [selectedSongID, setSelectedSongID] = useState<string>("");
  const [selectedLyricsRecord, setSelectedLyricsRecord] = useState<LyricsRecord | null>(null);
  const [songSearch, setSongSearch] = useState<string>("");
  const [searching, setSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<LyricsRecord[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const searchWrapRef = useRef<HTMLDivElement | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState<string>("English");
  const [targetLanguage, setTargetLanguage] = useState<string>("Thai");
  const [moodEnabled, setMoodEnabled] = useState<boolean>(true);
  const [moodTopK, setMoodTopK] = useState<number>(4);
  const [selectedSongLyrics, setSelectedSongLyrics] = useState<string>("");
  const [testResults, setTestResults] = useState<PromptTestResponse | null>(null);
  const testResultsRef = useRef<HTMLDivElement | null>(null);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'th', name: 'Thai' },
    { code: 'lo', name: 'Lao' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'vi', name: 'Vietnamese' }
  ];

  const fetchSongLyrics = useCallback(async () => {
    if (!selectedSongID) return;
    try {
      const songDetail = await songService.getSongDetail(selectedSongID);
      if (songDetail.song.lyrics) {
        setSelectedSongLyrics(songDetail.song.lyrics);
      } else {
        setSelectedSongLyrics("");
        toast.error("This song has no lyrics");
      }
    } catch {
      toast.error("Failed to fetch song lyrics");
      setSelectedSongLyrics("");
    }
  }, [selectedSongID]);

  // Real-time preview generation using useMemo for immediate updates
  const previewPrompt = React.useMemo(() => {
    // Use prompt if in edit mode, otherwise use originalPrompt
    const promptToUse = isEditing ? prompt : originalPrompt;
    
    if (!promptToUse || !selectedSongLyrics) {
      return "";
    }

    return promptToUse
      .replace(/\{\{\s*\$json\.body\.language1\s*\}\}/g, sourceLanguage)
      .replace(/\{\{\s*\$json\.body\.language2\s*\}\}/g, targetLanguage)
      .replace(/\{\{\s*\$json\.body\.lyrics\s*\}\}/g, selectedSongLyrics)
      .replace(/\{\{\s*\$json\.body\.moodEnabled\s*\}\}/g, moodEnabled ? 'true' : 'false')
      .replace(/\{\{\s*\$json\.body\.moodTopK\s*\}\}/g, moodTopK.toString());
  }, [prompt, originalPrompt, isEditing, selectedSongLyrics, sourceLanguage, targetLanguage, moodEnabled, moodTopK]);

  useEffect(() => {
    fetchPrompt();
  }, []);

  useEffect(() => {
    if (selectedLyricsRecord) {
      // Try to use plainLyrics from LyricsRecord first
      if (selectedLyricsRecord.plainLyrics) {
        setSelectedSongLyrics(selectedLyricsRecord.plainLyrics);
      } else if (selectedSongID) {
        // Fallback to fetching from database if songID is available
        fetchSongLyrics();
      } else {
        setSelectedSongLyrics("");
        toast.error("No lyrics available for this song");
      }
    }
  }, [selectedLyricsRecord, selectedSongID, fetchSongLyrics]);

  // Debounced search effect
  useEffect(() => {
    let active = true;
    const handler = setTimeout(async () => {
      if (!songSearch.trim()) {
        if (active) {
          setSearchResults([]);
          setShowDropdown(false);
        }
        return;
      }
      try {
        setSearching(true);
        const data = await lyricsService.search({ q: songSearch.trim() });
        if (active) {
          setSearchResults(data);
          setShowDropdown(true);
        }
      } catch {
        if (active) {
          setSearchResults([]);
          setShowDropdown(true);
        }
      } finally {
        if (active) setSearching(false);
      }
    }, 400);

    return () => {
      active = false;
      clearTimeout(handler);
    };
  }, [songSearch]);

  // Click outside to close dropdown
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!showDropdown) return;
      const el = searchWrapRef.current;
      if (el && e.target instanceof Node && !el.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [showDropdown]);

  useEffect(() => {
    setHasChanges(prompt !== originalPrompt);
  }, [prompt, originalPrompt]);

  const fetchPrompt = async () => {
    setIsLoading(true);
    try {
      const data = await n8nWorkflowService.getWorkflowInfo();
      
      if (data) {
        const promptText = data.prompt || "";
        setPrompt(promptText);
        setOriginalPrompt(promptText);
        setWorkflowInfo(data.workflow);
        setIsEditing(false);
        setHasChanges(false);
      } else {
        toast.error("Failed to fetch prompt");
      }
    } catch (error) {
      toast.error("Failed to fetch prompt");
      // eslint-disable-next-line no-console
      console.error("Error fetching prompt:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!hasChanges) {
      toast.error("No changes to save");
      return;
    }

    // Auto-add '=' prefix if missing before saving
    let promptToSave = prompt;
    const firstChar = prompt.trim()[0];
    if (firstChar !== '=') {
      promptToSave = '=' + prompt;
      toast("✅ Added '=' prefix to prompt automatically", { 
        duration: 2000,
        icon: '✅'
      });
    }

    setIsSaving(true);
    try {
      toast.loading("Saving prompt...", { id: "save-prompt" });
      
      await promptService.savePrompt(promptToSave);
      
      toast.success("Prompt saved successfully! Production workflow updated.", { id: "save-prompt" });
      
      // Update local state
      setPrompt(promptToSave);
      setOriginalPrompt(promptToSave);
      setHasChanges(false);
      setIsEditing(false);
      
      // Refresh prompt from server
      await fetchPrompt();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Save prompt error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save prompt",
        { id: "save-prompt" }
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setPrompt(originalPrompt);
    setHasChanges(false);
    setIsEditing(false);
    toast.success("Prompt reset to original");
  };

  const handleEdit = () => {
    setPrompt(originalPrompt);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setPrompt(originalPrompt);
    setHasChanges(false);
    setIsEditing(false);
    toast.success("Changes cancelled");
  };

  const formatDuration = (secs: number): string => {
    const total = Math.max(0, Math.round(secs));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSongSelect = (record: LyricsRecord) => {
    setSelectedLyricsRecord(record);
    setSongSearch(`${record.trackName} - ${record.artistName}`);
    setSearchResults([]);
    setShowDropdown(false);
    
    // Try to find songID in database by searching for matching song
    // This is optional - we can use plainLyrics directly
    if (record.plainLyrics) {
      setSelectedSongLyrics(record.plainLyrics);
      setSelectedSongID(""); // Clear songID since we're using LyricsRecord
    } else {
      // If no plainLyrics, try to find the song in database
      // For now, we'll just set the lyrics to empty and let the user know
      setSelectedSongID("");
      setSelectedSongLyrics("");
    }
  };

  const handleTestAnalysis = async () => {
    if (!selectedLyricsRecord || !selectedSongLyrics) {
      toast.error("Please select a song with lyrics first");
      return;
    }

    let promptToTest = isEditing ? prompt : originalPrompt;
    
    if (!promptToTest) {
      toast.error("No prompt available to test");
      return;
    }

    // Auto-add '=' prefix if missing
    const firstChar = promptToTest.trim()[0];
    if (firstChar !== '=') {
      promptToTest = '=' + promptToTest;
      toast("✅ Added '=' prefix to prompt automatically", { 
        duration: 2000,
        icon: '✅'
      });
    }

    setIsTesting(true);
    setTestResults(null); // Clear previous results
    
    // Auto scroll to results section immediately when starting test
    setTimeout(() => {
      testResultsRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 100);
    
    try {
      toast.loading("Testing prompt... This may take a moment", { id: "test-analysis" });

      const result = await promptTestService.testPrompt({
        newPromptText: promptToTest,
        lyrics: selectedSongLyrics,
        language1: sourceLanguage,
        language2: targetLanguage,
        moodEnabled,
        moodTopK
      });

      setTestResults(result);
      toast.success("Test completed successfully!", { id: "test-analysis" });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Test analysis error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to test prompt",
        { id: "test-analysis" }
      );
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-8 lg:px-16 py-6 w-full">
        <Card className="rounded-[10px] border border-gray-200 shadow-sm">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            <span className="ml-3 text-gray-600">Loading prompt...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full py-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <PenLine className="w-5 h-5 text-violet-600" />
              Edit Prompt
            </h1>
            {workflowInfo && (
              <div className="flex items-center gap-4 text-sm mt-2">
                <span className="text-gray-600">
                  Workflow: <span className="font-medium">{workflowInfo.name}</span>
                </span>
                <span className={`px-2 py-1 rounded text-xs ${
                  workflowInfo.active 
                    ? "bg-green-100 text-green-800" 
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {workflowInfo.active ? "Active" : "Inactive"}
                </span>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPrompt}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Prompt Editing */}
        <Card className="rounded-[10px] border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Prompt Editor
            </CardTitle>
            <CardDescription>
              Edit the prompt for translation and mood analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm sm:text-base text-gray-700 font-medium">
                  Current Prompt
                </Label>
                <p className="text-xs text-gray-500">
                  This prompt handles both translation and mood analysis.
                </p>
                <textarea
                  value={originalPrompt}
                  readOnly
                  disabled
                  className="min-h-[400px] w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md font-mono text-sm resize-y cursor-not-allowed"
                />
                {!isEditing && (
                  <div className="flex justify-end">
                    <Button
                      onClick={handleEdit}
                      className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Prompt
                    </Button>
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base text-gray-700 font-medium flex items-center justify-between">
                    <span>Edit Prompt</span>
                    <div className="flex items-center gap-2">
                      {!prompt.trim().startsWith('=') && prompt.trim().length > 0 && (
                        <span className="text-xs text-amber-600">
                          ⚠️ Missing &apos;=&apos; prefix
                        </span>
                      )}
                      {hasChanges && (
                        <span className="text-xs text-amber-600">• Unsaved changes</span>
                      )}
                    </div>
                  </Label>
                  <textarea
                    value={prompt}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
                    placeholder="Enter prompt text (should start with '=')..."
                    className="min-h-[400px] w-full px-3 py-2 border border-gray-300 bg-white rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                  {hasChanges && false && (
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <span>•</span> You have unsaved changes
                    </p>
                  )}
                </div>
              )}
            </div>

            {isEditing && (
              <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={!hasChanges || isSaving}
                  className="flex items-center gap-2"
                >
                  Reset
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving}
                  className="bg-violet-600 hover:bg-violet-700 text-white flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Preview */}
        <Card className="rounded-[10px] border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Preview
            </CardTitle>
            <CardDescription>
              Preview the prompt that will be sent to AI agent
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Song Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Select Song</Label>
              <div ref={searchWrapRef} className="relative">
                <div className="relative flex items-center rounded-md border border-gray-300 shadow-sm w-full h-[40px] px-3">
                  <input
                    type="text"
                    value={songSearch}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setSongSearch(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => {
                      if (searchResults.length > 0) setShowDropdown(true);
                    }}
                    placeholder="Find song or paste YouTube link..."
                    className="flex-1 outline-none text-sm"
                  />
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                {/* Dropdown panel */}
                {showDropdown && songSearch && (
                  <div
                    role="listbox"
                    className="absolute left-0 right-0 top-full mt-2 z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-h-80 overflow-auto"
                  >
                    {searching ? (
                      <div className="text-sm text-gray-500">Searching...</div>
                    ) : searchResults.length === 0 ? (
                      <div className="text-sm text-gray-500">No results</div>
                    ) : (
                      <ul className="divide-y divide-gray-100">
                        {searchResults.slice(0, 10).map((r) => (
                          <li
                            key={r.id}
                            className="py-2 flex items-center justify-between cursor-pointer hover:bg-gray-50 px-2 rounded"
                            role="option"
                            aria-selected={selectedLyricsRecord?.id === r.id}
                            onClick={() => handleSongSelect(r)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleSongSelect(r);
                              }
                            }}
                            tabIndex={0}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">{r.trackName}</p>
                              <p className="text-xs text-[#7B61FF] truncate">{r.artistName} • {r.albumName}</p>
                            </div>
                            <span className="ml-3 text-[10px] text-gray-400 flex-shrink-0">{formatDuration(r.duration)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
              {selectedLyricsRecord && (
                <div className="text-xs text-gray-600 mt-1">
                  Selected: <span className="font-medium">{selectedLyricsRecord.trackName} - {selectedLyricsRecord.artistName}</span>
                </div>
              )}
            </div>

            {/* Language Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Source Language</Label>
                <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.name}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Target Language</Label>
                <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.name}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Mood Settings */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Mood Analysis</Label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={moodEnabled}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMoodEnabled(e.target.checked)}
                    className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
                  />
                  <span className="text-sm text-gray-700">Enable Mood Analysis</span>
                </label>
              </div>
              {moodEnabled && (
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">Top K Moods</Label>
                  <Select 
                    value={moodTopK.toString()} 
                    onValueChange={(v) => setMoodTopK(parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[3, 4, 5].map((k) => (
                        <SelectItem key={k} value={k.toString()}>
                          {k}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Preview Prompt */}
            {previewPrompt ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700">Preview Prompt</Label>
                  <Button
                    onClick={handleTestAnalysis}
                    disabled={isTesting || !selectedLyricsRecord || !selectedSongLyrics}
                    className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white"
                    size="sm"
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Test Analysis
                      </>
                    )}
                  </Button>
                </div>
                <div className="border border-gray-300 rounded-md bg-gray-50 p-4 max-h-[500px] overflow-y-auto">
                  <pre className="text-xs font-mono whitespace-pre-wrap text-gray-800">
                    {previewPrompt}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700">Preview Prompt</Label>
                  <Button
                    onClick={handleTestAnalysis}
                    disabled={isTesting || !selectedLyricsRecord || !selectedSongLyrics}
                    className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white"
                    size="sm"
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Test Analysis
                      </>
                    )}
                  </Button>
                </div>
                <div className="text-center text-gray-400 py-8 text-sm">
                  {!selectedLyricsRecord ? (
                    <p>Please select a song to preview</p>
                  ) : !selectedSongLyrics ? (
                    <p>Loading lyrics...</p>
                  ) : (
                    <p>No prompt available</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Test Results Section */}
      {(testResults || isTesting) && (
        <div ref={testResultsRef} className="mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Test Results
            {isTesting && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                <Loader2 className="w-4 h-4 inline animate-spin mr-1" />
                Processing...
              </span>
            )}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Original Result Card */}
            <Card className="rounded-[10px] border border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                  Original Prompt
                </CardTitle>
                <CardDescription>
                  Results from the current production prompt
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {isTesting ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Translation</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200 h-[200px] flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
                          <p className="text-sm text-gray-500">Processing...</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Interpretation</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200 h-[200px] flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
                          <p className="text-sm text-gray-500">Processing...</p>
                        </div>
                      </div>
                    </div>
                    {moodEnabled && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Mood Analysis</Label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200 h-[200px] flex items-center justify-center">
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
                            <p className="text-sm text-gray-500">Processing...</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : testResults ? (
                  <>
                    {/* Translation */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Translation</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200 max-h-[200px] overflow-y-auto">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">
                          {testResults.original.result.translation || "No translation"}
                        </p>
                      </div>
                    </div>

                    {/* Interpretation */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Interpretation</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200 max-h-[200px] overflow-y-auto">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">
                          {testResults.original.result.interpretation || "No interpretation"}
                        </p>
                      </div>
                    </div>

                    {/* Mood Analysis */}
                    {testResults.original.result.moodAnalyze && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Mood Analysis</Label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200 max-h-[200px] overflow-y-auto">
                          <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                            {testResults.original.result.moodAnalyze}
                          </pre>
                        </div>
                      </div>
                    )}
                  </>
                ) : null}
              </CardContent>
            </Card>

            {/* New Result Card */}
            <Card className="rounded-[10px] border border-gray-200 shadow-sm">
              <CardHeader className="bg-violet-50">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <span className="w-3 h-3 bg-violet-600 rounded-full"></span>
                  New Prompt
                </CardTitle>
                <CardDescription>
                  Results from the {isEditing ? "edited" : "test"} prompt
                  {testResults?.comparison.summary.hasChanges && (
                    <span className="ml-2 text-amber-600 font-medium">• Changes detected</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {isTesting ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Translation</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200 h-[200px] flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
                          <p className="text-sm text-gray-500">Processing...</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Interpretation</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200 h-[200px] flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
                          <p className="text-sm text-gray-500">Processing...</p>
                        </div>
                      </div>
                    </div>
                    {moodEnabled && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Mood Analysis</Label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200 h-[200px] flex items-center justify-center">
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
                            <p className="text-sm text-gray-500">Processing...</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : testResults ? (
                  <>
                    {/* Translation */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        Translation
                        {testResults.comparison.translationChanged && (
                          <span className="text-xs text-amber-600">(Changed)</span>
                        )}
                      </Label>
                      <div className={`mt-1 p-3 rounded-md border max-h-[200px] overflow-y-auto ${
                        testResults.comparison.translationChanged 
                          ? 'bg-amber-50 border-amber-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">
                          {testResults.new.result.translation || "No translation"}
                        </p>
                      </div>
                    </div>

                    {/* Interpretation */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        Interpretation
                        {testResults.comparison.interpretationChanged && (
                          <span className="text-xs text-amber-600">(Changed)</span>
                        )}
                      </Label>
                      <div className={`mt-1 p-3 rounded-md border max-h-[200px] overflow-y-auto ${
                        testResults.comparison.interpretationChanged 
                          ? 'bg-amber-50 border-amber-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">
                          {testResults.new.result.interpretation || "No interpretation"}
                        </p>
                      </div>
                    </div>

                    {/* Mood Analysis */}
                    {testResults.new.result.moodAnalyze && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          Mood Analysis
                          {testResults.comparison.moodChanged && (
                            <span className="text-xs text-amber-600">(Changed)</span>
                          )}
                        </Label>
                        <div className={`mt-1 p-3 rounded-md border max-h-[200px] overflow-y-auto ${
                          testResults.comparison.moodChanged 
                            ? 'bg-amber-50 border-amber-200' 
                            : 'bg-gray-50 border-gray-200'
                        }`}>
                          <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                            {testResults.new.result.moodAnalyze}
                          </pre>
                        </div>
                      </div>
                    )}
                  </>
                ) : null}
              </CardContent>
            </Card>
          </div>

          {/* Comparison Summary */}
          {testResults && testResults.comparison.summary.hasChanges && (
            <Card className="rounded-[10px] border border-amber-200 bg-amber-50 shadow-sm mt-6">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-amber-900 mb-1">Changes Detected</h4>
                    <ul className="text-sm text-amber-800 space-y-1">
                      {testResults.comparison.translationChanged && (
                        <li>• Translation output has changed</li>
                      )}
                      {testResults.comparison.interpretationChanged && (
                        <li>• Interpretation output has changed</li>
                      )}
                      {testResults.comparison.moodChanged && (
                        <li>• Mood analysis output has changed</li>
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
