import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AppStore } from "store";
import { Loader } from "@phenom/react-ui-components";
import { removeElementsById } from "../../utils/helper/utilizer";
import './Assets.css';
import { findAppConfigByRoutes, removeCrmStyles } from "../../utils/appUtils";
import { triggerRefreshToken } from "../../utils/api";

declare global {
    interface Window {
        txEmbed: any;
    }
}

const Assets = () => {
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

    useEffect(() => {
      const tokenBkp = localStorage.getItem("token");
      localStorage.removeItem("token");
      const fetchData = async () => {
        await triggerRefreshToken();
        const embedScriptId = selectedApp?.scriptId;
        const existsScrElem = document.querySelector(`#${embedScriptId}`);
        if(existsScrElem) {
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
            if (window.txEmbed && window.txEmbed.embedCaasModules) {
              window.txEmbed.embedCaasModules(
                "assets",
                "#tools-body-container",
                {
                  refNum: storeData.selectedTenant.refNum,
                  token: window.keycloakInstance.token,
                },
                () => {
                  setIsLoading(false);
                  removeElementsById("crm-stylesheet");
                  removeCrmStyles();
                }
              );
            }
          });
        }
      }
      fetchData();
      return () => {
        tokenBkp && localStorage.setItem("token", tokenBkp);
      }
    }, [storeData]);

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

export default Assets;
