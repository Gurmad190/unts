import React, { useEffect } from 'react';
import { Bell, CalendarDays } from 'lucide-react';
import { EmptyState, PageHeader, StatusBadge, cardClass } from '../../components/portal/ui';
import { useAuthStore } from '../../store/authStore';
import { usePortalStore } from '../../store/portalStore';

const StudentAnnouncements: React.FC = () => {
  const { user } = useAuthStore();
  const { studentPortal, isLoading, error, loadStudentData } = usePortalStore();
  useEffect(() => { if (user?.id) void loadStudentData(user.id); }, [loadStudentData, user?.id]);
  const announcements = studentPortal?.announcements ?? [];
  return <div className="space-y-8"><PageHeader eyebrow="University communications" title="Announcements" description="Important updates, events and notices published for students." />{error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>}{isLoading ? <div className="grid gap-4 md:grid-cols-2"><div className="h-44 animate-pulse rounded-2xl bg-slate-200" /><div className="h-44 animate-pulse rounded-2xl bg-slate-200" /></div> : announcements.length === 0 ? <EmptyState title="No announcements yet" description="When the University publishes an update for students, it will appear here." /> : <div className="grid gap-4 md:grid-cols-2">{announcements.map((announcement) => <article key={announcement.id} className={`${cardClass} p-6`}><div className="flex items-start justify-between gap-4"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700"><Bell className="h-5 w-5" /></div><StatusBadge status={announcement.content_type} /></div><h2 className="mt-5 text-lg font-semibold text-slate-950">{announcement.title}</h2><div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400"><CalendarDays className="h-3.5 w-3.5" />{announcement.published_at ? new Date(announcement.published_at).toLocaleDateString() : 'Recently published'}</div><p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">{announcement.body}</p></article>)}</div>}</div>;
};

export default StudentAnnouncements;
