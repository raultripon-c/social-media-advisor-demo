import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCustomerTenants, setSelectedTenant } from "../../store/customer/actions";

const UnmatchedRoutePage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setSelectedTenant({}));
    dispatch(setCustomerTenants([]));
    sessionStorage.removeItem("selectedApp");
    window.location.assign(window.location.origin);
    
  }, []);

  return (
    <div>
      <p>Unmatched Route Found, redirecting to tenants selection page</p>
    </div>
  );
};

export default UnmatchedRoutePage;
