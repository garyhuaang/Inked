import type { Bounds, ShopsResponse } from '@/lib/types'

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    getShops: builder.query<ShopsResponse, Bounds>({
      query: (bounds) => `/shops?bounds=${bounds.join(',')}`,
    }),
  }),
})

export const { useGetShopsQuery } = apiSlice
