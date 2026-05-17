"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { forbidden, redirect } from "next/navigation";

import { esquemaInicioSesion } from "@/lib/schemas/auth";
import { crearClienteSupabase } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import type {
  EstadoFormularioAuth,
  PerfilUsuario,
  RolUsuario,
  UsuarioActual,
} from "@/lib/types/auth";

async function obtenerPerfilPorUsuario(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<PerfilUsuario | null> {
  const { data: perfil, error } = await supabase
    .from("perfiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return null;
  }

  return perfil;
}

export async function iniciarSesion(
  _estado: EstadoFormularioAuth,
  formData: FormData
): Promise<EstadoFormularioAuth> {
  const campos = {
    email: String(formData.get("email") ?? ""),
  };

  const resultado = esquemaInicioSesion.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!resultado.success) {
    return {
      campos,
      errores: resultado.error.flatten().fieldErrors,
      mensaje: "Revisa los campos marcados.",
    };
  }

  const supabase = await crearClienteSupabase();
  const { data, error } = await supabase.auth.signInWithPassword(
    resultado.data
  );

  if (error || !data.user) {
    return {
      campos,
      mensaje: "Las credenciales no son válidas.",
    };
  }

  const perfil = await obtenerPerfilPorUsuario(supabase, data.user.id);

  if (!perfil) {
    await supabase.auth.signOut();

    return {
      campos,
      mensaje: "No se encontró un perfil activo para este usuario.",
    };
  }

  if (!perfil.activo) {
    await supabase.auth.signOut();

    return {
      campos,
      mensaje: "El usuario está inactivo. Contacta al administrador.",
    };
  }

  redirect("/");
}

export async function cerrarSesion(): Promise<void> {
  const supabase = await crearClienteSupabase();

  await supabase.auth.signOut();

  redirect("/login");
}

export async function obtenerUsuarioActual(): Promise<UsuarioActual | null> {
  const supabase = await crearClienteSupabase();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const perfil = await obtenerPerfilPorUsuario(supabase, user.id);

  if (!perfil) {
    return null;
  }

  if (!perfil.activo) {
    await supabase.auth.signOut();
    return null;
  }

  return {
    user,
    perfil,
  };
}

export async function requerirRol(
  rolesPermitidos: readonly RolUsuario[]
): Promise<UsuarioActual> {
  const usuarioActual = await obtenerUsuarioActual();

  if (!usuarioActual) {
    redirect("/login");
  }

  if (!rolesPermitidos.includes(usuarioActual.perfil.rol)) {
    forbidden();
  }

  return usuarioActual;
}
