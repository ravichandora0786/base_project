/**
 * Permission slice
 * @format
 */

import { createAction, createSlice } from "@reduxjs/toolkit";

const initialState = {
  pagination: { pageIndex: 0, pageSize: 10 },
  permissionData: {} as any,
  allPermissionList: {} as any,
  permissionSearchData: { search: "", status: "all" as any },
  permissionId: "",
  isModalOpen: false,
  editingPermission: null as any,
};

const permissionSlice = createSlice({
  name: "permission",
  initialState,
  reducers: {
    setPermissionPagination(state, action) {
      state.pagination = action.payload;
    },
    setPermissionDetailData(state, action) {
      state.permissionData = action.payload;
    },
    setPermissionId(state, action) {
      state.permissionId = action.payload;
    },
    setAllPermissionDataList(state, action) {
      state.allPermissionList = action.payload;
    },
    setPermissionSearchData(state, action) {
      state.permissionSearchData = action.payload;
    },
    setModalOpen(state, action) {
      state.isModalOpen = action.payload;
    },
    setEditingPermission(state, action) {
      state.editingPermission = action.payload;
    },
  },
});

// Reducer
export const permissionReducer = permissionSlice.reducer;

// States Actions
export const {
  setPermissionPagination,
  setPermissionDetailData,
  setPermissionSearchData,
  setAllPermissionDataList,
  setPermissionId,
  setModalOpen,
  setEditingPermission,
} = permissionSlice.actions;

// Api Actions
export const createPermission = createAction<any>("CREATE_NEW_PERMISSION");
export const updatePermission = createAction<any>("UPDATE_PERMISSION");
export const getAllPermissions = createAction<any>("GET_ALL_PERMISSIONS");
export const getPermissionDetailById = createAction<any>("GET_PERMISSION_DETAIL_BY_ID");
export const deletePermission = createAction<any>("GET_DELETE_PERMISSION_BY_ID");
