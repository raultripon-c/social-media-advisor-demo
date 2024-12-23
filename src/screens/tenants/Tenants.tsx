import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { EmptyState } from "@phenom/react-ui-components";
import { AppStore } from "store";
import { Search } from "../../components/TenantSearch/TenantsSearch";
import { setAppDetails, setAppsFromAPI } from "../../store/apps/actions";
import { setAllTenants, setSelectedTenant, setSiteMetaData } from "../../store/customer/actions";
import { API } from "../../utils/api";

import { Loader } from "@phenom/react-ui-components";
import { APIService } from "../../utils/api.service";
import { apiUrl, loginSessionTimeIntervals } from "../../utils/constants";
import "./Tenants.scss";
import { crmFilterApps } from "../../utils/helper/crmFilterApps";
import { cmsFilterApps } from "../../utils/helper/cmsFilterApps";
import { handleDomainUrlForSite } from "../../utils/appUtils";

/**
 * The `Tenants` component is responsible for fetching and displaying a list of tenants.
 * It interacts with the Redux store to manage state and uses session storage to cache data.
 *
 * Props:
 * - `allApps`: An array containing all applications.
 * - `setAllApps`: A function to set the applications.
 *
 * The component performs the following tasks:
 * - Fetches all applications and tenants from the API.
 * - Stores the fetched data in session storage and updates the Redux store.
 * - Filters tenants based on the search key entered by the user.
 * - Displays a loading indicator while data is being fetched.
 * - Shows a list of tenants or an empty state if no tenants are configured.
 * - Handles navigation to the tenant's dashboard when a tenant is selected.
 *
 * @param {TenantsProps} param0 - The props for the component.
 * @returns {JSX.Element} The rendered component.
 */

interface TenantsProps {
  allApps: any;
  setAllApps: (apps: any) => void;
}

