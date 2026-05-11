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
  "operador_despacho",
];

const rolesPuedenAprobar: readonly RolUsuario[] = [
  "admin_sistema",
  "jefe_almacen",
];

type EstadoDespacho = "pendiente" | "aprobado" | "rechazado" | "entregado";

type Despacho = {
  id: string;
  fecha: string;
  destino: string;
  estado: EstadoDespacho;
  unidadesTotales: number;
  solicitadoPor: string;
};

const despachosEjemplo: Despacho[] = [
  { id: "D-2026-001", fecha: "2026-05-10", destino: "Línea de producción A", estado: "pendiente", unidadesTotales: 120, solicitadoPor: "Carlos Reyes" },
  { id: "D-2026-002", fecha: "2026-05-09", destino: "Línea de producción B", estado: "aprobado", unidadesTotales: 80, solicitadoPor: "María López" },
  { id: "D-2026-003", fecha: "2026-05-08", destino: "Punto de venta 1", estado: "entregado", unidadesTotales: 45, solicitadoPor: "Ana Torres" },
  { id: "D-2026-004", fecha: "2026-05-07", destino: "Línea de producción A", estado: "rechazado", unidadesTotales: 200, solicitadoPor: "Carlos Reyes" },
  { id: "D-2026-005", fecha: "2026-05-06", destino: "Punto de venta 2", estado: "pendiente", unidadesTotales: 60, solicitadoPor: "Luis Mora" },
  { id: "D-2026-006", fecha: "2026-05-05", destino: "Línea de producción C", estado: "aprobado", unidadesTotales: 150, solicitadoPor: "María López" },
];

const varianteBadge: Record<EstadoDespacho, "default" | "secondary" | "destructive" | "outline"> = {
  aprobado: "default",
  pendiente: "secondary",
  rechazado: "destructive",
  entregado: "outline",
};

const etiquetaEstado: Record<EstadoDespacho, string> = {
  pendiente: "Pendiente",
  aprobado: "Aprobado",
  rechazado: "Rechazado",
  entregado: "Entregado",
};

export default async function DespachosPage() {
  const usuarioActual = await requerirRol(rolesPermitidos);
  const { rol } = usuarioActual.perfil;

  const puedeCrear = rolesPuedenCrear.includes(rol);
  const puedeAprobar = rolesPuedenAprobar.includes(rol);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#18201b]">Despachos</h1>
          <p className="text-sm text-[#5d6a61]">
            Solicitudes de despacho de productos del inventario
          </p>
        </div>
        {puedeCrear && (
          <Button size="sm">+ Nuevo despacho</Button>
        )}
      </div>

      <div className="rounded-lg border border-[#dfe4dc] bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Destino interno</TableHead>
              <TableHead>Solicitado por</TableHead>
              <TableHead className="text-right">Unidades</TableHead>
              <TableHead>Estado</TableHead>
              {puedeAprobar && <TableHead className="w-24">Acción</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {despachosEjemplo.map((despacho) => (
              <TableRow key={despacho.id}>
                <TableCell className="font-mono text-xs font-medium">
                  {despacho.id}
                </TableCell>
                <TableCell className="text-sm text-[#5d6a61]">
                  {despacho.fecha}
                </TableCell>
                <TableCell className="text-sm">{despacho.destino}</TableCell>
                <TableCell className="text-sm text-[#5d6a61]">
                  {despacho.solicitadoPor}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {despacho.unidadesTotales}
                </TableCell>
                <TableCell>
                  <Badge variant={varianteBadge[despacho.estado]}>
                    {etiquetaEstado[despacho.estado]}
                  </Badge>
                </TableCell>
                {puedeAprobar && (
                  <TableCell>
                    {despacho.estado === "pendiente" && (
                      <Button variant="outline" size="sm" disabled>
                        Aprobar
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-[#9aad9e]">
        Mostrando {despachosEjemplo.length} despachos · Datos de ejemplo (Corte 2 conectará con Supabase)
      </p>
    </div>
  );
}
