"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/invite";
import { Input } from "@/components/ui/editprompt";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PenLine } from "lucide-react";

import { useEditPrompt } from "@/components/state/useEditPrompt";

export default function EditPromptPanel() {
 {/* Edit Prompt */}
  const {
    form,
    languages,
    handleChange,
    handleLanguageChange,
    handleAnalyze,
  } = useEditPrompt();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 lg:px-16 py-6 w-full">
      {/* CARD 1 — Current Prompt */}
      <Card className="mb-4 rounded-[10px] border border-gray-200 shadow-sm">
        <CardContent className="space-y-8 px-4 sm:px-8 py-5">
          {/* Current Prompt */}
          <div>
            <Label className="text-sm sm:text-base text-gray-700">Current Prompt</Label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-2">
              <div className="flex-1 relative">
                <Input
                  placeholder="Edit current prompt..."
                  value={form.currentPrompt}
                  onChange={(e) => handleChange("currentPrompt", e.target.value)}
                  className="pr-10 h-[42px]"
                />
                <PenLine className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
              </div>

              <Select
                onValueChange={(v) => handleLanguageChange("current", v)}
                value={languages.current}
              >
                <SelectTrigger className="w-full sm:w-[170px] h-[42px] border-[rgba(187,180,221,0.7)]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Go! - Cortis">Go! - Cortis</SelectItem>
                  <SelectItem value="EN - Thai">EN - Thai</SelectItem>
                  <SelectItem value="JP - EN">JP - EN</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center sm:justify-end w-full sm:w-auto mt-3 sm:mt-1 sm:relative sm:top-[8px]">
              <Button
                onClick={() => handleAnalyze("currentPrompt")}
                className="bg-violet-600 hover:bg-violet-700 text-white w-full sm:w-[155px] h-[38px] text-sm rounded-md"
              >
                Try Analyze
              </Button>
            </div>
          </div>

          {/* Mood */}
          <div>
            <Label className="text-sm sm:text-base text-gray-700">Mood</Label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-2">
              <div className="flex-1 relative">
                <Input
                  placeholder="Edit mood prompt..."
                  value={form.mood}
                  onChange={(e) => handleChange("mood", e.target.value)}
                  className="pr-10 h-[42px]"
                />
                <PenLine className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
              </div>

              <Select
                onValueChange={(v) => handleLanguageChange("mood", v)}
                value={languages.mood}
              >
                <SelectTrigger className="w-full sm:w-[170px] h-[42px] border-[rgba(187,180,221,0.7)]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Go! - Cortis">Go! - Cortis</SelectItem>
                  <SelectItem value="EN - Thai">EN - Thai</SelectItem>
                  <SelectItem value="JP - EN">JP - EN</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center sm:justify-end w-full sm:w-auto mt-3 sm:mt-1 sm:relative sm:top-[8px]">
              <Button
                onClick={() => handleAnalyze("mood")}
                className="bg-violet-600 hover:bg-violet-700 text-white w-full sm:w-[155px] h-[38px] text-sm rounded-md"
              >
                Try Analyze
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CARD 2 — New Prompt & Translation */}
      <Card className="rounded-[10px] border border-gray-200 shadow-sm">
        <CardContent className="space-y-8 px-4 sm:px-8 py-5">
          {/* New Prompt */}
          <div>
            <Label className="text-sm sm:text-base text-gray-700">New Prompt</Label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-2">
              <div className="flex-1 relative">
                <Input
                  placeholder="Enter new prompt..."
                  value={form.newPrompt}
                  onChange={(e) => handleChange("newPrompt", e.target.value)}
                  className="pr-10 h-[42px]"
                />
                <PenLine className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
              </div>

              <Select
                onValueChange={(v) => handleLanguageChange("new", v)}
                value={languages.new}
              >
                <SelectTrigger className="w-full sm:w-[170px] h-[42px] border-[rgba(187,180,221,0.7)]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Go! - Cortis">Go! - Cortis</SelectItem>
                  <SelectItem value="EN - Thai">EN - Thai</SelectItem>
                  <SelectItem value="JP - EN">JP - EN</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center sm:justify-end w-full sm:w-auto mt-3 sm:mt-1 sm:relative sm:top-[8px]">
              <Button
                onClick={() => handleAnalyze("newPrompt")}
                className="bg-violet-600 hover:bg-violet-700 text-white w-full sm:w-[155px] h-[38px] text-sm rounded-md"
              >
                Try Analyze
              </Button>
            </div>
          </div>

          {/* Translation */}
          <div>
            <Label className="text-sm sm:text-base text-gray-700">Translation</Label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-2">
              <div className="flex-1 relative">
                <Input
                  placeholder="Enter translation..."
                  value={form.translation}
                  onChange={(e) => handleChange("translation", e.target.value)}
                  className="pr-10 h-[42px]"
                />
                <PenLine className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
              </div>

              <Select
                onValueChange={(v) => handleLanguageChange("translation", v)}
                value={languages.translation}
              >
                <SelectTrigger className="w-full sm:w-[170px] h-[42px] border-[rgba(187,180,221,0.7)]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Go! - Cortis">Go! - Cortis</SelectItem>
                  <SelectItem value="EN - Thai">EN - Thai</SelectItem>
                  <SelectItem value="JP - EN">JP - EN</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center sm:justify-end w-full sm:w-auto mt-3 sm:mt-1 sm:relative sm:top-[8px]">
              <Button
                onClick={() => handleAnalyze("translation")}
                className="bg-violet-600 hover:bg-violet-700 text-white w-full sm:w-[155px] h-[38px] text-sm rounded-md"
              >
                Try Analyze
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
