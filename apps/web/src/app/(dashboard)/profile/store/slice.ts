/**
 * Profile slice
 * @format
 */

import { createAction, createSlice } from "@reduxjs/toolkit";

const initialState = {
  activeTab: "profile",
  profile: null as any,
  editingPersonal: false,
  editingAddress: false,
  imgModalOpen: false,
  imgPreview: null as string | null,
  imgFile: null as any,
  imgUploading: false,
  imgDeleting: false,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setActiveTab(state, action) {
      state.activeTab = action.payload;
    },
    setProfile(state, action) {
      state.profile = action.payload;
    },
    setEditingPersonal(state, action) {
      state.editingPersonal = action.payload;
    },
    setEditingAddress(state, action) {
      state.editingAddress = action.payload;
    },
    setImgModalOpen(state, action) {
      state.imgModalOpen = action.payload;
    },
    setImgPreview(state, action) {
      state.imgPreview = action.payload;
    },
    setImgFile(state, action) {
      state.imgFile = action.payload;
    },
    setImgUploading(state, action) {
      state.imgUploading = action.payload;
    },
    setImgDeleting(state, action) {
      state.imgDeleting = action.payload;
    },
  },
});

// Reducer
export const profileReducer = profileSlice.reducer;

// States Actions
export const {
  setActiveTab,
  setProfile,
  setEditingPersonal,
  setEditingAddress,
  setImgModalOpen,
  setImgPreview,
  setImgFile,
  setImgUploading,
  setImgDeleting,
} = profileSlice.actions;

// Api Actions
export const getProfile = createAction<any>("GET_PROFILE");
export const updateProfileData = createAction<any>("UPDATE_PROFILE_DATA");
export const changePassword = createAction<any>("CHANGE_PASSWORD");
export const uploadProfileImage = createAction<any>("UPLOAD_PROFILE_IMAGE");
export const deleteProfileImage = createAction<any>("DELETE_PROFILE_IMAGE");
