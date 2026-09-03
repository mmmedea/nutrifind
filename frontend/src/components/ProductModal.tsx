"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Image as ImageIcon } from "lucide-react";
import { ProductSearchResult } from "../types";

interface ProductModalProps {
  product: ProductSearchResult | null;
  onClose: () => void;
  t: (key: string) => string;
}

export function ProductModal({ product, onClose, t }: ProductModalProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (product) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent background scroll
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [product, onClose]);

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-[70] w-full max-w-md bg-white dark:bg-zinc-950 shadow-2xl overflow-y-auto border-l border-zinc-200 dark:border-zinc-800"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 px-6 py-4 backdrop-blur-md">
              <h2 id="modal-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {product.name}
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex aspect-square items-center justify-center rounded-2xl bg-neutral-50 dark:bg-zinc-900 p-8 mb-6 border border-zinc-100 dark:border-zinc-800">
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <ImageIcon className="h-16 w-16 text-zinc-300 dark:text-zinc-700" />
                )}
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{product.name}</h3>
                <p className="text-lg text-zinc-500 dark:text-zinc-400">{product.brand || t('brandUnavailable')}</p>
              </div>

              {!product.nutritionLocked && product.nutrition && (
                <div>
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                    {t("nutritionPer100g")}
                  </h4>
                  
                  <div className="space-y-4">
                    <NutritionRow label={t("energy")} value={product.nutrition.energyKcal} unit="kcal" max={800} />
                    <NutritionRow label={t("protein")} value={product.nutrition.protein} unit="g" max={50} />
                    <NutritionRow label={t("fat")} value={product.nutrition.fat} unit="g" max={100} />
                    <NutritionRow label={t("carbohydrates")} value={product.nutrition.carbohydrates} unit="g" max={100} />
                    <NutritionRow label={t("sugars")} value={product.nutrition.sugars} unit="g" max={100} />
                    <NutritionRow label={t("salt")} value={product.nutrition.salt} unit="g" max={5} />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function NutritionRow({ label, value, unit, max }: { label: string, value: number | null, unit: string, max: number }) {
  if (value === null || value === undefined) return null;
  
  // Calculate percentage for the visual bar, cap at 100%, minimum 0%
  const percentage = Math.max(0, Math.min((value / max) * 100, 100));
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
        <span className="font-bold text-zinc-900 dark:text-zinc-100">{value} {unit}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="h-full rounded-full bg-emerald-500 dark:bg-emerald-600"
        />
      </div>
    </div>
  );
}
