import engineeringImage from "../../../assets/campaign-studio/amplify/amp-pack-atl-engineering.jpg";
import earthDayImage from "../../../assets/campaign-studio/amplify/amp-pack-earth-day.jpg";
import milestoneImage from "../../../assets/campaign-studio/amplify/amp-pack-marcus-5yr.jpg";
import nursingImage from "../../../assets/campaign-studio/amplify/amp-pack-rn-journey.jpg";
import hiringFairImage from "../../../assets/campaign-studio/amplify/amp-pack-sales-fair.jpg";
import { rebrandDemoValue } from "../demoBrand";
import {
  AdvocacyEventName,
  Advocate,
  PostSuggestion,
  Sharepack,
  SuggestionDraft,
  WorkspaceData,
} from "./types";

export const EMPLOYEE_WORKSPACE_STORAGE_KEY = "txe.employee-advocacy.workspace.v2";
const STORAGE_KEY = EMPLOYEE_WORKSPACE_STORAGE_KEY;

const withTracking = (destination: string, campaign: string, content: string) => {
  const url = new URL(destination);
  url.searchParams.set("utm_source", "employee_advocacy");
  url.searchParams.set("utm_medium", "social");
  url.searchParams.set("utm_campaign", campaign);
  url.searchParams.set("utm_content", content);
  return url.toString();
};

const initialSharepacks: Sharepack[] = [
  {
    id: "sp-engineering",
    title: "Build technology that improves care",
    campaignName: "Atlanta Engineering Hiring",
    description:
      "Share open engineering roles with people in your network who want their work to make a measurable difference.",
    caption:
      "The best technology starts with a meaningful problem. Our engineering teams build tools that help caregivers and patients every day. Explore open roles and share with someone who would thrive here.",
    destinationLabel: "Explore engineering roles",
    destinationUrl: "https://careers.onehealth.org/engineering",
    utmUrl: withTracking(
      "https://careers.onehealth.org/engineering",
      "atlanta-engineering",
      "employee-workspace",
    ),
    assignedAt: "2026-08-28T09:00:00.000Z",
    expiresAt: "2026-09-20T23:59:59.000Z",
    status: "new",
    image: engineeringImage,
    assetName: "engineering-team-sharepack.jpg",
    assetType: "JPG · 1600 × 900",
    topic: "Hiring",
    shareCount: 0,
    platforms: ["linkedin", "facebook"],
  },
  {
    id: "sp-nursing",
    title: "A nursing career built around growth",
    campaignName: "Nursing Career Stories",
    description:
      "Help experienced nurses discover a team where clinical excellence and career development go together.",
    caption:
      "Growth looks different for every nurse. At One Health, it can mean deepening a specialty, mentoring teammates, or stepping into leadership. See where your nursing career could go next.",
    destinationLabel: "View nursing careers",
    destinationUrl: "https://careers.onehealth.org/nursing",
    utmUrl: withTracking(
      "https://careers.onehealth.org/nursing",
      "nursing-career-stories",
      "employee-workspace",
    ),
    assignedAt: "2026-08-24T14:30:00.000Z",
    expiresAt: "2026-09-12T23:59:59.000Z",
    status: "downloaded",
    image: nursingImage,
    assetName: "nursing-growth-story.jpg",
    assetType: "JPG · 1600 × 900",
    topic: "Employee stories",
    shareCount: 3,
    platforms: ["linkedin", "x", "facebook"],
  },
  {
    id: "sp-earth-day",
    title: "Small actions, healthier communities",
    campaignName: "Sustainability Week",
    description:
      "Celebrate how local teams support healthier communities through practical sustainability work.",
    caption:
      "Care for people includes care for the places we share. I’m proud of how our teams turned Sustainability Week into practical action for healthier communities.",
    destinationLabel: "Learn about our culture",
    destinationUrl: "https://careers.onehealth.org/benefits",
    utmUrl: withTracking(
      "https://careers.onehealth.org/benefits",
      "sustainability-week",
      "employee-workspace",
    ),
    assignedAt: "2026-08-18T11:00:00.000Z",
    expiresAt: "2026-09-30T23:59:59.000Z",
    status: "shared",
    image: earthDayImage,
    assetName: "sustainability-week.jpg",
    assetType: "JPG · 1600 × 900",
    topic: "Culture",
    shareCount: 12,
    platforms: ["linkedin", "facebook", "instagram"],
    sharedAt: "2026-08-22T14:05:00.000Z",
    sharedPlatform: "linkedin",
  },
  {
    id: "sp-fall-events",
    title: "Fall event season",
    campaignName: "Industry Events",
    description:
      "Share where One Health is meeting talent leaders this fall and invite your network to connect with the team.",
    caption:
      "The fall schedule is set. NYC, DC, San Diego, Toronto, London, Las Vegas, Paris, Orlando, Hyderabad. One Health is showing up everywhere talent leaders are gathering this season...",
    destinationLabel: "View event calendar",
    destinationUrl: "https://careers.onehealth.org/events",
    utmUrl: withTracking(
      "https://careers.onehealth.org/events",
      "fall-events",
      "employee-workspace",
    ),
    assignedAt: "2026-09-01T08:00:00.000Z",
    expiresAt: "2026-10-15T23:59:59.000Z",
    status: "shared",
    image: hiringFairImage,
    assetName: "fall-events-sharepack.jpg",
    assetType: "JPG · 1600 × 900",
    topic: "Events",
    shareCount: 4,
    platforms: ["linkedin"],
    sharedAt: "2026-09-08T09:18:00.000Z",
    sharedPlatform: "linkedin",
  },
  {
    id: "sp-milestone",
    title: "Five years of learning and impact",
    campaignName: "Employee Milestones",
    description:
      "Share Marcus’s career story and celebrate the teammates who make long-term growth possible.",
    caption:
      "Five years in, and there are still new things to learn and new ways to make an impact. Stories like Marcus’s are a reminder that careers grow when people support one another.",
    destinationLabel: "Explore life at One Health",
    destinationUrl: "https://careers.onehealth.org/",
    utmUrl: withTracking(
      "https://careers.onehealth.org/",
      "employee-milestones",
      "employee-workspace",
    ),
    assignedAt: "2026-07-30T10:00:00.000Z",
    expiresAt: "2026-08-30T23:59:59.000Z",
    status: "expired",
    image: milestoneImage,
    assetName: "marcus-five-year-story.jpg",
    assetType: "JPG · 1600 × 900",
    topic: "Employee stories",
    shareCount: 1,
    platforms: ["linkedin"],
  },
  {
    id: "sp-hiring-fair",
    title: "Meet the team at our hiring fair",
    campaignName: "Sales Hiring Fair",
    description:
      "This sharepack was withdrawn by the campaign administrator and is retained for activity history.",
    caption:
      "Meet our team and learn about open roles at the upcoming hiring fair.",
    destinationLabel: "Hiring fair details",
    destinationUrl: "https://careers.onehealth.org/events",
    utmUrl: withTracking(
      "https://careers.onehealth.org/events",
      "sales-hiring-fair",
      "employee-workspace",
    ),
    assignedAt: "2026-08-10T08:00:00.000Z",
    expiresAt: "2026-09-05T23:59:59.000Z",
    status: "withdrawn",
    image: hiringFairImage,
    assetName: "sales-hiring-fair.jpg",
    assetType: "JPG · 1600 × 900",
    topic: "Events",
    shareCount: 0,
    platforms: ["linkedin", "facebook"],
  },
];

