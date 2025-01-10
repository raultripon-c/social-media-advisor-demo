import { API } from "./api";
import { getRegionWiseAccessApi } from "./object.utils";
import { apiUrl } from "./constants";
import {
  setLogedUserRoles,
  setSelectedTenant,
  setAllTenants,
  setCustomerDetails
} from "../store/customer/actions";
import { toast } from "react-toastify";
interface Campaign {
  campaignName: string;
  status: string;
}

export const APIService = {
  getCustomerDetails: async (
    orgCode: any,
    dispatch: any,
  ) => {
    const APP_API_URL = (window as any)._env_.APP_API_URL;
    await API.get(`${APP_API_URL}/customers/code/${orgCode}`)
      .then((result: any) => {
        const response = result.data.data;
        if (response) {
          dispatch(setCustomerDetails(response));
        } else {
          dispatch(setCustomerDetails({}));
        }
      })
      .catch((error) => {
        toast.error("Error in getting customer details");
        console.log("Error in getting customer details : " + error);
        dispatch(setAllTenants({}));
      });
  },

  getCustomerTenants: async (
    id: string,
    dispatch: any,
    setTotalTenantsData: any,
    setIsLoading: any
  ) => {
    const url = apiUrl?.tenantsByCustomerId.replace("{customerid}", id);
    const APP_API_URL = (window as any)._env_.APP_API_URL;
    await API.get(`${APP_API_URL}/${url}`)
      .then((response: any) => {
        const result = response.data;
        if (result.data != null && result.status) {
          dispatch(setTotalTenantsData(result.data));
        } else {
          setAllTenants([]);
        }
      })
      .catch((error) => {
        // toast.error("Error in fetching tenants");
        console.log("Error in getting tenants : " + error);
        setAllTenants([]);
      }).finally(() => {
        setIsLoading(false);
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
    return await API.get(`${(window as any)._env_.TOOLS_API_URL}api/apps`, {
      withCredentials: false,
    })
      .then((result: any) => {
        let apps = result?.data?.data;
        let appNamesList = apps
          ?.filter((app: any) => {
            return app?.appType === "module-federation";
          })
          .map((filteredApps: any) => {
            return filteredApps?.name;
          });
        //sending the apps name list to chrome extension
        window.postMessage({ action: "appsdata", appsList: appNamesList }, "*");
        return apps;
      })
      .catch((error) => {
        toast.error("Error in fetching apps");
        console.log("Error in fetching apps : " + error);
        return null;
      })
  },

  getTenants: async (url: string, dispatch: any) => {
    try {
      const response = await API.get(url);
      if (response.data.data) {
        dispatch(setSelectedTenant(response.data.data));
        localStorage.setItem("selectedTenant", JSON.stringify(response.data.data));
        return response.data.data;
      } else {
        dispatch(setSelectedTenant({}));
        return;
      }
    } catch (error: any) {
      console.log("Error in getting tenants : " + error);
      return;
    }
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
      // toast.error("Error fetching metadata");
      console.error("Error in getMetaDataByRefNum: ", error);
      return null;
    }
  },

  getTenantConfig: async (props: any): Promise<any> => {
    try {
      const url = `${(window as any)._env_.CRM_HUB_URL}/tenant-config/getAdminPanelSettings`;
      const response = await API.post(url, props, {
        headers: {
          Authorization: `${window.keycloakInstance.token}`,
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
      });

      if (response?.data) {
        return response.data;
      } else {
        throw new Error("No metadata found for the provided refNum.");
      }
    } catch (error) {
      console.error("Error in getMetaDataByRefNum: ", error);
      return null;
    }
  },

  getRecruiterPermissions: async (props: any): Promise<any> => {
    try {
      const url = `${(window as any)._env_.CANDIDATES_USER_MANAGEMENT_URL}/loginPermissionsId`;
      const response = await API.post(url, props, {
        headers: {
          Authorization: `${window.keycloakInstance.token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response?.data) {
        return response.data;
      } else {
        throw new Error("No metadata found for the provided refNum.");
      }
    } catch (error) {
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
  },

  getTenantDetails: async (refNum: string) => {
    try {
      const url = `${(window as any)._env_.CMS_URL}/api/getTenantSearchSuggestion`;
      const response = await API.post(url, {
        refNum: refNum,
      }, { withCredentials: true });
      return response;
    } catch (error) {
      console.error('Error fetching tenant details:', error);
      throw error;
    }
  },

  getSiteMetaData: async (refNum: string) => {
    try {
      const url = `${(window as any)._env_.CMS_URL}/api/getSiteMetaData`;
      const response = await API.post(url, {
        refNum: refNum,
      }, { withCredentials: true });
      return response;
    } catch (error) {
      console.error('Error fetching site meta data:', error);
      throw error;
    }
  },

  triggerTxeLogin: async () => {
    try {
      const { code, type } = window.orgInfo ?? {};
      const res = await API.post(
        `${(window as any)._env_.CMS_URL}/api/txeLogin`,
        {
          "ph-org-code": code,
          "ph-org-type": type,
          token: window.keycloakInstance.token,
          expires_in: window?.keycloakInstance?.tokenParsed?.exp,
        },
        { withCredentials: true }
      );
      return res;
    }
    catch (err) {
      console.error('Error triggering TXE login:', err);
      return null;
      // throw err;
    }
  },

  getPageRecommendations: async (locale: string, refNum: string) => {
    try {
      const res = await API.post(
        `${(window as any)._env_.CMS_URL}/api/getPageRecommendations`,
        {
          batchSize: 6,
          isSVRequired: false,
          locale,
          offset: 0,
          refNum,
          siteVariant: "external",
        },
        { withCredentials: true }
      );
      return res;
    }
    catch (err) {
      console.error('Error fetching page recommendations:', err);
      throw err;
    }
  },

  getSupportedLangs: async (refNum: string) => {
    try {
      const resp = await API.post(
        `${(window as any)._env_.CMS_URL}/api/tenantLangs`,
        { refNum: refNum },
        { withCredentials: true }
      );
      if (resp.data.status === "success") {
        return resp.data.data;
      }
      return null;
    }
    catch (err) {
      console.error('Error fetching supported langs:', err);
      throw err;
    }
  },

  getDomainUrl: async (refNum: string, url: string) => {
    try {
      const res = await API.post(
        `${(window as any)._env_.CMS_URL}/api/getDomainUrl`,
        { refNum: refNum, url: url },
        { withCredentials: true }
      );
      return res;
    }
    catch (err) {
      console.error('Error fetching domain URL:', err);
      throw err;
    }
  },

  getCampaigns: async (tenantData: any, startIndex: number = 1, pageSize: number = 5): Promise<Campaign[]> => {
    const data = {
      refNum: tenantData?.refNum,
      browserBaseDate: new Date().toISOString(),
      startIndex,
      pageSize,
      searchCriteria: {
        searchText: "",
        createdBy: "",
        status: "",
        campaignDisplayType: "",
        sort: {
          field: "createdDate",
          order: -1,
        },
      }
    };
    try {
      const url = `${(window as any)._env_.CRM_HUB_URL}/ecampaign/getCampaignsV3`;
      const response: any = await API.post(url, data, {});
      const campaigns: Campaign[] = response.results.map((item: any) => ({
        campaignName: item.campaignName,
        status: item.status
      }));
      return campaigns;
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      // toast.error("Error fetching campaigns");
      return [];
    }
  },
  
  registerToken: async (refNum: string, code: string, type: string) => {
    const data = {
        "product_ver": "1.0",
        "newLogin": true,
        "applicationName": "candidate-app",
        "expiryTime": 900,
        "recruiterUserId": window.keycloakInstance.subject,
        "ph-org-code": code,
        "ph-org-type": type,
        "refNum": refNum
    };
    try {
      const url = `${(window as any)._env_.CANDIDATES_USER_MANAGEMENT_URL}/tokenDetail`;
      const response = await API.post(url, data, {});
      console.log('Token registration response:', response);
    } catch (error) {
      console.error('Error registering token:', error);
      // throw error;
    }
  },

  isCanvasSite: async (refNum: string) => {
    try {
      const url = `${(window as any)._env_.CMS_URL}/api/isCanvasSite`;
      const response = await API.post(url, { refNum: refNum }, { withCredentials: true });
      return response.data.data.isCanvasSite;
    } catch (error) {
      console.error('Error checking if site is Canvas:', error);
      return null;
    }
  },

  getPluginVersion: async () => {
    try {
      const url = `${(window as any)._env_.CMS_URL}/api/canvas/getPluginVersion`;
      const response = await API.post(url, {}, { withCredentials: true });
      return response;
    } catch (error) {

    }
  }
};