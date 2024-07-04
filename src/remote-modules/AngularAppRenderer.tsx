import React, { useEffect, useRef, useState, Suspense } from "react";
import { useSelector } from "react-redux";
import { AppStore } from "store";
import { Loader } from "@phenom/react-ui-components";
import { getSelectedApp } from "../layout/dashBoard/utils";
import { useDynamicMFLoader } from "./useDynamicMFLoader";
import "./AngularApp.scss";

export function AngularAppRenderer(props: any) {
  const containerRef = useRef(null);
  console.log({ props });
  const selectedTenant = useSelector(
    (state: AppStore) => state.customer.selectedTenant
  );
  const ref = useRef(null);
  const approute=props?.selectedApp?.route;
  const [mountEvents, setMountEvents] = useState(null);
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
  const element = document.createElement("script");
  element.src = "https://pie-dev-onephenom.phenompro.com/scripts.js";
  element.type = "text/javascript";
  element.async = true;
  document.head.appendChild(element);
  // useEffect(() => {

  //   const shadowRoot = containerRef.current.attachShadow({ mode: 'open' });

  //     console.log("rendering events")
  //   ReactDOM.render(<app-events />, shadowRoot);

  //   return () => {
  //     ReactDOM.unmountComponentAtNode(shadowRoot);
  //   };
  // }, []);
  const app = getSelectedApp(window.location.pathname);
  const [selectedApp, setSelectedApp] = useState(app);

  const loadComponent = () => {
    const parentDiv = document.querySelector("#child-module-renderer");
    const newElement = document.createElement(props.component);
    //newElement.textContent = "This is a new child element.";

    //newElement.textContent = "This is a new child element.";
    // Append the new element to the parent div
    if (parentDiv) {
      parentDiv.appendChild(newElement);
    }
  };
  useEffect(() => {
    loadComponent();
    if (ready) {
      (async () => {
        const scope = props.scope;
        const exposedModule = props.module;
        const module = await loadRemoteModule(scope, exposedModule);
        if (module.mount) {
          const props = {
            token: window.keycloakInstance.token,
            refNum: selectedTenant?.refNum,
            subPath: `/${selectedTenant.customerCode}/${selectedTenant.refNum}${approute}`,
            userId: window.keycloakInstance.userInfo.userDetails.id,
          };
          module.mount(props);
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
    <>
      {ready ? (
        <Suspense
          fallback={
            <div className="child-loading">
              <Loader title={"loading"} />
            </div>
          }
        >
          <div
            className="crm-events-module"
            id="child-module-renderer"
            ref={containerRef}
          ></div>
        </Suspense>
      ) : (
        <div className="child-loading">
          <Loader title={"loading"} />
        </div>
      )}
    </>
  );
}