import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Lock, Mail } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface LoginLocationState {
  from?: {
    pathname?: string;
  };
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, isLoading, error, clearError } = useAuthStore();

  const from = (location.state as LoginLocationState | null)?.from?.pathname;
  const destination = from && from !== '/login'
    ? from
    : user?.role === 'admin'
      ? '/admin'
      : '/student';

  useEffect(() => {
    if (user) {
      navigate(destination, { replace: true });
    }
  }, [destination, navigate, user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    clearError();

    const success = await login(email, password);

    if (success) {
      const loggedInUser = useAuthStore.getState().user;
      navigate(loggedInUser?.role === 'admin' ? '/admin' : '/student', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-[#002147] rounded-full flex items-center justify-center text-[#FFD700] font-bold text-2xl">
            UNS
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Use the email and password provided by the university.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4" role="alert">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <p className="ml-3 text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="focus:ring-[#002147] focus:border-[#002147] block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="focus:ring-[#002147] focus:border-[#002147] block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                  placeholder="Your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#002147] hover:bg-[#001833] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#002147] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
