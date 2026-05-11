# TEMPORAL — Limpieza antes del Paso 8 (cierre Corte 1)

> Hacer esto ANTES de `pnpm build` final y del tag `v0.1.0-corte1`.

## Paso A — Eliminar los usuarios de prueba de Supabase

1. Entrar a la app con cualquier usuario de prueba.
2. Hacer clic en el botón **"Eliminar datos de prueba"** del banner amarillo.
3. Confirmar que redirige al login y que los 4 usuarios ya no aparecen en
   Supabase Dashboard → Authentication → Users.

Usuarios que se eliminan:
- `admin@sgil.test` (admin_sistema)
- `jefe@sgil.test` (jefe_almacen)
- `recepcion@sgil.test` (operador_recepcion)
- `despacho@sgil.test` (operador_despacho)

## Paso B — Borrar archivos temporales del código

```bash
rm lib/services/seed.ts
rm lib/supabase/admin.ts
rm supabase/migrations/20260511000001_seed_temporal.sql
rm TEMPORAL.md   # este archivo
```

## Paso C — Limpiar layout.tsx

En `app/(dashboard)/layout.tsx` eliminar:

1. El import de `eliminarSeed`:
   ```ts
   import { eliminarSeed } from "@/lib/services/seed";
   ```

2. El bloque completo marcado con `⚠️ TEMPORAL` (el div con fondo `amber-50`
   que contiene el banner y el botón).

3. El import de `Trash2` de lucide-react (si no se usa en otro lugar).

## Paso D — Verificar y commitear

```bash
grep -r "seed\|TEMPORAL\|es_seed\|eliminarSeed" app/ lib/ --include="*.ts" --include="*.tsx"
# debe salir vacío

pnpm build   # debe pasar sin errores
```

Commit:
```
chore: eliminar seed temporal y banner de pruebas antes del cierre Corte 1
```

---

Credenciales mientras el seed esté activo (contraseña: `Test1234!`):

| Email                  | Rol                  |
|------------------------|----------------------|
| admin@sgil.test        | admin_sistema        |
| jefe@sgil.test         | jefe_almacen         |
| recepcion@sgil.test    | operador_recepcion   |
| despacho@sgil.test     | operador_despacho    |
