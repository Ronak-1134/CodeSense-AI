import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  loginWithGoogle,
  loginWithGithub,
  logoutUser,
  initializeAuth,
  clearError,
} from '@features/auth/authSlice';
import {
  selectUser,
  selectToken,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectAuthInitialized,
  selectUserPlan,
  selectGithubConnected,
} from '@features/auth/authSelectors';

export function useAuth() {
  const dispatch = useDispatch();

  const user            = useSelector(selectUser);
  const token           = useSelector(selectToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading         = useSelector(selectAuthLoading);
  const error           = useSelector(selectAuthError);
  const initialized     = useSelector(selectAuthInitialized);
  const plan            = useSelector(selectUserPlan);
  const githubConnected = useSelector(selectGithubConnected);

  // Call initializeAuth exactly once — unsubscribe is managed inside authSlice
  const initCalled = useRef(false);

  useEffect(() => {
    if (initCalled.current) return;
    initCalled.current = true;
    dispatch(initializeAuth());
  }, [dispatch]);

  const handleLoginWithGoogle = useCallback(async () => {
    const action = await dispatch(loginWithGoogle());
    if (loginWithGoogle.rejected.match(action)) {
      throw new Error(action.payload);
    }
  }, [dispatch]);

  const handleLoginWithGithub = useCallback(async () => {
    const action = await dispatch(loginWithGithub());
    if (loginWithGithub.rejected.match(action)) {
      throw new Error(action.payload);
    }
  }, [dispatch]);

  const handleLogout = useCallback(async () => {
    await dispatch(logoutUser());
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    initialized,
    plan,
    githubConnected,
    loginWithGoogle: handleLoginWithGoogle,
    loginWithGithub: handleLoginWithGithub,
    logout: handleLogout,
    clearAuthError,
  };
}

export default useAuth;