import React from "react";
import ReactDOM from "react-dom/client"; // Note the change here
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.scss";
import store from "./store/index";
import Tracker from "@openreplay/tracker";

declare global {
  interface Window {
    openReplayTracker?: any;
  }
}
const container = document.getElementById("root") as HTMLElement;
const root = ReactDOM.createRoot(container);

try {
  const tracker = new Tracker({
    projectKey: (window as any)._env_.OPENREPLAY_PROJECT_KEY,
    ingestPoint: (window as any)._env_.OPEN_REPLAY_URL,
  });

  tracker.start({
    userID: window.keycloakInstance?.tokenParsed?.userDetails?.userName,
  });

  window.openReplayTracker = tracker;

} catch (e) {
  console.log("error starting open replay tracker");
}

root.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);
