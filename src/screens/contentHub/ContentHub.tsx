import React, { useEffect } from 'react';
import { useSelector } from "react-redux";
import { AppStore } from "store";

declare global {
    interface Window {
        txEmbed: any;
    }
}


const loadCmsModule = (moduleToLoad: string, containerSelector: string, props:any) => {
    const scrElem = document.createElement('script');
    scrElem.src = "https://assets-qa.phenompro.com/CareerConnectResources/siteqa1/common/js/vendor/embed.js";
    scrElem.onload = function() {
        if (window.txEmbed) {
            window.txEmbed.embedModules(moduleToLoad, containerSelector, props);
        }
    };
    document.querySelector('head')?.appendChild(scrElem);
};

const ContentHub: React.FC = () => {
    const selectedTenant = useSelector(
        (state: AppStore) => state.customer.selectedTenant
      );
      const props = {
        token: window.keycloakInstance.token,
        refNum: selectedTenant?.refNum,
        userId: window.keycloakInstance.userInfo.userDetails.id,
      };
    useEffect(() => {
        if(selectedTenant?.refNum){
        loadCmsModule('content', '#tools-body-container' ,props);
    }
    }, [selectedTenant]);

    return <div id="tools-body-container"></div>;
}

export default ContentHub;
