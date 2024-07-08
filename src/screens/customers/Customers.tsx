import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { EmptyState } from "@phenom/react-ui-components";
import { AppStore } from "store";
import { Search } from "../../components/TenantSearch/TenantsSearch";
import { setAppDetails, setAppsFromAPI } from "../../store/apps/actions";
import {
  setAllCustomers,
  setCustomerDetails,
} from "../../store/customer/actions";
import { API } from "../../utils/api";

import { Loader } from "@phenom/react-ui-components";
import { APIService } from "../../utils/api.service";
import { apiUrl } from "../../utils/constants";
import "./Customers.scss";

interface TenantsProps {
  allApps: any;
  setAllApps: (apps: any) => void;
}

const Customers: React.FC<TenantsProps> = ({ allApps, setAllApps }) => {
  const { customers } = useSelector((state: AppStore) => state.customer);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedTenant = useSelector(
    (state: AppStore) => state.customer.selectedTenant
  );
  const [isLoading, setIsLoading] = useState<boolean>();
  const [searchKey, setSearchKey] = useState<string>("");
  const [filteredData, setFilteredData] = useState(
    JSON.parse(sessionStorage.getItem("customers") || "[]") as any
  );
  const [totalCustomersData, setTotalCustomersData] = useState(
    JSON.parse(sessionStorage.getItem("customers") || "[]") as any
  );
  const [invalidCustomer, setInvalidCustomer] = useState(false);
  const API_URL = (window as any)._env_.APP_API_URL;

  const APP_DC_REGION = `${(window as any)._env_.APP_DC}`;
  const getAllApps = async () => {
    try {
      const response = await APIService.getAllApps();
      if (!response) return;
      let res = response
      sessionStorage.setItem("allapps", JSON.stringify(res));
      dispatch(setAppsFromAPI(res));
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const getAllCustomers = async () => {
    setIsLoading(true);
    let getCustomersUrl = `${API_URL}/${apiUrl.getCustomerAccounts}`;
    if (APP_DC_REGION?.toLocaleUpperCase() !== "US".toLocaleUpperCase()) {
      getCustomersUrl = `${getCustomersUrl}?dc_region=${APP_DC_REGION}`;
    }
    await API.get(getCustomersUrl)
      .then((response: any) => {
        const result = response.data;
        if (response.status == 200 && result.status) {
          setTotalCustomersData(response.data.data);
          setFilteredData(
            response.data.data.sort((a: any, b: any) =>
              a.name.localeCompare(b.name)
            )
          );
          dispatch(setAllCustomers(response.data.data));
          sessionStorage.setItem(
            "customers",
            JSON.stringify(response.data.data)
          );
        } else {
          setTotalCustomersData([]);
        }
      })
      .catch((err: any) => {
        setTotalCustomersData([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  useEffect(() => {
    sessionStorage.removeItem("currentContext");
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
      let data = totalCustomersData?.filter((eachCustomer: any) =>
        eachCustomer.name.toLowerCase().includes(searchKey.toLowerCase())
      );
      setFilteredData(data);
    }
  }, [searchKey]);

  useEffect(() => {
    let storedCustomers = JSON.parse(
      sessionStorage.getItem("customers") || "[]"
    );

    if (storedCustomers.length === 0) {
      getAllCustomers();
    } else {
      dispatch(setAllCustomers(storedCustomers));
    }
  }, []);
  useEffect(() => {
    if (customers?.length > 0) {
      setTotalCustomersData(customers);
      setFilteredData(customers);
    }
  }, [customers]);

  const navigateToDashBoard = (selectedCustomer: any = {}) => {
    if (selectedCustomer?.tenantRefnums?.length === 0) {
      setInvalidCustomer(true);
    } else {
      APIService.getCustomerTenants(
        selectedCustomer.id,
        dispatch,
        selectedTenant
      );
      dispatch(setCustomerDetails(selectedCustomer));
      navigate(`/${selectedCustomer.customerCode}/summary`);

      // temporary code to navigate to events by default
      // const eventsApp = {
      //   id: "9e1b1a48-12e4-4799-bae4-29c3c9fd8508",
      //   name: "Events",
      //   icon: "",
      //   parentName: "Experiences",
      //   searchKeys: ["events", "events", "crm-events"],
      //   accessibility: [],
      //   appType: "module-federation",
      //   hoverText: "Events",
      //   loadingText: "Loading Events...",
      //   appConfig: {
      //     module: "./CRMEvents",
      //     route: "/events",
      //     component: "app-events",
      //     appName: "cpui",
      //     scope: "cpui",
      //     url: "https://localhost:8080/remoteEntry.js",
      //     envconfig: "https://certificate-manager-qa.phenompro.com/env-config.js",
      //     loadingMessage: "Loading",
      //     accessType: "phenom",
      //     showSideNav: "false",
      //     isMfProduct: "true",
      //   },
      //   rbacDetails: {
      //     clientId: "tls-automation-api",
      //   },
      //   isParent: false,
      //   context: "tenant",
      //   showSidebar: null,
      //   order: 1,
      //   events: null,
      //   framework: "ANGULAR",
      // };
  
      // dispatch(setAppDetails(eventsApp));
      // sessionStorage.setItem("selectedApp", JSON.stringify(eventsApp));
      
      // navigate(`/${selectedCustomer.customerCode}/${selectedCustomer.tenantRefnums[0]}/events`)
    }
  };

  if (isLoading) {
    return (
      <div className="tenants-loader">
        <Loader title="Please Wait, Loading Customers" />
      </div>
    );
  }

  return (
    <div className="tenants-container">
      <div className="tenants-header">
        <div className="search-container">
          <Search
            placeholder={"Search Customer"}
            onValueChange={(e: any) => setSearchKey(e.target.value)}
            size="medium"
            at_id="tenant-search"
          />
        </div>
      </div>
      {invalidCustomer && (
        <div className="invalid-customer">
          No Tenants Configured for this Customer, Please Select an other
          Customer
        </div>
      )}
      {totalCustomersData?.length !== 0 ? (
        <div className="tenant-list">
          {filteredData
            ?.filter((customer: any) => customer?.realmName)
            ?.map((eachCustomer: any) => (
              <div
                className="tenant-card"
                key={eachCustomer.id}
                onClick={() => navigateToDashBoard(eachCustomer)}
              >
                <span>{eachCustomer.name}</span>
              </div>
            ))}
          {filteredData?.length === 0 && (
            <div className="no-customer-found">No Customers found</div>
          )}
        </div>
      ) : (
        <EmptyState displayText="No Customers Configured" />
      )}
    </div>
  );
};

export default Customers;
