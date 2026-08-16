import type { ArtistResponse, Bounds, ShopsResponse } from '@/lib/api/types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
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
