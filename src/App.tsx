import ReactKeycloakProvider from "phenom-auth-react-adapter";
import React, { useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import "../index.scss";
import Layout from "./layout/Layout";
import { InitialLoader } from "./layout/Loader";
import { LocalPreviewKeycloakProvider } from "./layout/LocalPreviewKeycloakProvider";
import { FeatureFlagsProvider } from "./context/FeatureFlagsContext";
import { triggerRefreshToken } from "./utils/api";

/** When true, opening Candidate Journeys from the sidebar runs the same flow as Generate Journeys */
const autoGenerateCandidateJourneysOnSidebarNav = true;

const App = (): JSX.Element => {
  const isLocalCampaignStudioPreview = window.location.pathname.startsWith("/campaign-studio/");
  const keyCloakConfig = {
    loginHost: (window as any)._env_.APP_KEYCLOAK_URL,
    clientId: (window as any)._env_.APP_CLIENT_ID,
  };
  const eventLogger = async(event: any, error: any) => {
    if(event === "onAuthRefreshSuccess") {
      console.log("token refreshed event listned successfully", event, error);
      await triggerRefreshToken();
    }
  };
  const tokenLogger = (tokens: any) => {
    try {
      console.log("onKeycloaktokenEvent from TXE", tokens);
    } catch (error) {
      console.error("Error", error);
    }
  };
  useEffect(() => {
    if (isLocalCampaignStudioPreview) return undefined;
    const interval: number = new Function(`return ${(window as any)._env_.REFRESH_TOKEN_TIMEOUT_CMS}`)() || 10 * 60 * 1000;
    let intervalId: NodeJS.Timeout | null = null;
    if (interval) {
      intervalId = setInterval(async () => {
        await triggerRefreshToken();
      }, interval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isLocalCampaignStudioPreview]);

  const appTree = (
    <FeatureFlagsProvider
      value={{ autoGenerateCandidateJourneysOnSidebarNav }}
    >
      <Layout />
    </FeatureFlagsProvider>
  );

  if (isLocalCampaignStudioPreview) {
    return <LocalPreviewKeycloakProvider>{appTree}</LocalPreviewKeycloakProvider>;
  }

  return (
    <>
      <ReactKeycloakProvider
        clientConfig={keyCloakConfig}
        initOptions={{
          onLoad: "check-sso",
          silentCheckSsoRedirectUri:
            window.location.origin  +
            "/public/silent-check-sso.html",
        }}
        LoadingComponent={<InitialLoader show={true} />}
        onEvent={eventLogger}
        onTokens={tokenLogger}
      >
        {appTree}
        <div className="notify-toaster" style={{ display: "none" }}>
          {/* <Notify /> */}
        </div>
      </ReactKeycloakProvider>
    </>
  );
};
export default App;
