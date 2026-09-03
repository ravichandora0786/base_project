/**
 * User slice
 * @format
 */

import { createAction, createSlice } from "@reduxjs/toolkit";

const initialState = {
  pagination: { pageIndex: 0, pageSize: 10 },
  userData: {} as any,
  allUserList: {} as any,
  userSearchData: { search: "", status: "all" as any },
  userId: "",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserPagination(state, action) {
      state.pagination = action.payload;
    },
    setUserDetailData(state, action) {
      state.userData = action.payload;
    },
    setUserId(state, action) {
      state.userId = action.payload;
    },
    setAllUserDataList(state, action) {
      state.allUserList = action.payload;
    },
    setUserSearchData(state, action) {
      state.userSearchData = action.payload;
    },
  },
});

// Reducer
export const userReducer = userSlice.reducer;

// States Actions
export const {
  setUserPagination,
  setUserDetailData,
  setUserSearchData,
  setAllUserDataList,
  setUserId,
} = userSlice.actions;

// Api Actions
export const createUser = createAction<any>("CREATE_NEW_USER");
export const updateUser = createAction<any>("UPDATE_USER");
export const getAllUsers = createAction<any>("GET_ALL_USERS");
export const getUserDetailById = createAction<any>("GET_USER_DETAIL_BY_ID");
export const deleteUser = createAction<any>("GET_DELETE_USER_BY_ID");
export const assignRoleToUser = createAction<any>("ASSIGN_ROLE_TO_USER");
export const assignBranchToUser = createAction<any>("ASSIGN_BRANCH_TO_USER");
export const getUserOptionsList = createAction<any>("GET_USER_OPTIONS_LIST");
