import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requerirRol } from "@/lib/services/auth";
import type { RolUsuario } from "@/lib/types/auth";

const rolesPermitidos: readonly RolUsuario[] = [
  "admin_sistema",
  "jefe_almacen",
  "operador_recepcion",
  "operador_despacho",
];

type EstadoAlerta = "normal" | "bajo" | "critico";

type ProductoInventario = {
  codigo: string;
  nombre: string;
  categoria: string;
  stockTotal: number;
  unidad: string;
  estadoAlerta: EstadoAlerta;
};

const productosEjemplo: ProductoInventario[] = [
  { codigo: "H-001", nombre: "Harina de trigo", categoria: "Harinas", stockTotal: 450, unidad: "kg", estadoAlerta: "normal" },
  { codigo: "A-002", nombre: "Azúcar blanca", categoria: "Endulzantes", stockTotal: 80, unidad: "kg", estadoAlerta: "bajo" },
  { codigo: "M-003", nombre: "Mantequilla sin sal", categoria: "Lácteos", stockTotal: 12, unidad: "kg", estadoAlerta: "critico" },
  { codigo: "H-004", nombre: "Huevos frescos", categoria: "Lácteos", stockTotal: 240, unidad: "unidad", estadoAlerta: "normal" },
  { codigo: "C-005", nombre: "Chocolate 70%", categoria: "Chocolates", stockTotal: 30, unidad: "kg", estadoAlerta: "bajo" },
  { codigo: "L-006", nombre: "Leche entera", categoria: "Lácteos", stockTotal: 200, unidad: "L", estadoAlerta: "normal" },
  { codigo: "V-007", nombre: "Vainilla extracto", categoria: "Esencias", stockTotal: 5, unidad: "L", estadoAlerta: "critico" },
  { codigo: "P-008", nombre: "Polvo de hornear", categoria: "Aditivos", stockTotal: 18, unidad: "kg", estadoAlerta: "normal" },
];

const varianteBadge: Record<EstadoAlerta, "default" | "secondary" | "destructive"> = {
  normal: "default",
  bajo: "secondary",
  critico: "destructive",
};

const etiquetaAlerta: Record<EstadoAlerta, string> = {
  normal: "Normal",
  bajo: "Stock bajo",
  critico: "Crítico",
};

export default async function InventarioPage() {
  const usuarioActual = await requerirRol(rolesPermitidos);
  const { rol } = usuarioActual.perfil;

  const puedeCrearProducto = rol === "admin_sistema" || rol === "jefe_almacen";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#18201b]">Inventario</h1>
          <p className="text-sm text-[#5d6a61]">
            Stock actual de productos en el centro de distribución
          </p>
        </div>
        {puedeCrearProducto && (
          <Button size="sm">+ Nuevo producto</Button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Buscar por nombre o código…"
          className="max-w-xs"
          disabled
        />
        <Select disabled>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            <SelectItem value="harinas">Harinas</SelectItem>
            <SelectItem value="lacteos">Lácteos</SelectItem>
            <SelectItem value="endulzantes">Endulzantes</SelectItem>
            <SelectItem value="chocolates">Chocolates</SelectItem>
            <SelectItem value="esencias">Esencias</SelectItem>
            <SelectItem value="aditivos">Aditivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-[#dfe4dc] bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-right">Stock total</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productosEjemplo.map((producto) => (
              <TableRow key={producto.codigo}>
                <TableCell className="font-mono text-xs text-[#5d6a61]">
                  {producto.codigo}
                </TableCell>
                <TableCell className="font-medium">{producto.nombre}</TableCell>
                <TableCell className="text-sm text-[#5d6a61]">
                  {producto.categoria}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {producto.stockTotal.toLocaleString("es-CO")}
                </TableCell>
                <TableCell className="text-sm text-[#5d6a61]">
                  {producto.unidad}
                </TableCell>
                <TableCell>
                  <Badge variant={varianteBadge[producto.estadoAlerta]}>
                    {etiquetaAlerta[producto.estadoAlerta]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-[#9aad9e]">
        Mostrando {productosEjemplo.length} productos · Datos de ejemplo (Corte 2 conectará con Supabase)
      </p>
    </div>
  );
}
