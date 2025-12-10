import React, { Fragment, useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import { EmptyState } from "@phenom/react-ui-components";
import { useKeycloak } from "phenom-auth-react-adapter";
import { AppStore } from "store";
import Toast from "../components/Toast/Toast";
import { IRoute, appRoutes } from "../routes/AppRoutes";
import { setUserRoles, setSiteMetaData, setSelectedTenant } from "../store/customer/actions";
import RBAJson from "../utils/RBA.json";
import {
  appSelectionHandler,
  findAppConfigByRoutes,
  getMfRoutes,
  showSidebar,
  transformAppData,
  handleDomainUrlForSite,
  refnumContainInCrmTenants,
} from "../utils/appUtils";

import {
  setAppDetails,
  setAppsFromAPI,
  setIsAnalyticsChildAvailable,
  setIsCMSFilterApiCompleted,
  setIsCRMFilterApiCompleted,
} from "../store/apps/actions";
import { APIService } from "../utils/api.service";
import "./AppLayout.scss";
import { InitialLoader } from "./Loader";
import ToolsSideBar from "./sideBar/SideBar";
import { AppSelectionOptions } from "interfaces/AppSelectionOptions";
import { Loader } from "@phenom/react-ui-components";
import { CommonConstants } from "../utils/common-constants";

interface AppLayoutProps {
  allApps: any;
}

/**
 * AppLayout component is the main layout for the application.
 * It handles the initialization and management of various states and effects
 * related to user authentication, application data, and navigation.
 *
 * @component
 * @param {AppLayoutProps} props - The properties for the AppLayout component.
 *
 * @returns {JSX.Element} The rendered AppLayout component.
 *
 * The component performs the following tasks:
 * - Fetches and sets application data.
 * - Manages user roles and tenant information.
 * - Handles navigation and routing.
 * - Initializes session tracking.
 * - Manages sidebar visibility and state.
 */
const AppLayout: React.FC<AppLayoutProps> = ({}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { keycloak } = useKeycloak();
  const [allRoutes, setAllRoutes] = useState<IRoute[]>([]);
  const [transformedAppData, setTransformedAppData] = useState({});
  const [customerTenantApps, setCustomerTenantApps] = useState();
  const [appsLoader, setAppsLoader] = useState(true);
  const [rolesLoader, setRolesLoader] = useState(true);
  const [isAppsLoaded, setIsAppsLoaded] = useState(false);
  const isLoadingAppsRef = useRef(false);
  const userDetails = window?.keycloakInstance?.tokenParsed?.userDetails;
  const [showSidebarMenu, toggleSidebarMenu] = useState(false);
  const { selectedApp, allApps } = useSelector((state: any) => state.app);
  let selectedTenant = JSON.parse(
    localStorage.getItem("selectedTenant") || "[]"
  );
  const siteMetaData = useSelector(
    (state: AppStore) => state.customer.siteMetaData
  );
  const logedUserRoles = useSelector(
    (state: AppStore) => state.customer.logedUserRoles
  );
  const sessionTrackerProjectKey = `${
    (window as any)._env_.SESSION_TRACKER_PROJECT_KEY || ""
  }`;
  const sessionTrackerIngestPoint = `${
    (window as any)._env_.SESSION_TRACKER_INGEST_POINT || ""
  }`;
  const userId = userDetails?.userName;
  const fetchedApps = useSelector((state: any) => state.app.allApps);
  const { user } = useSelector((state: AppStore) => state.customer);
  const storeIsCRMApiCompleted = useSelector(
    (state: AppStore) => state.app.isCRMFilterAPICompleted
  );
  const storeIsCMSApiCompleted = useSelector(
    (state: AppStore) => state.app.isCMSFilterAPICompleted
  );

  const navigateToApp = (
    selectedApp: any,
    customerCode: string,
    refNum: string,
    customRoute?: any
  ) => {
    localStorage.setItem("selectedApp", JSON.stringify(selectedApp));
    dispatch(setAppDetails(selectedApp));
    const appSelectionOptions: AppSelectionOptions = {
      selectedApp: selectedApp,
      navigate: navigate,
      customerCode: customerCode,
      refNum: refNum,
      siteMetaData: siteMetaData,
      dispatch: dispatch,
      openInNewTab: false,
      setSiteMetaData: setSiteMetaData,
      selectedTenant: selectedTenant,
      customeRoute: customRoute,
    };
    appSelectionHandler(appSelectionOptions);
  };

  const handleInternalNavigation = (event: CustomEvent) => {
    console.log(
      "Successfully listened internalNavigation event from CRM",
      event.detail.url
    );
    const url: string = event.detail.url;
    const mfRoutes = JSON.parse(sessionStorage.getItem("mfRoutes") || "[]");
    if (!mfRoutes.some((route: { path: string }) => route.path === url)) {
      url.includes("dashboard") && sessionStorage.setItem("txeCustomPath", url);
      console.log(allRoutes);
    }
    const path = window.location.pathname.split("/").filter(Boolean);

    const appRouteDictionary: { [key: string]: string } = {
      // "email-templates": "Email Manager",
      // "sms-templates": "SMS Manager",
      "sms-campaign": "Campaigns",
      campaigns: "Campaigns",
      automations: "Automations",
      lists: "Lists",
      events: "Events",
      "talent-communities": "Talent Community",
      candidates: "Candidates",
    };
    const currentApp = JSON.parse(
      sessionStorage.getItem("selectedApp") || "{}"
    );
    const urlLastRoute = url.split("/").pop();
    const matchedKey = Object.keys(appRouteDictionary).find((key) =>
      url.includes(key)
    );
    if (
      matchedKey &&
      decodeURIComponent(url).indexOf(";") === -1 &&
      url.includes(`${matchedKey}/`) &&
      currentApp?.name !== appRouteDictionary[matchedKey]
    ) {
      const response = JSON.parse(sessionStorage.getItem("allapps") || "[]");
      const detailsApp = response.find(
        (element: any) => element?.name === appRouteDictionary[matchedKey]
      );
      if (detailsApp) {
        const customerCode = selectedTenant?.customerCode || path[0];
        const refNum = selectedTenant?.refNum || path[1];
        console.log("CROSS MODULE NAVIGATION => Changed App to", detailsApp);
        navigateToApp(detailsApp, customerCode, refNum);
      }
    } else if (
      urlLastRoute &&
      currentApp?.name !== appRouteDictionary[urlLastRoute]
    ) {
      const response = JSON.parse(sessionStorage.getItem("allapps") || "[]");
      const detailsApp = response.find(
        (element: any) => element?.name === appRouteDictionary[urlLastRoute]
      );
      if (detailsApp) {
        const customerCode = selectedTenant?.customerCode || path[0];
        const refNum = selectedTenant?.refNum || path[1];
        console.log("CROSS MODULE NAVIGATION => Changed App to", detailsApp);
        navigateToApp(detailsApp, customerCode, refNum);
      }
    }
  };

  const checkAnalyticsTenant = async (refNum: string) => {
    const analyticsTenants = await APIService.getAnalyticsTenants(refNum);
    if (analyticsTenants && analyticsTenants.customersList[0] && analyticsTenants.customersList[0].areChildrenAvailable) {
      dispatch(setIsAnalyticsChildAvailable(true));
    } else {
      dispatch(setIsAnalyticsChildAvailable(false));
      (window as any).TXEMessageService && (window as any).TXEMessageService.dispatchEvent('TXE_UPDATE_METADATA', {
        refNum: refNum,
        persona: analyticsTenants.customersDetailList[refNum][0]?.persona || null
      });
    }

  }

  useEffect(() => {
    (async () => {
      const refNum = window.location.pathname.split("/")[2];
      const CustomerCode = window.location.pathname.split("/")[1];
      await checkAnalyticsTenant(refNum);
      if ( (!Object.keys(selectedTenant).length || !selectedTenant?.customerId) && refNum ) {
        selectedTenant = { customerCode: CustomerCode, refNum: refNum };
        localStorage.setItem("selectedTenant", JSON.stringify(selectedTenant));
        const tenantsUrl = `${(window as any)._env_.APP_API_URL}/customers/tenants/${refNum}`;
        APIService.getTenants(tenantsUrl, dispatch);
      } else {
        dispatch(setSelectedTenant(selectedTenant));
        (window as any).txeTenant = selectedTenant;
      }
      APIService.checkCmsEmailEnabled(refNum);
    })();

    let response = JSON.parse(sessionStorage.getItem("allapps") || "[]");
    if (response.length == 0 && !isLoadingAppsRef.current) {
      getAllApps();
    } else if (response.length > 0) {
      dispatch(setAppsFromAPI(response));
      const mfRoutes = getMfRoutes(response);
      setAllRoutes([...appRoutes, ...mfRoutes]);
      setIsAppsLoaded(true);
    }

    if (!window.keycloakInstance.bearer_token)
      window.keycloakInstance.bearer_token = "Bearer " + keycloak.token;

    window.addEventListener(
      "txeInternalNavigation",
      handleInternalNavigation as EventListener
    );

    return () => {
      window.removeEventListener(
        "txeInternalNavigation",
        handleInternalNavigation as EventListener
      );
    };
  }, []);

  useEffect(() => {
    if (storeIsCMSApiCompleted && storeIsCRMApiCompleted && isAppsLoaded) {
      handleCRMFilterAPICompletion();
    }
  }, [storeIsCMSApiCompleted, storeIsCRMApiCompleted, isAppsLoaded]);

  //for setting selectedApp in session
  useEffect(() => {
    let detailsApp =
      fetchedApps &&
      findAppConfigByRoutes(fetchedApps, `/${window.location.pathname.split('/').slice(3).join('/')}`)[0];
    if (
      detailsApp &&
      Object.keys(detailsApp).length != 0 &&
      !window.location.pathname.includes("summmary")
    ) {
      sessionStorage.setItem("selectedApp", JSON.stringify(detailsApp));
    }
  }, [fetchedApps, selectedTenant, selectedTenant?.refNum]);

  useEffect(() => {
    if (logedUserRoles?.length > 0) {
      let rbaroles: any = [];
      logedUserRoles.map((role: any) => {
        let rbarole = RBAJson.roles.filter(
          (rbarole: any) => rbarole.role === role
        )[0];
        rbaroles.push(rbarole);
      });
      dispatch(
        setUserRoles({
          roles: rbaroles,
        })
      );
    }
  }, [logedUserRoles?.length > 0]);

  // if selectedApp is changed then close the sidebar
  useEffect(() => {
    toggleSidebarMenu(false);
  }, [selectedApp]);

  useEffect(() => {
    setRolesLoader(false);
    if (selectedTenant?.customerId) {
      setAppsLoader(true);
      setCmsSiteMetaData();
      const setPermissionsBasedApps = async () => {
          await crmFilterApps(selectedTenant?.refNum, user);
          await cmsFilterApps(selectedTenant?.refNum);
          let response = JSON.parse(sessionStorage.getItem("allapps") || "[]");
          if (response.length == 0 && !isLoadingAppsRef.current) {
            getAllApps();
          }
          setAppsLoader(false);
      };
      setPermissionsBasedApps();
    }
  }, [selectedTenant?.customerId]);

  const setCmsSiteMetaData = async () => {
    const tenantSupportedLangs = await APIService.getSupportedLangs(
      selectedTenant?.refNum
    );
    APIService.checkCmsEmailEnabled(selectedTenant?.refNum);
    return handleDomainUrlForSite(
      tenantSupportedLangs,
      selectedTenant,
      dispatch,
      setSiteMetaData,
      siteMetaData
    );
  };

  const handleCRMFilterAPICompletion = async (completeOps?: boolean) => {
    let response = JSON.parse(sessionStorage.getItem("allapps") || "[]");
    if (response.length === 0) {
      response = fetchedApps || [];
    }

    const filteredApps: any = transformAppData(response); // filters customerTenantApps and platformApps
    setTransformedAppData(filteredApps);
    setCustomerTenantApps(filteredApps?.customerTenantApps); // customerTenantApps
  };

  const cmsFilterApps = async (refNum: string) => {
    dispatch(setIsCMSFilterApiCompleted(false));
    await APIService.triggerTxeLogin();
    if (document.cookie.includes("token")) {
      checkCanvasSite(refNum);
    } else {
      await APIService.triggerTxeLogin();
      checkCanvasSite(refNum);
    }
  };

  const checkCanvasSite = (refNum: string) => {
    APIService.isCanvasSite(refNum).then((x) => {
      const isCanvasTenant = x;
      const userHasCmsKeyCloakAccess =
        (window?.keycloakInstance?.userInfo?.resources["cms"] &&
          window?.keycloakInstance?.userInfo?.resources["cms"].roles.length >
            0) ||
        (window?.keycloakInstance?.userInfo?.resources[
          `${refNum.toLowerCase()}-cms`
        ] &&
          window?.keycloakInstance?.userInfo?.resources[
            `${refNum.toLowerCase()}-cms`
          ].roles.length > 0);
      if (isCanvasTenant === null) {
        (window as any).userHasCmsAccess = false;
      } else {
        (window as any).userHasCmsAccess = userHasCmsKeyCloakAccess;
      }
      sessionStorage.setItem("isCanvasSite", isCanvasTenant);
      if (isCanvasTenant) {
        (window as any).showBanners = true;
      } else {
        (window as any).showBanners = false;
      }
      dispatch(setIsCMSFilterApiCompleted(true));
    });
  };

  const crmFilterApps = async (refNum: string, userRoles?: any) => {
    try {
      (window as any).showEvents = false;
      (window as any).showCandidates = false;
      (window as any).showLists = false;
      (window as any).showCampaigns = false;
      (window as any).showTemplates = false;
      (window as any).showTalentCommunities = false;
      (window as any).showAutomations = false;
      (window as any).showEvents = false;
      console.log(userRoles);
      if (!refnumContainInCrmTenants(refNum)) {
        dispatch(setIsCRMFilterApiCompleted(true));
        return false;
      }

      const keycloakInstance = (window as any).keycloakInstance;
      if (!keycloakInstance?.userInfo) {
        await keycloakInstance?.loadUserInfo();
      }
      const recruiterUserId = keycloakInstance.userInfo.userDetails.id;
      const applicationName = CommonConstants.APPLICATION_NAME;
      const paramObj = {
        refNum,
        recruiterUserId,
      };

      const orgInfo = (window as any).orgInfo;
      if (!orgInfo) {
        throw new Error("Organization info is missing");
      }
      const { code, type } = orgInfo;

      await APIService.registerToken(refNum, code, type);
      APIService.getTenantConfig(paramObj).then((resp) => {
        const tenantConfigResp = resp;
        if (!tenantConfigResp || !tenantConfigResp.modules) {
          throw new Error("Tenant config response or modules are missing");
        }
        const hideCandidatesTab = tenantConfigResp.modules.agencies?.hideCandidatesTab ?? false;
        const isTenantHasJTCEnabled = tenantConfigResp.modules.access?.jtc;
        const isTenantHasAutomationFeatureEnabled = tenantConfigResp.modules.feature?.automation;
        const isEventsEnabled = tenantConfigResp.modules.activate?.events;
        const params = {
          loginId: recruiterUserId,
          applicationName,
          tenantId: refNum,
        };
        APIService.getRecruiterPermissions(params).then((permissions) => {
          const recruiterPermissionsResp = permissions;
          if (!recruiterPermissionsResp || !recruiterPermissionsResp.data || !recruiterPermissionsResp.data[0]) {
            throw new Error("Recruiter permissions response or data are missing");
          }
          let roleConfig = recruiterPermissionsResp.data[0].permissions;
          if (!roleConfig || !roleConfig.modules) {
            throw new Error("Role config or modules are missing");
          }
          const isRecruiterHaveCandidatesViewAccess = roleConfig.modules.candidates?.view;
          const isListsEnabledRP = roleConfig.modules.list?.view;
          const isCampaignViewCampaignAccess = roleConfig.modules.campaigns?.view;
          const isCampaignViewTemplateAccess = roleConfig.modules.template?.view;
          const hasJTCTabViewAccess = roleConfig.modules.jtc?.view;
          const isRecruiterHaveAutomationSettingAccess = roleConfig.modules.automation?.view;
          const isRecruiterHaveViewEventsAccess = roleConfig.modules.events?.view;

          const isJTCTabEnabled = roleConfig.modules.candidates?.view && isTenantHasJTCEnabled && hasJTCTabViewAccess;

          (window as any).showCandidates = isRecruiterHaveCandidatesViewAccess && !hideCandidatesTab;
          (window as any).showLists = isListsEnabledRP;
          (window as any).showCampaigns = isCampaignViewCampaignAccess;
          (window as any).showTemplates = isCampaignViewTemplateAccess;
          (window as any).showTalentCommunities = isJTCTabEnabled;
          (window as any).showAutomations =
            isTenantHasAutomationFeatureEnabled && isRecruiterHaveAutomationSettingAccess;
          (window as any).showEvents = isEventsEnabled && isRecruiterHaveViewEventsAccess;

          dispatch(setIsCRMFilterApiCompleted(true));
        }).catch((error) => {
          console.error("Error in getRecruiterPermissions:", error);
          dispatch(setIsCRMFilterApiCompleted(true));
        });
      });
    } catch (error) {
      console.error("Error in crmFilterApps:", error);
      dispatch(setIsCRMFilterApiCompleted(true));
    }
  };

  const getAllApps = async () => {
    if (isLoadingAppsRef.current) return;
    isLoadingAppsRef.current = true;
    try {
      const response = allApps && allApps.length > 0 ? allApps : await APIService.getAllApps();

      if (!response) return;
      let res = [...response];
      dispatch(setAppsFromAPI(res));
      const mfRoutes = getMfRoutes(res);
      const transformedAppData = transformAppData(res);
      setTransformedAppData(transformedAppData);
      sessionStorage.setItem("allapps", JSON.stringify(res));
      setAllRoutes([...appRoutes, ...mfRoutes]);
      const filteredPaths = mfRoutes
        .map((obj: { path: any }) => obj.path) // Extract paths
        .filter(
          (path: string) => path.includes("dashboard") && !path.endsWith("/*")
        ) // Filter paths with "dashboard" and without "/*"
        .map((path: string) => path.replace("/:customerCode/:refNum", "")); // Remove ":customerCode" and ":refNum"

      // Convert back to objects if needed
      const result = filteredPaths.map((path: any) => ({ path }));
      sessionStorage.setItem("mfRoutes", JSON.stringify(result));
      setIsAppsLoaded(true);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      isLoadingAppsRef.current = false;
    }
  };

  return (
    <>
      {rolesLoader ? (
        <InitialLoader show={true} />
      ) : (
        <Fragment>
          {transformedAppData &&
          (transformedAppData as any[])?.length === 0 &&
          !appsLoader ? (
            <div className="unauthorized-box font-14">
              {<EmptyState text={"No apps Found"} />}
            </div>
          ) : (
            <div className="service-tools-app-layout">
              <Toast />
              <div className="service-tools-app-body">
                <ToolsSideBar
                  showSidebarMenu={showSidebarMenu}
                  toggleSidebarMenu={toggleSidebarMenu}
                  categories={customerTenantApps}
                  setCategories={setCustomerTenantApps}
                  refNum={selectedTenant?.refNum}
                  showSummaryNavigator={
                    !window.location.pathname.includes("summary")
                  }
                />
                <div className="tools-body-container">
                  {showSidebarMenu && (
                    <div
                      className={`gray-layer ${
                        showSidebar(selectedApp) || showSidebarMenu
                          ? "sidebar-menu"
                          : ""
                      }`}
                    />
                  )}
                  <Routes>
                    {!userDetails.userType && (
                      <Route
                        path="/"
                        element={
                          <Navigate to={`/${userDetails.userOrg}/summary`} />
                        }
                      />
                    )}
                    {allRoutes.map((route: IRoute) => (
                      <Route
                        key={route.path}
                        path={route.path}
                        element={<route.component />}
                      />
                    ))}
                  </Routes>
                </div>
              </div>
            </div>
          )}
        </Fragment>
      )}
    </>
  );
};
export default AppLayout;
