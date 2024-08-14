import { SideBar } from "@phenom/react-ui-components";
import sessionTracker from "phenom-session-tracker";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppStore } from "store";
import arrowRight from "../../assets/images/dashboard/arrowRight.svg";
import dashboardInfo from "../../assets/images/dashboard/dashboardInfo.svg";
import dashboardActive from "../../assets/svg/HomeVector.svg";
import dashboardGrey from "../../assets/svg/HomeVectorGrey.svg";
import { setAppDetails, setSidebarState } from "../../store/apps/actions";
import {
  setCustomerDetails,
  setCustomerTenants,
  setSelectedTenant,
} from "../../store/customer/actions";
import { CUSTOMER_LEVEL, PLATFORM, TENANT } from "../../utils/constants";
import "./SideBar.scss";

function ToolsSideBar(props: any) {
  const { categories, setCategories } = props;
  const customerDetails = useSelector((state: AppStore) => state.customer);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [disableAutoClose, setDisableAutoClose] = useState(true);
  const selectedApp = useSelector((state: any) => {
    const selectedAppFromSession = JSON.parse(
      sessionStorage.getItem("selectedApp") || "null"
    );
    return selectedAppFromSession || state.app?.selectedApp;
  });
  const [dashboardSelected, setDashboardSelected] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const summaryOnClick = () => {
    setDashboardSelected(true);
    setDisableAutoClose(false);
    dispatch(setAppDetails({}));
    sessionStorage.removeItem("selectedApp");
    navigate(`${customerDetails?.data?.customerCode}/summary`);
  };
  useEffect(() => {
    if (window.location.pathname.includes("summary")) {
      setDashboardSelected(true);
    }
  }, []);
  useEffect(() => {
    dispatch(setSidebarState(sidebarOpen));
  }, [sidebarOpen]);
  const handleAppSelection = (app: any) => {
    setDashboardSelected(false);
    setSidebarOpen(true);
    app && sessionStorage.setItem("selectedApp", JSON.stringify(app));
    dispatch(setAppDetails(app));
    sessionTracker.setCustomEvent("App Selected", {
      "App Name": app?.name,
    });
  };

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
          disableAutoClose={true}
          setDisableAutoClose={setDisableAutoClose}
          summaryOnClick={summaryOnClick}
          dashboardSelected={dashboardSelected}
          placeholder="Search Navigation"
          sideBarHeading={null}
          onClose={(showSidebar: any) => {
            setSidebarOpen(showSidebar);
          }}
          dashboardIcons={{
            arrowRight: arrowRight,
            dashboardInfo: dashboardInfo,
            dashboardActive: dashboardActive,
            dashboardGrey: dashboardGrey,
          }}
        />
      </div>
    </div>
  );
}

export default ToolsSideBar;
