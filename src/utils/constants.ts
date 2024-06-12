export const apiUrl = {
  getVendors: "api/dashboard/vendors",
  deleteCustomerUserIdpLink:"customers/{customerCode}/users/{id}/idp-links",
  getVendor: "api/dashboard/vendors/{id}",
  getTenantAttributes: "customers/{customerCode}/tenants/{refNum}/configurations?type=DEPARTMENT_ATTRIBUTE",
  addTenantAttributes: "customers/{customerCode}/tenants/{refNum}/configurations",
  getCustomerAttributes: "customers/{customerCode}/tenants/configurations",
  getCustomerDepartmentAttributes: "customers/{customerCode}/tenants/configurations?type=DEPARTMENT_ATTRIBUTE",

  getAgencyAttributes : "customers/{customerCode}/tenants/{refNum}/agencies",
  getAllTenantAgencyData : "customers/{customerCode}/agencies",

  deleteTenant: "partners/code/{customerCode}/tenants",

  getCustomerByCode: "customers/code/{customerCode}",

  add2FAtocustomer:"customers/{customerCode}/configure-2FA",
  get2FAtocustomer:"customers/{customerCode}/configure-2fa",
  deleteDevice:"customers/{customerCode}/users/{userId}/device/{deviceId}",
  updateDevice:"customers/{customerCode}/users/{userId}/device",
  generateSubscriptionsCustomer:"customers/{code}/create/ext-service-providers",
  generateSubscriptionsPartner:"partners/{code}/create/ext-service-providers",
  getDevices:"customers/{customerCode}/users/{userId}/device",
  updateProductData: "products/productupdate/{productId}",
  moveUser: "moveUsers",
  addCustomerAccount: "customers",
  addRoleCustomerTenant: "{dcCode}/realms/{realmName}/apps/{clientId}/roles",
  loginSession: "{dcCode}/realms/{realmName}/session-config",
  getCustomerAccounts: "customers",
  retryProvisioning: "tenants/{refnum}/retryprovisioning",
  getAllJobAttributes:"tenants/{refnum}/job-attributes",
  addScopes:"tenants/{refnum}/scopes",
  updateScope:"tenants/{refnum}/scopes/{id}",
  importScopes: "tenants/{refnum}/scopes/import",
  deleteScopes:"tenants/{refnum}/scopes/{id}",
  getCustomerAccountbyCode: "customers/code",
  getActivityLog: "users/audit/{orgCode}",
  getActivityConstants: "constants/audit/{auditTable}/actions?org_code={orgCode}",
  getApiActivityLog: "tenants/{refnum}/apiconfig/audit",
  editUser: "partners/{id}/users",
  getUserProducts: "{refnum}/users/{dc_code}/products",
  getExternalProducts: "{orgCode}/ext-service-provider-subscription",
  getProviderFields: 'realms',

  getIDPProviderFields: 'customers/{customerCode}/idp',
  getPartnerIDPProviderFields: 'partners/{code}/idp',
  
  getIDPDetailsByAlias: 'customers/{customerCode}/idp/{alias}',
  passwordPolicy:'customer/{customerCode}/password-policy',
  updateIDPCertificate: 'customers/{customerCode}/idp/certificate',

  getIDPInfoDetails:'customers/{customerCode}/idp/read-metadata',
  getIDPLoggedInUsers: "customers/{customerCode}/refresh",
  getAttributesForCustomerTenant: "customers/{customerCode}/tenants/{refnum}/configurations",
  getServiceAccountClients: "customers/{customerCode}/service-account/users",
  getServiceAccountUserById: "customers/{customerCode}/service-account/users/{userName}",
  addServiceAccountClient: "customers/{customerCode}/service-account/users",
  migrateCustomer: "customers/{customerCode}/migrate",
  getCustomerMigrationStatus: "customers/{customerCode}/migration-status",
  getCustomerFranchiseeStatus: "customer-franchisee/{customerCode}",
  updateSingleLogoutServiceUrl: "customers/{customerCode}/idp/saml/config",
  serviceProviderMigrationCheck: "customers/{customerCode}/restrictedEntity/isRestricted",
  toggleUserServiceProvider: "customers/{customerCode}/restrictedEntity/toggle",

  updateUser: "realms/{realmname}/users/{userId}/update",
  updateTenantUser: "tenants/{refnum}/users/{id}/update",
  updateCustomerUser: "customers/{customercode}/users/{id}",
  updatePartnerUser: "partners/{partnercode}/users/{id}",

  activatePartnerUser: "partners/code/{code}/users/{id}",
  activateCustomerUser: "customers/code/{code}/users/{id}",
  activateTenantUser: "tenants/{refNum}/users/{id}",
  updateCustomerUserEmail: "customers/{code}/users/{oldEmail}/updateemail",
  updatePartnerUserEmail: "partners/{partnerCode}/users/{username}/updateemail",
  getDataCenters: 'datacenters',
  getCategories: 'productcategory',

  refreshTemplates: "api/dashboard/{id}/refreshtemplates",
  getCustomerLookups: "customer_lookup",
  getCustomerLookup: "api/dashboard/customerlookup",
  getProducts: "productpage/products",
  fetchDefaultProducts: "products/default",
  addProduct: "productpage/addproduct",
  getProductById: "productpage/product/{productId}",
  getEnvrinments: "productpage/environments",
  tenants: "tenantpage/tenants",
  addTenant: "tenants",
  editTenant: "customers/tenants/{refNum}",
  editTenantSubdomain: "customers/tenants/{refNum}/subtenants",
  editTenantAts: "tenant/{refNum}/subscriptions/update",
  customerTenants: "tenants",
  fetchPartners: "partners",
  fetchPartnersOrg: "partners/code/{code}",
  fetchPartnersByCode: "partners/code",
  fecthParterAuditLogs: "partner/audit/all",
  addPartners: "partners",

  integrations: "{refnum}/integrationpage/integrations",
  getAllIntegrations: "tenant/{refnum}/prodcategory/ATS/environment/{env}/integrations",
  integrationById: "{refnum}/integrationpage/integration/{id}",
  addIntegration: "{refnum}/integrationpage/integration",
  editIntegration: "{refnum}/integrationpage/integration/{id}",
  updateIntegrationStatus:
    "{refnum}/integrationpage/integration/{id}/updatestatus",
  updateConfiguration: "updateconfiguration",

  deleteIntegration: "{refnum}/integrationpage/integration/{id}",
  deleteEndpoint:
    "{refnum}/integrationpage/integration/integrationendpoint/{id}",
  testApi: "{refnum}/discovery",
  requestPayload: "{refnum}/discovery/requestpayload",

  integrationMetadata: "metadata/integration",
  promoteIntegrationById: "{refnum}/integrationpage/promote/integration/{id}",
  getTemplateById: "productpage/template/{templateId}",
  validateProductTitle: "productpage/product/{productTitle}/validate",
  getRolesByProductId: "{dcCode}/realms/{realmname}/apps/{appid}/roles",
  fetchProducts: "products/filtered",
  getTenantsByPartnerId: "partners/{partnerid}/tenants",
  getPartnerByPartnerId: "partners/{partnerid}",
  tenantUsers: "tenants/{refnum}/users",
  partnerUser: "partners/{partnerCode}/users",
  customerUser: "customers/{customerCode}/users",
  tenantUsersSearch: "tenants/{refnum}/users/all",
  partnerUserSearch: "partners/{partnerCode}/users/all",
  customerUserSearch: "customers/{customerCode}/users/all",
  exportCustomerUsers: "customers/{customerCode}/users/export",
  exportPartnerUsers: "partners/{code}/users/export",
  tenantsByCustomerId: "customers/{customerid}/tenants",
  tenantsByCustomerCode: "customers/code/{customerCode}/tenants",
  getUserById: "users/byuserid/{id}",
  getUserBySearch: "users/byusername/{username}",
  globalSearch  : "global-search/{username}",
  tenantUser: "realms/{realmname}/tenants/{tenantid}/users/{id}",
  sendResetUserPassword: "realms/{realmname}/users/{id}/resetpassword",
  sendTenantResetUserPassword: "tenants/{refnum}/users/{id}/resetPassword",
  sendCustomerResetUserPassword: "customers/{customercode}/users/{id}/resetPassword",
  sendPartnerResetUserPassword: "partners/{partnercode}/users/{id}/resetPassword",
  createAutoProvisionGroup : "customers/{customerCode}/idp/{alias}/auto-provision-config/update",
  getAutoProvisionGroup : "customers/{customerCode}/idp/{alias}/auto-provision-config",
  getProductByCategory: "products/productcategory/{categoryName}",
  getLoggedInUserRoles: "me/roles",

  verifyBulkUploadFileForCustomer: "customers/{customerCode}/users/verify-import",
  sendBulkUsersForCustomer: "customers/{customerCode}/users/import",
  sendBulkUserEmailUpdateForCustomer:"customers/{customerCode}/users/bulkemailupdate",
  sendBulkUserEmailUpdateForPartner:"partners/{partnerCode}/users/bulkemailupdate",


  verifyBulkUploadFileForPartner: "partners/{partnerCode}/users/verify-import",
  sendBulkUsersForPartner: "partners/{partnerCode}/users/import",
  uploadImage: "{imageType}/{title}/image/upload",
  validateUserToExport: "",
  downloadExportedUsers: "users/export/{key}",
  addCanvasTenant: "customers/{customerId}/tenants/{refnum}/addCanvasTenant",
  addExecutiveTenant: "customers/{customerId}/tenants/{refnum}/addExecutiveTenant",

  getMyApps: "my-apps"

};

