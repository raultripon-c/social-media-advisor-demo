import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { useKeycloak } from "phenom-auth-react-adapter";
import { AppStore } from "store";
import phenomTitleLogo from "../../assets/images/Phenom-title-logo.svg";
import tenantIcon from "../../assets/images/dashboard/tenantIcon.svg";
import phenomLogo from "../../assets/images/phenom-logo.svg";

import {
  setCustomerTenants,
  setSelectedTenant,
} from "../../store/customer/actions";
import HeaderDropdown from "../HeaderDropdown/HeaderDropdown";

import { setAppDetails, setIsCMSFilterApiCompleted, setIsCRMFilterApiCompleted, setSidebarState } from "../../store/apps/actions";
import { TENANT } from "../../utils/constants";
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
  region: string;
  kcObject: string;
  themeName: string;
  icon: string;
}

interface UserInfoProps extends React.HTMLAttributes<HTMLElement> {
  clientId: string;
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
  const selectedTenant = useSelector(
    (state: AppStore) => state.customer.selectedTenant
  );
  const { sidebarOpen } = useSelector((state: AppStore) => state.app);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { keycloak } = useKeycloak();
  const app = useSelector((state: any) => {
    const selectedAppFromSession = JSON.parse(
      sessionStorage.getItem("selectedApp") || "null"
    );
    return selectedAppFromSession || state.app?.selectedApp;
  });


  const handleLogoClick = () => {
    sessionStorage.removeItem("selectedApp");
    localStorage.removeItem("selectedTenant");
    sessionStorage.removeItem("txeCustomPath");
    dispatch(setSelectedTenant({}));
    dispatch(setSidebarState(false));
    dispatch(setAppDetails({}));
    dispatch(setCustomerTenants([]));
    dispatch(setIsCRMFilterApiCompleted(false));
    dispatch(setIsCMSFilterApiCompleted(false));
    navigate("/");
    const iframes = document.querySelectorAll("iframe[txe-pre-fetch-iframe]");
    iframes.forEach((iframe) => {
      document.body.removeChild(iframe);
    });
  };


  useEffect(() => {
    keycloak?.loadUserInfo();
  }, []);

  // const handleTenantSelectionChange = (selectedValue: any) => {
  //   const selectedTenant = customerTenants.find(
  //     (tenant: any) => tenant.tenantName === selectedValue
  //   );

  //   dispatch(setSelectedTenant(selectedTenant));
  // };
  // const transformedCustomerTenants = customerTenants.map((tenant: any) => ({
  //   value: tenant?.tenantName,
  //   label: tenant?.tenantName,
  //   icon: tenantIcon,
  // }));
  // const [initialized, setInitialized] = useState(false);
  // let pendo = (window as any).pendo;

  return (
    <div className="header-container">
      <button
        className={`header-logo-container  ${isCustomerPage ? "logo-white" : ""
          } ${sidebarOpen ? "title-logo-container" : ""}`}
        onClick={handleLogoClick}
      >
        <img
          src={sidebarOpen ? phenomTitleLogo : phenomLogo}
          alt=""
          className={sidebarOpen ? "header-title-logo" : `header-logo`}
        ></img>
      </button>
      {isCustomerPage && <div className="vertical-line"></div>}
      <div
        className={`header-com ${isCustomerPage ? "customers-page-header" : ""
          } ${sidebarOpen ? "logo-expanded" : ""}`}
      >
        {selectedTenant?.customerName && app && app?.context !== "platform" && (
          <div className="tenant-selection">
            <p className="header-selected-customer">
              {selectedTenant?.tenantName}
            </p>
            {/* {customerTenants.length > 1 &&
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
              )} */}
          </div>
        )}
        <div className={`header-right`}>
          <app-switcher
            env={(window as any)._env_.APP_ENV}
            region={(window as any)._env_.APP_DC}
            kcObject={JSON.stringify(window.keycloakInstance)}
            themeName="new"
            icon={`${(window as any)._env_.APP_API_URL.replace(/\/api$/, "")}/public/logos/app-switcher/appswitcher_new.svg`}
          ></app-switcher>
          <user-info
            clientId={window.keycloakInstance.clientId}
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
