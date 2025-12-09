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

export const fetchCrmTenants = async () => {
  const paramObj = {
    refNum: window.keycloakInstance?.userInfo?.tenant_id,
    applicationName: "Candidate App",
  };

  try {
    // Retrieve cached tenants from sessionStorage
    const crmTenants: any[] =
      typeof window !== "undefined" &&
        sessionStorage.getItem("crmTenants") &&
        sessionStorage.getItem("crmTenants") !== "undefined" &&
        sessionStorage.getItem("crmTenants") !== "null"
        ? JSON.parse(sessionStorage.getItem("crmTenants") as string)
        : [];

    if (Array.isArray(crmTenants) && crmTenants.length > 0) {
      return crmTenants;
    }

    // Fetch tenants from the API
    const { code, type } = window?.orgInfo;
    await APIService.registerToken(null, code, type);
    const fetchedTenants = await APIService.getCrmTenantList(paramObj);
    return fetchedTenants;
  } catch (error) {
    console.error("Failed to fetch CRM tenants:", error);
  }
};
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
        const selectedTenant = response.data.data;
        dispatch(setSelectedTenant(selectedTenant));
        localStorage.setItem("selectedTenant", JSON.stringify(selectedTenant));
        (window as any).txeTenant = selectedTenant;
        return selectedTenant;
      } else {
        dispatch(setSelectedTenant({}));
        return;
      }
    } catch (error: any) {
      console.log("Error in getting tenants : " + error);
      return;
    }
  },

  getMetaDataByRefNum: async (refNum: string, options?: { signal?: AbortSignal }): Promise<any> => {
    try {
      const url = `${(window as any)._env_.ANALYTICS_SF_URL}/getMetaData?refNum=${refNum}`;
      const response = await API.get(url, {
        headers: {
          Authorization: `${window.keycloakInstance.token}`,
        },
        signal: options?.signal
      });

      if (response?.data) {
        return response.data.data.tenatConfig;
      } else {
        throw new Error("No metadata found for the provided refNum.");
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw error;
      }
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
  getCrmTenantList: async (props: any): Promise<any> => {
    try {
      const url = `${(window as any)._env_.CRM_HUB_URL}/tenant-config/getNewTenantsList`;
      const response = await API.post(url, props, {
        headers: {
          Authorization: `${window.keycloakInstance.token}`,
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
      });

      if (response?.data) {
        sessionStorage.setItem("crmTenants", JSON.stringify(response.data.tenants?.customersList));
        return response.data;
      } else {
        throw new Error("No metadata found for the provided refNum.");
      }
    } catch (error) {
      console.error("Error in getCrmTenantList: ", error);
      return null;
    }
  },

  getListItems: async (props: any): Promise<any> => {
    try {
      const url = `${(window as any)._env_.TOOLS_API_URL}api/crm/getLists`;
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
        throw new Error("No list items found for the provided refNum.");
      }
    } catch (error) {
      console.error("Error in getListItems: ", error);
      return null;
    }
  },
  getSuggestedLists: async (props: any): Promise<any> => {
    try {
      const url = `${(window as any)._env_.TOOLS_API_URL}api/crm/getSuggestedLists`;
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
        throw new Error("No list items found for the provided refNum.");
      }
    } catch (error) {
      console.error("Error in getListItems: ", error);
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

  getMetrics: async (metric: string, analyticsMetaData: any, isJobTrackerEnabled: boolean, options?: { signal?: AbortSignal }) => {
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
      const response = await API.post(url, data, { signal: options?.signal });
      return response.data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw error;
      }
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

  getTaskProgress: async (payload: { refNum: string; type: string; pageId: string }) => {
    try {
      const url = `${(window as any)._env_.CMS_URL}/api/getTaskProgress`;
      const response = await API.post(url, payload, { withCredentials: true });
      return response;
    } catch (error) {
      console.error('Error fetching task progress:', error);
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
      if(res?.data?.data) {
        document.cookie = 'token=' + res?.data?.data + ';path=/';
      }
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

  getSiteVariants: async (refNum: string) => {
    try {
      const resp = await API.post(
        `${(window as any)._env_.CMS_URL}/api/getSiteVariants`,
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

  getAllPages: async (payload: any) => {
    try {
      const resp = await API.post(
        `${(window as any)._env_.CMS_URL}/api/getAllPages`,
        payload,
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

  getCampaigns: async (tenantData: any, startIndex: number = 1, pageSize: number = 5, options?: { signal?: AbortSignal }): Promise<Campaign[]> => {
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
      const response: any = await API.post(url, data, { signal: options?.signal });
      const campaigns: Campaign[] = response?.results?.map((item: any) => ({
        campaignName: item.campaignName,
        status: item.status
      }));
      return campaigns;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw error;
      }
      console.error('Error fetching campaigns:', error);
      return [];
    }
  },

  registerToken: async (refNum: any, code: string, type: string, options?: { signal?: AbortSignal }) => {
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
      const response = await API.post(url, data, { signal: options?.signal });
      console.log('Token registration response:', response);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw error;
      }
      console.error('Error registering token:', error);
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
  },

  getPagesForContent: async (payload: any) => {
    try {
      const url = `${(window as any)._env_.TOOLS_API_URL}api/cms/getPagesForContent`;
      const response = await API.post(url, payload, { withCredentials: false });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching pages for content:', error);
      return null;
    }
  },

  getBlogsForContent: async (payload: any) => {
    try {
      const url = `${(window as any)._env_.TOOLS_API_URL}api/cms/getBlogDetailsForContent`;
      const response = await API.post(url, payload, { withCredentials: false });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching blogs for content:', error);
      return null;
    }
  },

  getAllBlogsDetails: async (payload: any) => {
    try {
      const url = `${(window as any)._env_.TOOLS_API_URL}api/cms/getAllBlogsDetails`;
      const response = await API.post(url, payload, { withCredentials: false });
      return response.data.data;
    }
    catch (error) {
      console.error('Error fetching all blog details:', error);
      return null;
    }
  },

  generateCMSAIBlog: async (payload: any) => {
    try {
      const url = `${(window as any)._env_.TOOLS_API_URL}api/cms/generateAIBlogArticle`;
      const response = await API.post(url, payload, { withCredentials: false });
      return response.data.data;
    }
    catch (error) {
      console.error('Error generating CMS AI blog:', error);
      return null;
    }
  },

  generateCMSAIPage: async (payload: any) => {
    try {
      const url = `${(window as any)._env_.TOOLS_API_URL}api/cms/generateContentPage`;
      const response = await API.post(url, payload, { withCredentials: false });
      return response.data.data;
    }
    catch (error) {
      console.error('Error generating CMS AI page:', error);
      return null;
    }
  },

  getCRMUserInfo: async () => {
    try {
      const url = `${(window as any)._env_.CANDIDATES_USER_MANAGEMENT_URL}/userInfo`;
      const response = await API.get(url, {

      });
      return response.data;
    } catch (error) {
      console.error('Error fetching CRM user info:', error);
      return null;
    }
  },

  generateCRMEmailTemplate: async (payload: any) => {
    try {
      const url = `${(window as any)._env_.TOOLS_API_URL}api/content-cluster/generateEmailTemplates`;
      const response = await API.post(url, payload, { withCredentials: false });
      return response.data.data;
    }
    catch (error) {
      console.error('Error generating CRM email template:', error);
      return null;
    }
  },

  getEmailTemplatesForContent: async (payload: any) => {
    try {
      const url = `${(window as any)._env_.TOOLS_API_URL}api/crm/getEmailTemplatesForContent`;
      const response = await API.post(url, payload, { withCredentials: false });
      return response.data.data;
    }
    catch (error) {
      console.error('Error fetching email templates for content:', error);
      return null;
    }
  },

  getAllEmailTemplates: async (payload: any) => {
    try {
      const url = `${(window as any)._env_.TOOLS_API_URL}api/crm/getAllEmailTemplates`;
      const response = await API.post(url, payload, { withCredentials: false });
      return response.data.data;
    }
    catch (error) {
      console.error('Error fetching all email templates:', error);
      return null;
    }
  },

  getAllCmsEmailTemplates: async (payload: any) => {
    try {
      const url = `${(window as any)._env_.CMS_URL}/api/email/getEmailTemplatesByRefNumLocale`;
      const response = await API.post(url, payload, { withCredentials: true });
      return response.data.data;
    }
    catch (error) {
      console.error('Error fetching all cms email templates:', error);
      return null;
    }
  },

  getPreview: async (payload: any) => {
    try {
      const url = `${(window as any)._env_.TOOLS_API_URL}api/crm/getPreview`;
      const response = await API.post(url, payload, { withCredentials: false });
      return response.data.data;
    }
    catch (error) {
      console.error('Error fetching preview:', error);
      return null;
    }
  },


  createContentCluster: async (payload: any) => {
    try {
      const url = `${(window as any)._env_.TOOLS_API_URL}api/content-cluster/save`;
      const response = await API.post(url, payload, { withCredentials: false });
      return response.data.data;
    }
    catch (error) {
      console.error('Error creating content cluster:', error);
      return null;
    }
  },
  
  enhancePrompt: async (payload: any) => {
    try {
      const url = `${(window as any)._env_.TOOLS_API_URL}api/content-cluster/enhancePrompt`;
      const response = await API.post(url, payload, { withCredentials: false });
      return response.data.data;
    }
    catch (error) {
      console.error('Error creating content cluster:', error);
      return null;
    }
  },

  captureScreenshot: async (payload: any) => {
    try {
      const url = `${(window as any)._env_.TOOLS_API_URL}api/content-cluster/captureScreenshot`;
      const response = await API.post(url, payload, { withCredentials: false });
      return response.data.data;
    }
    catch (error) {
      console.error('Error creating content cluster:', error);
      return null;
    }
  },

  updateCluster: async (payload: any) => {
    try {
      const url = `${(window as any)._env_.TOOLS_API_URL}api/content-cluster/update/${payload.clusterId}`;
      const response = await API.put(url, payload, { withCredentials: false });
      return response.data.data;
    }
    catch (error) {
      console.error('Error creating content cluster:', error);
      return null;
    }
  },
  

  createAIPages: async (payload: any) => {
    try {
      const url = `${(window as any)._env_.TOOLS_API_URL}api/content-cluster/create-all`;
      const response = await API.post(url, payload, { withCredentials: false });
      return response.data.data;
    }
    catch (error) {
      console.error('Error creating content cluster:', error);
      return null;
    }
  },

  createAIPagesV2: async (payload: any) => {
    try {
      const url = `${(window as any)._env_.TOOLS_API_URL}api/content-cluster/create-allV2`;
      const response = await API.post(url, payload, { withCredentials: false });
      return response.data.data;
    }
    catch (error) {
      console.error('Error creating content cluster:', error);
      return null;
    }
  },

  getPromptBasedSuggestions: async (payload: any) => {
    try {
      const url = `${(window as any)._env_.TOOLS_API_URL}api/content-cluster/getPromptBasedSuggestions`;
      const response = await API.post(url, payload, { withCredentials: false });
      return response.data.data;
    }
    catch (error) {
      console.error('Error fetching all content clusters:', error);
      return null;
    }
  },

  getAllContentClusters: async (payload: any) => {
    try {
      const url = `${(window as any)._env_.TOOLS_API_URL}api/content-cluster/getAllClusters`;
      const response = await API.post(url, payload, { withCredentials: false });
      return response.data.data;
    }
    catch (error) {
      console.error('Error fetching all content clusters:', error);
      return null;
    }
  },

  getClusterById: async (clusterId: string) => {
    try {
      const url = `${(window as any)._env_.TOOLS_API_URL}api/content-cluster/getClusterById/${clusterId}`;
      const response = await API.get(url, { withCredentials: false });
      if(response?.data?.data) {
        return response.data.data;
      } 
      return [];
    } catch (error) {
      console.error('Error fetching cluster by id:', error);
      return null;
    }
  },

  getPagePublishStates: async (payload: any) => {
    try {
      const url = `${(window as any)._env_.TOOLS_API_URL}api/cms/getPagePublishStates`;
      const response = await API.post(url, payload, { withCredentials: false });
      console.log("Page Publish States API Response:", response.data);
      if (response.data.status === "success") {
        return response.data.data;
      }
      return [];
    }
    catch (error) {
      console.error('Error fetching page publish states:', error);
      return [];
    }
  },

  getAnalyticsTenants: async (refNum: string) => {
    try {
      const url = `${(window as any)._env_.ANALYTICS_SB_URL}/customers-list?refNum=${refNum}`;
      const response = await API.get(url, {
        headers: {
          Authorization: `${window.keycloakInstance.token}`,
        },
      });
      if(response?.data?.data) {
        return response.data.data;
      } 
      return [];
    } catch (error) {
      console.error('Error fetching analytics tenants:', error);
      return null;
    }
  },

  validateClusterFields: async (payload: any) => {
    try {
      const url = `${(window as any)._env_.TOOLS_API_URL}api/content-cluster/validateClusterFields`;
      const response = await API.post(url, payload, { withCredentials: false });
      return response.data;
    }
    catch (error) {
      console.error('Error validating cluster fields:', error);
      return null;
    }
  },

  generateClusterName: async (payload: any) => {
    try {
      const url = `${(window as any)._env_.TOOLS_API_URL}api/content-cluster/generateClusterName`;
      const response = await API.post(url, payload, { withCredentials: false });
      return response.data.data;
    }
    catch (error) {
      console.error('Error generating cluster name:', error);
      return null
    }
  },

  generateHtmlStructure: async (payload: any) => {
    try {
      const url = `${(window as any)._env_.TOOLS_API_URL}api/content-cluster/generateAIPagePreview`;
      const response = await API.post(url, payload, { withCredentials: false });
      // const response = await API.get("http://localhost:8082/PageListData.json");
      return response.data;
    }
    catch (error) {
      console.error('Error generating cluster name:', error);
      return null
    }
  },

  deleteCluster: async (payload: any) => {
    try {
      const url = `${(window as any)._env_.TOOLS_API_URL}api/content-cluster/delete`;
      const response = await API.delete(url, { 
        data: payload,
        withCredentials: false 
      });
      return response.data.data;
    }
    catch (error) {
      console.error('Error deleting cluster:', error);
      return null;
    }
  },

  getDraftStatus: async (clusterId: string) => {
    try {
      const url = `${(window as any)._env_.TOOLS_API_URL}api/content-cluster/getDraftStatus/${clusterId}`;
      const response = await API.get(url, { withCredentials: false });
      return response.data.data;
    }
    catch (error) {
      console.error('Error fetching draft status:', error);
      return null;
    }
  }

};