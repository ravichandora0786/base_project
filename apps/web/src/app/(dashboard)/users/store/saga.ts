/**
 * User Saga
 * @format
 */

import { call, takeLatest } from 'redux-saga/effects';
import { toast } from 'react-toastify';
import { apiClient } from '@/lib/api/client';
import {
  handleCrudGet,
  handleCrudGetById,
  handleCrudCreate,
  handleCrudUpdate,
  handleCrudDelete,
} from '@/store/common/sagaHelper';
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
} from './slice';

function* assignRoleToUserSaga(action: any): Generator<any, any, any> {
  const { userId, roleId, onSuccess, onFailure } = action.payload || {};
  try {
    const response = yield call(apiClient.patch, `/users/${userId}/role`, { roleId });
    if (onSuccess) yield onSuccess({ message: response?.statusText, data: response?.data });
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error?.message || 'Failed to assign role';
    toast.error(errorMessage);
    if (onFailure) yield onFailure({ message: errorMessage });
  }
}

function* assignBranchToUserSaga(action: any): Generator<any, any, any> {
  const { userId, branchId, onSuccess, onFailure } = action.payload || {};
  try {
    const response = yield call(apiClient.patch, `/users/${userId}/branch`, { branchId });
    if (onSuccess) yield onSuccess({ message: response?.statusText, data: response?.data });
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error?.message || 'Failed to assign branch';
    toast.error(errorMessage);
    if (onFailure) yield onFailure({ message: errorMessage });
  }
}

function* getUserOptionsListSaga(action: any): Generator<any, any, any> {
  const { data, onSuccess, onFailure } = action.payload || {};
  try {
    const response = yield call(apiClient.get, '/users/options', { params: data });
    if (onSuccess) yield onSuccess({ message: response?.statusText, data: response?.data });
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error?.message || 'Failed to fetch options';
    toast.error(errorMessage);
    if (onFailure) yield onFailure({ message: errorMessage });
  }
}

export function* userSaga() {
  yield takeLatest(getAllUsers, (action: any) =>
    handleCrudGet('/users', setAllUserDataList, action, 'Failed to fetch users')
  );
  yield takeLatest(getUserDetailById, (action: any) =>
    handleCrudGetById('/users', setUserDetailData, action, 'Failed to fetch user')
  );
  yield takeLatest(createUser, (action: any) =>
    handleCrudCreate('/users', action, 'Failed to create user')
  );
  yield takeLatest(updateUser, (action: any) =>
    handleCrudUpdate('/users', action, 'Failed to update user')
  );
  yield takeLatest(deleteUser, (action: any) =>
    handleCrudDelete('/users', action, 'Failed to delete user')
  );
  yield takeLatest(assignRoleToUser, assignRoleToUserSaga);
  yield takeLatest(assignBranchToUser, assignBranchToUserSaga);
  yield takeLatest(getUserOptionsList, getUserOptionsListSaga);
}
