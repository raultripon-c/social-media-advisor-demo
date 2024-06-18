import React, { useEffect, useRef, useState } from "react";
import { useDynamicMFLoader } from "./useDynamicMFLoader";
import {  useSelector } from "react-redux";
import { AppStore } from "store";
import ReactDOM from 'react-dom';
import { getSelectedApp } from "../layout/dashBoard/utils";
export function AngularAppRenderer() {
  const containerRef = useRef(null);
  const selectedTenant = useSelector(
    (state: AppStore) => state.customer.selectedTenant
  );
  const ref = useRef(null);
 
  const [mountEvents, setMountEvents] = useState(null);
  const loadRemoteModule = async (scope:any, module:any) => {
    await __webpack_init_sharing__('default');
    const container = window[scope];
    await container.init(__webpack_share_scopes__.default);
    const factory = await container.get(module);
    const Module = factory();
    return Module;
  };
//  
    const { ready, failed } = useDynamicMFLoader({
      url: "https://qa3-candidates.phenompeople.com/remoteEntry.js",
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
  const app=getSelectedApp(window.location.pathname);
  const [selectedApp,setSelectedApp]=useState( app);
    
  const loadComponent=()=>{
  const parentDiv = document.querySelector("#child-module-renderer");
  const newElement = document.createElement(selectedApp.component);
  //newElement.textContent = "This is a new child element.";

    // Append the new element to the parent div
    if (parentDiv) {
        parentDiv.appendChild(newElement);
    } 
}
    useEffect(() => {
      loadComponent()
      if(ready){
      
      (async () => {
       const remoteName=selectedApp.remoteName; const exposedModule=selectedApp.module;
        const module = await loadRemoteModule(remoteName, exposedModule);
        if (module.mountEvents) {
          const props = {token: window.keycloakInstance.token,refNum: "WORKUS",subPath:selectedApp.route,userId:window.keycloakInstance.userInfo.userDetails.id};
          console.log("hello",props)

                  module.mountEvents(props);
                  console.log("module.mountEvents",module.mountEvents)    
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
 

  return <div className="crm-events-module" id="child-module-renderer" ref={containerRef}></div>;
};
