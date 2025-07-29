export const apiUrl = {
  getCustomerAccounts: "customers",
  getLoggedInUserRoles: "me/roles",
  tenantsByCustomerId: "customers/{customerid}/tenants",
  getUserBySearch: "users/byusername/{username}",
  getTenantDetails: "tenants"

};
export const REQUEST_TYPE_KEY = "request_type";
export const ONEPHENOM = "OnePhenom";
export const AUTH_TYPE = "AUTH_TYPE";
export const INTEGRATION_ASPECT = "INTEGRATION_ASPECT";
export const INTEGRATION_TYPE = "INTEGRATION_TYPE";
export const FEED_INTEGRATION_TYPE = "FEED";
export const API_INTEGRATION_TYPE = "API";
export const SCRAPING_INTEGRATION_TYPE = "SCRAPING";
export const SFTP_REQUEST_TYPE = "sftp";
export const SOAP_REQUEST_TYPE = "soap";
export const REST_REQUEST_TYPE = "rest";

export const DEV_ENV = "DEV";
export const QA_ENV = "QA";
export const STAGING_ENV = "STAGING";
export const PROD_ENV = "PROD";


export const noShowSideBar = [
  "/users/new",
  "/sso-config/create",
  "/sso-config/edit",
  "/confighub",
  "/",
  "/bulkemailupdate",
  "/service-account-edit",
  "/service-account/new",
  "/customer-users/import"
];
export const navigationHeaderApps = ["Confighub"];
export const CUSTOMER = "CUSTOMER";
export const UBER_ADMIN = "Uber Admin";
export const UBER_USER = "Uber User";
export const CONFIG_ADMIN = "Config Admin";
export const CONFIG_USER = "Config User";
export const CLIENT_USER = "Client User";
export const CLIENT_ADMIN = "Client Admin";
// this is mainly to seperate out the fields which would be 
export const mainFieldsCodes = ["baseUrl", "endpoint"]
export const UMA_PROTECTION = "uma_protection";
export const PHENOM_APP = "Phenom App";
export const TALENT_ANALYTICS = "talent analytics";
export const CRM_LITE = "CRM-Lite";
export const CMS = "cms";
export const CMS_SINGLE_ROLE_SELECTION_TEXT = "CMS support one role per user.  Select a single role to assign the user."
export const TALENT_ANALYTICS_SINGLE_ROLE_SELECTION_TEXT = "Talent Analytics support one role per user.  Select a single role to assign the user."


export const INTEGRATION_AUTHTYPE_NOT_SUPPORTED_MSG = "Currently custom authentication type integrations are not supported through this flow, Please use  individual integration Configurations to update them.";
export const IDP_TYPES= [
  {name:'Google' ,value:'GOOGLE'}, {name:'Okta' ,value:'OKTA'},{name:'Azure' ,value:'MICROSOFT_AZURE'},{name:'Unknown' ,value:'UNKNOWN'} , {name:'Saml v2.0' ,value:'SAML_V2'}]

export const NAMEID_POLICY_TYPES=[
{value:'EMAIL_ADDRESS', name:'Email Address'},
{value:'PERSISTENT', name:'Persistent'},
{value:'TRANSIENT', name:'Transient'},
{value:'UNSPECIFIED', name:'Unspecified'}
]


export const maxLength = 256;


export const validEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const productsToHide = ["txm-apis"]
export const DATE_FORMAT="YYYY-MM-DD HH:MM:SS";

export const  DC_Code_Error="DC is not configured with the API"

export const PLATFORM_TXM_APIS = "Platform API's"
export const ValidEmailregex = /^[^\s@]+@[^\s@]+(\.[^ !."`'#%&,:;<>=@{}~\$\(\)\*\+_\/\\\?\[\]\^\|]{2,4})$/;

// session storage property constants
export const SELECTED_TENANT = "selectedTenant";
export const PRODUCTS_LIST = "productsList";
export const SELECTED_PROD = "selectedProduct";
// event constants
export const TENANT_UPDATED = "tenantUpdated";
export const PRODUCT_CHANGED = "productChanged";
export const LOAD_PRODUCTS = "loadProducts";
export const HRIT_SUMMARY="HRIT Summary";
export const TENANT="tenant";
export const CUSTOMER_LEVEL="customer";
export const PLATFORM="platform";
export const INVALID_USER_DOWNLOAD = "DownLoad Invalid Users";

export const JOB_ATTRIBUTES={
  AGENCY:"agency",
  TENEANT_ERRORDESC:"This tenant Don't have agency data",
  CUSTOMER_AGENCY_ERRORDESC:"This Customer Dont have agency data"
}
export const ATTRIBUTE_DETAILS:any={
  name:"Name",
  key:"Key",
  type:"Type",
options:"Options",
allowMultiSelect:"Allow Multiselect",
isMandatory:"Is Mandatory",
isFranchisee:"Is Franchisee",
source:"Source"
}

export const EDIT_TENANT_SUBDOMAIN: string = 'editTenantSubdomain';
export const EDIT_ATS: string = 'editAts';
export const LOCALE: string = 'locale';
export const DELETE: string = 'delete';

export const SERVICEHUB_PRODUCT_TITLE = "onephenom";
export const SERVICEHUB_CLIENT_ID = "onephenom-api";
  

export const loginSessionTimeIntervals = {
  SSO_MAX_SESSION_UPPER_LIMIT: 54000,
  SSO_MAX_SESSION_LOWER_LIMIT: 3600,
  SSO_SESSION_IDLE_LOWER_LIMIT: 1800,
  SSO_SESSION_IDLE_UPPER_LIMIT: 28800
}

export const CONTENT_TYPES = {
  CONTENT_PAGE: "Content Page",
  LANDING_PAGE: "Landing Page",
  BLOG: "Blog",
  EMAIL_TEMPLATE: "Email Template"
}