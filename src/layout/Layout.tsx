import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useKeycloak } from "phenom-auth-react-adapter";
import AppLayout from "./AppLayout";
import { AppStore } from "store";
import Header from "./header/Header";
import Customers from "../screens/customers/Customers";
import { GenericErrorBoundary } from "../remote-modules/ReactAppRenderer";
import { ErrorBoundary } from "../remote-modules/error-component/ErrorBoundary";
import { useNavigate } from "react-router-dom";
import { initializeFaro } from "@grafana/faro-web-sdk";

const Layout = () => {
  
  const navigate = useNavigate();
  const selectedTenant = useSelector(
    (state: AppStore) => state.customer.selectedTenant
  );

  useEffect(()=>{
    sessionStorage.removeItem("allapps")
  },[])
  
  const { keycloak, orgInfo } = useKeycloak();
  const userDetails = window?.keycloakInstance?.tokenParsed?.userDetails;
  const customerTenants = useSelector(
    (state: AppStore) => state.customer.customerTenants
  );
  const [initialized, setInitialized] = useState(false);
  window.keycloakInstance = keycloak;
  window.orgInfo = orgInfo;
  const app = useSelector((state: any) => state.app);
  let pendo = (window as any).pendo;
  const [allApps, setAllApps] = useState<any[]>([]);
  useEffect(()=>{
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

  (window as any).keycloakInstance = keycloak;
  (window as any).orgInfo = orgInfo;
  return (
    <>
      {initialized && (
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
          userDetails?.userType === "PARTNER" &&
          (window.location.pathname === '/') ? (
            <Customers allApps={allApps} setAllApps={setAllApps} />
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
