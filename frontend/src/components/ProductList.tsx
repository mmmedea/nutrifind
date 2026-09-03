"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { SearchX, AlertTriangle, RefreshCw, Search } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { ProductSearchResult } from "../types";

interface ProductListProps {
  products: ProductSearchResult[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  t: (key: string) => string;
  onViewDetails: (product: ProductSearchResult) => void;
  onUnlock: (productId: string) => void;
  onRetry: () => void;
  redirectingId: string | null;
  checkoutErrorId: string | null;
}

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

export function ProductList({
  products,
  isLoading,
  error,
  hasSearched,
  t,
  onViewDetails,
  onUnlock,
  onRetry,
  redirectingId,
  checkoutErrorId,
}: ProductListProps) {
  const showInitialSkeleton = isLoading && products.length === 0;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24">
      <AnimatePresence mode="wait">
        {showInitialSkeleton && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex h-[400px] flex-col rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-zinc-900 p-2">
                <div className="aspect-square rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                <div className="mt-4 px-4 pb-4 space-y-3">
                  <div className="h-5 w-3/4 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                  <div className="h-4 w-1/2 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                  <div className="mt-8 h-32 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {!isLoading && error && products.length === 0 && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-auto mt-12 max-w-lg rounded-3xl border border-red-500/10 bg-red-500/[0.03] px-8 py-10 text-center flex flex-col items-center"
          >
            <div className="mb-5 text-red-500/80 dark:text-red-400/80">
              <AlertTriangle className="h-8 w-8" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
               {error === "Product search rate limit reached. Please wait a moment before searching again." ? t('searchLimitReached') : (t("errorTitle") || "Search is temporarily unavailable")}
            </h3>
            <p className="mt-3 max-w-sm text-zinc-500 dark:text-zinc-400">
              {error === "Product search rate limit reached. Please wait a moment before searching again."
                ? t("rateLimitDetail")
                : error === "Product service is temporarily unavailable."
                ? (t("serviceUnavailable") || "We couldn't reach the product database right now. Please try again in a moment.")
                : error}
            </p>
            <button
              onClick={onRetry}
              className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800 active:scale-[0.98]"
            >
              <RefreshCw className="h-4 w-4" />
              {t("tryAgain") || "Try again"}
            </button>
          </motion.div>
        )}

        {!isLoading && !error && hasSearched && products.length === 0 && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="mb-4 rounded-full bg-zinc-100 dark:bg-zinc-800 p-4 text-zinc-400">
              <SearchX className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{t("noProductsFound") || "No products found"}</h3>
            <p className="mt-2 max-w-md text-zinc-500 dark:text-zinc-400">
              {t("tryAnotherSearch") || "We couldn't find anything matching your search. Try another product or brand."}
            </p>
          </motion.div>
        )}

        {!isLoading && !error && !hasSearched && (
          <motion.div
            key="initial"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="mb-4 rounded-full bg-zinc-100 dark:bg-zinc-800 p-4 text-zinc-400">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{t('readyToExplore') || "Ready to explore?"}</h3>
          <p className="mt-2 max-w-md text-zinc-500 dark:text-zinc-400">
            {t('searchPrompt') || "Search for a packaged food above to see products from around the world."}
          </p>
          </motion.div>
        )}

        {products.length > 0 && (
          <motion.div
            key="results"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {error && (
              <div className="mb-8 mx-auto max-w-xl flex items-center justify-between rounded-2xl border border-red-500/10 bg-red-500/[0.03] px-6 py-4">
                <div className="flex items-center gap-3 text-red-500/80">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                     {t('refreshError') || "Couldn't refresh results. Showing your previous results."}
                  </span>
                </div>
                <button onClick={onRetry} className="text-sm font-medium hover:underline flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                  {t('retry') || "Retry"}
                </button>
              </div>
            )}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <motion.div key={product.id} variants={itemVariants} className="h-full">
                  <ProductCard
                    product={product}
                    t={t}
                    onViewDetails={onViewDetails}
                    onUnlock={() => onUnlock(product.id)}
                    isRedirecting={redirectingId === product.id}
                    checkoutError={checkoutErrorId === product.id}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
