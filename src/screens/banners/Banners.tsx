import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AppStore } from "store";
import { Loader } from "@phenom/react-ui-components";
import {
  removeElementsById,
  loadScriptById,
} from "../../utils/helper/utilizer";
import { findAppConfigByRoutes, removeCrmStyles } from "../../utils/appUtils";
import { APIService } from "../../utils/api.service";
import { triggerRefreshToken } from "../../utils/api";

declare global {
  interface Window {
    txEmbed: any;
  }
}
const Banners = () => {
  (window as any).isCmsModule = true;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const storeData = useSelector((state: AppStore) => state.customer);
  const selectedModuleAppObject = useSelector((state: any) => {
    const selectedAppFromSession = JSON.parse(
      sessionStorage.getItem("selectedApp") || "null"
    );
    return selectedAppFromSession || state.app?.selectedApp;
  });
  let fetchedApps = useSelector((state: any) => state.app.allApps);
  if(!fetchedApps || fetchedApps.length === 0) {
    fetchedApps = JSON.parse(sessionStorage.getItem("allapps") || "[]");
  }
  let detailsApp = fetchedApps && fetchedApps.length && findAppConfigByRoutes(fetchedApps, window.location.pathname)[0];
  var selectedApp = detailsApp?.appConfig ?? selectedModuleAppObject?.appConfig;

  // TODO: Will remove this in future
  const deleteCmsLoader = () => {
    const targetLoaderDiv = document.querySelector("#tools-body-container");
    if (targetLoaderDiv) {
      const loaderDiv = targetLoaderDiv.querySelectorAll(".ppc-loading");
      loaderDiv.forEach((div) => {
        (div as HTMLElement).style.display = "none";
      });
      const breadcrumbs: HTMLElement | null = targetLoaderDiv.querySelector(".tmt-breadcrumbs");
      if (breadcrumbs) {
        breadcrumbs.style.display = "none";
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await triggerRefreshToken();
      const embedScriptId = selectedApp?.scriptId;
      const existsScrElem = document.querySelector(`#${embedScriptId}`);
      if (existsScrElem) {
        existsScrElem.remove();
      }

      const loadScript = () => {
        return new Promise<void>((resolve) => {
          const existsScrElem = document.querySelector(`#${embedScriptId}`);
          if (!existsScrElem) {
            const scrElem = document.createElement("script");
            scrElem.id = embedScriptId;
            scrElem.src = selectedApp?.url;
            scrElem.onload = () => {
              resolve();
            };
            document.querySelector("head")?.appendChild(scrElem);
          } else {
            resolve();
          }
        });
      };

      if (
        storeData &&
        storeData.selectedTenant &&
        storeData.selectedTenant.refNum
      ) {
        loadScript().then(() => {
          APIService.getPluginVersion().then((response) => {
            const scriptUrl: string = response?.data?.data?.script || "";
            loadScriptById(
              "canvas-bootstrapper1",
              scriptUrl
            );
            if (window.txEmbed && window.txEmbed.embedModules) {
              window.txEmbed.embedModules(
                "banners",
                "#tools-body-container",
                {
                  refNum: storeData.selectedTenant.refNum,
                  token: window.keycloakInstance.token,
                },
                () => {
                  setIsLoading(false);
                  removeElementsById("crm-stylesheet");
                  removeCrmStyles();
                  // Will remove this in future
                  for (let i = 1; i <= 3; i++) {
                    setTimeout(() => {
                      deleteCmsLoader();
                    }, 5000);
                  }
                }
              );
            }
          });
        });
      }
    }
    fetchData();
  }, [storeData]);
  return (
    <div>
      {isLoading && (
        <div className="child-loading">
          <Loader title="Please Wait, Loading..." />
        </div>
      )}
      <div id="tools-body-container"></div>
    </div>
  );
};
export default Banners;
