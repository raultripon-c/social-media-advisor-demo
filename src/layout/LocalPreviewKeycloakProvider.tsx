import React, { useMemo } from "react";
import { reactKeycloakWebContext } from "phenom-auth-react-adapter";

const mockKeycloak = {
  authenticated: false,
  token: "local-preview",
  idToken: "local-preview",
  refreshToken: "local-preview",
  tokenParsed: {
    userDetails: {
      userType: "LOCAL_PREVIEW",
      userOrg: "MIB",
      userName: "local-preview",
      id: "local-preview",
      legacyUserId: "local-preview",
    },
    name: "Local Preview",
    entitlements: [],
  },
  userInfo: {
    userDetails: {
      userType: "LOCAL_PREVIEW",
      userOrg: "MIB",
      userName: "local-preview",
      id: "local-preview",
    },
    resources: {},
  },
  bearer_token: "Bearer local-preview",
  login: async () => undefined,
  logout: async () => undefined,
  loadUserInfo: async () => ({}),
  updateToken: async () => true,
  init: async () => false,
  didInitialize: true,
};

type Props = {
  children: React.ReactNode;
};

/** Skip Phenom loginProxy/Keycloak redirects for local Campaign Studio previews. */
export const LocalPreviewKeycloakProvider: React.FC<Props> = ({ children }) => {
  const value = useMemo(
    () => ({
      initialized: true,
      isAuthenticated: false,
      isLoading: false,
      isConfigured: true,
      authClient: mockKeycloak as any,
      orgInfo: { code: "MIB", type: "LOCAL_PREVIEW" },
    }),
    [],
  );

  if (!(window as any).keycloakInstance) {
    (window as any).keycloakInstance = mockKeycloak;
  }
  (window as any).orgInfo = value.orgInfo;

  return (
    <reactKeycloakWebContext.Provider value={value as any}>
      {children}
    </reactKeycloakWebContext.Provider>
  );
};
