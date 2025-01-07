import React, { Suspense, useEffect } from "react";
import { Route, useNavigate } from "react-router";

import { Loader } from "@phenom/react-ui-components";
import { GenericErrorBoundary } from "../components/ErrorBoundary/GenericErrorBoundary";
import UnAuthorizedPage from "../components/UnAuthorizedPage/UnAuthorizedPage";
import { ErrorBoundary } from "./error-component/ErrorBoundary";
import { useDynamicMFLoader } from "./useDynamicMFLoader";

import "./error-component/ErrorBoundary.scss";

interface Props {
  url: any;
  scope: string;
  module: string;
  component: string;
  style?: boolean;
  loading?: string;
  props?: any;
  envconfig: string;
  moduleRoute: string;
}
function loadComponent(scope: any, module: any, component: any) {

  return async () => {
   try{
    // Initializes the share scope. This fills it with known provided modules from this build and all remotes
    await __webpack_init_sharing__("default");
    const container = window[scope]; // or get the container somewhere else
    // Initialize the container, it may provide shared modules
  
    await container.init(__webpack_share_scopes__.default);
    
    const factory = await window[scope].get(module);
    const Module = factory();
    // making given component as default
    // return { default: Module[component] };
    if (Module.default) {
      return Module;
    } else {
      return { default: Module[component] };
    }
   }catch(e){
    console.log("error while loading remote module ", module,e)
   }
  };
  
}
export function ReactAppRenderer(props: Props) {
 
  useEffect(() => {
    handleBackNavigation();
  }, []);
  
  const loadEnvs = (fileName: any) => {
    const isEnvConfigAlreadyLoaded = (scriptSrc: string) => {
      // Check if a script with the specified source already exists
      const existingScript = document.querySelector(
        `script[src="${scriptSrc}"]`
      );
      // If the script exists, return true
      return !!existingScript;
    };

    if (props.module && !isEnvConfigAlreadyLoaded(fileName)) {
      const script = document.createElement("script");
      script.src = fileName;
      document.body.appendChild(script);
    }
  };

  // Assuming `props` is available in the current scope
  loadEnvs(props.envconfig);
 
  const navigate = useNavigate();
  let RemoteComponent = undefined;
  const { ready, failed } = useDynamicMFLoader({
    url: props.module && props.url,
  });


  if (!props.module) {
    return <p>Failed to Load Application </p>;
  }
  if (failed) {
    return (
      <>
        <Route component={UnAuthorizedPage} />
      </>
    );
  }

  RemoteComponent = React.lazy(
    loadComponent(props.scope, props.module, props.component)
  );

  const handleBackNavigation = () => {
    localStorage.setItem("allowBackNavigation", "true");
    (function () {
      // Hook into replaceState
      const originalReplaceState = history.replaceState;
      history.replaceState = function (...args) {
        const isBackAllowed = localStorage.getItem("allowBackNavigation");
        if(isBackAllowed && isBackAllowed == "true") {
          localStorage.setItem("allowBackNavigation", "false");
          console.log('URL changed via replaceState:', args);
          setTimeout(() => {
              localStorage.setItem("allowBackNavigation", "true");
          }, 1000);
          return originalReplaceState.apply(this, args);
          
        }
        else {
            setTimeout(() => {
                localStorage.setItem("allowBackNavigation", "true");
            }, 1000);
            return function(){};
        }
        
      };
    
      window.addEventListener('popstate', (event) => {
      console.log('URL changed via popstate:', event);
      localStorage.setItem("allowBackNavigation", "false");
    });
    })();
    
    
  }
  return (
    <>
      {ready ? (
        <GenericErrorBoundary
          errorComponent={
            <div>
              <ErrorBoundary navigate={navigate} />
            </div>
          }
        >
          <Suspense
            fallback={
              <div className="child-loading">
                <Loader title={props.loading} />
              </div>
            }
          >
            <div
              style={{
                height: props.style ? "calc(100vh - 48px)" : "100%",
              }}
            >
              <RemoteComponent {...props.props} />
            </div>
          </Suspense>
         </GenericErrorBoundary>
      ) : (
        <div className="child-loading">
          <Loader title={props.loading} />
        </div>
      )}
    </>
  );
}

export { GenericErrorBoundary };
