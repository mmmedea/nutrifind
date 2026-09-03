"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Lock, ArrowRight, ImageOff, Loader2 } from "lucide-react";
import { ProductSearchResult } from "../types";

interface ProductCardProps {
  product: ProductSearchResult;
  t: (key: string) => string;
  onViewDetails: (product: ProductSearchResult) => void;
  onUnlock: () => void;
  isRedirecting?: boolean;
  checkoutError?: boolean;
}

export function ProductCard({ product, t, onViewDetails, onUnlock, isRedirecting, checkoutError }: ProductCardProps) {
  const isLocked = product.nutritionLocked;
  const [imageError, setImageError] = React.useState(false);

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-black/5 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm transition-shadow hover:shadow-xl dark:hover:shadow-black/40"
    >
      {/* Image Area */}
      <div className="relative flex h-40 shrink-0 sm:h-44 items-center justify-center overflow-hidden bg-neutral-50 dark:bg-zinc-950 p-4">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-700">
           <ImageOff className="h-10 w-10 mb-2 opacity-50" />
        </div>
        {product.imageUrl && !imageError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            onError={() => setImageError(true)}
            className="relative z-10 h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="relative z-10 flex h-full w-full flex-col items-center justify-center bg-neutral-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-600">
            <ImageOff className="h-8 w-8" />
            <span className="mt-2 text-xs">No product image</span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 min-h-[3.5rem] text-xl font-semibold leading-7 text-zinc-900 dark:text-zinc-50">
          {product.name}
        </h3>
        <p className="mt-1 truncate text-sm text-zinc-500 dark:text-zinc-400">
          {product.brand || "Brand unavailable"}
        </p>

        <div className="mt-auto pt-6">
          {isLocked ? (
            <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.035] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-400">
                <Lock className="h-4 w-4" />
                {t("detailedNutrition") || "Detailed Nutrition"}
              </div>
              
              {/* Fake Decorative Placeholders */}
              <div className="mt-4 space-y-2 select-none" aria-hidden="true">
                <div className="h-2.5 w-full rounded-full bg-zinc-200/70 dark:bg-zinc-700/70 overflow-hidden">
                  <div className="h-full w-3/4 rounded-full bg-zinc-300/50 dark:bg-zinc-600/50" />
                </div>
                <div className="h-2.5 w-full rounded-full bg-zinc-200/70 dark:bg-zinc-700/70 overflow-hidden">
                  <div className="h-full w-1/2 rounded-full bg-zinc-300/50 dark:bg-zinc-600/50" />
                </div>
              </div>
              
              <button
                disabled={isRedirecting}
                onClick={(e) => {
                  e.stopPropagation();
                  onUnlock();
                }}
                className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-500 font-semibold text-white dark:text-zinc-950 transition hover:bg-amber-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isRedirecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Preparing checkout...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    {t("unlockNutrition") || "Unlock Nutrition"}
                  </>
                )}
              </button>

              {checkoutError && (
                <div role="alert" className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500 dark:text-red-400 text-center">
                  {"We couldn't start checkout."}<br/>Please try again.
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30 p-4">
              <div className="flex items-center gap-2 mb-3 text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Nutrition available</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <div className="text-zinc-500 dark:text-zinc-400 text-xs">Energy</div>
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">
                    {product.nutrition?.energyKcal !== undefined && product.nutrition?.energyKcal !== null ? `${product.nutrition.energyKcal} kcal` : "-"}
                  </div>
                </div>
                <div>
                  <div className="text-zinc-500 dark:text-zinc-400 text-xs">Fat</div>
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">
                    {product.nutrition?.fat !== undefined && product.nutrition?.fat !== null ? `${product.nutrition.fat}g` : "-"}
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ x: 2 }}
                onClick={() => onViewDetails(product)}
                className="group/btn flex w-full items-center justify-between text-sm font-medium text-emerald-700 dark:text-emerald-400"
              >
                <span>View details</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
