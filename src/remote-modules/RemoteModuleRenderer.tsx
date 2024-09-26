import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { ReactAppRenderer } from "./ReactAppRenderer";
import { AngularAppRenderer } from "./AngularAppRenderer";

import { AppStore } from "store";
import { appSelectionHandler, getAppByName } from "../utils/appUtils";
import { setAppDetails } from "../store/apps/actions";
import { MessageService } from "../MessageService";

export const RemoteModuleRenderer = () => {
  const selectedTenant = useSelector(
    (state: AppStore) => state.customer.selectedTenant
  );

  const { data, user, allTenants, customerTenants } = useSelector(
    (state: AppStore) => state.customer
  );  

  useEffect(()=>{
    (window as any).TXEMessageService=MessageService;
  },[])
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

  const fetchedApps = useSelector((state: any) => state.app.allApps);
  const allEvents = fetchedApps.reduce(
    (acc: any, app: any) => {
      const { id, events } = app;
      if (events?.inputs) {
        const appInputs = events.inputs.map((input: any) => input);
        if (!acc.inputs[id]) {
          acc.inputs[id] = [];
        }
        acc.inputs[id].push(...appInputs);
      }
      if (events?.outputs) {
        if (!acc.outputs[id]) {
          acc.outputs[id] = [];
        }
        acc.outputs[id].push(...events.outputs);
      }
      return acc;
    },
    { inputs: {}, outputs: {} } // Changed outputs to an object
  );
  const emitEventsToChildApps = (output: any, currentEventData: any) => {
    Object.keys(allEvents?.inputs).forEach((app) => {
      const appInputs = allEvents.inputs[app];
      appInputs.forEach((input: any) => {
        if (input === output) {
          console.log(
            "Output matched with input, dispatching event...",
            app + "_" + input,
            currentEventData
          );
          MessageService.dispatchEvent(app + "_" + input, currentEventData);
        }
      });
    });
  };
  const handleOutputs = (
    output: any,
    eventData: any,
    currentEventData: any
  ) => {
    switch (output) {
      case "NAVIGATE":
        console.log("navigating to other app", eventData?.appName);
        const navigatingApp = getAppByName(fetchedApps, eventData.appName);
        navigatingApp &&
          sessionStorage.setItem("selectedApp", JSON.stringify(navigatingApp));
        dispatch(setAppDetails(navigatingApp));
        appSelectionHandler(
          navigatingApp,
          navigate,
          selectedTenant?.customerCode,
          selectedTenant?.refNum
        );
        break;
      //add any other cases which has to be handled parent level
      default:
        console.log("Unhandled event at parent level:", eventData);
        emitEventsToChildApps(output, currentEventData);
        break;
    }
  };

  useEffect(() => {
    const subscriptions = [] as any;
    Object.keys(allEvents?.outputs)?.forEach((appId: string) => {
      const appOutputs = allEvents?.outputs[appId];
      appOutputs.forEach((output: any) => {
        let currentEventData = {};
        console.log("listening output", output);
        const subscription = MessageService.on(appId + "_" + output).subscribe(
          (eventData: any) => {
            currentEventData = eventData;
            handleOutputs(output, eventData, currentEventData);
          }
        );
        subscriptions.push(subscription);
      });
    });

    return () => {
      // Unsubscribe all subscriptions when component is unmounted
      subscriptions.forEach((subscription: any) => subscription.unsubscribe());
    };
  }, [fetchedApps]);

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
    const title = "TXE";
    document.title = title;

    // Safely get the title element
    const titleElement = document.querySelector('title');

    if (titleElement) {
      // Observer to revert any title changes
      const observer = new MutationObserver(() => {
        if (document.title !== title) {
          document.title = title;
        }
      });

      // Observe the title element for changes
      observer.observe(titleElement, { childList: true });

      // Cleanup the observer on component unmount
      return () => observer.disconnect();
    }
  }, []);
 useEffect(() => {
    // Update key whenever subPath or refNum changes
    setKey((prevKey) => prevKey + 1);
  }, [moduleProps?.subPath, moduleProps?.refNum,selectedModuleAppObject?.name, window.keycloakInstance?.token]);
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
        {selectedModuleAppObject.framework == "ANGULAR" &&
          selectedApp.scope &&
          selectedApp && (
            <AngularAppRenderer
              scope={selectedApp.scope}
              module={selectedApp.module}
              url={selectedApp.url}
              selectedApp={selectedApp}
              component={selectedApp.component}
              appWindowConfig={selectedApp.appWindowConfig}
              key={key}
            />
          )}
      </div>
    </div>
  );
};
