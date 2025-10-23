import { useState, FormEvent } from 'react';
import { useAuthControllerSignInMutation } from '../../../store/api/generatedApi';
import { useAppDispatch } from '../../../store/hooks';
import { setCredentials } from '../model/authSlice';
import { useNavigate } from 'react-router-dom';

export function SigninForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signIn, { isLoading, error }] = useAuthControllerSignInMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const result = await signIn({
        signInDto: { email, password },
      }).unwrap();

      // Store tokens and user info
      dispatch(
        setCredentials({
          user: result.user,
          tokens: {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          },
        })
      );

      // Redirect to users list
      navigate('/users');
    } catch (err) {
      console.error('Signin failed:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Sign In</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="signin-email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="signin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="signin-password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <input
            id="signin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Your password"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {('data' in error && typeof error.data === 'object' && error.data && 'message' in error.data)
              ? String(error.data.message)
              : 'Invalid email or password.'}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2 px-4 rounded-md transition-colors"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
