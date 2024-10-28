const CMS_URL = (window as any)._env_.CMS_URL;
export const tenantImageUrl = "https://assets.phenompeople.com/CareerConnectResources/prod/WAMEGLOBAL/images/State=Emptystate-1728467620342.png";

export const staticData = [
    {
        displayText: "Page",
        value: "Page",
        icon: "https://assets-qa.phenompro.com/CareerConnectResources/siteqa1/common/js/vendor/Generic.svg",
        config: {
            appType: "external",
            appConfig: { link: CMS_URL + "/tier3" },
            context: "customer",
            requestParams: { lsrc: "txe", lsw: "_self", refNum: "", customerCode: "", route: "pages", site: "" },
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
        name: "uniqueLeads",
        title: "Unique Leads",
        text: "Total number of unique leads generated (analytics > candidate experience > job seekers overview > unique leads)",
    },
    {
        name: "applicationsConversionKpi",
        title: "Subscriptions",
        text: "Total number of Talent Community, Job Alert, and Similar Job Alert subscriptions with daily delta percentage",
    },
    {
        name: "completedCareerSiteApplies",
        title: "Apply Clicks",
        text: "Total number of job seekers who clicked the Apply button (analytics > candidate experience > apply)",
    },
    {
        name: "avgTimeOnPage",
        title: "Average Time on Site",
        text: "Average time a visitor spends on the career site with daily delta percentage",
    },
    {
        name: "jobVisitsToApplyClicksConversionRate",
        title: "Conversion Rate",
        text: "Job Visits to Apply Clicks Conversion Rate (CX Candidate Experience > Apply Clicks > Job Visits to Apply Clicks Conversion Rate)",
    }
];

export const metricsDataForOtherRegions = [
    {
        name: "visitsKpiCurrent",
        title: "Career Site Visits",
        text: "Total number of career site visits with daily delta percentage",
    },
    {
        name: "uniqueLeadsCurrent",
        title: "Unique Leads",
        text: "Total number of unique leads generated (analytics > candidate experience > job seekers overview > unique leads)",
    },
    {
        name: "applicationsConversionKpiCurrent",
        title: "Subscriptions",
        text: "Total number of Talent Community, Job Alert, and Similar Job Alert subscriptions with daily delta percentage",
    },
    {
        name: "completedCareerSiteAppliesCurrent",
        title: "Apply Clicks",
        text: "Total number of job seekers who clicked the Apply button (analytics > candidate experience > apply)",
    },
    {
        name: "avgTimeOnPageCurrent",
        title: "Average Time on Site",
        text: "Average time a visitor spends on the career site with daily delta percentage",
    },
    {
        name: "jobVisitsToApplyClicksConversionRateCurrent",
        title: "Conversion Rate",
        text: "Job Visits to Apply Clicks Conversion Rate (CX Candidate Experience > Apply Clicks > Job Visits to Apply Clicks Conversion Rate)",
    }
];

export const campaignColumns = ["Campaign Name", "Status"];