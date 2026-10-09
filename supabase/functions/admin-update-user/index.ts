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
const allowedRoles = new Set(['super_admin', 'admin', 'admissions', 'registrar', 'faculty', 'finance', 'student', 'applicant']);

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
    const callerIsSuperAdmin = (callerRoles ?? []).some((entry: { role?: string }) => entry.role === 'super_admin');
    const callerIsAdmin = (callerRoles ?? []).some((entry: { role?: string }) => entry.role === 'admin');
    if (!callerIsSuperAdmin && !callerIsAdmin) {
      return json(request, { error: 'Only an Admin or Super Admin can update portal users' }, 403);
    }

    const body = await request.json();
    const userId = String(body.userId ?? '').trim();
    const fullName = String(body.fullName ?? '').trim();
    const phone = String(body.phone ?? '').trim();
    const role = String(body.role ?? '').trim();
    if (!userId || !fullName || !allowedRoles.has(role)) {
      return json(request, { error: 'Provide a profile, full name and valid portal role.' }, 400);
    }

    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/admin_update_user`, {
      method: 'POST',
      headers: { apikey: anonKey, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_user_id: userId, p_full_name: fullName, p_phone: phone || null, p_role: role }),
    });
    const result = await readJson(updateResponse);
    if (!updateResponse.ok) return json(request, { error: result?.message || result?.hint || 'Could not update the portal user' }, 400);

    return json(request, { user: result });
  } catch (error) {
    console.error(error);
    return json(request, { error: error instanceof Error ? error.message : 'Unexpected server error' }, 500);
  }
});
