
import AppRenderer from "../screens/app-studio/AppRenderer";
import DashBoard from "../layout/dashBoard/DashBoard";
export interface IRoute {
  path: string;
  component: React.FunctionComponent<any>;
}

const applayout = {
  path: "/apps",
  component: AppRenderer,
};
const platFormLevelApp = {
  path: "/apps/*",
  component: AppRenderer,
};


const dashBoard = {
  path: "/:customerCode/summary",
  component: DashBoard,
};


export const appRoutes = [
  platFormLevelApp,
  applayout,
  dashBoard,
  applayout,
];
