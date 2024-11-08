import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { AppStore } from "store";
import { MessageService } from "../MessageService";
import { useDynamicMFLoader } from "./useDynamicMFLoader";
import { removeStylesBasedOnContents, setObjectReferenceFromString } from "../utils/appUtils";
import CrmStylesRenderer from "./CrmStylesRenderer";
import { Loader } from "@phenom/react-ui-components";
import "./AngularApp.scss";

// Extend the Window interface to include __ckeditor__
declare global {
  interface Window {
    __ckeditor__: any;
    CKEDITOR: any;
    __$__: any;
    $: any;
  }
}

export function AngularAppRenderer(props: any) {
  const containerRef = useRef(null);
  const selectedTenant = useSelector((state: AppStore) => state.customer.selectedTenant);
  const approute = props?.selectedApp?.route;
  const { appName, moduleRoute } = props?.selectedApp;
  const appTitle = (props?.selectedAppTitle === 'SMS Manager' || props?.selectedAppTitle === 'Email Manager') ? props.selectedAppTitle : null;
  const [isReady, setReady] = useState(false);

  if (window.__ckeditor__) {
    window.CKEDITOR = window.__ckeditor__;
    window.$ = window.__$__;
  }
  if ((window as any).___prmise___) {
    window.Promise = (window as any).___prmise___;
  }

  // Effect for setting up window object configuration
  useEffect(() => {
    if (props?.appWindowConfig) {
      const appWindowConfig = JSON.parse(props.appWindowConfig);
      setObjectReferenceFromString(window, appWindowConfig?.keyPath, appWindowConfig?.value);
    }
  }, [props.appWindowConfig]);


  // Load the remote module dynamically
  const loadRemoteModule = async (scope: any, module: any) => {
    const container = window[scope];

    if (!container) {
      await __webpack_init_sharing__("default");
      const newContainer = window[scope];
      await newContainer.init(__webpack_share_scopes__.default);
    }

    const factory = await window[scope].get(module);
    return factory();
  };

  // Load dynamic module script
  const { ready, failed } = useDynamicMFLoader({ url: props.url });

  // Check if CRM script is loaded, if not, load it
  useEffect(() => {
    if (props.scope === 'cpui' && !document.getElementById('crm-script')) {
      const scriptElement = document.createElement("script");
      scriptElement.src = "https://pie-dev-onephenom.phenompro.com/scripts.js";
      scriptElement.type = "text/javascript";
      scriptElement.async = true;
      scriptElement.id = 'crm-script';
      document.head.appendChild(scriptElement);
    }

    // Clean up the CRM styles
    const cmsStylesToRemove = ["txe-cms-style-main", "txe-cms-style-app"];
    cmsStylesToRemove.forEach((styleId) => {
      const styleElement = document.getElementById(styleId);
      if (styleElement) styleElement.remove();
    });

    // Cleanup function: Remove script and styles
    return () => {
      const scriptElement = document.getElementById('crm-script');
      if (scriptElement) document.head.removeChild(scriptElement);
    };
  }, [props.scope]);

  // Fetch and load the CRM script and its associated CSS
  const fetchAndLoadScript = async () => {
    try {
      const response = await fetch(`${(window as any)._env_.CRM_URL}/en/assets-manifest.json`);
      if (!response.ok) throw new Error('Failed to fetch assets manifest');

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
  };

  // Load the Angular component
  const loadComponent = () => {
    const parentDiv = document.querySelector("#child-module-renderer");
    const appRoot = document.createElement("app-root");
    const newElement = document.createElement(props.component);

    appRoot?.appendChild(newElement);
    parentDiv?.appendChild(appRoot);
  };

  // Handle module mounting after script loading
  useEffect(() => {
    if (ready) {
      if (!document.getElementById("crm-styles") && props.scope === 'cpui') {
        fetchAndLoadScript();
      }
      removeStylesBasedOnContents(["https://github.com/h5bp/html5-boilerplate/blob/master/src/css/main.css", "assets-management-new-body"]);
      loadComponent();
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
            MessageService: JSON.stringify(MessageService),
            moduleRoute: moduleRoute,
            txeAppHeader: appTitle
          };
          console.log('angular app props', { props });
          await module.mount(props);
          setReady(true);
        }
      })();
    }
    return () => {
      window.__ckeditor__ = window.CKEDITOR;
      window.__$__ = window.$;
    };
  }, [ready]);

  return (
    <div className="page">
      <div
        className="main-page"
        id="child-module-renderer"
        ref={containerRef}
        style={{ display: isReady ? "block" : "none" }}
      ></div>

      {props.scope === 'cpui' && <CrmStylesRenderer />}

      {!isReady && (
        <div className="child-loading">
          <Loader title={"loading"} />
        </div>
      )}
    </div>
  );
}