import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import {
  AlertTriangle,
  Boxes,
  Building2,
  ChartNoAxesCombined,
  CircleDollarSign,
  Factory,
  History,
  LogOut,
  Package,
  RotateCcw,
  Send,
  ShoppingCart,
  Siren,
  SlidersHorizontal,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";
import { getState, resetState, saveState } from "./mockApi";
import { useUiStore } from "./uiStore";
import type { DispatchLine, InventoryState, Product, PurchaseLine, Status, Supplier, User, Warehouse as WarehouseType } from "./types";
import {
  createProduct,
  date,
  financeSummary,
  getStockQuantity,
  money,
  number,
  registerAdjustment,
  registerDispatch,
  registerPurchase,
  totalProductStock,
  uid,
  updateProduct,
  upsertWarehouse,
} from "./inventoryEngine";

const pages = [
  { name: "Dashboard", icon: ChartNoAxesCombined },
  { name: "Productos", icon: Package },
  { name: "Bodegas", icon: Warehouse },
  { name: "Inventario", icon: Boxes },
  { name: "Compras", icon: ShoppingCart },
  { name: "Proveedores", icon: Truck },
  { name: "Despachos", icon: Send },
  { name: "Alertas", icon: Siren },
  { name: "Finanzas", icon: CircleDollarSign },
  { name: "Usuarios", icon: Users },
];

const statusLabel: Record<Status, string> = { active: "Activo", inactive: "Inactivo" };

function App() {
  const { page, setPage, toast, clearToast, isAuthenticated } = useUiStore();
  const { data, isLoading } = useQuery({ queryKey: ["inventory"], queryFn: getState });

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(clearToast, 3200);
    return () => window.clearTimeout(timer);
  }, [toast, clearToast]);

  if (isLoading || !data) {
    return <div className="grid min-h-screen place-items-center bg-graphite text-bone">Cargando centro operativo...</div>;
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen />
        {toast && <div className="fixed bottom-5 right-5 z-50 rounded-2xl bg-graphite px-5 py-4 text-sm font-semibold text-bone shadow-panel">{toast}</div>}
      </>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-bone text-graphite">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_16%_12%,rgba(242,169,0,.22),transparent_34%),radial-gradient(circle_at_80%_10%,rgba(45,212,191,.18),transparent_28%),linear-gradient(135deg,#f5f0e6,#e7dfcf)]" />
      <aside className="fixed left-0 top-0 z-20 hidden h-full w-72 border-r border-white/10 bg-graphite px-5 py-6 text-bone lg:block">
        <div className="mb-10 flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl bg-amberline text-graphite shadow-panel">
            <Factory size={26} />
          </div>
          <div>
            <p className="font-display text-lg leading-none tracking-tight">Núcleo</p>
            <p className="text-xs uppercase tracking-[.32em] text-bone/55">Inventario</p>
          </div>
        </div>
        <nav className="space-y-2">
          {pages.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => setPage(item.name)}
                className={clsx(
                  "group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition",
                  page === item.name ? "bg-bone text-graphite" : "text-bone/72 hover:bg-white/8 hover:text-bone",
                )}
              >
                <Icon size={18} />
                {item.name}
              </button>
            );
          })}
        </nav>
        <div className="absolute bottom-6 left-5 right-5 rounded-3xl border border-bone/10 bg-white/5 p-4">
          <p className="mb-2 text-xs uppercase tracking-[.26em] text-bone/45">Estado</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="size-2 animate-pulse-line rounded-full bg-goodline" />
            Mock operativo local
          </div>
        </div>
      </aside>

      <main className="lg:pl-72">
        <Topbar data={data} />
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-5 sm:px-6 lg:px-8">
          <MobileNav />
          {page === "Dashboard" && <Dashboard data={data} />}
          {page === "Productos" && <Products data={data} />}
          {page === "Bodegas" && <Warehouses data={data} />}
          {page === "Inventario" && <Inventory data={data} />}
          {page === "Compras" && <Purchases data={data} />}
          {page === "Proveedores" && <Suppliers data={data} />}
          {page === "Despachos" && <Dispatches data={data} />}
          {page === "Alertas" && <Alerts data={data} />}
          {page === "Finanzas" && <Finance data={data} />}
          {page === "Usuarios" && <UsersPage data={data} />}
        </div>
      </main>
      {toast && <div className="fixed bottom-5 right-5 z-50 rounded-2xl bg-graphite px-5 py-4 text-sm font-semibold text-bone shadow-panel">{toast}</div>}
    </div>
  );
}

