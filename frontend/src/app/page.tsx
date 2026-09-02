"use client";

import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { ProductList } from "../components/ProductList";
import { ProductModal } from "../components/ProductModal";
import { useTranslation } from "../hooks/useTranslation";
import { ProductSearchResult } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function Home() {
  const { t, lang, setLang } = useTranslation("en");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<ProductSearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [selectedProduct, setSelectedProduct] = useState<ProductSearchResult | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<"ACTIVE" | "INACTIVE">("INACTIVE");
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    fetchRecentSearches();
    // In a real app with auth, we'd fetch the user's subscription status on load here as well
  }, []);

  const fetchRecentSearches = async () => {
    try {
      const res = await fetch(`${API_URL}/api/searches/recent`);
      if (res.ok) {
        const data = await res.json();
        if (data.searches) {
          const queries = Array.from(new Set<string>(data.searches.map((s: { query: string }) => s.query)));
          setRecentSearches(queries);
        } else {
          setRecentSearches([]);
        }
      }
    } catch (err) {
      console.error("Failed to load recent searches", err);
    }
  };

  const executeSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setSearchQuery(query);

    try {
      const res = await fetch(`${API_URL}/api/products/search?q=${encodeURIComponent(query)}&lang=${lang}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to search products");
      }
      
      setProducts(data.products || []);
      
      // Update subscription status based on what the backend detected
      if (data.subscriptionStatus) {
        setSubscriptionStatus(data.subscriptionStatus);
      }
      
      fetchRecentSearches();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchQuery);
  };

  const handleUnlockNutrition = async () => {
    setIsRedirecting(true);
    try {
      const res = await fetch(`${API_URL}/api/subscription/checkout`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout failed:", err);
      setIsRedirecting(false);
    }
  };

  return (
    <>
      <div className="pointer-events-none absolute inset-0 hidden dark:block bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.08),transparent_35%)] z-0" />
      <Header 
        lang={lang} 
        setLang={setLang} 
        subscriptionStatus={subscriptionStatus} 
      />
      
      <main className="flex-1 relative z-10">
        <Hero
          t={t}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearch={handleSearch}
          isSearching={isLoading}
          recentSearches={recentSearches}
          onRecentClick={executeSearch}
        />

        <ProductList
          products={products}
          isLoading={isLoading}
          error={error}
          hasSearched={hasSearched}
          t={t}
          onViewDetails={setSelectedProduct}
          onUnlock={handleUnlockNutrition}
          onRetry={() => executeSearch(searchQuery)}
        />
      </main>

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Redirect Overlay */}
      {isRedirecting && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600 dark:border-emerald-900 dark:border-t-emerald-500" />
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Preparing secure checkout...</h2>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">Redirecting to Stripe</p>
        </div>
      )}
    </>
  );
}
