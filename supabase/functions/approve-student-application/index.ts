const allowedOrigins = new Set(['https://unts-hvyz.vercel.app', 'http://localhost:5173', 'http://127.0.0.1:5173']);
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
if (!supabaseUrl || !serviceKey || !anonKey) throw new Error('Supabase function environment is incomplete');

const corsHeaders = (request: Request) => ({
  'Access-Control-Allow-Origin': allowedOrigins.has(request.headers.get('Origin') ?? '') ? request.headers.get('Origin')! : 'https://unts-hvyz.vercel.app',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
});
const json = (request: Request, body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders(request), 'Content-Type': 'application/json' } });
const adminHeaders = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' };

const readJson = async (response: Response) => {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return { message: text }; }
};
const rest = async (path: string, init: RequestInit = {}) => {
  const response = await fetch(`${supabaseUrl}${path}`, { ...init, headers: { ...adminHeaders, ...(init.headers ?? {}) } });
  const data = await readJson(response);
  if (!response.ok) throw new Error(data?.message || data?.error_description || 'Supabase request failed');
  return data;
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(request) });
  if (request.method !== 'POST') return json(request, { error: 'Method not allowed' }, 405);
  try {
    const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
    if (!token) return json(request, { error: 'Authentication required' }, 401);
    const callerResponse = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: { apikey: serviceKey, Authorization: `Bearer ${token}` } });
    const caller = await readJson(callerResponse);
    if (!callerResponse.ok || !caller?.id) return json(request, { error: 'Authentication required' }, 401);
    const callerRoles = await rest(`/rest/v1/user_roles?select=role&user_id=eq.${encodeURIComponent(caller.id)}`);
    if (!(callerRoles ?? []).some((entry: { role?: string }) => ['super_admin', 'admin', 'admissions'].includes(entry.role ?? ''))) return json(request, { error: 'You are not allowed to approve applications' }, 403);

    const body = await request.json();
    const applicationId = String(body.applicationId ?? '');
    const decision = String(body.decision ?? '');
    const notes = body.notes ? String(body.notes) : null;
    if (!applicationId || !['accepted', 'rejected', 'waitlisted'].includes(decision)) return json(request, { error: 'Application and a valid decision are required' }, 400);

    const applications = await rest(`/rest/v1/applications?select=id,applicant_id&id=eq.${encodeURIComponent(applicationId)}`);
    const application = applications?.[0];
    if (!application) return json(request, { error: 'Application not found' }, 404);
    const applicants = await rest(`/rest/v1/applicants?select=email,full_name&id=eq.${encodeURIComponent(application.applicant_id)}`);
    const applicant = applicants?.[0];
    if (!applicant) return json(request, { error: 'Applicant not found' }, 404);

    let temporaryPassword: string | null = null;
    let accountCreated = false;
    let authUserId: string | null = null;
    const profiles = await rest(`/rest/v1/profiles?select=id&email=ilike.${encodeURIComponent(applicant.email)}`);
    if (profiles?.[0]?.id) {
      authUserId = profiles[0].id;
    } else if (decision === 'accepted') {
      temporaryPassword = `UNS-${crypto.randomUUID().replaceAll('-', '').slice(0, 12)}a1`;
      const createResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, { method: 'POST', headers: adminHeaders, body: JSON.stringify({ email: applicant.email, password: temporaryPassword, email_confirm: true, user_metadata: { full_name: applicant.full_name, must_reset_password: true } }) });
      const created = await readJson(createResponse);
      if (!createResponse.ok || !created?.id) return json(request, { error: created?.msg || created?.message || 'Could not create the student account' }, 400);
      authUserId = created.id;
      accountCreated = true;
    }

    const approvalResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/approve_application`, {
      method: 'POST',
      headers: { apikey: anonKey, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_application_id: applicationId, p_decision: decision, p_notes: notes }),
    });
    const result = await readJson(approvalResponse);
    if (!approvalResponse.ok) {
      if (accountCreated && authUserId) await fetch(`${supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(authUserId)}`, { method: 'DELETE', headers: adminHeaders });
      return json(request, { error: result?.message || result?.hint || 'Application decision failed' }, 400);
    }

    if (decision === 'accepted' && authUserId) {
      const metadataResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(authUserId)}`, {
        method: 'PUT',
        headers: adminHeaders,
        body: JSON.stringify({ user_metadata: { full_name: applicant.full_name, must_reset_password: true } }),
      });
      if (!metadataResponse.ok) {
        console.error('Student account was accepted but could not be marked for first-login password reset');
      }
    }

    return json(request, { result: Array.isArray(result) ? result[0] : result, accountCreated, temporaryPassword });
  } catch (error) {
    console.error(error);
    return json(request, { error: error instanceof Error ? error.message : 'Unexpected server error' }, 500);
  }
});