function useCommit() {
  const client = useQueryClient();
  const notify = useUiStore((state) => state.notify);
  return useMutation({
    mutationFn: (updater: (state: InventoryState) => InventoryState) => saveState(updater),
    onSuccess: (_data, _variables, context) => {
      client.invalidateQueries({ queryKey: ["inventory"] });
      if (typeof context === "string") notify(context);
    },
    onError: (error) => notify(error instanceof Error ? error.message : "No se pudo completar la acción."),
  });
}

function Topbar({ data }: { data: InventoryState }) {
  const queryClient = useQueryClient();
  const notify = useUiStore((state) => state.notify);
  const logout = useUiStore((state) => state.logout);
  const activeAlerts = data.alerts.filter((alert) => !alert.read).length;
  return (
    <header className="sticky top-0 z-10 border-b border-graphite/10 bg-bone/80 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[.32em] text-graphite/45">Centro operativo</p>
          <h1 className="font-display text-2xl tracking-tight sm:text-4xl">Inventario multi-bodega</h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge tone={activeAlerts > 0 ? "danger" : "good"}>{activeAlerts} alertas vivas</Badge>
          <button
            onClick={async () => {
              await resetState();
              queryClient.invalidateQueries({ queryKey: ["inventory"] });
              notify("Datos mock reiniciados.");
            }}
            className="inline-flex items-center gap-2 rounded-2xl border border-graphite/15 bg-white/55 px-4 py-2 text-sm font-semibold hover:bg-white"
          >
            <RotateCcw size={16} /> Reset seed
          </button>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-2xl bg-graphite px-4 py-2 text-sm font-semibold text-bone hover:bg-graphite-2"
          >
            <LogOut size={16} /> Salir
          </button>
        </div>
      </div>
    </header>
  );
}

function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const login = useUiStore((state) => state.login);

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-graphite px-5 text-bone">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(242,169,0,.28),transparent_32%),radial-gradient(circle_at_82%_14%,rgba(45,212,191,.22),transparent_30%),linear-gradient(145deg,#111914,#1a241e)]" />
      <div className="absolute left-8 top-8 hidden h-[calc(100%-4rem)] w-24 rounded-[2rem] border border-bone/10 bg-white/5 lg:block" />
      <form
        className="relative z-10 w-full max-w-md animate-panel-in rounded-[2.25rem] border border-bone/12 bg-bone p-7 text-graphite shadow-panel"
        onSubmit={(event) => {
          event.preventDefault();
          login(username.trim(), password);
        }}
      >
        <div className="mb-8 flex items-center gap-3">
          <div className="grid size-14 place-items-center rounded-2xl bg-amberline text-graphite">
            <Factory size={30} />
          </div>
          <div>
            <p className="font-display text-2xl leading-none">Núcleo</p>
            <p className="text-xs font-bold uppercase tracking-[.28em] text-graphite/45">Inventario</p>
          </div>
        </div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[.3em] text-graphite/45">Acceso administrativo</p>
        <h1 className="mb-7 font-display text-5xl leading-none tracking-tight">Centro operativo</h1>
        <div className="space-y-4">
          <Input label="Usuario" value={username} onChange={setUsername} />
          <Input label="Contraseña" type="password" value={password} onChange={setPassword} />
        </div>
        <button className="mt-6 w-full rounded-2xl bg-graphite px-5 py-4 text-sm font-black uppercase tracking-[.18em] text-bone hover:bg-graphite-2">
          Ingresar
        </button>
        <p className="mt-5 rounded-2xl bg-graphite/8 px-4 py-3 text-sm text-graphite/65">
          Usuario de prueba: <strong>samuel</strong> · Contraseña: <strong>samuel</strong>
        </p>
      </form>
    </main>
  );
}

function MobileNav() {
  const page = useUiStore((state) => state.page);
  const setPage = useUiStore((state) => state.setPage);
  return (
    <select className="mb-5 w-full rounded-2xl border border-graphite/15 bg-white/80 px-4 py-3 lg:hidden" value={page} onChange={(event) => setPage(event.target.value)}>
      {pages.map((item) => <option key={item.name}>{item.name}</option>)}
    </select>
  );
}

