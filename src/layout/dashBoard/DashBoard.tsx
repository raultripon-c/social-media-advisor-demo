import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  EmptyState,
  Button,
  Loader,
  GreetingCard,
  OverviewCard,
  Table,
  TenantDetailCard
} from "@phenom/react-ui-components";
import { AppStore } from "store";
import { setAppDetails, setAppsFromAPI } from "../../store/apps/actions";
import { appSelectionHandler } from "../../utils/appUtils";
import "./DashBoard.scss";
import { apiUrl } from "../../utils/constants";
import { API } from "../../utils/api";
import { APIService } from "../../utils/api.service";
import { getFullDate } from "./utils";
import { RecommendedPages } from "../../components/recommendedPages/RecommendedPages";
const getGreetingMessage = () => {
  const now = new Date();
  const hour = now.getHours();
  if (hour < 12) {
    return "Good morning";
  } else if (hour < 18) {
    return "Good afternoon";
  } else {
    return "Good evening";
  }
};
const DashBoard = () => {
  interface MetricData {
    title: string;
    value: string;
    change: string;
    tooltipText: string;
  }
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
  const [analyticsMetaData, setAnalyticsMetaData] = useState<any>(null);
  const [isJobTrackerEnabled, setIsJobTrackerEnabled] = useState<boolean>(false);
  const [metricsData, setMetricsData] = useState<MetricData[]>([]);
  const CMS_URL = (window as any)._env_.CMS_URL;
  const userHasCmsAccess = window?.keycloakInstance?.userInfo?.resources['cms'] && 
    window?.keycloakInstance?.userInfo?.resources['cms'].roles.length > 0;

  const staticData = [
    {
      displayText: "Page",
      value: "Page",
      icon: "https://assets-qa.phenompro.com/CareerConnectResources/siteqa1/common/js/vendor/Generic.svg",
      config: {
        appType: "external",
        appConfig: { "link": CMS_URL + "/tier3" },
        context: "customer",
        requestParams: { "lsrc": "txe", "lsw": "_self", "refNum": "", "customerCode": "", "route": "pages" }
      }
    },
    {
      displayText: "Article",
      value: "Blog",
      icon: "https://assets-qa.phenompro.com/CareerConnectResources/siteqa1/common/js/vendor/Company_notification.svg",
    },
    {
      displayText: "Campaigns",
      value: "Campaigns",
      icon: "https://assets-qa.phenompro.com/CareerConnectResources/siteqa1/common/js/vendor/campaign.svg",
    },
    {
      displayText: "Events",
      value: "Events",
      icon: "https://assets-qa.phenompro.com/CareerConnectResources/siteqa1/common/js/vendor/Generic.svg",
    },
    {
      displayText: "Email templates",
      value: "Email templates",
      icon: "https://assets-qa.phenompro.com/CareerConnectResources/siteqa1/common/js/vendor/Generic.svg",
    },
    {
      displayText: "SMS templates",
      value: "SMS templates",
      icon: "https://assets-qa.phenompro.com/CareerConnectResources/siteqa1/common/js/vendor/Generic.svg",
    },
  ];
  // const campaignsList = ["Campaign Name", "Status", "Channel", "Conversion", "Audience"];

  // const campaignData = [
  //   {
  //     "Campaign Name": {
  //       icon: "https://assets-qa.phenompro.com/CareerConnectResources/siteqa1/common/js/vendor/Insta_circle.svg",
  //       name: "Instagram advertising campaign",
  //     },
  //     Status: "Active",
  //     Channel: "Instagram",
  //     Conversion: "6,546",
  //     Audience: "12% +3%",
  //   },
  //   {
  //     "Campaign Name": {
  //       icon: "https://assets-qa.phenompro.com/CareerConnectResources/siteqa1/common/js/vendor/FB.svg",
  //       name: "Facebook outreach campaign",
  //     },
  //     Status: "Active",
  //     Channel: "Facebook",
  //     Conversion: "4,750",
  //     Audience: "8%",
  //   },
  //   {
  //     "Campaign Name": {
  //       icon: "https://assets-qa.phenompro.com/CareerConnectResources/siteqa1/common/js/vendor/Email.svg",
  //       name: "Referral program campaign",
  //     },
  //     Status: "On hold",
  //     Channel: "Email",
  //     Conversion: "5,775",
  //     Audience: "2%",
  //   },
  //   {
  //     "Campaign Name": {
  //       icon: "https://assets-qa.phenompro.com/CareerConnectResources/siteqa1/common/js/vendor/Inbox.svg",
  //       name: "Talent community promotion",
  //     },
  //     Status: "Completed",
  //     Channel: "Newsletter",
  //     Conversion: "3,422",
  //     Audience: "5% +2%",
  //   },
  // ];

  const tenantData = [
    {
      tenantLink: "https://phenompeople-qa.phenompro.com/us/en",
      lastUpdated: "2 days",
      imageSrc: "https://s3-alpha-sig.figma.com/img/fdb8/3a8a/00d7fa64d276ad2883a094aaebd7c90c?Expires=1727049600&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=BM-NZiwqOvW-EgEZS~lKAs4~xCrH8IYOmbZWorSlkfHwOgCQ2RJMyGbLKMZEOGTnIGhqYFcl~91~hHTPeItC0SLZJlmta2SJdDXNfEzY5ZPrBZ02d1Cud~lKv1s7AbpXThH-TwtFR~qEvThCW8uPLgm75hnRSkXWmMoFuxBuXywUQy7iRdEpe~Gq9OHZFOp8PYpEe8I91NQHftOamcXrkOwTugtJ~XF6ZvIzAknDQQoxf4QID~Eu73ziGvWE2sJ7fX7EWLDMhhiBMYFMmbNRQUe2NO11V0lnkFJXuLMXVOxdueEXdyGo~8-bLpDlOcmUOdK6IMMSy2EBVs5P1MPxig__",
      refNum: "PHENA0059",
      config: {
        appType: "external",
        appConfig: { "link": CMS_URL + "/tier3" },
        context: "customer",
        requestParams: { "lsrc": "txe", "lsw": "_self", "refNum": "", "customerCode": ""}
      }
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
  const handleButtonClick = (text: string, config?: object) => {
    const matchedApp = totalAppsData.find(
      (app) => app.name.toLowerCase() === text.toLowerCase()
    );
    if (matchedApp) {
      navigateToApp(matchedApp);
    } else if (config) {
      appSelectionHandler(
        config,
        navigate,
        selectedTenant?.customerCode,
        selectedTenant?.refNum,
        dispatch
      );
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
  useEffect(() => {
    if (selectedTenant?.refNum) {
      const fetchMetrics = async () => {
        try {
          const metaData = await APIService.getMetaDataByRefNum(selectedTenant.refNum);
          setAnalyticsMetaData(metaData);
          const isTrackerEnabled = checkJobTrackerEnabled(new Date().toString());
          setIsJobTrackerEnabled(isTrackerEnabled);
          const metrics = [
            { name: "visitsKpi", title: "Career Site Visits", text: "Total number of career site visits with daily delta percentage" },
            { name: "applicationsConversionKpi", title: "Conversion Rate", text: "Total number of Talent Community, Job Alert, and Similar Job Alert subscriptions with daily delta percentage" },
            { name: "completedCareerSiteApplies", title: "Recent Leads", text: "Total number of job seekers who clicked the Apply button" },
            { name: "uniqueLeads", title: "New Applicants", text: "Total number of unique leads generated" },
            { name: "avgTimeOnPage", title: "Avg. Time on Page", text: "Average time a visitor spends on the career site with daily delta percentage" }
          ];
          const metricResponses = await Promise.all(
            metrics.map(async metric => {
              try {
                const response = await APIService.getMetrics(metric.name, metaData, isTrackerEnabled);
                return {
                  title: metric.title,
                  previous: response.data[0]?.previous,
                  current: response.data[0]?.current || response.data[0]?.CURRENT_VALUE,
                  rate: response.data[0]?.rate || response.data[0]?.PERC_CHANGE,
                  text: metric.text
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
          const filteredMetricResponses = metricResponses.filter(metric => metric !== null);
          const formattedData = filteredMetricResponses.map(metric => {
            let value = metric.current ? `${metric.current}` : "N/A";
            let change = formatChange(metric.rate);
            if (metric.title === 'Avg. Time on Page' && metric.current) {
              value = formatAvgTimeOnPage(metric.current);
            } else if (metric.title === 'Conversion Rate' && metric.current) {
              value = formatConversionRate(value);
            }
            return {
              title: metric.title,
              value: value,
              change: change,
              tooltipText: metric.text
            };
          });
          setMetricsData(formattedData);
        } catch (error) {
          console.error("Error fetching metrics:", error);
        }
      };
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
      selectedTenant?.refNum,
      dispatch,
      true
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
          greetingMessage={getGreetingMessage()}
          subMessage="Create the future of Talent Experience"
          name={userName}
          profileImage={userDetails?.profileImage}
        />
      </div>
      <div className="tenant-details-container">
        <TenantDetailCard
          tenantLink= {tenantData[0].tenantLink}
          lastUpdated= {tenantData[0].lastUpdated}
          imageSrc= {tenantData[0].imageSrc}
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
      </div>
      <div className="overview-container">
        {metricsData.length > 0 && (
          <h2 className="overview-heading">Overview</h2>
        )}
        {[0, 1].map((rowIndex) => (
          <div className="overview-grid-container" key={rowIndex}>
            {(metricsData).slice(rowIndex * 3, (rowIndex + 1) * 3).map((item, index) => (
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
      {/* <h2 className="overview-heading">Campaigns</h2>
      <div className="table-container">
        <Table columns={campaignsList} data={campaignData} />
      </div>  */}
    </div>
  );
};

export default DashBoard;
