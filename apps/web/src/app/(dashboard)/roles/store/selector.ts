/**
 * Role selector
 * @format
 */

const roleSelector = (state: any) => state.roleReducer;

export const selectRoleDetailData = (state: any) => roleSelector(state).roleData;
export const selectRolePagination = (state: any) => roleSelector(state).pagination;
export const selectRoleId = (state: any) => roleSelector(state).roleId;
export const selectRoleSearchData = (state: any) => roleSelector(state).roleSearchData;
export const selectAllRoleDataList = (state: any) => roleSelector(state).allRoleList;
export const selectRoleModalOpen = (state: any) => roleSelector(state).isModalOpen;
export const selectEditingRole = (state: any) => roleSelector(state).editingRole;
