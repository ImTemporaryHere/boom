import { useUsersControllerFindAllQuery } from '../../../store/api/generatedApi';

export function UsersList() {
  const { data: users, isLoading, error } = useUsersControllerFindAllQuery();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Failed to load users. Please try again.
        </div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center">No users found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Users List</h2>
        <p className="text-sm text-gray-600 mt-1">
          Total users: {users.length}
        </p>
      </div>
      <div className="divide-y divide-gray-200">
        {users.map((user: any) => (
          <div
            key={user.id}
            className="px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {user.name}
                </h3>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
              <div className="text-sm text-gray-500">
                ID: {user.id.substring(0, 8)}...
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
