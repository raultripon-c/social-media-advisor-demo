import {
  Avatar,
  Button,
  EmptyState,
  Input,
  Loader,
  TextArea,
} from "@phenom/react-ui-components";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import downloadIcon from "../../../assets/svg/download.svg";
import linkIcon from "../../../assets/svg/link.svg";
import copyIcon from "../../../assets/svg/copy.svg";
import checkIcon from "../../../assets/svg/check.svg";
import infoIcon from "../../../assets/svg/info.svg";
import oneHealthLogo from "../../../assets/campaign-studio/one-health-logo-avatar.png";
import linkedinLogo from "../../../assets/svg/social/linkedin-logo.svg";
import facebookLogo from "../../../assets/svg/social/facebook-logo.svg";
import xLogo from "../../../assets/svg/social/x-logo.svg";
import instagramLogo from "../../../assets/svg/social/instagram-logo.svg";
import enhanceIcon from "../../../assets/svg/enhanceIcon.svg";
import refreshIcon from "../../../assets/svg/refresh.svg";
import fileIcon from "../../../assets/svg/file.svg";
import homeIcon from "../../../assets/svg/HomeVectorGrey.svg";
import shareNodesIcon from "../../../assets/svg/social/share-nodes.svg";
import usersIcon from "../../../assets/svg/users.svg";
import chartSimpleIcon from "../../../assets/svg/social/chart-simple.svg";
import penIcon from "../../../assets/svg/pen.svg";
import {
  ADVOCACY_BRIDGE_EVENT,
  clearUnreadEmployeeStories,
  dispatchAdvocacyBridgeUpdate,
  getUnreadEmployeeStoryCount,
} from "../AdvocacyDemoShell/advocacyDemoBridge";
import {
  employeeAdvocacyAdapter,
  suggestionAssetOptions,
  trackAdvocacyEvent,
} from "./employeeAdvocacyData";
import {
  Advocate,
  AdvocacyPlatform,
  ConnectedSocialAccount,
  AnalyticsOverviewMetric,
  AnalyticsTrend,
  LeaderboardMetric,
  LeaderboardPeriod,
  PostSuggestion,
  Sharepack,
  SharepackStatus,
  SharePostStats,
  StorySortOption,
  SuggestionDraft,
  SuggestionStatus,
  WorkspaceData,
  WorkspaceSection,
} from "./types";
import { UiDropdown } from "../UiDropdown";
import { UiMultiSelect } from "../UiMultiSelect";
import "../CampaignStudio.css";
import "./EmployeeAdvocacyWorkspace.css";

const EMPTY_DRAFT: SuggestionDraft = {
  title: "",
  text: "",
  platforms: [],
  assetId: "",
};

type NavIconName = "home" | "shares" | "leaderboard" | "analytics" | "suggestions";

const NAV_ITEMS: Array<{
  id: WorkspaceSection;
  label: string;
  description: string;
  icon: NavIconName;
}> = [
  { id: "home", label: "Home", description: "Assigned sharepacks", icon: "home" },
  {
    id: "shares",
    label: "My Shares",
    description: "Your share activity",
    icon: "shares",
  },
  {
    id: "leaderboard",
    label: "Leaderboard",
    description: "Rank and points",
    icon: "leaderboard",
  },
  {
    id: "analytics",
    label: "Analytics",
    description: "Your campaigns",
    icon: "analytics",
  },
  {
    id: "suggestions",
    label: "My Suggestions",
    description: "Ideas and approvals",
    icon: "suggestions",
  },
];

const NAV_ICON_SRC: Record<NavIconName, string> = {
  home: homeIcon,
  shares: shareNodesIcon,
  leaderboard: usersIcon,
  analytics: chartSimpleIcon,
  suggestions: penIcon,
};

const NavIcon = ({ icon }: { icon: NavIconName }) => (
  <img src={NAV_ICON_SRC[icon]} alt="" className="eaw-nav-item__icon-img" />
);

const NavCountBadge = ({ count }: { count: number }) => {
  if (count <= 0) return null;
  return (
    <span className="eaw-nav-item__badge" aria-label={`${count} new`}>
      {count > 9 ? "9+" : count}
    </span>
  );
};

const STATUS_LABELS: Record<SharepackStatus, string> = {
  new: "New",
  viewed: "Viewed",
  downloaded: "Downloaded",
  shared: "Self-reported shared",
  expired: "Expired",
  withdrawn: "Withdrawn",
  unavailable: "Unavailable",
};

const SUGGESTION_STATUS_LABELS: Record<SuggestionStatus, string> = {
  pending: "Pending approval",
  approved: "Approved",
  rejected: "Rejected",
  changes_requested: "Changes requested",
};

const sectionTitles: Record<
  WorkspaceSection,
  { title: string; description: string }
> = {
  home: {
    title: "Employee advocacy",
    description:
      "Discover approved content assigned to you and prepare it for manual sharing.",
  },
  shares: {
    title: "My Shares",
    description: "Posts you have shared to your connected social accounts.",
  },
  leaderboard: {
    title: "All Advocates",
    description:
      "See advocacy standings for the selected period and metric.",
  },
  analytics: {
    title: "Analytics",
    description: "Track performance across your shared posts.",
  },
  suggestions: {
    title: "My Suggestions",
    description: "Propose new content and follow its approval status.",
  },
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));

const formatShortDate = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
    timeZone: "UTC",
  }).format(new Date(date));

const formatShareDateGroup = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
  }).format(new Date(date));

const formatShareTime = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(new Date(date))
    .toLowerCase();

