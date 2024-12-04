import ReactKeycloakProvider from "phenom-auth-react-adapter";
import React, { useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import "../index.scss";
import Layout from "./layout/Layout";
import { InitialLoader } from "./layout/Loader";
import { APIService } from './utils/api.service';
import { triggerRefreshToken, waitForToken } from "./utils/api";

const App = (): JSX.Element => {
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
      // triggerRefreshToken();
    } catch (error) {
      console.error("Error", error);
    }
  };
  useEffect(() => {
    const interval: number = (window as any)._env_.REFRESH_TOKEN_TIMEOUT_CMS;
    console.log(interval);
    let intervalId: NodeJS.Timeout | null = null;
    if (interval) {
      intervalId = setInterval(async () => {
        await triggerRefreshToken();
      }, interval); // 10 minutes
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);
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
        <Layout  />
        <div className="notify-toaster" style={{ display: "none" }}>
          {/* <Notify /> */}
        </div>
      </ReactKeycloakProvider>
    </>
  );
};
export default App;
