import { useAppSelector } from '../../../store/hooks';
import {
  selectSearchFilters,
  selectShowResults,
} from '../model/bookingSlice';
import { useBookingControllerSearchSpacesMutation } from '../../../store/api/generatedApi';
import { useEffect } from 'react';

export function SpacesList() {
  const filters = useAppSelector(selectSearchFilters);
  const showResults = useAppSelector(selectShowResults);
  const [searchSpaces, { data, isLoading, error }] =
    useBookingControllerSearchSpacesMutation();

  useEffect(() => {
    if (showResults && filters.city) {
      searchSpaces({
        searchSpacesDto: {
          location: {
            city: filters.city,
            ...(filters.state && { state: filters.state }),
            ...(filters.country && { country: filters.country }),
            ...(filters.postalCode && { postalCode: filters.postalCode }),
            ...(filters.latitude && { latitude: filters.latitude }),
            ...(filters.longitude && { longitude: filters.longitude }),
            ...(filters.radius && { radius: filters.radius }),
          },
          ...(filters.startDate && { startDate: filters.startDate }),
          ...(filters.endDate && { endDate: filters.endDate }),
          ...(filters.minCapacity && { minCapacity: filters.minCapacity }),
          ...(filters.maxCapacity && { maxCapacity: filters.maxCapacity }),
          ...(filters.minPrice && { minPrice: filters.minPrice }),
          ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
          ...(filters.amenities && { amenities: filters.amenities }),
          ...(filters.instantBook !== undefined && {
            instantBook: filters.instantBook,
          }),
        },
      });
    }
  }, [showResults, filters, searchSpaces]);

  if (!showResults) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 mt-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Searching for spaces...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-semibold">Error searching spaces</p>
          <p className="text-sm mt-1">
            {'data' in error && typeof error.data === 'object' && error.data && 'message' in error.data
              ? String(error.data.message)
              : 'Failed to search for spaces. Please try again.'}
          </p>
        </div>
      </div>
    );
  }

  if (!data || data.spaces.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 mt-6">
        <div className="text-center text-gray-600">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium">No spaces found</h3>
          <p className="mt-1 text-sm">
            Try adjusting your search filters to find more results.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Search Results
        </h2>
        <p className="text-gray-600 mt-1">
          Found {data.total} space{data.total !== 1 ? 's' : ''} in {filters.city}
        </p>
      </div>

      <div className="space-y-4">
        {data.spaces.map((space) => (
          <div
            key={space.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className="md:flex">
              {/* Image */}
              <div className="md:flex-shrink-0 md:w-48 h-48 bg-gray-200">
                {space.images && space.images.length > 0 ? (
                  <img
                    src={space.images.find((img) => img.isPrimary)?.url || space.images[0].url}
                    alt={space.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <svg
                      className="h-16 w-16 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">
                      {space.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {space.location.address}, {space.location.city}
                      {space.location.state && `, ${space.location.state}`}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-2xl font-bold text-green-600">
                      ${(space.pricing.hourly / 100).toFixed(2)}
                      <span className="text-sm text-gray-600">/hr</span>
                    </p>
                    {space.pricing.daily && (
                      <p className="text-sm text-gray-600">
                        ${(space.pricing.daily / 100).toFixed(2)}/day
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-gray-700 mt-3 line-clamp-2">
                  {space.description}
                </p>

                {/* Details */}
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 mr-1 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Capacity: {space.capacity}
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 mr-1 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                      />
                    </svg>
                    {space.areaSquareFeet} sq ft
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 mr-1 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {space.rating.toFixed(1)} ({space.reviewCount})
                  </div>
                  {space.instantBookable && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Instant Book
                    </span>
                  )}
                </div>

                {/* Amenities */}
                {space.amenities && space.amenities.length > 0 && (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {space.amenities.slice(0, 5).map((amenity, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {amenity.name}
                        </span>
                      ))}
                      {space.amenities.length > 5 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          +{space.amenities.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Provider */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Provided by <span className="font-semibold">{space.provider.name}</span>
                    {space.provider.verified && (
                      <span className="ml-2 text-green-600">✓ Verified</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination info */}
      {data.totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-lg p-4 mt-4 text-center text-gray-600">
          Page {data.page} of {data.totalPages}
        </div>
      )}
    </div>
  );
}
