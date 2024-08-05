import { AppActions, SET_APPS_FROM_API, SET_APP_DETAILS, SET_SIDEBAR_OPEN } from "./actions";
import { AppState } from "./type";

const initialState: AppState = {
  selectedApp: {},
  allApps: [],
  sidebarOpen:false,
};

export const appReducer = (
  state: AppState = initialState,
  action: AppActions
): AppState => {
  const { type, data } = action;

  switch (type) {
    case SET_APP_DETAILS: {
      return {
        ...state,
        selectedApp: data,
      };
    }
    case SET_APPS_FROM_API: {
      return {
        ...state,
        allApps: data,
      };
    }
    case SET_SIDEBAR_OPEN:{
      return {
        ...state,
        sidebarOpen: data,
      };
    }
    default:
      return state;
  }
};
