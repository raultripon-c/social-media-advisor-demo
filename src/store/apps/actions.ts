export const SET_APP_DETAILS = "SET_APP_DETAILS";
export const SET_APPS_FROM_API = "SET_APPS_FROM_API";
export const SET_SIDEBAR_OPEN = "SET_SIDEBAR_OPEN";
export const SET_DASHBOARD_SELECTED = "SET_DASHBOARD_SELECTED";
export const SET_IS_CRM_FILTER_API_COMPLETED = "SET_IS_CRM_FILTER_API_COMPLETED";
export const SET_IS_CMS_FILTER_API_COMPLETED = "SET_IS_CMS_FILTER_API_COMPLETED";

interface SetApp {
  type: typeof SET_APP_DETAILS;
  data: any;
}
interface SetAppsFromAPI {
  type: typeof SET_APPS_FROM_API;
  data: any;
}

interface SetSidebarOpen {
  type: typeof SET_SIDEBAR_OPEN;
  data: boolean;
}

interface SetDashboardSelected {
  type: typeof SET_DASHBOARD_SELECTED;
  data: boolean;
}

interface SetIsCRMFilterApiCompleted {
  type: typeof SET_IS_CRM_FILTER_API_COMPLETED;
  data: boolean;
}

interface SetIsCMSFilterApiCompleted {
  type: typeof SET_IS_CMS_FILTER_API_COMPLETED;
  data: boolean;
}

export type AppActions = SetApp | SetAppsFromAPI | SetSidebarOpen | SetDashboardSelected | SetIsCRMFilterApiCompleted | SetIsCMSFilterApiCompleted;

export function setAppDetails(app: any): SetApp {
  return {
    type: SET_APP_DETAILS,
    data: app,
  };
}

export function setAppsFromAPI(apps: any): SetAppsFromAPI {
  return {
    type: SET_APPS_FROM_API,
    data: apps,
  };
}

export function setSidebarState(isOpen: boolean): SetSidebarOpen {
  return {
    type: SET_SIDEBAR_OPEN,
    data: isOpen,
  };
}

export function setDashboardSelected(isSelected: boolean): SetDashboardSelected {
  return {
    type: SET_DASHBOARD_SELECTED,
    data: isSelected,
  };
}

export function setIsCRMFilterApiCompleted(isCompleted: boolean): SetIsCRMFilterApiCompleted {
  return {
    type: SET_IS_CRM_FILTER_API_COMPLETED,
    data: isCompleted,
  };
}


export function setIsCMSFilterApiCompleted(isCompleted: boolean): SetIsCMSFilterApiCompleted {
  return {
    type: SET_IS_CMS_FILTER_API_COMPLETED,
    data: isCompleted,
  };
}