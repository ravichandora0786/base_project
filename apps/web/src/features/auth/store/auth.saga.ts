import { call, put, takeLatest } from 'redux-saga/effects';
import { authService } from '../services/auth.service';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
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
    
    // Save authentication tokens in cookies for RouteGuard validation
    Cookies.set('access_token', data.accessToken, { expires: 1 });

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
    
    yield put(logoutSuccess());
    toast.info('Logged out successfully.');
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || 'Logout failed.';
    
    // Fallback: clear cookies anyway to allow user reset
    Cookies.remove('access_token');
    
    yield put(logoutSuccess());
    toast.info('Session reset.');
  }
}

function* handleCheckAuth(): Generator<any, void, any> {
  try {
    const user = yield call(authService.getMe);
    yield put(checkAuthSuccess({
      user,
      accessToken: Cookies.get('access_token'),
    }));
  } catch (error: any) {
    Cookies.remove('access_token');
    yield put(checkAuthFailure());
  }
}

export function* watchAuth() {
  yield takeLatest(loginStart.type, handleLogin);
  yield takeLatest(registerStart.type, handleRegister);
  yield takeLatest(logoutStart.type, handleLogout);
  yield takeLatest(checkAuthStart.type, handleCheckAuth);
}
