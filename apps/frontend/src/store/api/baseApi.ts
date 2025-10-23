import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define the base API configuration
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NX_API_URL || 'http://localhost:3000',
    prepareHeaders: (headers) => {
      // Get token from localStorage if available
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Auth', 'Users'],
  endpoints: () => ({}),
});
