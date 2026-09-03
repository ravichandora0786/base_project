/**
 * Module Saga
 * @format
 */

import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import { apiClient } from "@/lib/api/client";
import { setGlobalLoading } from "@/store/common/slice";
import {
  createModule,
  deleteModule,
  getAllModules,
  getModuleDetailById,
  setModuleDetailData,
  setAllModuleDataList,
  updateModule,
} from "./slice";

function* getAllModulesSaga(action: any): Generator<any, any, any> {
  const { data, onSuccess, onFailure } = action.payload || {};
  try {
    yield put(setGlobalLoading(true));
    const response = yield call(apiClient.get, "/modules", {
      params: data,
    });
    yield put(setAllModuleDataList(response.data));
    if (onSuccess) yield onSuccess({ message: response?.statusText, data: response?.data });
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message || "Failed to fetch modules";
    toast.error(errorMessage);
    if (onFailure) yield onFailure({ message: errorMessage });
  } finally {
    yield put(setGlobalLoading(false));
  }
}

/**
 * Get Module Details By Module Id
 */
function* getModuleDetailByIdSaga(action: any): Generator<any, any, any> {
  const { id, onSuccess, onFailure } = action.payload || {};
  try {
    yield put(setGlobalLoading(true));
    const response = yield call(apiClient.get, `/modules/${id}`);
    yield put(setModuleDetailData(response.data));
    if (onSuccess) yield onSuccess({ message: response?.statusText, data: response?.data });
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error?.message || "Failed to fetch module";
    toast.error(errorMessage);
    if (onFailure) yield onFailure({ message: errorMessage });
  } finally {
    yield put(setGlobalLoading(false));
  }
}

/**
 * Add New Module
 */
function* createNewModuleSaga(action: any): Generator<any, any, any> {
  const { data, onSuccess, onFailure } = action.payload || {};
  try {
    yield put(setGlobalLoading(true));
    const response = yield call(apiClient.post, "/modules", data);
    if (onSuccess) yield onSuccess({ message: response?.statusText, data: response?.data });
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error?.message || "Failed to create module";
    toast.error(errorMessage);
    if (onFailure) yield onFailure({ message: errorMessage });
  } finally {
    yield put(setGlobalLoading(false));
  }
}

/**
 * Update Module By Id
 */
function* updateModuleSaga(action: any): Generator<any, any, any> {
  const { id, data, onSuccess, onFailure } = action.payload || {};
  try {
    yield put(setGlobalLoading(true));
    const response = yield call(apiClient.patch, `/modules/${id}`, data);
    if (onSuccess) yield onSuccess({ message: response?.statusText, data: response?.data });
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error?.message || "Failed to update module";
    toast.error(errorMessage);
    if (onFailure) yield onFailure({ message: errorMessage });
  } finally {
    yield put(setGlobalLoading(false));
  }
}

/**
 * Delete Module By Id
 */
function* deleteModuleSaga(action: any): Generator<any, any, any> {
  const { id, onSuccess, onFailure } = action.payload || {};
  try {
    yield put(setGlobalLoading(true));
    const response = yield call(apiClient.delete, `/modules/${id}`);
    if (onSuccess) yield onSuccess({ message: response?.statusText, data: response?.data });
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error?.message || "Failed to delete module";
    toast.error(errorMessage);
    if (onFailure) yield onFailure({ message: errorMessage });
  } finally {
    yield put(setGlobalLoading(false));
  }
}

export function* moduleSaga() {
  yield takeLatest(getAllModules, getAllModulesSaga);
  yield takeLatest(getModuleDetailById, getModuleDetailByIdSaga);
  yield takeLatest(createModule, createNewModuleSaga);
  yield takeLatest(updateModule, updateModuleSaga);
  yield takeLatest(deleteModule, deleteModuleSaga);
}
