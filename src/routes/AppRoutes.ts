
import DashBoard from "../layout/dashBoard/DashBoard";
import DynamicScriptLoader from "../layout/dynamicScripts/DynamicScriptLoader"
import Assets from "../screens/assets/Assets"
import Blogs from "../screens/blogs/Blogs";
import Banners from "../screens/banners/Banners";
import UnmatchedRoutePage from "../components/UnmatchedRoutePage/UnmatchedRoutePage";
import { withDynamicScript } from "../layout/dynamicScripts/WithDynamicScript";

export interface IRoute {
  path: string;
  component: React.FunctionComponent<any>;
  index?: boolean
}

const dashBoard = {
  path: "/:customerCode/:refnum/summary",
  component: DashBoard,
};

const ContenthubComponent = {
  path: "/:customerCode/:refnum/contenthub",
  component: withDynamicScript("contenthub")
};

const AssetManager = {
  path: "/:customerCode/:refnum/assets",
  component: withDynamicScript("assets"),
};

const BlogsManger = {
  path: "/:customerCode/:refnum/blogs",
  component: withDynamicScript("blogs"),
}

const BannersManager = {
  path: "/:customerCode/:refnum/banners",
  component: withDynamicScript("banners"),
}

const unmatchedRoutePage = {
  path: "*",
  component: UnmatchedRoutePage
}

export const appRoutes = [
  AssetManager,
  ContenthubComponent,
  BlogsManger,
  BannersManager,
  dashBoard,
  unmatchedRoutePage
];
