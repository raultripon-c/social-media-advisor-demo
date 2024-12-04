import { isEmpty } from "lodash";
import { toast } from "react-toastify";

import { RemoteModuleRenderer } from "../remote-modules/RemoteModuleRenderer";

import { DATE_FORMAT, navigationHeaderApps, noShowSideBar } from "./constants";
import { setAppDetails, setDashboardSelected } from "../store/apps/actions";
import { APIService } from "./api.service";
import { AppSelectionOptions } from "interfaces/AppSelectionOptions";
import { CommonConstants } from "./common-constants";

export const appSelectionHandler = (
  options: AppSelectionOptions
): void => {
  const {
    selectedApp,
    navigate,
    customerCode,
    refNum,
    siteMetaData,
    dispatch,
    openInNewTab,
    setSiteMetaData,
    selectedTenant,
    customeRoute
  } = options;

  if (!selectedApp) {
    navigate(customerCode ? `${customerCode}/summary` : "/");
    return;
  }

  const appType = selectedApp.appType;
  const mfRoute = selectedApp.appConfig?.route || "";
  const routeWithoutRefNum = mfRoute.replace("/:refnum", "");
  let updatedRoute = "";

  if (selectedApp.context === "customer") {
    updatedRoute = customerCode;
  } else if (selectedApp.context === "tenant") {
    updatedRoute = `${customerCode}/${refNum}`;
  }

  switch (appType) {
    case "module-federation":
      handleModuleFederation(
        updatedRoute,
        routeWithoutRefNum,
        openInNewTab,
        navigate,
        dispatch,
        selectedApp,
        customeRoute
      );
      break;
    case "external":
      handleExternalApp(
        refNum,
        selectedTenant,
        dispatch,
        setSiteMetaData,
        siteMetaData,
        selectedApp,
        customerCode,
        navigate
      );
      break;
    case "script":
      handleScriptApp(
        updatedRoute,
        routeWithoutRefNum,
        openInNewTab,
        navigate
      );
      break;
    default:
      navigate("/");
      break;
  }
};

const handleModuleFederation = (
  updatedRoute: string,
  routeWithoutRefNum: string,
  openInNewTab: boolean,
  navigate: (path: string) => void,
  dispatch: any,
  selectedApp: any,
  customRoute?: any
) => {
  if (openInNewTab) {
    const route = !isEmpty(updatedRoute)
      ? `/${updatedRoute}${routeWithoutRefNum}`
      : `${routeWithoutRefNum}`;
    const link = `${window.location.origin}${route}`;
    navigateToNewTab(link);
    sessionStorage.removeItem("selectedApp");
    dispatch(setAppDetails({}));
  } else {
    sessionStorage.setItem("selectedApp", JSON.stringify(selectedApp));
    if (isEmpty(updatedRoute) && selectedApp?.context !== "platform") {
      sessionStorage.removeItem("selectedApp");
    }
    if(customRoute) {
      navigate(
        !isEmpty(updatedRoute)
          ? `/${updatedRoute}${routeWithoutRefNum}`
          : `${routeWithoutRefNum}`
      );
    }
    if(selectedApp?.appConfig?.scope === "cpui") {
      const event = new CustomEvent("txeAppChange", {
        detail: {
        route: `${routeWithoutRefNum}`,
        },
      });
      // window.dispatchEvent(event);
      document.getElementById("child-module-renderer")?.dispatchEvent(event);
    }
    if(selectedApp?.appConfig?.scope === 'analyticsUiPro') {
      const event = new CustomEvent('triggeredAnalytics', {
        detail: {
        route: `${routeWithoutRefNum}`,
        },
      });
      window.dispatchEvent(event);
    }
    if(selectedApp?.appConfig?.scope === 'chatbotManagementDashboard') {
      const event = new CustomEvent('triggeredCmp', {
        detail: {
        route: `${routeWithoutRefNum}`,
        },
      });
      window.dispatchEvent(event);
    }
  }
};

const handleExternalApp = async (
  refNum: string,
  selectedTenant: any,
  dispatch: any,
  setSiteMetaData: any,
  siteMetaData: any,
  selectedApp: any,
  customerCode: string,
  navigate: (path: string) => void
) => {

  const tenantSupportedLangs = await APIService.getSupportedLangs(refNum);
  const metaData = await handleDomainUrlForSite(
    tenantSupportedLangs,
    selectedTenant,
    dispatch,
    setSiteMetaData,
    siteMetaData
  );

  const link = getLink(selectedApp, {
    refNum: refNum,
    customerCode: customerCode,
    site: btoa(JSON.stringify(metaData))
  });

  if (link && !isEmpty(link)) {
    navigateToNewTab(link);
  } else {
    toast.dismiss();
    toast.error("Link is not provided for navigation");
  }
};

