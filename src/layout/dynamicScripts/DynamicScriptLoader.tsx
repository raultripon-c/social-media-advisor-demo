import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { AppStore } from "store";
import { Loader } from "@phenom/react-ui-components";
import { loadScriptById, removeElementsById } from "../../utils/helper/utilizer";
import { findAppConfigByRoutes, removeCrmStyles } from "../../utils/appUtils";
import { triggerRefreshToken } from "../../utils/api";
import { APIService } from "../../utils/api.service";
import "./DynamicScriptLoader.css"; 

declare global {
  interface Window {
    txEmbed: any;
  }
}

interface DynamicScriptLoaderProps {
  scriptName: string;
}

interface TxeContext {
  refNum: string;
  token: string;
  blogId: string | null;
}

const DynamicScriptLoader: React.FunctionComponent<DynamicScriptLoaderProps> = ({ scriptName}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const storeData = useSelector((state: AppStore) => state.customer);
  const videoObserversRef = useRef<MutationObserver[]>([]);

  const fetchedApps = useSelector(
    (state: any) => state.app.allApps || JSON.parse(sessionStorage.getItem("allapps") || "[]")
  );
  const selectedApp =
    findAppConfigByRoutes(fetchedApps, window.location.pathname)?.[0]?.appConfig ||
    JSON.parse(sessionStorage.getItem("selectedApp") || "null")?.appConfig;

  let txeContextToSend :TxeContext= {
    refNum: storeData.selectedTenant.refNum,
    token: window.keycloakInstance.token,
    blogId: localStorage.getItem('blogId'),
  };
  

  useEffect(() => {
    const tokenBkp = localStorage.getItem("token");
    localStorage.removeItem("token");

    const loadScript = async () => {
      await triggerRefreshToken();

      const embedScriptId = selectedApp?.scriptId;
      if (document.querySelector(`#${embedScriptId}`)) {
        document.querySelector(`#${embedScriptId}`)?.remove();
      }

      if (!document.querySelector(`#${embedScriptId}`)) {
        const scrElem = document.createElement("script");
        scrElem.id = embedScriptId;
        scrElem.src = selectedApp?.url;
        scrElem.onload = () => initializeModules();
        document.querySelector("head")?.appendChild(scrElem);
      } else {
        initializeModules();
      }
    };

    const initializeModules = () => {
      if (scriptName === "assets" || scriptName === "contenthub") {
        window.txEmbed?.embedCaasModules(
          selectedApp?.embedType,
          "#tools-body-container",
          txeContextToSend,
          cleanupCallback
        );
      } else if (scriptName === "blogs") {
        window.txEmbed?.embedModules("blogs", "#tools-body-container", txeContextToSend, cleanupCallback);
      } else if (scriptName === "banners") {
        APIService.getPluginVersion().then((response) => {
          loadScriptById("canvas-bootstrapper1", response?.data?.data?.script || "");
          window.txEmbed?.embedModules("banners", "#tools-body-container", txeContextToSend, () => {
            cleanupCallback();
            for (let i = 1; i <= 3; i++) {
              setTimeout(deleteCmsLoader, 5000);
            }
          });
        });
      }
    };

    loadScript();

    return () => {
      if (tokenBkp) localStorage.setItem("token", tokenBkp);
    };
  }, [storeData]);

  useEffect(() => {
    videoObserversRef.current.forEach(observer => observer.disconnect());
    videoObserversRef.current = [];

    const updateVideoDisplay = (video: HTMLVideoElement) => {
      const visibility = window.getComputedStyle(video).visibility;
      if (visibility === 'hidden') {
        video.style.display = 'none';
      } else if (video.style.display === 'none') {
        video.style.display = '';
      }
    };

    const processAllVideos = () => {
      const videos = document.querySelectorAll('video');
      videos.forEach(video => updateVideoDisplay(video as HTMLVideoElement));
    };

    const universalObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              
              if (element.tagName === 'VIDEO') {
                updateVideoDisplay(element as HTMLVideoElement);
              }
              
              const videos = element.querySelectorAll?.('video');
              videos?.forEach(video => updateVideoDisplay(video as HTMLVideoElement));
            }
          });
        }
        
        if (mutation.type === 'attributes' && 
            mutation.attributeName === 'style' && 
            mutation.target.nodeName === 'VIDEO') {
          updateVideoDisplay(mutation.target as HTMLVideoElement);
        }
      });
    });

    universalObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style'],
      attributeOldValue: false
    });

    processAllVideos();
    videoObserversRef.current = [universalObserver];

    return () => {
      if (videoObserversRef.current.length > 0) {
        videoObserversRef.current.forEach(observer => observer.disconnect());
        videoObserversRef.current = [];
      }
    };
  }, []);

  const deleteCmsLoader = () => {
    document.querySelectorAll("#tools-body-container .ppc-loading").forEach((div) => {
      (div as HTMLElement).style.display = "none";
    });

    const breadcrumbs = document.querySelector("#tools-body-container .tmt-breadcrumbs") as HTMLElement;
    if (breadcrumbs) breadcrumbs.style.display = "none";
  };

  const cleanupCallback = () => {
    setIsLoading(false);
    localStorage.removeItem("blogId");
    removeElementsById("crm-stylesheet");
    removeCrmStyles();
  };

  return (
    <div>
      <div id="tools-body-container"></div>
      {isLoading && (
        <div className="child-loading">
          <Loader title="Please Wait, Loading..." />
        </div>
      )}
    </div>
  );
};

export default DynamicScriptLoader;
