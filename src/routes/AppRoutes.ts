
import DashBoard from "../layout/dashBoard/DashBoard";
import UnmatchedRoutePage from "../components/UnmatchedRoutePage/UnmatchedRoutePage";
import CreateContentCluster from "../screens/CreateContentCluster/CreateContentCluster";
import ClusterDetails from "../screens/ContentClusterDetails/ContentClusterDetails";
import ContentClustersList from "../screens/ContentClustersList/ContentClustersList";
import CandidateJourneys from "../screens/CandidateJourneys/CandidateJourneys";
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

const clusterCreate = {
  path: "/:customerCode/:refnum/content-cluster/create",
  component: CreateContentCluster,
}

const clusterDetail = {
  path: "/:customerCode/:refnum/content-cluster/:clusterId",
  component: ClusterDetails
}

const clusterList = {
  path: "/:customerCode/:refnum/content-clusters",
  component: ContentClustersList
}

const candidateJourneys = {
  path: "/:customerCode/:refnum/candidate-journeys",
  component: CandidateJourneys,
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
  clusterCreate,
  clusterDetail,
  clusterList,
  candidateJourneys,
  unmatchedRoutePage
];
