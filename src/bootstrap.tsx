import React from "react";
import ReactDOM from "react-dom/client"; // Note the change here
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";
import App from "./App";
import "./index.scss";
import store from "./store/index";

const container = document.getElementById("root") as HTMLElement;
const root = ReactDOM.createRoot(container);

root.render(
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
);
