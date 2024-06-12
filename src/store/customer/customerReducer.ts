import {
  CustomersActions,
  GET_LOGED_USER_RILES,
  SET_CUSTOMER_DETAILS,
  SET_CUSTOMER_TENANTS,
  SET_SELECTED_TENANT,
  SET_USER_DETAILS,
  SET_USER_ROLES,
  SET_ALL_CUSTOMERS,
  SET_PARTNER_DETAILS,
  SET_ALL_TENANTS,
  SET_ALL_PARTNER,
} from "./actions";
import { CustomerState } from "./type";

const initialState: CustomerState = {
  data: [],
  customerTenants: [],
  logedUserRoles: [],
  selectedTenant: {},
  user: {},
  customers:[],
  selectedPartner:[],
  allTenants:[],
  partners:[]
};

const customerReducer = (
  state: CustomerState = initialState,
  action: CustomersActions
): any => {
  const { type, data } = action;

  switch (type) {
    case SET_CUSTOMER_DETAILS: {
      const newState = JSON.parse(JSON.stringify(state));
      return {
        ...newState,
        data: data,
      };
    }

    case SET_PARTNER_DETAILS: {
      const newState = JSON.parse(JSON.stringify(state));
      return {
        ...newState,
        selectedPartner: data,
      };
    }

    case SET_ALL_PARTNER: {
      const newState = JSON.parse(JSON.stringify(state));
      return {
        ...newState,
        partners: data,
      };
    }

    case SET_ALL_TENANTS: {
      const newState = JSON.parse(JSON.stringify(state));
      return {
        ...newState,
        allTenants: data,
      };
    }

    case SET_ALL_CUSTOMERS: {
      const newState = JSON.parse(JSON.stringify(state));
      return {
        ...newState,
        customers: data,
      };
    }
    case SET_USER_DETAILS: {
      const newState = JSON.parse(JSON.stringify(state));
      return {
        ...newState,
        userDetails: data,
      };
    }
    case SET_CUSTOMER_TENANTS: {
      const newState = JSON.parse(JSON.stringify(state));
      return {
        ...newState,
        customerTenants: data,
      };
    }
    case GET_LOGED_USER_RILES: {
      const newState = JSON.parse(JSON.stringify(state));
      return {
        ...newState,
        logedUserRoles: data,
      };
    }
    case SET_SELECTED_TENANT: {
      const newState = JSON.parse(JSON.stringify(state));
      return {
        ...newState,
        selectedTenant: data,
      };
    }
    case SET_USER_ROLES: {
      const newState = JSON.parse(JSON.stringify(state));
      return {
        ...newState,
        user: data,
      };
    }
    default:
      return state;
  }
};

export default customerReducer;
