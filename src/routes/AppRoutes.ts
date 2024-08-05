
import DashBoard from "../layout/dashBoard/DashBoard";
import ContentHub from "../layout/dynamicScripts/dynamicScriptLoader"
import Assets from "../screens/assets/Assets"
import Blogs from "../screens/blogs/Blogs";
import Banners from "../screens/banners/Banners";
export interface IRoute {
  path: string;
  component: React.FunctionComponent<any>;
}


const dashBoard = {
  path: "/:customerCode/summary",
  component: DashBoard,
};

const ContenthubComponent = {
  path: "/:customerCode/:refnum/contenthub",
  component: ContentHub,
};
const AssetManager = {
  path: "/:customerCode/:refnum/assets",
  component: Assets,
};

const BlogsManger = {
  path: "/:customerCode/:refnum/blogs",
  component: Blogs,
}

const BannersManager = {
  path: "/:customerCode/:refnum/banners",
  component: Banners,
}

export const appRoutes = [
  AssetManager,
  ContenthubComponent,
  BlogsManger,
  BannersManager,
  dashBoard,
];
