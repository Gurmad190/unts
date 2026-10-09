import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  ChevronRight,
  FileCheck2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  ScrollText,
  User,
  Users,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export type PortalRole = 'admin' | 'student';

type NavItem = { label: string; path: string; icon: React.ComponentType<{ className?: string }>; allowedRoles?: string[] };

const adminNavigation: NavItem[] = [
  { label: 'Overview', path: '/admin', icon: LayoutDashboard },
  { label: 'Applications', path: '/admin/admissions', icon: FileCheck2, allowedRoles: ['super_admin', 'admin', 'admissions'] },
  { label: 'Students', path: '/admin/students', icon: Users, allowedRoles: ['super_admin', 'admin', 'registrar', 'faculty', 'finance'] },
  { label: 'Departments & programmes', path: '/admin/departments', icon: Building2, allowedRoles: ['super_admin', 'admin', 'registrar'] },
  { label: 'Courses', path: '/admin/courses', icon: BookOpen, allowedRoles: ['super_admin', 'admin', 'registrar'] },
  { label: 'Academic terms', path: '/admin/terms', icon: CalendarDays, allowedRoles: ['super_admin', 'admin', 'registrar'] },
  { label: 'News & content', path: '/admin/content', icon: Bell, allowedRoles: ['super_admin', 'admin'] },
  { label: 'Audit trail', path: '/admin/audit', icon: ScrollText, allowedRoles: ['super_admin', 'admin'] },
  { label: 'User access', path: '/admin/users', icon: ShieldCheck, allowedRoles: ['super_admin', 'admin'] },
];

const studentNavigation: NavItem[] = [
  { label: 'Overview', path: '/student', icon: LayoutDashboard },
  { label: 'My profile', path: '/student/profile', icon: User },
  { label: 'Academic records', path: '/student/academics', icon: GraduationCap },
  { label: 'Announcements', path: '/student/announcements', icon: Bell },
];

const PortalShell: React.FC<{ role: PortalRole }> = ({ role }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const navigation = (role === 'admin' ? adminNavigation : studentNavigation).filter((item) => !item.allowedRoles || item.allowedRoles.includes(user?.systemRole || 'student'));

  const handleLogout = async () => {
    setMobileOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const sidebar = (
    <aside className="flex h-full w-72 flex-col bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-white">
      <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-300 font-black tracking-tight text-slate-950 shadow-lg shadow-amber-300/10">UNS</div>
        <div>
          <p className="text-sm font-semibold">UNS Portal</p>
          <p className="text-xs text-slate-400">{role === 'admin' ? 'Administration' : 'Student services'}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-6" aria-label="Portal navigation">
        <p className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Workspace</p>
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path || (item.path !== '/admin' && item.path !== '/student' && location.pathname.startsWith(item.path));
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${active ? 'bg-white text-slate-950 shadow-lg shadow-black/10' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
            >
              <Icon className={`h-4.5 w-4.5 ${active ? 'text-slate-950' : 'text-slate-400 group-hover:text-white'}`} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="h-4 w-4" />}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-300 font-semibold text-slate-950">{user?.name?.charAt(0).toUpperCase() || 'U'}</div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user?.name || 'UNS user'}</p>
            <p className="truncate text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white">
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );

  const current = navigation.find((item) => location.pathname === item.path || (item.path !== '/admin' && item.path !== '/student' && location.pathname.startsWith(item.path)));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">{sidebar}</div>
      {mobileOpen && <div className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <div className={`fixed inset-y-0 left-0 z-50 transition-transform lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="relative h-full">
          <button className="absolute right-3 top-3 z-10 rounded-lg p-2 text-slate-300 hover:bg-white/10" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X className="h-5 w-5" /></button>
          {sidebar}
        </div>
      </div>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-slate-50/80 shadow-[0_8px_25px_-24px_rgba(15,23,42,0.7)] backdrop-blur">
          <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-10">
            <div className="flex items-center gap-3">
              <button className="rounded-xl border border-slate-200 bg-white p-2.5 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu className="h-5 w-5" /></button>
              <div>
                <p className="text-xs font-medium text-slate-500">University of Northeastern Somalia</p>
                <p className="mt-1 text-lg font-semibold tracking-tight">{current?.label || 'Portal'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <NavLink to="/" className="hidden rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white sm:block">Public website</NavLink>
              <button className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-100" aria-label="Notifications"><Bell className="h-4 w-4" /></button>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-10 lg:py-10"><Outlet /></main>
      </div>
    </div>
  );
};

export default PortalShell;
