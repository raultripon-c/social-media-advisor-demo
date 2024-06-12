export const SET_APP_DETAILS = "SET_APP_DETAILS";
export const SET_APPS_FROM_API = "SET_APPS_FROM_API";
interface SetApp {
  type: typeof SET_APP_DETAILS;
  data: any;
}
interface SetAppsFromAPI {
  type: typeof SET_APPS_FROM_API;
  data: any;
}

export type AppActions = SetApp | SetAppsFromAPI;

export function setAppDetails(app: any) {
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