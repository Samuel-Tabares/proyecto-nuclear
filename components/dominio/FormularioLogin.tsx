"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { iniciarSesion } from "@/lib/services/auth";
import type { EstadoFormularioAuth } from "@/lib/types/auth";

const estadoInicial: EstadoFormularioAuth = {
  campos: {
    email: "",
  },
};

export function FormularioLogin() {
  const [estado, accionFormulario, pendiente] = useActionState(
    iniciarSesion,
    estadoInicial
  );

  const errorEmail = estado.errores?.email?.at(0);
  const errorPassword = estado.errores?.password?.at(0);

  return (
    <form action={accionFormulario} className="grid gap-5" noValidate>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-[#253026]" htmlFor="email">
          Correo electrónico
        </label>
        <input
          aria-describedby={errorEmail ? "email-error" : undefined}
          aria-invalid={Boolean(errorEmail)}
          autoComplete="email"
          className="h-11 rounded-md border border-[#cbd4cd] bg-[#fbfcfb] px-3 text-sm outline-none transition focus:border-[#4a7356] focus:ring-3 focus:ring-[#4a7356]/15 aria-invalid:border-destructive aria-invalid:ring-destructive/15"
          defaultValue={estado.campos?.email}
          id="email"
          name="email"
          placeholder="usuario@empresa.com"
          type="email"
        />
        {errorEmail ? (
          <p className="text-sm text-destructive" id="email-error">
            {errorEmail}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <label
          className="text-sm font-medium text-[#253026]"
          htmlFor="password"
        >
          Contraseña
        </label>
        <input
          aria-describedby={errorPassword ? "password-error" : undefined}
          aria-invalid={Boolean(errorPassword)}
          autoComplete="current-password"
          className="h-11 rounded-md border border-[#cbd4cd] bg-[#fbfcfb] px-3 text-sm outline-none transition focus:border-[#4a7356] focus:ring-3 focus:ring-[#4a7356]/15 aria-invalid:border-destructive aria-invalid:ring-destructive/15"
          id="password"
          name="password"
          type="password"
        />
        {errorPassword ? (
          <p className="text-sm text-destructive" id="password-error">
            {errorPassword}
          </p>
        ) : null}
      </div>

      {estado.mensaje ? (
        <p aria-live="polite" className="text-sm text-destructive">
          {estado.mensaje}
        </p>
      ) : null}

      <Button
        className="h-11 w-full bg-[#253026] text-white hover:bg-[#314233]"
        disabled={pendiente}
        type="submit"
      >
        {pendiente ? "Validando..." : "Entrar"}
      </Button>
    </form>
  );
}
