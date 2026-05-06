export type Status = "active" | "inactive";
export type AlertType = "low_stock" | "out_of_stock" | "inconsistency";
export type MovementType = "purchase" | "dispatch" | "adjustment";

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  cost: number;
  price: number;
  minStock: number;
  status: Status;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  status: Status;
}

export interface Supplier {
  id: string;
  name: string;
  identification: string;
  phone: string;
  email: string;
  address: string;
  status: Status;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "Administrador" | "Operaciones" | "Finanzas";
  status: Status;
}

export interface StockItem {
  productId: string;
  warehouseId: string;
  quantity: number;
}

export interface Movement {
  id: string;
  type: MovementType;
  productId: string;
  warehouseId: string;
  quantity: number;
  unitCost?: number;
  unitPrice?: number;
  reference: string;
  createdAt: string;
}

export interface PurchaseLine {
  productId: string;
  quantity: number;
  unitCost: number;
}

export interface Purchase {
  id: string;
  supplierId: string;
  warehouseId: string;
  date: string;
  lines: PurchaseLine[];
  total: number;
}

export interface DispatchLine {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface Dispatch {
  id: string;
  warehouseId: string;
  date: string;
  lines: DispatchLine[];
  total: number;
}

export interface Alert {
  id: string;
  type: AlertType;
  productId?: string;
  warehouseId?: string;
  title: string;
  detail: string;
  severity: "critical" | "warning" | "info";
  createdAt: string;
  read: boolean;
}

export interface InventoryState {
  products: Product[];
  warehouses: Warehouse[];
  suppliers: Supplier[];
  users: User[];
  stock: StockItem[];
  movements: Movement[];
  purchases: Purchase[];
  dispatches: Dispatch[];
  alerts: Alert[];
  events: string[];
}

export interface FinanceSummary {
  inventoryValue: number;
  investedInInventory: number;
  purchaseCost: number;
  estimatedRevenue: number;
  grossMargin: number;
  averageMargin: number;
}
