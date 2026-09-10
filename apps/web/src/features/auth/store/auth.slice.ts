import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, RolePermission } from '@/types/models';

export type { User, RolePermission };

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isRegistered: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isRegistered: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state, action) {
      state.isLoading = true;
      state.error = null;
      state.isRegistered = false;
    },
    loginSuccess(state, action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>) {
      state.isLoading = false;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    registerStart(state, action) {
      state.isLoading = true;
      state.error = null;
      state.isRegistered = false;
    },
    registerSuccess(state) {
      state.isLoading = false;
      state.isRegistered = true;
    },
    registerFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.isRegistered = false;
      state.error = action.payload;
    },
    logoutStart(state) {
      state.isLoading = true;
    },
    logoutSuccess(state) {
      state.isLoading = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
    },
    logoutFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    checkAuthStart(state) {
      state.isLoading = true;
    },
    checkAuthSuccess(state, action: PayloadAction<{ user: User; accessToken?: string; refreshToken?: string }>) {
      state.isLoading = false;
      state.user = action.payload.user;
      if (action.payload.accessToken) {
        state.accessToken = action.payload.accessToken;
      }
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
      state.isAuthenticated = true;
    },
    checkAuthFailure(state) {
      state.isLoading = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
    },
    setAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
    },
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    clearError(state) {
      state.error = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logoutStart,
  logoutSuccess,
  logoutFailure,
  checkAuthStart,
  checkAuthSuccess,
  checkAuthFailure,
  setAccessToken,
  updateUser,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
