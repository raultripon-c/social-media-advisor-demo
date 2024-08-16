import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  EmptyState,
  Button,
  Loader,
  GreetingCard,
  OverviewCard,
} from "@phenom/react-ui-components";
import { AppStore } from "store";
import { setAppDetails, setAppsFromAPI } from "../../store/apps/actions";
import { appSelectionHandler } from "../../utils/appUtils";
import "./DashBoard.scss";
import { apiUrl } from "../../utils/constants";
import { API } from "../../utils/api";
import { RecommendedPages } from "../../components/recommendedPages/RecommendedPages";

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
  const [userDetails, setDetails] = useState<any>();

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

  const data = [
    { title: "Recent Leads", value: "150", change: "+10%" },
    { title: "New Applicants", value: "75", change: "-2.4" },
    { title: "Career Site Visits", value: "1200", change: "+2%" },
    { title: "Conversion Rate", value: "6.25%", change: "+10" },
    { title: "Avg. Time on Page", value: "1min 45sec", change: "+10" },
    { title: "My active campaigns", value: "47", change: "+10" },
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
  }, [dispatch]);

  useEffect(() => {
    const getLoggedInUserInfo = async () => {
      try {
        const loggedInUserEmail =
          window.keycloakInstance?.tokenParsed?.userDetails?.userName;

        if (!loggedInUserEmail) return;

        const endPoint = apiUrl.getUserBySearch.replace(
          "{username}",
          loggedInUserEmail
        );

        const response = await API.get(
          `${(window as any)._env_.APP_API_URL}/${endPoint}`
        );
        setDetails(response?.data?.data);
      } catch (error) {
        console.log(error);
      }
    };

    getLoggedInUserInfo();
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
          profileImage={userDetails?.profileImage}
        />
      </div>
      <div className="overview-container">
        <h2 className="overview-heading">Overview</h2>
        {[0, 1].map((rowIndex) => (
          <div className="overview-grid-container" key={rowIndex}>
            {data.slice(rowIndex * 3, (rowIndex + 1) * 3).map((item, index) => (
              <OverviewCard
                key={index}
                title={item.title}
                value={item.value}
                change={item.change}
              />
            ))}
          </div>
        ))}
      </div>
      <h2 className="overview-heading">Create</h2>
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
      <RecommendedPages />
    </div>
  );
};

export default DashBoard;
