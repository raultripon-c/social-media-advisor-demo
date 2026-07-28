import React from "react";
import { NavLink, useLocation, useParams } from "react-router-dom";

export const getCampaignStudioPaths = (customerCode?: string, refnum?: string) => {
  const base = customerCode && refnum ? `/${customerCode}/${refnum}/campaign-studio` : "/campaign-studio";
  return {
    campaigns: `${base}/campaigns`,
    contentBoard: `${base}/content-board`,
    amplify: `${base}/amplify`,
  };
};

export const CampaignStudioSubNav: React.FC = () => {
  const { customerCode, refnum } = useParams();
  const location = useLocation();
  const paths = getCampaignStudioPaths(customerCode, refnum);
  const onCampaigns = location.pathname.includes("/campaign-studio/campaigns");
  const onContentBoard = location.pathname.includes("/campaign-studio/content-board");
  const onAmplify = location.pathname.includes("/campaign-studio/amplify");

  return (
    <nav className="cs-subnav" aria-label="Social Media Advisor sections">
      <NavLink
        to={paths.campaigns}
        className={({ isActive }) => `cs-subnav__link${isActive || onCampaigns ? " is-active" : ""}`}
      >
        Campaigns
      </NavLink>
      <NavLink
        to={paths.contentBoard}
        className={({ isActive }) => `cs-subnav__link${isActive || onContentBoard ? " is-active" : ""}`}
      >
        Content Board
      </NavLink>
      <NavLink
        to={paths.amplify}
        className={({ isActive }) => `cs-subnav__link${isActive || onAmplify ? " is-active" : ""}`}
      >
        Amplify
      </NavLink>
    </nav>
  );
};
