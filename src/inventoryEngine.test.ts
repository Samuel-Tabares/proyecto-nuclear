import { describe, expect, it } from "vitest";
import { seedState } from "./seed";
import { getStockQuantity, registerAdjustment, registerDispatch, registerPurchase } from "./inventoryEngine";

describe("inventoryEngine", () => {
  it("increments stock when registering a purchase", () => {
    const productId = seedState.products[0].id;
    const warehouseId = seedState.warehouses[0].id;
    const before = getStockQuantity(seedState, productId, warehouseId);

    const next = registerPurchase(seedState, {
      supplierId: seedState.suppliers[0].id,
      warehouseId,
      lines: [{ productId, quantity: 10, unitCost: 5000 }],
    });

    expect(getStockQuantity(next, productId, warehouseId)).toBe(before + 10);
    expect(next.movements[0].type).toBe("purchase");
  });

  it("decrements stock when registering a dispatch", () => {
    const productId = seedState.products[0].id;
    const warehouseId = seedState.warehouses[0].id;
    const before = getStockQuantity(seedState, productId, warehouseId);

    const next = registerDispatch(seedState, {
      warehouseId,
      lines: [{ productId, quantity: 7, unitPrice: 9000 }],
    });

    expect(getStockQuantity(next, productId, warehouseId)).toBe(before - 7);
    expect(next.movements[0].type).toBe("dispatch");
  });

  it("blocks dispatches that would produce negative stock", () => {
    const productId = seedState.products[2].id;
    const warehouseId = seedState.warehouses[2].id;

    expect(() => registerDispatch(seedState, {
      warehouseId,
      lines: [{ productId, quantity: 1, unitPrice: 1000 }],
    })).toThrow(/stock suficiente/);
  });

  it("registers manual adjustments and blocks negative results", () => {
    const productId = seedState.products[1].id;
    const warehouseId = seedState.warehouses[1].id;

    const next = registerAdjustment(seedState, { productId, warehouseId, quantity: 3, note: "Conteo" });
    expect(getStockQuantity(next, productId, warehouseId)).toBe(getStockQuantity(seedState, productId, warehouseId) + 3);
    expect(next.movements[0].type).toBe("adjustment");

    expect(() => registerAdjustment(seedState, { productId, warehouseId, quantity: -999, note: "Error" })).toThrow(/stock negativo/);
  });
});
