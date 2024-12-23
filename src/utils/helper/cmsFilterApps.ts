import { APIService } from '../api.service';

export const cmsFilterApps = async (refNum: string) => {
  (window as any).isCMSFilterAPICompleted = false;
  if (document.cookie.includes('token')) {
    checkCanvasSite(refNum);
  }
  else {
    await APIService.triggerTxeLogin();
    checkCanvasSite(refNum);
  }
}

const checkCanvasSite = (refNum: string) => {
  APIService.isCanvasSite(refNum).then(x => {
    const isCanvasTenant = x;
    const userHasCmsKeyCloakAccess = window?.keycloakInstance?.userInfo?.resources["cms"] &&
      window?.keycloakInstance?.userInfo?.resources["cms"].roles.length > 0 ||
      window?.keycloakInstance?.userInfo?.resources[`${(refNum).toLowerCase()}-cms`] &&
      window?.keycloakInstance?.userInfo?.resources[`${(refNum).toLowerCase()}-cms`].roles.length > 0;
    if (isCanvasTenant === null) {
      (window as any).userHasCmsAccess = false;
    } else {
      (window as any).userHasCmsAccess = userHasCmsKeyCloakAccess;
    }
    sessionStorage.setItem('isCanvasSite', isCanvasTenant);
    if (isCanvasTenant) {
      (window as any).showBanners = true;
    } else {
      (window as any).showBanners = false;
    }
    (window as any).isCMSFilterAPICompleted = true;
  })

}