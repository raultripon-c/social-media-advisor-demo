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
import { setAppsFromAPI } from "../store/apps/actions";
import { APIService } from "../utils/api.service";
import "./AppLayout.scss";
import { InitialLoader } from "./Loader";
import ToolsSideBar from "./sideBar/SideBar";
import { AppSelectionOptions } from "interfaces/AppSelectionOptions";

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

  useEffect(() => {
    if (!selectedTenant.length) {
      const refNum = window.location.pathname.split("/")[2];

      const tenantsUrl = `${(window as any)._env_.APP_API_URL}/customers/tenants/${refNum}`;
      APIService.getTenants(tenantsUrl, dispatch);
    }

    let response = JSON.parse(sessionStorage.getItem("allapps") || "[]");
    if (response.length == 0) {
      getAllApps();
    } else {
      dispatch(setAppsFromAPI(response));
      const mfRoutes = getMfRoutes(response);
      const filteredApps: any = transformAppData(response); // filters customerTenantApps and platformApps
      setTransformedAppData(filteredApps);
      setCustomerTenantApps(filteredApps?.customerTenantApps); // customerTenantApps
      setAllRoutes([...appRoutes, ...mfRoutes]);
    }

    if (!window.keycloakInstance.bearer_token) window.keycloakInstance.bearer_token = "Bearer " + keycloak.token;
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
  }, [fetchedApps]);
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

  const getAllApps = async () => {
    try {
      const response = allApps && allApps.length > 0 ? allApps : await APIService.getAllApps(setAppsLoader);

      if (!response) return;
      let res = [...response];
      dispatch(setAppsFromAPI(res));
      const mfRoutes = getMfRoutes(res);
      setTransformedAppData(transformAppData(res));
      const filteredApps: any = transformAppData(res);
      setCustomerTenantApps(filteredApps?.customerTenantApps);
      sessionStorage.setItem("allapps", JSON.stringify(res));
      setAllRoutes([...appRoutes, ...mfRoutes]);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    if (selectedTenant?.customerId) {
      setRolesLoader(false);
      const setCmsSiteMetaData = async () => {
        const tenantSupportedLangs = await APIService.getSupportedLangs(selectedTenant?.refNum)
        return await handleDomainUrlForSite(tenantSupportedLangs, selectedTenant, dispatch, setSiteMetaData, siteMetaData);
      }
      setCmsSiteMetaData();
    }
  }, [selectedTenant?.customerId]);
  useEffect(() => {
    const currentApp = selectedApp.length > 0 ? selectedApp : selectedAppFromSession;
    if (
      currentApp &&
      currentApp?.name &&
      ((selectedTenant?.customerCode && selectedTenant?.refNum) || currentApp.context === "platform")
    ) {
      const appSelectionOptions: AppSelectionOptions = {
        selectedApp: currentApp,
        navigate: navigate,
        customerCode: selectedTenant?.customerCode,
        refNum: selectedTenant?.refNum,
        siteMetaData: siteMetaData,
        dispatch: dispatch,
        openInNewTab: false,
        setSiteMetaData: setSiteMetaData,
        selectedTenant: selectedTenant,
      }
      appSelectionHandler(appSelectionOptions);
    }
  }, [selectedApp, selectedTenant, selectedTenant?.refNum]);

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