const seedData: WorkspaceData = {
  profile: {
    id: "employee-1024",
    name: "Ann Smith",
    role: "Senior Product Manager",
    location: "Philadelphia, PA",
    segments: ["Corporate employees", "Product & Technology"],
    tags: ["Employee advocate", "English (US)", "East region"],
    connectedAccount: {
      platform: "linkedin",
      displayName: "Ann Smith",
    },
  },
  sharepacks: initialSharepacks,
  advocates: [
    { id: "adv-1", name: "Jeff Carey", points: 910, clicks: 142, shares: 38, rank: 1 },
    { id: "adv-2", name: "Paul Campman", points: 900, clicks: 128, shares: 35, rank: 2 },
    { id: "adv-3", name: "James Wilson", points: 465, clicks: 86, shares: 22, rank: 3 },
    { id: "adv-4", name: "Frank Stietenroth", points: 405, clicks: 74, shares: 19, rank: 4 },
    {
      id: "employee-1024",
      name: "Ann Smith",
      points: 365,
      clicks: 68,
      shares: 16,
      rank: 5,
      isCurrentEmployee: true,
    },
    { id: "adv-6", name: "Michael Wallace", points: 320, clicks: 61, shares: 14, rank: 6 },
    { id: "adv-7", name: "Lauren Johnston", points: 265, clicks: 52, shares: 12, rank: 7 },
    { id: "adv-8", name: "Samuel Abbasi", points: 260, clicks: 49, shares: 11, rank: 8 },
    { id: "adv-9", name: "Eric Offner", points: 235, clicks: 44, shares: 10, rank: 9 },
    { id: "adv-10", name: "Kari Griffith", points: 235, clicks: 43, shares: 10, rank: 10 },
  ],
  campaigns: [
    {
      id: "campaign-nursing",
      name: "Nursing Career Stories",
      reportingPeriod: "Aug 1–31, 2026",
      role: "participated",
      metrics: {
        traffic: { value: 2684, state: "available" },
        clicks: { value: 1142, state: "available" },
        applications: { value: 38, state: "available" },
        earnedMediaValue: {
          formattedValue: "$14,820",
          state: "available",
        },
      },
      employeeActivity: {
        packsOpened: 3,
        assetsDownloaded: 2,
        selfReportedShares: 1,
      },
    },
    {
      id: "campaign-engineering",
      name: "Atlanta Engineering Hiring",
      reportingPeriod: "Aug 15–Sep 1, 2026",
      role: "assigned",
      metrics: {
        traffic: { value: 760, state: "available" },
        clicks: { value: 286, state: "available" },
        applications: {
          state: "delayed",
          note: "Application attribution is typically available within 24 hours.",
        },
        earnedMediaValue: {
          state: "unavailable",
          note: "Earned media value is not enabled for this campaign.",
        },
      },
      employeeActivity: {
        packsOpened: 1,
        assetsDownloaded: 1,
        selfReportedShares: 0,
      },
    },
  ],
  analytics: {
    overview: [
      {
        id: "shares",
        label: "Shares",
        value: 1,
        changePercent: 100,
        trend: "flat",
      },
      {
        id: "followers",
        label: "Followers",
        value: 3324,
        changePercent: 1,
        trend: "up",
      },
      {
        id: "link-clicks",
        label: "Link Clicks",
        value: 0,
        changePercent: 0,
        trend: "flat",
      },
      {
        id: "reach",
        label: "Reach",
        value: 0,
        changePercent: 0,
        trend: "flat",
      },
      {
        id: "engagements",
        label: "Engagements",
        value: 0,
        changePercent: 0,
        trend: "flat",
      },
      {
        id: "engagement-rate",
        label: "Engagement Rate",
        value: 0,
        formattedValue: "0.00%",
        changePercent: 0,
        trend: "flat",
      },
    ],
  },
  suggestions: [
    {
      id: "suggestion-1",
      title: "Volunteer day recap",
      text:
        "A behind-the-scenes post about our volunteer day and the local organizations we supported.",
      platforms: ["linkedin", "facebook"],
      assetId: "sp-earth-day",
      assetName: "sustainability-week.jpg",
      status: "pending",
      submittedAt: "2026-09-08T17:05:00.000Z",
      createdByName: "Ann Smith",
    },
    {
      id: "suggestion-2",
      title: "Mentorship program spotlight",
      text:
        "Feature the mentorship program with short quotes from a mentor and a new team member.",
      platforms: ["linkedin"],
      assetId: "sp-milestone",
      assetName: "marcus-five-year-story.jpg",
      status: "changes_requested",
      submittedAt: "2026-08-12T10:15:00.000Z",
      createdByName: "Jeff Carey",
      feedback:
        "Please add the intended audience and confirm that participants have approved the quotes.",
    },
    {
      id: "suggestion-3",
      title: "Engineering careers push",
      text:
        "The best technology starts with a meaningful problem. Our engineering teams build tools that help caregivers and patients every day.",
      platforms: ["linkedin", "x"],
      assetId: "sp-engineering",
      assetName: "engineering-team-sharepack.jpg",
      status: "approved",
      submittedAt: "2026-08-05T14:30:00.000Z",
      createdByName: "Paul Campman",
    },
    {
      id: "suggestion-4",
      title: "Nursing growth story",
      text:
        "Growth looks different for every nurse. At One Health, it can mean deepening a specialty, mentoring teammates, or stepping into leadership.",
      platforms: ["linkedin", "instagram"],
      assetId: "sp-nursing",
      assetName: "nursing-growth-story.jpg",
      status: "rejected",
      submittedAt: "2026-07-28T09:45:00.000Z",
      createdByName: "James Wilson",
      feedback: "This topic is already covered in an active campaign.",
    },
  ],
};

