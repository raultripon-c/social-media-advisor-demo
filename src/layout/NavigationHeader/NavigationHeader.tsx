import React from "react";

import rightNav from "../../assets/images/right.svg";

import "./NavigationHeader.scss";

interface Props {
  selectedApp: any;
  toggleSidebarMenu: any;
  showSidebarMenu: boolean;
}

const NavigationHeader: React.FC<Props> = ({
  selectedApp,
  toggleSidebarMenu,
  showSidebarMenu,
}) => {
  selectedApp =
    selectedApp.length > 0
      ? selectedApp
      : JSON.parse(sessionStorage.getItem("selectedApp") || "null");
  const handleBackClick = () => {
    toggleSidebarMenu(!showSidebarMenu);
  };
  const isSocialMediaAdvisorRoute = window.location.pathname.includes("/campaign-studio/");
  const appDisplayName = isSocialMediaAdvisorRoute
    ? "Social Media Advisor"
    : selectedApp?.name;

  return (
    <div className="module-federated-app-header-container">
      <button className="mf-header-left" onClick={handleBackClick}>
        <span className="back-navigation">Apps</span>
        <img src={rightNav} alt="" className="back-arrow" />
        {appDisplayName && <span className="app-name">{appDisplayName}</span>}
      </button>
    </div>
  );
};

export default NavigationHeader;
