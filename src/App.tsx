import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import AdminLayout from './layouts/AdminLayout';
import StudentLayout from './layouts/StudentLayout';
import { useAuthStore } from './store/authStore';

// Public Pages
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

// Auth
import Login from './pages/auth/Login';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminDepartments from './pages/admin/Departments';
import AdminStudents from './pages/admin/Students';
import AdminAdmissions from './pages/admin/Admissions';
import AdminContent from './pages/admin/Content';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';

const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode, allowedRole: 'admin' | 'student' }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== allowedRole) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/student'} replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/about" element={<Layout><About /></Layout>} />
        <Route path="/academics" element={<Layout><Academics /></Layout>} />
        <Route path="/academics/:slug" element={<Layout><ProgramDetail /></Layout>} />
        <Route path="/admissions" element={<Layout><Admissions /></Layout>} />
        <Route path="/research" element={<Layout><Research /></Layout>} />
        <Route path="/students" element={<Layout><Students /></Layout>} />
        <Route path="/international" element={<Layout><International /></Layout>} />
        <Route path="/career" element={<Layout><CareerDevelopment /></Layout>} />
        <Route path="/news" element={<Layout><NewsEvents /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />
        
        {/* Auth Route */}
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRole="admin">
            <AdminLayout><AdminDashboard /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/departments" element={
          <ProtectedRoute allowedRole="admin">
            <AdminLayout><AdminDepartments /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/students" element={
          <ProtectedRoute allowedRole="admin">
            <AdminLayout><AdminStudents /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/admissions" element={
          <ProtectedRoute allowedRole="admin">
            <AdminLayout><AdminAdmissions /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/content" element={
          <ProtectedRoute allowedRole="admin">
            <AdminLayout><AdminContent /></AdminLayout>
          </ProtectedRoute>
        } />

        {/* Student Routes */}
        <Route path="/student" element={
          <ProtectedRoute allowedRole="student">
            <StudentLayout><StudentDashboard /></StudentLayout>
          </ProtectedRoute>
        } />
        <Route path="/student/profile" element={
          <ProtectedRoute allowedRole="student">
            <StudentLayout><StudentProfile /></StudentLayout>
          </ProtectedRoute>
        } />
        <Route path="/student/academics" element={
          <ProtectedRoute allowedRole="student">
            <StudentLayout>
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Academic Information</h2>
                <p className="text-gray-500">Your academic records, transcripts, and course history will appear here.</p>
              </div>
            </StudentLayout>
          </ProtectedRoute>
        } />
        <Route path="/student/announcements" element={
          <ProtectedRoute allowedRole="student">
            <StudentLayout>
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Announcements</h2>
                <p className="text-gray-500">Important updates from the university and your department.</p>
              </div>
            </StudentLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
};

export default App;
