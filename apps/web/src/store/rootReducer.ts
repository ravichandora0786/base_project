import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/store/auth.slice';
import { commonReducer } from './common/slice';
import { userReducer } from '../app/(dashboard)/users/store/slice';
import { roleReducer } from '../app/(dashboard)/roles/store/slice';
import { permissionReducer } from '../app/(dashboard)/permissions/store/slice';
import { moduleReducer } from '../app/(dashboard)/modules/store/slice';
import { profileReducer } from '../app/(dashboard)/profile/store/slice';

const rootReducer = combineReducers({
  auth: authReducer,
  commonReducer,
  userReducer,
  roleReducer,
  permissionReducer,
  moduleReducer,
  profileReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
