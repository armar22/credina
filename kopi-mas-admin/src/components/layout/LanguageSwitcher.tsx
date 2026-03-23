"use client";

import { Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "id" : "en");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full"
      onClick={toggleLanguage}
      aria-label="Toggle Language"
      title={language === "en" ? "Switch to Indonesian" : "Switch to English"}
    >
      <Globe className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">{language === "en" ? "English" : "Bahasa Indonesia"}</span>
    </Button>
  );
}
