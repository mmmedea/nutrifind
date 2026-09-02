import axios from "axios";
import { AppError } from "../middleware/errorHandler";
import { ProductSearchResult, SupportedLanguage } from "../types/product";

export interface ProductSearchProvider {
  search(query: string, language: SupportedLanguage): Promise<ProductSearchResult[]>;
}

export class OpenFoodFactsService implements ProductSearchProvider {
  private readonly baseUrl = process.env.OPEN_FOOD_FACTS_BASE_URL || "https://world.openfoodfacts.org";
  private readonly userAgent = process.env.OPEN_FOOD_FACTS_USER_AGENT || "NutriFindTechnicalTest/1.0";

  public async search(query: string, language: SupportedLanguage): Promise<ProductSearchResult[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/cgi/search.pl`, {
        params: {
          search_terms: query,
          search_simple: 1,
          action: "process",
          json: 1,
          page_size: 20,
          // Limit fields returned by the API for efficiency
          fields: `code,product_name,product_name_en,product_name_nl,product_name_de,product_name_fr,brands,image_url,nutriments`
        },
        headers: {
          "User-Agent": this.userAgent
        }
      });

      const products = response.data.products || [];
      
      return products.map((p: any) => this.normalizeProduct(p, language));
    } catch (error: any) {
      console.error("OpenFoodFacts search error:", error.message);
      if (error.response?.status === 503) {
        throw new AppError(503, "Product service is temporarily unavailable.");
      }
      throw new AppError(500, "Failed to fetch products from Open Food Facts");
    }
  }

  private normalizeProduct(product: any, language: SupportedLanguage): ProductSearchResult {
    // 1. Resolve localized name with deterministic fallback
    const localizedName = product[`product_name_${language}`];
    const englishName = product.product_name_en;
    const genericName = product.product_name;
    const finalName = localizedName ?? englishName ?? genericName ?? "Unnamed product";

    // 2. Extract basic fields
    const id = product.code || "unknown";
    const brand = product.brands || "Unknown brand";
    const imageUrl = product.image_url || null;

    // 3. Extract nutrition (we always map it here, but it will be stripped later for non-subscribers)
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
      nutritionLocked: false, // Default to false, controller/access layer will lock it if needed
    };
  }
}
