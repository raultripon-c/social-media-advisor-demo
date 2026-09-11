export type AdminTrend = "up" | "down" | "flat";

export type AdminHeatmapTone = "primary" | "yellow" | "green";

export interface AdminOverviewKpi {
  id: string;
  label: string;
  value: number;
  formattedValue?: string;
  changePercent: number;
  trend: AdminTrend;
  sparkline: number[];
}

export interface AdminEngagementTypeMonth {
  month: string;
  segments: Array<{ label: string; value: number; color: string }>;
}

export interface AdminEngagingProfile {
  id: string;
  name: string;
  platform: "linkedin" | "instagram" | "facebook" | "x";
  engagements: number;
  engagementRate: number;
}

export interface AdminNetworkShare {
  label: string;
  value: number;
  color: string;
}

export interface AdminEngagingCampaign {
  id: string;
  name: string;
  engagements: number;
  color: string;
}

export interface AdminDayOfWeekSeries {
  day: string;
  values: Record<string, number>;
}

export interface AdminHeatmapCell {
  day: string;
  hour: number;
  value: number;
  tone?: AdminHeatmapTone;
}

export interface AdminEngagementData {
  overviewKpis: AdminOverviewKpi[];
  engagementsByType: AdminEngagementTypeMonth[];
  engagementTypeLegend: string[];
  topProfiles: AdminEngagingProfile[];
  topProfilesTotal: number;
  engagementsByNetwork: AdminNetworkShare[];
  networkEngagementsTotal: {
    value: string;
    label: string;
  };
  topCampaigns: AdminEngagingCampaign[];
  topCampaignsTotal: number;
  engagementsByDayOfWeek: AdminDayOfWeekSeries[];
  dayOfWeekNetworks: string[];
  engagementByTimeOfDay: AdminHeatmapCell[];
}
