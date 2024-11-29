import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setCustomerTenants, setSelectedTenant } from "../../store/customer/actions";
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

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
      let urlToNavigate;
      if(!currentPath.startsWith(`/${selectedTenant.customerCode}/${selectedTenant.refNum}`)) {
        urlToNavigate = `/${selectedTenant.customerCode}/${selectedTenant.refNum}${currentPath}`;
      } else {
        urlToNavigate = `/${selectedTenant.customerCode}/${selectedTenant.refNum}/summary`;
      }

      navigate(urlToNavigate);

      sessionStorage.removeItem("txeCustomPath");

      sessionStorage.removeItem("selectedApp");
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
