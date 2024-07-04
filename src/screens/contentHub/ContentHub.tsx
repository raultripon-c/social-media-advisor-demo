import React, { useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import { AppStore } from "store";
import { Loader } from "@phenom/react-ui-components";

declare global {
    interface Window {
        txEmbed: any;
    }
}

const ContentHub: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const storeData = useSelector((state: AppStore) => state.customer);

    useEffect(() => {
        const embedScriptId = 'txe-cms-embed-assets';
        const existsScrElem = document.querySelector(`#${embedScriptId}`);

        const loadScript = () => {
            return new Promise<void>((resolve) => {
                if (!existsScrElem) {
                    const scrElem = document.createElement('script');
                    scrElem.id = embedScriptId;
                    scrElem.src = "https://assets-qa.phenompro.com/CareerConnectResources/siteqa1/common/js/vendor/embed.js";
                    scrElem.onload = () => {
                        resolve();
                    };
                    document.querySelector('head')?.appendChild(scrElem);
                } else {
                    resolve();
                }
            });
        };

        if (storeData && storeData.selectedTenant && storeData.selectedTenant.refNum) {
            loadScript().then(() => {
                if (window.txEmbed) {
                    window.txEmbed.embedModules('content', '#tools-body-container', { refNum: storeData.selectedTenant.refNum, token: window.keycloakInstance.token });
                }
                setIsLoading(false);
            });
        }
    }, [storeData]);

    return (
        <div>
            <div id="tools-body-container"></div>
            {isLoading &&
                <div>
                    <Loader title="Please Wait, Loading..." />
                </div>
            }
        </div>
    );
}

export default ContentHub;
