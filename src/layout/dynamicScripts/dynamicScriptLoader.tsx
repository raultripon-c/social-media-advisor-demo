import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import store, { AppStore } from "store";
import { Loader } from "@phenom/react-ui-components";
import { removeElementsById } from "../../utils/helper/utilizer";
import { removeCrmStyles } from "../../utils/appUtils";

declare global {
  interface Window {
    txEmbed: any;
  }
}

const ContentHub: React.FC = () => {
  removeCrmStyles();
  (window as any).isCmsModule = true;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const storeData = useSelector((state: AppStore) => state.customer);
  const selectedModuleAppObject = useSelector((state: any) => {
    const selectedAppFromSession = JSON.parse(
      sessionStorage.getItem("selectedApp") || "null"
    );
    return selectedAppFromSession || state.app?.selectedApp;
  });
  var selectedApp = selectedModuleAppObject?.appConfig || {};

  useEffect(() => {
    const embedScriptId = selectedApp?.scriptId;
    const existsScrElem = document.querySelector(`#${embedScriptId}`);

    const loadScript = () => {
      return new Promise<void>((resolve) => {
        if (!existsScrElem) {
          const scrElem = document.createElement("script");
          scrElem.id = embedScriptId;
          // scrElem.src = 'https://localhost:9000/embed.js';
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

      // This is to ensure embed script are not loaded multiple times
      // This approach may be enhanced in the future
      // For now retuning from here
      // if(Object.keys(storeData.siteMetaData)) {
      //   return;
      // }

      removeElementsById('crm-stylesheet');
      loadScript().then(() => {
        if (window.txEmbed) {
          window.txEmbed.embedModules(
            selectedApp?.embedType,
            "#tools-body-container",
            {
              refNum: storeData.selectedTenant.refNum,
              token: window.keycloakInstance.token,
            },
            () => {
              setIsLoading(false);
            }
          );
        }
      });
    }
  }, [storeData]);

  return (
    <div>
      <div id="tools-body-container"></div>
      {isLoading && (
        <div>
          <Loader title="Please Wait, Loading..." />
        </div>
      )}
    </div>
  );
};

export default ContentHub;
