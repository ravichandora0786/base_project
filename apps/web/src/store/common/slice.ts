/**
 * Common slice
 * @format
 */

import { createAction, createSlice } from "@reduxjs/toolkit";

const initialState = {
  isSidebarOpen: true,
  theme: "light",
  globalLoading: false,
};

const commonSlice = createSlice({
  name: "common",
  initialState,
  reducers: {
    setSidebarOpen(state, action) {
      state.isSidebarOpen = action.payload;
    },
    setTheme(state, action) {
      state.theme = action.payload;
    },
    setGlobalLoading(state, action) {
      state.globalLoading = action.payload;
    },
  },
});

// Reducer
export const commonReducer = commonSlice.reducer;

// States Actions
export const {
  setSidebarOpen,
  setTheme,
  setGlobalLoading,
} = commonSlice.actions;
