-- UNS first-admin security hardening
-- Additive/alterative only: no data deletion, no RLS disablement, no key changes.

-- Only a Super Admin may administer application roles. This prevents an ordinary
-- Admin from granting Super Admin to themselves or another user.
alter policy roles_admin on public.user_roles
  using (public.has_role('super_admin'))
  with check (public.has_role('super_admin'));

-- Prevent accidental removal or demotion of the last active Super Admin.
create or replace function public.prevent_last_super_admin_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  remaining_super_admins integer;
begin
  if tg_op = 'DELETE' and old.role <> 'super_admin' then
    return old;
  end if;

  if tg_op = 'UPDATE' and old.role <> 'super_admin' then
    return new;
  end if;

  if tg_op = 'UPDATE' and new.role = 'super_admin' then
    return new;
  end if;

  select count(*)::integer into remaining_super_admins
  from public.user_roles ur
  join auth.users au on au.id = ur.user_id
  where ur.role = 'super_admin'
    and ur.user_id <> old.user_id
    and au.banned_until is null;

  if remaining_super_admins < 1 then
    raise exception 'Cannot remove or demote the last active Super Admin';
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgrelid = 'public.user_roles'::regclass
      and tgname = 'protect_last_super_admin'
  ) then
    create trigger protect_last_super_admin
      before delete or update of role on public.user_roles
      for each row execute function public.prevent_last_super_admin_change();
  end if;
end;
$$;

-- The user already exists in Auth. Create exactly one application role and do not
-- create a duplicate Auth account or any demo data.
insert into public.user_roles (user_id, role)
values ('c2dfd5f2-57e2-4d7f-b93c-1a04789fc8d1', 'super_admin')
on conflict (user_id, role) do nothing;
