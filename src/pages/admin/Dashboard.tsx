import React from 'react';
import { useAdminStore } from '../../store/adminStore';
import { Users, BookOpen, FileText, Building2, TrendingUp, Megaphone, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { students, programs, departments, applications, contents } = useAdminStore();

  const activeStudents = students.filter(s => s.status === 'Active').length;
  const pendingApplications = applications.filter(a => a.status === 'New' || a.status === 'Under Review').length;
  const publishedContent = contents.filter(c => c.status === 'Published').length;
  const scholarships = contents.filter(c => c.type === 'scholarship').length;

  const stats = [
    { name: 'Total Students', value: students.length, icon: Users, color: 'bg-blue-500', link: '/admin/students' },
    { name: 'Active Students', value: activeStudents, icon: TrendingUp, color: 'bg-green-500', link: '/admin/students' },
    { name: 'Departments', value: departments.length, icon: Building2, color: 'bg-indigo-500', link: '/admin/departments' },
    { name: 'Programs', value: programs.length, icon: BookOpen, color: 'bg-purple-500', link: '/admin/departments' },
    { name: 'Applications', value: applications.length, icon: FileText, color: 'bg-orange-500', link: '/admin/admissions' },
    { name: 'Pending Reviews', value: pendingApplications, icon: FileText, color: 'bg-yellow-500', link: '/admin/admissions' },
    { name: 'Published Content', value: publishedContent, icon: Megaphone, color: 'bg-teal-500', link: '/admin/content' },
    { name: 'Scholarships', value: scholarships, icon: Award, color: 'bg-red-500', link: '/admin/content' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-sm text-gray-500 mt-1">Welcome to the UNS Administration Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.name} to={stat.link} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow group">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`p-3 rounded-md ${stat.color} text-white`}>
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                      <dd>
                        <div className="text-lg font-bold text-gray-900 group-hover:text-[#002147] transition-colors">{stat.value}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
            <Link to="/admin/admissions" className="text-sm text-[#002147] hover:underline font-medium">View All</Link>
          </div>
          <div className="space-y-3">
            {applications.slice(0, 5).map((app) => (
              <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-[#002147] text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {app.applicantName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{app.applicantName}</p>
                    <p className="text-xs text-gray-500">{programs.find(p => p.id === app.programId)?.name}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  app.status === 'New' ? 'bg-blue-100 text-blue-800' :
                  app.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                  app.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                  app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                  'bg-purple-100 text-purple-800'
                }`}>{app.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Students */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Students by Department</h3>
            <Link to="/admin/students" className="text-sm text-[#002147] hover:underline font-medium">View All</Link>
          </div>
          <div className="space-y-3">
            {departments.map(dept => {
              const count = students.filter(s => s.departmentId === dept.id).length;
              const activeCount = students.filter(s => s.departmentId === dept.id && s.status === 'Active').length;
              return (
                <div key={dept.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{dept.name}</p>
                      <p className="text-xs text-gray-500">{activeCount} active / {count} total</p>
                    </div>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className="bg-[#002147] h-2 rounded-full" style={{ width: `${students.length > 0 ? (count / students.length) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/admin/students" className="p-4 border border-gray-200 rounded-lg text-center hover:bg-[#002147] hover:text-white hover:border-[#002147] transition-all group">
            <Users className="h-8 w-8 mx-auto mb-2 text-[#002147] group-hover:text-white" />
            <span className="block text-sm font-medium">Manage Students</span>
          </Link>
          <Link to="/admin/departments" className="p-4 border border-gray-200 rounded-lg text-center hover:bg-[#002147] hover:text-white hover:border-[#002147] transition-all group">
            <BookOpen className="h-8 w-8 mx-auto mb-2 text-[#002147] group-hover:text-white" />
            <span className="block text-sm font-medium">Departments & Programs</span>
          </Link>
          <Link to="/admin/admissions" className="p-4 border border-gray-200 rounded-lg text-center hover:bg-[#002147] hover:text-white hover:border-[#002147] transition-all group">
            <FileText className="h-8 w-8 mx-auto mb-2 text-[#002147] group-hover:text-white" />
            <span className="block text-sm font-medium">Review Admissions</span>
          </Link>
          <Link to="/admin/content" className="p-4 border border-gray-200 rounded-lg text-center hover:bg-[#002147] hover:text-white hover:border-[#002147] transition-all group">
            <Megaphone className="h-8 w-8 mx-auto mb-2 text-[#002147] group-hover:text-white" />
            <span className="block text-sm font-medium">Manage Content</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
