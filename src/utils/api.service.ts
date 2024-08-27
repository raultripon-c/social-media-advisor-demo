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
            let tenantRefnum = window.location.pathname.split("/")[2]=="summary"?response.tenantRefnums[0]:window.location.pathname.split("/")[2]
            dispatch(setSelectedTenant({ refNum: tenantRefnum }));
          }
          (window as any).customerRefnums = response?.tenantRefnums;
        } else {
          dispatch(setCustomerDetails({}));
        }
      })
      .catch((error) => {
        toast.error("Error in getting customer details");
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
        toast.error("Error in fetching roles");
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
        // let apps = result?.data?.data;
        let apps = result?.data?.data;
        let appNamesList = apps
          ?.filter((app: any) => {
            return app?.appType === "module-federation";
          })
          .map((filteredApps: any) => {
            return filteredApps?.name;
          });
        sessionStorage.setItem("allapps",JSON.stringify(apps))
        //sending the apps name list to chrome extension
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
        toast.error("Error in fetching tenants");
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
        toast.error("Error in fetching tenants");
        console.log("Error in getting tenants : " + error);
      });
  },

  getMetaDataByRefNum: async (refNum: string): Promise<any> => {
    try {
      const url = `${(window as any)._env_.ANALYTICS_SF_URL}/getMetaData?refNum=${refNum}`;
      const response = await API.get(url, {
        headers: {
          Authorization: `${window.keycloakInstance.token}`,
        },
      });

      if (response?.data) {
        return response.data.data.tenatConfig;
      } else {
        throw new Error("No metadata found for the provided refNum.");
      }
    } catch (error) {
      toast.error("Error fetching metadata");
      console.error("Error in getMetaDataByRefNum: ", error);
      return null;
    }
  },

  getDateRanges() {
    const currentEndDate = new Date();
    const currentStartDate = new Date(currentEndDate);
    currentStartDate.setDate(currentEndDate.getDate() - 90); 
    const previousEndDate = new Date(currentStartDate);
    previousEndDate.setDate(currentStartDate.getDate() - 1); 
    const previousStartDate = new Date(previousEndDate);
    previousStartDate.setDate(previousEndDate.getDate() - 90);
  
    return {
      current_start: currentStartDate.toISOString().split('T')[0],
      current_end: currentEndDate.toISOString().split('T')[0],
      previous_start: previousStartDate.toISOString().split('T')[0],
      previous_end: previousEndDate.toISOString().split('T')[0],
    };
  },
  
    getMetrics: async (metric: string, analyticsMetaData: any, isJobTrackerEnabled: boolean) => {
      const dateRanges = APIService.getDateRanges();
      const data = {
        filters: {
          refNum: analyticsMetaData?.refNum,
          dateRange: dateRanges,
          region: analyticsMetaData?.regions[0] || "us",
          siteType: "external",
          jobTrackerFlag: isJobTrackerEnabled,
        },
        metric: metric,
      };
      try {
        const url = `${(window as any)._env_.ANALYTICS_SB_URL}/analytics-data` 
        const response = await API.post(url, data);
        return response.data;
      } catch (error) {
        console.error('Error fetching metrics:', error);
        throw error;
      }
    }

};