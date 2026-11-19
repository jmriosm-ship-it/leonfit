-- LeonFit · configuración de Supabase (se ejecuta UNA sola vez)
-- Supabase > SQL Editor > New query > pega todo esto > Run.

-- 1) Tabla con todos los datos de la tienda (productos, categorías, combos y ajustes) en una sola fila.
create table if not exists public.site_data (
  id int primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

alter table public.site_data enable row level security;

-- Cualquiera puede LEER la tienda...
drop policy if exists "tienda publica" on public.site_data;
create policy "tienda publica" on public.site_data for select using (true);

-- ...pero solo el administrador (usuario con sesión) puede escribir.
drop policy if exists "admin escribe" on public.site_data;
create policy "admin escribe" on public.site_data for insert to authenticated with check (true);
drop policy if exists "admin actualiza" on public.site_data;
create policy "admin actualiza" on public.site_data for update to authenticated using (true) with check (true);

-- 2) Carpeta pública para las fotos de los productos.
insert into storage.buckets (id, name, public) values ('products', 'products', true)
on conflict (id) do nothing;

drop policy if exists "fotos publicas" on storage.objects;
create policy "fotos publicas" on storage.objects for select using (bucket_id = 'products');
drop policy if exists "admin sube fotos" on storage.objects;
create policy "admin sube fotos" on storage.objects for insert to authenticated with check (bucket_id = 'products');
drop policy if exists "admin borra fotos" on storage.objects;
create policy "admin borra fotos" on storage.objects for delete to authenticated using (bucket_id = 'products');

-- 3) El administrador se crea en Supabase > Authentication > Users > Add user
--    (correo + contraseña, marca "Auto Confirm User"). Desactiva los registros públicos en
--    Authentication > Providers > Email > "Allow new users to sign up" para que nadie más pueda crear cuentas.
