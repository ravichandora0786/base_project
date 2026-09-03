/**
 * User selector
 * @format
 */

const userSelector = (state: any) => state.userReducer;

export const selectUserDetailData = (state: any) => userSelector(state).userData;
export const selectUserPagination = (state: any) => userSelector(state).pagination;
export const selectUserId = (state: any) => userSelector(state).userId;
export const selectUserSearchData = (state: any) => userSelector(state).userSearchData;
export const selectAllUserDataList = (state: any) => userSelector(state).allUserList;