export const suggestionAssetOptions = initialSharepacks.map((sharepack) => ({
  label: sharepack.assetName,
  value: sharepack.id,
}));

export type SuggestionLibraryAsset = {
  id: string;
  label: string;
  src: string;
  meta: string;
  assetName: string;
};

export const suggestionLibraryAssets: SuggestionLibraryAsset[] =
  initialSharepacks.map((sharepack) => ({
    id: sharepack.id,
    label: sharepack.campaignName,
    src: sharepack.image,
    meta: "Campaign image · JPG",
    assetName: sharepack.assetName,
  }));

const cloneSeed = (): WorkspaceData => JSON.parse(JSON.stringify(seedData));

const mergeWorkspaceData = (parsed: Partial<WorkspaceData> | null): WorkspaceData => {
  if (!parsed) return cloneSeed();
  const seedById = new Map(initialSharepacks.map((item) => [item.id, item]));

  return {
    ...cloneSeed(),
    ...parsed,
    profile: {
      ...seedData.profile,
      ...(parsed.profile || {}),
      connectedAccount:
        parsed.profile?.connectedAccount || seedData.profile.connectedAccount,
    },
    sharepacks: Array.isArray(parsed.sharepacks)
      ? parsed.sharepacks.map((sharepack) => {
          const seed = seedById.get(sharepack.id);
          return {
            ...(seed || {}),
            ...sharepack,
            shareCount: sharepack.shareCount ?? seed?.shareCount ?? 0,
            platforms: sharepack.platforms ?? seed?.platforms ?? ["linkedin"],
            sharedAt: sharepack.sharedAt ?? seed?.sharedAt,
            sharedPlatform: sharepack.sharedPlatform ?? seed?.sharedPlatform,
            sharedCaption: sharepack.sharedCaption ?? seed?.sharedCaption,
            shareStats: sharepack.shareStats ?? seed?.shareStats,
          };
        })
      : initialSharepacks,
    advocates: Array.isArray(parsed.advocates)
      ? parsed.advocates.map((advocate: Advocate) => ({
          ...advocate,
          clicks: advocate.clicks ?? Math.round(advocate.points * 0.15),
          shares: advocate.shares ?? Math.round(advocate.points * 0.04),
        }))
      : seedData.advocates,
    campaigns: Array.isArray(parsed.campaigns)
      ? parsed.campaigns
      : seedData.campaigns,
    analytics: parsed.analytics?.overview?.length
      ? parsed.analytics
      : seedData.analytics,
    suggestions: Array.isArray(parsed.suggestions)
      ? parsed.suggestions.map((suggestion: PostSuggestion) => {
          const seed = seedData.suggestions.find(
            (item) => item.id === suggestion.id,
          );
          return {
            ...(seed || {}),
            ...suggestion,
            title: suggestion.title || seed?.title || "Untitled suggestion",
            createdByName:
              suggestion.createdByName ||
              seed?.createdByName ||
              seedData.profile.name,
            platforms:
              suggestion.platforms?.length
                ? suggestion.platforms
                : seed?.platforms || ["linkedin"],
          };
        })
      : seedData.suggestions,
  };
};

