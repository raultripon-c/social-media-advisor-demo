import React, { useEffect } from 'react';
import { useSelector } from "react-redux";
import { AppStore } from "store";

declare global {
    interface Window {
        txEmbed: any;
    }
}


const loadCmsModule = (moduleToLoad: string, containerSelector: string, ctx: any) => {
    const embedScriptId = 'txe-cms-embed-assets'
    const existsScrElem = document.querySelector(`#${embedScriptId}`)
    if(!existsScrElem){
        const scrElem = document.createElement('script');
        scrElem.id = embedScriptId
        scrElem.src = "https://assets-qa.phenompro.com/CareerConnectResources/siteqa1/common/js/vendor/embed.js";
        scrElem.onload = function() {
            if (window.txEmbed) {
                window.txEmbed.embedModules(moduleToLoad, containerSelector, ctx);
            }
        };
        document.querySelector('head')?.appendChild(scrElem);
    } else {
        if (window.txEmbed) {
            window.txEmbed.embedModules(moduleToLoad, containerSelector, ctx);
        }
    }
};

const ContentHub: React.FC = () => {
    const storeData = useSelector((state: AppStore) => state.customer);
    useEffect(() => {
        if(storeData && storeData.selectedTenant && storeData.selectedTenant.refNum){
            loadCmsModule('content', '#tools-body-container', {refNum: storeData.selectedTenant.refNum, token: window.keycloakInstance.token});
        }
    }, [storeData]);

    return <div id="tools-body-container"></div>;
}

export default ContentHub;
