import React, { useEffect } from 'react';
import { BrowserRouter as Router, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import PortalShell from './components/portal/PortalShell';
import { useAuthStore } from './store/authStore';

// Public pages
import Home from './pages/Home';
import About from './pages/About';
import Academics from './pages/Academics';
import Admissions from './pages/Admissions';
import Research from './pages/Research';
import Students from './pages/Students';
import International from './pages/International';
import CareerDevelopment from './pages/CareerDevelopment';
import NewsEvents from './pages/NewsEvents';
import Contact from './pages/Contact';
import ProgramDetail from './pages/ProgramDetail';
import ApplyOnline from './pages/admissions/ApplyOnline';

// Auth
import Login from './pages/auth/Login';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminDepartments from './pages/admin/Departments';
import AdminStudents from './pages/admin/Students';
import AdminAdmissions from './pages/admin/Admissions';
import AdminContent from './pages/admin/Content';
import AdminUsers from './pages/admin/Users';

// Student
import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';
import StudentAcademics from './pages/student/Academics';
import StudentAnnouncements from './pages/student/Announcements';

const LoadingScreen: React.FC = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50">
    <div className="text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 font-black text-amber-300">UNS</div>
      <p className="mt-4 text-sm text-slate-500">Loading your portal…</p>
    </div>
  </div>
);

const ProtectedRoute: React.FC<{ allowedRole: 'admin' | 'student' }> = ({ allowedRole }) => {
  const { isAuthenticated, isInitializing, user } = useAuthStore();
  const location = useLocation();

  if (isInitializing) return <LoadingScreen />;
  if (!isAuthenticated || !user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (user.role !== allowedRole) return <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />;
  return <Outlet />;
};

const SystemRoleRoute: React.FC<{ allowedRoles: string[] }> = ({ allowedRoles }) => {
  const { user } = useAuthStore();
  const defaultPath = user?.systemRole === 'admissions'
    ? '/admin/admissions'
    : user?.systemRole === 'registrar'
      ? '/admin/departments'
      : ['faculty', 'finance'].includes(user?.systemRole || '')
        ? '/admin/students'
        : '/admin';
  if (!user?.systemRole || !allowedRoles.includes(user.systemRole)) return <Navigate to={defaultPath} replace />;
  return <Outlet />;
};

const App: React.FC = () => {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/about" element={<Layout><About /></Layout>} />
        <Route path="/academics" element={<Layout><Academics /></Layout>} />
        <Route path="/academics/:slug" element={<Layout><ProgramDetail /></Layout>} />
        <Route path="/admissions" element={<Layout><Admissions /></Layout>} />
        <Route path="/apply" element={<Layout><ApplyOnline /></Layout>} />
        <Route path="/research" element={<Layout><Research /></Layout>} />
        <Route path="/students" element={<Layout><Students /></Layout>} />
        <Route path="/international" element={<Layout><International /></Layout>} />
        <Route path="/career" element={<Layout><CareerDevelopment /></Layout>} />
        <Route path="/news" element={<Layout><NewsEvents /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute allowedRole="admin" />}>
          <Route element={<PortalShell role="admin" />}>
          <Route element={<SystemRoleRoute allowedRoles={['super_admin', 'admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
          <Route element={<SystemRoleRoute allowedRoles={['super_admin', 'admin', 'admissions']} />}>
            <Route path="/admin/admissions" element={<AdminAdmissions />} />
          </Route>
          <Route element={<SystemRoleRoute allowedRoles={['super_admin', 'admin', 'registrar', 'faculty', 'finance']} />}>
            <Route path="/admin/students" element={<AdminStudents />} />
          </Route>
          <Route element={<SystemRoleRoute allowedRoles={['super_admin', 'admin', 'registrar']} />}>
            <Route path="/admin/departments" element={<AdminDepartments />} />
          </Route>
          <Route element={<SystemRoleRoute allowedRoles={['super_admin', 'admin']} />}>
            <Route path="/admin/content" element={<AdminContent />} />
          </Route>
          <Route element={<SystemRoleRoute allowedRoles={['super_admin', 'admin']} />}>
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRole="student" />}>
          <Route element={<PortalShell role="student" />}>
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/academics" element={<StudentAcademics />} />
            <Route path="/student/announcements" element={<StudentAnnouncements />} />
          </Route>
        </Route>

        <Route path="*" element={<Layout><div className="mx-auto max-w-2xl px-6 py-24 text-center"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">404</p><h1 className="mt-3 text-3xl font-semibold text-slate-950">Page not found</h1><p className="mt-3 text-slate-500">The page you requested does not exist.</p></div></Layout>} />
      </Routes>
    </Router>
  );
};

export default App;
