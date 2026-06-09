import facebookImage from "../../assets/campaign-studio/reference/facebook-nursing-lifestyle.png";
import instagramImage from "../../assets/campaign-studio/reference/instagram-nursing-lifestyle.png";
import linkedinImage from "../../assets/campaign-studio/reference/linkedin-nursing-lifestyle.png";
import xImage from "../../assets/campaign-studio/reference/x-nursing-lifestyle.png";

import { BriefDetails, Campaign, CampaignMetrics, CampaignPlatformName, CampaignStudioAdapter } from "./types";

const STORAGE_PREFIX = "txe.campaignStudio.campaigns.v2";

export const channelOptions: CampaignPlatformName[] = ["LinkedIn", "Instagram", "Facebook", "X"];

export const toneOptions = [
  "Friendly and professional",
  "Warm and empathetic",
  "Direct and energetic",
  "Premium and polished",
  "Casual and upbeat",
];

export const templateCards = [
  {
    title: "Attract Passive Talent",
    prompt: "Attract professionals not actively looking for new roles.",
    icon: "user",
  },
  {
    title: "Showcase Your Brand",
    prompt: "Showcase culture and values across channels.",
    icon: "sparkle",
  },
  {
    title: "Build Talent Community",
    prompt: "Grow and nurture your candidate pipeline.",
    icon: "users",
  },
  {
    title: "Promote Your Event",
    prompt: "Drive RSVPs and attendance for hiring events.",
    icon: "calendar",
  },
  {
    title: "Launch Hiring Blitz",
    prompt: "Fast turnaround messaging for critical roles.",
    icon: "bolt",
  },
];

export const quickPromptOptions = [
  {
    title: "Clarify target role",
    helper: "Use when AI inferred the role too broadly.",
    example:
      "Create a campaign for Pediatric ICU Registered Nurses in Austin, TX. Focus on experienced nurses with night-shift availability and a warm, professional tone.",
  },
  {
    title: "Define candidate audience",
    helper: "Use when the original prompt missed who should respond.",
    example:
      "Create a campaign for senior backend engineers in New York. Target candidates with fintech experience who care about scale, reliability, and technical ownership. Use a direct, confident tone.",
  },
  {
    title: "Refine message tone",
    helper: "Use when tone needs more nuance than a dropdown.",
    example:
      "Create a nursing recruitment campaign in Texas. Use a compassionate, mission-driven tone for experienced nurses who care about patient impact, stability, and team support.",
  },
  {
    title: "Include multiple roles",
    helper: "Use when one campaign should cover a hiring push.",
    example:
      "Promote healthcare openings in Dallas for Registered Nurses, Medical Assistants, and Radiology Technicians. Keep the message broad enough for all roles while emphasizing growth, care quality, and local opportunity.",
  },
  {
    title: "Add exclusions to avoid",
    helper: "Use when there are claims or details to avoid.",
    example:
      "Create a campaign for retail associates in Phoenix. Focus on career growth and flexible scheduling. Do not mention weekend shifts or sign-on bonuses.",
  },
  {
    title: "Use employer brand angle",
    helper: "Use when this is more brand-led than requisition-led.",
    example:
      "Build an employer-brand campaign for experienced nurses in Houston. Emphasize culture, stability, patient impact, and why candidates should consider us before actively applying.",
  },
];

export const generationSteps = [
  "Analyzing audience...",
  "Finding the right message...",
  "Crafting content...",
  "Generating assets...",
  "Preparing your campaign...",
];

export const getSelectedTenantName = () => {
  try {
    const selectedTenant = JSON.parse(localStorage.getItem("selectedTenant") || "{}");
    return selectedTenant?.tenantName || selectedTenant?.customerName || "Phenom";
  } catch {
    return "Phenom";
  }
};

export const getSelectedTenantInitial = () => getSelectedTenantName().trim().charAt(0).toUpperCase() || "P";

export const getRefNum = () => {
  try {
    const selectedTenant = JSON.parse(localStorage.getItem("selectedTenant") || "{}");
    return selectedTenant?.refNum || "demo";
  } catch {
    return "demo";
  }
};

export const parseBrief = (brief: string, toneFallback = toneOptions[0]): BriefDetails => {
  const structuredRoleMatch = brief.match(/Target role or roles:\s*([^.]*)\./i);
  const structuredLocationMatch = brief.match(/Location or work model:\s*([^.]*)\./i);
  const roleMatch = brief.match(/(?:for|hiring|openings? for)\s+([^,.]+?)(?:\s+in\s+|\.|,|$)/i);
  const locationMatch = brief.match(/\bin\s+([A-Z][A-Za-z\s]+,\s*[A-Z]{2}|[A-Z][A-Za-z\s]+)(?:\.|,|$)/);
  const tone = toneOptions.find((option) => brief.toLowerCase().includes(option.toLowerCase().split(" ")[0])) || toneFallback;

  return {
    role: structuredRoleMatch?.[1]?.trim() || roleMatch?.[1]?.trim() || "priority roles",
    location: structuredLocationMatch?.[1]?.trim() || locationMatch?.[1]?.trim() || "target markets",
    audience: brief.toLowerCase().includes("experienced") ? "experienced candidates" : "qualified candidates",
    tone,
  };
};