function Dashboard({ data }: { data: InventoryState }) {
  const finance = financeSummary(data);
  const low = data.alerts.filter((alert) => alert.type === "low_stock").length;
  const out = data.alerts.filter((alert) => alert.type === "out_of_stock").length;
  const moved = [...data.movements].slice(0, 6);
  const warehouseTotals = data.warehouses.map((warehouse) => ({
    warehouse,
    units: data.stock.filter((item) => item.warehouseId === warehouse.id).reduce((sum, item) => sum + item.quantity, 0),
  }));

  return (
    <Section title="Tablero de mando" kicker="Operación en vivo" actions={<Badge tone="cyan">Actualización por acciones</Badge>}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric title="Valor inventario" value={money.format(finance.inventoryValue)} accent="amber" />
        <Metric title="Stock bajo" value={number.format(low)} accent="danger" />
        <Metric title="Agotados" value={number.format(out)} accent="danger" />
        <Metric title="Margen bruto estimado" value={money.format(finance.grossMargin)} accent="good" />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <Panel title="Resumen por bodega" icon={<Building2 size={18} />}>
          <div className="space-y-4">
            {warehouseTotals.map(({ warehouse, units }) => (
              <div key={warehouse.id}>
                <div className="mb-2 flex justify-between text-sm font-semibold">
                  <span>{warehouse.name}</span>
                  <span>{number.format(units)} und</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-graphite/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-amberline to-cyanline" style={{ width: `${Math.min(100, units / 4)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Feed operativo" icon={<History size={18} />}>
          <div className="space-y-3">
            {data.events.map((event) => <div key={event} className="rounded-2xl bg-graphite px-4 py-3 text-sm text-bone">{event}</div>)}
          </div>
        </Panel>
      </div>
      <Panel title="Movimientos recientes" icon={<SlidersHorizontal size={18} />} className="mt-5">
        <Table headers={["Tipo", "Producto", "Bodega", "Cantidad", "Referencia", "Fecha"]}>
          {moved.map((movement) => (
            <tr key={movement.id}>
              <td><Badge tone={movement.type === "dispatch" ? "danger" : movement.type === "purchase" ? "good" : "cyan"}>{movement.type}</Badge></td>
              <td>{nameOf(data.products, movement.productId)}</td>
              <td>{nameOf(data.warehouses, movement.warehouseId)}</td>
              <td className="font-mono">{number.format(movement.quantity)}</td>
              <td>{movement.reference}</td>
              <td>{date.format(new Date(movement.createdAt))}</td>
            </tr>
          ))}
        </Table>
      </Panel>
    </Section>
  );
}

function Products({ data }: { data: InventoryState }) {
  const commit = useCommit();
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", sku: "", category: "", cost: 0, price: 0, minStock: 0, status: "active" as Status });

  const save = () => {
    if (!form.name || !form.sku) return;
    commit.mutate((state) => editing ? updateProduct(state, { ...form, id: editing.id }) : createProduct(state, form), { onSuccess: () => undefined });
    setEditing(null);
    setForm({ name: "", sku: "", category: "", cost: 0, price: 0, minStock: 0, status: "active" });
  };

  return (
    <Section title="Productos" kicker="Catálogo maestro">
      <Editor title={editing ? "Editar producto" : "Nuevo producto"} onSave={save}>
        <Input label="Nombre" value={form.name} onChange={(name) => setForm({ ...form, name })} />
        <Input label="SKU" value={form.sku} onChange={(sku) => setForm({ ...form, sku })} />
        <Input label="Categoría" value={form.category} onChange={(category) => setForm({ ...form, category })} />
        <Input label="Costo" type="number" value={form.cost} onChange={(cost) => setForm({ ...form, cost: Number(cost) })} />
        <Input label="Precio venta" type="number" value={form.price} onChange={(price) => setForm({ ...form, price: Number(price) })} />
        <Input label="Stock mínimo" type="number" value={form.minStock} onChange={(minStock) => setForm({ ...form, minStock: Number(minStock) })} />
      </Editor>
      <Panel title="Listado" icon={<Package size={18} />} className="mt-5">
        <Table headers={["Producto", "SKU", "Categoría", "Costo", "Precio", "Stock", "Estado", "Acción"]}>
          {data.products.map((product) => (
            <tr key={product.id}>
              <td className="font-semibold">{product.name}</td>
              <td className="font-mono">{product.sku}</td>
              <td>{product.category}</td>
              <td>{money.format(product.cost)}</td>
              <td>{money.format(product.price)}</td>
              <td>{number.format(totalProductStock(data, product.id))}</td>
              <td><Badge tone={product.status === "active" ? "good" : "muted"}>{statusLabel[product.status]}</Badge></td>
              <td><button className="link" onClick={() => { setEditing(product); setForm(product); }}>Editar</button></td>
            </tr>
          ))}
        </Table>
      </Panel>
    </Section>
  );
}

function Warehouses({ data }: { data: InventoryState }) {
  const commit = useCommit();
  const [form, setForm] = useState<WarehouseType>({ id: "", name: "", location: "", status: "active" });
  return (
    <Section title="Bodegas" kicker="Ubicaciones operativas">
      <Editor title={form.id ? "Editar bodega" : "Nueva bodega"} onSave={() => {
        commit.mutate((state) => ({ ...state, warehouses: upsertWarehouse(state.warehouses, { ...form, id: form.id || uid("w") }) }));
        setForm({ id: "", name: "", location: "", status: "active" });
      }}>
        <Input label="Nombre" value={form.name} onChange={(name) => setForm({ ...form, name })} />
        <Input label="Ubicación" value={form.location} onChange={(location) => setForm({ ...form, location })} />
        <Select label="Estado" value={form.status} onChange={(status) => setForm({ ...form, status: status as Status })} options={["active", "inactive"]} />
      </Editor>
      <CrudTable headers={["Nombre", "Ubicación", "Estado", "Unidades"]}>
        {data.warehouses.map((warehouse) => (
          <tr key={warehouse.id} onClick={() => setForm(warehouse)} className="cursor-pointer">
            <td className="font-semibold">{warehouse.name}</td>
            <td>{warehouse.location}</td>
            <td><Badge tone={warehouse.status === "active" ? "good" : "muted"}>{statusLabel[warehouse.status]}</Badge></td>
            <td>{number.format(data.stock.filter((item) => item.warehouseId === warehouse.id).reduce((sum, item) => sum + item.quantity, 0))}</td>
          </tr>
        ))}
      </CrudTable>
    </Section>
  );
}

function Inventory({ data }: { data: InventoryState }) {
  const commit = useCommit();
  const [adjust, setAdjust] = useState({ productId: data.products[0]?.id ?? "", warehouseId: data.warehouses[0]?.id ?? "", quantity: 0, note: "" });
  return (
    <Section title="Inventario" kicker="Stock producto + bodega">
      <Editor title="Ajuste manual" onSave={() => {
        commit.mutate((state) => registerAdjustment(state, adjust));
        setAdjust({ ...adjust, quantity: 0, note: "" });
      }}>
        <Select label="Producto" value={adjust.productId} onChange={(productId) => setAdjust({ ...adjust, productId })} options={data.products.map((product) => product.id)} labels={data.products} />
        <Select label="Bodega" value={adjust.warehouseId} onChange={(warehouseId) => setAdjust({ ...adjust, warehouseId })} options={data.warehouses.map((warehouse) => warehouse.id)} labels={data.warehouses} />
        <Input label="Cantidad (+/-)" type="number" value={adjust.quantity} onChange={(quantity) => setAdjust({ ...adjust, quantity: Number(quantity) })} />
        <Input label="Nota" value={adjust.note} onChange={(note) => setAdjust({ ...adjust, note })} />
      </Editor>
      <Panel title="Matriz de stock" icon={<Boxes size={18} />} className="mt-5">
        <Table headers={["Producto", ...data.warehouses.map((warehouse) => warehouse.name), "Consolidado", "Mínimo"]}>
          {data.products.map((product) => (
            <tr key={product.id}>
              <td className="font-semibold">{product.name}</td>
              {data.warehouses.map((warehouse) => <td key={warehouse.id}>{number.format(getStockQuantity(data, product.id, warehouse.id))}</td>)}
              <td className="font-mono font-bold">{number.format(totalProductStock(data, product.id))}</td>
              <td>{number.format(product.minStock)}</td>
            </tr>
          ))}
        </Table>
      </Panel>
    </Section>
  );
}

function Purchases({ data }: { data: InventoryState }) {
  const commit = useCommit();
  const [form, setForm] = useState({ supplierId: data.suppliers[0]?.id ?? "", warehouseId: data.warehouses[0]?.id ?? "", productId: data.products[0]?.id ?? "", quantity: 1, unitCost: data.products[0]?.cost ?? 0 });
  const lines: PurchaseLine[] = [{ productId: form.productId, quantity: form.quantity, unitCost: form.unitCost }];
  return (
    <FlowPage title="Compras" kicker="Ingreso de inventario" data={data} records={data.purchases.map((purchase) => [purchase.id.toUpperCase(), nameOf(data.suppliers, purchase.supplierId), nameOf(data.warehouses, purchase.warehouseId), money.format(purchase.total), date.format(new Date(purchase.date))])}>
      <Editor title="Registrar compra" onSave={() => commit.mutate((state) => registerPurchase(state, { supplierId: form.supplierId, warehouseId: form.warehouseId, lines }))}>
        <Select label="Proveedor" value={form.supplierId} onChange={(supplierId) => setForm({ ...form, supplierId })} options={data.suppliers.map((supplier) => supplier.id)} labels={data.suppliers} />
        <Select label="Bodega entrada" value={form.warehouseId} onChange={(warehouseId) => setForm({ ...form, warehouseId })} options={data.warehouses.map((warehouse) => warehouse.id)} labels={data.warehouses} />
        <Select label="Producto" value={form.productId} onChange={(productId) => setForm({ ...form, productId, unitCost: data.products.find((p) => p.id === productId)?.cost ?? form.unitCost })} options={data.products.map((product) => product.id)} labels={data.products} />
        <Input label="Cantidad" type="number" value={form.quantity} onChange={(quantity) => setForm({ ...form, quantity: Number(quantity) })} />
        <Input label="Costo unitario" type="number" value={form.unitCost} onChange={(unitCost) => setForm({ ...form, unitCost: Number(unitCost) })} />
      </Editor>
    </FlowPage>
  );
}

function Dispatches({ data }: { data: InventoryState }) {
  const commit = useCommit();
  const [form, setForm] = useState({ warehouseId: data.warehouses[0]?.id ?? "", productId: data.products[0]?.id ?? "", quantity: 1, unitPrice: data.products[0]?.price ?? 0 });
  const lines: DispatchLine[] = [{ productId: form.productId, quantity: form.quantity, unitPrice: form.unitPrice }];
  return (
    <FlowPage title="Despachos" kicker="Salida desde una bodega" data={data} records={data.dispatches.map((dispatch) => [dispatch.id.toUpperCase(), nameOf(data.warehouses, dispatch.warehouseId), `${dispatch.lines.length} líneas`, money.format(dispatch.total), date.format(new Date(dispatch.date))])}>
      <Editor title="Registrar despacho" onSave={() => commit.mutate((state) => registerDispatch(state, { warehouseId: form.warehouseId, lines }))}>
        <Select label="Bodega salida" value={form.warehouseId} onChange={(warehouseId) => setForm({ ...form, warehouseId })} options={data.warehouses.map((warehouse) => warehouse.id)} labels={data.warehouses} />
        <Select label="Producto" value={form.productId} onChange={(productId) => setForm({ ...form, productId, unitPrice: data.products.find((p) => p.id === productId)?.price ?? form.unitPrice })} options={data.products.map((product) => product.id)} labels={data.products} />
        <Input label="Cantidad" type="number" value={form.quantity} onChange={(quantity) => setForm({ ...form, quantity: Number(quantity) })} />
        <Input label="Precio unitario" type="number" value={form.unitPrice} onChange={(unitPrice) => setForm({ ...form, unitPrice: Number(unitPrice) })} />
      </Editor>
    </FlowPage>
  );
}

function Suppliers({ data }: { data: InventoryState }) {
  const commit = useCommit();
  const [form, setForm] = useState<Supplier>({ id: "", name: "", identification: "", phone: "", email: "", address: "", status: "active" });
  return (
    <Section title="Proveedores" kicker="Fuente de compras">
      <Editor title={form.id ? "Editar proveedor" : "Nuevo proveedor"} onSave={() => {
        commit.mutate((state) => ({ ...state, suppliers: upsertWarehouse(state.suppliers, { ...form, id: form.id || uid("s") }) }));
        setForm({ id: "", name: "", identification: "", phone: "", email: "", address: "", status: "active" });
      }}>
        <Input label="Nombre" value={form.name} onChange={(name) => setForm({ ...form, name })} />
        <Input label="Identificación" value={form.identification} onChange={(identification) => setForm({ ...form, identification })} />
        <Input label="Teléfono" value={form.phone} onChange={(phone) => setForm({ ...form, phone })} />
        <Input label="Correo" value={form.email} onChange={(email) => setForm({ ...form, email })} />
      </Editor>
      <CrudTable headers={["Nombre", "Identificación", "Teléfono", "Correo", "Estado"]}>
        {data.suppliers.map((supplier) => (
          <tr key={supplier.id} className="cursor-pointer" onClick={() => setForm(supplier)}>
            <td className="font-semibold">{supplier.name}</td><td>{supplier.identification}</td><td>{supplier.phone}</td><td>{supplier.email}</td><td><Badge tone="good">{statusLabel[supplier.status]}</Badge></td>
          </tr>
        ))}
      </CrudTable>
    </Section>
  );
}

function Alerts({ data }: { data: InventoryState }) {
  return (
    <Section title="Alertas" kicker="Riesgo operativo">
      <div className="grid gap-4 md:grid-cols-2">
        {data.alerts.map((alert) => (
          <div key={alert.id} className={clsx("rounded-3xl border p-5 shadow-panel", alert.severity === "critical" ? "border-dangerline/40 bg-dangerline/10" : "border-amberline/40 bg-amberline/10")}>
            <div className="mb-3 flex items-center justify-between">
              <Badge tone={alert.severity === "critical" ? "danger" : "amber"}>{alert.title}</Badge>
              <AlertTriangle size={18} />
            </div>
            <p className="font-semibold">{alert.detail}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Finance({ data }: { data: InventoryState }) {
  const summary = financeSummary(data);
  return (
    <Section title="Finanzas" kicker="Visibilidad básica">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Metric title="Dinero invertido" value={money.format(summary.investedInInventory)} accent="amber" />
        <Metric title="Costo compras" value={money.format(summary.purchaseCost)} accent="cyan" />
        <Metric title="Valor actual inventario" value={money.format(summary.inventoryValue)} accent="good" />
        <Metric title="Ingresos despachos" value={money.format(summary.estimatedRevenue)} accent="cyan" />
        <Metric title="Margen bruto" value={money.format(summary.grossMargin)} accent="good" />
        <Metric title="Margen promedio" value={`${summary.averageMargin.toFixed(1)}%`} accent="amber" />
      </div>
    </Section>
  );
}

function UsersPage({ data }: { data: InventoryState }) {
  const commit = useCommit();
  const [form, setForm] = useState<User>({ id: "", name: "", email: "", role: "Operaciones", status: "active" });
  return (
    <Section title="Usuarios" kicker="Acceso administrativo completo">
      <Editor title={form.id ? "Editar usuario" : "Nuevo usuario"} onSave={() => {
        commit.mutate((state) => ({ ...state, users: upsertWarehouse(state.users, { ...form, id: form.id || uid("u") }) }));
        setForm({ id: "", name: "", email: "", role: "Operaciones", status: "active" });
      }}>
        <Input label="Nombre" value={form.name} onChange={(name) => setForm({ ...form, name })} />
        <Input label="Correo" value={form.email} onChange={(email) => setForm({ ...form, email })} />
        <Select label="Rol" value={form.role} onChange={(role) => setForm({ ...form, role: role as User["role"] })} options={["Administrador", "Operaciones", "Finanzas"]} />
      </Editor>
      <CrudTable headers={["Nombre", "Correo", "Rol", "Estado"]}>
        {data.users.map((user) => <tr key={user.id} className="cursor-pointer" onClick={() => setForm(user)}><td className="font-semibold">{user.name}</td><td>{user.email}</td><td>{user.role}</td><td><Badge tone="good">{statusLabel[user.status]}</Badge></td></tr>)}
      </CrudTable>
    </Section>
  );
}

function FlowPage({ title, kicker, children, records }: { title: string; kicker: string; data: InventoryState; children: React.ReactNode; records: string[][] }) {
  return (
    <Section title={title} kicker={kicker}>
      {children}
      <Panel title="Historial" icon={<History size={18} />} className="mt-5">
        <Table headers={["Código", "Actor", "Bodega/Líneas", "Total", "Fecha"]}>
          {records.map((record) => <tr key={record.join("-")}>{record.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}
        </Table>
      </Panel>
    </Section>
  );
}

function Section({ title, kicker, actions, children }: { title: string; kicker: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="animate-panel-in">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.32em] text-graphite/45">{kicker}</p>
          <h2 className="font-display text-4xl tracking-tight text-graphite sm:text-6xl">{title}</h2>
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

function Metric({ title, value, accent }: { title: string; value: string; accent: "amber" | "danger" | "good" | "cyan" }) {
  return (
    <div className={clsx("rounded-[2rem] border bg-white/70 p-5 shadow-panel", accentClass(accent, "border"))}>
      <p className="mb-4 text-xs font-bold uppercase tracking-[.25em] text-graphite/45">{title}</p>
      <p className="font-display text-3xl tracking-tight">{value}</p>
    </div>
  );
}

function Panel({ title, icon, className, children }: { title: string; icon: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <div className={clsx("rounded-[2rem] border border-graphite/10 bg-white/72 p-5 shadow-panel backdrop-blur", className)}>
      <div className="mb-4 flex items-center gap-2 font-bold">{icon}{title}</div>
      {children}
    </div>
  );
}

function Editor({ title, onSave, children }: { title: string; onSave: () => void; children: React.ReactNode }) {
  return (
    <Panel title={title} icon={<SlidersHorizontal size={18} />}>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{children}</div>
      <button onClick={onSave} className="mt-4 rounded-2xl bg-graphite px-5 py-3 text-sm font-bold text-bone hover:bg-graphite-2">Guardar operación</button>
    </Panel>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string | number; onChange: (value: string) => void; type?: string }) {
  return <label className="text-xs font-bold uppercase tracking-[.18em] text-graphite/50">{label}<input className="mt-2 w-full rounded-2xl border border-graphite/10 bg-bone/80 px-4 py-3 text-base normal-case tracking-normal text-graphite outline-none focus:border-amberline" type={type} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function Select({ label, value, onChange, options, labels }: { label: string; value: string; onChange: (value: string) => void; options: string[]; labels?: { id: string; name: string }[] }) {
  return (
    <label className="text-xs font-bold uppercase tracking-[.18em] text-graphite/50">{label}
      <select className="mt-2 w-full rounded-2xl border border-graphite/10 bg-bone/80 px-4 py-3 text-base normal-case tracking-normal text-graphite outline-none focus:border-amberline" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{labels?.find((item) => item.id === option)?.name ?? option}</option>)}
      </select>
    </label>
  );
}

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left text-sm">
        <thead><tr>{headers.map((header) => <th key={header} className="px-3 py-2 text-xs uppercase tracking-[.18em] text-graphite/45">{header}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function CrudTable({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return <Panel title="Listado" icon={<Package size={18} />} className="mt-5"><Table headers={headers}>{children}</Table></Panel>;
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "good" | "danger" | "amber" | "cyan" | "muted" }) {
  return <span className={clsx("inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[.16em]", accentClass(tone, "bg"))}>{children}</span>;
}

function accentClass(tone: string, mode: "bg" | "border") {
  const map: Record<string, Record<string, string>> = {
    good: { bg: "bg-goodline/15 text-goodline", border: "border-goodline/35" },
    danger: { bg: "bg-dangerline/15 text-dangerline", border: "border-dangerline/35" },
    amber: { bg: "bg-amberline/20 text-graphite", border: "border-amberline/45" },
    cyan: { bg: "bg-cyanline/15 text-teal-700", border: "border-cyanline/35" },
    muted: { bg: "bg-graphite/10 text-graphite/55", border: "border-graphite/15" },
  };
  return map[tone]?.[mode] ?? map.muted[mode];
}

function nameOf(items: { id: string; name: string }[], id: string) {
  return items.find((item) => item.id === id)?.name ?? id;
}

export default App;
