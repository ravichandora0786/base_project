import { all } from 'redux-saga/effects';
import { watchAuth } from '../features/auth/store/auth.saga';
import { commonSaga } from './common/saga';
import { userSaga } from '../app/(dashboard)/users/store/saga';
import { roleSaga } from '../app/(dashboard)/roles/store/saga';
import { permissionSaga } from '../app/(dashboard)/permissions/store/saga';
import { moduleSaga } from '../app/(dashboard)/modules/store/saga';
import { profileSaga } from '../app/(dashboard)/profile/store/saga';

export default function* rootSaga() {
  yield all([
    watchAuth(),
    commonSaga(),
    userSaga(),
    roleSaga(),
    permissionSaga(),
    moduleSaga(),
    profileSaga(),
  ]);
}
