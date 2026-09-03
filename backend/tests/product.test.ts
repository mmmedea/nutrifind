import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import prisma from "../src/utils/prisma";

// Reset demo user status before each test
beforeEach(async () => {
  await prisma.user.updateMany({
    where: { email: "demo@example.com" },
    data: { subscriptionStatus: "INACTIVE" },
  });
});
import app from "../src/app";
import { OpenFoodFactsService } from "../src/services/openFoodFacts.service";

// Mock the openFoodFacts service before the controller is imported
vi.mock("../src/services/openFoodFacts.service", () => {
  return {
    OpenFoodFactsService: class {
      search = vi.fn().mockResolvedValue([
        {
          id: "12345",
          name: "Mock Product",
          brand: "Mock Brand",
          imageUrl: null,
          nutrition: {
            energyKcal: 100,
            fat: 10,
            carbohydrates: 20,
            sugars: 5,
            protein: 2,
            salt: 1
          },
          nutritionLocked: false
        }
      ]);
    }
  };
});

describe("GET /api/products/search", () => {
  it("should return a 400 error if query is too short", async () => {
    const res = await request(app).get("/api/products/search?q=a");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Search query must contain at least 2 characters.");
  });

  it("should return products and strip nutrition for inactive subscribers", async () => {
    // The demo user is seeded as INACTIVE by default.
    const res = await request(app).get("/api/products/search?q=mock");
    expect(res.status).toBe(200);
    
    expect(res.body.products).toHaveLength(1);
    const product = res.body.products[0];
    
    expect(product.name).toBe("Mock Product");
    // Nutrition should be null because the mock user is inactive
    expect(product.nutrition).toBeNull();
    expect(product.nutritionLocked).toBe(true);
  });
});
