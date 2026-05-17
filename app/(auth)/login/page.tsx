import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { FormularioLogin } from "@/components/dominio/FormularioLogin";
import { obtenerUsuarioActual } from "@/lib/services/auth";

export const metadata: Metadata = {
  title: "Iniciar sesión | SGIL",
};

export default async function LoginPage() {
  const usuarioActual = await obtenerUsuarioActual();

  if (usuarioActual) {
    redirect("/");
  }

  return (
    <main className="min-h-dvh bg-[#eef1ec] text-[#18201b]">
      <div className="grid min-h-dvh lg:grid-cols-[0.92fr_1.08fr]">
        <section className="hidden border-r border-[#d7ddd5] bg-[#17201a] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#a9cdb3]">
              SGIL
            </p>
            <h1 className="mt-8 max-w-lg text-5xl font-semibold leading-[1.04]">
              Control operativo para inventario perecedero.
            </h1>
          </div>

          <div className="grid gap-3">
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[#a9cdb3]">
                Operación
              </p>
              <p className="mt-2 text-2xl font-semibold">
                Centro de distribución
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm text-[#dbe7de]">
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                Encargado
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                Producción
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                Dueño
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-[420px] rounded-lg border border-[#d7ddd5] bg-white p-6 shadow-[0_24px_80px_rgba(23,32,26,0.10)] sm:p-8">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#4a7356]">
                SGIL
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-normal">
                Iniciar sesión
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#5d6a61]">
                Accede con el correo y la contraseña registrados para tu rol.
              </p>
            </div>

            <FormularioLogin />
          </div>
        </section>
      </div>
    </main>
  );
}
