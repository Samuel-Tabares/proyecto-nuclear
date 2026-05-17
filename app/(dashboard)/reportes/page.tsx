import { DashboardKPI } from "@/components/dominio/DashboardKPI";
import { requerirRol } from "@/lib/services/auth";
import type { RolUsuario } from "@/lib/types/auth";

const rolesPermitidos: readonly RolUsuario[] = ["admin_sistema", "jefe_almacen"];

export default async function ReportesPage() {
  await requerirRol(rolesPermitidos);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-[#18201b]">
          Dashboard KPI y Reportes
        </h1>
        <p className="text-sm text-[#5d6a61]">
          Indicadores clave de desempeño del centro de distribución
        </p>
      </div>
      <DashboardKPI />
    </div>
  );
}
