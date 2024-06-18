import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import { useKeycloak } from "phenom-auth-react-adapter";
import AngularApp from "../utils/Angular.json"
import Toast from "../components/Toast/Toast";
import RBAJson from "../utils/RBA.json";

import { AppStore } from "store";
import { IRoute, appRoutes } from "../routes/AppRoutes";
import { setSelectedTenant, setUserRoles } from "../store/customer/actions";
import {
  appSelectionHandler,
  getAppByName,
  getMfRoutes,
  showSidebar,
  transformAppData,
  findAppConfigByRoutes,
} from "../utils/appUtils";

import { EmptyState } from "@phenom/react-ui-components";
import { isEmpty } from "lodash";
import sessionTracker from "phenom-session-tracker";
import { MessageService } from "../MessageService";
import { setAppDetails, setAppsFromAPI } from "../store/apps/actions";
import { APIService } from "../utils/api.service";
import { PLATFORM } from "../utils/constants";
import "./AppLayout.scss";
import { InitialLoader } from "./Loader";
import ToolsSideBar from "./sideBar/SideBar";
import { log } from "console";
import DashBoard from "./dashBoard/DashBoard";
import { AngularAppRenderer } from "../remote-modules/AngularAppRenderer";

interface AppLayoutProps {
  allApps: any;
}

