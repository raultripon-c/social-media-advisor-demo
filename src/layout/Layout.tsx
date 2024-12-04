import { useKeycloak } from "phenom-auth-react-adapter";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppStore } from "store";
import { GenericErrorBoundary } from "../remote-modules/ReactAppRenderer";
import Tenants from "../screens/tenants/Tenants";
import AppLayout from "./AppLayout";
import Header from "./header/Header";

const Layout = () => {
  
  const navigate = useNavigate();
  const selectedTenant = localStorage.getItem("selectedTenant") ? JSON.parse(localStorage.getItem("selectedTenant") || "{}") : {};

  useEffect(()=>{
    if(window.location.pathname === "/" || !selectedTenant || !Object.keys(selectedTenant).length) {
      localStorage.removeItem("selectedTenant");
      navigate('/');
      return;
    }
    const currentPath = window.location.pathname.replace("/dashboard/dashboard", "/dashboard");
    if(!currentPath.startsWith(`/${selectedTenant.customerCode}/${selectedTenant.refNum}`) && currentPath.includes("dashboard")) {
      sessionStorage.setItem("txeCustomPath", currentPath)
      navigate(`/${selectedTenant.customerCode}/${selectedTenant.refNum}${currentPath}`)
    } else {
      sessionStorage.setItem("txeCustomPath", currentPath.split('/').filter(Boolean).splice(2).join('/'))
    }
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
