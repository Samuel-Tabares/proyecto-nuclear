import Link from "next/link";

export default function Forbidden() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#f6f7f4] px-6 text-[#18201b]">
      <section className="w-full max-w-md rounded-lg border border-[#dfe4dc] bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#4a7356]">
          403
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Acceso denegado</h1>
        <p className="mt-3 text-sm leading-6 text-[#5d6a61]">
          Tu rol no tiene permisos para abrir este recurso.
        </p>
        <Link
          className="mt-6 inline-flex h-9 items-center justify-center rounded-md bg-[#253026] px-3 text-sm font-medium text-white transition hover:bg-[#314233]"
          href="/"
        >
          Volver al panel
        </Link>
      </section>
    </main>
  );
}
