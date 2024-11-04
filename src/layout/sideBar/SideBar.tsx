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
import { setAppDetails, setSidebarState, setDashboardSelected } from "../../store/apps/actions";
import { setSiteMetaData } from "../../store/customer/actions";
import {
  setCustomerTenants,
  setSelectedTenant,
} from "../../store/customer/actions";
import { CUSTOMER_LEVEL, PLATFORM, TENANT } from "../../utils/constants";
import "./SideBar.scss";
import { AppSelectionOptions } from "../../interfaces/AppSelectionOptions";
import { appSelectionHandler } from "../../utils/appUtils";

function ToolsSideBar(props: any) {
  const { categories, setCategories } = props;
  const dashboardSelected = useSelector((state: any) => state.app.dashboardSelected);
  const selectedTenant = useSelector(
    (state: AppStore) => state.customer.selectedTenant
  );
  const siteMetaData = useSelector(
    (state: AppStore) => state.customer.siteMetaData
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [disableAutoClose, setDisableAutoClose] = useState(true);
  const selectedApp = useSelector((state: any) => {
    const selectedAppFromSession = JSON.parse(
      sessionStorage.getItem("selectedApp") || "null"
    );
    return selectedAppFromSession || state.app?.selectedApp;
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const summaryOnClick = () => {
    dispatch(setDashboardSelected(true));
    setDisableAutoClose(false);
    dispatch(setAppDetails({}));
    sessionStorage.removeItem("selectedApp");
    navigate(`${selectedTenant?.customerCode}/${selectedTenant?.refNum}/summary`);
  };
  const handleCrmStyles = () => {
    const buttonElement = document.querySelector('.template-editor-page .main-div .template-editor-cntr .widget-list-cntr.edit-cntr .action-bar');

    if (sidebarOpen && buttonElement) {
      buttonElement.classList.add('sidebar-open-style');
      buttonElement.classList.remove('sidebar-closed-style');
    } else if (!sidebarOpen && buttonElement) {
      buttonElement.classList.add('sidebar-closed-style');
      buttonElement.classList.remove('sidebar-open-style');
    }
    const headerElement = document.querySelector('.close-facet-serach .data-details.list-cntr .header-list-cntr');
    if (sidebarOpen && headerElement) {
      headerElement.classList.add('sidebar-header-open-style');
      headerElement.classList.remove('sidebar-header-closed-style');
    } else if (!sidebarOpen && headerElement) {
      headerElement.classList.add('sidebar-header-closed-style');
      headerElement.classList.remove('sidebar-header-open-style');
    }
  };
  useEffect(()=>{
    handleCrmStyles();
    if(window.location.pathname.includes("summary")){
      dispatch(setDashboardSelected(true));
    }
  }, []);
  useEffect(() => {
    dispatch(setSidebarState(sidebarOpen));
    handleCrmStyles();
  }, [sidebarOpen]);
  const handleAppSelection = (app: any) => {
    if(app?.name === "Experience Manager"){
      const appSelectionOptions: AppSelectionOptions = {
        selectedApp: app,
        navigate: navigate,
        customerCode: selectedTenant?.customerCode,
        refNum: selectedTenant?.refNum,
        siteMetaData: siteMetaData,
        dispatch: dispatch,
        openInNewTab: false,
        setSiteMetaData: setSiteMetaData,
        selectedTenant: selectedTenant,
      }
      appSelectionHandler(appSelectionOptions);
    } else {
      dispatch(setDashboardSelected(false));
      setSidebarOpen(true);
      app && sessionStorage.setItem("selectedApp", JSON.stringify(app));
      dispatch(setAppDetails(app));
      sessionTracker.setCustomEvent("App Selected", {
        "App Name": app?.name,
      });
    }
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
