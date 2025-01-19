import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AppStore } from "store";
import { Loader } from "@phenom/react-ui-components";
import { loadScriptById, removeElementsById } from "../../utils/helper/utilizer";
import { findAppConfigByRoutes, removeCrmStyles } from "../../utils/appUtils";
import { triggerRefreshToken } from "../../utils/api";
import { APIService } from "../../utils/api.service";
import "./DynamicScriptLoader.css"; 

declare global {
  interface Window {
    txEmbed: any;
  }
}

interface DynamicScriptLoaderProps {
  scriptName: string;
}

const DynamicScriptLoader: React.FunctionComponent<DynamicScriptLoaderProps> = ({ scriptName }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const storeData = useSelector((state: AppStore) => state.customer);

  const fetchedApps = useSelector(
    (state: any) => state.app.allApps || JSON.parse(sessionStorage.getItem("allapps") || "[]")
  );
  const selectedApp =
    findAppConfigByRoutes(fetchedApps, window.location.pathname)?.[0]?.appConfig ||
    JSON.parse(sessionStorage.getItem("selectedApp") || "null")?.appConfig;

  const txeContextToSend = {
    refNum: storeData.selectedTenant.refNum,
    token: window.keycloakInstance.token,
  };

  useEffect(() => {
    const tokenBkp = localStorage.getItem("token");
    localStorage.removeItem("token");

    const loadScript = async () => {
      await triggerRefreshToken();

      const embedScriptId = selectedApp?.scriptId;
      if (document.querySelector(`#${embedScriptId}`)) {
        document.querySelector(`#${embedScriptId}`)?.remove();
      }

      if (!document.querySelector(`#${embedScriptId}`)) {
        const scrElem = document.createElement("script");
        scrElem.id = embedScriptId;
        scrElem.src = selectedApp?.url;
        scrElem.onload = () => initializeModules();
        document.querySelector("head")?.appendChild(scrElem);
      } else {
        initializeModules();
      }
    };

    const initializeModules = () => {
      if (scriptName === "assets" || scriptName === "contenthub") {
        window.txEmbed?.embedCaasModules(
          selectedApp?.embedType,
          "#tools-body-container",
          txeContextToSend,
          cleanupCallback
        );
      } else if (scriptName === "blogs") {
        window.txEmbed?.embedModules("blogs", "#tools-body-container", txeContextToSend, cleanupCallback);
      } else if (scriptName === "banners") {
        APIService.getPluginVersion().then((response) => {
          loadScriptById("canvas-bootstrapper1", response?.data?.data?.script || "");
          window.txEmbed?.embedModules("banners", "#tools-body-container", txeContextToSend, () => {
            cleanupCallback();
            for (let i = 1; i <= 3; i++) {
              setTimeout(deleteCmsLoader, 5000);
            }
          });
        });
      }
    };

    loadScript();

    return () => {
      if (tokenBkp) localStorage.setItem("token", tokenBkp);
    };
  }, [storeData]);

  const deleteCmsLoader = () => {
    document.querySelectorAll("#tools-body-container .ppc-loading").forEach((div) => {
      (div as HTMLElement).style.display = "none";
    });

    const breadcrumbs = document.querySelector("#tools-body-container .tmt-breadcrumbs") as HTMLElement;
    if (breadcrumbs) breadcrumbs.style.display = "none";
  };

  const cleanupCallback = () => {
    setIsLoading(false);
    removeElementsById("crm-stylesheet");
    removeCrmStyles();
  };

  return (
    <div>
      <div id="tools-body-container"></div>
      {isLoading && (
        <div className="child-loading">
          <Loader title="Please Wait, Loading..." />
        </div>
      )}
    </div>
  );
};

export default DynamicScriptLoader;
