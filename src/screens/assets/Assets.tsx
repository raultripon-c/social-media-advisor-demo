import React, { useEffect } from 'react';

declare global {
    interface Window {
        txEmbed: any;
    }
}


const loadCmsModule = (moduleToLoad: string, containerSelector: string) => {
    const scrElem = document.createElement('script');
    scrElem.src = "https://assets.phenompeople.com/CareerConnectResources/qa1/txe/embed.js";
    scrElem.onload = function() {
        if (window.txEmbed) {
            window.txEmbed.embedModules(moduleToLoad, containerSelector);
        }
    };
    document.querySelector('head')?.appendChild(scrElem);
};

const Assets = () => {
    useEffect(() => {
        loadCmsModule('assets', '#tools-body-container');
    }, []);

    return <div id="tools-body-container"></div>;
}

export default Assets

