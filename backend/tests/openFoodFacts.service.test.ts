import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { OpenFoodFactsService } from "../src/services/openFoodFacts.service";

describe("OpenFoodFactsService", () => {
  let service: OpenFoodFactsService;

  beforeEach(() => {
    service = new OpenFoodFactsService();
    vi.stubGlobal("fetch", vi.fn());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const mockHit = {
    code: "123",
    product_name: "Test",
    brands: "TestBrand",
  };

  it("Search-a-licious success -> legacy never called", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ hits: [mockHit] })
    });

    const products = await service.search("test", "en");
    expect(products).toHaveLength(1);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect((global.fetch as any).mock.calls[0][0]).toContain("search.openfoodfacts.org");
  });

  it("Search-a-licious 5xx -> legacy is called", async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({ ok: false, status: 500 }) // primary fails
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ products: [mockHit] })
      }); // legacy succeeds

    const products = await service.search("fallback", "en");
    expect(products).toHaveLength(1);
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect((global.fetch as any).mock.calls[1][0]).toContain("world.openfoodfacts.org");
  });

  it("Search-a-licious timeout -> legacy is called", async () => {
    (global.fetch as any)
      .mockRejectedValueOnce(new Error("Timeout")) // primary throws
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ products: [mockHit] })
      }); // legacy succeeds

    const products = await service.search("timeout", "en");
    expect(products).toHaveLength(1);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("Both providers fail -> AppError 503", async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({ ok: false, status: 500 });

    await expect(service.search("fail", "en")).rejects.toThrow("Product service is temporarily unavailable.");
  });

  it("Upstream 429 -> AppError 429", async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({ ok: false, status: 429 })
      .mockResolvedValueOnce({ ok: false, status: 429 });

    await expect(service.search("rate", "en")).rejects.toThrow("Product search rate limit reached.");
  });

  it("Second identical query -> cache hit", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ hits: [mockHit] })
    });

    await service.search("cacheme", "en");
    await service.search("CACHEME", "en");

    expect(global.fetch).toHaveBeenCalledTimes(1); // Cached!
  });

  it("Different languages -> separate cache keys", async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ hits: [mockHit] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ hits: [mockHit] })
      });

    await service.search("lang", "en");
    await service.search("lang", "fr");

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
