"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "../hooks/useTranslation";
import { ProductSearchResult, SupportedLanguage } from "../types";

export default function Home() {
  const { t, lang, setLang } = useTranslation("en");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductSearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadRecentSearches = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/searches/recent`);
      if (res.ok) {
        const data = await res.json();
        setRecentSearches(data.searches || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadRecentSearches();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get("success") === "true") {
        setSuccessMsg("Subscription successful! Nutrition unlocked.");
      } else if (params.get("canceled") === "true") {
        setError("Subscription canceled.");
      }
    }
  }, []);

  const handleSearch = async (e?: React.FormEvent, overrideQuery?: string) => {
    if (e) e.preventDefault();
    const searchQuery = overrideQuery || query;
    if (searchQuery.trim().length < 2) return;

    if (overrideQuery) setQuery(overrideQuery);

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/search?q=${encodeURIComponent(searchQuery)}&lang=${lang}`);
      if (!res.ok) throw new Error(t("error"));
      const data = await res.json();
      setResults(data.products || []);
      loadRecentSearches(); // refresh after new search
    } catch (err: any) {
      setError(err.message || t("error"));
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLang(e.target.value as SupportedLanguage);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-green-600">NutriFind</h1>
          <form onSubmit={handleSearch} className="flex w-full sm:max-w-md">
            <input 
              type="text" 
              placeholder={t("searchPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button 
              type="submit" 
              disabled={loading || query.length < 2}
              className="bg-green-600 text-white px-6 py-2 rounded-r-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "..." : t("search")}
            </button>
          </form>
          <select 
            value={lang} 
            onChange={handleLanguageChange}
            className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm"
          >
            <option value="en">English</option>
            <option value="nl">Nederlands</option>
            <option value="de">Deutsch</option>
            <option value="fr">Français</option>
          </select>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar: Recent Searches */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h2 className="font-semibold text-gray-800 mb-4">{t("recentSearches")}</h2>
            {recentSearches.length > 0 ? (
              <ul className="space-y-2">
                {recentSearches.map((search) => (
                  <li key={search.id}>
                    <button 
                      onClick={() => handleSearch(undefined, search.query)}
                      className="text-left w-full text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 px-2 py-1 rounded transition-colors truncate"
                    >
                      {search.query} <span className="text-gray-400 text-xs">({search.language})</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No recent searches</p>
            )}
          </div>
        </aside>

        {/* Main Content: Results */}
        <div className="flex-1">
          {successMsg && (
            <div className="bg-green-100 text-green-800 border border-green-300 p-4 rounded-md mb-6 shadow-sm">
              {successMsg}
            </div>
          )}
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
              {error}
            </div>
          )}

        {results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((product) => (
              <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="h-48 bg-gray-100 relative">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain p-2" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg mb-1 truncate" title={product.name}>{product.name}</h3>
                  <p className="text-gray-500 text-sm mb-4">{product.brand}</p>
                  
                  <div className="mt-auto">
                    {product.nutritionLocked ? (
                      <div className="bg-gray-50 border border-dashed border-gray-300 rounded p-4 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <p className="text-sm text-gray-600 whitespace-pre-line mb-3">{t("upgradeMessage")}</p>
                        <button 
                          onClick={async () => {
                            try {
                              const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscription/checkout`, { method: "POST" });
                              const data = await res.json();
                              if (data.url) window.location.href = data.url;
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                          className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold py-2 px-4 rounded text-sm transition-colors"
                        >
                          {t("unlockNutrition")}
                        </button>
                      </div>
                    ) : (
                      <div className="bg-green-50 border border-green-100 rounded p-3">
                        <h4 className="text-xs font-semibold text-green-800 uppercase tracking-wide mb-2">{t("nutritionPer100g")}</h4>
                        <ul className="text-sm space-y-1 text-gray-700">
                          <li className="flex justify-between"><span>{t("energy")}:</span> <strong>{product.nutrition?.energyKcal ?? '-'} kcal</strong></li>
                          <li className="flex justify-between"><span>{t("fat")}:</span> <strong>{product.nutrition?.fat ?? '-'} g</strong></li>
                          <li className="flex justify-between"><span>{t("carbohydrates")}:</span> <strong>{product.nutrition?.carbohydrates ?? '-'} g</strong></li>
                          <li className="flex justify-between"><span>{t("sugars")}:</span> <strong>{product.nutrition?.sugars ?? '-'} g</strong></li>
                          <li className="flex justify-between"><span>{t("protein")}:</span> <strong>{product.nutrition?.protein ?? '-'} g</strong></li>
                          <li className="flex justify-between"><span>{t("salt")}:</span> <strong>{product.nutrition?.salt ?? '-'} g</strong></li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading && query.length >= 2 && !error && (
            <div className="text-center text-gray-500 mt-12 py-12 bg-white rounded-lg border border-dashed border-gray-300">
              <p className="text-xl">{t("noProducts")}</p>
            </div>
          )
        )}
        </div>
      </main>
    </div>
  );
}
