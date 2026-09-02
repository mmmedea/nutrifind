"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Lock, ArrowRight, Image as ImageIcon } from "lucide-react";
import { ProductSearchResult } from "../types";

interface ProductCardProps {
  product: ProductSearchResult;
  t: (key: string) => string;
  onViewDetails: (product: ProductSearchResult) => void;
  onUnlock: () => void;
}

export function ProductCard({ product, t, onViewDetails, onUnlock }: ProductCardProps) {
  const isLocked = product.nutritionLocked;

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-black/5 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-sm transition-shadow hover:shadow-xl dark:hover:shadow-black/40"
    >
      {/* Image Area */}
      <div className="flex aspect-square items-center justify-center bg-neutral-50 dark:bg-zinc-950 p-6">
        {product.imageUrl ? (
          // Using regular img tag as per generic requirements unless Next/Image is specifically configured for Open Food Facts
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-700">
            <ImageIcon className="h-12 w-12 mb-2" />
            <span className="text-xs uppercase font-medium tracking-wider">No Image</span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-lg font-bold leading-snug text-zinc-900 dark:text-zinc-50">
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {product.brand || "Unknown Brand"}
        </p>

        <div className="mt-auto pt-6">
          {isLocked ? (
            <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 p-4 border border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 mb-3 text-amber-600 dark:text-amber-500 font-semibold text-sm">
                <Lock className="h-4 w-4" />
                <span>{t("detailedNutrition") || "Detailed Nutrition"}</span>
              </div>
              
              {/* Fake Decorative Placeholders */}
              <div className="space-y-2 opacity-50 select-none mb-4" aria-hidden="true">
                <div className="h-2.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                  <div className="h-full w-3/4 bg-zinc-300 dark:bg-zinc-600 rounded-full" />
                </div>
                <div className="h-2.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                  <div className="h-full w-1/2 bg-zinc-300 dark:bg-zinc-600 rounded-full" />
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onUnlock();
                }}
                className="w-full rounded-xl bg-zinc-900 dark:bg-white py-2.5 text-sm font-medium text-white dark:text-zinc-900 transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
              >
                {t("unlockNutrition")}
              </motion.button>
            </div>
          ) : (
            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 p-4 border border-emerald-100 dark:border-emerald-900/50">
              <div className="flex items-center gap-2 mb-3 text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Nutrition available</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <div className="text-zinc-500 dark:text-zinc-400 text-xs">Energy</div>
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">
                    {product.nutrition?.energyKcal ? `${product.nutrition.energyKcal} kcal` : "-"}
                  </div>
                </div>
                <div>
                  <div className="text-zinc-500 dark:text-zinc-400 text-xs">Fat</div>
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">
                    {product.nutrition?.fat ? `${product.nutrition.fat}g` : "-"}
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
