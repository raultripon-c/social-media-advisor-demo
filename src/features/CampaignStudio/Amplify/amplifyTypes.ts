export type AmplifyMode = "packs" | "dispatch" | "impact";

export type SharePackStatus = "draft" | "needs_approval" | "ready" | "sent" | "archived";

export type AmplifyChannel = "email" | "slack" | "teams";

export type AmplifySource =
  | "Push·CRM"
  | "Push·ERM"
  | "Push·Calendar"
  | "Pull·template"
  | "Campaign"
  | "Content Board"
  | "Manual";

export interface ShareCaption {
  id: string;
  text: string;
}

export interface AmplifyCampaignSeed {
  campaignId: string;
  name: string;
  copy?: string;
  ctaDestination?: string;
}

export interface SharePackMetrics {
  shares: number;
  clicks: number;
  applications: number;
  emvUsd: number;
}

export interface SharePack {
  id: string;
  title: string;
  subtitle: string;
  status: SharePackStatus;
  source: AmplifySource;
  sourceLabel: string;
  audienceLabel: string;
  audienceCount: number;
  channels: AmplifyChannel[];
  thumbnailUrl: string;
  mediaType: "image" | "video";
  assets?: { src: string; kind: "image" | "video"; label: string }[];
  ctaLabel: string;
  ctaDestination: string;
  utmPreview: string;
  captions: ShareCaption[];
  metrics?: SharePackMetrics;
  createdAt: string;
  sentAt?: string;
}

export interface DispatchTemplate {
  id: string;
  title: string;
  description: string;
  audienceHint: string;
  prompt: string;
}

export type AmplifyCtaDestinationType = "page" | "job" | "event";

export interface AmplifySharePackDraft {
  templateId: string;
  title: string;
  note: string;
  audiences: string[];
  assetId: string;
  ctaDestinationType: AmplifyCtaDestinationType;
  ctaPageValue: string;
  ctaJobValue: string;
  ctaEventValue: string;
  ctaPersona: string;
  captions: ShareCaption[];
  selectedCaptionIds: string[];
}

export interface ImpactKpi {
  id: string;
  label: string;
  value: string;
  delta?: string;
}

export interface ShareVelocityPackSplit {
  packId: string;
  name: string;
  shares: number;
}

export interface ShareVelocityPoint {
  label: string;
  value: number;
  packs: ShareVelocityPackSplit[];
}

export interface AttributionRow {
  id: string;
  employee: string;
  pack: string;
  channel: AmplifyChannel;
  clicks: number;
  applications: number;
  lastShare: string;
}

export type PackStatusFilter = "all" | SharePackStatus;
