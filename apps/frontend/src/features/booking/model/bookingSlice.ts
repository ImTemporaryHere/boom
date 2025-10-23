import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../store/store';

export interface SearchFilters {
  city: string;
  state?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  startDate?: string;
  endDate?: string;
  minCapacity?: number;
  maxCapacity?: number;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  instantBook?: boolean;
}

interface BookingState {
  searchFilters: SearchFilters;
  showResults: boolean;
}

const initialState: BookingState = {
  searchFilters: {
    city: '',
  },
  showResults: false,
};

export const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setSearchFilters: (state, action: PayloadAction<SearchFilters>) => {
      state.searchFilters = action.payload;
    },
    updateFilter: (
      state,
      action: PayloadAction<{ key: keyof SearchFilters; value: any }>
    ) => {
      const { key, value } = action.payload;
      (state.searchFilters as any)[key] = value;
    },
    setShowResults: (state, action: PayloadAction<boolean>) => {
      state.showResults = action.payload;
    },
    resetFilters: (state) => {
      state.searchFilters = initialState.searchFilters;
      state.showResults = false;
    },
  },
});

export const { setSearchFilters, updateFilter, setShowResults, resetFilters } =
  bookingSlice.actions;

export const selectSearchFilters = (state: RootState) =>
  state.booking.searchFilters;
export const selectShowResults = (state: RootState) => state.booking.showResults;

export default bookingSlice.reducer;
