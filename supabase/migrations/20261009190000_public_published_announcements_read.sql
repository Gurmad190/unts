-- Allow anonymous visitors to read only published University announcements.
-- Drafts and staff-managed content remain protected by existing policies.
create policy announcements_public_read
  on public.announcements
  for select
  to anon
  using (status = 'published');
