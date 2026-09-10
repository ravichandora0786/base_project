/**
 * Profile selector
 * @format
 */

const profileSelector = (state: any) => state.profileReducer;

export const selectActiveTab = (state: any) => profileSelector(state).activeTab;
export const selectProfileData = (state: any) => profileSelector(state).profile;
export const selectEditingPersonal = (state: any) => profileSelector(state).editingPersonal;
export const selectEditingAddress = (state: any) => profileSelector(state).editingAddress;
export const selectImgModalOpen = (state: any) => profileSelector(state).imgModalOpen;
export const selectImgPreview = (state: any) => profileSelector(state).imgPreview;
export const selectImgFile = (state: any) => profileSelector(state).imgFile;
export const selectImgUploading = (state: any) => profileSelector(state).imgUploading;
export const selectImgDeleting = (state: any) => profileSelector(state).imgDeleting;
