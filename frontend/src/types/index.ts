export type SupportedLanguage = "en" | "nl" | "de" | "fr";

export interface ProductNutrition {
  energyKcal: number | null;
  fat: number | null;
  carbohydrates: number | null;
  sugars: number | null;
  protein: number | null;
  salt: number | null;
}

export interface ProductSearchResult {
  id: string;
  name: string;
  brand: string;
  imageUrl: string | null;
  nutrition: ProductNutrition | null;
  nutritionLocked: boolean;
}
