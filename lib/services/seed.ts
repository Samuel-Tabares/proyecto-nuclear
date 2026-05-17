"use server";

// ⚠️ TEMPORAL — eliminar este archivo antes de ir a producción.

import { redirect } from "next/navigation";

import { crearClienteAdmin } from "@/lib/supabase/admin";
import { crearClienteSupabase } from "@/lib/supabase/server";

export async function eliminarSeed(): Promise<void> {
  const admin = crearClienteAdmin();

  // Obtener todos los usuarios marcados como seed
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });

  if (!error && data?.users) {
    const usuariosSeed = data.users.filter(
      (u) => u.user_metadata?.es_seed === true
    );

    for (const usuario of usuariosSeed) {
      await admin.auth.admin.deleteUser(usuario.id);
    }
  }

  // Cerrar la sesión del usuario actual (puede ser un seed user)
  const supabase = await crearClienteSupabase();
  await supabase.auth.signOut();

  redirect("/login");
}
