import { AppError } from "../middleware/errorHandler";
import { ProductSearchResult, SupportedLanguage } from "../types/product";

export interface ProductSearchProvider {
  search(query: string, language: SupportedLanguage): Promise<ProductSearchResult[]>;
}

type CacheEntry = {
  expiresAt: number;
  products: ProductSearchResult[];
};

const searchCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const SEARCH_PRIMARY_TIMEOUT_MS = 8000;
const SEARCH_FALLBACK_TIMEOUT_MS = 2000;

export class OpenFoodFactsService implements ProductSearchProvider {
  private readonly searchBaseUrl = "https://search.openfoodfacts.org";
  private readonly legacyBaseUrl = process.env.OPEN_FOOD_FACTS_BASE_URL || "https://world.openfoodfacts.org";
  private readonly userAgent = process.env.OPEN_FOOD_FACTS_USER_AGENT || "NutriFindTechnicalTest/1.0";

  public async search(query: string, language: SupportedLanguage): Promise<ProductSearchResult[]> {

    const normalizedQuery = query.trim().toLocaleLowerCase();
    const cacheKey = `${language}:${normalizedQuery}`;

    const cached = searchCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.products;
    }

    let primaryFailed = false;
    let primaryError: any = null;

    try {
      const products = await this.searchPrimary(query, language);
      searchCache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, products });
      return products;
    } catch (err: any) {
      console.warn(`Primary search failed for query "${query}":`, err.message);
      primaryFailed = true;
      primaryError = err;
    }

    if (primaryFailed) {
      try {
        const products = await this.searchLegacy(query, language);
        searchCache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, products });
        return products;
      } catch (fallbackError: any) {
        console.error(`Fallback legacy search failed for query "${query}":`, fallbackError.message);
        if (primaryError?.status === 429 || fallbackError?.status === 429) {
          throw new AppError(429, "Product search rate limit reached. Please wait a moment before searching again.");
        }
        throw new AppError(503, "Product service is temporarily unavailable.");
      }
    }

    return [];
  }

  private async searchPrimary(query: string, language: SupportedLanguage): Promise<ProductSearchResult[]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SEARCH_PRIMARY_TIMEOUT_MS);
    try {
      const response = await fetch(`${this.searchBaseUrl}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": this.userAgent,
        },
        body: JSON.stringify({
          q: query,
          page: 1,
          page_size: 12,
          langs: [language],
          fields: [
            "code",
            "product_name",
            "product_name_en",
            "product_name_nl",
            "product_name_de",
            "product_name_fr",
            "brands",
            "image_front_url",
            "nutriments",
          ],
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = new Error(`SearchALicious Error: ${response.status}`);
        (error as any).status = response.status;
        throw error;
      }

      const data = await response.json();
      return (data.hits || []).map((p: any) => this.normalizeProduct(p, language));
    } finally {
      clearTimeout(timeout);
    }
  }

  private async searchLegacy(query: string, language: SupportedLanguage): Promise<ProductSearchResult[]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SEARCH_FALLBACK_TIMEOUT_MS);
    try {
      const url = `${this.legacyBaseUrl}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page=1&lc=${language}&page_size=12&fields=code,product_name,product_name_en,product_name_nl,product_name_de,product_name_fr,brands,image_url,image_front_url,nutriments`;
      const response = await fetch(url, {
        headers: {
          "User-Agent": this.userAgent,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = new Error(`Legacy API Error: ${response.status}`);
        (error as any).status = response.status;
        throw error;
      }

      const data = await response.json();
      return (data.products || []).map((p: any) => this.normalizeProduct(p, language));
    } finally {
      clearTimeout(timeout);
    }
  }

  private normalizeProduct(product: any, language: SupportedLanguage): ProductSearchResult {
    const localizedName = product[`product_name_${language}`];
    const englishName = product.product_name_en;
    const genericName = product.product_name;
    const finalName = localizedName ?? englishName ?? genericName ?? "Unnamed product";

    const id = product.code || "unknown";
    const brand = product.brands || "Unknown brand";
    const imageUrl = product.image_front_url || product.image_url || null;

    const nutriments = product.nutriments || {};
    const nutrition = {
      energyKcal: nutriments["energy-kcal_100g"] ?? null,
      fat: nutriments.fat_100g ?? null,
      carbohydrates: nutriments.carbohydrates_100g ?? null,
      sugars: nutriments.sugars_100g ?? null,
      protein: nutriments.proteins_100g ?? null,
      salt: nutriments.salt_100g ?? null,
    };

    return {
      id,
      name: finalName,
      brand,
      imageUrl,
      nutrition,
      nutritionLocked: false,
    };
  }
}
