import { LogOut } from "lucide-react";
import type { ReactNode } from "react";

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

  return (
    <div className="min-h-dvh bg-[#f6f7f4] text-[#18201b]">
      <header className="border-b border-[#dfe4dc] bg-white/90">
        <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#4a7356]">
              SGIL
            </p>
            <p className="text-sm text-[#5d6a61]">
              {usuarioActual.perfil.nombre} ·{" "}
              {etiquetasRol[usuarioActual.perfil.rol]}
            </p>
          </div>

          <form action={cerrarSesion}>
            <Button variant="outline" type="submit">
              <LogOut aria-hidden="true" />
              Cerrar sesión
            </Button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
