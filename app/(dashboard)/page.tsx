import {
  AlertTriangle,
  BarChart2,
  ClipboardList,
  Package,
  Truck,
  Users,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requerirRol } from "@/lib/services/auth";
import type { RolUsuario } from "@/lib/types/auth";

const rolesPermitidos: readonly RolUsuario[] = [
  "admin_sistema",
  "jefe_almacen",
  "operador_recepcion",
  "operador_despacho",
];

type AccesoRapido = {
  href: string;
  titulo: string;
  descripcion: string;
  icono: React.ReactNode;
  rolesPermitidos: readonly RolUsuario[];
};

const accesosRapidos: AccesoRapido[] = [
  {
    href: "/inventario",
    titulo: "Inventario",
    descripcion: "Consulta el stock actual de productos y alertas de reorden.",
    icono: <Package className="h-6 w-6" />,
    rolesPermitidos: ["admin_sistema", "jefe_almacen", "operador_recepcion", "operador_despacho"],
  },
  {
    href: "/recepcion",
    titulo: "Recepción",
    descripcion: "Registra y consulta las órdenes de recepción de mercancía.",
    icono: <ClipboardList className="h-6 w-6" />,
    rolesPermitidos: ["admin_sistema", "jefe_almacen", "operador_recepcion", "operador_despacho"],
  },
  {
    href: "/despachos",
    titulo: "Despachos",
    descripcion: "Gestiona las solicitudes de despacho y aprobaciones.",
    icono: <Truck className="h-6 w-6" />,
    rolesPermitidos: ["admin_sistema", "jefe_almacen", "operador_recepcion", "operador_despacho"],
  },
  {
    href: "/alertas",
    titulo: "Alertas",
    descripcion: "Revisa alertas de stock bajo y vencimientos próximos.",
    icono: <AlertTriangle className="h-6 w-6" />,
    rolesPermitidos: ["admin_sistema", "jefe_almacen", "operador_recepcion", "operador_despacho"],
  },
  {
    href: "/reportes",
    titulo: "Reportes y KPI",
    descripcion: "Dashboard de indicadores y exportación de reportes.",
    icono: <BarChart2 className="h-6 w-6" />,
    rolesPermitidos: ["admin_sistema", "jefe_almacen"],
  },
  {
    href: "/usuarios",
    titulo: "Gestión de usuarios",
    descripcion: "Administra cuentas, roles y estados de los usuarios.",
    icono: <Users className="h-6 w-6" />,
    rolesPermitidos: ["admin_sistema"],
  },
];

const etiquetasRol: Record<RolUsuario, string> = {
  admin_sistema: "Administrador del sistema",
  jefe_almacen: "Jefe de almacén",
  operador_recepcion: "Operador de recepción",
  operador_despacho: "Operador de despacho",
};

const descripcionRol: Record<RolUsuario, string> = {
  admin_sistema:
    "Tienes acceso completo al sistema, incluyendo la gestión de usuarios y todos los módulos operativos.",
  jefe_almacen:
    "Puedes supervisar inventario, aprobar despachos, revisar recepciones y consultar el dashboard de KPI.",
  operador_recepcion:
    "Puedes registrar recepciones de mercancía, consultar lotes y revisar el inventario actual.",
  operador_despacho:
    "Puedes crear solicitudes de despacho (pendientes de aprobación) y consultar el inventario.",
};

export default async function DashboardPage() {
  const usuarioActual = await requerirRol(rolesPermitidos);
  const { rol, nombre } = usuarioActual.perfil;

  const accesosFiltrados = accesosRapidos.filter((a) =>
    a.rolesPermitidos.includes(rol)
  );

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-[#dfe4dc] bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#4a7356]">
          {etiquetasRol[rol]}
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[#18201b]">
          Bienvenido, {nombre}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5d6a61]">
          {descripcionRol[rol]}
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#9aad9e]">
          Acceso rápido
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {accesosFiltrados.map((acceso) => (
            <a key={acceso.href} href={acceso.href}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base font-medium text-[#18201b]">
                    <span className="text-[#4a7356]">{acceso.icono}</span>
                    {acceso.titulo}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#5d6a61]">{acceso.descripcion}</p>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
