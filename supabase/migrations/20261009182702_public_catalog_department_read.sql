grant select on table public.departments to anon;
drop policy if exists departments_public_catalog_read on public.departments;
create policy departments_public_catalog_read
  on public.departments
  for select
  to anon
  using (true);