export const SET_APP_DETAILS = "SET_APP_DETAILS";
export const SET_APPS_FROM_API = "SET_APPS_FROM_API";
export const SET_SIDEBAR_OPEN = "SET_SIDEBAR_OPEN";
export const SET_DASHBOARD_SELECTED = "SET_DASHBOARD_SELECTED";

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

export type AppActions = SetApp | SetAppsFromAPI | SetSidebarOpen | SetDashboardSelected;

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
