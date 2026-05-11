import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const rolesPuedenCrear: readonly RolUsuario[] = [
  "admin_sistema",
  "jefe_almacen",
  "operador_recepcion",
];

type EstadoRecepcion = "pendiente" | "recibida" | "con_diferencias" | "cancelada";

type OrdenRecepcion = {
  numeroOrden: string;
  numeroFactura: string;
  fecha: string;
  proveedor: string;
  estado: EstadoRecepcion;
  totalItems: number;
};

const ordenesEjemplo: OrdenRecepcion[] = [
  { numeroOrden: "OR-2026-001", numeroFactura: "FAC-5521", fecha: "2026-05-10", proveedor: "Harinera Central S.A.", estado: "recibida", totalItems: 5 },
  { numeroOrden: "OR-2026-002", numeroFactura: "FAC-8832", fecha: "2026-05-09", proveedor: "Lácteos del Valle", estado: "con_diferencias", totalItems: 3 },
  { numeroOrden: "OR-2026-003", numeroFactura: "FAC-1104", fecha: "2026-05-08", proveedor: "Distribuidora Dulce", estado: "recibida", totalItems: 7 },
  { numeroOrden: "OR-2026-004", numeroFactura: "FAC-6699", fecha: "2026-05-07", proveedor: "Chocolates Andinos", estado: "pendiente", totalItems: 2 },
  { numeroOrden: "OR-2026-005", numeroFactura: "FAC-3310", fecha: "2026-05-06", proveedor: "Harinera Central S.A.", estado: "cancelada", totalItems: 4 },
  { numeroOrden: "OR-2026-006", numeroFactura: "FAC-9901", fecha: "2026-05-05", proveedor: "Esencias y Aromas Ltda.", estado: "recibida", totalItems: 6 },
];

const varianteBadge: Record<EstadoRecepcion, "default" | "secondary" | "destructive" | "outline"> = {
  recibida: "default",
  pendiente: "secondary",
  con_diferencias: "destructive",
  cancelada: "outline",
};

const etiquetaEstado: Record<EstadoRecepcion, string> = {
  recibida: "Recibida",
  pendiente: "Pendiente",
  con_diferencias: "Con diferencias",
  cancelada: "Cancelada",
};

export default async function RecepcionPage() {
  const usuarioActual = await requerirRol(rolesPermitidos);
  const { rol } = usuarioActual.perfil;

  const puedeCrear = rolesPuedenCrear.includes(rol);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#18201b]">Recepción de mercancía</h1>
          <p className="text-sm text-[#5d6a61]">
            Historial de órdenes de recepción registradas
          </p>
        </div>
        {puedeCrear && (
          <Button size="sm">+ Nueva recepción</Button>
        )}
      </div>

      <div className="rounded-lg border border-[#dfe4dc] bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N.° de orden</TableHead>
              <TableHead>N.° de factura</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead className="text-right">Ítems</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordenesEjemplo.map((orden) => (
              <TableRow key={orden.numeroOrden}>
                <TableCell className="font-mono text-xs font-medium">
                  {orden.numeroOrden}
                </TableCell>
                <TableCell className="font-mono text-xs text-[#5d6a61]">
                  {orden.numeroFactura}
                </TableCell>
                <TableCell className="text-sm text-[#5d6a61]">
                  {orden.fecha}
                </TableCell>
                <TableCell className="text-sm">{orden.proveedor}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {orden.totalItems}
                </TableCell>
                <TableCell>
                  <Badge variant={varianteBadge[orden.estado]}>
                    {etiquetaEstado[orden.estado]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-[#9aad9e]">
        Mostrando {ordenesEjemplo.length} órdenes · Datos de ejemplo (Corte 2 conectará con Supabase)
      </p>
    </div>
  );
}