export const pageConstants = {
  home: "Home",
  cusotomerAccounts: "Customer Accounts",
  userManagement: "Partner User Management",
  partnerManagement: "Partner Management",
  activityLog: "Activity Log",
  partnerActivityLog: "Partner Activity Log"
};
export const AccountsConstants = {
  CustomerType: "Customer",
  SegementType: "segment",
  LookUp_Partner: "Partner",
  LookUp_Enterprise: "Enterprise",
  CustomerTypeId: 1,
};

export const ProductsConstants = {
  ATS: "ATS",
  Integration: "Integration",
  PRODUCT: 'Product',
  SERVICE: 'Service',
  EXTSERVICEPROVIDER:'ExtServiceProvider'
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

export const productCategory = {
  ATS: "ATS",
  Middleware: "Middleware",
};
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
export const ResourceNames = {
  customerAccounts: "customers",
  partners: "partners",
  tenants: "tenants",
  products: "products",
  integrations: "integrations",
  customerusers: "customerusers",
  scopemanagement: "scopemanagement",
  tenantusers: "tenantusers",
  productserviceconfig: "productserviceconfig",
  temporaryPasswordAccess: "temporaryPasswordAccess",
  roleTabAccess: "roleTabAccess",
  ssoIdentityConfigurationAccess:"ssoIdentityConfigurationAccess",
  ssoAdvancedSettingsAccess: "ssoAdvancedSettingsAccess",
  serviceAccountClientAccess: "serviceAccountClientAccess",
  offlineExportAccess: "offlineExportAccess",
  tenantActionAccess:"tenantActionAccess",
  updateEmailAccess:"updateEmailAccess",
  bruteForceDetectionAccess:"bruteForceDetectionAccess"
}
export const Scopes = {
  create: "create",
  delete: "delete",
  disable: "disable",
  update: "update",
  enable: "enable",
  view: "view",
  credentialupdate: "credentialupdate",
  migrationview: "migrationview",
  deleteIdp: "deleteIdp",
  bulkupdate:"bulkupdate",
  viewcustomer: "viewcustomer",
  viewpartner: "viewpartner",
  edit : "edit"
}
export const INTEGRATION_AUTHTYPE_NOT_SUPPORTED_MSG = "Currently custom authentication type integrations are not supported through this flow, Please use  individual integration Configurations to update them.";

export const MIGRATION_SETTINGS_MESSAGES: any = {
  READY_MSG: 'We have the IDP configurations migrated from the legacy system. We can initiate the user migration when we have the customers ready for the switch at their IDP end. Please note the user migration would be a long running process which might be around an hour or 2 based on user count, plan accordingly.',
  IN_PROGRESS_MSG: 'User Migration is in progress, please come back in a while or Refresh after some time to see an update in the status.',
  SUCCESSFUL_MSG: 'User Migration is successful. We can now initiate the process to switch the IDP settings at the customer end. <a class="successful-refer-doc" href="https://phenompeople.atlassian.net/wiki/spaces/DOC/pages/54276458740/SSO+Configuration+-+Service+Hub" target="_blank">Refer the document for detailed steps</a>.',
  FAILED_MSG: 'Migration is either Partially or Fully Failed. Please reach out to Engineering team. Meanwhile we recommend not to update IDP settings at the customer side.',
  USER_LOGGED_IN_MSG: 'One or more users were able to successfully log-in into phenom system using their IDP.',
  CONFIRM_HEADING_MSG: 'Are you sure, you want to start the migration of users from the existing system?',
  CONFIRM_DES_MSG: 'This is an irreversible Process.',
  CONFIRM_BTN_TEXT: 'Yes, Migrate',
  USER_LOGGED_IN: 'Process Completed',
  SUCCESSFUL: 'User Migration Done',
  FAILED: 'User Migration Failed',
  READY: 'Ready For Migration',
  IN_PROGRESS: 'Migration In Progress',
  MIGRATION_USERS_TAB_MESSAGE: "Tenant and User Migration to servicehub is still under process. <a href='https://accounts.phenompeople.com/login' target='_blank'> Please use Legacy Accounts module for user management until the Migration is fully completed.</a>",
  CONFIRM_AUTH_HEADING_ENABLE_MSG: 'Are you sure, you want to use OSIAM instead of service hub authentication?',
  CONFIRM_AUTH_HEADING_DISABLE_MSG: "Are you sure, you want to use service hub authentication instead of OSIAM?",
  CONFIRM_AUTH_DES_MSG: 'This is an irreversible Process.',
  CONFIRM_AUTH_BTN_TEXT: 'Yes, Update',
  CONFIRM_DIALOG_ALERT_INFO: 'Once Migration is completed, By default logins go via service hub, If customer is not ready with IDP switch, ensure you are switching the SP initiated flow to OSIAM!'
}
export const IDP_TYPES= [
  {name:'Google' ,value:'GOOGLE'}, {name:'Okta' ,value:'OKTA'},{name:'Azure' ,value:'MICROSOFT_AZURE'},{name:'Unknown' ,value:'UNKNOWN'} , {name:'Saml v2.0' ,value:'SAML_V2'}]

export const NAMEID_POLICY_TYPES=[
{value:'EMAIL_ADDRESS', name:'Email Address'},
{value:'PERSISTENT', name:'Persistent'},
{value:'TRANSIENT', name:'Transient'},
{value:'UNSPECIFIED', name:'Unspecified'}
]


export const PRINCIPAL_TYPES =[
  {value:'SUBJECT' , name:"Subject NameID"},
  {value:'ATTRIBUTE',name:"Attribute [Name]"},
  {value:'FRIENDLY_ATTRIBUTE',name:"Attribute [Friendly Name]"}
]

export const ATTRIBUTES_TYPE=[
  {value:'TEXT', label:'Text'},
  {value:'SELECT', label:'Select'},
  ]
  
  export const SamlIdpConstants: any = {
  entityId: "Entity ID",
  redirectUri: "Redirect URI (ACS URL)",
  spRedirectUri: "Redirect URI (ACS URL) SP Initiated Flow",
  ACS_URI_HELP_TEXT: "This configuration is needed for IDPs such as Azure, Google where Consumer URL validation is enabled."
}
export const PhenomOrgCodeList = ["PHO", "PHD", "PHE", "PHF"]
export const ProductHelpText: any = {
  name: "Specifies display name of the client. For example 'My Client'",
  title: "Specifies ID referenced in URI and tokens. For example 'my-client'. For SAML this is also the expected issuer value from authn requests",
  description: "Specifies description of the client. For example 'My Client for TimeSheets'.",
  ownerCapability:"owner Capability",
  imageUri: "Image logo representing the product, Same image will be visible for the product across servicehub",
  enableLoginSerivices:"Enable Login for Services",
  tenantSpecificUrl: "URL should be the landing page for product area with tenant(refnum) context",
  homePageUrl: "URL should be the landing page for product area with tenant selection",
  productVisibleTo: "Specifies who should be able to access these products, Available selections are Phenom, Customers, SI Partners. Choose multiple if product is used by multiple groups",
  customerEligible:"Is Customer Eligible",
  partnerEligible:"Is Partner Eligible",
  phenomEligible:"Is Phenom Eligible",
  isDefault:"Is Default",
  isBackendService:"Is Backend Eligible",
  provisionFlowYamlPath:"Upload yaml file",
  enableAuth: "Enable/Disable fine-grained authorization support for a client",
  enableServiceAccount: "Allows you to use this client as a service account for authentication with Keycloak and retrieve access token dedicated to this client. In terms of OAuth2 specification, this enables support of 'Client Credentials Grant' for this client.",
  serviceType: "'Confidential' clients require a secret to initiate login protocol. 'Public' clients do not require a secret. 'Bearer-only' clients are web services that never initiate a login.",
  validRedirectUris: "Valid URI pattern a browser can redirect to after a successful login or logout. Simple wildcards are allowed such as 'http://example.com/*'.",
  webOrigins: "Allowed CORS origins. To permit all origins of Valid Redirect URIs, add '+'. This does not include the '*' wildcard though. To permit all origins, explicitly add '*'.",

  scopes: "Scopes are identifiers for different actions supported by the resource server using this client.",
  resources: "Resources are individual entities from a resource server using this client, Resource and scope mappings allow you to choose which entity and actions are accessible for a role",
  serviceAccountRoles: "Allows you to authenticate role mappings for the service account dedicated to this client.",
  roles: "",
  permissions: "",
  newResource: {
    name: "A unique name for this resource. The name can be used to uniquely identify a resource, useful when querying for a specific resource.",
    displayName: "A unique name for this resource. The name can be used to uniquely identify a resource, useful when querying for a specific resource.",
    type: "The type of this resource. It can be used to group different resource instances with the same type.",
    scopes: "The scopes associated with this resource.",
    enableAccessOwner: "If enabled, the access to this resource can be managed by the resource owner."
  },

}
export const statusFailed = ["PROVISION_FAILED", "FAILED", "ACCESS_FAILED"];
export const statusSuccess = ["PROVISIONED", "ACCESS_ENABLED",true];
export const ProvisioningStatusModalInfoText = "Tenant provisioning in progress. This process may take 10-15 minutes. You can optionally close this window. We will notify you once this process completes."
export const CustomerInfoConstants: any = {
  customer: "customer",
  partner: "partner",
  moveUserNoteInfo: "Choose this option, to move the user from one account to other customer or partner account.",
  multipleUsersToMove: "Multiple users share the same email.Contact support to delete duplicates and proceed with moving the user.",
  moveuserPartnerNote: "Partner users can not be moved.",
  exportUsersLimitAlertInfo: "User count being exported is high, please raise a service request.",
  customerRoleAlertInfo: "Please Note, This screen helps only in creating a new role. After role creation, If we need to map specific features to roles, we have to reach out to respective Product Engineering/Support team.",
  unAuthorizedAlertInfo:" Please reach out to admin or login to respective Data Center Service Hub to view this data",
  unAuthorizedtInfo:" Please reach out to admin to view or update the data",
  sourceDataList: [{
    heading: "User Name / Email",
    option: "userName",
    type: "text"
  },
  {
    heading: "User Realm",
    option: "realm",
    type: "text"
  },
  {
    heading: "Accessible Tenants",
    option: "accessableTenants",
    type: "array"
  },
  {
    heading: "User Type",
    option: "userDesc",
    type: "text"
  },

  {
    heading: "Created On",
    option: "createdOn",
    type: "date"
  },
  {
    heading: "Last Login",
    option: "lastSession",
    type: "date"
  },

  ],
  targetDataList: {
    "customer": [{
      heading: "Target Customer",
      option: "name",
      type: "text"
    },
    {
      heading: "Tenants Count",
      option: "tenantCount",
      type: "text"
    }],
    "partner": [
      {
        heading: "Target Partner",
        option: "name",
        type: "text"
      },
      {
        heading: "Tenants Count",
        option: "tenantCount",
        type: "text"
      }
    ]
  },
  userTypeList: [{
    type: "customer",
    primaryNote: "Existing User roles for any product will be lost, if the target customer/tenant does not have the product enabled."
  }, {
    type: "partner",
    primaryNote: "Existing User roles for any product will be lost, if the target customer/tenant does not have the product enabled."
  }]
}


export const provisioningConfirmationModalMessages = {
  heading: `Provisioning products for {name} is in progress`,
  description: "This step may take 10-15 minutes",
  confirmButtonText: "View Details"
}
export const productLoginTypes = {
  CONFIDENTIAL: "Confidential",
  PUBLIC: "Public"
}
export const ProductsSelectorConstants = {
  products: "Products",
  backendServices: "Backend Services"
}
export const EditProductsConstants = {
  provisionedProductsHeading: "Provisioned Products",
  provisionedProductsHelp: "Provisioned products for account",
  selectedProducts: "Product List",
  selectedBackendServices: "Backend services",
  provisionedProductsAndServices: "Provisioned products and services",
  nonProvisionedProductsHeading: "Non Provisioned Products",
  nonProvisionedProductsHelp: "Add products and licenses",
  nonProvisionedProducts: "Non provisioned products",
  nonProvisionedServices: "Non provisioned backend services",
}

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