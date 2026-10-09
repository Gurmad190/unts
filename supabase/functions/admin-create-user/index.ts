const allowedOrigins = new Set(['https://unts-hvyz.vercel.app', 'http://localhost:5173', 'http://127.0.0.1:5173']);
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
if (!supabaseUrl || !serviceKey) throw new Error('Supabase function environment is incomplete');

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
    if (!(callerRoles ?? []).some((entry: { role?: string }) => entry.role === 'super_admin')) return json(request, { error: 'Only a Super Admin can create staff accounts' }, 403);

    const body = await request.json();
    const email = String(body.email ?? '').trim().toLowerCase();
    const fullName = String(body.fullName ?? '').trim();
    const password = String(body.password ?? '');
    const role = String(body.role ?? '');
    const phone = String(body.phone ?? '').trim();
    const allowedRoles = new Set(['super_admin', 'admin', 'admissions', 'registrar', 'faculty', 'finance']);
    if (!email || !fullName || password.length < 8 || !allowedRoles.has(role)) return json(request, { error: 'Provide a full name, valid email, staff role and a password of at least 8 characters.' }, 400);

    const created = await rest('/auth/v1/admin/users', { method: 'POST', body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { full_name: fullName } }) });
    const userId = created?.id;
    if (!userId) return json(request, { error: 'Could not create the account' }, 400);
    try {
      await rest('/rest/v1/profiles', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ id: userId, email, full_name: fullName, phone: phone || null, updated_at: new Date().toISOString() }) });
      await rest('/rest/v1/user_roles', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ user_id: userId, role }) });
    } catch (persistenceError) {
      await fetch(`${supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(userId)}`, { method: 'DELETE', headers: adminHeaders });
      throw persistenceError;
    }
    return json(request, { user: { id: userId, email, fullName, role } }, 201);
  } catch (error) {
    console.error(error);
    return json(request, { error: error instanceof Error ? error.message : 'Unexpected server error' }, 500);
  }
});
