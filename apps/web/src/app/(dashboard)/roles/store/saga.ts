/**
 * Role Saga
 * @format
 */

import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import { apiClient } from "@/lib/api/client";
import { setGlobalLoading } from "@/store/common/slice";
import {
  createRole,
  deleteRole,
  getAllRoles,
  getRoleDetailById,
  setRoleDetailData,
  setAllRoleDataList,
  updateRole,
} from "./slice";

function* getAllRolesSaga(action: any): Generator<any, any, any> {
  const { data, onSuccess, onFailure } = action.payload || {};
  try {
    yield put(setGlobalLoading(true));
    const response = yield call(apiClient.get, "/roles", {
      params: data,
    });
    yield put(setAllRoleDataList(response.data));
    if (onSuccess) yield onSuccess({ message: response?.statusText, data: response?.data });
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message || "Failed to fetch roles";
    toast.error(errorMessage);
    if (onFailure) yield onFailure({ message: errorMessage });
  } finally {
    yield put(setGlobalLoading(false));
  }
}

/**
 * Get Role Details By Role Id
 */
function* getRoleDetailByIdSaga(action: any): Generator<any, any, any> {
  const { id, onSuccess, onFailure } = action.payload || {};
  try {
    yield put(setGlobalLoading(true));
    const response = yield call(apiClient.get, `/roles/${id}`);
    yield put(setRoleDetailData(response.data));
    if (onSuccess) yield onSuccess({ message: response?.statusText, data: response?.data });
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error?.message || "Failed to fetch role";
    toast.error(errorMessage);
    if (onFailure) yield onFailure({ message: errorMessage });
  } finally {
    yield put(setGlobalLoading(false));
  }
}

/**
 * Add New Role
 */
function* createNewRoleSaga(action: any): Generator<any, any, any> {
  const { data, onSuccess, onFailure } = action.payload || {};
  try {
    yield put(setGlobalLoading(true));
    const response = yield call(apiClient.post, "/roles", data);
    if (onSuccess) yield onSuccess({ message: response?.statusText, data: response?.data });
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error?.message || "Failed to create role";
    toast.error(errorMessage);
    if (onFailure) yield onFailure({ message: errorMessage });
  } finally {
    yield put(setGlobalLoading(false));
  }
}

/**
 * Update Role By Id
 */
function* updateRoleSaga(action: any): Generator<any, any, any> {
  const { id, data, onSuccess, onFailure } = action.payload || {};
  try {
    yield put(setGlobalLoading(true));
    const response = yield call(apiClient.patch, `/roles/${id}`, data);
    if (onSuccess) yield onSuccess({ message: response?.statusText, data: response?.data });
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error?.message || "Failed to update role";
    toast.error(errorMessage);
    if (onFailure) yield onFailure({ message: errorMessage });
  } finally {
    yield put(setGlobalLoading(false));
  }
}

/**
 * Delete Role By Id
 */
function* deleteRoleSaga(action: any): Generator<any, any, any> {
  const { id, onSuccess, onFailure } = action.payload || {};
  try {
    yield put(setGlobalLoading(true));
    const response = yield call(apiClient.delete, `/roles/${id}`);
    if (onSuccess) yield onSuccess({ message: response?.statusText, data: response?.data });
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error?.message || "Failed to delete role";
    toast.error(errorMessage);
    if (onFailure) yield onFailure({ message: errorMessage });
  } finally {
    yield put(setGlobalLoading(false));
  }
}

export function* roleSaga() {
  yield takeLatest(getAllRoles, getAllRolesSaga);
  yield takeLatest(getRoleDetailById, getRoleDetailByIdSaga);
  yield takeLatest(createRole, createNewRoleSaga);
  yield takeLatest(updateRole, updateRoleSaga);
  yield takeLatest(deleteRole, deleteRoleSaga);
}
