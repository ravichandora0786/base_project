import { call, put, takeLatest } from 'redux-saga/effects';
import { authService } from '../services/auth.service';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { purgeStore } from '@/store/persistorHelper';
import {
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
} from './auth.slice';

function* handleLogin(action: any): Generator<any, void, any> {
  try {
    const data = yield call(authService.login, action.payload);
    
    // Save authentication tokens and logged_in cookie for client-side state and RouteGuard
    Cookies.set('access_token', data.accessToken, { expires: 1 });
    if (data.refreshToken) {
      Cookies.set('refresh_token', data.refreshToken, { expires: 7 });
    }
    Cookies.set('logged_in', 'true', { expires: 7 });

    // Fetch the full profile (with permissions)
    const fullUser = yield call(authService.getMe);

    yield put(loginSuccess({
      user: fullUser,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    }));
    toast.success('Welcome back! Logged in successfully.');
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || 'Login failed. Please check your credentials.';
    yield put(loginFailure(errorMsg));
    toast.error(errorMsg);
  }
}

function* handleRegister(action: any): Generator<any, void, any> {
  try {
    yield call(authService.register, action.payload);
    yield put(registerSuccess());
    toast.success('Registration successful! Redirecting to login...');
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || 'Registration failed. Try again.';
    yield put(registerFailure(errorMsg));
    toast.error(errorMsg);
  }
}

function* handleLogout(): Generator<any, void, any> {
  try {
    yield call(authService.logout);
    // Remove authentication cookies
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    Cookies.remove('logged_in');
    
    yield put(logoutSuccess());
    yield call(purgeStore);
    toast.info('Logged out successfully.');
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || 'Logout failed.';
    
    // Fallback: clear cookies and storage anyway to allow user reset
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    Cookies.remove('logged_in');
    
    yield put(logoutSuccess());
    yield call(purgeStore);
    toast.info('Session reset.');
  }
}

function* handleCheckAuth(): Generator<any, void, any> {
  try {
    const user = yield call(authService.getMe);
    Cookies.set('logged_in', 'true', { expires: 7 });
    yield put(checkAuthSuccess({
      user,
      accessToken: Cookies.get('access_token'),
    }));
  } catch (error: any) {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    Cookies.remove('logged_in');
    yield put(checkAuthFailure());
  }
}

export function* watchAuth() {
  yield takeLatest(loginStart.type, handleLogin);
  yield takeLatest(registerStart.type, handleRegister);
  yield takeLatest(logoutStart.type, handleLogout);
  yield takeLatest(checkAuthStart.type, handleCheckAuth);
}
