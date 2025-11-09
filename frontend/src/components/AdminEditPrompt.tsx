"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/invite";
import { Input } from "@/components/ui/fillin";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PenLine } from "lucide-react";

export default function EditPromptPanel() {
  const [form, setForm] = useState({
    currentPrompt: "",
    mood: "",
    newPrompt: "",
    translation: "",
    language: "Go! - Cortis",
  });

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAnalyze = (type: string) => {
    alert(`Analyzing ${type}: ${form[type as keyof typeof form]}`);
  };

  return (
    
    <div className=" px-8 sm:px-12 lg:px-16 w-full max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2 text-violet-600 mb-6">
        <PenLine className="w-5 h-5" /> Edit Prompt 
      </h2>

      {/* CURRENT PROMPT */}
      <Card className="mb-6">
        <CardContent className="space-y-4 pt-6">
          <div>
            <Label className="text-sm text-gray-700">Current Prompt</Label>
            <div className="boarder flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-1">
              <div className="flex-1 relative">
    
                <Input
                  placeholder="Edit current prompt..."
                  value={form.currentPrompt}
                  onChange={(e) => handleChange("currentPrompt", e.target.value)}
                />
                <PenLine className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>

              <Select
                onValueChange={(v) => handleChange("language", v)}
                value={form.language}
              >
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Go! - Cortis">Go! - Cortis</SelectItem>
                  <SelectItem value="EN - Thai">EN - Thai</SelectItem>
                  <SelectItem value="JP - EN">JP - EN</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={() => handleAnalyze("currentPrompt")}
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                Try Analyze
              </Button>
            </div>
          </div>

          {/* MOOD */}
          <div>
            <Label className="text-sm text-gray-700">Mood</Label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-1">
              <div className="flex-1 relative">
                <Input
                  placeholder="Edit mood prompt..."
                  value={form.mood}
                  onChange={(e) => handleChange("mood", e.target.value)}
                />
                <PenLine className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>

              <Select
                onValueChange={(v) => handleChange("language", v)}
                value={form.language}
              >
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GoI - Cortis">Go! - Cortis</SelectItem>
                  <SelectItem value="EN - Thai">EN - Thai</SelectItem>
                  <SelectItem value="JP - EN">JP - EN</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={() => handleAnalyze("mood")}
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                Try Analyze
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NEW PROMPT */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div>
            <Label className="text-sm text-gray-700">New Prompt</Label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-1">
              <Input
                placeholder="Enter new prompt..."
                value={form.newPrompt}
                onChange={(e) => handleChange("newPrompt", e.target.value)}
              />

              <Select
                onValueChange={(v) => handleChange("language", v)}
                value={form.language}
              >
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GoI - Cortis">Go! - Cortis</SelectItem>
                  <SelectItem value="EN - Thai">EN - Thai</SelectItem>
                  <SelectItem value="JP - EN">JP - EN</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={() => handleAnalyze("newPrompt")}
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                Try Analyze
              </Button>
            </div>
          </div>

          {/* TRANSLATION */}
          <div>
            <Label className="text-sm text-gray-700">Translation</Label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-1">
              <Input
                placeholder="Enter new translation..."
                value={form.translation}
                onChange={(e) => handleChange("translation", e.target.value)}
              />

              <Select
                onValueChange={(v) => handleChange("language", v)}
                value={form.language}
              >
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GoI - Cortis">Go! - Cortis</SelectItem>
                  <SelectItem value="EN - Thai">EN - Thai</SelectItem>
                  <SelectItem value="JP - EN">JP - EN</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={() => handleAnalyze("translation")}
                className="bg-violet-600 hover:bg-violet-700 text-white"
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