export const makeCampaignName = (brief: string) => {
  const details = parseBrief(brief);
  const briefText = brief.toLowerCase();
  const roleText = details.role.toLowerCase();

  if (briefText.includes("event") || briefText.includes("rsvp") || briefText.includes("attendance")) return "Event Registration Campaign";
  if (briefText.includes("passive")) return "Passive Talent Outreach";
  if (briefText.includes("brand") || briefText.includes("culture") || briefText.includes("values")) return "Employer Brand Campaign";
  if (briefText.includes("community") || briefText.includes("pipeline")) return "Talent Community Growth";
  if (briefText.includes("blitz") || briefText.includes("critical") || briefText.includes("high-volume")) return "High-Volume Hiring Campaign";
  if (roleText.includes("nurse") || roleText.includes("clinical") || roleText.includes("medical") || roleText.includes("health")) return "Healthcare Hiring Campaign";
  if (roleText.includes("engineer") || roleText.includes("software") || roleText.includes("developer")) return "Technical Talent Outreach";
  if (roleText.includes("retail") || roleText.includes("associate")) return "Retail Hiring Campaign";

  return "Talent Attraction Campaign";
};

const platformImageMap: Record<CampaignPlatformName, string> = {
  Facebook: facebookImage,
  Instagram: instagramImage,
  LinkedIn: linkedinImage,
  X: xImage,
};

const platformAccentMap: Record<CampaignPlatformName, string> = {
  Facebook: "#1877f2",
  Instagram: "#c13584",
  LinkedIn: "#0a66c2",
  X: "#111827",
};

const platformSourceMap: Record<CampaignPlatformName, string> = {
  Facebook: "facebook",
  Instagram: "instagram",
  LinkedIn: "linkedin",
  X: "x",
};

const totals = (platforms: Campaign["platforms"]): CampaignMetrics =>
  platforms.reduce(
    (acc, platform) => ({
      clicks: acc.clicks + platform.metrics.clicks,
      applicationStarts: acc.applicationStarts + platform.metrics.applicationStarts,
      applications: acc.applications + platform.metrics.applications,
    }),
    { clicks: 0, applicationStarts: 0, applications: 0 }
  );

export const createCampaignFromBrief = (
  brief: string,
  selectedChannels: CampaignPlatformName[],
  campaignName: string,
  tone: string,
  dueDate: string,
  selectedCtaDestination?: string
): Campaign => {
  const details = parseBrief(brief, tone);
  const id = `campaign-${Date.now()}`;
  const tenantName = getSelectedTenantName();
  const employerName = tenantName === "Phenom" ? "Duke Health" : tenantName;
  const ctaDestination = selectedCtaDestination || `https://careers.dukehealth.org/jobs?campaign=${id}`;

  const platforms = selectedChannels.map((platform, index) => {
    const utmLink = `${ctaDestination}&utm_source=${platformSourceMap[platform]}&utm_medium=social&utm_campaign=${id}`;
    const copyByPlatform: Record<CampaignPlatformName, string> = {
      LinkedIn: `${employerName} is hiring ${details.role} in ${details.location}. Connect your experience with work that supports patients, families, and care teams every day. Learn more: ${utmLink}`,
      Instagram: `Ready to bring your care skills to ${employerName}? 💙 Explore ${details.role} opportunities in ${details.location} and join a team built around patient impact. #DukeHealthCareers #NursingJobs #HealthcareCareers Learn more: ${utmLink}`,
      Facebook: `Join ${employerName} and make an impact as part of our ${details.role} team in ${details.location}. We are reaching ${details.audience} with a ${details.tone.toLowerCase()} message. Learn more: ${utmLink}`,
      X: `${employerName} is hiring ${details.role} in ${details.location}. Make a difference with a team focused on care, community, and growth. #DukeHealth #HealthcareJobs Learn more: ${utmLink}`,
    };
    const copy = copyByPlatform[platform];

    return {
      platform,
      format: platform === "X" ? "Short social post" : "Social feed post",
      postDate: dueDate,
      copy,
      utmLink,
      assetName: `${platform.toLowerCase()}-${id}.png`,
      assetSize: platform === "LinkedIn" ? "1200 x 627" : "1080 x 1080",
      accent: platformAccentMap[platform],
      image: platformImageMap[platform],
      ctaDestination,
      altText: `${employerName} nursing team lifestyle image for ${platform}`,
      metrics: {
        clicks: 140 + index * 37,
        applicationStarts: 34 + index * 9,
        applications: 11 + index * 4,
      },
    };
  });

  return {
    id,
    name: campaignName || makeCampaignName(brief),
    role: details.role,
    location: details.location,
    tone: details.tone,
    audience: details.audience,
    status: "scheduled",
    createdAt: new Date().toISOString(),
    postDate: dueDate,
    platforms,
    metrics: totals(platforms),
  };
};

