"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type KPI = {
  titulo: string;
  valor: string;
  descripcion: string;
  tendencia: "up" | "down" | "neutral";
};

const kpis: KPI[] = [
  {
    titulo: "Rotación de inventario",
    valor: "4.2×",
    descripcion: "Veces que se renueva el inventario en el período",
    tendencia: "up",
  },
  {
    titulo: "Exactitud de inventario",
    valor: "97.3%",
    descripcion: "Coincidencia entre sistema y conteo físico",
    tendencia: "up",
  },
  {
    titulo: "Nivel de servicio",
    valor: "94.1%",
    descripcion: "Pedidos atendidos sin quiebre de stock",
    tendencia: "down",
  },
  {
    titulo: "Utilización del almacén",
    valor: "68.5%",
    descripcion: "Capacidad de almacenamiento ocupada",
    tendencia: "neutral",
  },
];

const datosRotacion = [
  { mes: "Ene", valor: 3.8 },
  { mes: "Feb", valor: 4.1 },
  { mes: "Mar", valor: 3.9 },
  { mes: "Abr", valor: 4.5 },
  { mes: "May", valor: 4.2 },
];

const datosCategorias = [
  { name: "Harinas", value: 35 },
  { name: "Lácteos", value: 25 },
  { name: "Endulzantes", value: 20 },
  { name: "Chocolates", value: 12 },
  { name: "Otros", value: 8 },
];

const COLORES = ["#2d5a3d", "#4a7356", "#6b9e7c", "#9aad9e", "#dfe4dc"];

const flechaTendencia: Record<KPI["tendencia"], string> = {
  up: "↑",
  down: "↓",
  neutral: "→",
};

const colorTendencia: Record<KPI["tendencia"], string> = {
  up: "text-emerald-600",
  down: "text-red-500",
  neutral: "text-[#5d6a61]",
};

export function DashboardKPI() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.titulo}>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-medium text-[#5d6a61]">
                {kpi.titulo}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-[#18201b]">
                  {kpi.valor}
                </span>
                <span
                  className={`mb-1 text-sm font-medium ${colorTendencia[kpi.tendencia]}`}
                >
                  {flechaTendencia[kpi.tendencia]}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#9aad9e]">{kpi.descripcion}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[#5d6a61]">
              Rotación de inventario — últimos 5 meses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={datosRotacion}
                margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#dfe4dc" />
                <XAxis
                  dataKey="mes"
                  tick={{ fontSize: 12, fill: "#5d6a61" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#5d6a61" }}
                  domain={[0, 6]}
                />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderColor: "#dfe4dc" }}
                  formatter={(v) => [`${v}×`, "Rotación"]}
                />
                <Bar dataKey="valor" fill="#4a7356" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[#5d6a61]">
              Distribución de stock por categoría
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={datosCategorias}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  dataKey="value"
                  label={false}
                  labelLine={false}
                >
                  {datosCategorias.map((_, index) => (
                    <Cell
                      key={index}
                      fill={COLORES[index % COLORES.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ fontSize: 12, borderColor: "#dfe4dc" }}
                  formatter={(v) => [`${v}%`, "Participación"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-[#9aad9e]">
        Datos de ejemplo · Corte 3 integrará datos reales con exportación a Excel/PDF
      </p>
    </div>
  );
}