export const loadEmployeeWorkspaceSync = (): WorkspaceData => {
  if (typeof window === "undefined") return cloneSeed();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneSeed();
    return mergeWorkspaceData(rebrandDemoValue(JSON.parse(raw) as WorkspaceData));
  } catch {
    return cloneSeed();
  }
};

export const saveEmployeeWorkspaceSync = (data: WorkspaceData): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const employeeAdvocacyAdapter = {
  async load(): Promise<WorkspaceData> {
    if (typeof window === "undefined") return cloneSeed();
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return cloneSeed();
      return mergeWorkspaceData(rebrandDemoValue(JSON.parse(raw) as WorkspaceData));
    } catch {
      return cloneSeed();
    }
  },

  async save(data: WorkspaceData): Promise<void> {
    saveEmployeeWorkspaceSync(data);
  },

  createSuggestion(draft: SuggestionDraft): PostSuggestion {
    const workspace = loadEmployeeWorkspaceSync();
    const asset = initialSharepacks.find(
      (sharepack) => sharepack.id === draft.assetId,
    );
    const isUploadedAsset = draft.assetId.startsWith("suggestion-upload-");
    return {
      id: `suggestion-${Date.now()}`,
      title: draft.title.trim(),
      text: draft.text.trim(),
      platforms: draft.platforms,
      assetId: draft.assetId,
      assetName: asset?.assetName || draft.uploadedAssetName,
      assetImageSrc: isUploadedAsset ? draft.uploadedAssetSrc : undefined,
      status: "pending",
      submittedAt: new Date().toISOString(),
      createdByName: workspace.profile.name,
    };
  },
};

export const trackAdvocacyEvent = (
  eventName: AdvocacyEventName,
  properties: Record<string, string | number | boolean | undefined> = {},
) => {
  const detail = {
    eventName,
    properties,
    occurredAt: new Date().toISOString(),
    externalPublicationVerified: false,
  };

  window.dispatchEvent(
    new CustomEvent("txeEmployeeAdvocacyEvent", { detail }),
  );

  try {
    const tracker = (window as any).__OPENREPLAY__;
    tracker?.event?.(`employee_advocacy_${eventName}`, properties);
    const phenomEvent = (window as any).phenomevent;
    phenomEvent?.track?.(`employee_advocacy_${eventName}`, detail);
  } catch {
    // Product analytics must never interrupt an employee workflow.
  }
};
