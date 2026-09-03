"use client";

import { useState, useEffect, useRef } from "react";
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
  const [redirectingId, setRedirectingId] = useState<string | null>(null);
  const [checkoutErrorId, setCheckoutErrorId] = useState<string | null>(null);

  const searchControllerRef = useRef<AbortController | null>(null);

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
    
    searchControllerRef.current?.abort();
    const controller = new AbortController();
    searchControllerRef.current = controller;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setSearchQuery(query);

    try {
      const res = await fetch(`${API_URL}/api/products/search?q=${encodeURIComponent(query)}&lang=${lang}`, {
        signal: controller.signal
      });
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
    } catch (err: any) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return; // Ignore aborts gracefully
      }
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      if (searchControllerRef.current === controller) {
        setIsLoading(false);
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchQuery);
  };

  const handleUnlockNutrition = async (productId: string) => {
    if (redirectingId) return;

    setRedirectingId(productId);
    setCheckoutErrorId(null);
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${API_URL}/api/subscription/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal
      });
      
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
          data?.error ||
          `Checkout failed (${response.status})`
        );
      }

      if (!data?.url) {
        throw new Error("Checkout URL was not returned.");
      }

      window.location.assign(data.url);
    } catch (error) {
      // Intentionally suppressing console.error of the Error object to prevent 
      // Next.js dev server from hijacking the UI with an error overlay. 
      // The error is handled gracefully via checkoutErrorId.
      setCheckoutErrorId(productId);
    } finally {
      setRedirectingId(null);
      clearTimeout(timeout);
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
          redirectingId={redirectingId}
          checkoutErrorId={checkoutErrorId}
        />
      </main>

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}
