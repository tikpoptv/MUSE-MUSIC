import { useState } from "react";

export function useEditPrompt() {

  const [form, setForm] = useState({
    currentPrompt: "",
    mood: "",
    newPrompt: "",
    translation: "",
  });


  const [languages, setLanguages] = useState({
    current: "Go! - Cortis",
    mood: "Go! - Cortis",
    new: "Go! - Cortis",
    translation: "Go! - Cortis",
  });


  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleLanguageChange = (key: keyof typeof languages, value: string) => {
    setLanguages((prev) => ({ ...prev, [key]: value }));
  };

  const handleAnalyze = (type: keyof typeof form) => {
    alert(`Analyzing ${type}: ${form[type]}`);
  };

  return {
    form,
    languages,
    handleChange,
    handleLanguageChange,
    handleAnalyze,
  };
}
