/**
 * Common Saga
 * @format
 */

import { takeLatest } from "redux-saga/effects";
import { fetchAppConfig } from "./slice";

function* fetchAppConfigSaga() {
  try {
    // Staging / placeholder for common settings
    yield console.log("Common app config fetched");
  } catch (error) {
    console.error("Common config error:", error);
  }
}

export function* commonSaga() {
  yield takeLatest(fetchAppConfig, fetchAppConfigSaga);
}
