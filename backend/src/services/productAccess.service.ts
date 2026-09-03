import { ProductSearchResult } from "../types/product";
import { SubscriptionStatus } from "@prisma/client";
import { hasPremiumAccess } from "../utils/premiumAccess";

export class ProductAccessService {
  /**
   * Enforces nutrition access control based on user subscription status.
   * ACTIVE and TRIALING => nutrition visible, nutritionLocked false.
   * All other statuses => nutrition null, nutritionLocked true.
   */
  public static enforceNutritionAccess(
    products: ProductSearchResult[],
    status: SubscriptionStatus
  ): ProductSearchResult[] {
    const hasAccess = status === SubscriptionStatus.ACTIVE || status === SubscriptionStatus.TRIALING;
    return products.map(product => {
      if (!hasAccess) {
        return {
          ...product,
          nutrition: null,
          nutritionLocked: true,
        };
      }
      // Ensure nutritionLocked is false for accessible users
      return { ...product, nutrition: product.nutrition, nutritionLocked: false };
    });
  }
}
