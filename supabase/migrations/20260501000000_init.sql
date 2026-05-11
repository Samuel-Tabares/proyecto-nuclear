create type public.rol_usuario as enum (
  'encargado',
  'jefe_produccion',
  'dueno'
);

create table public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  rol public.rol_usuario not null default 'dueno',
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

comment on table public.perfiles is 'Perfiles de usuarios del SGIL vinculados con auth.users.';
comment on column public.perfiles.rol is 'Rol usado para control de acceso por RF-02.';
comment on column public.perfiles.activo is 'Permite bloquear inicio de sesion para usuarios inactivos segun RF-01.';

create function public.crear_perfil_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  nombre_usuario text;
begin
  nombre_usuario := coalesce(
    nullif(new.raw_user_meta_data ->> 'nombre', ''),
    nullif(split_part(new.email, '@', 1), ''),
    'Usuario'
  );

  insert into public.perfiles (id, nombre)
  values (new.id, nombre_usuario)
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger crear_perfil_despues_registro
after insert on auth.users
for each row execute function public.crear_perfil_usuario();

alter table public.perfiles enable row level security;

create policy "Usuarios autenticados leen su perfil"
on public.perfiles
for select
to authenticated
using (auth.uid() = id);

create policy "Usuarios autenticados actualizan su nombre"
on public.perfiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

grant usage on schema public to authenticated;
grant select on public.perfiles to authenticated;
grant update (nombre) on public.perfiles to authenticated;