const handleScriptApp = (
  updatedRoute: string,
  routeWithoutRefNum: string,
  openInNewTab: boolean,
  navigate: (path: string) => void
) => {
  const route = !isEmpty(updatedRoute)
    ? `/${updatedRoute}${routeWithoutRefNum}`
    : `${routeWithoutRefNum}`;

  const link = `${window.location.origin}${route}`;
  if (openInNewTab) {
    navigateToNewTab(link);
  } else {
    navigate(
      !isEmpty(updatedRoute)
        ? `/${updatedRoute}${routeWithoutRefNum}`
        : `${routeWithoutRefNum}`
    );
  }
};
export const showSidebar = (app: any) => {
  app =
    app.length > 0
      ? app
      : JSON.parse(sessionStorage.getItem("selectedApp") || "null");
  const currentPath = window.location.pathname;
  const filtered = noShowSideBar.filter((each: any) =>
    currentPath.endsWith(each)
  );
  let showSideNavString = app?.appConfig?.showSideNav;
  let showSideNavBoolean = showSideNavString === "true";
  if (app?.appType === "module-federation" && !showSideNavBoolean) {
    return false;
  } else if (filtered?.length > 0) {
    return false;
  } else return true;
};
export const getAppByName = (data: any, appName: string) => {
  const foundApp = data?.find((app: any) => app?.name === appName);
  return foundApp ? foundApp : {};
};
export const transformAppData = (data: any) => {
  let categoryMap = data
    ?.filter((app: any) => app.isParent)
    .map((item: any) => {
      return {
        id: item.id,
        isParent: item.isParent,
        name: item.name,
        icon: item.icon,
        link: "https://www.example.com/category",
        hoverText: item.hoverText,
        apps: [],
        context: item.context,
        isOpen: true,
        parentName: item.parentName,
        order: item.order,
      };
    });

  const sortAppsByOrder = (apps: any[]) => {
    let newApps = apps.sort((a, b) => a.order - b.order);
    return newApps;
  };
  
  let exclusionMapping: any = {
    Events: "showEvents",
    Campaigns: "showCampaigns",
    Automations: "showAutomations",
    Lists: "showLists",
    "Talent Community": "showTalentCommunities",
    Candidates: "showCandidates",
    "Email Manager" : "showTemplates",
    "SMS Manager": "showTemplates",
    "Banners": "showBanners"
  };

  const customerTenantApps = categoryMap
    .map((item: any) => {
      const filteredApps = data?.filter((app: any) => {
        const isAnalyticsPresent = Object.keys(window.keycloakInstance.userInfo.resources).some((key) =>
          key.toLowerCase().includes("analytics")
        );
        const userDetails = window?.keycloakInstance?.tokenParsed?.userDetails;
        
        // Define the exclusion mapping between app names and window variables
        
      
        // Check if the app should be excluded based on the mapping
        const shouldExclude = exclusionMapping[app.name] && !(window as any)[exclusionMapping[app.name]];
      
        // If the app should be excluded, return false
        if (shouldExclude) return false;

        // Exclude "Bot Settings" and "Knowledge Base" if userType is not "PARTNER"
        if(userDetails?.userType !== "PARTNER" && (app.name === "Bot Settings" || app.name === "Knowledge Base")) {
          return false;
        }

        // Exclude "Analytics" if "analytics" is not present in the resources
        if(!isAnalyticsPresent && app.name === "Analytics") {
          return false;
        }
      
        // Main filter conditions
        return (
          !app.isParent &&
          app.parentName === item.name &&
          (app.context === "tenant" || app.context === "customer")
        );
      });

      if (item.isParent && filteredApps.length === 0) {
        return null;
      }

      return { ...item, children: sortAppsByOrder(filteredApps) };
    })
    .filter(Boolean);

  const platformApps = categoryMap
    .map((item: any) => {
      const filteredApps = data?.filter((app: any) => {
        return (
          !app.isParent &&
          app.parentName === item.name &&
          app.context === "platform"
        );
      });

      if (item.isParent && filteredApps.length === 0) {
        return null;
      }

      return { ...item, children: sortAppsByOrder(filteredApps) };
    })
    .filter(Boolean); // Filter out any null items

  const individualApps = data?.filter((app: any) => {
    return !app.isParent && !app.parentName;
  });
  const combinedCustomerTenantApps = sortAppsByOrder([
    ...customerTenantApps,
    ...individualApps,
  ]);

  const mainData = {
    customerTenantApps: combinedCustomerTenantApps,
    platformApps: sortAppsByOrder(platformApps),
  };
  return mainData;
};
export const getMfRoutes = (data: any) => {
  const mfRoutes = data
    .filter(({ appType }: { appType: string }) => appType === "module-federation")
    .flatMap(({ context, appConfig }: { context: string; appConfig: { route?: string } }) => {
      if (!appConfig?.route) return [];

      const { route } = appConfig;
      let updatedPath: string;

      if (context === "tenant" || context === "customer") {
        updatedPath = `/:customerCode/:refNum${route}`;
      } else {
        updatedPath = route;
      }

      return [
        { path: updatedPath, component: RemoteModuleRenderer },
        { path: `${updatedPath}/*`, component: RemoteModuleRenderer },
      ];
    });
  return mfRoutes;
};

