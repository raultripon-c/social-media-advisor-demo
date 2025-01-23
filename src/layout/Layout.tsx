import { useKeycloak } from "phenom-auth-react-adapter";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppStore } from "store";
import { GenericErrorBoundary } from "../remote-modules/ReactAppRenderer";
import Tenants from "../screens/tenants/Tenants";
import AppLayout from "./AppLayout";
import Header from "./header/Header";
import { toast } from "react-toastify";
import { Loader } from "@phenom/react-ui-components";
import Tracker from '@openreplay/tracker';
import { fetchCrmTenants } from "../utils/api.service";

const Layout = () => {
  
  const navigate = useNavigate();
  const { keycloak, orgInfo } = useKeycloak();
  const userDetails = window?.keycloakInstance?.tokenParsed?.userDetails;
  const customerTenants = useSelector(
    (state: AppStore) => state.customer.customerTenants
  );
  const [initialized, setInitialized] = useState(false);
  window.keycloakInstance = keycloak;
  window.orgInfo = orgInfo;
  (window as any).keycloakInstance = keycloak;
  (window as any).orgInfo = orgInfo;
  let pendo = (window as any).pendo;
  const [allApps, setAllApps] = useState<any[]>([]);
  const [keycloakAvailable, setKeycloakAvailable] = useState(false);
  const selectedTenant = localStorage.getItem("selectedTenant") ? JSON.parse(localStorage.getItem("selectedTenant") || "{}") : {};
  const sessionTrackerProjectKey = `${(window as any)._env_.SESSION_TRACKER_PROJECT_KEY || ""}`;
  const sessionTrackerIngestPoint = `${(window as any)._env_.SESSION_TRACKER_INGEST_POINT || ""}`;
  const userId = userDetails?.userName;

  useEffect(()=>{
    if(window?.keycloakInstance?.userInfo) {
      setKeycloakAvailable(true);
    } else {
      (async () => {
        await keycloak?.loadUserInfo();
        if(window?.keycloakInstance?.userInfo) {
          fetchCrmTenants();
          setKeycloakAvailable(true);
        } else {
          toast.dismiss();
          toast.error("KeyCloak is not available. Please try again later.");
        }
      })();
    }
  }, [window?.keycloakInstance]);

  useEffect(()=>{
    if(window.location.pathname === "/" || !selectedTenant || !Object.keys(selectedTenant).length) {
      localStorage.removeItem("selectedTenant");
      // navigate('/');
      return;
    }
    const tenantsList = JSON.parse(sessionStorage.getItem("tenants") || "[]");
    const currentPath = window.location.pathname.replace("/dashboard/dashboard", "/dashboard");
    const splitPath = currentPath.split('/')
    const urlRefnum = splitPath[2];
    const urlCustomerCode = splitPath[1];
    const isRefnumValid = Array.isArray(tenantsList) && tenantsList.some(customer => customer.refNum === urlRefnum);
    const isCustomerCodeValid = Array.isArray(tenantsList) && tenantsList.some(customer => customer.customerCode === urlCustomerCode);
    if(isCustomerCodeValid && isRefnumValid) {
      currentPath.includes("dashboard") && sessionStorage.setItem("txeCustomPath", currentPath.split('/').filter(Boolean).splice(2).join('/'))
      navigate(`${currentPath}`)
    } else {
      if(!currentPath.startsWith(`/${selectedTenant.customerCode}/${selectedTenant.refNum}`)){
        navigate(`${selectedTenant.customerCode}/${selectedTenant.refNum}/summary`)
        sessionStorage.removeItem("txeCustomPath");
        sessionStorage.removeItem("selectedApp");
      }
      else{
        currentPath.includes("dashboard") && sessionStorage.setItem("txeCustomPath", currentPath.split('/').filter(Boolean).splice(2).join('/'))
      }
    }
    sessionStorage.removeItem("allapps")
  },[])

  useEffect(() => {
    if (keycloak.authenticated && !initialized) {
      pendo?.initialize({
        visitor: {
          id: keycloak?.tokenParsed?.userDetails.legacyUserId
            ? keycloak?.tokenParsed?.userDetails.legacyUserId
            : keycloak?.tokenParsed?.userDetails.id, // Required if user is logged in
          email: keycloak?.tokenParsed?.userDetails?.userName, // Recommended if using pendo Feedback, or NPS Email
          full_name: keycloak?.tokenParsed?.name, // Recommended if using pendo Feedback
          first_name: keycloak?.tokenParsed?.name.split(" ")[0],
          last_name: keycloak?.tokenParsed?.name.split(" ").slice(-1).join(" "),
        },
      });
      setInitialized(true);
    }
  });

  useEffect(() => {
    if (keycloakAvailable) {
      const tracker = new Tracker({
        projectKey: sessionTrackerProjectKey,
        ingestPoint: sessionTrackerIngestPoint,
        network: {
          capturePayload: true,
          sessionTokenHeader: "",
          failuresOnly: false,
          ignoreHeaders: false,
          captureInIframes: false
        }
      })
      tracker.setUserID(userId);
      tracker.setMetadata("user-org", window?.orgInfo?.code);
      tracker.setMetadata("user-type", window?.orgInfo?.type);
      tracker.setMetadata("environment", (window as any)?._env_.APP_ENV);
      let entitlements = window.keycloakInstance?.tokenParsed?.entitlements;
      tracker.setMetadata("user-entitlement", entitlements && entitlements.length > 0 ? entitlements[0] : "");
      tracker.start();
      (window as any).__OPENREPLAY__ = tracker;
    }
  }, [keycloakAvailable]);

  if(!keycloakAvailable) {
    return (
          <div className="tenants-loader">
            <Loader title="Please Wait, Loading User Details" />
          </div>
        );
  }
  return (
    <>
      {keycloakAvailable && initialized && (
        <div className="servicehub-tools">
          <div className="service-tools-app-header">
            <Header
              allApps={allApps}
              customerName={selectedTenant?.customerName ?? ""}
              tenantName={selectedTenant?.tenantName ?? ""}
              customerTenants={customerTenants}
              isCustomerPage={
                selectedTenant &&
                Object.entries(selectedTenant)?.length === 0 &&
                userDetails?.userType === "PARTNER" &&
                (window.location.pathname === `/`)
              }
            />
          </div>
          {selectedTenant &&
          Object.entries(selectedTenant)?.length === 0 &&
          (window.location.pathname === '/') ? (
            <Tenants allApps={allApps} setAllApps={setAllApps} />
          ) : (
            <AppLayout allApps={allApps} />
          )}
        </div>
      )}
    </>
  );
};

export default Layout;

export { GenericErrorBoundary };
