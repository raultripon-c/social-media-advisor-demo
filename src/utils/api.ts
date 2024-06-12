import axios, { AxiosResponse } from "axios";
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
const waitForToken = () => {
  if (window.keycloakInstance.isTokenExpired()) {
    return new Promise<void>((resolve, reject) => {
      window.keycloakInstance
        .updateToken(-1)
        .then(function () {
          resolve();
        })
        .catch(function () {
          sessionStorage.clear();
        });
      // }
    });
  }
};

API.interceptors.request.use(async (config: any) => {
  const { code, type } = window.orgInfo;
  const keycloak = window.keycloakInstance;
  await waitForToken();
  const token = keycloak.token;
  if (token) {
    config.headers.Authorization = token ? `Bearer ${token}` : "";
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
