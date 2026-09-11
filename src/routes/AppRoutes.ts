
import DashBoard from "../layout/dashBoard/DashBoard";
import UnmatchedRoutePage from "../components/UnmatchedRoutePage/UnmatchedRoutePage";
import CreateContentCluster from "../screens/CreateContentCluster/CreateContentCluster";
import ClusterDetails from "../screens/ContentClusterDetails/ContentClusterDetails";
import ContentClustersList from "../screens/ContentClustersList/ContentClustersList";
import CandidateJourneys from "../screens/CandidateJourneys/CandidateJourneys";
import CampaignStudioAllCampaigns from "../screens/CampaignStudioAllCampaigns/CampaignStudioAllCampaigns";
import CampaignStudioNewCampaign from "../screens/CampaignStudioNewCampaign/CampaignStudioNewCampaign";
import CampaignStudioDashboard from "../screens/CampaignStudioDashboard/CampaignStudioDashboard";
import CampaignStudioOnePage from "../screens/CampaignStudioOnePage/CampaignStudioOnePage";
import CampaignStudioContentBoard from "../screens/CampaignStudioContentBoard/CampaignStudioContentBoard";
import CampaignStudioAmplify from "../screens/CampaignStudioAmplify/CampaignStudioAmplify";
import CampaignStudioAmplifyRedirect from "../screens/CampaignStudioAmplify/CampaignStudioAmplifyRedirect";
import CampaignStudioSharePackDetail from "../screens/CampaignStudioSharePackDetail/CampaignStudioSharePackDetail";
import CampaignStudioEngagement from "../screens/CampaignStudioEngagement/CampaignStudioEngagement";
import CampaignStudioRootRedirect from "../screens/CampaignStudioRootRedirect/CampaignStudioRootRedirect";
import { campaignStudioDemoRoutes } from "./campaignStudioDemoRoutes";
import { withDynamicScript } from "../layout/dynamicScripts/WithDynamicScript";

const isSmaDemoOnlyBuild = process.env.SMA_DEMO_ONLY === "true";
const isGithubPagesBuild = Boolean(process.env.APP_BASE_PATH);

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

const campaignStudioNew = {
  path: "/:customerCode/:refnum/campaign-studio-new",
  component: CampaignStudioAllCampaigns,
}

const campaignStudioEngagement = {
  path: "/:customerCode/:refnum/campaign-studio/engagement",
  component: CampaignStudioEngagement,
}

const campaignStudioAllCampaigns = {
  path: "/:customerCode/:refnum/campaign-studio/campaigns",
  component: CampaignStudioAllCampaigns,
}

const campaignStudioNewCampaign = {
  path: "/:customerCode/:refnum/campaign-studio/campaigns/new",
  component: CampaignStudioNewCampaign,
}

const campaignStudioWorkspace = {
  path: "/:customerCode/:refnum/campaign-studio/campaigns/workspace/:campaignWorkspaceId",
  component: CampaignStudioOnePage,
}

const campaignStudioDashboard = {
  path: "/:customerCode/:refnum/campaign-studio/campaigns/:campaignId/dashboard",
  component: CampaignStudioDashboard,
}

const campaignStudioContentBoard = {
  path: "/:customerCode/:refnum/campaign-studio/content-board",
  component: CampaignStudioContentBoard,
}

const campaignStudioAmplify = {
  path: "/:customerCode/:refnum/campaign-studio/employee-advocacy",
  component: CampaignStudioAmplify,
}

const campaignStudioAmplifyLegacy = {
  path: "/:customerCode/:refnum/campaign-studio/amplify",
  component: CampaignStudioAmplifyRedirect,
}

const campaignStudioSharePackDetail = {
  path: "/:customerCode/:refnum/campaign-studio/employee-advocacy/:packId",
  component: CampaignStudioSharePackDetail,
}

const localCampaignStudioEngagement = {
  path: "/campaign-studio/engagement",
  component: CampaignStudioEngagement,
}

const localCampaignStudioAllCampaigns = {
  path: "/campaign-studio/campaigns",
  component: CampaignStudioAllCampaigns,
}

const localCampaignStudioNewCampaign = {
  path: "/campaign-studio/campaigns/new",
  component: CampaignStudioNewCampaign,
}

const localCampaignStudioWorkspace = {
  path: "/campaign-studio/campaigns/workspace/:campaignWorkspaceId",
  component: CampaignStudioOnePage,
}

const localCampaignStudioDashboard = {
  path: "/campaign-studio/campaigns/:campaignId/dashboard",
  component: CampaignStudioDashboard,
}

const localCampaignStudioContentBoard = {
  path: "/campaign-studio/content-board",
  component: CampaignStudioContentBoard,
}

const localCampaignStudioAmplify = {
  path: "/campaign-studio/employee-advocacy",
  component: CampaignStudioAmplify,
}

const localCampaignStudioAmplifyLegacy = {
  path: "/campaign-studio/amplify",
  component: CampaignStudioAmplifyRedirect,
}

const localCampaignStudioSharePackDetail = {
  path: "/campaign-studio/employee-advocacy/:packId",
  component: CampaignStudioSharePackDetail,
}

const campaignStudioRootRedirect = {
  path: "/",
  component: CampaignStudioRootRedirect,
};

const unmatchedRoutePage = {
  path: "*",
  component: UnmatchedRoutePage
}

const fullAppRoutes = [
  AssetManager,
  ContenthubComponent,
  BlogsManger,
  BannersManager,
  dashBoard,
  clusterCreate,
  clusterDetail,
  clusterList,
  candidateJourneys,
  campaignStudioNew,
  campaignStudioEngagement,
  campaignStudioAllCampaigns,
  campaignStudioNewCampaign,
  campaignStudioWorkspace,
  campaignStudioDashboard,
  campaignStudioContentBoard,
  campaignStudioAmplify,
  campaignStudioAmplifyLegacy,
  campaignStudioSharePackDetail,
  localCampaignStudioEngagement,
  localCampaignStudioAllCampaigns,
  localCampaignStudioNewCampaign,
  localCampaignStudioWorkspace,
  localCampaignStudioDashboard,
  localCampaignStudioContentBoard,
  localCampaignStudioAmplify,
  localCampaignStudioAmplifyLegacy,
  localCampaignStudioSharePackDetail,
  ...(isGithubPagesBuild ? [campaignStudioRootRedirect] : []),
  unmatchedRoutePage,
];

export const appRoutes = isSmaDemoOnlyBuild ? campaignStudioDemoRoutes : fullAppRoutes;
