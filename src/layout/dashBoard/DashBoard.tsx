import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  EmptyState,
  Button,
  Loader,
  GreetingCard,
  OverviewCard,
  TenantDetailCard,
  Table,
} from "@phenom/react-ui-components";
import { AppStore } from "store";
import { setAppDetails, setAppsFromAPI } from "../../store/apps/actions";
import { setSiteMetaData } from "../../store/customer/actions";
import { appSelectionHandler, handleDomainUrlForSite } from "../../utils/appUtils";
import "./DashBoard.scss";
import { apiUrl } from "../../utils/constants";
import { API } from "../../utils/api";
import { APIService } from "../../utils/api.service";
import { getFullDate, getLastUpdatedDate, getGreetingMessage } from "./utils";
import { RecommendedPages } from "../../components/recommendedPages/RecommendedPages";
import { tenantData, staticData, metricsDataForAllRegions, campaignColumns, tenantImageUrl } from "./mockData";
import { AppSelectionOptions } from "interfaces/AppSelectionOptions";
import { MetricData, CampaignData } from "./Interfaces";

const DashBoard = () => {
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
  const [doesUserHaveCMSAccess, setDoesUserHaveCMSAccess] = useState<boolean>(false);
  const [campaignData, setCampaignData] = useState<CampaignData[]>([]);
  const [displayDataForApps, setDisplayDataForApps] = useState<any>([]);

  const { code, type } = window.orgInfo;

  let exclusionMapping: any = {
    Events: "showEvents",
    Campaigns: "showCampaigns",
    Automations: "showAutomations",
    Lists: "showLists",
    "Talent Community": "showTalentCommunities",
    Candidates: "showCandidates",
    "Email Manager": "showTemplates",
    "SMS Manager": "showTemplates",
    Banners: "showBanners",
  };

  const fetchCurrentTenantData = async () => {
    const tenantResp: any = await APIService.getTenantDetails(selectedTenant.refNum);
    if (tenantResp.data.status === "success") {
      return tenantResp.data.data.docs;
    }
  };

  useEffect(() => {
    if (selectedTenant?.refNum) {
      fetchMetrics();
      campaignsList();
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
    loadAppBundles();
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
      const tenantSupportedLangs = await APIService.getSupportedLangs(selectedTenant.refNum);
      const metaData = await handleDomainUrlForSite(
        tenantSupportedLangs,
        selectedTenant,
        dispatch,
        setSiteMetaData,
        siteMetaData
      );
      const tenantData = await fetchCurrentTenantData();
      const liveUrl = await handleLiveUrlForSite(`https://${metaData.domain}`);
      const x = tenantData;
      x[0].domain = liveUrl;
      metaData && setCurrentTenantData(x);
    });

    // Cleanup actions when component unmounts
    return () => {
      window.removeEventListener("txeLoginEvent", () => {});
    };
  }, []);

  useEffect(() => {
    if ((window as any).isCMSFilterAPICompleted === true && (window as any).isCRMFilterAPICompleted === true) {
      setDoesUserHaveCMSAccess(true);
      handleDisplayDataForApps(true);
    }
  }, [(window as any).isCMSFilterAPICompleted, (window as any).isCRMFilterAPICompleted]);

  const handleDisplayDataForApps = (isCMSCompleted?: boolean) => {
    const cmsValToConsider = isCMSCompleted || doesUserHaveCMSAccess;
    const staticDataForApps = staticData.filter((app) => {
      if (app.module === "cms" && cmsValToConsider) {
        return true;
      } else if (app.module === "crm") {
        return exclusionMapping[app.value] && (window as any)[exclusionMapping[app.value]];
      }
    });
    setDisplayDataForApps(staticDataForApps);
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
      const appSelectionOptions: AppSelectionOptions = {
        selectedApp: config,
        navigate: navigate,
        customerCode: selectedTenant?.customerCode,
        refNum: selectedTenant?.refNum,
        siteMetaData: siteMetaData,
        dispatch: dispatch,
        openInNewTab: false,
        setSiteMetaData: setSiteMetaData,
        selectedTenant: selectedTenant,
      };
      appSelectionHandler(appSelectionOptions);
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
    const appSelectionOptions: AppSelectionOptions = {
      selectedApp: selectedApp,
      navigate: navigate,
      customerCode: selectedTenant?.customerCode,
      refNum: selectedTenant?.refNum,
      siteMetaData: siteMetaData,
      dispatch: dispatch,
      openInNewTab: true,
      setSiteMetaData: setSiteMetaData,
      selectedTenant: selectedTenant,
    };
    appSelectionHandler(appSelectionOptions);
  };

  const handleLiveUrlForSite = async (url: string): Promise<string | null> => {
    try {
      const response = await APIService.getDomainUrl(selectedTenant.refNum, url);
      if (response?.data?.status === "success") {
        const domainUrl = response?.data?.data;
        if (domainUrl && new URL(domainUrl.toString()).hostname) {
          return domainUrl;
        }
      }
    } catch (error) {
      console.error("Error fetching live URL for site", error);
    }
    return url;
  };

  const fetchMetrics = async () => {
    try {
      const metaData = await APIService.getMetaDataByRefNum(selectedTenant.refNum);
      setAnalyticsMetaData(metaData);
      const isTrackerEnabled = checkJobTrackerEnabled(new Date().toString());
      setIsJobTrackerEnabled(isTrackerEnabled);
      const metrics = metricsDataForAllRegions;
      const metricResponses = await Promise.all(
        metrics.map(async (metric) => {
          try {
            const currentResponse = await APIService.getMetrics(metric.name, metaData, isTrackerEnabled);
            const currentValue =
              currentResponse.data[0]?.current ||
              currentResponse.data[0]?.CURRENT_VALUE ||
              currentResponse.data[0].value;

            let previousValue = null;
            let rate = null;

            const previousResponse = await APIService.getMetrics(
              `${metric.name.replace("Current", "Previous")}`,
              metaData,
              isTrackerEnabled
            );
            previousValue =
              previousResponse.data[0]?.previous ||
              previousResponse.data[0]?.PREVIOUS_VALUE ||
              previousResponse.data[0].value;

            // Calculate rate of change
            if (previousValue) {
              rate = (((currentValue - previousValue) / previousValue) * 100).toFixed(2);
            }
            return {
              title: metric.title,
              previous: previousValue ? previousValue : currentResponse.data[0]?.previous,
              current: currentValue,
              rate: previousValue
                ? rate
                : currentResponse.data[0]?.rate || currentResponse.data[0]?.PERC_CHANGE || currentResponse.data[0].rate,
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
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.round(totalSeconds % 60);
        return `${minutes} min ${seconds} sec`;
      };
      const formatConversionRate = (value: any) => `${value}%`;
      const formatChange = (rate: any) => {
        if (rate === undefined) return "N/A";
        return rate >= 0 ? `+${rate}%` : `${rate}%`;
      };
      const filteredMetricResponses = metricResponses.filter((metric) => metric !== null);
      const formattedData = filteredMetricResponses.map((metric) => {
        let value = metric.current !== null && metric.current !== undefined ? `${metric.current}` : "N/A";
        let change = formatChange(metric.rate);
        if (metric.title === "Average Time on Site" && metric.current) {
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

  const campaignsList = async () => {
    try {
      const refNum = selectedTenant?.refNum;
      await APIService.registerToken(refNum, code, type);
      const campaigns = await APIService.getCampaigns(selectedTenant);
      const formattedData = campaigns.map((campaign: any) => ({
        "Campaign Name": {
          name: campaign.campaignName,
        },
        Status: campaign.status ? `${campaign.status}` : "N/A",
        Channel: campaign.channel ? `${campaign.channel}` : "N/A",
        Conversion: campaign.conversion ? `${campaign.conversion}` : "N/A",
        Audience: campaign.audience ? `${campaign.audience}` : "N/A",
      }));
      setCampaignData(formattedData);
    } catch (error) {
      console.error("Error fetching campaigns list:", error);
    }
  };

  const loadAppBundles = () => {
    try {
      const filteredApps = JSON.parse(sessionStorage.getItem("filteredApps") || "{}");
      const selectedTenant = JSON.parse(localStorage.getItem("selectedTenant") || "{}");
      const bundleUrlsVsRoutes = filteredApps.reduce((acc: any, curr: any) => {
        if (curr?.appConfig?.url && curr?.appConfig?.route) {
          acc[curr.appConfig.url] = curr.appConfig.route;
        }
        return acc;
      }, {});
      Object.values(bundleUrlsVsRoutes).forEach((appRoute: any) => {
        try {
          const url = `${window.location.origin}/${selectedTenant.customerCode}/${selectedTenant.refNum}${appRoute}`;
          if (!document.querySelector(`[src="${url}"]`)) {
            const iframeEle = document.createElement("iframe");
            iframeEle.setAttribute("src", url);
            iframeEle.setAttribute("style", "display:none;");
            iframeEle.setAttribute("txe-pre-fetch-iframe", "");
            iframeEle.onload = () => {
              console.log(`Loaded app bundle: ${appRoute}`);
              // document.body.removeChild(iframeEle);
            };
            document.body.appendChild(iframeEle);
          }
        } catch (error) {
          console.error("Error loading app bundles:", error);
        }
      });
      setTimeout(() => {
        const iframes = document.querySelectorAll("iframe[txe-pre-fetch-iframe]");
        iframes.forEach((iframe) => {
          document.body.removeChild(iframe);
        });
      }, 30000);
    } catch (error) {
      console.error("Error loading app bundles:", error);
    }
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
          greetingMessage={getGreetingMessage()}
          subMessage="Create the future of Talent Experience"
          name={userName}
          profileImage={userDetails?.profileImage}
        />
      </div>
      {doesUserHaveCMSAccess && (
        <div className="tenant-details-container">
          {currentTenantData.length ? (
            <TenantDetailCard
              tenantLink={`${currentTenantData[0]?.domain}`}
              lastUpdated={`Last Updated: ${getLastUpdatedDate(currentTenantData[0]?.lastUpdated)}`}
              imageSrc={tenantImageUrl}
              navigateOnClick={() => {
                const appSelectionOptions: AppSelectionOptions = {
                  selectedApp: tenantData[0].config,
                  navigate: navigate,
                  customerCode: selectedTenant?.customerCode,
                  refNum: selectedTenant?.refNum,
                  siteMetaData: siteMetaData,
                  dispatch: dispatch,
                  openInNewTab: false,
                  setSiteMetaData: setSiteMetaData,
                  selectedTenant: selectedTenant,
                };
                appSelectionHandler(appSelectionOptions);
              }}
            />
          ) : (
            <Loader title="Loading tenant details.." />
          )}
        </div>
      )}
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
        {displayDataForApps.length !== 0 &&
          displayDataForApps.map((item: any, index: number) => (
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
          ))}
      </div>
      {doesUserHaveCMSAccess && <RecommendedPages />}
      {campaignData.length > 0 && (
        <>
          <h2 className="overview-heading">Campaigns</h2>
          <div className="table-container">
            <Table columns={campaignColumns} data={campaignData} />
          </div>
        </>
      )}
    </div>
  );
};

export default DashBoard;
