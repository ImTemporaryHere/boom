import { SpaceSearchWidget, SpacesList } from '../../features/booking';
import { useAppSelector } from '../../store/hooks';
import { selectIsAuthenticated } from '../../features/auth';
import { Navigate } from 'react-router-dom';

export function HomePage() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Redirect to users page if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/users" replace />;
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          Welcome to Boom - Testing Polling! ⚡
        </h1>
        <p className="text-gray-600">
          Search for available spaces below.
        </p>
      </div>

      {/* Space Search Widget */}
      <SpaceSearchWidget />

      {/* Search Results */}
      <SpacesList />
    </div>
  );
}
