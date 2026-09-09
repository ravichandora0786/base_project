/**
 * Role Saga
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
  createRole,
  deleteRole,
  getAllRoles,
  getRoleDetailById,
  setRoleDetailData,
  setAllRoleDataList,
  updateRole,
} from './slice';

export function* roleSaga() {
  yield takeLatest(getAllRoles, (action: any) =>
    handleCrudGet('/roles', setAllRoleDataList, action, 'Failed to fetch roles')
  );
  yield takeLatest(getRoleDetailById, (action: any) =>
    handleCrudGetById('/roles', setRoleDetailData, action, 'Failed to fetch role')
  );
  yield takeLatest(createRole, (action: any) =>
    handleCrudCreate('/roles', action, 'Failed to create role')
  );
  yield takeLatest(updateRole, (action: any) =>
    handleCrudUpdate('/roles', action, 'Failed to update role')
  );
  yield takeLatest(deleteRole, (action: any) =>
    handleCrudDelete('/roles', action, 'Failed to delete role')
  );
}