const Tenants: React.FC<TenantsProps> = ({ allApps, setAllApps }) => {
  const siteMetaData = useSelector(
    (state: AppStore) => state.customer.siteMetaData
  );
  const { customers } = useSelector((state: AppStore) => state.customer);
  const userDetails = window?.keycloakInstance?.tokenParsed?.userDetails;
  const customerTenants = useSelector(
    (state: AppStore) => state.customer.customerTenants
  );
  const { user } = useSelector(
    (state: AppStore) => state.customer
  ); 
  const customerDetails = useSelector((state: AppStore) => state.customer);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNavigationLoading, setIsNavigationLoading] = useState<boolean>(false);
  const [searchKey, setSearchKey] = useState<string>("");
  const [filteredData, setFilteredData] = useState(
    JSON.parse(sessionStorage.getItem("tenants") || "[]") as any
  );
  const [totalTenantsData, setTotalTenantsData] = useState(
    JSON.parse(sessionStorage.getItem("tenants") || "[]") as any
  );
  const API_URL = (window as any)._env_.APP_API_URL;
  const PROVISIONING_API = (window as any)._env_.PROVISIONING_URL;
  const APP_DC_REGION = `${(window as any)._env_.APP_DC}`;

  const getAllApps = async () => {
    try {
      const response = await APIService.getAllApps();
      if (!response) return;
      let res = response;
      sessionStorage.setItem("allapps", JSON.stringify(res));
      dispatch(setAppsFromAPI(res));
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const getAllTenants = async () => {
    let getTenantUrl = `${PROVISIONING_API}/${apiUrl.getTenantDetails}`;
    if (APP_DC_REGION?.toLocaleUpperCase() !== "US".toLocaleUpperCase()) {
      getTenantUrl = `${getTenantUrl}?dc_region=${APP_DC_REGION}`;
    }
    await API.get(getTenantUrl)
      .then((response: any) => {
        const result = response.data;
        if (response.status == 200 && result.status) {
          setTotalTenantsData(response.data.data);
          setFilteredData(
            response.data.data.sort((a: any, b: any) =>
              a.tenantName.localeCompare(b.tenantName)
            )
          );
          dispatch(setAllTenants(response.data.data));
          sessionStorage.setItem("tenants", JSON.stringify(response.data.data));
        } else {
          setTotalTenantsData([]);
        }
      })
      .catch((err: any) => {
        setTotalTenantsData([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    let storedTenants = JSON.parse(sessionStorage.getItem("tenants") || "[]");

    if (storedTenants.length === 0) {
      if (!(userDetails?.userType === "PARTNER")) {
        APIService.getCustomerDetails(userDetails?.userOrg, dispatch);
      } else {
        getAllTenants();
      }
    } else {
      dispatch(setAllTenants(storedTenants));
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (customerDetails?.data?.id && customerTenants.length === 0) {
      APIService.getCustomerTenants(
        customerDetails?.data?.id,
        dispatch,
        setTotalTenantsData,
        setIsLoading
      );
    }
  }, [customerDetails?.data?.id]);

  useEffect(() => {
    dispatch(setAppDetails({}));
    sessionStorage.removeItem("selectedApp");
    const apps = JSON.parse(sessionStorage.getItem("allapps") || "[]");

    if (apps.length === 0) {
      getAllApps();
    } else {
      dispatch(setAppsFromAPI(apps));
    }
  }, []);

  useEffect(() => {
    if (searchKey.trim().length >= 0) {
      let data = totalTenantsData?.filter((eachCustomer: any) =>
        eachCustomer.tenantName.toLowerCase().includes(searchKey.toLowerCase())
      );
      setFilteredData(data);
    }
  }, [searchKey]);

  useEffect(() => {
    if (customers?.length > 0) {
      setTotalTenantsData(customers);
      setFilteredData(customers);
    }
  }, [customers]);

  useEffect(() => {
    if (totalTenantsData?.length > 0) {
      setFilteredData(
        totalTenantsData.sort((a: any, b: any) =>
          a.tenantName.localeCompare(b.tenantName)
        )
      );
    }
  }, [totalTenantsData]);

  const navigateToDashBoard = async (selectedTenant: any = {}) => {
    await crmFilterApps(selectedTenant?.refNum, user);
    await cmsFilterApps(selectedTenant?.refNum);
    const tenantsUrl = `${(window as any)._env_.APP_API_URL}/customers/tenants/${selectedTenant?.refNum}`;
    APIService.getTenants(tenantsUrl, dispatch).then((response: any) => {
      let customerCode = selectedTenant.customerCode;
      let refNum = selectedTenant.refNum;
      if(response?.customerCode && response?.refNum) {
        customerCode = response.customerCode;
        refNum = response.refNum;
      }
      setIsNavigationLoading(false);
      navigate(
      `/${customerCode}/${refNum}/summary`
      );
    });
    
  };

  if (isLoading) {
    return (
      <div className="tenants-loader">
        <Loader title="Please Wait, Loading Tenants" />
      </div>
    );
  }

  if (isNavigationLoading) {
    return (
      <div className="tenants-loader">
        <Loader title="Please Wait, Navigating to Dashboard" />
      </div>
    );
  }

  return (
    <div className="tenants-container">
      <div className="tenants-header">
        <div className="search-container">
          <Search
            placeholder={"Search Tenant"}
            onValueChange={(e: any) => setSearchKey(e.target.value)}
            size="medium"
            at_id="tenant-search"
          />
        </div>
      </div>
      {totalTenantsData?.length !== 0 ? (
        <div className="tenant-list">
          {filteredData?.map((eachTenant: any) => (
            <div
              className="tenant-card"
              key={eachTenant.id}
              onClick={async () => {
                setIsNavigationLoading(true);
                localStorage.removeItem("selectedTenant");
                await navigateToDashBoard(eachTenant);
              }}
            >
              <span>{eachTenant.tenantName}</span>
            </div>
          ))}
          {filteredData?.length === 0 && (
            <div className="no-tenant-found">No Tenants found</div>
          )}
        </div>
      ) : (
        <EmptyState displayText="No Tenants Configured" />
      )}
    </div>
  );
};

export default Tenants;
