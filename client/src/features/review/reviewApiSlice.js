import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getCurrentUserToken } from '@services/firebase';

// Always call backend directly — no proxy dependency
const BACKEND = 'http://localhost:3001';

export const reviewApi = createApi({
  reducerPath: 'reviewApi',

  baseQuery: fetchBaseQuery({
    baseUrl: `${BACKEND}/api`,
    prepareHeaders: async (headers) => {
      try {
        const token = await getCurrentUserToken();
        if (token) headers.set('Authorization', `Bearer ${token}`);
      } catch (e) {
        console.warn('[reviewApi] Could not get auth token:', e.message);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),

  tagTypes: ['Review'],

  endpoints: (builder) => ({

    analyzeCode: builder.mutation({
      query: ({ code, language, focusAreas, depth, title }) => ({
        url: '/review/analyze',
        method: 'POST',
        body: { code, language, focusAreas, depth, title },
      }),
      transformResponse: (response) => response.review,
      invalidatesTags: ['Review'],
    }),

    getHistory: builder.query({
      query: ({ page = 1, limit = 10, language, grade } = {}) => {
        const params = new URLSearchParams({ page, limit });
        if (language) params.set('language', language);
        if (grade) params.set('grade', grade);
        return `/review/history?${params.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...(result.reviews || []).map(({ _id }) => ({ type: 'Review', id: _id })),
              { type: 'Review', id: 'LIST' },
            ]
          : [{ type: 'Review', id: 'LIST' }],
      keepUnusedDataFor: 120,
    }),

    getReview: builder.query({
      query: (id) => `/review/${id}`,
      transformResponse: (response) => response.review,
      providesTags: (_result, _error, id) => [{ type: 'Review', id }],
    }),

    deleteReview: builder.mutation({
      query: (id) => ({ url: `/review/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Review', id },
        { type: 'Review', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useAnalyzeCodeMutation,
  useGetHistoryQuery,
  useGetReviewQuery,
  useDeleteReviewMutation,
} = reviewApi;

export default reviewApi;