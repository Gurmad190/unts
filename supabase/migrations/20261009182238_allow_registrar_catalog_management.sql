drop policy if exists departments_admin on public.departments;
create policy departments_admin
  on public.departments
  for all
  to authenticated
  using (has_any_role(ARRAY['super_admin', 'admin', 'registrar']::text[]))
  with check (has_any_role(ARRAY['super_admin', 'admin', 'registrar']::text[]));