import ReactKeycloakProvider from "phenom-auth-react-adapter";
import React from "react";
import "react-toastify/dist/ReactToastify.css";
import "../index.scss";
import Layout from "./layout/Layout";
import { InitialLoader } from "./layout/Loader";

const App = (): JSX.Element => {
  const keyCloakConfig = {
    loginHost: (window as any)._env_.APP_KEYCLOAK_URL,
    clientId: (window as any)._env_.APP_CLIENT_ID,
  };
  const eventLogger = (event: any, error: any) => {
  };
  const tokenLogger = (tokens: any) => {
  };

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
