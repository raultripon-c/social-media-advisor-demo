export const SET_APP_DETAILS = "SET_APP_DETAILS";
export const SET_APPS_FROM_API = "SET_APPS_FROM_API";
export const SET_SIDEBAR_OPEN = "SET_SIDEBAR_OPEN";

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

export type AppActions = SetApp | SetAppsFromAPI | SetSidebarOpen;

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

