import { SideBar } from "@phenom/react-ui-components";
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
import "./SideBar.scss";
import { AppSelectionOptions } from "../../interfaces/AppSelectionOptions";
import { appSelectionHandler, findAppConfigByRoutes } from "../../utils/appUtils";
import { MessageService } from "../../MessageService";
import { useFeatureFlags } from "../../context/FeatureFlagsContext";

function ToolsSideBar(props: any) {
  const { categories, setCategories } = props;
  const isAnalyticsChildAvailable = useSelector((state: any) => state.app.isAnalyticsChildAvailable);
  const dashboardSelected = useSelector((state: any) => state.app.dashboardSelected);
  const selectedTenant = useSelector(
    (state: AppStore) => state.customer.selectedTenant
  );
  const siteMetaData = useSelector(
    (state: AppStore) => state.customer.siteMetaData
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [disableAutoClose, setDisableAutoClose] = useState(true);
  const [analyticsTenantSelected, setAnalyticsTenantSelected] = useState(false);
  let fetchedApps = useSelector((state: any) => state.app.allApps);
  if(!fetchedApps || fetchedApps.length === 0) {
    fetchedApps = JSON.parse(sessionStorage.getItem("allapps") || "[]");
  }
  let detailsApp = fetchedApps && fetchedApps.length && findAppConfigByRoutes(fetchedApps, `/${window.location.pathname.split('/').slice(3).join('/')}`)[0];
  const campaignStudioNewApp = categories
    ?.flatMap((category: any) => category?.children || [category])
    ?.find(
      (app: any) =>
        app?.name === "Social Media Advisor" ||
        app?.id === "campaign-studio-new" ||
        app?.appConfig?.route === "/campaign-studio/campaigns" ||
        `${app?.name || ""}`.toLowerCase().includes("campaign studio"),
    );
  if (window.location.pathname.includes("/campaign-studio/") && campaignStudioNewApp) {
    detailsApp = {
      ...campaignStudioNewApp,
      name: "Social Media Advisor",
      hoverText: "Social Media Advisor",
    };
  }
  const selectedApp = useSelector((state: any) => {
    const selectedAppFromSession = JSON.parse(
      sessionStorage.getItem("selectedApp") || "null"
    );
    return detailsApp ?? (selectedAppFromSession || state.app?.selectedApp);
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { autoGenerateCandidateJourneysOnSidebarNav } = useFeatureFlags();
  const summaryOnClick = () => {
    dispatch(setDashboardSelected(true));
    setDisableAutoClose(false);
    dispatch(setAppDetails({}));
    setAnalyticsTenantSelected(false);
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
    MessageService.on("ANALYTICS_TENANT_SELECTED").subscribe((tenant) => {
      setAnalyticsTenantSelected(true);
    });
    handleCrmStyles();
    if(window.location.pathname.includes("summary")){
      dispatch(setDashboardSelected(true));
    }
    return () => {
      setAnalyticsTenantSelected(false);
    };
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
    } else if (
      app?.name === "Social Media Advisor" ||
      app?.id === "campaign-studio-new" ||
      `${app?.name || ""}`.toLowerCase().includes("campaign studio") ||
      app?.appConfig?.route === "/campaign-studio/campaigns"
    ) {
      const advisorApp = { ...app, name: "Social Media Advisor", hoverText: "Social Media Advisor" };
      dispatch(setDashboardSelected(false));
      dispatch(setAppDetails(advisorApp));
      sessionStorage.setItem("selectedApp", JSON.stringify(advisorApp));
      sessionStorage.removeItem("txeCustomPath");
      navigate(`/${selectedTenant.customerCode}/${selectedTenant.refNum}/campaign-studio/campaigns`);
    } else if (app?.name === "Candidate Journeys") {
      dispatch(setDashboardSelected(false));
      dispatch(setAppDetails(app));
      sessionStorage.setItem("selectedApp", JSON.stringify(app));
      const path = `/${selectedTenant.customerCode}/${selectedTenant.refNum}/candidate-journeys`;
      if (autoGenerateCandidateJourneysOnSidebarNav) {
        navigate(path, { state: { autoGenerateCandidateJourneys: true } });
      } else {
        navigate(path);
      }
    } else if (app?.name === "Banners") {
      const bannersPath = `/${selectedTenant.customerCode}/${selectedTenant.refNum}/banners`;
      window.location.assign(`${window.location.origin}${bannersPath}`);
    } else {
      dispatch(setDashboardSelected(false));
      setSidebarOpen(true);
      app && sessionStorage.setItem("selectedApp", JSON.stringify(app));
      dispatch(setAppDetails(app));
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
        isAnalyticsChildAvailable: app.parentName === "Analytics" && isAnalyticsChildAvailable && !analyticsTenantSelected,
        customeRoute: true,
        setShowAnalyticsTenant: setAnalyticsTenantSelected
      }
      sessionStorage.removeItem("txeCustomPath");
      appSelectionHandler(appSelectionOptions);
      (window as any).__OPENREPLAY__?.event("App Selected", {
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
