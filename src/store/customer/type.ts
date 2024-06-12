import { Customer } from "../../utils/domin/Customer";

export interface CustomerState {
  data: Customer[];
  customerTenants: [];
  logedUserRoles: [];
  selectedTenant: {};
  user: {};
  customers:[];
  selectedPartner:[]
  allTenants:[]
  partners:[]
}
