import { AppActions, SET_APPS_FROM_API, SET_APP_DETAILS, SET_SIDEBAR_OPEN, SET_DASHBOARD_SELECTED, SET_IS_CRM_FILTER_API_COMPLETED, SET_IS_CMS_FILTER_API_COMPLETED, SET_IS_ANALYTICS_CHILD_AVAILABLE } from "./actions";
import { AppState } from "./type";

const initialState: AppState = {
  selectedApp: {},
  allApps: [],
  sidebarOpen: false,
  dashboardSelected: false,
  isCRMFilterAPICompleted: false,
  isCMSFilterAPICompleted: false,
  isAnalyticsChildAvailable: false
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
    case SET_SIDEBAR_OPEN: {
      return {
        ...state,
        sidebarOpen: data,
      };
    }
    case SET_DASHBOARD_SELECTED: {
      return {
        ...state,
        dashboardSelected: data,
      };
    }
    case SET_IS_CRM_FILTER_API_COMPLETED: {
      return {
        ...state,
        isCRMFilterAPICompleted: data,
      };
    }
    case SET_IS_CMS_FILTER_API_COMPLETED: {
      return {
        ...state,
        isCMSFilterAPICompleted: data,
      };
    }
    case SET_IS_ANALYTICS_CHILD_AVAILABLE: {
      return {
        ...state,
        isAnalyticsChildAvailable: data,
      };
    }
    default:
      return state;
  }
};
