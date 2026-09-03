/**
 * Permission Saga
 * @format
 */

import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import { apiClient } from "@/lib/api/client";
import { setGlobalLoading } from "@/store/common/slice";
import {
  createPermission,
  deletePermission,
  getAllPermissions,
  getPermissionDetailById,
  setPermissionDetailData,
  setAllPermissionDataList,
  updatePermission,
} from "./slice";

function* getAllPermissionsSaga(action: any): Generator<any, any, any> {
  const { data, onSuccess, onFailure } = action.payload || {};
  try {
    yield put(setGlobalLoading(true));
    const response = yield call(apiClient.get, "/permissions", {
      params: data,
    });
    yield put(setAllPermissionDataList(response.data));
    if (onSuccess) yield onSuccess({ message: response?.statusText, data: response?.data });
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message || "Failed to fetch permissions";
    toast.error(errorMessage);
    if (onFailure) yield onFailure({ message: errorMessage });
  } finally {
    yield put(setGlobalLoading(false));
  }
}

/**
 * Get Permission Details By Permission Id
 */
function* getPermissionDetailByIdSaga(action: any): Generator<any, any, any> {
  const { id, onSuccess, onFailure } = action.payload || {};
  try {
    yield put(setGlobalLoading(true));
    const response = yield call(apiClient.get, `/permissions/${id}`);
    yield put(setPermissionDetailData(response.data));
    if (onSuccess) yield onSuccess({ message: response?.statusText, data: response?.data });
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error?.message || "Failed to fetch permission";
    toast.error(errorMessage);
    if (onFailure) yield onFailure({ message: errorMessage });
  } finally {
    yield put(setGlobalLoading(false));
  }
}

/**
 * Add New Permission
 */
function* createNewPermissionSaga(action: any): Generator<any, any, any> {
  const { data, onSuccess, onFailure } = action.payload || {};
  try {
    yield put(setGlobalLoading(true));
    const response = yield call(apiClient.post, "/permissions", data);
    if (onSuccess) yield onSuccess({ message: response?.statusText, data: response?.data });
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error?.message || "Failed to create permission";
    toast.error(errorMessage);
    if (onFailure) yield onFailure({ message: errorMessage });
  } finally {
    yield put(setGlobalLoading(false));
  }
}

/**
 * Update Permission By Id
 */
function* updatePermissionSaga(action: any): Generator<any, any, any> {
  const { id, data, onSuccess, onFailure } = action.payload || {};
  try {
    yield put(setGlobalLoading(true));
    const response = yield call(apiClient.patch, `/permissions/${id}`, data);
    if (onSuccess) yield onSuccess({ message: response?.statusText, data: response?.data });
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error?.message || "Failed to update permission";
    toast.error(errorMessage);
    if (onFailure) yield onFailure({ message: errorMessage });
  } finally {
    yield put(setGlobalLoading(false));
  }
}

/**
 * Delete Permission By Id
 */
function* deletePermissionSaga(action: any): Generator<any, any, any> {
  const { id, onSuccess, onFailure } = action.payload || {};
  try {
    yield put(setGlobalLoading(true));
    const response = yield call(apiClient.delete, `/permissions/${id}`);
    if (onSuccess) yield onSuccess({ message: response?.statusText, data: response?.data });
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error?.message || "Failed to delete permission";
    toast.error(errorMessage);
    if (onFailure) yield onFailure({ message: errorMessage });
  } finally {
    yield put(setGlobalLoading(false));
  }
}

export function* permissionSaga() {
  yield takeLatest(getAllPermissions, getAllPermissionsSaga);
  yield takeLatest(getPermissionDetailById, getPermissionDetailByIdSaga);
  yield takeLatest(createPermission, createNewPermissionSaga);
  yield takeLatest(updatePermission, updatePermissionSaga);
  yield takeLatest(deletePermission, deletePermissionSaga);
}
