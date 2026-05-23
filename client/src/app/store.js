import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@features/auth/authSlice';
import reviewReducer from '@features/review/reviewSlice';
import githubReducer from '@features/github/githubSlice';
import uiReducer from '@features/ui/uiSlice';
import { reviewApi } from '@features/review/reviewApiSlice';
import { githubApi } from '@features/github/githubApiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    review: reviewReducer,
    github: githubReducer,
    ui: uiReducer,
    [reviewApi.reducerPath]: reviewApi.reducer,
    [githubApi.reducerPath]: githubApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(reviewApi.middleware)
      .concat(githubApi.middleware),
  devTools: import.meta.env.DEV,
});

/**
 * @typedef {ReturnType<typeof store.getState>} RootState
 * @typedef {typeof store.dispatch} AppDispatch
 */