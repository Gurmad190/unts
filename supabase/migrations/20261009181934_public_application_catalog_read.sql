grant select on table public.programs, public.academic_terms to anon;

drop policy if exists programs_public_application_read on public.programs;
create policy programs_public_application_read
  on public.programs
  for select
  to anon
  using (active = true);

drop policy if exists terms_public_application_read on public.academic_terms;
create policy terms_public_application_read
  on public.academic_terms
  for select
  to anon
  using (is_current = true);