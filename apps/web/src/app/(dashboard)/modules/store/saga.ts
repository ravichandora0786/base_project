/**
 * Module Saga
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
  createModule,
  deleteModule,
  getAllModules,
  getModuleDetailById,
  setModuleDetailData,
  setAllModuleDataList,
  updateModule,
} from './slice';

export function* moduleSaga() {
  yield takeLatest(getAllModules, (action: any) =>
    handleCrudGet('/modules', setAllModuleDataList, action, 'Failed to fetch modules')
  );
  yield takeLatest(getModuleDetailById, (action: any) =>
    handleCrudGetById('/modules', setModuleDetailData, action, 'Failed to fetch module')
  );
  yield takeLatest(createModule, (action: any) =>
    handleCrudCreate('/modules', action, 'Failed to create module')
  );
  yield takeLatest(updateModule, (action: any) =>
    handleCrudUpdate('/modules', action, 'Failed to update module')
  );
  yield takeLatest(deleteModule, (action: any) =>
    handleCrudDelete('/modules', action, 'Failed to delete module')
  );
}
