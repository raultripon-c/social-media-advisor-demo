import { Customer } from "../../utils/domin/Customer";

export const SET_CUSTOMER_DETAILS = "SET_CUSTOMER_DETAILS";

export const SET_USER_DETAILS = "SET_USER_DETAILS";

export const SET_CUSTOMER_TENANTS = "SET_CUSTOMER_TENANTS";

export const GET_LOGED_USER_RILES = "GET_LOGED_USER_RILES";

export const SET_SELECTED_TENANT = "SET_SELECTED_TENANT";


export const SET_USER_ROLES = "SET_USER_ROLES";

export const SET_ALL_CUSTOMERS = "SET_ALL_CUSTOMERS"

export const SET_PARTNER_DETAILS = "SET_PARTNER_DETAILS" 

export const SET_ALL_PARTNER = "SET_ALL_PARTNER"

export const SET_ALL_TENANTS = "ALL_TENANTS" 

export const SET_SITE_META_DATA = "SET_SITE_META_DATA"

interface SetCustomer {
  type: typeof SET_CUSTOMER_DETAILS;
  data: Customer;
}

interface SetUserDetails {
  type: typeof SET_USER_DETAILS;
  data: any;
}

interface SetCustomerTenants {
  type: typeof SET_CUSTOMER_TENANTS;
  data: any;
}

interface SetLogedUserRoles {
  type: typeof GET_LOGED_USER_RILES;
  data: any;
}

interface SetSelectedTenant {
  type: typeof SET_SELECTED_TENANT;
  data: Customer;
}


interface SetAllCustomers {
  type: typeof SET_ALL_CUSTOMERS;
  data: Customer;
}

interface SetUserRoles {
  type: typeof SET_USER_ROLES;
  data: Customer;
}


interface SetSelectedPartner {
  type: typeof SET_PARTNER_DETAILS;
  data: any;
}

interface SetAllPartners {
  type: typeof SET_ALL_PARTNER;
  data: any;
}

interface SetAllTenants {
  type: typeof SET_ALL_TENANTS;
  data: any;
}

interface SetSiteMetaData {
  type: typeof SET_SITE_META_DATA;
  data: any;
}

export type CustomersActions =
  | SetCustomer
  | SetUserDetails
  | SetCustomerTenants
  | SetLogedUserRoles
  | SetSelectedTenant
  | SetUserRoles
  | SetAllCustomers
  | SetSelectedPartner
  | SetAllTenants
  | SetAllPartners 
  | SetSiteMetaData;

export function setCustomerDetails(customer: any) {
  return {
    type: SET_CUSTOMER_DETAILS,
    data: customer,
  };
}

export function setUserDetails(data: any) {
  return {
    type: SET_USER_DETAILS,
    data: data,
  };
}

export function setCustomerTenants(data: any) {
  return {
    type: SET_CUSTOMER_TENANTS,
    data: data,
  };
}

export function setLogedUserRoles(data: any) {
  return {
    type: GET_LOGED_USER_RILES,
    data: data,
  };
}

export function setSelectedTenant(data: any) {
  return {
    type: SET_SELECTED_TENANT,
    data: data,
  };
}


export function setUserRoles(data: any) {
  return {
    type: SET_USER_ROLES,
    data: data,
  };
}

export function setAllCustomers(customer: any) {
  return {
    type: SET_ALL_CUSTOMERS,
    data: customer,
  };
}

export function setSelectedPartner(data: any) {
  return {
    type: SET_PARTNER_DETAILS,
    data: data,
  };
}

export function setAllPartners(data: any) {
  return {
    type: SET_ALL_PARTNER,
    data: data,
  };
}

export function setAllTenants(data: any) {
  return {
    type: SET_ALL_TENANTS,
    data: data,
  };
}

export function setSiteMetaData(data: any) {
  return {
    type: SET_SITE_META_DATA,
    data: data,
  };
}