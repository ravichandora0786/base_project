/**
 * Permission selector
 * @format
 */

const permissionSelector = (state: any) => state.permissionReducer;

export const selectPermissionDetailData = (state: any) => permissionSelector(state).permissionData;
export const selectPermissionPagination = (state: any) => permissionSelector(state).pagination;
export const selectPermissionId = (state: any) => permissionSelector(state).permissionId;
export const selectPermissionSearchData = (state: any) => permissionSelector(state).permissionSearchData;
export const selectAllPermissionDataList = (state: any) => permissionSelector(state).allPermissionList;
export const selectPermissionModalOpen = (state: any) => permissionSelector(state).isModalOpen;
export const selectEditingPermission = (state: any) => permissionSelector(state).editingPermission;
