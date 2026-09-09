import { call, put } from 'redux-saga/effects';
import { toast } from 'react-toastify';
import { apiClient } from '@/lib/api/client';
import { setGlobalLoading } from './slice';

export function* handleCrudGet(
  endpoint: string,
  setListDataAction: any,
  action: any,
  errorMessage = 'Failed to fetch data'
): Generator<any, any, any> {
  const { data, onSuccess, onFailure } = action.payload || {};
  try {
    yield put(setGlobalLoading(true));
    const response = yield call(apiClient.get, endpoint, { params: data });
    yield put(setListDataAction(response.data));
    if (onSuccess) yield onSuccess({ message: response?.statusText, data: response?.data });
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || errorMessage;
    toast.error(msg);
    if (onFailure) yield onFailure({ message: msg });
  } finally {
    yield put(setGlobalLoading(false));
  }
}

export function* handleCrudGetById(
  endpoint: string,
  setDetailDataAction: any,
  action: any,
  errorMessage = 'Failed to fetch details'
): Generator<any, any, any> {
  const { id, onSuccess, onFailure } = action.payload || {};
  try {
    yield put(setGlobalLoading(true));
    const response = yield call(apiClient.get, `${endpoint}/${id}`);
    yield put(setDetailDataAction(response.data));
    if (onSuccess) yield onSuccess({ message: response?.statusText, data: response?.data });
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || errorMessage;
    toast.error(msg);
    if (onFailure) yield onFailure({ message: msg });
  } finally {
    yield put(setGlobalLoading(false));
  }
}

export function* handleCrudCreate(
  endpoint: string,
  action: any,
  errorMessage = 'Failed to create'
): Generator<any, any, any> {
  const { data, onSuccess, onFailure } = action.payload || {};
  try {
    yield put(setGlobalLoading(true));
    const response = yield call(apiClient.post, endpoint, data);
    if (onSuccess) yield onSuccess({ message: response?.statusText, data: response?.data });
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || errorMessage;
    toast.error(msg);
    if (onFailure) yield onFailure({ message: msg });
  } finally {
    yield put(setGlobalLoading(false));
  }
}

export function* handleCrudUpdate(
  endpoint: string,
  action: any,
  errorMessage = 'Failed to update'
): Generator<any, any, any> {
  const { id, data, onSuccess, onFailure } = action.payload || {};
  try {
    yield put(setGlobalLoading(true));
    const response = yield call(apiClient.patch, `${endpoint}/${id}`, data);
    if (onSuccess) yield onSuccess({ message: response?.statusText, data: response?.data });
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || errorMessage;
    toast.error(msg);
    if (onFailure) yield onFailure({ message: msg });
  } finally {
    yield put(setGlobalLoading(false));
  }
}

export function* handleCrudDelete(
  endpoint: string,
  action: any,
  errorMessage = 'Failed to delete'
): Generator<any, any, any> {
  const { id, onSuccess, onFailure } = action.payload || {};
  try {
    yield put(setGlobalLoading(true));
    const response = yield call(apiClient.delete, `${endpoint}/${id}`);
    if (onSuccess) yield onSuccess({ message: response?.statusText, data: response?.data });
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || errorMessage;
    toast.error(msg);
    if (onFailure) yield onFailure({ message: msg });
  } finally {
    yield put(setGlobalLoading(false));
  }
}
