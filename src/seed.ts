import type { InventoryState } from "./types";

const now = new Date();
const daysAgo = (days: number) => new Date(now.getTime() - days * 86400000).toISOString();

export const seedState: InventoryState = {
  products: [
    { id: "p-001", name: "Cable industrial calibre 12", sku: "CAB-12", category: "Eléctricos", cost: 4200, price: 6900, minStock: 80, status: "active" },
    { id: "p-002", name: "Válvula de presión 1/2", sku: "VAL-12", category: "Hidráulica", cost: 18500, price: 31900, minStock: 25, status: "active" },
    { id: "p-003", name: "Sensor térmico NTC", sku: "SEN-NTC", category: "Sensores", cost: 12800, price: 23600, minStock: 40, status: "active" },
    { id: "p-004", name: "Filtro de seguridad M8", sku: "FIL-M8", category: "Repuestos", cost: 9100, price: 16400, minStock: 50, status: "active" },
    { id: "p-005", name: "Caja de control IP65", sku: "BOX-IP65", category: "Gabinetes", cost: 72000, price: 118000, minStock: 12, status: "active" },
    { id: "p-006", name: "Conector rápido bronce", sku: "CON-BR", category: "Hidráulica", cost: 6400, price: 10800, minStock: 60, status: "active" },
  ],
  warehouses: [
    { id: "w-001", name: "Bodega Norte", location: "Zona industrial, Medellín", status: "active" },
    { id: "w-002", name: "Bodega Centro", location: "Punto administrativo principal", status: "active" },
    { id: "w-003", name: "Bodega Occidente", location: "Cross-dock temporal", status: "active" },
  ],
  suppliers: [
    { id: "s-001", name: "TecnoPartes Andina", identification: "900.821.100", phone: "+57 604 444 1818", email: "compras@tecnopartes.co", address: "Cra 48 #20-80", status: "active" },
    { id: "s-002", name: "Suministros Atlas", identification: "901.114.711", phone: "+57 601 310 9021", email: "ventas@atlas.co", address: "Av. Chile #12-40", status: "active" },
    { id: "s-003", name: "ElectroNexo SAS", identification: "830.920.451", phone: "+57 605 555 7744", email: "contacto@electronexo.co", address: "Cll 77 #63-11", status: "active" },
  ],
  users: [
    { id: "u-001", name: "Laura Méndez", email: "laura@nucleo.local", role: "Administrador", status: "active" },
    { id: "u-002", name: "Camilo Restrepo", email: "camilo@nucleo.local", role: "Operaciones", status: "active" },
    { id: "u-003", name: "María Quintero", email: "maria@nucleo.local", role: "Finanzas", status: "active" },
  ],
  stock: [
    { productId: "p-001", warehouseId: "w-001", quantity: 140 },
    { productId: "p-001", warehouseId: "w-002", quantity: 48 },
    { productId: "p-001", warehouseId: "w-003", quantity: 20 },
    { productId: "p-002", warehouseId: "w-001", quantity: 32 },
    { productId: "p-002", warehouseId: "w-002", quantity: 9 },
    { productId: "p-003", warehouseId: "w-001", quantity: 52 },
    { productId: "p-003", warehouseId: "w-003", quantity: 0 },
    { productId: "p-004", warehouseId: "w-002", quantity: 83 },
    { productId: "p-005", warehouseId: "w-001", quantity: 14 },
    { productId: "p-005", warehouseId: "w-003", quantity: 4 },
    { productId: "p-006", warehouseId: "w-002", quantity: 125 },
    { productId: "p-006", warehouseId: "w-003", quantity: 38 },
  ],
  movements: [
    { id: "m-001", type: "purchase", productId: "p-001", warehouseId: "w-001", quantity: 70, unitCost: 4200, reference: "Compra CO-1042", createdAt: daysAgo(4) },
    { id: "m-002", type: "dispatch", productId: "p-002", warehouseId: "w-002", quantity: 16, unitPrice: 31900, reference: "Despacho DE-2120", createdAt: daysAgo(2) },
    { id: "m-003", type: "adjustment", productId: "p-005", warehouseId: "w-003", quantity: -3, reference: "Ajuste conteo físico", createdAt: daysAgo(1) },
  ],
  purchases: [
    { id: "co-1042", supplierId: "s-001", warehouseId: "w-001", date: daysAgo(4), lines: [{ productId: "p-001", quantity: 70, unitCost: 4200 }], total: 294000 },
    { id: "co-1048", supplierId: "s-003", warehouseId: "w-003", date: daysAgo(1), lines: [{ productId: "p-005", quantity: 5, unitCost: 72000 }], total: 360000 },
  ],
  dispatches: [
    { id: "de-2120", warehouseId: "w-002", date: daysAgo(2), lines: [{ productId: "p-002", quantity: 16, unitPrice: 31900 }], total: 510400 },
    { id: "de-2124", warehouseId: "w-001", date: daysAgo(1), lines: [{ productId: "p-003", quantity: 12, unitPrice: 23600 }], total: 283200 },
  ],
  alerts: [],
  events: ["Stock actualizado por despacho DE-2124", "Compra CO-1048 recibida en Bodega Occidente"],
};
