import { UsersList } from '../../features/users';

export function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Users Directory
        </h1>
        <p className="text-gray-600">
          Browse all registered users in the system.
        </p>
      </div>

      <UsersList />
    </div>
  );
}
