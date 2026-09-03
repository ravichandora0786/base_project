/**
 * Profile Saga
 * @format
 */

import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import { apiClient } from "@/lib/api/client";
import { setGlobalLoading } from "@/store/common/slice";
import {
  changePassword,
  getProfile,
  setProfile,
  updateProfileData,
  uploadProfileImage,
  setImgUploading,
} from "./slice";

function* getProfileSaga(action: any): Generator<any, any, any> {
  const { id, onSuccess, onFailure } = action.payload || {};
  try {
    yield put(setGlobalLoading(true));
    const response = yield call(apiClient.get, `/users/${id}`);
    yield put(setProfile(response.data));
    if (onSuccess) yield onSuccess({ message: response?.statusText, data: response?.data });
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message || "Failed to fetch profile";
    toast.error(errorMessage);
    if (onFailure) yield onFailure({ message: errorMessage });
  } finally {
    yield put(setGlobalLoading(false));
  }
}

function* updateProfileDataSaga(action: any): Generator<any, any, any> {
  const { data, onSuccess, onFailure } = action.payload || {};
  try {
    yield put(setGlobalLoading(true));
    const response = yield call(apiClient.patch, `/auth/profile`, data);
    yield put(setProfile(response.data));
    if (onSuccess) yield onSuccess({ message: response?.statusText, data: response?.data });
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message || "Failed to update profile";
    toast.error(errorMessage);
    if (onFailure) yield onFailure({ message: errorMessage });
  } finally {
    yield put(setGlobalLoading(false));
  }
}

function* changePasswordSaga(action: any): Generator<any, any, any> {
  const { data, onSuccess, onFailure } = action.payload || {};
  try {
    yield put(setGlobalLoading(true));
    const response = yield call(apiClient.patch, "/auth/change-password", data);
    if (onSuccess) yield onSuccess({ message: response?.statusText, data: response?.data });
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message || "Failed to change password";
    toast.error(errorMessage);
    if (onFailure) yield onFailure({ message: errorMessage });
  } finally {
    yield put(setGlobalLoading(false));
  }
}

function* uploadProfileImageSaga(action: any): Generator<any, any, any> {
  const { id, file, onSuccess, onFailure } = action.payload || {};
  try {
    yield put(setImgUploading(true));
    const formData = new FormData();
    formData.append("profile_image", file);
    const response = yield call(apiClient.patch, `/users/${id}/profile-image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    yield put(setProfile(response.data));
    if (onSuccess) yield onSuccess({ message: response?.statusText, data: response?.data });
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message || "Failed to upload image";
    toast.error(errorMessage);
    if (onFailure) yield onFailure({ message: errorMessage });
  } finally {
    yield put(setImgUploading(false));
  }
}

export function* profileSaga() {
  yield takeLatest(getProfile, getProfileSaga);
  yield takeLatest(updateProfileData, updateProfileDataSaga);
  yield takeLatest(changePassword, changePasswordSaga);
  yield takeLatest(uploadProfileImage, uploadProfileImageSaga);
}
