
import DashBoard from "../layout/dashBoard/DashBoard";
export interface IRoute {
  path: string;
  component: React.FunctionComponent<any>;
}


const dashBoard = {
  path: "/:customerCode/summary",
  component: DashBoard,
};


export const appRoutes = [
  dashBoard,
];
