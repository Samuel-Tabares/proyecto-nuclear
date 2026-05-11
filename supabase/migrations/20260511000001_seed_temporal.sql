-- ============================================================
-- ⚠️  TEMPORAL — seed de usuarios de prueba
-- ============================================================
-- Eliminar ANTES de ir a producción.
-- Opciones para eliminarlo:
--   A) Botón "Eliminar datos de prueba" en el dashboard de la app.
--   B) SQL directo:
--      DELETE FROM auth.users
--      WHERE raw_user_meta_data->>'es_seed' = 'true';
-- ============================================================

DO $$
DECLARE
  uid_admin         uuid := 'a0000001-0000-0000-0000-000000000001';
  uid_jefe          uuid := 'a0000001-0000-0000-0000-000000000002';
  uid_recepcion     uuid := 'a0000001-0000-0000-0000-000000000003';
  uid_despacho      uuid := 'a0000001-0000-0000-0000-000000000004';
BEGIN
  -- Insertar en auth.users.
  -- El trigger crear_perfil_usuario crea automáticamente las filas en perfiles.
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, email_change_token_new, recovery_token
  ) VALUES
    (
      uid_admin,
      '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'admin@sgil.test',
      crypt('Test1234!', gen_salt('bf', 10)),
      now(),
      '{"nombre": "Ana Gómez", "es_seed": true}'::jsonb,
      now(), now(), '', '', ''
    ),
    (
      uid_jefe,
      '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'jefe@sgil.test',
      crypt('Test1234!', gen_salt('bf', 10)),
      now(),
      '{"nombre": "Carlos Ríos", "es_seed": true}'::jsonb,
      now(), now(), '', '', ''
    ),
    (
      uid_recepcion,
      '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'recepcion@sgil.test',
      crypt('Test1234!', gen_salt('bf', 10)),
      now(),
      '{"nombre": "María Torres", "es_seed": true}'::jsonb,
      now(), now(), '', '', ''
    ),
    (
      uid_despacho,
      '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'despacho@sgil.test',
      crypt('Test1234!', gen_salt('bf', 10)),
      now(),
      '{"nombre": "Luis Mora", "es_seed": true}'::jsonb,
      now(), now(), '', '', ''
    )
  ON CONFLICT (id) DO NOTHING;

  -- Asignar roles correctos (el trigger deja el default 'operador_despacho').
  UPDATE public.perfiles SET rol = 'admin_sistema'      WHERE id = uid_admin;
  UPDATE public.perfiles SET rol = 'jefe_almacen'       WHERE id = uid_jefe;
  UPDATE public.perfiles SET rol = 'operador_recepcion' WHERE id = uid_recepcion;
  -- uid_despacho ya tiene el default correcto, pero lo explicitamos:
  UPDATE public.perfiles SET rol = 'operador_despacho'  WHERE id = uid_despacho;
END $$;
