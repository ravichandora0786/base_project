/**
 * User Saga
 * @format
 */

import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import { apiClient } from "@/lib/api/client";
import { setGlobalLoading } from "@/store/common/slice";
import {
  assignBranchToUser,
  assignRoleToUser,
  createUser,
  deleteUser,
  getAllUsers,
  getUserDetailById,
  getUserOptionsList,
  setUserDetailData,
  setAllUserDataList,
  updateUser,
} from "./slice";

/**
 * Get All User
 * @param {*}
 */
function* getAllUserListSaga(action: any): Generator<any, any, any> {
  const { data, onSuccess, onFailure } = action.payload || {};
  try {
    yield put(setGlobalLoading(true));
    const response = yield call(apiClient.get, "/users", {
      params: data,
    });
    yield put(setAllUserDataList(response.data));
    if (onSuccess) yield onSuccess({ message: response?.statusText, data: response?.data });
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message || "Something went wrong!";
    toast.error(errorMessage);
    if (onFailure) yield onFailure({ message: errorMessage });
  } finally {
    yield put(setGlobalLoading(false));
  }
}

/**
 * Get User Details By User Id
 * @param {*}
 */
function* getUserDetailByIdSaga(action: any): Generator<any, any, any> {
  const { id, onSuccess, onFailure } = action.payload || {};
  try {
    yield put(setGlobalLoading(true));
    const response = yield call(apiClient.get, `/users/${id}`);
    yield put(setUserDetailData(response.data));
    if (onSuccess) yield onSuccess({ message: response?.statusText, data: response?.data });
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error?.message || "Something went wrong!";
    toast.error(errorMessage);
    if (onFailure) yield onFailure({ message: errorMessage });
  } finally {
    yield put(setGlobalLoading(false));
  }
}

/**
 * Delete User By Id
 * @param {*}
 */
function* deleteUserByIdSaga(action: any): Generator<any, any, any> {
  const { id, onSuccess, onFailure } = action.payload || {};
  try {
    yield put(setGlobalLoading(true));
    const response = yield call(apiClient.delete, `/users/${id}`);
    if (onSuccess) yield onSuccess({ message: response?.statusText, data: response?.data });
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error?.message || "Delete failed";
    toast.error(errorMessage);
    if (onFailure) yield onFailure({ message: errorMessage });
  } finally {
    yield put(setGlobalLoading(false));
  }
}

/**
 * Add New User
 * @param {*}
 */
function* createNewUserSaga(action: any): Generator<any, any, any> {
  const { data, onSuccess, onFailure } = action.payload || {};
  try {
    yield put(setGlobalLoading(true));
    const response = yield call(apiClient.post, "/users", data);
    if (onSuccess) yield onSuccess({ message: response?.statusText, data: response?.data });
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error?.message || "Create failed";
    toast.error(errorMessage);
    if (onFailure) yield onFailure({ message: errorMessage });
  } finally {
    yield put(setGlobalLoading(false));
  }
}

/**
 * Update User By Id
 * @param {*}
 */
function* updateUsersSaga(action: any): Generator<any, any, any> {
  const { id, data, onSuccess, onFailure } = action.payload || {};
  try {
    yield put(setGlobalLoading(true));
    const response = yield call(apiClient.patch, `/users/${id}`, data);
    if (onSuccess) yield onSuccess({ message: response?.statusText, data: response?.data });
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error?.message || "Update failed";
    toast.error(errorMessage);
    if (onFailure) yield onFailure({ message: errorMessage });
  } finally {
    yield put(setGlobalLoading(false));
  }
}

/**
 * Assign Role to user
 * @param {*}
 */
function* assignRoleToUserSaga(action: any): Generator<any, any, any> {
  const { userId, roleId, onSuccess, onFailure } = action.payload || {};
  try {
    const response = yield call(apiClient.patch, `/users/${userId}/role`, {
      roleId,
    });
    if (onSuccess) yield onSuccess({ message: response?.statusText, data: response?.data });
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error?.message || "failed";
    toast.error(errorMessage);
    if (onFailure) yield onFailure({ message: errorMessage });
  }
}

/**
 * Assign Branch to user
 * @param {*}
 */
function* assignBranchToUserSaga(action: any): Generator<any, any, any> {
  const { userId, branchId, onSuccess, onFailure } = action.payload || {};
  try {
    const response = yield call(apiClient.patch, `/users/${userId}/branch`, {
      branchId,
    });
    if (onSuccess) yield onSuccess({ message: response?.statusText, data: response?.data });
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error?.message || "failed";
    toast.error(errorMessage);
    if (onFailure) yield onFailure({ message: errorMessage });
  }
}

/**
 * get user options
 * @param {*}
 */
function* getUserOptionsListSaga(action: any): Generator<any, any, any> {
  const { data, onSuccess, onFailure } = action.payload || {};
  try {
    const response = yield call(apiClient.get, "/users/options", {
      params: data,
    });
    if (onSuccess) yield onSuccess({ message: response?.statusText, data: response?.data });
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error?.message || "failed";
    toast.error(errorMessage);
    if (onFailure) yield onFailure({ message: errorMessage });
  }
}

export function* userSaga() {
  yield takeLatest(getAllUsers, getAllUserListSaga);
  yield takeLatest(deleteUser, deleteUserByIdSaga);
  yield takeLatest(getUserDetailById, getUserDetailByIdSaga);
  yield takeLatest(createUser, createNewUserSaga);
  yield takeLatest(updateUser, updateUsersSaga);
  yield takeLatest(assignRoleToUser, assignRoleToUserSaga);
  yield takeLatest(assignBranchToUser, assignBranchToUserSaga);
  yield takeLatest(getUserOptionsList, getUserOptionsListSaga);
}
