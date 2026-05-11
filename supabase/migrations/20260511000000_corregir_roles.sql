-- Renombrar los tres valores incorrectos a los correctos
ALTER TYPE public.rol_usuario RENAME VALUE 'encargado'       TO 'admin_sistema';
ALTER TYPE public.rol_usuario RENAME VALUE 'jefe_produccion' TO 'jefe_almacen';
ALTER TYPE public.rol_usuario RENAME VALUE 'dueno'           TO 'operador_despacho';

-- Agregar el cuarto valor que faltaba
ALTER TYPE public.rol_usuario ADD VALUE IF NOT EXISTS 'operador_recepcion';

-- Corregir el default de la columna rol
ALTER TABLE public.perfiles
  ALTER COLUMN rol SET DEFAULT 'operador_despacho';
