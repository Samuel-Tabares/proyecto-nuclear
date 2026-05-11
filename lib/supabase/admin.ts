import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

// Solo usar en server actions y route handlers — NUNCA en código de cliente.
export function crearClienteAdmin() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