const AppLayout: React.FC<AppLayoutProps> = ({}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { keycloak } = useKeycloak();
  const [allRoutes, setAllRoutes] = useState<IRoute[]>([]);
  const [transformedAppData, setTransformedAppData] = useState({});
  const [customerTenantApps, setCustomerTenantApps] = useState();
  const [platformApps, setPlatformApps] = useState();
  const [appsLoader, setAppsLoader] = useState(true);
  const [rolesLoader, setRolesLoader] = useState(true);
  const userDetails = window?.keycloakInstance?.tokenParsed?.userDetails;
  const [showSidebarMenu, toggleSidebarMenu] = useState(false);
  const { selectedApp, allApps } = useSelector((state: any) => state.app);
  const totalAppDEtails = useSelector((state: any) => state);
  let selectedAppFromSession = JSON.parse(
    sessionStorage.getItem("selectedApp") || "null"
  );
  const currentContext = sessionStorage.getItem("currentContext") || "";
  const customerTenants = useSelector(
    (state: AppStore) => state.customer.customerTenants
  );
  const primaryTenant = customerTenants.find((item: any) => item.isParent);
  const customerDetails = useSelector((state: AppStore) => state.customer);
  const selectedTenant = useSelector(
    (state: AppStore) => state.customer.selectedTenant
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
  const allEvents = fetchedApps.reduce(
    (acc: any, app: any) => {
      const { id, events } = app;
      if (events?.inputs) {
        const appInputs = events.inputs.map((input: any) => input);
        if (!acc.inputs[id]) {
          acc.inputs[id] = [];
        }
        acc.inputs[id].push(...appInputs);
      }
      if (events?.outputs) {
        if (!acc.outputs[id]) {
          acc.outputs[id] = [];
        }
        acc.outputs[id].push(...events.outputs);
      }
      return acc;
    },
    { inputs: {}, outputs: {} } // Changed outputs to an object
  );
  useEffect(() => {
    const customerCode = window.location.pathname.split("/")[1];
    
    if (userDetails?.userType?.toUpperCase() !== "PARTNER") {
      sessionStorage.setItem("currentContext", "customer");
      setSelectedTenant(primaryTenant);
      APIService.getCustomerDetails(
        userDetails?.userOrg,
        dispatch,
        selectedTenant
      );
    } else if (customerDetails?.data?.length === 0) {
      APIService.getCustomerDetails(customerCode, dispatch, selectedTenant);
    }
    let response = JSON.parse(sessionStorage.getItem("allapps") || "[]");
    if (response.length == 0) {
      getAllApps();
    } else {
      dispatch(setAppsFromAPI(response));
      const mfRoutes = getMfRoutes(response);
      setTransformedAppData(transformAppData(response));
      const filteredApps: any = transformAppData(response);
      setCustomerTenantApps(filteredApps?.customerTenantApps);
      setPlatformApps(filteredApps?.platformApps);
      setAllRoutes([...appRoutes, ...mfRoutes]);
    }

    // APIService.getLoggedInUserRoles(dispatch, setRolesLoader);
    if (!window.keycloakInstance.bearer_token)
      window.keycloakInstance.bearer_token = "Bearer " + keycloak.token;
  }, []);
  useEffect(() => {
    if (selectedApp || selectedAppFromSession) {
      const refNum = window.location.pathname.split("/")[2];
      
      if (refNum != "summary") {
        const tenantsUrl = `${
          (window as any)._env_.APP_API_URL
        }/customers/tenants/${refNum}`;
        APIService.getTenants(tenantsUrl, dispatch);
      }
    }
  }, []);

  useEffect(() => {
    let detailsApp = findAppConfigByRoutes(
      JSON.parse(sessionStorage.getItem("allapps") || "null"),
      window.location.pathname
    )[0];
    if (
      detailsApp &&
      Object.keys(detailsApp).length != 0 &&
      !window.location.pathname.includes("summmary")
    ) {
      sessionStorage.setItem("selectedApp", JSON.stringify(detailsApp));
      sessionStorage.setItem("currentContext", detailsApp.context);
      selectedAppFromSession = detailsApp;
    } else {
      sessionStorage.removeItem("selectedApp");
    }
  }, []);
  useEffect(() => {
    if (userId) {
      sessionTracker.initiate(
        userId,
        sessionTrackerProjectKey,
        sessionTrackerIngestPoint
      );

      sessionTracker.setMetadata("user-org", window?.orgInfo?.code);
      sessionTracker.setMetadata("user-type", window?.orgInfo?.type);
      sessionTracker.setMetadata("environment", (window as any)?._env_.APP_ENV);
      let entitlements = window.keycloakInstance?.tokenParsed?.entitlements;
      sessionTracker.setMetadata(
        "user-entitlement",
        entitlements && entitlements.length > 0 ? entitlements[0] : ""
      );

      (window as any).sessionTracker = sessionTracker;
    }
  }, [userId]);
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
  useEffect(() => {
    toggleSidebarMenu(false);
  }, [selectedApp]);
  const getAllApps = async () => {
    try {
      const response =
        allApps && allApps.length > 0
          ? allApps
          : await APIService.getAllApps(setAppsLoader);

      if (!response) return;
      let res = [...response,...AngularApp.data]
      console.log(res, "res")
      dispatch(setAppsFromAPI(res));
      const mfRoutes = getMfRoutes(res);
      setTransformedAppData(transformAppData(res));
      const filteredApps: any = transformAppData(res);
      setCustomerTenantApps(filteredApps?.customerTenantApps);
      setPlatformApps(filteredApps?.platformApps);
      // console.log(filteredApps, "filteredApps")
      sessionStorage.setItem("allapps", JSON.stringify(res));
      setAllRoutes([...appRoutes, ...mfRoutes]);
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const emitEventsToChildApps = (output: any, currentEventData: any) => {
    Object.keys(allEvents?.inputs).forEach((app) => {
      const appInputs = allEvents.inputs[app];
      console.log(app, appInputs);
      appInputs.forEach((input: any) => {
        if (input === output) {
          console.log(
            "Output matched with input, dispatching event...",
            app + "_" + input,
            currentEventData
          );
          MessageService.dispatchEvent(app + "_" + input, currentEventData);
        }
      });
    });
  };
  const handleOutputs = (
    output: any,
    eventData: any,
    currentEventData: any
  ) => {
    switch (output) {
      case "NAVIGATE":
        console.log("navigating to other app", eventData?.appName);
        const navigatingApp = getAppByName(fetchedApps, eventData.appName);
        navigatingApp &&
          sessionStorage.setItem("selectedApp", JSON.stringify(navigatingApp));
        dispatch(setAppDetails(navigatingApp));
        appSelectionHandler(
          navigatingApp,
          navigate,
          customerDetails?.customerCode,
          selectedTenant?.refNum
        );
        break;
      //add any other cases which has to be handled parent level
      default:
        console.log("Unhandled event at parent level:", eventData);
        emitEventsToChildApps(output, currentEventData);
        break;
    }
  };

  useEffect(() => {
    const subscriptions = [] as any;
    Object.keys(allEvents?.outputs)?.forEach((appId: string) => {
      const appOutputs = allEvents?.outputs[appId];
      appOutputs.forEach((output: any) => {
        let currentEventData = {};
        console.log("listening output", output);
        const subscription = MessageService.on(appId + "_" + output).subscribe(
          (eventData: any) => {
            currentEventData = eventData;
            handleOutputs(output, eventData, currentEventData);
          }
        );
        subscriptions.push(subscription);
      });
    });

    return () => {
      // Unsubscribe all subscriptions when component is unmounted
      subscriptions.forEach((subscription: any) => subscription.unsubscribe());
    };
  }, [fetchedApps]);
  const getCategoriesByContext = (context: any) => {
    if (context == "platform") {
      return { categories: platformApps, setCategories: setPlatformApps };
    } else {
      return {
        categories: customerTenantApps,
        setCategories: setCustomerTenantApps,
      };
    }
  };
  useEffect(() => {
    if (customerDetails?.data?.id && customerTenants.length === 0) {
      APIService.getCustomerTenants(
        customerDetails?.data?.id,
        dispatch,
        selectedTenant
      );
    }
  }, [customerDetails?.data?.id]);
  useEffect(() => {
    const currentApp =
      selectedApp.length > 0 ? selectedApp : selectedAppFromSession;
    if (
      currentApp &&
      currentApp?.name &&
      ((customerDetails?.data?.customerCode && selectedTenant?.refNum) ||
        currentApp.context === "platform")
    ) {
      appSelectionHandler(
        currentApp,
        navigate,
        selectedTenant?.customerCode || customerDetails?.data?.customerCode,
        selectedTenant?.refNum
      );
    }
  }, [selectedApp, selectedTenant, selectedTenant?.refNum]);

  let USER_ROLES = [
    "Uber User",
    "Config User",
    "Config Admin",
    "Uber Admin",
    "Client User",
    "Client Admin",
  ];

  const checkIfUserHasAccess = () => {
    return USER_ROLES.some((role) => logedUserRoles.includes(role));
  };

  return (
    <>
      {false ? (
        <div></div>
      //   <InitialLoader show={true} />
      // ) : (transformedAppData &&
      //     (transformedAppData as any[])?.length === 0 &&
        //   !appsLoader) ||
        // !checkIfUserHasAccess() ? (
      //   <div className="unauthorized-box font-14">
      //     {<EmptyState text={"No apps Found"} />}
      //   </div>
      ) : (
        <div className="service-tools-app-layout">
          <Toast />
          <div className="service-tools-app-body">
            <ToolsSideBar
              showSidebarMenu={showSidebarMenu}
              toggleSidebarMenu={toggleSidebarMenu}
              categories={getCategoriesByContext(currentContext).categories}
              setCategories={
                getCategoriesByContext(currentContext).setCategories
              }
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
                ></div>
              )}
              <Routes>
              <Route
                    key="events"
                    path="/events"
                    element={(
                    
                       <AngularAppRenderer></AngularAppRenderer>
                    
                    )}
                  />
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
    </>
  );
};
export default AppLayout;