const demoCampaigns = (): Campaign[] => [
  createCampaignFromBrief(
    "Create a campaign for Registered Nurse, PICU in Durham, NC. Target experienced nurses with a warm and professional tone.",
    ["LinkedIn", "Facebook", "Instagram"],
    "Registered Nurse, PICU Campaign",
    toneOptions[0],
    new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  ),
  createCampaignFromBrief(
    "Create a campaign for Senior Software Engineers in San Francisco, CA. Use a professional tone.",
    ["LinkedIn", "Instagram", "Facebook", "X"],
    "Senior Software Engineer Campaign",
    toneOptions[2],
    new Date(Date.now() + 172800000).toISOString().slice(0, 10)
  ),
].map((campaign, index) => ({
  ...campaign,
  id: `demo-campaign-${index + 1}`,
  status: index === 0 ? "active" : "completed",
  metrics: index === 0
    ? { clicks: 3611, applicationStarts: 1940, applications: 1128 }
    : { clicks: 3852, applicationStarts: 994, applications: 298 },
  platforms: campaign.platforms.map((platform) => ({
    ...platform,
    metrics: index === 0
      ? platform.platform === "LinkedIn"
        ? { clicks: 2528, applicationStarts: 1264, applications: 1011 }
        : platform.platform === "Facebook"
          ? { clicks: 902, applicationStarts: 631, applications: 126 }
          : { clicks: 181, applicationStarts: 45, applications: 2 }
      : { clicks: platform.platform === "LinkedIn" ? 1233 : 873, applicationStarts: platform.platform === "LinkedIn" ? 318 : 225, applications: platform.platform === "LinkedIn" ? 95 : 68 },
  })),
}));

const storageKey = (refNum: string) => `${STORAGE_PREFIX}.${refNum || "demo"}`;
const memoryCampaignStore: Record<string, Campaign[]> = {};

const safeParseCampaigns = (value: string | null): Campaign[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const readStoredCampaigns = (key: string) => {
  const memoryCampaigns = memoryCampaignStore[key] || [];
  try {
    const storedCampaigns = safeParseCampaigns(localStorage.getItem(key));
    return [
      ...memoryCampaigns,
      ...storedCampaigns.filter((storedCampaign) => !memoryCampaigns.some((campaign) => campaign.id === storedCampaign.id)),
    ];
  } catch {
    return memoryCampaigns;
  }
};

const writeStoredCampaigns = (key: string, campaigns: Campaign[]) => {
  const userCampaigns = campaigns.filter((campaign) => !isDemoCampaign(campaign));
  memoryCampaignStore[key] = userCampaigns;
  try {
    localStorage.setItem(key, JSON.stringify(userCampaigns));
  } catch {
    // Keep the session working even when browser storage is blocked or full.
  }
};

const isDemoCampaign = (campaign: Campaign) => campaign.id.startsWith("demo-campaign-");

const isLegacyRoleName = (name: string) => /\b(campaign|event)\b/i.test(name) && /(\s-\s|,|\bregistered\b|\bnurse\b|\bengineer\b|\bdeveloper\b|\bassociate\b|\bpicu\b)/i.test(name);
const normalizeCampaignName = (campaign: Campaign): Campaign => {
  if (!isLegacyRoleName(campaign.name)) return campaign;

  return {
    ...campaign,
    name: makeCampaignName(getCampaignObjectiveBrief(campaign)),
  };
};

const getCampaignObjectiveBrief = (campaign: Campaign) => {
  const location = campaign.location && campaign.location !== "target markets" ? ` in ${campaign.location}` : "";
  return `Create a campaign for ${campaign.role}${location}. Target ${campaign.audience} with a ${campaign.tone.toLowerCase()} tone.`;
};

const withBaseCampaigns = (campaigns: Campaign[]) => {
  const baseCampaigns = demoCampaigns().map(normalizeCampaignName);
  const userCampaigns = campaigns.filter((campaign) => !isDemoCampaign(campaign)).map(normalizeCampaignName);
  return [
    ...userCampaigns,
    ...baseCampaigns.filter((baseCampaign) => !userCampaigns.some((campaign) => campaign.id === baseCampaign.id)),
  ];
};

export const campaignStudioAdapter: CampaignStudioAdapter = {
  listCampaigns: async (refNum: string) => {
    const key = storageKey(refNum);
    const campaigns = withBaseCampaigns(readStoredCampaigns(key));
    writeStoredCampaigns(key, campaigns);
    return campaigns;
  },
  saveCampaign: async (refNum: string, campaign: Campaign) => {
    const key = storageKey(refNum);
    const campaigns = readStoredCampaigns(key).filter((item) => !isDemoCampaign(item));
    const nextCampaigns = [campaign, ...campaigns.filter((item) => item.id !== campaign.id)];
    writeStoredCampaigns(key, nextCampaigns);
    return campaign;
  },
  deleteCampaign: async (refNum: string, campaignId: string) => {
    const key = storageKey(refNum);
    const campaigns = readStoredCampaigns(key);
    writeStoredCampaigns(key, campaigns.filter((campaign) => campaign.id !== campaignId));
  },
};
