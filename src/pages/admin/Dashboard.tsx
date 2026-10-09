import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Bell, Building2, FileCheck2, GraduationCap, Users } from 'lucide-react';
import { EmptyState, PageHeader, StatCard, StatusBadge, cardClass } from '../../components/portal/ui';
import { usePortalStore } from '../../store/portalStore';

const AdminDashboard: React.FC = () => {
  const { applications, students, departments, programs, announcements, isLoading, error, loadAdminData, clearError } = usePortalStore();

  useEffect(() => { void loadAdminData(); }, [loadAdminData]);

  const pending = applications.filter((application) => ['applied', 'new', 'review'].includes(application.status)).length;
  const activeStudents = students.filter((student) => student.status === 'active').length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Administration"
        title="Good morning, here is the overview."
        description="A focused workspace for admissions, students, academic catalogues and university communications."
        action={<Link to="/admin/admissions" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">Review applications <ArrowUpRight className="h-4 w-4" /></Link>}
      />

      {error && <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"><span>{error}</span><button onClick={clearError} className="font-semibold">Dismiss</button></div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pending applications" value={pending} detail="Needs an admissions decision" icon={<FileCheck2 className="h-5 w-5" />} tone="amber" />
        <StatCard label="Active students" value={activeStudents} detail={`${students.length} student records total`} icon={<Users className="h-5 w-5" />} tone="teal" />
        <StatCard label="Programmes" value={programs.length} detail={`${departments.length} departments`} icon={<GraduationCap className="h-5 w-5" />} />
        <StatCard label="Published updates" value={announcements.filter((item) => item.status === 'published').length} detail="Visible to the university community" icon={<Bell className="h-5 w-5" />} tone="rose" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <section className={`${cardClass} overflow-hidden`}>
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div><h2 className="font-semibold text-slate-950">Recent applications</h2><p className="mt-1 text-sm text-slate-500">The latest people entering the admissions workflow.</p></div>
            <Link to="/admin/admissions" className="text-sm font-semibold text-slate-700 hover:text-slate-950">View all</Link>
          </div>
          {isLoading ? <div className="space-y-3 p-6">{[1, 2, 3].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-slate-100" />)}</div> : applications.length === 0 ? <div className="p-6"><EmptyState title="No applications yet" description="Online applications will appear here once applicants submit the form." action={<Link to="/apply" className="font-semibold text-slate-900">View application form</Link>} /></div> : <div className="divide-y divide-slate-100">{applications.slice(0, 5).map((application) => <div key={application.id} className="flex items-center justify-between gap-4 px-6 py-4"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{application.applicant_name}</p><p className="mt-1 truncate text-xs text-slate-500">{application.application_number} · {application.program_name}</p></div><StatusBadge status={application.status} /></div>)}</div>}
        </section>

        <section className={`${cardClass} p-6`}>
          <div className="flex items-center justify-between"><div><h2 className="font-semibold text-slate-950">Department activity</h2><p className="mt-1 text-sm text-slate-500">Programme catalogue coverage.</p></div><Building2 className="h-5 w-5 text-slate-400" /></div>
          <div className="mt-6 space-y-5">{departments.length === 0 ? <EmptyState title="No departments" description="Create your first department from the catalogue page." /> : departments.map((department) => { const count = programs.filter((program) => program.department_id === department.id).length; return <div key={department.id}><div className="flex items-center justify-between gap-4 text-sm"><span className="font-medium text-slate-800">{department.name}</span><span className="text-slate-500">{count} programmes</span></div><div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-teal-500" style={{ width: `${Math.min(100, Math.max(8, count * 18))}%` }} /></div></div>; })}</div>
        </section>
      </div>

      <section className={`${cardClass} p-6`}><div className="flex items-center justify-between"><div><h2 className="font-semibold text-slate-950">Common tasks</h2><p className="mt-1 text-sm text-slate-500">Jump directly into the work that needs attention.</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Link to="/admin/admissions" className="rounded-xl border border-slate-200 p-4 transition hover:border-slate-950 hover:bg-slate-50"><FileCheck2 className="h-5 w-5 text-amber-600" /><p className="mt-3 text-sm font-semibold">Review applications</p><p className="mt-1 text-xs text-slate-500">Accept, waitlist or reject applicants.</p></Link><Link to="/admin/students" className="rounded-xl border border-slate-200 p-4 transition hover:border-slate-950 hover:bg-slate-50"><Users className="h-5 w-5 text-teal-600" /><p className="mt-3 text-sm font-semibold">Browse students</p><p className="mt-1 text-xs text-slate-500">Find records and academic links.</p></Link><Link to="/admin/departments" className="rounded-xl border border-slate-200 p-4 transition hover:border-slate-950 hover:bg-slate-50"><GraduationCap className="h-5 w-5 text-indigo-600" /><p className="mt-3 text-sm font-semibold">Manage catalogue</p><p className="mt-1 text-xs text-slate-500">Keep departments and programmes current.</p></Link><Link to="/admin/content" className="rounded-xl border border-slate-200 p-4 transition hover:border-slate-950 hover:bg-slate-50"><Bell className="h-5 w-5 text-rose-600" /><p className="mt-3 text-sm font-semibold">Publish an update</p><p className="mt-1 text-xs text-slate-500">Share news and announcements.</p></Link></div></section>
    </div>
  );
};

export default AdminDashboard;
