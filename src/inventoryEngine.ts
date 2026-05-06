import type {
  Alert,
  Dispatch,
  DispatchLine,
  FinanceSummary,
  InventoryState,
  Movement,
  Product,
  Purchase,
  PurchaseLine,
  StockItem,
} from "./types";

export const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36).slice(-4)}`;

export const money = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export const number = new Intl.NumberFormat("es-CO");

export const date = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function getStockQuantity(state: InventoryState, productId: string, warehouseId: string) {
  return state.stock.find((item) => item.productId === productId && item.warehouseId === warehouseId)?.quantity ?? 0;
}

export function totalProductStock(state: InventoryState, productId: string) {
  return state.stock.filter((item) => item.productId === productId).reduce((sum, item) => sum + item.quantity, 0);
}

function setStock(stock: StockItem[], productId: string, warehouseId: string, quantity: number) {
  const index = stock.findIndex((item) => item.productId === productId && item.warehouseId === warehouseId);
  if (index >= 0) {
    return stock.map((item, itemIndex) => (itemIndex === index ? { ...item, quantity } : item));
  }
  return [...stock, { productId, warehouseId, quantity }];
}

function productName(state: InventoryState, productId: string) {
  return state.products.find((product) => product.id === productId)?.name ?? "Producto";
}

function warehouseName(state: InventoryState, warehouseId: string) {
  return state.warehouses.find((warehouse) => warehouse.id === warehouseId)?.name ?? "Bodega";
}

export function recalculateAlerts(state: InventoryState): Alert[] {
  const previousManual = state.alerts.filter((alert) => alert.type === "inconsistency");
  const stockAlerts: Alert[] = state.products.flatMap((product): Alert[] => {
    const quantity = totalProductStock(state, product.id);
    if (quantity === 0) {
      return [{
        id: `alert-out-${product.id}`,
        type: "out_of_stock" as const,
        productId: product.id,
        title: "Producto agotado",
        detail: `${product.name} llegó a cero unidades consolidadas.`,
        severity: "critical" as const,
        createdAt: new Date().toISOString(),
        read: false,
      }];
    }
    if (quantity <= product.minStock) {
      return [{
        id: `alert-low-${product.id}`,
        type: "low_stock" as const,
        productId: product.id,
        title: "Stock bajo",
        detail: `${product.name} tiene ${number.format(quantity)} unidades contra mínimo ${number.format(product.minStock)}.`,
        severity: "warning" as const,
        createdAt: new Date().toISOString(),
        read: false,
      }];
    }
    return [];
  });

  return [...stockAlerts, ...previousManual].slice(0, 30);
}

function withDerivedAlerts(state: InventoryState): InventoryState {
  return { ...state, alerts: recalculateAlerts(state) };
}

function addEvent(state: InventoryState, event: string) {
  return { ...state, events: [event, ...state.events].slice(0, 12) };
}

export function createProduct(state: InventoryState, product: Omit<Product, "id">) {
  return withDerivedAlerts({ ...state, products: [{ ...product, id: uid("p") }, ...state.products] });
}

export function updateProduct(state: InventoryState, product: Product) {
  return withDerivedAlerts({ ...state, products: state.products.map((item) => (item.id === product.id ? product : item)) });
}

export function upsertWarehouse<T extends { id: string }>(items: T[], item: T) {
  return items.some((current) => current.id === item.id)
    ? items.map((current) => (current.id === item.id ? item : current))
    : [{ ...item, id: item.id || uid("w") }, ...items];
}

export function registerPurchase(state: InventoryState, input: { supplierId: string; warehouseId: string; lines: PurchaseLine[] }) {
  const createdAt = new Date().toISOString();
  const total = input.lines.reduce((sum, line) => sum + line.quantity * line.unitCost, 0);
  const purchase: Purchase = { id: uid("co"), supplierId: input.supplierId, warehouseId: input.warehouseId, date: createdAt, lines: input.lines, total };
  let nextStock = state.stock;
  const movements: Movement[] = [];

  for (const line of input.lines) {
    const quantity = getStockQuantity({ ...state, stock: nextStock }, line.productId, input.warehouseId) + line.quantity;
    nextStock = setStock(nextStock, line.productId, input.warehouseId, quantity);
    movements.push({
      id: uid("m"),
      type: "purchase",
      productId: line.productId,
      warehouseId: input.warehouseId,
      quantity: line.quantity,
      unitCost: line.unitCost,
      reference: `Compra ${purchase.id.toUpperCase()}`,
      createdAt,
    });
  }

  const next = addEvent({
    ...state,
    purchases: [purchase, ...state.purchases],
    movements: [...movements, ...state.movements],
    stock: nextStock,
  }, `Compra ${purchase.id.toUpperCase()} recibida en ${warehouseName(state, input.warehouseId)}`);

  return withDerivedAlerts(next);
}

export function registerDispatch(state: InventoryState, input: { warehouseId: string; lines: DispatchLine[] }) {
  for (const line of input.lines) {
    const current = getStockQuantity(state, line.productId, input.warehouseId);
    if (current < line.quantity) {
      throw new Error(`${productName(state, line.productId)} no tiene stock suficiente en ${warehouseName(state, input.warehouseId)}.`);
    }
  }

  const createdAt = new Date().toISOString();
  const total = input.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
  const dispatch: Dispatch = { id: uid("de"), warehouseId: input.warehouseId, date: createdAt, lines: input.lines, total };
  let nextStock = state.stock;
  const movements: Movement[] = [];

  for (const line of input.lines) {
    const quantity = getStockQuantity({ ...state, stock: nextStock }, line.productId, input.warehouseId) - line.quantity;
    nextStock = setStock(nextStock, line.productId, input.warehouseId, quantity);
    movements.push({
      id: uid("m"),
      type: "dispatch",
      productId: line.productId,
      warehouseId: input.warehouseId,
      quantity: -line.quantity,
      unitPrice: line.unitPrice,
      reference: `Despacho ${dispatch.id.toUpperCase()}`,
      createdAt,
    });
  }

  const next = addEvent({
    ...state,
    dispatches: [dispatch, ...state.dispatches],
    movements: [...movements, ...state.movements],
    stock: nextStock,
  }, `Despacho ${dispatch.id.toUpperCase()} descargado desde ${warehouseName(state, input.warehouseId)}`);

  return withDerivedAlerts(next);
}

export function registerAdjustment(state: InventoryState, input: { productId: string; warehouseId: string; quantity: number; note: string }) {
  const current = getStockQuantity(state, input.productId, input.warehouseId);
  const nextQuantity = current + input.quantity;
  if (nextQuantity < 0) {
    throw new Error("El ajuste generaría stock negativo.");
  }
  const createdAt = new Date().toISOString();
  const movement: Movement = {
    id: uid("m"),
    type: "adjustment",
    productId: input.productId,
    warehouseId: input.warehouseId,
    quantity: input.quantity,
    reference: input.note || "Ajuste manual",
    createdAt,
  };
  const next = addEvent({
    ...state,
    stock: setStock(state.stock, input.productId, input.warehouseId, nextQuantity),
    movements: [movement, ...state.movements],
  }, `Ajuste de ${productName(state, input.productId)} registrado en ${warehouseName(state, input.warehouseId)}`);

  return withDerivedAlerts(next);
}

export function financeSummary(state: InventoryState): FinanceSummary {
  const inventoryValue = state.stock.reduce((sum, item) => {
    const product = state.products.find((current) => current.id === item.productId);
    return sum + (product?.cost ?? 0) * item.quantity;
  }, 0);
  const purchaseCost = state.purchases.reduce((sum, purchase) => sum + purchase.total, 0);
  const estimatedRevenue = state.dispatches.reduce((sum, dispatch) => sum + dispatch.total, 0);
  const dispatchedCost = state.dispatches.reduce((sum, dispatch) => sum + dispatch.lines.reduce((lineSum, line) => {
    const product = state.products.find((current) => current.id === line.productId);
    return lineSum + (product?.cost ?? 0) * line.quantity;
  }, 0), 0);
  const grossMargin = estimatedRevenue - dispatchedCost;
  const activeProducts = state.products.filter((product) => product.status === "active");
  const averageMargin = activeProducts.length
    ? activeProducts.reduce((sum, product) => sum + ((product.price - product.cost) / Math.max(product.price, 1)) * 100, 0) / activeProducts.length
    : 0;

  return {
    inventoryValue,
    investedInInventory: inventoryValue,
    purchaseCost,
    estimatedRevenue,
    grossMargin,
    averageMargin,
  };
}
