import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { ReactAppRenderer } from "./ReactAppRenderer";
import {AngularAppRenderer} from "./AngularAppRenderer";

import { AppStore } from "store";

export const RemoteModuleRenderer = () => {


  const selectedTenant = useSelector(
    (state: AppStore) => state.customer.selectedTenant
  );

  const { data, user, allTenants, customerTenants } = useSelector(
    (state: AppStore) => state.customer
  );

  const APP_ENV = (window as any)._env_.APP_ENV;
  const selectedModuleAppObject = useSelector((state: any) => {
    const selectedAppFromSession = JSON.parse(
      sessionStorage.getItem("selectedApp") || "null"
    );
    return selectedAppFromSession || state.app?.selectedApp;
  });
  var selectedApp = selectedModuleAppObject?.appConfig || {};
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [moduleProps, setModuleProps] = useState(selectedApp.props);

  useEffect(() => {
    setModuleProps((prevModuleProps: any) => {
      let updatedProps = {
        ...prevModuleProps,
        refNum: selectedTenant?.refNum,
        customerCode: selectedTenant?.customerCode,
        env: APP_ENV,
        parentApp: "hrit",
        selectedApp: selectedModuleAppObject,
        customerRegion: data?.dcRegion || "US",
        logedUserRoles: user,
        selectedCustomerDetails: data,
        selectedTenants: selectedTenant,
        totalTenants: allTenants,
        totalCustomerTenants: customerTenants,
        workflow: {
          workflowId: "5026f8a0-0352-4100-b620-8339ee9b8f5e",
        },
      };

      if (selectedApp.isMfProduct) {
        if (!window.location.hostname.includes("localhost")) {
          updatedProps.subPath = ""; 

          if (selectedModuleAppObject?.context === "tenant") {
            updatedProps.subPath = `/${selectedTenant?.customerCode}`;
          }
        } else if (selectedModuleAppObject?.context === "tenant") {
          updatedProps.subPath = selectedTenant?.customerCode;
        }
      }

      return updatedProps;
    });
  }, [selectedTenant]);
  const [key, setKey] = useState(0); // Initialize key state

  useEffect(() => {
    // Update key whenever subPath or refNum changes
    setKey((prevKey) => prevKey + 1);
  }, [moduleProps?.subPath, moduleProps?.refNum]);
  const getSelectedAppUrl = (selectedApp: any, isEnvconfig: boolean) => {
    let overriding = sessionStorage.getItem("overriding");
    if (APP_ENV?.toUpperCase() !== "QA" || !overriding) {
      return null;
    }

    let sessionAppUrl = sessionStorage.getItem(selectedModuleAppObject?.name);
    if (sessionAppUrl && !isEnvconfig) {
      return sessionAppUrl;
    } else if (sessionAppUrl && isEnvconfig) {
      // Create URL objects
      const baseUrlObject = new URL(sessionAppUrl);
      const urlObject = new URL(selectedApp.envconfig);

      // Get the pathname from the provided URL
      const pathname = urlObject.pathname;

      // Construct the target URL by replacing the pathname with the base URL's pathname
      const targetUrl = baseUrlObject.origin + pathname;
      return targetUrl;
    }
    return null;
  };
  return (
    <div>
      <div>
        {selectedModuleAppObject.framework === "REACT" && (
          <ReactAppRenderer
            module={selectedApp.module}
            component={selectedApp.component}
            url={getSelectedAppUrl(selectedApp, false) || selectedApp.url}
            scope={selectedApp.scope}
            props={moduleProps}
            loading={selectedApp.loadingMessage}
            envconfig={
              getSelectedAppUrl(selectedApp, true) || selectedApp.envconfig
            }
            key={key}
          />
        )}
        {selectedModuleAppObject.framework == "ANGULAR" && (
          <AngularAppRenderer
          remoteName="cpui" exposedModule="./CRMEvents" url="https://localhost:8080/remoteEntry.js" selectedApp={selectedApp}
          />
        )}
      </div>
    </div>
  );
};
