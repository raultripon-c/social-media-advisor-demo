import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

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
  return (
    <div className="module-federated-app-header-container">
      <button className="mf-header-left" onClick={handleBackClick}>
        <span className="back-navigation">Apps</span>
        <img src={rightNav} alt="" className="back-arrow" />
        {selectedApp && <span className="app-name">{selectedApp.name}</span>}
      </button>
    </div>
  );
};

export default NavigationHeader;
