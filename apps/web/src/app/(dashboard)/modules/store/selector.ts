/**
 * Module selector
 * @format
 */

const moduleSelector = (state: any) => state.moduleReducer;

export const selectModuleDetailData = (state: any) => moduleSelector(state).moduleData;
export const selectModulePagination = (state: any) => moduleSelector(state).pagination;
export const selectModuleId = (state: any) => moduleSelector(state).moduleId;
export const selectModuleSearchData = (state: any) => moduleSelector(state).moduleSearchData;
export const selectAllModuleDataList = (state: any) => moduleSelector(state).allModuleList;
export const selectModuleModalOpen = (state: any) => moduleSelector(state).isModalOpen;
export const selectEditingModule = (state: any) => moduleSelector(state).editingModule;
