import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setCustomerTenants, setSelectedTenant } from "../../store/customer/actions";
import { useNavigate, useLocation } from 'react-router-dom';

const UnmatchedRoutePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const selectedTenant = JSON.parse(localStorage.getItem("selectedTenant") || "{}");

  const [isUnMatchedRoute, setIsUnMatchedRoute] = useState(false);

  useEffect(() => {
    const selectedApp = JSON.parse(sessionStorage.getItem("selectedApp") || "{}");
    // if(selectedApp.framework === 'REACT' && selectedApp.name !== 'Segmente Manager') {
    //   const selectedTenant = JSON.parse(localStorage.getItem("selectedTenant") || "null");
    //   const pathPrefix = `/${selectedTenant.customerCode}/${selectedTenant.refNum}${selectedApp.appConfig?.moduleRoute}`
    //   const pathMatchResult = location.pathname.match(pathPrefix);
    //   const shouldAddPathPrefix = !pathMatchResult || pathMatchResult.length === 0;
    //   if (shouldAddPathPrefix) {
    //     if (pathPrefix) {
    //       setIsUnMatchedRoute(false);
    //       navigate(pathPrefix + location.pathname);
    //     } else {
    //       setIsUnMatchedRoute(true);
    //     }
    //   } else {
    //     setIsUnMatchedRoute(true);
    //   }
    // } else {
    //   setIsUnMatchedRoute(true);
    // }
    tiggerCleanupAndNavigateToHome();
  }, []);

  const tiggerCleanupAndNavigateToHome = useCallback(() => {
    // if(isUnMatchedRoute) {
      const currentPath = window.location.pathname.replace("/dashboard/dashboard", "/dashboard");
      let customRoute = "summary";
      let urlToNavigate;
      if(currentPath !== '/' && !currentPath.startsWith(`/${selectedTenant.customerCode}/${selectedTenant.refNum}`)) {
        urlToNavigate = `/${selectedTenant.customerCode}/${selectedTenant.refNum}${currentPath}`;
      } else {
        customRoute = (window.location.pathname.includes("/dashboard")&& window.location.pathname.replace("/dashboard/dashboard", "/dashboard").split('/').filter(Boolean).splice(2).join('/')) || 'summary';
        urlToNavigate = `/${selectedTenant.customerCode}/${selectedTenant.refNum}/${customRoute}`;
      }

      navigate(urlToNavigate);
      if(customRoute === 'summary') {
        sessionStorage.removeItem("txeCustomPath");
        sessionStorage.removeItem("selectedApp");
      }

      
    // }
  }, [dispatch]);

  return (
    <>
      {
        isUnMatchedRoute ? 
          <div>
            <p>Unmatched Route Found, redirecting to tenants selection page</p>
          </div> : null
      }
    </>
  );
};

export default UnmatchedRoutePage;
