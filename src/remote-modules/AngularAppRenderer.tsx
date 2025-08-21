import React, { useEffect, useRef, useState } from "react";
import { Loader } from "@phenom/react-ui-components";
import { MessageService } from "../MessageService";
import { removeStyles, removeStylesBasedOnContents, restoreStyles } from "../utils/appUtils";
import CrmStylesRenderer from "./CrmStylesRenderer";
import "./AngularApp.scss";
import { CommonConstants } from "../utils/common-constants";

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
  let removedStyles: any[] = [];
  let selectedTenant = JSON.parse(localStorage.getItem("selectedTenant") || "[]");
  const moduleRoute = props?.moduleRoute;
  const [isReady, setReady] = useState(false);
  const [isComponentLoaded, setComponentLoaded] = useState(false);
  const [isRemoteEntryFileReady, setRemoteEntryFileReady] = useState(false);
  const [isInteractionBlocked, setIsInteractionBlocked] = useState(true);

  useEffect(() => {
    // Block interaction on the service-tools-app-body div
    const appBody = document.querySelector('.service-tools-app-body');
    if (appBody instanceof HTMLElement) {
      appBody.style.pointerEvents = 'none';
    }

    return () => {
      // Cleanup: restore pointer events when component unmounts
      if (appBody instanceof HTMLElement) {
        appBody.style.pointerEvents = 'auto';
      }
    };
  }, []);

  useEffect(() => {
    // Update pointer events whenever blocking state changes
    const appBody = document.querySelector('.service-tools-app-body');
    if (appBody instanceof HTMLElement) {
      appBody.style.pointerEvents = isInteractionBlocked ? 'none' : 'auto';
    }
  }, [isInteractionBlocked]);

  useEffect(() => {
    setComponentLoaded(false);
    const isScriptAlreadyDownloaded = (scriptSrc: string) => {
      const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);
      return existingScript !== null;
    };
    if(isScriptAlreadyDownloaded(props.url)) {
      setRemoteEntryFileReady(true);
    } else {
      const scriptElement = document.createElement("script");
      scriptElement.src = props.url;
      scriptElement.type = "text/javascript";
      scriptElement.async = true;
      scriptElement.onload = () => {
        setRemoteEntryFileReady(true);
      }
      document.head.appendChild(scriptElement);
    }

  }, [props?.url])

  if (window.__ckeditor__) {
    window.CKEDITOR = window.__ckeditor__;
    window.$ = window.__$__;
  }
  if ((window as any).___prmise___) {
    window.Promise = (window as any).___prmise___;
  }

  // Load the remote module dynamically
  const loadRemoteModule = async (scope: any, module: any) => {
    const container = window[scope];

    if (!container) {
      await __webpack_init_sharing__("default");
      const newContainer = window[scope];
      await newContainer.init(__webpack_share_scopes__.default);
    } else {
      (window as any)[`${scope}_exports`] = (window as any).__webpack_exports__;
      (window as any)[`${scope}_require`] = (window as any).__webpack_require__;
      (window as any)[`${scope}_modules`] = (window as any).__webpack_modules__;
      (window as any)[`${scope}_module_cache`] = (window as any).__webpack_module_cache__;
    }

    const factory = await window[scope].get(module);
    return factory();
  };

  // Check if CRM script is loaded, if not, load it
  useEffect(() => {
    console.log('added for scope', props.scope);
    if((window as any)[`${props.scope}_exports`]) {
      (window as any).__webpack_exports__ = (window as any)[`${props.scope}_exports`];
      (window as any).__webpack_require__ = (window as any)[`${props.scope}_require`];
      (window as any).__webpack_modules__ = (window as any)[`${props.scope}_modules`];
      (window as any).__webpack_module_cache__ = (window as any)[`${props.scope}_module_cache`];
    }
    if (props.scope === 'cpui' && !document.getElementById('crm-script')) {
      const scriptElement = document.createElement("script");
      scriptElement.src = "https://pie-dev-onephenom.phenompro.com/scripts.js";
      scriptElement.type = "text/javascript";
      scriptElement.async = true;
      scriptElement.id = 'crm-script';
      document.head.appendChild(scriptElement);
    }

    // Clean up the CRM styles
    const cmsStylesToRemove = ["txe-cms-style-main", "txe-cms-style-app", "ckEditor"];
    cmsStylesToRemove.forEach((styleId) => {
      const styleElement = document.getElementById(styleId);
      if (styleElement) styleElement.remove();
    });
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
    const existingAppRoot = parentDiv?.querySelector("app-root") as HTMLElement;
    if (existingAppRoot) {
      existingAppRoot.remove();
    }
    const appRoot=document.createElement("app-root");
    const newElement = document.createElement(props?.component);
    if(appRoot){
      appRoot.appendChild(newElement);
    }
    if (parentDiv) {
      parentDiv.appendChild(appRoot);
    }
  };

  // Handle module mounting after script loading
  useEffect(() => {
    if (isRemoteEntryFileReady) {
      setRemoteEntryFileReady(false);
      let stylesToBeRemoved = [
        "https://github.com/h5bp/html5-boilerplate/blob/master/src/css/main.css",
        "assets-management-new-body",
      ];
      if (props.scope && props.scope === "chatbotManagementDashboard") {
        removedStyles = removeStyles();
        stylesToBeRemoved = [...stylesToBeRemoved, "cmsWebFont"];
      }
      removeStylesBasedOnContents(stylesToBeRemoved);
      loadComponent();
      (async () => {
        const scope = props.scope;
        const exposedModule = props.module;
        const module = await loadRemoteModule(scope, exposedModule);

        if (module.mount) {
          const props = {
            token: window.keycloakInstance.token,
            refNum: selectedTenant?.refNum,
            subPath: `/${selectedTenant?.customerCode}/${selectedTenant?.refNum}`,
            userId: window.keycloakInstance.userInfo.userDetails.id,
            userEmail: window.keycloakInstance.userInfo.userDetails.email,
            MessageService: JSON.stringify(MessageService),
            moduleRoute: moduleRoute,
            companyName: selectedTenant?.tenantName,
          };
          console.log("angular app props", { props });
          await module.mount(props);

          // Set a 5 second timeout to unblock interaction
          const timeoutId = setTimeout(() => {
            setIsInteractionBlocked(false);
          }, 10000);

          if (scope === "cpui") {
            (window as any).document.getElementById('child-module-renderer').addEventListener("crmModuleAvailable", () => {
              console.log("crm module available");
              (window as any).__OPENREPLAY__?.event("CRM component loaded successfully", {
                message: "Component loaded successfully!",
              });
              setComponentLoaded(true);
              setIsInteractionBlocked(false);
              clearTimeout(timeoutId);
            });
          } else {
            (window as any).document.getElementById('child-module-renderer').addEventListener("AnalyticsModuleAvailable", () => {
              const mfeRoot = document.querySelector("app-root-mfe");

              console.log("analytics module available", mfeRoot);

              if (mfeRoot) {
                const observer = new MutationObserver(() => {
                  mfeRoot.querySelectorAll("img").forEach((img) => {
                    if (img.src.includes("/assets/images")) {
                      img.src = img.src.replace(
                        /^(.*?)\/assets\/images/,
                        `${(window as any)._env_.ANALYTICS_URL}/assets/images`
                      );
                    }
                  });
                });

                observer.observe(mfeRoot, { childList: true, subtree: true });
              }

              (window as any).__OPENREPLAY__?.event("Anlaytics Module available");
              setComponentLoaded(true);
              setIsInteractionBlocked(false);
              clearTimeout(timeoutId);
            });
          }
        }
      })();
    }
    return () => {
      window.__ckeditor__ = window.CKEDITOR;
      window.__$__ = window.$;
      removedStyles && restoreStyles(removedStyles);
      setReady(false);
      setIsInteractionBlocked(true);
    };
  }, [isRemoteEntryFileReady]);

  return (
    <>
      <div
        id="child-module-renderer"
        style={{
          display: isComponentLoaded ? "block" : "none"
        }}
      ></div>

      {props.scope === 'cpui' && <CrmStylesRenderer />}

      {!isComponentLoaded && (
        <div className="child-loading">
          <Loader title={"loading"} />
        </div>
      )}
    </>
  );
}