import { TenantProduct } from "./Product";

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