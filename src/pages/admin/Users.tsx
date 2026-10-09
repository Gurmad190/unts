import React, { useEffect, useState } from 'react';
import { Eye, KeyRound, ShieldCheck, UserPlus, UserRound, X } from 'lucide-react';
import { Button, EmptyState, Input, Notice, PageHeader, Select, StatusBadge, cardClass } from '../../components/portal/ui';
import { useAuthStore } from '../../store/authStore';
import { usePortalStore } from '../../store/portalStore';

const AdminUsers: React.FC = () => {
  const { user } = useAuthStore();
  const { users, isLoading, error, loadUsers, addStaffUser } = usePortalStore();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', role: 'admin', password: '' });
  const selectedUser = users.find((portalUser) => portalUser.id === selectedUserId) || null;

  useEffect(() => { if (user?.systemRole === 'super_admin') void loadUsers(); }, [loadUsers, user?.systemRole]);

  if (user?.systemRole !== 'super_admin') return <div className="mx-auto max-w-xl"><Notice tone="error">Only a Super Admin can manage staff accounts.</Notice></div>;

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setSuccess(null);
    try {
      await addStaffUser(form);
      setSuccess(`${form.fullName} can now sign in with the assigned ${form.role.replace('_', ' ')} role.`);
      setForm({ fullName: '', email: '', phone: '', role: 'admin', password: '' });
      setShowForm(false);
    } catch {
      // The store exposes the request error in the page notice.
    } finally {
      setSaving(false);
    }
  };

  return <div className="space-y-8">
    <PageHeader eyebrow="Access control" title="User access" description="Create staff credentials, review profile details and assign the minimum role each colleague needs." action={<Button onClick={() => setShowForm((value) => !value)}><UserPlus className="mr-1.5 h-4 w-4" /> Create staff account</Button>} />
    {success && <Notice tone="success">{success}</Notice>}
    {error && <Notice tone="error">{error}</Notice>}

    {showForm && <form onSubmit={save} className={`${cardClass} space-y-4 p-6`}><div className="flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-amber-300"><KeyRound className="h-5 w-5" /></div><div><h2 className="font-semibold">New staff account</h2><p className="mt-1 text-sm text-slate-500">The account is confirmed immediately. Share the password through a secure channel.</p></div></div><div className="grid gap-4 sm:grid-cols-2"><Input required placeholder="Full name" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} /><Input required type="email" placeholder="Email address" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /><Input placeholder="Phone number" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /><Select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}><option value="admin">Admin</option><option value="admissions">Admissions</option><option value="registrar">Registrar</option><option value="faculty">Faculty</option><option value="finance">Finance</option><option value="super_admin">Super Admin</option></Select></div><Input required minLength={8} type="password" placeholder="Temporary password (8+ characters)" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /><div className="flex gap-2"><Button disabled={saving}>{saving ? 'Creating account…' : 'Create account'}</Button><Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button></div></form>}

    <section className={`${cardClass} overflow-hidden`}><div className="border-b border-slate-100 bg-gradient-to-r from-white to-slate-50 px-6 py-5"><h2 className="font-semibold">Portal users</h2><p className="mt-1 text-sm text-slate-500">Select a user to review their profile details. Roles remain enforced by Supabase RLS and Edge Functions.</p></div>{isLoading ? <div className="space-y-3 p-6">{[1, 2, 3].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-slate-100" />)}</div> : users.length === 0 ? <div className="p-6"><EmptyState title="No users found" description="Create a staff account to give a colleague access." /></div> : <div className="divide-y divide-slate-100">{users.map((portalUser) => <div key={portalUser.id} className="flex flex-col gap-3 px-6 py-4 transition hover:bg-slate-50/80 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 font-semibold text-teal-700">{portalUser.full_name?.charAt(0).toUpperCase() || <UserRound className="h-4 w-4" />}</div><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{portalUser.full_name || 'Unnamed user'}</p><p className="mt-1 truncate text-xs text-slate-500">{portalUser.email || 'No email'}{portalUser.phone ? ` · ${portalUser.phone}` : ''}</p></div></div><div className="flex items-center justify-between gap-3 sm:justify-end"><div className="flex flex-wrap items-center gap-2"><ShieldCheck className="h-4 w-4 text-teal-600" />{portalUser.roles.length ? portalUser.roles.map((role) => <StatusBadge key={role} status={role} />) : <StatusBadge status="no role" />}</div><Button variant="secondary" className="shrink-0 px-3" onClick={() => setSelectedUserId(portalUser.id)}><Eye className="mr-1.5 h-4 w-4" /> Profile</Button></div></div>)}</div>}</section>

    {selectedUser && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-4 backdrop-blur-sm sm:items-center" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedUserId(null); }}><section role="dialog" aria-modal="true" aria-labelledby="profile-dialog-title" className={`${cardClass} w-full max-w-lg overflow-hidden shadow-2xl`}><div className="flex items-start justify-between border-b border-slate-100 bg-gradient-to-r from-slate-950 to-slate-800 px-6 py-6 text-white"><div className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-300 text-lg font-bold text-slate-950">{selectedUser.full_name?.charAt(0).toUpperCase() || 'U'}</div><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">User profile</p><h2 id="profile-dialog-title" className="mt-1 text-lg font-semibold">{selectedUser.full_name || 'Unnamed user'}</h2></div></div><button type="button" aria-label="Close profile" onClick={() => setSelectedUserId(null)} className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"><X className="h-5 w-5" /></button></div><div className="space-y-5 px-6 py-6"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Email</p><p className="mt-1 text-sm font-medium text-slate-900">{selectedUser.email || 'Not recorded'}</p></div><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Phone</p><p className="mt-1 text-sm font-medium text-slate-900">{selectedUser.phone || 'Not recorded'}</p></div><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Assigned roles</p><div className="mt-2 flex flex-wrap gap-2">{selectedUser.roles.length ? selectedUser.roles.map((role) => <StatusBadge key={role} status={role} />) : <StatusBadge status="no role" />}</div></div><div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-900">Role changes, deactivation and password resets are intentionally kept behind a future server-side workflow.</div><p className="break-all text-xs text-slate-400">Profile ID: {selectedUser.id}</p></div><div className="flex justify-end border-t border-slate-100 bg-slate-50 px-6 py-4"><Button variant="secondary" onClick={() => setSelectedUserId(null)}>Close</Button></div></section></div>}
  </div>;
};

export default AdminUsers;
