import { TenantProduct, Product } from "./Product";

export interface Tenant {
  customerCode: any;
  tenantId?: string;
  refNum: string;
  customerName: string;
  tenantName?: string | "";
  customerId?: string;
  keycloakGroupId?: string;
  isParent?: boolean | false;
  defaultCountry?: any;
  segment?: any;
  defaultLocale?: any;
  locales?: any[];
  countries?: any[];
  complianceRequired?: boolean | false;
  domainUrl?: string;
  parentTenant?: any;
  licenseProducts?: TenantProduct[] | null;
  integrations?: TenantProduct[] | null;
  services?: any;
  isCanvastenant?: boolean | null;
  isExecutivetenant?: boolean | null;
}
export interface CustomerTenant {
  refNum?: string;
  tenantId?: string;
  customerName?: string | "";
  tenantName?: string | "";
  customerId?: string;
  keycloakGroupId?: string;
  isParent?: boolean | false;
  defaultCountry?: any;
  segment?: any;
  defaultLocale?: any;
  locales?: any[];
  countries?: any[];
  complianceRequired?: boolean | false;
  domainUrl?: string;
  parentTenant?: any;
  licenseProducts?: TenantProduct[] | null;
  integrations?: TenantProduct[] | null;
  services?: Product[] | null;
  attributesConfigured?:[],
  scopesConfigured?:[]
  attributesAvailable?:[];
  isCanvastenant?: boolean | null;
  isExecutivetenant?: boolean | null;
}

/**
 * Data required to create Canvas/Executive Tenant
 */
export interface CanvasExecutiveTenant {
  refNum: string;
  customerId: string;
  tenantType: string;
}
