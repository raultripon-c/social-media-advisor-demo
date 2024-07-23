import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  EmptyState,
  Button,
  Loader,
  GreetingCard,
} from "@phenom/react-ui-components";
import { AppStore } from "store";
import { setAppDetails, setAppsFromAPI } from "../../store/apps/actions";
import { appSelectionHandler } from "../../utils/appUtils";
import profileImage from "../../assets/images/image.jpg";
import "./DashBoard.scss";

const DashBoard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedTenant = useSelector(
    (state: AppStore) => state.customer.selectedTenant
  );

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [totalAppsData, setTotalAppsData] = useState<any[]>([]);

  const userName = window.keycloakInstance.tokenParsed.name;
  const userEmail = window.keycloakInstance.tokenParsed.userDetails.userName;

  const staticData = [
    {
      text: "Page",
      icon: "https://assets-qa.phenompro.com/CareerConnectResources/siteqa1/common/js/vendor/Generic.svg",
    },
    {
      text: "Article",
      icon: "https://assets-qa.phenompro.com/CareerConnectResources/siteqa1/common/js/vendor/Company_notification.svg",
    },
    {
      text: "Campaigns",
      icon: "https://assets-qa.phenompro.com/CareerConnectResources/siteqa1/common/js/vendor/campaign.svg",
    },
    {
      text: "Events",
      icon: "https://assets-qa.phenompro.com/CareerConnectResources/siteqa1/common/js/vendor/Generic.svg",
    },
    {
      text: "Email templates",
      icon: "https://assets-qa.phenompro.com/CareerConnectResources/siteqa1/common/js/vendor/Generic.svg",
    },
    {
      text: "SMS templates",
      icon: "https://assets-qa.phenompro.com/CareerConnectResources/siteqa1/common/js/vendor/Generic.svg",
    },
  ];

  const getAllApps = async () => {
    try {
      const response = useSelector((state: AppStore) => state.app.allApps);
      if (response) {
        const sortedData = response.sort((a: any, b: any) =>
          a.name.localeCompare(b.name)
        );
        sessionStorage.setItem("allapps", JSON.stringify(sortedData));
        setTotalAppsData(sortedData);
        setFilteredData(sortedData);
        dispatch(setAppsFromAPI(sortedData));
      }
    } catch (error) {
      setTotalAppsData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = (text: string) => {
    const matchedApp = totalAppsData.find(
      (app) => app.name.toLowerCase() === text.toLowerCase()
    );
    if (matchedApp) {
      navigateToApp(matchedApp);
    } else {
      console.log(`Clicked on ${text}`);
    }
  };

  useEffect(() => {
    sessionStorage.removeItem("currentContext");
    dispatch(setAppDetails({}));
    sessionStorage.removeItem("selectedApp");
    const apps = JSON.parse(sessionStorage.getItem("allapps") || "[]");

    if (apps.length === 0) {
      getAllApps();
    } else {
      setTotalAppsData(apps);
      setFilteredData(apps);
      dispatch(setAppsFromAPI(apps));
      setIsLoading(false);
    }
  }, []);
  const navigateToApp = (selectedApp: any) => {
    sessionStorage.setItem("selectedApp", JSON.stringify(selectedApp));
    dispatch(setAppDetails(selectedApp));
    appSelectionHandler(
      selectedApp,
      navigate,
      selectedTenant?.customerCode,
      selectedTenant?.refNum
    );
  };

  if (isLoading) {
    return (
      <div className="tenants-loader">
        <Loader title="Please Wait, Loading Apps" />
      </div>
    );
  }

  return (
    <div>
      <div className="greeting-container">
        <GreetingCard
          greetingMessage="Good morning"
          subMessage="Create the future of Talent Experience"
          name={userName}
          profileImage={profileImage}
        />
      </div>
      <div className="button-row">
        {staticData.length !== 0 ? (
          staticData.map((item, index) => (
            <Button
              key={index}
              size="small"
              buttonType="primary"
              text={item.text}
              iconLeft={item.icon}
              className="primary-button-grey"
              onClick={() => handleButtonClick(item.text)}
            />
          ))
        ) : (
          <EmptyState displayText="No Apps found" />
        )}
      </div>
    </div>
  );
};

export default DashBoard;
