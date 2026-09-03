"use client";

import * as React from "react";
import { motion } from "motion/react";
import { useTranslation } from "../hooks/useTranslation";
import { ThemeToggle } from "./ThemeToggle";
import { SupportedLanguage } from "../types";

interface HeaderProps {
  lang: SupportedLanguage;
  setLang: (lang: SupportedLanguage) => void;
  subscriptionStatus: "ACTIVE" | "INACTIVE";
}

const languages: SupportedLanguage[] = ["en", "nl", "de", "fr"];

export function Header({ lang, setLang, subscriptionStatus }: HeaderProps) {
  const { t } = useTranslation();
  return (

    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-white/80 dark:bg-zinc-950/80 px-6 py-3 backdrop-blur-xl"
    >
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <span className="text-2xl">🥑</span>
          <span>NutriFind</span>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <div className="flex items-center rounded-full bg-black/5 dark:bg-white/5 p-1">
          {languages.map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className="relative px-3 py-1.5 text-sm font-medium transition-colors"
            >
              {lang === l && (
                <motion.div
                  layoutId="active-language"
                  className="absolute inset-0 rounded-full bg-white dark:bg-zinc-800 shadow-sm"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className={`relative z-10 ${lang === l ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"}`}>
                {l.toUpperCase()}
              </span>
            </button>
          ))}
        </div>

        {subscriptionStatus === "ACTIVE" && (
          <div className="flex items-center gap-1.5 text-sm font-medium text-amber-600 dark:text-amber-400">
            <span>◇</span>
            <span>{t('premium')}</span>
          </div>
        )}

        <ThemeToggle />
      </div>
    </motion.header>
  );
}
