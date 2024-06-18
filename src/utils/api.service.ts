import { API } from "./api";
import { getRegionWiseAccessApi } from "./object.utils";
import { apiUrl } from "./constants";
import {
  setCustomerDetails,
  setCustomerTenants,
  setLogedUserRoles,
  setSelectedTenant,
} from "../store/customer/actions";
import { toast } from "react-toastify";

export const APIService = {
  getCustomerDetails: async (
    orgCode: any,
    dispatch: any,
    selectedTenant: any
  ) => {
    const APP_API_URL = (window as any)._env_.APP_API_URL;
    await API.get(`${APP_API_URL}/customers/code/${orgCode}`)
      .then((result: any) => {
        const response = result.data.data;
        if (response) {
          dispatch(setCustomerDetails(response));
          if (!selectedTenant || Object.keys(selectedTenant).length === 0) {
            dispatch(setSelectedTenant({ refNum: response.tenantRefnums[0] }));
          }
          (window as any).customerRefnums = response?.tenantRefnums;
        } else {
          dispatch(setCustomerDetails({}));
        }
      })
      .catch((error) => {
        console.log("Error in getting customer details : " + error);
        dispatch(setCustomerDetails({}));
      });
  },
  getLoggedInUserRoles: async (dispatch: any, setRolesLoader: any) => {
    setRolesLoader(true);
    const DC_REGION: any = (window as any)._env_.APP_DC;
    const REGION_WISE_ACCESS_APIs: any = (window as any)._env_
      .APP_REGION_WISE_ACCESS_API;
    let REGION_ACCESS_API = getRegionWiseAccessApi(
      REGION_WISE_ACCESS_APIs,
      DC_REGION
    );
    await API.get(`${REGION_ACCESS_API}/${apiUrl.getLoggedInUserRoles}`)
      .then((response: any) => {
        const result = response.data;
        if (result.data != null && result.status) {
          dispatch(setLogedUserRoles(result.data));
        } else {
          dispatch(setLogedUserRoles([]));
        }
      })
      .catch((error) => {
        dispatch(setLogedUserRoles({}));
        console.log("Error in getting roles : " + error);
      })
      .finally(() => {
        setRolesLoader(false);
      });
  },
  getAllApps: async (setAppsLoader?: any) => {
    // setAppsLoader(true);
    return await API.get(`${(window as any)._env_.TOOLS_API_URL}api/apps`)
      .then((result: any) => {
        let apps = [
          {
            id: "c809a871-b863-4be7-b269-89628221831b",
            name: "CMS",
            icon: "",
            parentName: "CMS",
            searchKeys: ["events"],
            accessibility: null,
            appType: "external",
            hoverText: "CMS",
            loadingText: "Loading CMS",
            appConfig: {
              link: "https://cms-qa1.phenompro.com/tier3",
            },
            rbacDetails: {
              roles: [],
              clientId: "",
            },
            isParent: false,
            context: "customer",
            showSidebar: null,
            order: 2,
            events: null,
            framework: null,
          },
          {
            id: "9e1b1a48-12e4-4799-bae4-29c3c9fd8508",
            name: "CRM",
            icon: "",
            parentName: "CRM",
            searchKeys: ["events", "events", "crm-events"],
            accessibility: [],
            appType: "module-federation",
            hoverText: "Events",
            loadingText: "Loading Events...",
            appConfig: {
              appName: "cpui",
              module: "./CRMEvents",
              route: "/events",
              url: "https://qa3-candidates.phenompeople.com/remoteEntry.js",
              envconfig:
                "https://certificate-manager-qa.phenompro.com/env-config.js",
              loadingMessage: "Loading",
              accessType: "phenom",
              showSideNav: "false",
              isMfProduct: "true",
            },
            rbacDetails: {
              clientId: "tls-automation-api",
            },
            isParent: false,
            context: "tenant",
            showSidebar: null,
            order: 1,
            events: null,
            framework: "ANGULAR",
          },
        ];
        let appNamesList = apps
          ?.filter((app: any) => {
            return app?.appType === "module-federation";
          })
          .map((filteredApps: any) => {
            return filteredApps?.name;
          });

        //sending the apps name list to chrome extension
        sessionStorage.setItem("allapps",JSON.stringify(apps))
        window.postMessage({ action: "appsdata", appsList: appNamesList }, "*");
        return apps;
      })
      .catch((error) => {
        toast.error("Error in fetching apps");
        console.log("Error in fetching apps : " + error);
        return null;
      })
      .finally(() => {
        // setAppsLoader(false);
      });
  },
  getCustomerTenants: async (
    id: string,
    dispatch: any,
    selectedTenant?: any
  ) => {
    const url = apiUrl?.tenantsByCustomerId.replace("{customerid}", id);
    const APP_API_URL = (window as any)._env_.APP_API_URL;
    await API.get(`${APP_API_URL}/${url}`)
      .then((response: any) => {
        const result = response.data;
        if (result.data != null && result.status) {
          dispatch(setCustomerTenants(result.data));
        } else {
          setCustomerTenants([]);
        }
        const primaryTenant = result.data.find((item: any) => item.isParent);
        if (Object.keys(selectedTenant)?.length === 0) {
          dispatch(setSelectedTenant(primaryTenant || response.data.data[0]));
        }
      })
      .catch((error) => {
        console.log("Error in getting tenants : " + error);
        setCustomerTenants([]);
      });
  },
  getTenants: async (url: string, dispatch: any) => {
    API.get(url)
      .then((response: any) => {
        dispatch(setSelectedTenant(response.data.data));
      })
      .catch((error: any) => {
        console.log("Error in getting tenants : " + error);
      });
  },
};
