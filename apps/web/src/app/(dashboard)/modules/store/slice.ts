/**
 * Module slice
 * @format
 */

import { createAction, createSlice } from "@reduxjs/toolkit";

const initialState = {
  pagination: { pageIndex: 0, pageSize: 10 },
  moduleData: {} as any,
  allModuleList: {} as any,
  moduleSearchData: { search: "", status: "all" as any },
  moduleId: "",
  isModalOpen: false,
  editingModule: null as any,
};

const moduleSlice = createSlice({
  name: "module",
  initialState,
  reducers: {
    setModulePagination(state, action) {
      state.pagination = action.payload;
    },
    setModuleDetailData(state, action) {
      state.moduleData = action.payload;
    },
    setModuleId(state, action) {
      state.moduleId = action.payload;
    },
    setAllModuleDataList(state, action) {
      state.allModuleList = action.payload;
    },
    setModuleSearchData(state, action) {
      state.moduleSearchData = action.payload;
    },
    setModalOpen(state, action) {
      state.isModalOpen = action.payload;
    },
    setEditingModule(state, action) {
      state.editingModule = action.payload;
    },
  },
});

// Reducer
export const moduleReducer = moduleSlice.reducer;

// States Actions
export const {
  setModulePagination,
  setModuleDetailData,
  setModuleSearchData,
  setAllModuleDataList,
  setModuleId,
  setModalOpen,
  setEditingModule,
} = moduleSlice.actions;

// Api Actions
export const createModule = createAction<any>("CREATE_NEW_MODULE");
export const updateModule = createAction<any>("UPDATE_MODULE");
export const getAllModules = createAction<any>("GET_ALL_MODULES");
export const getModuleDetailById = createAction<any>("GET_MODULE_DETAIL_BY_ID");
export const deleteModule = createAction<any>("GET_DELETE_MODULE_BY_ID");
