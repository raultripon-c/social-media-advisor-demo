import { SideBar } from "@phenom/react-ui-components";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppStore } from "store";
import close from "../../assets/images/close.svg";
import arrowRight from "../../assets/images/dashboard/arrowRight.svg";
import dashboardGrey from "../../assets/svg/HomeVectorGrey.svg";
import dashboardActive from "../../assets/svg/HomeVector.svg";
import dashboardInfo from "../../assets/images/dashboard/dashboardInfo.svg";
import { setAppDetails } from "../../store/apps/actions";
import { setCustomerDetails, setCustomerTenants, setSelectedTenant } from "../../store/customer/actions";
import {
  CUSTOMER_LEVEL,
  PLATFORM,
  TENANT,
  noShowSideBar,
} from "../../utils/constants";
import "./SideBar.scss";
import sessionTracker from "phenom-session-tracker";
import { appSelectionHandler } from "../../utils/appUtils";

function ToolsSideBar(props: any) {
  const { categories, setCategories } = props;
  const customerDetails = useSelector((state: AppStore) => state.customer);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [disableAutoClose, setDisableAutoClose] = useState(true);
  const selectedApp = useSelector((state: any) => {
    const selectedAppFromSession = JSON.parse(
      sessionStorage.getItem("selectedApp") || "null"
    );
    return selectedAppFromSession || state.app?.selectedApp;
  });

  useEffect(() => {
    let hideSideBar = noShowSideBar.some((path: string) => {
      return window.location.pathname.endsWith(path);
    });

    if (hideSideBar) {
      setDisableAutoClose(false);
      setSidebarOpen(false);
    }
  }, [window.location.pathname]);

  const currentContext = sessionStorage.getItem("currentContext") || "";
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleAppSelection = (app: any) => {
    if (app.appType == "module-federation") {
      setDisableAutoClose(false);
    } else {
      setSidebarOpen(true);
      setDisableAutoClose(true);
    }
    app && sessionStorage.setItem("selectedApp", JSON.stringify(app));
    dispatch(setAppDetails(app));
    sessionTracker.setCustomEvent("App Selected", {
      "App Name": app?.name,
    });
  };
  const summaryOnClick=() => {
    const updatedCategories = categories?.map((eachCategory: any) => ({
      ...eachCategory,
      isOpen: false,
    }));
    setCategories(updatedCategories);
    setSidebarOpen(false);
    setDisableAutoClose(false);
    dispatch(setAppDetails({}));
    sessionStorage.removeItem("selectedApp");
    sessionStorage.removeItem("currentContext");
    if (currentContext !== PLATFORM) {
      navigate(`${customerDetails?.data?.customerCode}/summary`);
    } else {
      dispatch(setSelectedTenant({}));
      sessionStorage.removeItem("selectedApp");
      dispatch(setCustomerTenants([]));
      dispatch(setCustomerDetails({}));
      navigate("/");
      // navigate("/");
    }
  }

  
  return (
    <div className="tools-sidebar">
      
      
    <div className="Sidebar">
      <SideBar
        selectedApp={selectedApp}
        sidebarOpen={sidebarOpen}
        setSelectedApp={handleAppSelection}
        categories={categories}
        sideBarNavClass={"sidebar-nav-button"}
        setCategories={setCategories}
        disableAutoClose={disableAutoClose}
        setDisableAutoClose={setDisableAutoClose}
        placeholder="Search"
        summaryOnClick={summaryOnClick}
        sideBarHeading={
          currentContext === TENANT
            ? "TENANT SETTINGS"
            : currentContext === CUSTOMER_LEVEL
            ? "ACCOUNT SETTINGS"
            : null
        }
        onClose={(showSidebar: any) => {
          setSidebarOpen(showSidebar);
        }}
        dashboardIcons={{arrowRight:arrowRight,dashboardInfo:dashboardInfo,dashboardActive:dashboardActive,dashboardGrey:dashboardGrey}}
      />
      </div>
      
    </div>

  );
}

export default ToolsSideBar;
