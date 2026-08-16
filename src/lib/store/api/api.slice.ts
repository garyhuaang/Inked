import type { ArtistResponse, Bounds, ShopsResponse } from '@/lib/api/types';
import { API_BASE_URL } from '@/lib/urls';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  endpoints: (builder) => ({
    getShops: builder.query<ShopsResponse, Bounds>({
      query: (bounds) => `/shops?bounds=${bounds.join(',')}`,
    }),
    getArtists: builder.query<ArtistResponse, void>({
      query: () => `/artists`,
    }),
  }),
});

export const { useGetShopsQuery, useGetArtistsQuery } = apiSlice;
