import { Loader } from "@phenom/react-ui-components";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { AppStore } from "store";
import { MessageService } from "../MessageService";
import "./AngularApp.scss";
import { useDynamicMFLoader } from "./useDynamicMFLoader";
import { removeStylesBasedOnContents, setObjectReferenceFromString } from "../utils/appUtils";
import CrmStylesRenderer from "./CrmStylesRenderer";

export function AngularAppRenderer(props: any) {
  const containerRef = useRef(null);
  const selectedTenant = useSelector(
    (state: AppStore) => state.customer.selectedTenant
  );
  const [isReady, setReady] = useState(false);
  const ref = useRef(null);
  const approute = props?.selectedApp?.route;
  const { appName, moduleRoute } = props?.selectedApp;
  const appTitle = (props?.selectedAppTitle === 'SMS Templates' || props?.selectedAppTitle === 'Email Templates') ? props.selectedAppTitle : null;

  const [mountEvents, setMountEvents] = useState(null);

  useEffect(() => {
    if (props?.appWindowConfig) {
      const appWindowConfig = JSON.parse(props.appWindowConfig);
        setObjectReferenceFromString(window, appWindowConfig?.keyPath, appWindowConfig?.value);
    }
  }, [props.appWindowConfig]);

  const loadRemoteModule = async (scope: any, module: any) => {
    await __webpack_init_sharing__("default");
    const container = window[scope];
    await container.init(__webpack_share_scopes__.default);
    const factory = await container.get(module);
    const Module = factory();
    return Module;
  };
  //
  const { ready, failed } = useDynamicMFLoader({
    url: props.url,
  });
  const checkCrmScriptIsLoaded = document.getElementById('crm-script');
  if(!checkCrmScriptIsLoaded && props.scope === 'cpui') {
    const element = document.createElement("script");
    element.src = "https://pie-dev-onephenom.phenompro.com/scripts.js";
    element.type = "text/javascript";
    element.async = true;
    element.id = 'crm-script';
    document.head.appendChild(element);
  }

  const cmsStylesToRemove = ["txe-cms-style-main", "txe-cms-style-app"];
  cmsStylesToRemove.forEach((styleId) => {
    const styleElement = document.getElementById(styleId);
    if (styleElement) {
      styleElement.remove();
    }
  });
  // useEffect(() => {

  //   const shadowRoot = containerRef.current.attachShadow({ mode: 'open' });

  //     console.log("rendering events")
  //   ReactDOM.render(<app-events />, shadowRoot);

  //   return () => {
  //     ReactDOM.unmountComponentAtNode(shadowRoot);
  //   };
  // }, []);


  const loadComponent = () => {
    const parentDiv = document.querySelector("#child-module-renderer");
    const appRoot=document.createElement("app-root");
    const newElement = document.createElement(props.component);
    if(appRoot){
      appRoot.appendChild(newElement);
    }
    //newElement.textContent = "This is a new child element.";

    //newElement.textContent = "This is a new child element.";
    // Append the new element to the parent div
    if (parentDiv) {
      parentDiv.appendChild(appRoot);
    }
  };
  async function fetchAndLoadScript() {
    try {
        const response = await fetch(`${(window as any)._env_.CRM_URL}/en/assets-manifest.json`);
        if (!response.ok) {
            throw new Error('Failed to fetch assets manifest');
        }
        const data = await response.json();
  
       const cssUrl = `${(window as any)._env_.CRM_URL}/${data["styles.css"]}`;
        
       const link = document.createElement("link");
       link.rel = "stylesheet";
       link.id = 'crm-stylesheet';
       link.href = cssUrl;
       document.head.appendChild(link);
  
  
    } catch (error) {
        console.error('Error fetching data or loading script:', error);
    }
  }
  useEffect(() => {
    if (!document.getElementById("crm-styles") && props.scope === 'cpui') {
      fetchAndLoadScript();
    }
    loadComponent();
    removeStylesBasedOnContents("https://github.com/h5bp/html5-boilerplate/blob/master/src/css/main.css","assets-management-new-body");
    if (ready) {
      (async () => {
        const scope = props.scope;
        const exposedModule = props.module;
        const module = await loadRemoteModule(scope, exposedModule);
        if (module.mount) {
          const props = {
            token: window.keycloakInstance.token,
            refNum: selectedTenant?.refNum,
            subPath: `/${selectedTenant?.customerCode}/${selectedTenant?.refNum}${approute}`,
            userId: window.keycloakInstance.userInfo.userDetails.id,
            userEmail: window.keycloakInstance.userInfo.userDetails.email,
            appName: appName,
            MessageService:JSON.stringify(MessageService),
            moduleRoute: moduleRoute,
            txeAppHeader: appTitle
          };
          console.log('angular app props',{ props });
          await module.mount(props);
          setReady(true);
        }
        // mountAngularComponent(ref.current, module.YourAngularModule);
      })();
    }
  }, [ready]);
  //     const loadMountEvents = async () => {
  //       var x="cpui/CRMEvents"
  //       const module = await import(x);
  //       setMountEvents(module.mountEvents);

  //       // Use mountEvents here if needed, or use setMountEvents to update state
  //       if (module.mountEvents) {
  //         module.mountEvents();
  //       }
  //     };
  // if(ready){
  //     loadMountEvents();
  // }

  return (
    <div className="page">
      <div
        className="main-page"
        id="child-module-renderer"
        ref={containerRef}
        style={{ display: isReady ? "block" : "none" }}
      ></div>
      { props.scope === 'cpui' && <CrmStylesRenderer />}
      {!isReady && (
        <div className="child-loading">
          <Loader title={"loading"} />
        </div>
      )}
    </div>
  );
}
