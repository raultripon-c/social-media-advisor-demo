import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useParams } from "react-router-dom";
import {
  ADVOCACY_BRIDGE_EVENT,
  getPendingSuggestionCount,
} from "../AdvocacyDemoShell/advocacyDemoBridge";

export const getCampaignStudioPaths = (customerCode?: string, refnum?: string) => {
  const base = customerCode && refnum ? `/${customerCode}/${refnum}/campaign-studio` : "/campaign-studio";
  return {
    engagement: `${base}/engagement`,
    campaigns: `${base}/campaigns`,
    contentBoard: `${base}/content-board`,
    employeeAdvocacy: `${base}/employee-advocacy`,
  };
};

export const getSharePackDetailPath = (customerCode?: string, refnum?: string, packId?: string) => {
  const base = customerCode && refnum ? `/${customerCode}/${refnum}/campaign-studio` : "/campaign-studio";
  return `${base}/employee-advocacy/${packId || ""}`;
};

const NavCountBadge = ({ count }: { count: number }) => {
  if (count <= 0) return null;
  return (
    <span className="cs-subnav__badge" aria-label={`${count} pending`}>
      {count > 9 ? "9+" : count}
    </span>
  );
};

export const CampaignStudioSubNav: React.FC = () => {
  const { customerCode, refnum } = useParams();
  const location = useLocation();
  const paths = getCampaignStudioPaths(customerCode, refnum);
  const [pendingSuggestions, setPendingSuggestions] = useState(0);
  const onEngagement = location.pathname.includes("/campaign-studio/engagement");
  const onCampaigns = location.pathname.includes("/campaign-studio/campaigns");
  const onContentBoard = location.pathname.includes("/campaign-studio/content-board");
  const onEmployeeAdvocacy =
    location.pathname.includes("/campaign-studio/employee-advocacy") ||
    location.pathname.includes("/campaign-studio/amplify");

  useEffect(() => {
    const refresh = () => setPendingSuggestions(getPendingSuggestionCount());
    refresh();
    const onBridgeUpdate = () => refresh();
    const onStorage = (event: StorageEvent) => {
      if (event.key?.includes("employee-advocacy")) refresh();
    };
    window.addEventListener(ADVOCACY_BRIDGE_EVENT, onBridgeUpdate);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(ADVOCACY_BRIDGE_EVENT, onBridgeUpdate);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return (
    <nav className="cs-subnav" aria-label="Social Media Advisor sections">
      <NavLink
        to={paths.engagement}
        className={({ isActive }) => `cs-subnav__link${isActive || onEngagement ? " is-active" : ""}`}
      >
        Dashboard
      </NavLink>
      <NavLink
        to={paths.campaigns}
        className={({ isActive }) => `cs-subnav__link${isActive || onCampaigns ? " is-active" : ""}`}
      >
        Campaigns
      </NavLink>
      <NavLink
        to={paths.employeeAdvocacy}
        className={({ isActive }) => `cs-subnav__link${isActive || onEmployeeAdvocacy ? " is-active" : ""}`}
      >
        Employee Advocacy
        <NavCountBadge count={pendingSuggestions} />
      </NavLink>
      <NavLink
        to={paths.contentBoard}
        className={({ isActive }) => `cs-subnav__link${isActive || onContentBoard ? " is-active" : ""}`}
      >
        Content Board
      </NavLink>
    </nav>
  );
};
