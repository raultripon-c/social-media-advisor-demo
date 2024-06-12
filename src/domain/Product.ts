

export interface Product {
  imageUri?: any;
  name: string;
  id: number;
  title: string;
  version: string;
  releasedDate?: string;
  vendorId: string;
  authTypes: string[];
  data?: any;
  productCategoryName:string;
  offeredAs:string;
}

export interface TenantProduct {
  name?: string;
  id: number;
  status?:string;
  appId?: string;
  title?: string;
  envCode?: string;
  version?: string;
  category?: string;
  categoryDesc?: string;
  offeredAs?: string;
  description?: string;
  imageUri?: string;
  configurations?: any;
  realmName?: string;
  releasedDate?: string;
  rolesAvailable?: boolean;
  vendorId?: string;
  vendorLogo?: string;
  authTypes?: string[];
}
