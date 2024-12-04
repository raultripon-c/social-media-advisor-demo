import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import { EmptyState } from "@phenom/react-ui-components";
import { useKeycloak } from "phenom-auth-react-adapter";
import { AppStore } from "store";
import Toast from "../components/Toast/Toast";
import { IRoute, appRoutes } from "../routes/AppRoutes";
import { setUserRoles, setSiteMetaData } from "../store/customer/actions";
import RBAJson from "../utils/RBA.json";
import {
  appSelectionHandler,
  findAppConfigByRoutes,
  getMfRoutes,
  showSidebar,
  transformAppData,
  handleDomainUrlForSite
} from "../utils/appUtils";

import sessionTracker from "phenom-session-tracker";
import { setAppDetails, setAppsFromAPI } from "../store/apps/actions";
import { APIService } from "../utils/api.service";
import "./AppLayout.scss";
import { InitialLoader } from "./Loader";
import ToolsSideBar from "./sideBar/SideBar";
import { AppSelectionOptions } from "interfaces/AppSelectionOptions";
import { crmFilterApps } from "../utils/helper/crmFilterApps";
import { cmsFilterApps } from "../utils/helper/cmsFilterApps";
import { Loader } from "@phenom/react-ui-components";

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
const AppLayout: React.FC<AppLayoutProps> = ({ }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { keycloak } = useKeycloak();
  const [allRoutes, setAllRoutes] = useState<IRoute[]>([]);
  const [transformedAppData, setTransformedAppData] = useState({});
  const [customerTenantApps, setCustomerTenantApps] = useState();
  const [appsLoader, setAppsLoader] = useState(true);
  const [rolesLoader, setRolesLoader] = useState(true);
  const userDetails = window?.keycloakInstance?.tokenParsed?.userDetails;
  const [showSidebarMenu, toggleSidebarMenu] = useState(false);
  const { selectedApp, allApps } = useSelector((state: any) => state.app);
  let selectedAppFromSession = JSON.parse(sessionStorage.getItem("selectedApp") || "null");
  const selectedTenant = useSelector((state: AppStore) => state.customer.selectedTenant);
  const siteMetaData = useSelector((state: AppStore) => state.customer.siteMetaData);
  const logedUserRoles = useSelector((state: AppStore) => state.customer.logedUserRoles);
  const sessionTrackerProjectKey = `${(window as any)._env_.SESSION_TRACKER_PROJECT_KEY || ""}`;
  const sessionTrackerIngestPoint = `${(window as any)._env_.SESSION_TRACKER_INGEST_POINT || ""}`;
  const userId = userDetails?.userName;
  const fetchedApps = useSelector((state: any) => state.app.allApps);
  const { user } = useSelector(
    (state: AppStore) => state.customer
  );  
  
  const navigateToApp = (selectedApp: any, customerCode: string, refNum: string, customRoute?: any) => {
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
      customeRoute: customRoute
    }
    appSelectionHandler(appSelectionOptions);
  };

  const handleInternalNavigation = (event: CustomEvent) => {
    // if((window as any).cpui?.init) {
    //   return;
    // }
    console.log(
      "Successfully listened internalNavigation event from CRM",
      event.detail.url
    );
    const url: string = event.detail.url;
    const mfRoutes = JSON.parse(sessionStorage.getItem("mfRoutes") || "[]");
    if(!mfRoutes.some((route: { path: string; }) => route.path === url)){
      sessionStorage.setItem("txeCustomPath", url);
      console.log(allRoutes)
    }
    const path = window.location.pathname.split("/").filter(Boolean);

    const appRouteDictionary: { [key: string]: string } = {
      // "email-templates": "Email Manager",
      // "sms-templates": "SMS Manager",
      "sms-campaign": "Campaigns",
      "campaigns": "Campaigns",
      "automations": "Automations",
      "lists": "Lists",
      "events": "Events",
      "talent-communities": "Talent Community",
      "candidates": "Candidates",
    };
    const currentApp = JSON.parse(sessionStorage.getItem("selectedApp") || "{}");
    const urlLastRoute = url.split('/').pop();
    const matchedKey = Object.keys(appRouteDictionary).find(key => url.includes(key));
    if (matchedKey && decodeURIComponent(url).indexOf(";") === -1 && url.includes(`${matchedKey}/`) && currentApp?.name !== appRouteDictionary[matchedKey]) {
      const response = JSON.parse(
        sessionStorage.getItem("allapps") || "[]"
      );
      const detailsApp = response.find((element: any) => element?.name === appRouteDictionary[matchedKey]);
      if (detailsApp) {
        const customerCode = selectedTenant?.customerCode || path[0];
        const refNum = selectedTenant?.refNum || path[1];
        console.log("CROSS MODULE NAVIGATION => Changed App to", detailsApp);
        navigateToApp(detailsApp, customerCode, refNum)
      }
    } else if (urlLastRoute && currentApp?.name !== appRouteDictionary[urlLastRoute]) {
      const response = JSON.parse(
        sessionStorage.getItem("allapps") || "[]"
      );
      const detailsApp = response.find((element: any) => element?.name === appRouteDictionary[urlLastRoute]);
      if (detailsApp) {
        const customerCode = selectedTenant?.customerCode || path[0];
        const refNum = selectedTenant?.refNum || path[1];
        console.log("CROSS MODULE NAVIGATION => Changed App to", detailsApp);
        navigateToApp(detailsApp, customerCode, refNum)
      }
    }
  };

  useEffect(() => {
    const refNum = window.location.pathname.split("/")[2];

    if (!selectedTenant.length && refNum) {
      const tenantsUrl = `${(window as any)._env_.APP_API_URL}/customers/tenants/${refNum}`;
      APIService.getTenants(tenantsUrl, dispatch);
    }

    let response = JSON.parse(sessionStorage.getItem("allapps") || "[]");
    if (response.length == 0) {
      getAllApps();
    } else {
      dispatch(setAppsFromAPI(response));
      const mfRoutes = getMfRoutes(response);
      // const filteredApps: any = transformAppData(response); // filters customerTenantApps and platformApps
      // setTransformedAppData(filteredApps);
      // setCustomerTenantApps(filteredApps?.customerTenantApps); // customerTenantApps
      // handleCanvasSite(filteredApps?.customerTenantApps);
      setAllRoutes([...appRoutes, ...mfRoutes]);
    }

    if (!window.keycloakInstance.bearer_token) window.keycloakInstance.bearer_token = "Bearer " + keycloak.token;

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

    // Cleanup actions when component unmounts
    return () => {

    };
  }, []);


  //for setting selectedApp in session
  useEffect(() => {
    let detailsApp = fetchedApps && findAppConfigByRoutes(fetchedApps, window.location.pathname)[0];
    if (detailsApp && Object.keys(detailsApp).length != 0 && !window.location.pathname.includes("summmary")) {
      sessionStorage.setItem("selectedApp", JSON.stringify(detailsApp));
      selectedAppFromSession = detailsApp;
    } else {
      // sessionStorage.removeItem("selectedApp");
    }
  }, [fetchedApps, selectedTenant, selectedTenant?.refNum]);
  useEffect(() => {
    if (userId) {
      sessionTracker.initiate(userId, sessionTrackerProjectKey, sessionTrackerIngestPoint);

      sessionTracker.setMetadata("user-org", window?.orgInfo?.code);
      sessionTracker.setMetadata("user-type", window?.orgInfo?.type);
      sessionTracker.setMetadata("environment", (window as any)?._env_.APP_ENV);
      let entitlements = window.keycloakInstance?.tokenParsed?.entitlements;
      sessionTracker.setMetadata("user-entitlement", entitlements && entitlements.length > 0 ? entitlements[0] : "");

      (window as any).sessionTracker = sessionTracker;
    }
  }, [userId]);
  useEffect(() => {
    if (logedUserRoles?.length > 0) {
      let rbaroles: any = [];
      logedUserRoles.map((role: any) => {
        let rbarole = RBAJson.roles.filter((rbarole: any) => rbarole.role === role)[0];
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
      const setCmsSiteMetaData = async () => {
        const tenantSupportedLangs = await APIService.getSupportedLangs(selectedTenant?.refNum)
        return await handleDomainUrlForSite(tenantSupportedLangs, selectedTenant, dispatch, setSiteMetaData, siteMetaData);
      }
      setCmsSiteMetaData();
      const setPermissionsBasedApps = async () => {
        if (window?.keycloakInstance?.userInfo?.userDetails?.id) {
          await crmFilterApps(selectedTenant?.refNum, user);
          await cmsFilterApps(selectedTenant?.refNum);
          let response = JSON.parse(sessionStorage.getItem("allapps") || "[]");
          if (response.length == 0) {
            getAllApps();
          } else {
            // dispatch(setAppsFromAPI(response));       
            // const mfRoutes = getMfRoutes(response);
            const filteredApps: any = transformAppData(response); // filters customerTenantApps and platformApps
            setTransformedAppData(filteredApps);
            setCustomerTenantApps(filteredApps?.customerTenantApps); // customerTenantApps
            // handleCanvasSite(filteredApps?.customerTenantApps);
            // setAllRoutes([...appRoutes, ...mfRoutes]);
            // console.log("All Apps", mfRoutes);
          }
          setAppsLoader(false);
        }
      }
      setPermissionsBasedApps();
    }

  }, [selectedTenant?.customerId]);

  // useEffect(() => {
  //   const currentApp = selectedApp.length > 0 ? selectedApp : selectedAppFromSession;
  //   if (
  //     currentApp &&
  //     currentApp?.name &&
  //     ((selectedTenant?.customerCode && selectedTenant?.refNum) || currentApp.context === "platform")
  //   ) {
  //     const appSelectionOptions: AppSelectionOptions = {
  //       selectedApp: currentApp,
  //       navigate: navigate,
  //       customerCode: selectedTenant?.customerCode,
  //       refNum: selectedTenant?.refNum,
  //       siteMetaData: siteMetaData,
  //       dispatch: dispatch,
  //       openInNewTab: false,
  //       setSiteMetaData: setSiteMetaData,
  //       selectedTenant: selectedTenant,
  //     }
  //     appSelectionHandler(appSelectionOptions);
  //   }
  // }, [selectedTenant, selectedTenant?.refNum]);

  

  // const handleCanvasSite = async (appsData: any) => {
  //   if (document.cookie.includes('token')) {
  //     await checkCanvasSite(appsData);
  //   }
  //   else {
  //     window.addEventListener('txeLoginEvent', async () => {
  //       await checkCanvasSite(appsData);
  //     }, { once: true });
  //   }
  // }

  const getAllApps = async () => {
    try {
      const response = allApps && allApps.length > 0 ? allApps : await APIService.getAllApps(setAppsLoader);

      if (!response) return;
      let res = [...response];
      dispatch(setAppsFromAPI(res));
      const mfRoutes = getMfRoutes(res);
      const transformedAppData = transformAppData(res)
      setTransformedAppData(transformedAppData);
      const filteredApps: any = transformedAppData;
      setCustomerTenantApps(filteredApps?.customerTenantApps);
      // handleCanvasSite(filteredApps?.customerTenantApps);
      sessionStorage.setItem("allapps", JSON.stringify(res));
      setAllRoutes([...appRoutes, ...mfRoutes]);
      const filteredPaths = mfRoutes
        .map((obj: { path: any; }) => obj.path) // Extract paths
        .filter((path: string) => path.includes("dashboard") && !path.endsWith("/*")) // Filter paths with "dashboard" and without "/*"
        .map((path: string) => path.replace("/:customerCode/:refNum", "")); // Remove ":customerCode" and ":refNum"

      // Convert back to objects if needed
      const result = filteredPaths.map((path: any) => ({ path }));
      sessionStorage.setItem("mfRoutes", JSON.stringify(result));

    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (appsLoader) {
    return (
      <div className="tenants-loader">
        <Loader title="Please Wait, Loading Dashboard" />
      </div>
    );
  }

  return (
    <>
      {rolesLoader ? (
        <InitialLoader show={true} />
      ) : transformedAppData && (transformedAppData as any[])?.length === 0 && !appsLoader ? (
        <div className="unauthorized-box font-14">{<EmptyState text={"No apps Found"} />}</div>
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
              showSummaryNavigator={!window.location.pathname.includes("summary")}
            />
            <div className="tools-body-container">
              {showSidebarMenu && (
                <div
                  className={`gray-layer ${showSidebar(selectedApp) || showSidebarMenu ? "sidebar-menu" : ""}`}
                ></div>
              )}
              <Routes>
                {!userDetails.userType && (
                  <Route path="/" element={<Navigate to={`/${userDetails.userOrg}/summary`} />} />
                )}
                {allRoutes.map((route: IRoute) => (
                  <Route key={route.path} path={route.path} element={<route.component />} />
                ))}
              </Routes>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default AppLayout;
