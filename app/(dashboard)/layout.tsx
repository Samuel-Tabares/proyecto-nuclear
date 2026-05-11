import { LogOut } from "lucide-react";
import type { ReactNode } from "react";

import { Sidebar } from "@/components/dominio/Sidebar";
import { Button } from "@/components/ui/button";
import { cerrarSesion, requerirRol } from "@/lib/services/auth";
import type { RolUsuario } from "@/lib/types/auth";

const rolesDashboard: readonly RolUsuario[] = [
  "admin_sistema",
  "jefe_almacen",
  "operador_recepcion",
  "operador_despacho",
];

const etiquetasRol: Record<RolUsuario, string> = {
  admin_sistema: "Administrador del sistema",
  jefe_almacen: "Jefe de almacén",
  operador_recepcion: "Operador de recepción",
  operador_despacho: "Operador de despacho",
};

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const usuarioActual = await requerirRol(rolesDashboard);
  const { rol, nombre } = usuarioActual.perfil;

  return (
    <div className="min-h-dvh bg-[#f6f7f4] text-[#18201b]">
      <header className="sticky top-0 z-10 border-b border-[#dfe4dc] bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold tracking-tight text-[#2d5a3d]">
              SGIL
            </span>
            <span className="hidden h-4 w-px bg-[#dfe4dc] sm:block" />
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-[#18201b]">{nombre}</p>
              <p className="text-xs text-[#5d6a61]">{etiquetasRol[rol]}</p>
            </div>
          </div>

          <form action={cerrarSesion}>
            <Button variant="outline" size="sm" type="submit">
              <LogOut aria-hidden="true" className="h-4 w-4" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </Button>
          </form>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 sm:px-6">
        <Sidebar rol={rol} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
