import { useAppControllerGetDataQuery } from '../../store/api/generatedApi';

export function ApiExample() {
  const { data, isLoading, error } = useAppControllerGetDataQuery();

  if (isLoading) {
    return (
      <div className="p-4 bg-blue-50 rounded-lg">
        <p className="text-blue-700">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <p className="text-red-700">Error loading data</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-green-50 rounded-lg">
      <h3 className="text-lg font-semibold text-green-900 mb-2">
        API Response Example
      </h3>
      <p className="text-green-700">
        Message from backend: <strong>{data?.message}</strong>
      </p>
      <p className="text-sm text-green-600 mt-2">
        This data was fetched using RTK Query with auto-generated hooks from Swagger/OpenAPI
      </p>
    </div>
  );
}
