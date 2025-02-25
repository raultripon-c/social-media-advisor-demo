
import DashBoard from "../layout/dashBoard/DashBoard";
import UnmatchedRoutePage from "../components/UnmatchedRoutePage/UnmatchedRoutePage";
import ContentCluster from "../screens/genai/ContentCluster";
import ClusterDetails from "../screens/ClusterDetails/ClusterDetails";
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

const genai = {
  path: "/:customerCode/:refnum/content-cluster/create",
  component: ContentCluster,
}

const clusterDetail = {
  path: "/:customerCode/:refnum/content-cluster/:clusterId",
  component: ClusterDetails
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
  genai,
  clusterDetail,
  unmatchedRoutePage
];
