import { APIService } from '../api.service';

export const cmsFilterApps = async (refNum: string) => {
    if (document.cookie.includes('token')) {
        await checkCanvasSite(refNum);
    }
    else {
      await APIService.triggerTxeLogin();
      await checkCanvasSite(refNum);
    }
}

const checkCanvasSite = async (refNum: string) => {
    // const selectedTenantFromSession = localStorage.getItem('selectedTenant');
    // if (selectedTenantFromSession) {
      const isCanvasTenant = await APIService.isCanvasSite(refNum);
      const userHasCmsKeyCloakAccess = window?.keycloakInstance?.userInfo?.resources["cms"] &&
        window?.keycloakInstance?.userInfo?.resources["cms"].roles.length > 0 || 
        window?.keycloakInstance?.userInfo?.resources[`${(refNum).toLowerCase()}-cms`] && 
        window?.keycloakInstance?.userInfo?.resources[`${(refNum).toLowerCase()}-cms`].roles.length > 0;
      if(isCanvasTenant === null) {
        (window as any).userHasCmsAccess = false;
      } else {
        (window as any).userHasCmsAccess = userHasCmsKeyCloakAccess;
      }
      sessionStorage.setItem('isCanvasSite', isCanvasTenant);
      if(isCanvasTenant) {
        (window as any).showBanners = true;
      } else {
        (window as any).showBanners = false;
      }
      // if (!isCanvasTenant) {
      //   const parentIndex = appsData.findIndex((item: any) => item.name === "Experiences");
      //   if (parentIndex !== -1) {
      //     appsData[parentIndex].children = appsData[parentIndex].children.filter((child: any) => child.name !== "Banners");
      //     setCustomerTenantApps(appsData);
      //   }
      // }
    // }
  }