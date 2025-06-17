import axios, { AxiosResponse } from "axios";
import { APIService } from "./api.service";
declare global {
  interface Window {
    keycloakInstance: any;
    orgInfo: any;
  }
}

export const API = axios.create({
  baseURL: "",
  timeout: 3600000,
  validateStatus: function (status: number) {
    return (status >= 200 && status < 300) || status === 403; // default
  },
});

const redirectToLogin = () => {
  const keycloakUrl = (window as any)._env_.APP_KEYCLOAK_URL;
  if (keycloakUrl.endsWith('/login')) {
    const newUrl = keycloakUrl.slice(0, keycloakUrl.length - '/login'.length);
    window.location.href = newUrl;
  } else {
    window.location.href = keycloakUrl;
  }
};

export const waitForToken = () => {
  if (window.keycloakInstance.isTokenExpired()) {
    return new Promise<void>((resolve, reject) => {
      window.keycloakInstance
        .updateToken(-1)
        .then(async () => {
          resolve();
        })
        .catch(function () {
          sessionStorage.clear();
          redirectToLogin();
        });
      // }
    });
  }
};

export const triggerRefreshToken = async () => {
  try {
    await waitForToken();
    const { code, type } = window.orgInfo ?? {};
    code && type && APIService.triggerTxeLogin();
    const event = new CustomEvent("tokenRefreshed");
    window.dispatchEvent(event);
  } catch (error) {
    console.error("Error fetching user data", error);
  }
};

API.interceptors.request.use(async (config: any) => {
  const { code, type } = window.orgInfo;
  const keycloak = window.keycloakInstance;
  await waitForToken();
  const token = keycloak.token;
  if (token) {
    if (config.url.includes((window as any)?._env_?.ANALYTICS_SB_URL) || config.url.includes((window as any)?._env_?.ANALYTICS_SF_URL)) {
      config.headers.Authorization = token ? `${token}` : "";
      config.headers.Logintype = 'keycloak';
  } else {
      config.headers.Authorization = token ? `Bearer ${token}` : "";
    }
    config.headers["ph-org-type"] = type;
    config.headers["ph-org-code"] = code;
    return config;
  } else {
    alert("Token is expired");
  }
});
API.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.status === 403) {
      response.data = {
        data: null,
        status: false,
        errorDesc: "You are not authorized for this action",
      };
    }
    return response;
  },
  (error: Error) => {
    return Promise.reject(error);
  }
);
