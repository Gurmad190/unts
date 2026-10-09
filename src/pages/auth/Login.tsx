import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Lock, Mail } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface LoginLocationState {
  from?: {
    pathname?: string;
  };
}

type LoginMode = 'login' | 'forgot' | 'reset';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mode, setMode] = useState<LoginMode>('login');
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isRecoveryLink = new URLSearchParams(location.search).get('recovery') === '1'
    || location.hash.includes('type=recovery');
  const {
    login,
    requestPasswordReset,
    updatePassword,
    logout,
    user,
    isLoading,
    error,
    clearError,
  } = useAuthStore();

  const requestedDestination = (location.state as LoginLocationState | null)?.from?.pathname;
  const roleHome = user?.role === 'admin'
    ? user.systemRole === 'admissions' ? '/admin/admissions' : user.systemRole === 'registrar' ? '/admin/departments' : ['faculty', 'finance'].includes(user.systemRole || '') ? '/admin/students' : '/admin'
    : '/student';
  const destination = user && requestedDestination && requestedDestination !== '/login'
    && ((user.role === 'admin' && requestedDestination.startsWith('/admin'))
      || (user.role === 'student' && requestedDestination.startsWith('/student')))
    ? requestedDestination
    : roleHome;

  useEffect(() => {
    if (isRecoveryLink) {
      setMode('reset');
    }
  }, [isRecoveryLink]);

  useEffect(() => {
    if (user && !isRecoveryLink && user.mustResetPassword) {
      setMode('reset');
      return;
    }

    if (user && mode === 'login' && !isRecoveryLink) {
      navigate(destination, { replace: true });
    }
  }, [destination, isRecoveryLink, mode, navigate, user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    clearError();
    setValidationError(null);
    setResetMessage(null);

    if (mode === 'forgot') {
      const sent = await requestPasswordReset(email);
      if (sent) {
        setResetMessage('If an eligible UNS account uses this email, a password reset link has been sent. Check your inbox and spam folder.');
      }
      return;
    }

    if (mode === 'reset') {
      if (newPassword.length < 12) {
        setValidationError('Your new password must be at least 12 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setValidationError('The password confirmation does not match.');
        return;
      }

      const updated = await updatePassword(newPassword);
      if (updated) {
        await logout();
        setMode('login');
        setNewPassword('');
        setConfirmPassword('');
        setResetMessage('Your password has been updated. Sign in with your new password.');
        navigate('/login', { replace: true });
      }
      return;
    }

    await login(email, password);
  };

  const title = mode === 'forgot'
    ? 'Reset your password'
    : mode === 'reset'
      ? 'Choose a new password'
      : 'Sign in to your account';
  const description = mode === 'forgot'
    ? 'Enter your UNS email address and we will send recovery instructions.'
    : mode === 'reset'
      ? 'Use at least 12 characters, then sign in again with the new password.'
      : 'Use the email and password provided by the university.';
  const displayError = validationError || error;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-950 text-2xl font-bold text-amber-300">
            UNS
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {title}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {description}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {displayError && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4" role="alert">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <p className="ml-3 text-sm text-red-700">{displayError}</p>
                </div>
              </div>
            )}

            {resetMessage && (
              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4" role="status">
                <div className="flex">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                  <p className="ml-3 text-sm text-emerald-800">{resetMessage}</p>
                </div>
              </div>
            )}

            {mode !== 'reset' && (
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
                    className="block w-full rounded-md border border-gray-300 py-2 pl-10 text-sm focus:border-slate-950 focus:ring-slate-950"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
            )}

            {mode === 'login' && (
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
                    className="block w-full rounded-md border border-gray-300 py-2 pl-10 text-sm focus:border-slate-950 focus:ring-slate-950"
                    placeholder="Your password"
                  />
                </div>
              </div>
            )}

            {mode === 'reset' && (
              <>
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                    New password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="new-password"
                      name="new-password"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={12}
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      className="block w-full rounded-md border border-gray-300 py-2 pl-10 text-sm focus:border-slate-950 focus:ring-slate-950"
                      placeholder="At least 12 characters"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                    Confirm new password
                  </label>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={12}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-slate-950 focus:ring-slate-950"
                    placeholder="Repeat your new password"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Please wait…' : mode === 'forgot' ? 'Send reset link' : mode === 'reset' ? 'Update password' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            {mode === 'login' ? (
              <button type="button" onClick={() => { clearError(); setResetMessage(null); setMode('forgot'); }} className="font-medium text-slate-700 hover:text-slate-950">
                Forgot your password?
              </button>
            ) : (
              <button type="button" onClick={() => { clearError(); setValidationError(null); setResetMessage(null); setMode('login'); }} className="font-medium text-slate-700 hover:text-slate-950">
                Return to sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
