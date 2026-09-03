"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Search, Loader2 } from "lucide-react";

interface HeroProps {
  t: (key: string) => string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSearch: (query: string) => void;
  isSearching: boolean;
  recentSearches: string[];
  onRecentClick: (query: string) => void;
}

export function Hero({
  t,
  searchQuery,
  setSearchQuery,
  onSearch,
  isSearching,
  recentSearches,
  onRecentClick,
}: HeroProps) {
  return (
    <section className="relative px-4 pb-16 pt-16 sm:pt-20 flex flex-col items-center justify-center text-center">
      {/* Animated Background Blobs */}
      <motion.div
        animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-10 top-10 h-64 w-64 rounded-full bg-emerald-200/30 dark:bg-emerald-900/20 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ x: [0, -20, 0], y: [0, 15, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-0 top-20 h-72 w-72 rounded-full bg-lime-200/25 dark:bg-lime-900/10 blur-3xl pointer-events-none"
      />

      <div className="relative z-10 mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col items-center gap-4"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
            <span>✦</span>
            <span>{t("searchSmarter") || "Search smarter"}</span>
          </div>
          <h1 className="max-w-4xl text-center text-5xl font-semibold tracking-[-0.04em] sm:text-6xl lg:text-7xl text-zinc-900 dark:text-zinc-50">
            {t("discoverFoodTitleLine1") || "Discover what's really"}<br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
              {t("discoverFoodTitleLine2") || "in your food."}
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-center text-lg leading-8 text-zinc-500 dark:text-zinc-400">
            {t("searchSubtitle") || "Find packaged foods and explore their nutritional information."}
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onSubmit={(e) => { e.preventDefault(); onSearch(searchQuery); }}
          className="relative mx-auto flex w-full max-w-2xl items-center rounded-2xl bg-white p-2 shadow-sm border border-zinc-200 dark:bg-zinc-900/80 dark:border-zinc-800 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all"
        >
          <div className="pl-4 pr-2 text-zinc-400">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchPlaceholder") || "Search packaged foods..."}
            className="flex-1 bg-transparent py-3 px-2 outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
          />
          <button
            disabled={isSearching}
            className="flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white shadow-sm transition-all hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-70 disabled:hover:bg-emerald-600"
          >
            {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : (t("searchButton") || "Search")}
          </button>
        </motion.form>

        {/* Recent Searches */}
        {(recentSearches || []).length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-500 dark:text-zinc-400"
          >
            <span className="font-medium">{t("recentSearches")}:</span>
            {recentSearches.map((query, i) => (
              <button
                key={i}
                disabled={isSearching}
                onClick={() => onRecentClick(query)}
                className="flex items-center gap-1.5 rounded-full border border-black/5 dark:border-white/5 bg-white dark:bg-zinc-800 px-3 py-1.5 transition-colors hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:border-emerald-500/50 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50 disabled:pointer-events-none"
                aria-label={`Search again for ${query}`}
              >
                <span className="text-[10px]">🔍</span>
                {query.charAt(0).toUpperCase() + query.slice(1)}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
