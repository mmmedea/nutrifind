import { ProductSearchResult } from "../types/product";
import { SubscriptionStatus } from "@prisma/client";

export class ProductAccessService {
  /**
   * Enforces nutrition access control based on user subscription status.
   * If not ACTIVE, nutrition data is stripped and nutritionLocked is set to true.
   */
  public static enforceNutritionAccess(
    products: ProductSearchResult[],
    status: SubscriptionStatus
  ): ProductSearchResult[] {
    const isSubscribed = status === SubscriptionStatus.ACTIVE;

    return products.map(product => {
      if (!isSubscribed) {
        return {
          ...product,
          nutrition: null,
          nutritionLocked: true,
        };
      }
      
      return {
        ...product,
        nutritionLocked: false,
      };
    });
  }
}
