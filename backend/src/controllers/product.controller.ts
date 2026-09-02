import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import { OpenFoodFactsService } from "../services/openFoodFacts.service";
import { ProductAccessService } from "../services/productAccess.service";
import { AppError } from "../middleware/errorHandler";
import { SupportedLanguage } from "../types/product";

const DEMO_USER_EMAIL = "demo@example.com";
const openFoodFacts = new OpenFoodFactsService();

export async function searchProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const query = req.query.q as string;
    const lang = (req.query.lang as SupportedLanguage) || "en";

    if (!query || query.trim().length < 2) {
      throw new AppError(400, "Search query must contain at least 2 characters.");
    }

    const validLangs: SupportedLanguage[] = ["en", "nl", "de", "fr"];
    const language = validLangs.includes(lang) ? lang : "en";

    // 1. Fetch products from Open Food Facts
    const products = await openFoodFacts.search(query.trim(), language);

    // 2. Fetch demo user to get subscription status and log search
    const user = await prisma.user.findUnique({
      where: { email: DEMO_USER_EMAIL }
    });

    if (!user) {
      throw new AppError(500, "Demo user not found in database.");
    }

    // 3. Log recent search asynchronously (don't block response)
    prisma.recentSearch.create({
      data: {
        query: query.trim(),
        language,
        userId: user.id
      }
    }).catch(err => console.error("Failed to log recent search:", err));

    // 4. Enforce nutrition access
    const protectedProducts = ProductAccessService.enforceNutritionAccess(products, user.subscriptionStatus);

    res.json({ products: protectedProducts });
  } catch (error) {
    next(error);
  }
}
