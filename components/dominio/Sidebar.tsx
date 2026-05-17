import Link from "next/link";
import {
  AlertTriangle,
  BarChart2,
  ClipboardList,
  FileText,
  Package,
  Truck,
  Users,
} from "lucide-react";

import type { RolUsuario } from "@/lib/types/auth";

type EnlaceNav = {
  href: string;
  etiqueta: string;
  icono: React.ReactNode;
  rolesPermitidos: readonly RolUsuario[];
};

const enlaces: EnlaceNav[] = [
  {
    href: "/inventario",
    etiqueta: "Inventario",
    icono: <Package size={16} />,
    rolesPermitidos: ["admin_sistema", "jefe_almacen", "operador_recepcion", "operador_despacho"],
  },
  {
    href: "/recepcion",
    etiqueta: "Recepción",
    icono: <ClipboardList size={16} />,
    rolesPermitidos: ["admin_sistema", "jefe_almacen", "operador_recepcion", "operador_despacho"],
  },
  {
    href: "/despachos",
    etiqueta: "Despachos",
    icono: <Truck size={16} />,
    rolesPermitidos: ["admin_sistema", "jefe_almacen", "operador_recepcion", "operador_despacho"],
  },
  {
    href: "/alertas",
    etiqueta: "Alertas",
    icono: <AlertTriangle size={16} />,
    rolesPermitidos: ["admin_sistema", "jefe_almacen", "operador_recepcion", "operador_despacho"],
  },
  {
    href: "/reportes",
    etiqueta: "Reportes y KPI",
    icono: <BarChart2 size={16} />,
    rolesPermitidos: ["admin_sistema", "jefe_almacen"],
  },
  {
    href: "/usuarios",
    etiqueta: "Gestión de usuarios",
    icono: <Users size={16} />,
    rolesPermitidos: ["admin_sistema"],
  },
];

export function Sidebar({ rol }: { rol: RolUsuario }) {
  const enlacesFiltrados = enlaces.filter((e) =>
    e.rolesPermitidos.includes(rol)
  );

  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <nav className="sticky top-6 rounded-lg border border-[#dfe4dc] bg-white p-3 shadow-sm">
        <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-widest text-[#9aad9e]">
          Módulos
        </p>
        <ul className="space-y-0.5">
          {enlacesFiltrados.map((enlace) => (
            <li key={enlace.href}>
              <Link
                href={enlace.href}
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-[#18201b] transition-colors hover:bg-[#f0f4f0] hover:text-[#2d5a3d]"
              >
                <span className="text-[#4a7356]">{enlace.icono}</span>
                {enlace.etiqueta}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-4 border-t border-[#dfe4dc] pt-4">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-widest text-[#9aad9e]">
            Documentos
          </p>
          <Link
            href="/lotes"
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-[#18201b] transition-colors hover:bg-[#f0f4f0] hover:text-[#2d5a3d]"
          >
            <span className="text-[#4a7356]">
              <FileText size={16} />
            </span>
            Lotes
          </Link>
        </div>
      </nav>
    </aside>
  );
}
