const CMS_URL = (window as any)._env_.CMS_URL;

export const staticData = [
    {
        displayText: "Page",
        value: "Page",
        icon: "https://assets-qa.phenompro.com/CareerConnectResources/siteqa1/common/js/vendor/Generic.svg",
        config: {
            appType: "external",
            appConfig: { link: CMS_URL + "/tier3" },
            context: "customer",
            requestParams: { lsrc: "txe", lsw: "_self", refNum: "", customerCode: "", route: "pages" },
        },
    },
    {
        displayText: "Article",
        value: "Blog",
        icon: "https://assets-qa.phenompro.com/CareerConnectResources/siteqa1/common/js/vendor/Company_notification.svg",
    },
    {
        displayText: "Campaigns",
        value: "Campaigns",
        icon: "https://assets-qa.phenompro.com/CareerConnectResources/siteqa1/common/js/vendor/campaign.svg",
    },
    {
        displayText: "Events",
        value: "Events",
        icon: "https://assets-qa.phenompro.com/CareerConnectResources/siteqa1/common/js/vendor/Generic.svg",
    },
    {
        displayText: "Email templates",
        value: "Email templates",
        icon: "https://assets-qa.phenompro.com/CareerConnectResources/siteqa1/common/js/vendor/Generic.svg",
    },
    {
        displayText: "SMS templates",
        value: "SMS templates",
        icon: "https://assets-qa.phenompro.com/CareerConnectResources/siteqa1/common/js/vendor/Generic.svg",
    },
];

export const tenantData = [
    {
        tenantLink: "https://phenompeople-qa.phenompro.com/us/en",
        lastUpdated: "2 days",
        imageSrc: "https://assets-qa.phenompro.com/CareerConnectResources/siteqa1/common/js/vendor/sample-image.jpg",
        refNum: "PHENA0059",
        config: {
            appType: "external",
            appConfig: { link: CMS_URL + "/tier3" },
            context: "customer",
            requestParams: { lsrc: "txe", lsw: "_self", refNum: "", customerCode: "" },
        },
    },
];