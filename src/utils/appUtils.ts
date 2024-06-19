import moment from "moment";
import { toast } from "react-toastify";
import { isEmpty } from "lodash";

import { RemoteModuleRenderer } from "../remote-modules/RemoteModuleRenderer";

import { DATE_FORMAT, navigationHeaderApps, noShowSideBar } from "./constants";

export const appSelectionHandler = (
  selectedApp: any,
  navigate: any,
  customerCode: string,
  refNum: string
) => {
  let appType = selectedApp.appType;
  const mfRoute = selectedApp.appConfig?.route;
  const routeWithoutRefNum = mfRoute?.replace("/:refnum", "");
  let updatedRoute = "";
  if (!selectedApp) {
    navigate(customerCode ? `${customerCode}/summary` : "/");
    return;
  }
  if (selectedApp.context == "customer") {
    !sessionStorage.getItem("currentContext") &&
      sessionStorage.setItem("currentContext", "customer");
    updatedRoute = customerCode;
  } else if (selectedApp.context == "tenant") {
    !sessionStorage.getItem("currentContext") &&
      sessionStorage.setItem("currentContext", "tenant");
    updatedRoute = `${customerCode}/${refNum}`;
  }
  switch (appType) {
    case "module-federation":
      selectedApp &&
        sessionStorage.setItem("selectedApp", JSON.stringify(selectedApp));
      if (isEmpty(updatedRoute) && selectedApp?.context !== "platform") {
        sessionStorage.removeItem("selectedApp");
      }
      navigate(
        !isEmpty(updatedRoute)
          ? `/${updatedRoute}${routeWithoutRefNum}`
          : `${routeWithoutRefNum}`
      );
      break;
    case "external":
      const link = selectedApp.appConfig?.link;
      if (link && !isEmpty(link)) window.open(link, "_blank");
      else {
        toast.dismiss();
        toast.error("Link is not provided for navigation");
      }
      break;
    case "script":
      navigate(
        !isEmpty(updatedRoute)
          ? `/${updatedRoute}${routeWithoutRefNum}`
          : `${routeWithoutRefNum}`
      );
      break;
    default:
      navigate("/");
      sessionStorage.removeItem("currentContext");
      break;
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
        isOpen: false,
        parentName: item.parentName,
        order: item.order,
      };
    });

  const sortAppsByOrder = (apps: any[]) => {
    let newApps = apps.sort((a, b) => a.order - b.order);
    return newApps;
  };

  const customerTenantApps = categoryMap
    .map((item: any) => {
      const filteredApps = data?.filter((app: any) => {
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

  const mainData = {
    customerTenantApps: sortAppsByOrder(customerTenantApps),
    platformApps: sortAppsByOrder(platformApps),
  };
  return mainData;
};
export const getMfRoutes = (data: any) => {
  const mfRoutes = data
    .filter(
      ({ appType }: { appType: string }) => appType === "module-federation"
    )
    .flatMap(
      ({
        context,
        appConfig,
      }: {
        context: string;
        appConfig: { route: string };
      }) => {
        const { route } = appConfig;
        let updatedPath: string;

        if (context === "tenant") {
          updatedPath = `/:customerCode/:refNum${route}`;
        } else if (context === "customer") {
          updatedPath = `/:customerCode${route}`;
        } else {
          updatedPath = route;
        }

        return [
          { path: updatedPath, component: RemoteModuleRenderer },
          { path: `${updatedPath}/*`, component: RemoteModuleRenderer },
        ];
      }
    );
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
export const lastWeekDate = () => {
  return moment().subtract(7, "days").format(DATE_FORMAT);
};
export const navigateToNewTab = (url: string) => {
  return window.open(url, "_blank");
};

export function findAppConfigByRoutes(apps: any, value: string): any {
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
