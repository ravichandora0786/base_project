/**
 * Role slice
 * @format
 */

import { createAction, createSlice } from "@reduxjs/toolkit";

const initialState = {
  pagination: { pageIndex: 0, pageSize: 10 },
  roleData: {} as any,
  allRoleList: {} as any,
  roleSearchData: { search: "", status: "all" as any },
  roleId: "",
  isModalOpen: false,
  editingRole: null as any,
};

const roleSlice = createSlice({
  name: "role",
  initialState,
  reducers: {
    setRolePagination(state, action) {
      state.pagination = action.payload;
    },
    setRoleDetailData(state, action) {
      state.roleData = action.payload;
    },
    setRoleId(state, action) {
      state.roleId = action.payload;
    },
    setAllRoleDataList(state, action) {
      state.allRoleList = action.payload;
    },
    setRoleSearchData(state, action) {
      state.roleSearchData = action.payload;
    },
    setModalOpen(state, action) {
      state.isModalOpen = action.payload;
    },
    setEditingRole(state, action) {
      state.editingRole = action.payload;
    },
  },
});

// Reducer
export const roleReducer = roleSlice.reducer;

// States Actions
export const {
  setRolePagination,
  setRoleDetailData,
  setRoleSearchData,
  setAllRoleDataList,
  setRoleId,
  setModalOpen,
  setEditingRole,
} = roleSlice.actions;

// Api Actions
export const createRole = createAction<any>("CREATE_NEW_ROLE");
export const updateRole = createAction<any>("UPDATE_ROLE");
export const getAllRoles = createAction<any>("GET_ALL_ROLES");
export const getRoleDetailById = createAction<any>("GET_ROLE_DETAIL_BY_ID");
export const deleteRole = createAction<any>("GET_DELETE_ROLE_BY_ID");
