"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { SearchX, AlertTriangle } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { ProductSearchResult } from "../types";

interface ProductListProps {
  products: ProductSearchResult[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  t: (key: string) => string;
  onViewDetails: (product: ProductSearchResult) => void;
  onUnlock: () => void;
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
}: ProductListProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24">
      <AnimatePresence mode="wait">
        {isLoading && (
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

        {!isLoading && error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="mb-4 rounded-full bg-red-100 dark:bg-red-950/50 p-4 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{t("errorTitle") || "Search temporarily unavailable"}</h3>
            <p className="mt-2 max-w-md text-zinc-500 dark:text-zinc-400">{error}</p>
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
            <div className="mb-4 text-5xl">🥗</div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Ready to explore?</h3>
            <p className="mt-2 max-w-md text-zinc-500 dark:text-zinc-400">
              Search for a packaged food above to see products from around the world.
            </p>
          </motion.div>
        )}

        {!isLoading && !error && products.length > 0 && (
          <motion.div
            key="results"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {products.map((product) => (
              <motion.div key={product.id} variants={itemVariants}>
                <ProductCard
                  product={product}
                  t={t}
                  onViewDetails={onViewDetails}
                  onUnlock={onUnlock}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
