import { all } from 'redux-saga/effects';
import { watchAuth } from '../features/auth/store/auth.saga';

export default function* rootSaga() {
  yield all([
    watchAuth(),
  ]);
}
