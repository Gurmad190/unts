create or replace function public.submit_application(
  p_email text,
  p_full_name text,
  p_phone text,
  p_date_of_birth date,
  p_nationality text,
  p_address text,
  p_program_id uuid,
  p_term_id uuid
)
returns table(application_id uuid, application_number text)
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  v_applicant_id uuid;
  v_application_id uuid;
  v_application_number text;
begin
  if lower(trim(coalesce(p_email, ''))) = '' or trim(coalesce(p_full_name, '')) = '' then
    raise exception 'Full name and email are required' using errcode = '22023';
  end if;

  if not exists (select 1 from public.programs where id = p_program_id and active = true) then
    raise exception 'The selected programme is not available' using errcode = '23503';
  end if;

  if not exists (select 1 from public.academic_terms where id = p_term_id and is_current = true) then
    raise exception 'The selected academic term is not currently accepting applications' using errcode = '23503';
  end if;

  insert into public.applicants (email, full_name, phone, date_of_birth, nationality, address)
  values (lower(trim(p_email)), trim(p_full_name), nullif(trim(p_phone), ''), p_date_of_birth, nullif(trim(p_nationality), ''), nullif(trim(p_address), ''))
  on conflict (email) do update set
    full_name = excluded.full_name,
    phone = excluded.phone,
    date_of_birth = excluded.date_of_birth,
    nationality = excluded.nationality,
    address = excluded.address,
    updated_at = now()
  returning id into v_applicant_id;

  v_application_number := format('UNS-%s-%s', to_char(current_date, 'YYYY'), upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)));

  insert into public.applications (applicant_id, program_id, term_id, application_number, status)
  values (v_applicant_id, p_program_id, p_term_id, v_application_number, 'applied')
  on conflict (applicant_id, program_id, term_id) do update set updated_at = now()
  returning id, applications.application_number into v_application_id, v_application_number;

  return query select v_application_id, v_application_number;
end;
$function$;