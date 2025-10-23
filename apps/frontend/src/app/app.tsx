import { Route, Routes, Link } from 'react-router-dom';
import { ApiExample } from './components/ApiExample';

export function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Boom Frontend
          </h1>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 h-16 items-center">
            <Link
              to="/"
              className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Home
            </Link>
            <Link
              to="/page-2"
              className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Page 2
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Routes>
            <Route
              path="/"
              element={
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                      Welcome to Boom Frontend
                    </h2>
                    <p className="text-gray-600 mb-4">
                      This is a React application with Tailwind CSS and RTK Query, built with Nx monorepo.
                    </p>
                    <Link
                      to="/page-2"
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                    >
                      Go to Page 2
                    </Link>
                  </div>
                  <ApiExample />
                </div>
              }
            />
            <Route
              path="/page-2"
              element={
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Page 2
                  </h2>
                  <p className="text-gray-600 mb-4">
                    This is the second page with Tailwind CSS styling.
                  </p>
                  <Link
                    to="/"
                    className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded"
                  >
                    Back to Home
                  </Link>
                </div>
              }
            />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
