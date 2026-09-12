import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { useAdminStore } from '../../store/adminStore';
import { User, Mail, BookOpen, Building2, Calendar, Award } from 'lucide-react';

const StudentProfile: React.FC = () => {
  const { user } = useAuthStore();
  const { students, programs, departments } = useAdminStore();

  // Find the full student record from the admin store for more details
  const studentRecord = students.find(s => s.email === user?.email);
  const program = programs.find(p => p.name === user?.program);
  const department = departments.find(d => d.name === user?.department);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Header/Cover */}
        <div className="h-32 bg-[#002147]"></div>
        
        {/* Profile Info */}
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
              <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-3xl font-bold">
                {user?.name?.charAt(0)}
              </div>
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Edit Profile
            </button>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
            <p className="text-gray-500 flex items-center mt-1">
              <Mail className="w-4 h-4 mr-2" />
              {user?.email}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Academic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Academic Information</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Building2 className="w-4 h-4 mr-2" />
                    Department
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{department?.name || 'Not Assigned'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Program
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{program?.name || 'Not Assigned'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Award className="w-4 h-4 mr-2" />
                    Level
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{program?.level || 'Undergraduate'}</dd>
                </div>
              </dl>
            </div>

            {/* Enrollment Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Enrollment Details</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Student ID
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{studentRecord?.id || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Admission Year
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{studentRecord?.admissionYear || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {studentRecord?.status || 'Active'}
                    </span>
                  </dd>
                </div>
                {studentRecord?.gpa && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Current GPA</dt>
                    <dd className="mt-1 text-sm font-bold text-[#002147]">{studentRecord.gpa}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
