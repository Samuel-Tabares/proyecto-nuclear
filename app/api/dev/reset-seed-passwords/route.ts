// ⚠️ TEMPORAL — eliminar antes del Paso 8 (cierre Corte 1)
import { NextResponse } from "next/server";

import { crearClienteAdmin } from "@/lib/supabase/admin";

const USUARIOS_SEED = [
  {
    id: "a0000001-0000-0000-0000-000000000001",
    email: "admin@sgil.test",
    nombre: "Ana Gómez",
    rol: "admin_sistema",
  },
  {
    id: "a0000001-0000-0000-0000-000000000002",
    email: "jefe@sgil.test",
    nombre: "Carlos Ríos",
    rol: "jefe_almacen",
  },
  {
    id: "a0000001-0000-0000-0000-000000000003",
    email: "recepcion@sgil.test",
    nombre: "María Torres",
    rol: "operador_recepcion",
  },
  {
    id: "a0000001-0000-0000-0000-000000000004",
    email: "despacho@sgil.test",
    nombre: "Luis Mora",
    rol: "operador_despacho",
  },
] as const;

const PASSWORD_SEED = "Test1234!";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "No disponible en producción." }, { status: 403 });
  }

  const admin = crearClienteAdmin();
  const resultados: { email: string; paso: string; ok: boolean; error?: string }[] = [];

  for (const usuario of USUARIOS_SEED) {
    // 1. Eliminar usuario existente (borra en cascade perfiles e identities)
    const { error: errorDelete } = await admin.auth.admin.deleteUser(usuario.id);
    resultados.push({
      email: usuario.email,
      paso: "delete",
      ok: !errorDelete,
      error: errorDelete?.message,
    });

    // 2. Recrear via Admin API (GoTrue crea auth.identities correctamente)
    const { data, error: errorCreate } = await admin.auth.admin.createUser({
      email: usuario.email,
      password: PASSWORD_SEED,
      email_confirm: true,
      user_metadata: { nombre: usuario.nombre, es_seed: true },
    });
    resultados.push({
      email: usuario.email,
      paso: "create",
      ok: !errorCreate,
      error: errorCreate?.message,
    });

    if (!errorCreate && data.user) {
      // 3. Asignar rol en perfiles (el trigger crea la fila con rol default)
      const { error: errorRol } = await admin
        .from("perfiles")
        .update({ rol: usuario.rol })
        .eq("id", data.user.id);
      resultados.push({
        email: usuario.email,
        paso: "rol",
        ok: !errorRol,
        error: errorRol?.message,
      });
    }
  }

  return NextResponse.json({ resultados });
}
