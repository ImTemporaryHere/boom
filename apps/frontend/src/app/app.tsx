import { Route, Routes } from 'react-router-dom';
import { Layout } from './layout/Layout';
import { HomePage } from '../pages/HomePage';
import { UsersPage } from '../pages/UsersPage';
import { ProtectedRoute } from '../shared/ui/ProtectedRoute';

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UsersPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  );
}

export default App;
