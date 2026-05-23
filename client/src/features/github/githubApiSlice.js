import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getCurrentUserToken } from '@services/firebase';

const BACKEND = 'http://localhost:3001';

export const githubApi = createApi({
  reducerPath: 'githubApi',

  baseQuery: fetchBaseQuery({
    baseUrl: `${BACKEND}/api`,
    prepareHeaders: async (headers) => {
      try {
        const token = await getCurrentUserToken();
        if (token) headers.set('Authorization', `Bearer ${token}`);
      } catch (e) {
        console.warn('[githubApi] Could not get auth token:', e.message);
      }
      return headers;
    },
  }),

  tagTypes: ['Repos', 'PRs'],

  endpoints: (builder) => ({

    getRepos: builder.query({
      query: () => '/github/repos',
      providesTags: ['Repos'],
      transformResponse: (response) => response.repos ?? [],
      keepUnusedDataFor: 300,
    }),

    getPRs: builder.query({
      query: ({ owner, repo }) => `/github/repos/${owner}/${repo}/pulls`,
      providesTags: (_result, _error, { owner, repo }) => [
        { type: 'PRs', id: `${owner}/${repo}` },
      ],
      transformResponse: (response) => response.prs ?? [],
      keepUnusedDataFor: 120,
    }),

    reviewPR: builder.mutation({
      query: ({ owner, repo, prNumber, focusAreas, depth, postToGithub }) => ({
        url: `/github/repos/${owner}/${repo}/pulls/${prNumber}/review`,
        method: 'POST',
        body: {
          focusAreas: focusAreas ?? ['bug', 'security', 'performance', 'style'],
          depth: depth ?? 'standard',
          postToGithub: postToGithub ?? false,
        },
      }),
      transformResponse: (response) => response.review,
    }),
  }),
});

export const {
  useGetReposQuery,
  useGetPRsQuery,
  useReviewPRMutation,
} = githubApi;

export default githubApi;