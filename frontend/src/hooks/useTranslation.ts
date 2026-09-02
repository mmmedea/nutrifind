import { useState } from "react";
import en from "../messages/en.json";
import nl from "../messages/nl.json";
import de from "../messages/de.json";
import fr from "../messages/fr.json";
import { SupportedLanguage } from "../types";

const dictionaries: Record<SupportedLanguage, typeof en> = { en, nl, de, fr };

export function useTranslation(defaultLang: SupportedLanguage = "en") {
  const [lang, setLang] = useState<SupportedLanguage>(defaultLang);

  const t = (key: keyof typeof en) => {
    return dictionaries[lang][key] || dictionaries["en"][key] || key;
  };

  return { t, lang, setLang };
}
