import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { useKeycloak } from "phenom-auth-react-adapter";
import { AppStore } from "store";
import dashboardHome from "../../assets/images/dashboard/dashboardHome.svg";
import tenantIcon from "../../assets/images/dashboard/tenantIcon.svg";
import phenomLogo from "../../assets/images/phenom-logo.svg";
import {
  setCustomerDetails,
  setCustomerTenants,
  setSelectedTenant,
} from "../../store/customer/actions";
import HeaderDropdown from "../HeaderDropdown/HeaderDropdown";

import { setAppDetails } from "../../store/apps/actions";
import { getAppByName } from "../../utils/appUtils";
import { CUSTOMER_LEVEL, TENANT } from "../../utils/constants";
import "./Header.scss";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "app-switcher": React.DetailedHTMLProps<AppSwitcherProps, HTMLElement>;
    }
  }
}
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "user-info": React.DetailedHTMLProps<UserInfoProps, HTMLElement>;
    }
  }
}
interface AppSwitcherProps extends React.HTMLAttributes<HTMLElement> {
  env: string;
  kcObject: string;
  themeName: string;
  icon: string;
}

interface UserInfoProps extends React.HTMLAttributes<HTMLElement> {
  env: string;
  kcObject: string;
  themeName: string;
}
interface HeaderProps {
  customerName: string;
  tenantName: string;
  customerTenants: any[];
  allApps: any;
  isCustomerPage: boolean;
}

function Header({
  customerName,
  tenantName,
  allApps,
  isCustomerPage,
}: Readonly<HeaderProps>) {
  const customerTenants = useSelector(
    (state: AppStore) => state.customer.customerTenants
  );
  const customerDetails = useSelector((state: AppStore) => state.customer);
  const selectedTenant = useSelector(
    (state: AppStore) => state.customer.selectedTenant
  );
  const currentContext = sessionStorage.getItem("currentContext");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { keycloak } = useKeycloak();
  const app = useSelector((state: any) => {
    const selectedAppFromSession = JSON.parse(
      sessionStorage.getItem("selectedApp") || "null"
    );
    return selectedAppFromSession || state.app?.selectedApp;
  });
  const userType = window?.keycloakInstance?.userInfo?.userDetails?.userType;

  const [selectedValue, setSelectedPage] = useState(
    customerDetails?.data?.name
  );

  const handleLogoClick = () => {
    sessionStorage.removeItem("currentContext");
    if (userType === "PARTNER") {
      dispatch(setSelectedTenant({}));
      sessionStorage.removeItem("selectedApp");
      dispatch(setCustomerTenants([]));
      dispatch(setCustomerDetails({}));
      navigate("/");
    } else {
      const customerCode =
        window?.keycloakInstance?.userInfo?.userDetails?.userOrg;
      navigate(`/${customerCode}/summary`);
    }
  };

  useEffect(() => {
    if (window.location.pathname.includes("summary"))
      setSelectedPage(customerDetails?.data?.name);
  }, [customerDetails?.data?.id, window.location.pathname]);

  useEffect(() => {
    keycloak?.loadUserInfo();
  }, []);

  const customerDropdownOptions = [
    {
      value: customerDetails?.data?.name,
      label: customerDetails?.data?.name?.toUpperCase(),
      icon: dashboardHome,
      link: {
        label: "View Account Settings",
        type: "link",
      },
    },
  ];
  const handleTenantSelectionChange = (selectedValue: any) => {
    const selectedTenant = customerTenants.find(
      (tenant: any) => tenant.tenantName === selectedValue
    );
    sessionStorage.setItem("currentContext", TENANT);

    dispatch(setSelectedTenant(selectedTenant));
  };
  const transformedCustomerTenants = customerTenants.map((tenant: any) => ({
    value: tenant?.tenantName,
    label: tenant?.tenantName,
    icon: tenantIcon,
  }));
  const [initialized, setInitialized] = useState(false);
  let pendo = (window as any).pendo;



  return (
    <div className="header-container">
      <button
        className={`header-logo-container  ${
          isCustomerPage ? "logo-white" : ""
        }`}
        onClick={handleLogoClick}
      >
        <img src={phenomLogo} alt="" className={`header-logo`}></img>
      </button>
      {isCustomerPage && <div className="vertical-line"></div>}
      <div
        className={`header-com col-md-12 ${
          isCustomerPage ? "customers-page-header" : ""
        }`}
      >
        {customerDetails?.data?.name && app && app?.context !== "platform" && (
          <div className="tenant-selection col-md-6">
            <p className="header-selected-customer">
              {customerDetails?.data?.name}
            </p>
            {customerTenants.length > 1 &&
              !window.location.pathname.includes("summary") && (
                <div className="header-selected-tenant ">
                  <HeaderDropdown
                    options={transformedCustomerTenants}
                    value={selectedTenant?.tenantName}
                    onChange={(selectedValue) => {
                      handleTenantSelectionChange(selectedValue);
                    }}
                    type="tenant"
                  />
                </div>
              )}
          </div>
        )}
        <div className="header-right">
          <app-switcher
            env={(window as any)._env_.APP_ENV}
            kcObject={JSON.stringify(window.keycloakInstance)}
            themeName="new"
            icon="https://servicehub-qa.phenompro.com/public/logos/app-switcher/appswitcher_new.svg"
          ></app-switcher>
          <user-info
            style={{ display: "flex", alignItems: "center" }}
            env={(window as any)._env_.APP_ENV}
            kcObject={JSON.stringify(window.keycloakInstance)}
            themeName="new"
          ></user-info>
        </div>
      </div>
    </div>
  );
}

export default Header;
