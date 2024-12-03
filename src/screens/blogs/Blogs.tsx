import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AppStore } from "store";
import { Loader } from "@phenom/react-ui-components";
import { removeElementsById } from "../../utils/helper/utilizer";
import { removeCrmStyles } from "../../utils/appUtils";

declare global {
    interface Window {
        txEmbed: any;
    }
}
const loadStylesAndScripts = () => {
  // Function to add styles and scripts
  // const addResource = (tag: string, attributes: { [x: string]: any; rel?: string; href?: string; src?: string; }, parent = document.head) => {
  //   const element = document.createElement(tag);
  //   Object.keys(attributes).forEach(key => element.setAttribute(key, attributes[key]));
  //   parent.appendChild(element);
  //   return element;
  // };

  // // Load styles
  // const flatpickrStyles = addResource("link", {
  //   rel: "stylesheet",
  //   href: "https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css",
  // });

  // // Load script
  // const flatpickrScript = addResource("script", {
  //   src: "https://cdn.jsdelivr.net/npm/flatpickr",
  // }, document.body);

  // return { flatpickrStyles, flatpickrScript };
};

// const removeStylesAndScripts = (resources: any) => {
//   // Remove styles and scripts
//   if (resources.flatpickrStyles) {
//     resources.flatpickrStyles.remove();
//   }
//   if (resources.flatpickrScript) {
//     resources.flatpickrScript.remove();
//   }
// };


const Blogs = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const storeData = useSelector((state: AppStore) => state.customer);
    
    const selectedModuleAppObject = useSelector((state: any) => {
        const selectedAppFromSession = JSON.parse(
          sessionStorage.getItem("selectedApp") || "null"
        );
        return selectedAppFromSession || state.app?.selectedApp;
      });
    var selectedApp = selectedModuleAppObject?.appConfig || {};
    (window as any).isCmsModule = true;

    useEffect(() => {
        const resources = loadStylesAndScripts();
        const embedScriptId = selectedApp?.scriptId;
        const existsScrElem = document.querySelector(`#${embedScriptId}`);
        if(existsScrElem) {
            existsScrElem.remove();
        }

        const loadScript = () => {
            return new Promise<void>((resolve) => {
                if (!existsScrElem) {
                    const scrElem = document.createElement("script");
                    scrElem.id = embedScriptId;
                    // scrElem.src = 'https://cmsqa1.phenompro.com:9000/embed.js';
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
            if (window.txEmbed) {
              window.txEmbed.embedModules(
                "blogs",
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
        return () => { 
        }
    }, [storeData]);
    return (
        <div style={{ height: "100%"}}>
          {isLoading && (
                <div>
                    <Loader title="Please Wait, Loading..." />
                </div>
            )}
            <div id="tools-body-container" style={{ height: "100%" }}></div>
        </div>
    );
}
export default Blogs;