const formatRelativeTime = (date: string) => {
  const diffMs = Date.now() - new Date(date).getTime();
  const minutes = Math.max(Math.floor(diffMs / 60000), 0);
  if (minutes < 1) return "Just now";
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

const groupSharesByDate = (shares: Sharepack[]) => {
  const groups = new Map<string, Sharepack[]>();

  shares.forEach((sharepack) => {
    const dateKey = sharepack.sharedAt || sharepack.assignedAt;
    const label = formatShareDateGroup(dateKey);
    const existing = groups.get(label) || [];
    existing.push(sharepack);
    groups.set(label, existing);
  });

  return Array.from(groups.entries());
};

const groupSuggestionsByDate = (suggestions: PostSuggestion[]) => {
  const groups = new Map<string, PostSuggestion[]>();

  suggestions.forEach((suggestion) => {
    const label = formatShareDateGroup(suggestion.submittedAt);
    const existing = groups.get(label) || [];
    existing.push(suggestion);
    groups.set(label, existing);
  });

  return Array.from(groups.entries());
};

const PLATFORM_LOGOS: Record<AdvocacyPlatform, string> = {
  linkedin: linkedinLogo,
  facebook: facebookLogo,
  x: xLogo,
  instagram: instagramLogo,
};

const PLATFORM_LABELS: Record<AdvocacyPlatform, string> = {
  linkedin: "LinkedIn",
  facebook: "Facebook",
  x: "X",
  instagram: "Instagram",
};

const PLATFORM_SELECT_OPTIONS = (
  Object.keys(PLATFORM_LABELS) as AdvocacyPlatform[]
).map((platform) => ({
  label: PLATFORM_LABELS[platform],
  value: platform,
}));

const STORY_SORT_OPTIONS: Array<{ label: string; value: StorySortOption }> = [
  { label: "Most Recent", value: "recent" },
  { label: "Most Shared", value: "shared" },
];

const SHARE_SCHEDULE_OPTIONS = [
  "Best posting times",
  "Automagically schedule",
  "Pick date and time",
] as const;

const DEFAULT_SHARE_POST_STATS: SharePostStats = {
  shares: 0,
  applies: 0,
  linkClicks: 0,
  comments: 0,
  reactions: 0,
  impressions: 0,
  hires: 0,
};

const SHARE_STORY_STAT_ITEMS: Array<{
  key: keyof SharePostStats;
  label: string;
}> = [
  { key: "shares", label: "Shares" },
  { key: "applies", label: "Applies" },
  { key: "linkClicks", label: "Link Clicks" },
  { key: "comments", label: "Comments" },
  { key: "reactions", label: "Reactions" },
  { key: "impressions", label: "Impressions" },
  { key: "hires", label: "Hires" },
];

const OverlayPortal = ({ children }: { children: React.ReactNode }) => {
  if (typeof document === "undefined") return <>{children}</>;
  return createPortal(children, document.body);
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat(undefined).format(value);

const ShareStoryStatsGrid = ({ stats }: { stats: SharePostStats }) => (
  <div className="eaw-share-modal__stats" aria-label="Post performance">
    {SHARE_STORY_STAT_ITEMS.map(({ key, label }) => (
      <article key={key} className="eaw-share-modal__stat">
        <span>{label}</span>
        <strong>{formatNumber(stats[key])}</strong>
      </article>
    ))}
  </div>
);

const isUnavailable = (status: SharepackStatus) =>
  status === "expired" ||
  status === "withdrawn" ||
  status === "unavailable";

type DsButtonProps = {
  text: string;
  onClick: () => void;
  buttonType?: "primary" | "primary-sub" | "secondary" | "naked" | "naked-sub";
  size?: "xs" | "small" | "big";
  disabled?: boolean;
  className?: string;
  iconLeft?: string;
};

const DsButton: React.FC<DsButtonProps> = ({
  text,
  onClick,
  buttonType = "primary",
  size = "small",
  disabled,
  className,
  iconLeft,
}) => (
  <Button
    text={text}
    onClick={onClick}
    buttonType={buttonType}
    size={size}
    disabled={disabled}
    className={`${className || ""} ${
      iconLeft ? "" : "eaw-button--text-only"
    }`.trim()}
    iconLeft={iconLeft}
  />
);

const Status = ({
  status,
  suggestion,
}: {
  status: SharepackStatus | SuggestionStatus;
  suggestion?: boolean;
}) => {
  const label = suggestion
    ? SUGGESTION_STATUS_LABELS[status as SuggestionStatus]
    : STATUS_LABELS[status as SharepackStatus];
  return (
    <span
      className={`eaw-status eaw-status--${status.replace("_", "-")}`}
      aria-label={`Status: ${label}`}
    >
      {label}
    </span>
  );
};

const Feedback = ({
  message,
  tone = "success",
  onDismiss,
}: {
  message: string;
  tone?: "success" | "info" | "error";
  onDismiss?: () => void;
}) => (
  <div className={`eaw-feedback eaw-feedback--${tone}`} role="status">
    <img src={tone === "success" ? checkIcon : infoIcon} alt="" />
    <span>{message}</span>
    {onDismiss && (
      <DsButton
        text="Dismiss"
        onClick={onDismiss}
        buttonType="naked"
        size="xs"
        className="eaw-feedback__dismiss"
      />
    )}
  </div>
);

const SharepackCard = ({
  sharepack,
  onOpen,
}: {
  sharepack: Sharepack;
  onOpen: (sharepack: Sharepack) => void;
}) => {
  const unavailable = isUnavailable(sharepack.status);

  return (
    <article
      className={`eaw-sharepack-card ${
        unavailable ? "eaw-sharepack-card--unavailable" : ""
      }`}
    >
      <div className="eaw-sharepack-card__media">
        <img src={sharepack.image} alt="" />
        <Status status={sharepack.status} />
      </div>
      <div className="eaw-sharepack-card__body">
        <div className="eaw-sharepack-card__eyebrow">
          <span>{sharepack.campaignName}</span>
          <span aria-hidden="true">•</span>
          <span>{sharepack.topic}</span>
        </div>
        <h3>{sharepack.title}</h3>
        <p>{sharepack.description}</p>
        <dl className="eaw-sharepack-card__dates">
          <div>
            <dt>Assigned</dt>
            <dd>{formatDate(sharepack.assignedAt)}</dd>
          </div>
          <div>
            <dt>{sharepack.status === "expired" ? "Expired" : "Available until"}</dt>
            <dd>{formatDate(sharepack.expiresAt)}</dd>
          </div>
        </dl>
        <div className="eaw-sharepack-card__footer">
          <span>{sharepack.destinationLabel}</span>
          <DsButton
            text={unavailable ? "View details" : "Prepare to share"}
            onClick={() => onOpen(sharepack)}
            buttonType={unavailable ? "secondary" : "primary"}
          />
        </div>
      </div>
    </article>
  );
};

const SharepackGrid = ({
  sharepacks,
  onOpen,
  emptyTitle,
  emptyMessage,
}: {
  sharepacks: Sharepack[];
  onOpen: (sharepack: Sharepack) => void;
  emptyTitle: string;
  emptyMessage: string;
}) => {
  if (sharepacks.length === 0) {
    return (
      <div className="eaw-empty">
        <EmptyState
          stateType="empty"
          displayText={emptyTitle}
          errorMessage={emptyMessage}
        />
      </div>
    );
  }

  return (
    <div className="eaw-sharepack-grid">
      {sharepacks.map((sharepack) => (
        <SharepackCard
          key={sharepack.id}
          sharepack={sharepack}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
};

const PlatformIcons = ({ platforms }: { platforms: AdvocacyPlatform[] }) => (
  <span className="eaw-story-row__platforms" aria-label="Suggested platforms">
    {platforms.map((platform) => (
      <img
        key={platform}
        src={PLATFORM_LOGOS[platform]}
        alt={PLATFORM_LABELS[platform]}
        title={PLATFORM_LABELS[platform]}
      />
    ))}
  </span>
);

const StoryRow = ({
  sharepack,
  onShare,
}: {
  sharepack: Sharepack;
  onShare: (sharepack: Sharepack) => void;
}) => {
  const unavailable = isUnavailable(sharepack.status);
  const shareLabel = sharepack.shareCount === 1 ? "1 Share" : `${sharepack.shareCount} Shares`;

  return (
    <article
      className={`eaw-story-row ${
        unavailable ? "eaw-story-row--unavailable" : ""
      }`}
    >
      <div className="eaw-story-row__media">
        <img src={sharepack.image} alt="" />
      </div>
      <div className="eaw-story-row__body">
        <div className="eaw-story-row__meta">
          <span>{formatShortDate(sharepack.assignedAt)}</span>
          {sharepack.shareCount > 0 && (
            <>
              <span aria-hidden="true">•</span>
              <span>{shareLabel}</span>
            </>
          )}
          <PlatformIcons platforms={sharepack.platforms} />
        </div>
        <h3>{sharepack.title}</h3>
        <p className="eaw-story-row__caption">{sharepack.caption}</p>
        <a
          className="eaw-story-row__link"
          href={sharepack.utmUrl}
          onClick={(event) => event.preventDefault()}
        >
          {sharepack.utmUrl}
        </a>
        <div className="eaw-story-row__actions">
          <button
            type="button"
            className="eaw-story-row__share-btn"
            onClick={() => onShare(sharepack)}
            disabled={unavailable}
          >
            Share
          </button>
        </div>
      </div>
    </article>
  );
};

const StoriesList = ({
  sharepacks,
  sort,
  onSortChange,
  onShare,
}: {
  sharepacks: Sharepack[];
  sort: StorySortOption;
  onSortChange: (sort: StorySortOption) => void;
  onShare: (sharepack: Sharepack) => void;
}) => (
  <section className="eaw-stories" aria-labelledby="all-stories-title">
    <header className="eaw-stories__header">
      <h2 id="all-stories-title">All Stories</h2>
      <UiDropdown
        className="eaw-stories__sort eaw-stories__sort--ghost"
        size="sm"
        value={sort}
        options={STORY_SORT_OPTIONS}
        onChange={(value) => onSortChange((value as StorySortOption) || "recent")}
        ariaLabel="Sort stories"
      />
    </header>
    {sharepacks.length === 0 ? (
      <div className="eaw-empty">
        <EmptyState
          stateType="empty"
          displayText="No stories yet"
          errorMessage="Assigned content will appear here when an administrator makes it available to you."
        />
      </div>
    ) : (
      <div className="eaw-stories__list">
        {sharepacks.map((sharepack) => (
          <StoryRow
            key={sharepack.id}
            sharepack={sharepack}
            onShare={onShare}
          />
        ))}
      </div>
    )}
  </section>
);

const MyShareRow = ({
  sharepack,
  profileName,
  onOpen,
}: {
  sharepack: Sharepack;
  profileName: string;
  onOpen: (sharepack: Sharepack) => void;
}) => {
  const platform =
    sharepack.sharedPlatform || sharepack.platforms[0] || "linkedin";
  const sharedAt = sharepack.sharedAt || sharepack.assignedAt;
  const previewText = sharepack.sharedCaption || sharepack.caption;

  return (
    <button
      type="button"
      className="eaw-my-share-row"
      onClick={() => onOpen(sharepack)}
    >
      <Avatar userName={profileName} size={40} fontSize={13} />
      <div className="eaw-my-share-row__content">
        <div className="eaw-my-share-row__meta">
          <img
            src={PLATFORM_LOGOS[platform]}
            alt={PLATFORM_LABELS[platform]}
            className="eaw-my-share-row__platform"
          />
          <time dateTime={sharedAt}>{formatShareTime(sharedAt)}</time>
        </div>
        <p className="eaw-my-share-row__text">{previewText}</p>
      </div>
      <span className="eaw-my-share-row__status" aria-label="Shared successfully">
        <img src={checkIcon} alt="" />
      </span>
    </button>
  );
};

const MySharesPage = ({
  shares,
  profileName,
  onNewPost,
  onPreview,
}: {
  shares: Sharepack[];
  profileName: string;
  onNewPost: () => void;
  onPreview: (sharepack: Sharepack) => void;
}) => {
  const groupedShares = groupSharesByDate(shares);

  return (
    <section className="eaw-section eaw-my-shares">
      {shares.length === 0 ? (
        <div className="eaw-empty">
          <EmptyState
            stateType="empty"
            displayText="No shares yet"
            errorMessage="Posts you share from Home will appear here."
            primaryBtnText="Browse stories"
            primaryBtnOnClick={onNewPost}
          />
        </div>
      ) : (
        <div className="eaw-my-shares__groups">
          {groupedShares.map(([dateLabel, group]) => (
            <section key={dateLabel} className="eaw-my-shares__group">
              <h2 className="eaw-my-shares__date">{dateLabel}</h2>
              <div className="eaw-my-shares__list">
                {group.map((sharepack) => (
                  <MyShareRow
                    key={sharepack.id}
                    sharepack={sharepack}
                    profileName={profileName}
                    onOpen={onPreview}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  );
};

const ShareStoryModal = ({
  sharepack,
  connectedAccount,
  mode = "compose",
  initialCaption,
  onClose,
  onShareNow,
  onScheduleOption,
}: {
  sharepack: Sharepack;
  connectedAccount: ConnectedSocialAccount;
  mode?: "compose" | "preview";
  initialCaption?: string;
  onClose: () => void;
  onShareNow?: (caption: string) => void;
  onScheduleOption?: (option: string) => void;
}) => {
  const isPreview = mode === "preview";
  const [caption, setCaption] = useState(
    initialCaption ?? sharepack.sharedCaption ?? sharepack.caption,
  );
  const [scheduleMenuOpen, setScheduleMenuOpen] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const scheduleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCaption(initialCaption ?? sharepack.sharedCaption ?? sharepack.caption);
  }, [initialCaption, sharepack]);

  useEffect(() => {
    titleRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!scheduleMenuOpen) return undefined;
    const onPointerDown = (event: MouseEvent) => {
      if (
        scheduleRef.current &&
        !scheduleRef.current.contains(event.target as Node)
      ) {
        setScheduleMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [scheduleMenuOpen]);

  const shareStats = sharepack.shareStats ?? DEFAULT_SHARE_POST_STATS;

  return (
    <OverlayPortal>
      <div className="eaw-overlay" role="presentation" onMouseDown={onClose}>
        <section
          className="eaw-share-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-story-title"
          onMouseDown={(event) => event.stopPropagation()}
        >
        <header className="eaw-share-modal__header">
          <h2 id="share-story-title" ref={titleRef} tabIndex={-1}>
            Share Story
          </h2>
          <button
            type="button"
            className="eaw-share-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <div className="eaw-share-modal__composer">
          <div className="eaw-share-modal__identity">
            <img
              src={PLATFORM_LOGOS[connectedAccount.platform]}
              alt=""
              className="eaw-share-modal__platform-icon"
            />
            <span>{connectedAccount.displayName}</span>
          </div>

          {isPreview ? (
            <p className="eaw-share-modal__caption eaw-share-modal__caption--preview">
              {caption}
            </p>
          ) : (
            <textarea
              className="eaw-share-modal__caption"
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              aria-label="Post text"
            />
          )}

          <a
            className="eaw-share-modal__link"
            href={sharepack.utmUrl}
            onClick={(event) => event.preventDefault()}
          >
            {sharepack.utmUrl}
          </a>

          {!isPreview && (
            <div
              className="eaw-share-modal__toolbar"
              role="toolbar"
              aria-label="Compose tools"
            >
              <button type="button" aria-label="Add emoji">
                <span aria-hidden="true">☺</span>
              </button>
              <button type="button" aria-label="Add image">
                <img src={fileIcon} alt="" />
              </button>
              <button type="button" aria-label="Enhance with AI">
                <img src={enhanceIcon} alt="" />
              </button>
              <button
                type="button"
                aria-label="Reset caption"
                onClick={() => setCaption(sharepack.caption)}
              >
                <img src={refreshIcon} alt="" />
              </button>
            </div>
          )}

          <div className="eaw-share-modal__preview">
            <img src={sharepack.image} alt="" />
          </div>

          <ShareStoryStatsGrid stats={shareStats} />
        </div>

        {!isPreview && (
          <footer className="eaw-share-modal__footer">
            <div className="eaw-share-modal__cta" ref={scheduleRef}>
              <button
                type="button"
                className="eaw-share-modal__share-now"
                onClick={() => onShareNow?.(caption)}
              >
                Share now
              </button>
              <button
                type="button"
                className="eaw-share-modal__share-menu-toggle"
                onClick={() => setScheduleMenuOpen((open) => !open)}
                aria-expanded={scheduleMenuOpen}
                aria-haspopup="menu"
                aria-label="More share options"
              >
                ▾
              </button>
              {scheduleMenuOpen && (
                <ul className="eaw-share-modal__schedule-menu" role="menu">
                  {SHARE_SCHEDULE_OPTIONS.map((option) => (
                    <li key={option} role="none">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setScheduleMenuOpen(false);
                          onScheduleOption?.(option);
                        }}
                      >
                        {option}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </footer>
        )}
        </section>
      </div>
    </OverlayPortal>
  );
};

const POINTS_GUIDE_ACTIONS = [
  { action: "Share to Linkedin", limit: "2 / Daily", points: 20 },
  { action: "Share to X (Twitter)", limit: "2 / Daily", points: 10 },
  { action: "Share Repost Story", limit: "2 / Daily", points: 5 },
  { action: "Edit a post", limit: "2 / Daily", points: 5 },
  { action: "Reaction on a Repost Story", limit: "30 / Daily", points: 5 },
  { action: "Comment on a Repost Story", limit: "10 / Daily", points: 10 },
  { action: "Suggest content", limit: "2 / Daily", points: 5 },
  { action: "Suggest content - accepted", limit: "2 / Daily", points: 20 },
];

const POINTS_GUIDE_EVENTS = [
  { event: "Link Click", points: 15 },
  { event: "Comment", points: 10 },
  { event: "Reaction", points: 5 },
  { event: "Reshare", points: 10 },
];

const LEADERBOARD_PERIOD_OPTIONS: {
  label: string;
  value: LeaderboardPeriod;
}[] = [
  { label: "Current Month", value: "current-month" },
  { label: "Last Month", value: "last-month" },
  { label: "Custom Date", value: "custom-date" },
];

const LEADERBOARD_METRIC_OPTIONS: {
  label: string;
  value: LeaderboardMetric;
}[] = [
  { label: "Points", value: "points" },
  { label: "Clicks", value: "clicks" },
  { label: "Shares", value: "shares" },
];

const getAdvocateMetricValue = (
  advocate: Advocate,
  metric: LeaderboardMetric,
): number => {
  if (metric === "clicks") return advocate.clicks;
  if (metric === "shares") return advocate.shares;
  return advocate.points;
};

const sortAdvocatesByMetric = (
  advocates: Advocate[],
  metric: LeaderboardMetric,
): Advocate[] =>
  [...advocates]
    .sort(
      (left, right) =>
        getAdvocateMetricValue(right, metric) -
        getAdvocateMetricValue(left, metric),
    )
    .map((advocate, index) => ({ ...advocate, rank: index + 1 }));

const PointDiamondIcon = () => (
  <svg
    className="eaw-point-diamond"
    width="14"
    height="14"
    viewBox="0 0 14 14"
    aria-hidden="true"
  >
    <circle cx="7" cy="7" r="7" fill="#e8f0ff" />
    <path
      d="M7 3.5 9.25 7 7 10.5 4.75 7 7 3.5Z"
      fill="#2927b2"
    />
  </svg>
);

const PointsGuideDrawer = ({ onClose }: { onClose: () => void }) => {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <OverlayPortal>
      <div className="eaw-overlay" role="presentation" onMouseDown={onClose}>
        <section
          className="eaw-drawer eaw-drawer--points-guide"
          role="dialog"
          aria-modal="true"
          aria-labelledby="points-guide-title"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <header className="eaw-drawer__header">
            <h2 id="points-guide-title" ref={titleRef} tabIndex={-1}>
              How to earn points
            </h2>
          <button
            type="button"
            className="eaw-drawer__icon-close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="eaw-drawer__content eaw-points-guide">
          <section className="eaw-points-guide__section">
            <header>
              <h3>Actions</h3>
              <p>When you take action.</p>
            </header>
            <table>
              <thead>
                <tr>
                  <th scope="col">Action</th>
                  <th scope="col">Limit &amp; duration</th>
                  <th scope="col">Points</th>
                </tr>
              </thead>
              <tbody>
                {POINTS_GUIDE_ACTIONS.map((row) => (
                  <tr key={row.action}>
                    <td>{row.action}</td>
                    <td>{row.limit}</td>
                    <td>
                      <span className="eaw-points-guide__value">
                        {row.points}
                        <PointDiamondIcon />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="eaw-points-guide__section">
            <header>
              <h3>Events</h3>
              <p>Engagement with your content.</p>
            </header>
            <table>
              <thead>
                <tr>
                  <th scope="col">Event</th>
                  <th scope="col">Points</th>
                </tr>
              </thead>
              <tbody>
                {POINTS_GUIDE_EVENTS.map((row) => (
                  <tr key={row.event}>
                    <td>{row.event}</td>
                    <td>
                      <span className="eaw-points-guide__value">
                        {row.points}
                        <PointDiamondIcon />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
        </section>
      </div>
    </OverlayPortal>
  );
};

const LeaderboardPodiumCard = ({
  advocate,
  rank,
  metric,
}: {
  advocate: Advocate;
  rank: 1 | 2 | 3;
  metric: LeaderboardMetric;
}) => {
  const value = getAdvocateMetricValue(advocate, metric);

  return (
    <article
      className={`eaw-leaderboard-podium__item eaw-leaderboard-podium__item--rank-${rank}${
        advocate.isCurrentEmployee ? " is-current" : ""
      }`}
    >
      <div className="eaw-leaderboard-podium__avatar-wrap">
        <Avatar
          userName={advocate.name}
          size={rank === 1 ? 88 : 72}
          fontSize={rank === 1 ? 18 : 15}
        />
        <span className="eaw-leaderboard-podium__badge">{rank}</span>
      </div>
      <strong className="eaw-leaderboard-podium__name">
        {advocate.name}
        {advocate.isCurrentEmployee && <small>You</small>}
      </strong>
      <span className="eaw-leaderboard-podium__score">
        {formatNumber(value)}
        {metric === "points" && <PointDiamondIcon />}
      </span>
    </article>
  );
};

const LeaderboardListRow = ({
  advocate,
  metric,
}: {
  advocate: Advocate;
  metric: LeaderboardMetric;
}) => {
  const value = getAdvocateMetricValue(advocate, metric);

  return (
    <li className={advocate.isCurrentEmployee ? "is-current" : ""}>
      <span className="eaw-leaderboard-list__rank">{advocate.rank}</span>
      <Avatar userName={advocate.name} size={40} fontSize={13} />
      <div className="eaw-leaderboard-list__name">
        <strong>{advocate.name}</strong>
        {advocate.isCurrentEmployee && <small>You</small>}
      </div>
      <span className="eaw-leaderboard-list__score">
        {formatNumber(value)}
        {metric === "points" && <PointDiamondIcon />}
      </span>
    </li>
  );
};

const LeaderboardPage = ({
  advocates,
  period,
  metric,
  onPeriodChange,
  onMetricChange,
  onOpenPointsGuide,
}: {
  advocates: Advocate[];
  period: LeaderboardPeriod;
  metric: LeaderboardMetric;
  onPeriodChange: (period: LeaderboardPeriod) => void;
  onMetricChange: (metric: LeaderboardMetric) => void;
  onOpenPointsGuide: () => void;
}) => {
  const topThree = advocates.slice(0, 3);
  const rest = advocates.slice(3);

  return (
    <section className="eaw-section eaw-leaderboard-page">
      <div className="eaw-leaderboard-page__toolbar">
        <div className="eaw-leaderboard-page__filters">
          <UiDropdown
            className="eaw-leaderboard-page__filter"
            size="sm"
            value={period}
            options={LEADERBOARD_PERIOD_OPTIONS}
            onChange={(value) =>
              onPeriodChange((value as LeaderboardPeriod) || "current-month")
            }
            ariaLabel="Leaderboard period"
          />
          <UiDropdown
            className="eaw-leaderboard-page__filter"
            size="sm"
            value={metric}
            options={LEADERBOARD_METRIC_OPTIONS}
            onChange={(value) =>
              onMetricChange((value as LeaderboardMetric) || "points")
            }
            ariaLabel="Leaderboard metric"
          />
        </div>
        <button
          type="button"
          className="cs-btn cs-btn--secondary-ghost eaw-leaderboard-page__guide-btn"
          onClick={onOpenPointsGuide}
        >
          How to get points
        </button>
      </div>

      {period === "custom-date" && (
        <Feedback
          tone="info"
          message="Custom date range selection is not available in this preview. Showing current month standings."
        />
      )}

      {advocates.length >= 3 && (
        <div className="eaw-leaderboard-podium">
          <LeaderboardPodiumCard
            advocate={topThree[1]}
            rank={2}
            metric={metric}
          />
          <LeaderboardPodiumCard
            advocate={topThree[0]}
            rank={1}
            metric={metric}
          />
          <LeaderboardPodiumCard
            advocate={topThree[2]}
            rank={3}
            metric={metric}
          />
        </div>
      )}

      {rest.length > 0 && (
        <ol className="eaw-leaderboard-list">
          {rest.map((advocate) => (
            <LeaderboardListRow
              key={advocate.id}
              advocate={advocate}
              metric={metric}
            />
          ))}
        </ol>
      )}
    </section>
  );
};

const LeaderboardPreview = ({
  data,
  onOpen,
}: {
  data: WorkspaceData;
  onOpen: () => void;
}) => {
  const current = data.advocates.find((advocate) => advocate.isCurrentEmployee);
  return (
    <section className="eaw-rail-card" aria-labelledby="leaderboard-preview-title">
      <div className="eaw-rail-card__header">
        <div>
          <p className="eaw-eyebrow">Current month</p>
          <h2 id="leaderboard-preview-title">Leaderboard</h2>
        </div>
        <DsButton
          text="View all"
          onClick={onOpen}
          buttonType="naked-sub"
          size="xs"
        />
      </div>
      {current && (
        <div className="eaw-rank-summary">
          <div>
            <span>Your rank</span>
            <strong>#{current.rank}</strong>
          </div>
          <div>
            <span>Your points</span>
            <strong>{formatNumber(current.points)}</strong>
          </div>
        </div>
      )}
      <ol className="eaw-mini-leaderboard">
        {data.advocates.slice(0, 5).map((advocate) => (
          <li
            key={advocate.id}
            className={advocate.isCurrentEmployee ? "is-current" : ""}
          >
            <span className="eaw-mini-leaderboard__rank">{advocate.rank}</span>
            <Avatar userName={advocate.name} size={32} fontSize={11} />
            <span className="eaw-mini-leaderboard__name">
              {advocate.name}
              {advocate.isCurrentEmployee && <small>You</small>}
            </span>
            <strong>{formatNumber(advocate.points)}</strong>
          </li>
        ))}
      </ol>
      <p className="eaw-rail-note">
        Points reflect configured workspace activity. A self-reported share is
        not verified as an external publication.
      </p>
    </section>
  );
};

const AnalyticsSparkline = ({ trend }: { trend: AnalyticsTrend }) => {
  const strokePath =
    trend === "up"
      ? "M2 26 L14 22 C22 18, 30 12, 46 6"
      : "M2 20 L46 20";
  const fillPath = `${strokePath} L46 32 L2 32 Z`;

  return (
    <svg
      className="eaw-analytics-overview-card__sparkline"
      viewBox="0 0 48 32"
      aria-hidden="true"
    >
      <path d={fillPath} fill="rgba(77, 62, 224, 0.12)" />
      <path
        d={strokePath}
        fill="none"
        stroke="var(--secondary-blue-bb-200, #4d3ee0)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

const AnalyticsOverviewCard = ({
  metric,
}: {
  metric: AnalyticsOverviewMetric;
}) => {
  const displayValue =
    metric.formattedValue ?? formatNumber(metric.value);
  const changeClass =
    metric.changePercent > 0
      ? "is-positive"
      : metric.changePercent < 0
        ? "is-negative"
        : "is-neutral";

  return (
    <article className="eaw-analytics-overview-card">
      <div className="eaw-analytics-overview-card__label">
        <span>{metric.label}</span>
        <button
          type="button"
          className="eaw-analytics-overview-card__info"
          aria-label={`About ${metric.label}`}
        >
          <img src={infoIcon} alt="" />
        </button>
      </div>
      <div className="eaw-analytics-overview-card__body">
        <div className="eaw-analytics-overview-card__value">
          <strong>{displayValue}</strong>
          <span className={`eaw-analytics-overview-card__change ${changeClass}`}>
            {metric.changePercent > 0 && <span aria-hidden="true">▲</span>}
            {metric.changePercent < 0 && <span aria-hidden="true">▼</span>}
            {Math.abs(metric.changePercent)}%
          </span>
        </div>
        <AnalyticsSparkline trend={metric.trend} />
      </div>
    </article>
  );
};

const AnalyticsShareRow = ({
  sharepack,
  profileName,
  onOpen,
}: {
  sharepack: Sharepack;
  profileName: string;
  onOpen: (sharepack: Sharepack) => void;
}) => {
  const platform =
    sharepack.sharedPlatform || sharepack.platforms[0] || "linkedin";
  const sharedAt = sharepack.sharedAt || sharepack.assignedAt;
  const previewText = sharepack.sharedCaption || sharepack.caption;
  const stats = sharepack.shareStats ?? DEFAULT_SHARE_POST_STATS;

  return (
    <tr className="eaw-analytics-share-row">
      <td>
        <button
          type="button"
          className="eaw-analytics-share-row__post"
          onClick={() => onOpen(sharepack)}
        >
          <Avatar userName={profileName} size={32} fontSize={11} />
          <div className="eaw-analytics-share-row__content">
            <div className="eaw-analytics-share-row__meta">
              <img
                src={PLATFORM_LOGOS[platform]}
                alt={PLATFORM_LABELS[platform]}
                className="eaw-analytics-share-row__platform"
              />
              <time dateTime={sharedAt}>{formatRelativeTime(sharedAt)}</time>
              <svg
                className="eaw-analytics-share-row__external"
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <path
                  d="M10 2h4v4M14 2 8.5 7.5M6 3H3.5A1.5 1.5 0 0 0 2 4.5v8A1.5 1.5 0 0 0 3.5 14h8a1.5 1.5 0 0 0 1.5-1.5V10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p>{previewText}</p>
          </div>
        </button>
      </td>
      <td>{formatNumber(stats.reactions)}</td>
      <td>{formatNumber(stats.comments)}</td>
      <td>{formatNumber(stats.linkClicks)}</td>
    </tr>
  );
};

const AnalyticsPage = ({
  overview,
  shares,
  profileName,
  period,
  onPeriodChange,
  onPreviewShare,
}: {
  overview: AnalyticsOverviewMetric[];
  shares: Sharepack[];
  profileName: string;
  period: LeaderboardPeriod;
  onPeriodChange: (period: LeaderboardPeriod) => void;
  onPreviewShare: (sharepack: Sharepack) => void;
}) => {
  return (
    <section className="eaw-section eaw-analytics-page">
      <div className="eaw-analytics-page__toolbar">
        <UiDropdown
          className="eaw-analytics-page__filter"
          size="sm"
          value={period}
          options={LEADERBOARD_PERIOD_OPTIONS}
          onChange={(value) =>
            onPeriodChange((value as LeaderboardPeriod) || "current-month")
          }
          ariaLabel="Analytics period"
        />
        <button
          type="button"
          className="eaw-analytics-page__filter-btn"
          aria-label="Filter analytics"
        >
          <svg viewBox="0 0 18 18" aria-hidden="true">
            <path
              d="M2 4.5H16M4.5 9H13.5M7.5 13.5H10.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <section className="eaw-analytics-overview" aria-labelledby="analytics-overview-title">
        <h2 id="analytics-overview-title">Overview</h2>
        <div className="eaw-analytics-overview__grid">
          {overview.map((metric) => (
            <AnalyticsOverviewCard key={metric.id} metric={metric} />
          ))}
        </div>
      </section>

      <section className="eaw-analytics-shares" aria-labelledby="analytics-shares-title">
        <header className="eaw-analytics-shares__header">
          <h2 id="analytics-shares-title">My Shares</h2>
          <span className="eaw-analytics-shares__pagination">
            {shares.length === 0
              ? "0 of 0"
              : `1-${shares.length} of ${shares.length}`}
          </span>
        </header>

        {shares.length === 0 ? (
          <div className="eaw-empty">
            <EmptyState
              stateType="empty"
              displayText="No shared posts yet"
              errorMessage="Share a story from Home to start tracking reactions, comments, and clicks."
            />
          </div>
        ) : (
          <div className="eaw-analytics-shares__table-wrap">
            <table className="eaw-analytics-shares__table">
              <thead>
                <tr>
                  <th scope="col">Post</th>
                  <th scope="col">
                    <span>Reactions</span>
                    <span className="eaw-analytics-shares__sort" aria-hidden="true">
                      ↕
                    </span>
                  </th>
                  <th scope="col">
                    <span>Comments</span>
                    <span className="eaw-analytics-shares__sort" aria-hidden="true">
                      ↕
                    </span>
                  </th>
                  <th scope="col">
                    <span>Clicks</span>
                    <span className="eaw-analytics-shares__sort" aria-hidden="true">
                      ↕
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {shares.map((sharepack) => (
                  <AnalyticsShareRow
                    key={sharepack.id}
                    sharepack={sharepack}
                    profileName={profileName}
                    onOpen={onPreviewShare}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
};

const ProfileCard = ({ data }: { data: WorkspaceData }) => (
  <section className="eaw-rail-card" aria-labelledby="profile-title">
    <div className="eaw-profile-summary">
      <Avatar userName={data.profile.name} size={48} fontSize={16} />
      <div>
        <h2 id="profile-title">{data.profile.name}</h2>
        <p>{data.profile.role}</p>
      </div>
    </div>
    <dl className="eaw-profile-meta">
      <div>
        <dt>Location</dt>
        <dd>{data.profile.location}</dd>
      </div>
      <div>
        <dt>Segments</dt>
        <dd className="eaw-tag-list">
          {data.profile.segments.map((segment) => (
            <span key={segment}>{segment}</span>
          ))}
        </dd>
      </div>
      <div>
        <dt>Tags</dt>
        <dd className="eaw-tag-list">
          {data.profile.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </dd>
      </div>
    </dl>
    <p className="eaw-rail-note">
      Segments and tags determine content eligibility and reporting. They are
      managed by your administrator.
    </p>
  </section>
);

const SuggestionRow = ({
  suggestion,
  profileName,
  onOpen,
}: {
  suggestion: PostSuggestion;
  profileName: string;
  onOpen: (suggestion: PostSuggestion) => void;
}) => {
  const platform = suggestion.platforms[0] || "linkedin";
  const previewText = `${suggestion.title} — ${suggestion.text}`;

  return (
    <button
      type="button"
      className="eaw-my-share-row"
      onClick={() => onOpen(suggestion)}
    >
      <Avatar userName={profileName} size={40} fontSize={13} />
      <div className="eaw-my-share-row__content">
        <div className="eaw-my-share-row__meta">
          <img
            src={PLATFORM_LOGOS[platform]}
            alt={PLATFORM_LABELS[platform]}
            className="eaw-my-share-row__platform"
          />
          <time dateTime={suggestion.submittedAt}>
            {formatShareTime(suggestion.submittedAt)}
          </time>
        </div>
        <p className="eaw-my-share-row__text">{previewText}</p>
      </div>
      <Status status={suggestion.status} suggestion />
    </button>
  );
};

const SuggestionPreviewModal = ({
  suggestion,
  onClose,
}: {
  suggestion: PostSuggestion;
  onClose: () => void;
}) => {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <OverlayPortal>
      <div className="eaw-overlay" role="presentation" onMouseDown={onClose}>
        <section
          className="eaw-share-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="suggestion-preview-title"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <header className="eaw-share-modal__header">
            <h2 id="suggestion-preview-title" ref={titleRef} tabIndex={-1}>
              Suggestion preview
            </h2>
            <button
              type="button"
              className="eaw-share-modal__close"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </header>

          <div className="eaw-share-modal__composer">
            <div className="eaw-suggestion-preview__meta">
              <Status status={suggestion.status} suggestion />
              <time dateTime={suggestion.submittedAt}>
                Submitted {formatDate(suggestion.submittedAt)}
              </time>
            </div>

            <h3 className="eaw-suggestion-preview__title">{suggestion.title}</h3>
            <p className="eaw-share-modal__caption eaw-share-modal__caption--preview">
              {suggestion.text}
            </p>

            <div className="eaw-suggestion-preview__platforms">
              <span className="eaw-eyebrow">Platforms</span>
              <PlatformIcons platforms={suggestion.platforms} />
            </div>

            {suggestion.assetName && (
              <dl className="eaw-suggestion-preview__details">
                <div>
                  <dt>Asset</dt>
                  <dd>{suggestion.assetName}</dd>
                </div>
              </dl>
            )}

            {suggestion.feedback && (
              <Feedback message={suggestion.feedback} tone="info" />
            )}

            {suggestion.status === "approved" && (
              <Feedback
                tone="info"
                message="Approval does not make this content shareable yet. It will appear in Home only after an administrator publishes and assigns it."
              />
            )}
          </div>
        </section>
      </div>
    </OverlayPortal>
  );
};

const MySuggestionsPage = ({
  suggestions,
  profileName,
  onNewSuggestion,
  onPreview,
}: {
  suggestions: PostSuggestion[];
  profileName: string;
  onNewSuggestion: () => void;
  onPreview: (suggestion: PostSuggestion) => void;
}) => {
  const groupedSuggestions = groupSuggestionsByDate(suggestions);

  return (
    <section className="eaw-section eaw-my-shares">
      <div className="eaw-my-shares__toolbar">
        <DsButton text="New Suggestion" onClick={onNewSuggestion} />
      </div>

      {suggestions.length === 0 ? (
        <div className="eaw-empty">
          <EmptyState
            stateType="empty"
            displayText="No suggestions yet"
            errorMessage="Propose a post idea and it will appear here with its approval status."
            primaryBtnText="New Suggestion"
            primaryBtnOnClick={onNewSuggestion}
          />
        </div>
      ) : (
        <div className="eaw-my-shares__groups">
          {groupedSuggestions.map(([dateLabel, group]) => (
            <section key={dateLabel} className="eaw-my-shares__group">
              <h2 className="eaw-my-shares__date">{dateLabel}</h2>
              <div className="eaw-my-shares__list">
                {group.map((suggestion) => (
                  <SuggestionRow
                    key={suggestion.id}
                    suggestion={suggestion}
                    profileName={profileName}
                    onOpen={onPreview}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  );
};

const SharepackDetail = ({
  sharepack,
  onClose,
  onAction,
}: {
  sharepack: Sharepack;
  onClose: () => void;
  onAction: (
    action: "download" | "copy-caption" | "copy-link" | "shared",
    sharepack: Sharepack,
  ) => void;
}) => {
  const unavailable = isUnavailable(sharepack.status);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <OverlayPortal>
      <div className="eaw-overlay" role="presentation" onMouseDown={onClose}>
        <section
          className="eaw-drawer"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sharepack-detail-title"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <header className="eaw-drawer__header">
            <div>
              <p className="eaw-eyebrow">{sharepack.campaignName}</p>
              <h2 id="sharepack-detail-title" ref={titleRef} tabIndex={-1}>
                {sharepack.title}
              </h2>
            </div>
            <DsButton
              text="Close"
              onClick={onClose}
              buttonType="naked"
              className="eaw-drawer__close"
            />
          </header>

        <div className="eaw-drawer__content">
          <div className="eaw-detail-media">
            <img src={sharepack.image} alt="" />
            <div>
              <Status status={sharepack.status} />
              <span>{sharepack.assetType}</span>
            </div>
          </div>

          {unavailable ? (
            <Feedback
              tone="error"
              message={
                sharepack.status === "expired"
                  ? "This sharepack has expired. It is retained for your history but cannot be used for a new share."
                  : "This sharepack was withdrawn and is no longer approved for new sharing."
              }
            />
          ) : (
            <Feedback
              tone="info"
              message="One Health prepares the approved content. Download or copy it here, then post it manually in the external social platform of your choice."
            />
          )}

          <section className="eaw-detail-section">
            <div className="eaw-detail-section__header">
              <div>
                <h3>Approved asset</h3>
                <p>{sharepack.assetName}</p>
              </div>
              <DsButton
                text="Download"
                onClick={() => onAction("download", sharepack)}
                buttonType="secondary"
                disabled={unavailable}
                iconLeft={downloadIcon}
              />
            </div>
          </section>

          <section className="eaw-detail-section">
            <div className="eaw-detail-section__header">
              <div>
                <h3>Approved post text</h3>
                <p>Copy-ready text for manual posting.</p>
              </div>
              <DsButton
                text="Copy post"
                onClick={() => onAction("copy-caption", sharepack)}
                buttonType="secondary"
                disabled={unavailable}
                iconLeft={copyIcon}
              />
            </div>
            <div className="eaw-copy-box">{sharepack.caption}</div>
          </section>

          <section className="eaw-detail-section">
            <div className="eaw-detail-section__header">
              <div>
                <h3>Tracked destination link</h3>
                <p>UTM parameters are preserved when you copy this link.</p>
              </div>
              <DsButton
                text="Copy link"
                onClick={() => onAction("copy-link", sharepack)}
                buttonType="secondary"
                disabled={unavailable}
                iconLeft={linkIcon}
              />
            </div>
            <div className="eaw-copy-box eaw-copy-box--link">
              {sharepack.utmUrl}
            </div>
          </section>
        </div>

        <footer className="eaw-drawer__footer">
          <p>
            “Mark as shared” is self-reported. One Health does not verify that the
            content was published externally.
          </p>
          <DsButton
            text={
              sharepack.status === "shared"
                ? "Marked as shared"
                : "Mark as shared"
            }
            onClick={() => onAction("shared", sharepack)}
            disabled={unavailable || sharepack.status === "shared"}
          />
        </footer>
        </section>
      </div>
    </OverlayPortal>
  );
};

const SuggestionComposer = ({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (draft: SuggestionDraft) => Promise<void>;
}) => {
  const [draft, setDraft] = useState<SuggestionDraft>(EMPTY_DRAFT);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const titleRef = useRef<HTMLHeadingElement>(null);

  const canSubmit =
    draft.title.trim().length > 0 &&
    draft.text.trim().length > 0 &&
    draft.platforms.length > 0 &&
    Boolean(draft.assetId);

  useEffect(() => {
    titleRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, submitting]);

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      await onSubmit(draft);
    } catch {
      setError("Your suggestion could not be submitted. Please try again.");
      trackAdvocacyEvent("suggestion_submission_failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <OverlayPortal>
      <div className="eaw-overlay" role="presentation" onMouseDown={onClose}>
        <section
          className="eaw-share-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="suggestion-title"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <header className="eaw-share-modal__header">
            <h2 id="suggestion-title" ref={titleRef} tabIndex={-1}>
              New Suggestion
            </h2>
            <button
              type="button"
              className="eaw-share-modal__close"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </header>

          <div className="eaw-share-modal__composer">
            <Feedback
              tone="info"
              message="Suggestions are sent to a talent marketer administrator for review. They are not approved or available for sharing until the admin workflow is complete."
            />

            <div className="eaw-suggestion-form">
              <div className="eaw-field">
                <label className="eaw-field__label" htmlFor="suggestion-title">
                  Title
                </label>
                <Input
                  id="suggestion-title"
                  placeholder="Give your suggestion a short title"
                  value={draft.title}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setDraft((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="eaw-field">
                <label className="eaw-field__label" htmlFor="suggestion-text">
                  Post text
                </label>
                <TextArea
                  id="suggestion-text"
                  placeholder="Describe the post you would like to suggest..."
                  value={draft.text}
                  onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setDraft((current) => ({
                      ...current,
                      text: event.target.value,
                    }))
                  }
                />
                <p className="eaw-field__helper">
                  Required. Share enough context for an administrator to review the idea.
                </p>
              </div>
              <div className="eaw-field">
                <label className="eaw-field__label" htmlFor="suggestion-platforms">
                  Platforms
                </label>
                <UiMultiSelect
                  className="eaw-field__control"
                  values={draft.platforms}
                  options={PLATFORM_SELECT_OPTIONS}
                  onChange={(values) =>
                    setDraft((current) => ({
                      ...current,
                      platforms: values.filter((platform): platform is AdvocacyPlatform =>
                        Boolean(PLATFORM_LABELS[platform as AdvocacyPlatform]),
                      ),
                    }))
                  }
                  placeholder="Select platforms"
                  ariaLabel="Platforms"
                />
                <p className="eaw-field__helper">
                  Select one or more platforms for this suggestion.
                </p>
              </div>
              <div className="eaw-field">
                <label className="eaw-field__label" htmlFor="suggestion-asset">
                  Asset
                </label>
                <UiDropdown
                  className="eaw-field__control"
                  value={draft.assetId}
                  options={suggestionAssetOptions}
                  onChange={(value) =>
                    setDraft((current) => ({
                      ...current,
                      assetId: value || "",
                    }))
                  }
                  placeholder="Select asset"
                  ariaLabel="Asset"
                />
                <p className="eaw-field__helper">
                  Choose an approved asset from the internal library.
                </p>
              </div>
            </div>

            {error && <Feedback tone="error" message={error} />}
          </div>

          <footer className="eaw-share-modal__footer eaw-drawer__footer--actions">
            <DsButton
              text="Cancel"
              onClick={onClose}
              buttonType="secondary"
              disabled={submitting}
            />
            <DsButton
              text={submitting ? "Submitting..." : "Submit for approval"}
              onClick={submit}
              disabled={submitting || !canSubmit}
            />
          </footer>
        </section>
      </div>
    </OverlayPortal>
  );
};

export const EmployeeAdvocacyWorkspace: React.FC = () => {
  const [data, setData] = useState<WorkspaceData | null>(null);
  const [section, setSection] = useState<WorkspaceSection>("home");
  const [selectedSharepack, setSelectedSharepack] =
    useState<Sharepack | null>(null);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("all");
  const [storySort, setStorySort] = useState<StorySortOption>("recent");
  const [shareStoryTarget, setShareStoryTarget] = useState<Sharepack | null>(
    null,
  );
  const [sharedPostPreview, setSharedPostPreview] = useState<Sharepack | null>(
    null,
  );
  const [suggestionPreview, setSuggestionPreview] =
    useState<PostSuggestion | null>(null);
  const [feedback, setFeedback] = useState<{
    message: string;
    tone: "success" | "info" | "error";
  } | null>(null);
  const [period, setPeriod] = useState<LeaderboardPeriod>("current-month");
  const [leaderboardMetric, setLeaderboardMetric] =
    useState<LeaderboardMetric>("points");
  const [showPointsGuide, setShowPointsGuide] = useState(false);
  const [homeBadgeCount, setHomeBadgeCount] = useState(0);
  const load = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const next = await employeeAdvocacyAdapter.load();
      setData(next);
      trackAdvocacyEvent("workspace_opened");
    } catch {
      setLoadError(
        "The employee advocacy workspace is temporarily unavailable. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    const refreshBadge = () => setHomeBadgeCount(getUnreadEmployeeStoryCount());
    refreshBadge();
    const onBridgeUpdate = () => {
      refreshBadge();
      void load();
    };
    const onStorage = (event: StorageEvent) => {
      if (
        event.key?.includes("employee-advocacy") ||
        event.key?.includes("unread-story")
      ) {
        refreshBadge();
        void load();
      }
    };
    window.addEventListener(ADVOCACY_BRIDGE_EVENT, onBridgeUpdate);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(ADVOCACY_BRIDGE_EVENT, onBridgeUpdate);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const save = async (next: WorkspaceData) => {
    setData(next);
    await employeeAdvocacyAdapter.save(next);
  };

  const changeSection = (next: WorkspaceSection) => {
    setSection(next);
    setFeedback(null);
    if (next === "home") {
      clearUnreadEmployeeStories();
      setHomeBadgeCount(0);
    }
    if (next === "leaderboard") trackAdvocacyEvent("leaderboard_opened");
    if (next === "analytics") trackAdvocacyEvent("campaign_analytics_opened");
  };

  const openSharepack = async (sharepack: Sharepack) => {
    setSelectedSharepack(sharepack);
    trackAdvocacyEvent("sharepack_viewed", {
      sharepackId: sharepack.id,
      campaignName: sharepack.campaignName,
    });
    if (!data || sharepack.status !== "new") return;
    const next = {
      ...data,
      sharepacks: data.sharepacks.map((item) =>
        item.id === sharepack.id ? { ...item, status: "viewed" as const } : item,
      ),
    };
    await save(next);
    setSelectedSharepack({ ...sharepack, status: "viewed" });
  };

  const updateSharepackStatus = async (
    sharepack: Sharepack,
    status: SharepackStatus,
  ) => {
    if (!data) return;
    const nextSharepack = { ...sharepack, status };
    const next = {
      ...data,
      sharepacks: data.sharepacks.map((item) =>
        item.id === sharepack.id ? nextSharepack : item,
      ),
    };
    await save(next);
    setSelectedSharepack(nextSharepack);
  };

  const handleSharepackAction = async (
    action: "download" | "copy-caption" | "copy-link" | "shared",
    sharepack: Sharepack,
  ) => {
    try {
      if (action === "download") {
        const response = await fetch(sharepack.image);
        const blob = await response.blob();
        const href = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = href;
        anchor.download = sharepack.assetName;
        anchor.click();
        URL.revokeObjectURL(href);
        await updateSharepackStatus(sharepack, "downloaded");
        trackAdvocacyEvent("asset_downloaded", {
          sharepackId: sharepack.id,
        });
        setFeedback({
          tone: "success",
          message:
            "Approved asset downloaded. Complete the post manually in your external social platform.",
        });
      }
      if (action === "copy-caption") {
        await navigator.clipboard.writeText(sharepack.caption);
        if (sharepack.status === "new" || sharepack.status === "viewed") {
          await updateSharepackStatus(sharepack, "downloaded");
        }
        trackAdvocacyEvent("caption_copied", {
          sharepackId: sharepack.id,
        });
        setFeedback({
          tone: "success",
          message: "Approved post text copied.",
        });
      }
      if (action === "copy-link") {
        await navigator.clipboard.writeText(sharepack.utmUrl);
        if (sharepack.status === "new" || sharepack.status === "viewed") {
          await updateSharepackStatus(sharepack, "downloaded");
        }
        trackAdvocacyEvent("utm_link_copied", {
          sharepackId: sharepack.id,
        });
        setFeedback({
          tone: "success",
          message: "Tracked destination link copied with UTM parameters.",
        });
      }
      if (action === "shared") {
        await updateSharepackStatus(sharepack, "shared");
        trackAdvocacyEvent("sharepack_marked_shared", {
          sharepackId: sharepack.id,
          selfReported: true,
          verifiedExternally: false,
        });
        setFeedback({
          tone: "info",
          message:
            "Marked as self-reported shared. One Health has not verified an external publication.",
        });
      }
    } catch {
      setFeedback({
        tone: "error",
        message: "That action could not be completed. Please try again.",
      });
    }
  };

  const submitSuggestion = async (draft: SuggestionDraft) => {
    if (!data) throw new Error("Workspace data unavailable");
    const suggestion = employeeAdvocacyAdapter.createSuggestion(draft);
    const next = {
      ...data,
      suggestions: [suggestion, ...data.suggestions],
    };
    await save(next);
    trackAdvocacyEvent("suggestion_submitted", {
      suggestionId: suggestion.id,
      hasAsset: Boolean(draft.assetId),
      platformCount: draft.platforms.length,
    });
    dispatchAdvocacyBridgeUpdate();
    setShowSuggestion(false);
    setSection("suggestions");
    setFeedback({
      tone: "success",
      message:
        "Suggestion submitted for administrator approval. Its status is Pending approval.",
    });
  };

  const filteredSharepacks = useMemo(() => {
    if (!data) return [];
    const query = search.trim().toLowerCase();
    return data.sharepacks.filter((sharepack) => {
      const matchesSearch =
        !query ||
        `${sharepack.title} ${sharepack.campaignName} ${sharepack.description}`
          .toLowerCase()
          .includes(query);
      const matchesTopic = topic === "all" || sharepack.topic === topic;
      return matchesSearch && matchesTopic;
    });
  }, [data, search, topic]);

  const sortedStories = useMemo(() => {
    if (!data) return [];
    const query = search.trim().toLowerCase();
    const stories = data.sharepacks.filter((sharepack) => {
      if (!query) return true;
      return `${sharepack.title} ${sharepack.campaignName} ${sharepack.description} ${sharepack.caption}`
        .toLowerCase()
        .includes(query);
    });
    if (storySort === "shared") {
      return stories.sort((a, b) => b.shareCount - a.shareCount);
    }
    return stories.sort(
      (a, b) =>
        new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime(),
    );
  }, [data, search, storySort]);

  const rankedAdvocates = useMemo(() => {
    if (!data) return [];
    return sortAdvocatesByMetric(data.advocates, leaderboardMetric);
  }, [data, leaderboardMetric]);

  const openShareStory = async (sharepack: Sharepack) => {
    setShareStoryTarget(sharepack);
    trackAdvocacyEvent("share_story_opened", { sharepackId: sharepack.id });
    if (!data || sharepack.status !== "new") return;
    const next = {
      ...data,
      sharepacks: data.sharepacks.map((item) =>
        item.id === sharepack.id ? { ...item, status: "viewed" as const } : item,
      ),
    };
    await save(next);
    setShareStoryTarget({ ...sharepack, status: "viewed" });
  };

  const completeShareStory = async (caption?: string) => {
    if (!data || !shareStoryTarget) return;
    const nextSharepack = {
      ...shareStoryTarget,
      status: "shared" as const,
      sharedAt: new Date().toISOString(),
      sharedPlatform: data.profile.connectedAccount.platform,
      sharedCaption: caption ?? shareStoryTarget.caption,
    };
    const next = {
      ...data,
      sharepacks: data.sharepacks.map((item) =>
        item.id === shareStoryTarget.id
          ? {
              ...nextSharepack,
              shareCount: item.shareCount + 1,
            }
          : item,
      ),
    };
    await save(next);
    trackAdvocacyEvent("sharepack_marked_shared", {
      sharepackId: shareStoryTarget.id,
      selfReported: true,
      verifiedExternally: false,
    });
    setShareStoryTarget(null);
    setFeedback({
      tone: "info",
      message:
        "Marked as self-reported shared. One Health has not verified an external publication.",
    });
  };

  const sortedSuggestions = useMemo(
    () =>
      [...(data?.suggestions || [])].sort(
        (left, right) =>
          new Date(right.submittedAt).getTime() -
          new Date(left.submittedAt).getTime(),
      ),
    [data],
  );

  const myShares = useMemo(
    () =>
      (data?.sharepacks || [])
        .filter((sharepack) => sharepack.status === "shared")
        .sort(
          (left, right) =>
            new Date(right.sharedAt || right.assignedAt).getTime() -
            new Date(left.sharedAt || left.assignedAt).getTime(),
        ),
    [data],
  );

  if (loading) {
    return (
      <main className="eaw-loading" aria-busy="true">
        <Loader title="Loading employee advocacy workspace" />
      </main>
    );
  }

  if (loadError || !data) {
    return (
      <main className="eaw-load-error">
        <EmptyState
          stateType="error"
          displayText="Employee advocacy is unavailable"
          errorMessage={loadError}
          primaryBtnText="Try again"
          primaryBtnOnClick={() => void load()}
        />
      </main>
    );
  }

  return (
    <div className="eaw-shell">
      <a className="eaw-skip-link" href="#employee-workspace-content">
        Skip to content
      </a>
      <aside className="eaw-nav" aria-label="Employee advocacy navigation">
        <div className="eaw-brand">
          <img
            className="eaw-brand-logo"
            src={oneHealthLogo}
            alt=""
            aria-hidden="true"
          />
          <div>
            <strong>One Health</strong>
            <span>Employee Advocacy</span>
          </div>
        </div>
        <nav>
          {NAV_ITEMS.map((item) => {
            const isActive = section === item.id;
            return (
              <div
                key={item.id}
                className={`eaw-nav-item-shell ${
                  isActive ? "is-active" : ""
                }`}
              >
                {isActive && (
                  <span className="eaw-nav-item__indicator" aria-hidden="true" />
                )}
                <button
                  type="button"
                  className="eaw-nav-item"
                  onClick={() => changeSection(item.id)}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="eaw-nav-item__content">
                    <span className="eaw-nav-item__icon">
                      <NavIcon icon={item.icon} />
                    </span>
                    <span className="eaw-nav-item__label">{item.label}</span>
                    {item.id === "home" && <NavCountBadge count={homeBadgeCount} />}
                  </span>
                </button>
              </div>
            );
          })}
        </nav>
        <div className="eaw-nav-profile">
          <Avatar userName={data.profile.name} size={36} fontSize={12} />
          <div>
            <strong>{data.profile.name}</strong>
            <span>Employee advocate</span>
          </div>
        </div>
      </aside>

      <main id="employee-workspace-content" className="eaw-main" tabIndex={-1}>
        <header className="eaw-page-header">
          <div>
            <h1>{sectionTitles[section].title}</h1>
            <p>{sectionTitles[section].description}</p>
          </div>
        </header>

        {feedback && (
          <div className="eaw-page-feedback">
            <Feedback
              message={feedback.message}
              tone={feedback.tone}
              onDismiss={() => setFeedback(null)}
            />
          </div>
        )}

        {section === "home" && (
          <div className="eaw-home-layout">
            <div className="eaw-home-search" aria-label="Search stories">
              <Input
                id="story-search"
                type="search"
                placeholder="Search stories"
                value={search}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setSearch(event.target.value)
                }
              />
            </div>
            <div className="eaw-home-actions">
              <button
                type="button"
                className="cs-btn cs-btn--primary eaw-home-suggest-btn"
                onClick={() => {
                  setShowSuggestion(true);
                  trackAdvocacyEvent("suggestion_started");
                }}
              >
                Suggest a post
              </button>
            </div>
            <div className="eaw-content-column">
              <StoriesList
                sharepacks={sortedStories}
                sort={storySort}
                onSortChange={(nextSort) => {
                  setStorySort(nextSort);
                  trackAdvocacyEvent("campaign_filter_changed", {
                    filter: nextSort,
                  });
                }}
                onShare={(sharepack) => void openShareStory(sharepack)}
              />
            </div>
            <aside className="eaw-right-rail" aria-label="Your advocacy summary">
              <LeaderboardPreview
                data={data}
                onOpen={() => changeSection("leaderboard")}
              />
              <ProfileCard data={data} />
            </aside>
          </div>
        )}

        {section === "shares" && (
          <MySharesPage
            shares={myShares}
            profileName={data.profile.name}
            onNewPost={() => changeSection("home")}
            onPreview={(sharepack) => {
              setSharedPostPreview(sharepack);
              trackAdvocacyEvent("share_story_opened", {
                sharepackId: sharepack.id,
                preview: true,
              });
            }}
          />
        )}

        {section === "leaderboard" && data && (
          <>
            <LeaderboardPage
              advocates={rankedAdvocates}
              period={period}
              metric={leaderboardMetric}
              onPeriodChange={(value) => {
                setPeriod(value);
                trackAdvocacyEvent("reporting_period_changed", { period: value });
              }}
              onMetricChange={(value) => {
                setLeaderboardMetric(value);
                trackAdvocacyEvent("leaderboard_metric_changed", {
                  metric: value,
                });
              }}
              onOpenPointsGuide={() => setShowPointsGuide(true)}
            />
            {showPointsGuide && (
              <PointsGuideDrawer onClose={() => setShowPointsGuide(false)} />
            )}
          </>
        )}

        {section === "analytics" && (
          <AnalyticsPage
            overview={data.analytics.overview}
            shares={myShares}
            profileName={data.profile.name}
            period={period}
            onPeriodChange={(value) => {
              setPeriod(value);
              trackAdvocacyEvent("reporting_period_changed", { period: value });
            }}
            onPreviewShare={(sharepack) => {
              setSharedPostPreview(sharepack);
              trackAdvocacyEvent("share_story_opened", {
                sharepackId: sharepack.id,
                preview: true,
              });
            }}
          />
        )}

        {section === "suggestions" && (
          <MySuggestionsPage
            suggestions={sortedSuggestions}
            profileName={data.profile.name}
            onNewSuggestion={() => {
              setShowSuggestion(true);
              trackAdvocacyEvent("suggestion_started");
            }}
            onPreview={setSuggestionPreview}
          />
        )}
      </main>

      <div className="eaw-live-region" aria-live="polite" aria-atomic="true">
        {feedback?.message}
      </div>

      {sharedPostPreview && (
        <ShareStoryModal
          mode="preview"
          sharepack={sharedPostPreview}
          connectedAccount={{
            displayName: data.profile.connectedAccount.displayName,
            platform:
              sharedPostPreview.sharedPlatform ||
              data.profile.connectedAccount.platform,
          }}
          onClose={() => setSharedPostPreview(null)}
        />
      )}
      {shareStoryTarget && (
        <ShareStoryModal
          sharepack={shareStoryTarget}
          connectedAccount={data.profile.connectedAccount}
          onClose={() => setShareStoryTarget(null)}
          onShareNow={(caption) => void completeShareStory(caption)}
          onScheduleOption={(option) => {
            trackAdvocacyEvent("share_story_scheduled", {
              sharepackId: shareStoryTarget.id,
              option,
            });
            setShareStoryTarget(null);
            setFeedback({
              tone: "info",
              message: `${option} is not available in this preview. Your post was not scheduled.`,
            });
          }}
        />
      )}
      {selectedSharepack && (
        <SharepackDetail
          sharepack={selectedSharepack}
          onClose={() => setSelectedSharepack(null)}
          onAction={handleSharepackAction}
        />
      )}
      {suggestionPreview && (
        <SuggestionPreviewModal
          suggestion={suggestionPreview}
          onClose={() => setSuggestionPreview(null)}
        />
      )}
      {showSuggestion && (
        <SuggestionComposer
          onClose={() => setShowSuggestion(false)}
          onSubmit={submitSuggestion}
        />
      )}
    </div>
  );
};

export default EmployeeAdvocacyWorkspace;
