import React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.scss";
import store from "./store/index";

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter
      basename={
        window.location.hostname.includes("localhost") ? "" : "/hrit"
      }
    >
        <App />
    </BrowserRouter>
  </Provider>,
  document.getElementById("root")
);
