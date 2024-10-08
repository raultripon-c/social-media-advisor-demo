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
            requestParams: { lsrc: "txe", lsw: "_self", refNum: "", customerCode: "", route: "pages", site: ""},
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

export const metricsDataForIndia = [
    {
        name: "visitsKpi",
        title: "Career Site Visits",
        text: "Total number of career site visits with daily delta percentage",
    },
    {
        name: "applicationsConversionKpi",
        title: "Conversion Rate",
        text: "Total number of Talent Community, Job Alert, and Similar Job Alert subscriptions with daily delta percentage",
    },
    {
        name: "completedCareerSiteApplies",
        title: "Recent Leads",
        text: "Total number of job seekers who clicked the Apply button",
    },
    {
        name: "uniqueLeads",
        title: "New Applicants",
        text: "Total number of unique leads generated",
    },
    {
        name: "avgTimeOnPage",
        title: "Avg. Time on Page",
        text: "Average time a visitor spends on the career site with daily delta percentage",
    },
];

export const metricsDataForOtherRegions = [
    {
        name: "visitsKpiCurrent",
        title: "Career Site Visits",
        text: "Total number of career site visits with daily delta percentage",
    },
    {
        name: "applicationsConversionKpiCurrent",
        title: "Conversion Rate",
        text: "Total number of Talent Community, Job Alert, and Similar Job Alert subscriptions with daily delta percentage",
    },
    {
        name: "completedCareerSiteAppliesCurrent",
        title: "Recent Leads",
        text: "Total number of job seekers who clicked the Apply button",
    },
    {
        name: "uniqueLeadsCurrent",
        title: "New Applicants",
        text: "Total number of unique leads generated",
    },
    {
        name: "avgTimeOnPageCurrent",
        title: "Avg. Time on Page",
        text: "Average time a visitor spends on the career site with daily delta percentage",
    },
];