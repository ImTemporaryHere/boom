import { useState, FormEvent, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  setSearchFilters,
  setShowResults,
  selectSearchFilters,
} from '../model/bookingSlice';
import { useBookingControllerGetLocationsQuery } from '../../../store/api/generatedApi';

export function SpaceSearchWidget() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectSearchFilters);

  const [selectedLocation, setSelectedLocation] = useState('');

  // Fetch available locations from Boom API
  const { data: locationsData, isLoading: locationsLoading } =
    useBookingControllerGetLocationsQuery();

  // Transform locations data into dropdown options
  const LOCATIONS = useMemo(() => {
    if (!locationsData || !Array.isArray(locationsData)) return [];

    return locationsData.map((location: any) => ({
      value: `${location.city.toLowerCase().replace(/\s+/g, '-')}-${location.state.toLowerCase()}-${location.countryCode.toLowerCase()}`,
      label: `${location.city}, ${location.state}`,
      city: location.city,
      state: location.state,
      country: location.countryCode,
    }));
  }, [locationsData]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();

    if (!selectedLocation) return;

    const location = LOCATIONS.find((loc) => loc.value === selectedLocation);
    if (!location) return;

    const searchFilters = {
      city: location.city,
      state: location.state,
      country: location.country,
    };

    dispatch(setSearchFilters(searchFilters));
    dispatch(setShowResults(true));
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl shadow-xl p-8 border border-green-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Find Your Perfect Space
        </h2>
        <p className="text-gray-600">
          Discover amazing workspaces in top cities
        </p>
      </div>

      <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
        {/* Location Select */}
        <div className="space-y-3">
          <label
            htmlFor="location"
            className="block text-lg font-bold text-gray-800 mb-3"
          >
            📍 Select Location
          </label>
          <select
            id="location"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            required
            disabled={locationsLoading}
            className="w-full px-5 py-4 text-lg font-medium border-2 border-gray-300 rounded-xl shadow-md focus:outline-none focus:ring-4 focus:ring-green-300 focus:border-green-500 bg-white transition-all duration-200 hover:border-green-400 hover:shadow-lg cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2316a34a' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 1.25rem center',
              backgroundSize: '1.75em 1.75em',
              paddingRight: '3rem',
            }}
          >
            <option value="" className="text-gray-500">
              {locationsLoading ? 'Loading locations...' : 'Choose a city...'}
            </option>
            {LOCATIONS.map((location) => (
              <option key={location.value} value={location.value} className="text-gray-900 py-2">
                {location.label}
              </option>
            ))}
          </select>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          disabled={!selectedLocation}
          className="w-full mt-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {selectedLocation ? '🔍 Search Spaces' : 'Select a location to search'}
        </button>
      </form>
    </div>
  );
}
