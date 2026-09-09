/**
 * Permission Saga
 * @format
 */

import { takeLatest } from 'redux-saga/effects';
import {
  handleCrudGet,
  handleCrudGetById,
  handleCrudCreate,
  handleCrudUpdate,
  handleCrudDelete,
} from '@/store/common/sagaHelper';
import {
  createPermission,
  deletePermission,
  getAllPermissions,
  getPermissionDetailById,
  setPermissionDetailData,
  setAllPermissionDataList,
  updatePermission,
} from './slice';

export function* permissionSaga() {
  yield takeLatest(getAllPermissions, (action: any) =>
    handleCrudGet('/permissions', setAllPermissionDataList, action, 'Failed to fetch permissions')
  );
  yield takeLatest(getPermissionDetailById, (action: any) =>
    handleCrudGetById('/permissions', setPermissionDetailData, action, 'Failed to fetch permission')
  );
  yield takeLatest(createPermission, (action: any) =>
    handleCrudCreate('/permissions', action, 'Failed to create permission')
  );
  yield takeLatest(updatePermission, (action: any) =>
    handleCrudUpdate('/permissions', action, 'Failed to update permission')
  );
  yield takeLatest(deletePermission, (action: any) =>
    handleCrudDelete('/permissions', action, 'Failed to delete permission')
  );
}
