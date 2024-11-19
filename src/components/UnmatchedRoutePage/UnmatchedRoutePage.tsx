import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setCustomerTenants, setSelectedTenant } from "../../store/customer/actions";
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const UnmatchedRoutePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isUnMatchedRoute, setIsUnMatchedRoute] = useState(false);

  useEffect(() => {
    const selectedApp = JSON.parse(sessionStorage.getItem("selectedApp") || "null");
    if(selectedApp.framework === 'REACT' && selectedApp.name !== 'Segmente Manager') {
      const selectedTenant = JSON.parse(sessionStorage.getItem("selectedTenant") || "null");
      const pathPrefix = `/${selectedTenant.customerCode}/${selectedTenant.refNum}${selectedApp.appConfig?.moduleRoute}`
      const pathMatchResult = location.pathname.match(pathPrefix);
      const shouldAddPathPrefix = !pathMatchResult || pathMatchResult.length === 0;
      if (shouldAddPathPrefix) {
        if (pathPrefix) {
          setIsUnMatchedRoute(false);
          navigate(pathPrefix + location.pathname);
        } else {
          setIsUnMatchedRoute(true);
        }
      } else {
        setIsUnMatchedRoute(true);
      }
    } else {
      setIsUnMatchedRoute(true);
    }
    tiggerCleanupAndNavigateToHome();
  }, []);

  const tiggerCleanupAndNavigateToHome = useCallback(() => {
    if(isUnMatchedRoute) {
      dispatch(setSelectedTenant({}));
      dispatch(setCustomerTenants([]));
      sessionStorage.removeItem("selectedApp");
      window.location.assign(window.location.origin);
    }
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
