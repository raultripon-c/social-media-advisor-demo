import React, { useEffect } from "react";
import ReactKeycloakProvider from "phenom-auth-react-adapter";
import { InitialLoader } from "./layout/Loader";
import Layout from "./layout/Layout";
import { useSubPath } from "./SubPathContext";
import "react-toastify/dist/ReactToastify.css";
import "../index.scss";
import { isEmpty } from "lodash";

const App = (): JSX.Element => {
  const keyCloakConfig = {
    loginHost: (window as any)._env_.APP_KEYCLOAK_URL,
    clientId: "onephenom-ui",
  };
  const eventLogger = (event: any, error: any) => {
  };
  const tokenLogger = (tokens: any) => {
  };
  const { subPath, setSubPath } = useSubPath();
  useEffect(() => {
    if (window.location.hostname.includes("localhost")) {
      setSubPath("");
    } else {
      setSubPath("hrit");
    }
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
