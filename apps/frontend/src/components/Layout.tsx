import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout, selectCurrentUser, selectIsAuthenticated } from '../store/slices/authSlice';
import { useAuthControllerLogoutMutation } from '../store/api/generatedApi';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logoutMutation] = useAuthControllerLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      dispatch(logout());
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen accent-blue-200">
      {/* Header */}
      <header className="bg-blue-500 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Boom Frontend</h1>
          {isAuthenticated && user && (
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, <span className="font-semibold">{user.name}</span>
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 h-16 items-center">
            <Link
              to="/"
              className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Home
            </Link>
            {isAuthenticated && (
              <Link
                to="/users"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Users List
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">{children}</div>
      </main>
    </div>
  );
}
