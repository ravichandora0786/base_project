/**
 * Common selector
 * @format
 */

const commonSelector = (state: any) => state.commonReducer;

export const selectIsSidebarOpen = (state: any) => commonSelector(state).isSidebarOpen;
export const selectTheme = (state: any) => commonSelector(state).theme;
export const selectGlobalLoading = (state: any) => commonSelector(state).globalLoading;
