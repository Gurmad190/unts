import React, { useEffect, useState } from 'react';
import { KeyRound, ShieldCheck, UserPlus } from 'lucide-react';
import { Button, EmptyState, Input, Notice, PageHeader, Select, StatusBadge, cardClass } from '../../components/portal/ui';
import { useAuthStore } from '../../store/authStore';
import { usePortalStore } from '../../store/portalStore';

const AdminUsers: React.FC = () => {
  const { user } = useAuthStore();
  const { users, isLoading, error, loadUsers, addStaffUser } = usePortalStore();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', role: 'admin', password: '' });
  useEffect(() => { if (user?.systemRole === 'super_admin') void loadUsers(); }, [loadUsers, user?.systemRole]);

  if (user?.systemRole !== 'super_admin') return <div className="mx-auto max-w-xl"><Notice tone="error">Only a Super Admin can manage staff accounts.</Notice></div>;
  const save = async (event: React.FormEvent) => { event.preventDefault(); setSaving(true); setSuccess(null); try { await addStaffUser(form); setSuccess(`${form.fullName} can now sign in with the assigned ${form.role.replace('_', ' ')} role.`); setForm({ fullName: '', email: '', phone: '', role: 'admin', password: '' }); setShowForm(false); } catch { /* store exposes the error */ } finally { setSaving(false); } };

  return <div className="space-y-8"><PageHeader eyebrow="Access control" title="User access" description="Create staff credentials and assign the minimum role they need. Student accounts are created from approved applications, not here." action={<Button onClick={() => setShowForm((value) => !value)}><UserPlus className="mr-1.5 h-4 w-4" /> Create staff account</Button>} />
    {success && <Notice tone="success">{success}</Notice>}{error && <Notice tone="error">{error}</Notice>}
    {showForm && <form onSubmit={save} className={`${cardClass} space-y-4 p-6`}><div className="flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-amber-300"><KeyRound className="h-5 w-5" /></div><div><h2 className="font-semibold">New staff account</h2><p className="mt-1 text-sm text-slate-500">The account is confirmed immediately. Share the password through a secure channel.</p></div></div><div className="grid gap-4 sm:grid-cols-2"><Input required placeholder="Full name" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} /><Input required type="email" placeholder="Email address" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /><Input placeholder="Phone number" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /><Select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}><option value="admin">Admin</option><option value="admissions">Admissions</option><option value="registrar">Registrar</option><option value="faculty">Faculty</option><option value="finance">Finance</option><option value="super_admin">Super Admin</option></Select></div><Input required minLength={8} type="password" placeholder="Temporary password (8+ characters)" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /><div className="flex gap-2"><Button disabled={saving}>Create account</Button><Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button></div></form>}
    <section className={`${cardClass} overflow-hidden`}><div className="border-b border-slate-100 px-6 py-5"><h2 className="font-semibold">Portal users</h2><p className="mt-1 text-sm text-slate-500">Roles are enforced again by Supabase RLS and Edge Functions.</p></div>{isLoading ? <div className="space-y-3 p-6">{[1, 2, 3].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-slate-100" />)}</div> : users.length === 0 ? <div className="p-6"><EmptyState title="No users found" description="Create a staff account to give a colleague access." /></div> : <div className="divide-y divide-slate-100">{users.map((portalUser) => <div key={portalUser.id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold text-slate-900">{portalUser.full_name || 'Unnamed user'}</p><p className="mt-1 text-xs text-slate-500">{portalUser.email || 'No email'}{portalUser.phone ? ` · ${portalUser.phone}` : ''}</p></div><div className="flex flex-wrap items-center gap-2"><ShieldCheck className="h-4 w-4 text-teal-600" />{portalUser.roles.map((role) => <StatusBadge key={role} status={role} />)}</div></div>)}</div>}</section>
  </div>;
};

export default AdminUsers;