export const findAppByRoute = (data: any, route: any) => {
  for (const category of data) {
    for (const app of category.apps) {
      if (app.appConfig && app.appConfig.route) {
        // Extract the last parts of the routes
        const routeData = app.appConfig.route
          .split("/")
          .filter((part: any) => part.length > 0);

        const parts2 = route.split("/");

        const routeLastPart = routeData[routeData.length - 1];

        if (parts2.includes(routeLastPart)) return app;
      }
    }
  }
  // Return users if no matching app is found
  const identity = data?.filter(
    (eachCategory: any) => eachCategory.name === "Identity"
  );
  return identity?.apps?.filter((eachApp: any) => eachApp.name === "Users");
};
export const showNavigationHeader = (selectedApp: any) => {
  selectedApp =
    selectedApp.length > 0
      ? selectedApp
      : JSON.parse(sessionStorage.getItem("selectedApp") || "null");
  let showSideNavString = selectedApp?.appConfig?.showSideNav;
  let showSideNavBoolean = showSideNavString === "true";
  if (selectedApp?.appType === "module-federation" && !showSideNavBoolean) {
    return true;
  } else if (navigationHeaderApps.includes(selectedApp?.name)) {
    return true;
  } else return false;
};

export const navigateToNewTab = (url: string) => {
  return window.open(url, "_blank");
};

export function findAppConfigByRoutes(apps: any = [], value: string): any {
  try {
    return apps.filter((element: any) => {
      try {
        return value
          .toLowerCase()
          .includes(element?.appConfig?.route?.toLowerCase());
      } catch (error) {
        console.error("An error occurred while filtering: ", error);
        return false;
      }
    });
  } catch (error) {
    console.error("An error occurred: ", error);
    return [];
  }
}
export function getLink(selectedApp: any, request: any): any {
  let link = selectedApp?.appConfig?.link;
  let requestParam = selectedApp?.requestParams;
  let setLink = "";
  try {
    Object.entries(requestParam).forEach(([key, value]) => {
      if (setLink.length > 0) {
        setLink += "&";
      }
      if (key in request) {
        setLink += `${key}=${encodeURIComponent(request[key] as string)}`;
      } else {
        setLink += `${key}=${encodeURIComponent(value as string)}`;
      }
    });

    setLink = `${link}?${setLink}`;

    return setLink;
  } catch (error) {
    console.error("An error occurred: ", error);
    return [];
  }
}

export function setObjectReferenceFromString(obj: any, str: string, value: any) {
  if (!str.length) return;
  const keys = str.split(".");
  const lastKey = keys.pop();
  const lastObj = keys.reduce((a, i) => (a[i] = a[i] || {}), obj);
  if (lastKey) lastObj[lastKey] = value;
}

export const removeCrmStyles = () => {
  const styleTags = document.querySelectorAll("style");

  styleTags.forEach((styleTag) => {
    if (styleTag.textContent?.includes("camp-default.png")) {
      styleTag.remove();
    }
    if (styleTag.textContent?.includes("Bootstrap v4.3.1")) {
      styleTag.remove();
      console.log("Removed a <style> tag containing 'Bootstrap v4.3.1'");
    }
  });

  const crmStyles = document.getElementById("crm-styles");
  crmStyles && document.head.removeChild(crmStyles);
};

export const removeStylesBasedOnContents = (contents: string[]) => {
  const styleTags = document.querySelectorAll("style");

  styleTags.forEach((styleTag) => {
    contents.forEach((content) => {
      if (styleTag.textContent?.includes(content)) {
        styleTag.remove();
      }
    });
  });
};

export const handleDomainUrlForSite = async (supportedLangs: Array<any>, selectedTenant: any, dispatch: any, setSiteMetaData: any, siteMetaData: any) => {
  try {
    let domainUrl;
    const siteMetaDataResp: any = await APIService.getSiteMetaData(selectedTenant.refNum);
    if (siteMetaDataResp.data.status === "success") {
      domainUrl = siteMetaDataResp?.data?.data?.domain;
    }
    const metaData = siteMetaDataResp.data.data;
    metaData["supportedLangs"] = supportedLangs;
    if (siteMetaDataResp.data.data.defaultLanguage) {
      metaData["defaultLang"] = {
        language: siteMetaDataResp.data.data.defaultLanguage.toLowerCase(),
      };
      // set in session storage also
      sessionStorage.setItem(
        "locale",
        JSON.stringify(siteMetaDataResp.data.data.defaultLanguage.toLowerCase())
      );
    }
    if (!Object.keys(siteMetaData).length) {
      dispatch(setSiteMetaData(metaData));
      sessionStorage.setItem("site", JSON.stringify(metaData));
      sessionStorage.setItem("refnum", JSON.stringify(selectedTenant?.refNum));
    }
    return metaData;
  } catch (error) {
    console.error("Error fetching domain URL for site", error);
  }
};
