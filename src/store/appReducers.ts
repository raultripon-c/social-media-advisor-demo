import { combineReducers } from "redux";
import customerReducer from "./customer/customerReducer";
import { appReducer } from "./apps/reducer";

export const rootReducer = combineReducers({
  customer: customerReducer,
  app: appReducer,
});
