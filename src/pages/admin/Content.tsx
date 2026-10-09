import React, { useEffect, useState } from 'react';
import { Bell, Plus, Send } from 'lucide-react';
import { Button, EmptyState, Input, Notice, PageHeader, Select, StatusBadge, Textarea, cardClass } from '../../components/portal/ui';
import { usePortalStore } from '../../store/portalStore';

const AdminContent: React.FC = () => {
  const { announcements, isLoading, error, loadAnnouncements, addAnnouncement, publishAnnouncement } = usePortalStore();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', summary: '', body: '', content_type: 'announcement', status: 'draft' });
  useEffect(() => { void loadAnnouncements(true); }, [loadAnnouncements]);
  const save = async (event: React.FormEvent) => { event.preventDefault(); setSaving(true); try { await addAnnouncement(form); setForm({ title: '', summary: '', body: '', content_type: 'announcement', status: 'draft' }); setShowForm(false); } finally { setSaving(false); } };
  return <div className="space-y-8"><PageHeader eyebrow="University communications" title="News & announcements" description="Write once, publish clearly and keep the University community informed from the same source of truth." action={<Button onClick={() => setShowForm((value) => !value)}><Plus className="mr-1.5 h-4 w-4" /> New post</Button>} />
    {error && <Notice tone="error">{error}</Notice>}
    {showForm && <form onSubmit={save} className={`${cardClass} space-y-4 p-6`}><div className="grid gap-4 sm:grid-cols-2"><Input required placeholder="Headline" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /><Select value={form.content_type} onChange={(event) => setForm({ ...form, content_type: event.target.value })}><option value="announcement">Announcement</option><option value="news">News</option><option value="event">Event</option><option value="scholarship">Scholarship</option></Select></div><Input placeholder="Short summary" value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} /><Textarea required rows={5} placeholder="Write the update" value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} /><div className="flex flex-wrap gap-2"><Button disabled={saving}><Send className="mr-1.5 h-4 w-4" /> Save draft</Button><Button type="button" variant="secondary" disabled={saving} onClick={() => setShowForm(false)}>Cancel</Button></div></form>}
    <section className={`${cardClass} overflow-hidden`}>{isLoading ? <div className="space-y-3 p-6">{[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-xl bg-slate-100" />)}</div> : announcements.length === 0 ? <div className="p-6"><EmptyState title="No announcements yet" description="Draft or publish your first university update." /></div> : <div className="divide-y divide-slate-100">{announcements.map((announcement) => <div key={announcement.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6"><div className="flex gap-3"><div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600"><Bell className="h-4 w-4" /></div><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-slate-950">{announcement.title}</h2><StatusBadge status={announcement.status} /></div><p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">{announcement.content_type}</p><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{announcement.summary || announcement.body}</p></div></div><Button variant="secondary" disabled={announcement.status === 'published'} onClick={() => void publishAnnouncement(announcement.id, 'published')}>{announcement.status === 'published' ? 'Published' : 'Publish'}</Button></div>)}</div>}</section>
  </div>;
};

export default AdminContent;
