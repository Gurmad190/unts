import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { useAdminStore } from '../../store/adminStore';
import { BookOpen, Calendar, FileText, Bell } from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { programs, departments } = useAdminStore();

  const program = programs.find(p => p.name === user?.program);
  const department = departments.find(d => d.name === user?.department);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-[#002147] rounded-lg shadow-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h2>
        <p className="text-gray-300">Here's what's happening with your studies today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Academic Info Card */}
        <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-[#C41E3A]" />
            Current Program
          </h3>
          <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Program</p>
                <p className="font-medium text-gray-900">{user?.program || 'Not Assigned'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium text-gray-900">{user?.department || 'Not Assigned'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                  {user?.status || 'Active'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Level</p>
                <p className="font-medium text-gray-900">{program?.level || 'Undergraduate'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Links</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-sm font-medium text-gray-700">My Documents</span>
              </div>
            </button>
            <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-sm font-medium text-gray-700">Class Schedule</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Announcements */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Bell className="w-5 h-5 mr-2 text-[#FFD700]" />
          Recent Announcements
        </h3>
        <div className="space-y-4">
          <div className="border-l-4 border-[#002147] pl-4 py-2">
            <p className="text-sm text-gray-500 mb-1">Oct 15, 2024</p>
            <h4 className="text-md font-medium text-gray-900">Fall Semester Registration Opens</h4>
            <p className="text-sm text-gray-600 mt-1">Registration for the upcoming Fall semester will begin next week. Please check your academic advisor for course approvals.</p>
          </div>
          <div className="border-l-4 border-[#C41E3A] pl-4 py-2">
            <p className="text-sm text-gray-500 mb-1">Oct 10, 2024</p>
            <h4 className="text-md font-medium text-gray-900">Campus Library Extended Hours</h4>
            <p className="text-sm text-gray-600 mt-1">The main library will now be open 24/7 during the mid-term examination period.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
