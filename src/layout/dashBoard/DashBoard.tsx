import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { EmptyState, Button, Loader, GreetingCard, OverviewCard, TenantDetailCard } from "@phenom/react-ui-components";
import { AppStore } from "store";
import { setAppDetails, setAppsFromAPI } from "../../store/apps/actions";
import { setSiteMetaData } from "../../store/customer/actions";
import { appSelectionHandler } from "../../utils/appUtils";
import "./DashBoard.scss";
import { apiUrl } from "../../utils/constants";
import { API } from "../../utils/api";
import { APIService } from "../../utils/api.service";
import { getFullDate, getLastUpdatedDate, getGreetingMessage } from "./utils";
import { RecommendedPages } from "../../components/recommendedPages/RecommendedPages";
import { tenantData, staticData, metricsDataForIndia, metricsDataForOtherRegions } from "./mockData";

const DashBoard = () => {
  interface MetricData {
    title: string;
    value: string;
    change: string;
    tooltipText: string;
  }
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedTenant = useSelector((state: AppStore) => state.customer.selectedTenant);
  const siteMetaData = useSelector((state: AppStore) => state.customer.siteMetaData);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [totalAppsData, setTotalAppsData] = useState<any[]>([]);
  const userName = window.keycloakInstance.tokenParsed.name;
  const [userDetails, setDetails] = useState<any>();
  const [analyticsMetaData, setAnalyticsMetaData] = useState<any>(null);
  const [isJobTrackerEnabled, setIsJobTrackerEnabled] = useState<boolean>(false);
  const [metricsData, setMetricsData] = useState<MetricData[]>([]);
  const [currentTenantData, setCurrentTenantData] = useState<any>([]);

  const userHasCmsAccess =
    window?.keycloakInstance?.userInfo?.resources["cms"] &&
    window?.keycloakInstance?.userInfo?.resources["cms"].roles.length > 0;

  const fetchCurrentTenantData = async () => {
    const tenantResp: any = await APIService.getTenantDetails(selectedTenant.refNum);
    if (tenantResp.data.status === "success") {
      return tenantResp.data.data.docs;
    }
  };

  const getAllApps = async () => {
    try {
      const response = useSelector((state: AppStore) => state.app.allApps);
      if (response) {
        const sortedData = response.sort((a: any, b: any) => a.name.localeCompare(b.name));
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

  const handleButtonClick = (text: string, config?: object) => {
    const matchedApp = totalAppsData.find((app) => app.name.toLowerCase() === text.toLowerCase());
    if (matchedApp) {
      navigateToApp(matchedApp);
    } else if (config) {
      appSelectionHandler(config, navigate, selectedTenant?.customerCode, selectedTenant?.refNum, dispatch);
    } else {
      console.log(`Clicked on ${text}`);
    }
  };

  const checkJobTrackerEnabled = (startDate: string) => {
    if (analyticsMetaData?.jobTrackersStartDate) {
      const actualDate = new Date(analyticsMetaData.jobTrackersStartDate).toJSON();
      const jobTrackingDate = getFullDate(actualDate);
      const selectedStartDate = getFullDate(startDate);
      return selectedStartDate >= jobTrackingDate;
    }
    return false;
  };

  const navigateToApp = (selectedApp: any) => {
    sessionStorage.setItem("selectedApp", JSON.stringify(selectedApp));
    dispatch(setAppDetails(selectedApp));
    appSelectionHandler(selectedApp, navigate, selectedTenant?.customerCode, selectedTenant?.refNum, dispatch, true);
  };

  const handleDomainUrlForSite = async () => {
    try {
      let domainUrl;
      const siteMetaDataResp: any = await APIService.getSiteMetaData(selectedTenant.refNum);
      if (siteMetaDataResp.data.status === "success") {
        domainUrl = siteMetaDataResp?.data?.data?.domain;
      }
      if (!Object.keys(siteMetaData).length) {
        dispatch(setSiteMetaData(siteMetaDataResp.data.data));
      }
      return domainUrl;
    } catch (error) {
      console.error("Error fetching domain URL for site", error);
    }
  };

  const fetchMetrics = async () => {
    try {
      const metaData = await APIService.getMetaDataByRefNum(selectedTenant.refNum);
      setAnalyticsMetaData(metaData);
      const isTrackerEnabled = checkJobTrackerEnabled(new Date().toString());
      setIsJobTrackerEnabled(isTrackerEnabled);
      const isIndia = metaData.applicationRegion === "in";
      const metrics = isIndia
        ? metricsDataForIndia
        : metricsDataForOtherRegions;
      const metricResponses = await Promise.all(
        metrics.map(async (metric) => {
          try {
            const response = await APIService.getMetrics(metric.name, metaData, isTrackerEnabled);
            return {
              title: metric.title,
              previous: response.data[0]?.previous,
              current: response.data[0]?.current || response.data[0]?.CURRENT_VALUE,
              rate: response.data[0]?.rate || response.data[0]?.PERC_CHANGE,
              text: metric.text,
            };
          } catch (error) {
            console.error(`Error fetching ${metric.name}:`, error);
            return null;
          }
        })
      );
      const formatAvgTimeOnPage = (value: any) => {
        const totalSeconds = parseFloat(value);
        const minutes = Math.floor(totalSeconds);
        const seconds = Math.round((totalSeconds - minutes) * 100);
        return `${minutes} min ${seconds} sec`;
      };
      const formatConversionRate = (value: any) => `${value}%`;
      const formatChange = (rate: any) => {
        if (rate === undefined) return "N/A";
        return rate >= 0 ? `+${rate}%` : `${rate}%`;
      };
      const filteredMetricResponses = metricResponses.filter((metric) => metric !== null);
      const formattedData = filteredMetricResponses.map((metric) => {
        let value = metric.current ? `${metric.current}` : "N/A";
        let change = formatChange(metric.rate);
        if (metric.title === "Avg. Time on Page" && metric.current) {
          value = formatAvgTimeOnPage(metric.current);
        } else if (metric.title === "Conversion Rate" && metric.current) {
          value = formatConversionRate(value);
        }
        return {
          title: metric.title,
          value: value,
          change: change,
          tooltipText: metric.text,
        };
      });
      setMetricsData(formattedData);
    } catch (error) {
      console.error("Error fetching metrics:", error);
    }
  };

  useEffect(() => {
    if (selectedTenant?.refNum) {
      fetchMetrics();
    }
  }, [selectedTenant]);

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
        const loggedInUserEmail = window.keycloakInstance?.tokenParsed?.userDetails?.userName;
        if (!loggedInUserEmail) return;
        const endPoint = apiUrl.getUserBySearch.replace("{username}", loggedInUserEmail);
        const response = await API.get(`${(window as any)._env_.APP_API_URL}/${endPoint}`);
        setDetails(response?.data?.data);
      } catch (error) {
        console.log(error);
      }
    };
    getLoggedInUserInfo();
    window.addEventListener("txeLoginEvent", async () => {
      const tenantData = await fetchCurrentTenantData();
      const domainUrl = await handleDomainUrlForSite();

      const x = tenantData;
      x[0].domain = domainUrl;
      domainUrl && setCurrentTenantData(x);
    });

    // Cleanup actions when component unmounts
    return () => {
      window.removeEventListener("txeLoginEvent", () => { });
    };
  }, []);

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
          greetingMessage={getGreetingMessage()}
          subMessage="Create the future of Talent Experience"
          name={userName}
          profileImage={userDetails?.profileImage}
        />
      </div>
      <div className="tenant-details-container">
        {currentTenantData.length ? (
          <TenantDetailCard
            tenantLink={`https://${currentTenantData[0]?.domain}`}
            lastUpdated={`Last Updated: ${getLastUpdatedDate(currentTenantData[0]?.lastUpdated)}`}
            imageSrc="https://assets.phenompeople.com/CareerConnectResources/prod/BCG1US/images/No-Image-Found-400x264-1728367719526.png"
            navigateOnClick={() => {
              appSelectionHandler(
                tenantData[0].config,
                navigate,
                selectedTenant?.customerCode,
                selectedTenant?.refNum,
                dispatch
              );
            }}
          />
        ) : (
          <Loader title="Loading tenant details.." />
        )}
      </div>
      <div className="overview-container">
        {metricsData.length > 0 && <h2 className="overview-heading">Overview</h2>}
        {[0, 1].map((rowIndex) => (
          <div className="overview-grid-container" key={rowIndex}>
            {metricsData.slice(rowIndex * 3, (rowIndex + 1) * 3).map((item, index) => (
              <OverviewCard
                key={index}
                title={item.title}
                value={item.value}
                change={item.change}
                tooltipText={item.tooltipText}
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
              text={item.displayText}
              iconLeft={item.icon}
              className="primary-button-grey"
              onClick={() => {
                handleButtonClick(item.value, item?.config);
              }}
            />
          ))
        ) : (
          <EmptyState displayText="No Apps found" />
        )}
      </div>
      {userHasCmsAccess && <RecommendedPages />}
    </div>
  );
};

export default DashBoard;
