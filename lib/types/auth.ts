import type { User } from "@supabase/supabase-js";

import type { Enums, Tables } from "@/lib/supabase/database.types";

export type RolUsuario = Enums<"rol_usuario">;
export type PerfilUsuario = Tables<"perfiles">;

export type UsuarioActual = {
  user: User;
  perfil: PerfilUsuario;
};

export type EstadoFormularioAuth = {
  campos?: {
    email?: string;
  };
  errores?: {
    email?: string[];
    password?: string[];
  };
  mensaje?: string;
};
