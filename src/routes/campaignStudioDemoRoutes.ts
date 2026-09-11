import CampaignStudioAllCampaigns from "../screens/CampaignStudioAllCampaigns/CampaignStudioAllCampaigns";
import CampaignStudioAmplify from "../screens/CampaignStudioAmplify/CampaignStudioAmplify";
import CampaignStudioAmplifyRedirect from "../screens/CampaignStudioAmplify/CampaignStudioAmplifyRedirect";
import CampaignStudioContentBoard from "../screens/CampaignStudioContentBoard/CampaignStudioContentBoard";
import CampaignStudioDashboard from "../screens/CampaignStudioDashboard/CampaignStudioDashboard";
import CampaignStudioEngagement from "../screens/CampaignStudioEngagement/CampaignStudioEngagement";
import CampaignStudioNewCampaign from "../screens/CampaignStudioNewCampaign/CampaignStudioNewCampaign";
import CampaignStudioOnePage from "../screens/CampaignStudioOnePage/CampaignStudioOnePage";
import CampaignStudioRootRedirect from "../screens/CampaignStudioRootRedirect/CampaignStudioRootRedirect";
import CampaignStudioSharePackDetail from "../screens/CampaignStudioSharePackDetail/CampaignStudioSharePackDetail";

export interface IRoute {
  path: string;
  component: React.FunctionComponent<any>;
  index?: boolean;
}

const campaignStudioRootRedirect = {
  path: "/",
  component: CampaignStudioRootRedirect,
};

const localCampaignStudioEngagement = {
  path: "/campaign-studio/engagement",
  component: CampaignStudioEngagement,
};

const localCampaignStudioAllCampaigns = {
  path: "/campaign-studio/campaigns",
  component: CampaignStudioAllCampaigns,
};

const localCampaignStudioNewCampaign = {
  path: "/campaign-studio/campaigns/new",
  component: CampaignStudioNewCampaign,
};

const localCampaignStudioWorkspace = {
  path: "/campaign-studio/campaigns/workspace/:campaignWorkspaceId",
  component: CampaignStudioOnePage,
};

const localCampaignStudioDashboard = {
  path: "/campaign-studio/campaigns/:campaignId/dashboard",
  component: CampaignStudioDashboard,
};

const localCampaignStudioContentBoard = {
  path: "/campaign-studio/content-board",
  component: CampaignStudioContentBoard,
};

const localCampaignStudioAmplify = {
  path: "/campaign-studio/employee-advocacy",
  component: CampaignStudioAmplify,
};

const localCampaignStudioAmplifyLegacy = {
  path: "/campaign-studio/amplify",
  component: CampaignStudioAmplifyRedirect,
};

const localCampaignStudioSharePackDetail = {
  path: "/campaign-studio/employee-advocacy/:packId",
  component: CampaignStudioSharePackDetail,
};

const campaignStudioFallbackRedirect = {
  path: "*",
  component: CampaignStudioRootRedirect,
};

export const campaignStudioDemoRoutes: IRoute[] = [
  localCampaignStudioEngagement,
  localCampaignStudioAllCampaigns,
  localCampaignStudioNewCampaign,
  localCampaignStudioWorkspace,
  localCampaignStudioDashboard,
  localCampaignStudioContentBoard,
  localCampaignStudioAmplify,
  localCampaignStudioAmplifyLegacy,
  localCampaignStudioSharePackDetail,
  campaignStudioRootRedirect,
  campaignStudioFallbackRedirect,
];
