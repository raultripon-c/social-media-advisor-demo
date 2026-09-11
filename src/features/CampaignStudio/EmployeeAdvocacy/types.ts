export type WorkspaceSection =
  | "home"
  | "shares"
  | "leaderboard"
  | "analytics"
  | "suggestions";

export type AdvocacyPlatform = "linkedin" | "facebook" | "x" | "instagram";

export type StorySortOption = "recent" | "shared";

export interface ConnectedSocialAccount {
  platform: AdvocacyPlatform;
  displayName: string;
}

export type SharepackStatus =
  | "new"
  | "viewed"
  | "downloaded"
  | "shared"
  | "expired"
  | "withdrawn"
  | "unavailable";

export interface Sharepack {
  id: string;
  title: string;
  campaignName: string;
  description: string;
  caption: string;
  destinationLabel: string;
  destinationUrl: string;
  utmUrl: string;
  assignedAt: string;
  expiresAt: string;
  status: SharepackStatus;
  image: string;
  assetName: string;
  assetType: string;
  topic: string;
  shareCount: number;
  platforms: AdvocacyPlatform[];
  sharedAt?: string;
  sharedPlatform?: AdvocacyPlatform;
  sharedCaption?: string;
  shareStats?: SharePostStats;
}

export interface SharePostStats {
  shares: number;
  applies: number;
  linkClicks: number;
  comments: number;
  reactions: number;
  impressions: number;
  hires: number;
}

export type LeaderboardMetric = "points" | "clicks" | "shares";

export type LeaderboardPeriod = "current-month" | "last-month" | "custom-date";

export interface Advocate {
  id: string;
  name: string;
  points: number;
  clicks: number;
  shares: number;
  rank: number;
  isCurrentEmployee?: boolean;
}

export interface EmployeeProfile {
  id: string;
  name: string;
  role: string;
  location: string;
  segments: string[];
  tags: string[];
  connectedAccount: ConnectedSocialAccount;
}

export interface MetricValue {
  value?: number;
  formattedValue?: string;
  state: "available" | "delayed" | "unavailable";
  note?: string;
}

export type AnalyticsTrend = "up" | "down" | "flat";

export interface AnalyticsOverviewMetric {
  id: string;
  label: string;
  value: number;
  formattedValue?: string;
  changePercent: number;
  trend: AnalyticsTrend;
}

export interface WorkspaceAnalytics {
  overview: AnalyticsOverviewMetric[];
}

export interface EmployeeCampaignAnalytics {
  id: string;
  name: string;
  reportingPeriod: string;
  role: "assigned" | "participated";
  metrics: {
    traffic: MetricValue;
    clicks: MetricValue;
    applications: MetricValue;
    earnedMediaValue: MetricValue;
  };
  employeeActivity: {
    packsOpened: number;
    assetsDownloaded: number;
    selfReportedShares: number;
  };
}

export type SuggestionStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "changes_requested";

export interface PostSuggestion {
  id: string;
  title: string;
  text: string;
  platforms: AdvocacyPlatform[];
  assetId?: string;
  assetName?: string;
  destinationUrl?: string;
  context?: string;
  status: SuggestionStatus;
  submittedAt: string;
  feedback?: string;
}

export interface SuggestionDraft {
  title: string;
  text: string;
  platforms: AdvocacyPlatform[];
  assetId: string;
}

export type AdvocacyEventName =
  | "workspace_opened"
  | "sharepack_viewed"
  | "asset_downloaded"
  | "caption_copied"
  | "utm_link_copied"
  | "sharepack_marked_shared"
  | "share_story_opened"
  | "share_story_scheduled"
  | "leaderboard_opened"
  | "campaign_analytics_opened"
  | "campaign_filter_changed"
  | "reporting_period_changed"
  | "leaderboard_metric_changed"
  | "suggestion_started"
  | "suggestion_submitted"
  | "suggestion_submission_failed";

export interface WorkspaceData {
  profile: EmployeeProfile;
  sharepacks: Sharepack[];
  advocates: Advocate[];
  campaigns: EmployeeCampaignAnalytics[];
  analytics: WorkspaceAnalytics;
  suggestions: PostSuggestion[];
}
