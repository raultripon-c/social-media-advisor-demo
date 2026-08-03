import atlEngineeringThumb from "../../../assets/campaign-studio/amplify/amp-pack-atl-engineering.jpg";
import earthDayThumb from "../../../assets/campaign-studio/amplify/amp-pack-earth-day.jpg";
import marcusThumb from "../../../assets/campaign-studio/amplify/amp-pack-marcus-5yr.jpg";
import rnJourneyThumb from "../../../assets/campaign-studio/amplify/amp-pack-rn-journey.jpg";
import salesFairThumb from "../../../assets/campaign-studio/amplify/amp-pack-sales-fair.jpg";
import {
  AmplifyChannel,
  AmplifySharePackDraft,
  AttributionRow,
  DispatchTemplate,
  ImpactKpi,
  ShareCaption,
  SharePack,
  ShareVelocityPoint,
} from "./amplifyTypes";

const BRAND = "Duke Health";

const captions = (lines: string[]): ShareCaption[] =>
  lines.map((text, index) => ({ id: `cap-${index + 1}`, text }));

const utm = (slug: string) =>
  `utm_source=amplify&utm_medium={channel}&utm_campaign=${slug}&utm_content={empId}`;

export const packAssetOptions = [
  {
    id: "asset-atl-engineering",
    label: "Atlanta engineering team",
    src: atlEngineeringThumb,
    kind: "image" as const,
    meta: "Pack image · JPG",
  },
  {
    id: "asset-rn-journey",
    label: "RN journey story",
    src: rnJourneyThumb,
    kind: "image" as const,
    meta: "Pack image · JPG",
  },
  {
    id: "asset-earth-day",
    label: "Earth Day culture",
    src: earthDayThumb,
    kind: "image" as const,
    meta: "Pack image · JPG",
  },
  {
    id: "asset-sales-fair",
    label: "Hiring fair — Sales",
    src: salesFairThumb,
    kind: "image" as const,
    meta: "Pack image · JPG",
  },
  {
    id: "asset-marcus",
    label: "Marcus milestone",
    src: marcusThumb,
    kind: "image" as const,
    meta: "Pack image · JPG",
  },
];

export const demoSharePacks: SharePack[] = [
  {
    id: "pack-atlanta-eng",
    title: "Atlanta Engineering hiring",
    subtitle: "Open roles for software and clinical systems engineers",
    status: "ready",
    source: "Push·CRM",
    sourceLabel: "CRM opportunity",
    audienceLabel: "Engineering employees · Atlanta",
    audienceCount: 84,
    channels: ["email", "slack"],
    thumbnailUrl: atlEngineeringThumb,
    mediaType: "video",
    ctaLabel: "Explore engineering roles",
    ctaDestination: "https://careers.dukehealth.org/engineering",
    utmPreview: utm("atl-eng-hiring"),
    captions: captions([
      `We're hiring engineers in Atlanta who want to build tools that help caregivers. See open roles at ${BRAND}.`,
      `Proud of our Atlanta engineering team and growing. Interested in impactful work?`,
      `Clinical systems + modern software. That's the mix our Atlanta eng org is hiring for.`,
      `Know a great engineer? Share this ${BRAND} Atlanta hiring pack.`,
      `Build products that support patients and care teams. Atlanta engineering roles are open.`,
      `From EHR integrations to patient apps, our Atlanta eng team is expanding.`,
    ]),
    createdAt: "2026-07-12T14:00:00.000Z",
  },
  {
    id: "pack-rn-journey",
    title: "RN journey story",
    subtitle: "Nurse growth story ready for employee advocacy",
    status: "needs_approval",
    source: "Push·ERM",
    sourceLabel: "ERM milestone",
    audienceLabel: "Nursing · Durham & Raleigh",
    audienceCount: 216,
    channels: ["email", "teams", "slack"],
    thumbnailUrl: rnJourneyThumb,
    mediaType: "video",
    ctaLabel: "View nursing careers",
    ctaDestination: "https://careers.dukehealth.org/nursing",
    utmPreview: utm("rn-journey"),
    captions: captions([
      `From first shift to charge nurse, growth stories like this are why I love ${BRAND}.`,
      `Thinking about a nursing career? Here's one teammate's journey at ${BRAND}.`,
      `Compassionate care + real career pathways. Proud to share this RN story.`,
      `If you know a nurse looking for the next step, send them this.`,
      `Our nurses grow here. This journey story says it better than I can.`,
      `Bedside excellence and leadership, that's the RN path at ${BRAND}.`,
      `Share if you're proud of our nursing culture.`,
    ]),
    createdAt: "2026-07-20T09:30:00.000Z",
  },
  {
    id: "pack-earth-day",
    title: "Earth Day culture",
    subtitle: "Sustainability week highlights from local teams",
    status: "sent",
    source: "Push·Calendar",
    sourceLabel: "Cultural calendar",
    audienceLabel: "All employees",
    audienceCount: 1240,
    channels: ["email", "slack", "teams"],
    thumbnailUrl: earthDayThumb,
    mediaType: "image",
    ctaLabel: "Join our talent community",
    ctaDestination: "https://careers.dukehealth.org/talent-community",
    utmPreview: utm("earth-day-culture"),
    captions: captions([
      `Earth Day at ${BRAND}: small actions, big care for our communities.`,
      `Proud of how our teams showed up for sustainability week.`,
      `Care for people includes care for place. Happy Earth Day from ${BRAND}.`,
      `Want to work somewhere that takes community seriously? Start here.`,
      `Green teams, local cleanups, and smarter facilities. Earth Day at ${BRAND}.`,
    ]),
    metrics: { shares: 312, clicks: 1480, applications: 27, emvUsd: 18400 },
    createdAt: "2026-04-18T11:00:00.000Z",
    sentAt: "2026-04-20T15:00:00.000Z",
  },
  {
    id: "pack-hiring-fair-sales",
    title: "Hiring fair — Sales",
    subtitle: "Invite your network to tomorrow's sales hiring fair",
    status: "sent",
    source: "Push·CRM",
    sourceLabel: "CRM event",
    audienceLabel: "Sales & partnerships",
    audienceCount: 96,
    channels: ["email", "teams"],
    thumbnailUrl: salesFairThumb,
    mediaType: "image",
    ctaLabel: "RSVP / open sales roles",
    ctaDestination: "https://careers.dukehealth.org/events/sales-fair",
    utmPreview: utm("sales-hiring-fair"),
    captions: captions([
      `Sales hiring fair this week. Come meet the ${BRAND} team.`,
      `Know someone great in healthcare sales? Share this invite.`,
      `We're hiring relationship builders who care about outcomes.`,
      `Tomorrow's fair is the easiest way to explore sales careers at ${BRAND}.`,
      `Open roles + real conversations. Join our sales hiring fair.`,
    ]),
    metrics: { shares: 88, clicks: 420, applications: 14, emvUsd: 6200 },
    createdAt: "2026-06-02T10:00:00.000Z",
    sentAt: "2026-06-04T13:00:00.000Z",
  },
  {
    id: "pack-5yr-story",
    title: "5 year story from campaign",
    subtitle: "Marcus's milestone story packaged for employee shares",
    status: "ready",
    source: "Campaign",
    sourceLabel: "Published campaign",
    audienceLabel: "Nursing mentors",
    audienceCount: 64,
    channels: ["email", "slack"],
    thumbnailUrl: marcusThumb,
    mediaType: "video",
    ctaLabel: "Explore nursing roles",
    ctaDestination: "https://careers.dukehealth.org/nursing",
    utmPreview: utm("5yr-marcus"),
    captions: captions([
      `Five years in and still growing. Proud of teammates like Marcus at ${BRAND}.`,
      `Longevity stories matter. Here's one from our nursing team.`,
      `If you're looking for a place to build a career, start with stories like this.`,
      `Mentor culture is real here. Sharing Marcus's 5 year journey.`,
      `Growth from bedside to leadership is possible at ${BRAND}.`,
      `Celebrate tenure. Share this milestone pack with your network.`,
    ]),
    createdAt: "2026-07-08T16:20:00.000Z",
  },
];

export const dispatchTemplates: DispatchTemplate[] = [
  {
    id: "tmpl-job-sourcing",
    title: "Job sourcing amplify",
    description: "Ask employees to share open roles with their network.",
    audienceHint: "Hiring managers & recruiters",
  },
  {
    id: "tmpl-erg",
    title: "ERG / culture event",
    description: "Amplify ERG moments and culture celebrations.",
    audienceHint: "ERG members & allies",
  },
  {
    id: "tmpl-benefits",
    title: "Benefits showcase",
    description: "Highlight benefits and total rewards stories.",
    audienceHint: "All employees",
  },
  {
    id: "tmpl-milestone",
    title: "Milestone / onboarding",
    description: "Share onboarding and tenure milestones.",
    audienceHint: "New hires & mentors",
  },
];

export const dispatchCaptionPool = captions([
  `Join a team that puts people first. Explore careers at ${BRAND}.`,
  `Proud to work at ${BRAND} and we're hiring. Here's how to apply.`,
  `Know someone looking for meaningful work in healthcare? Share this.`,
  `Great roles, real impact. See what's open at ${BRAND}.`,
  `Our culture shows up in every shift. Curious? Start here.`,
  `From clinic to community, build your career at ${BRAND}.`,
  `I'm sharing this because I'd want someone to share it with me.`,
]);

export const cmsDestinationPages = [
  {
    label: "Duke Health homepage",
    value: "https://www.dukehealth.org/",
  },
  {
    label: "Careers homepage",
    value: "https://careers.dukehealth.org/",
  },
  {
    label: "Nursing careers",
    value: "https://careers.dukehealth.org/nursing",
  },
  {
    label: "Engineering careers",
    value: "https://careers.dukehealth.org/engineering",
  },
  {
    label: "Benefits and culture",
    value: "https://careers.dukehealth.org/benefits",
  },
  {
    label: "All open jobs",
    value: "https://careers.dukehealth.org/search-jobs",
  },
];

export const ctaLocaleOptions = [
  { label: "English (US)", value: "en-US" },
  { label: "Spanish (US)", value: "es-US" },
];

export const ctaPersonaOptions = [
  { label: "Candidate", value: "candidate" },
  { label: "Nursing talent", value: "nursing" },
  { label: "Clinical talent", value: "clinical" },
];

export const ctaJobOptions = [
  { label: "Registered Nurse, PICU", value: "https://careers.dukehealth.org/job/durham/registered-nurse-picu/38342/64290942096" },
  { label: "Nurse Practitioner", value: "https://careers.dukehealth.org/job/durham/nurse-practitioner/38342/64290942112" },
  { label: "Medical Assistant", value: "https://careers.dukehealth.org/job/durham/medical-assistant/38342/64290942128" },
];

export const ctaEventOptions = [
  "Duke Health Nursing Hiring Event",
  "Clinical Careers Open House",
  "Virtual Nurse Recruitment Webinar",
  "Healthcare Career Fair",
  "Patient Care Networking Event",
].map((eventName) => ({
  label: eventName,
  value: `https://careers.dukehealth.org/events/${eventName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
}));

export const resolveCtaDestinationMatch = (destination: string) => {
  const fallbackPage = cmsDestinationPages[1];
  const page =
    cmsDestinationPages.find((item) => item.value === destination) || fallbackPage;
  return page;
};

type AmplifyBriefTheme =
  | "nursing"
  | "engineering"
  | "sales"
  | "erg"
  | "benefits"
  | "milestone"
  | "event"
  | "hiring"
  | "general";

const includesAny = (text: string, terms: string[]) => terms.some((term) => text.includes(term));

const detectAmplifyBriefTheme = (brief: string): AmplifyBriefTheme => {
  const text = brief.toLowerCase();
  if (includesAny(text, ["nurse", "nursing", "rn", "picu", "bedside", "clinical care"])) return "nursing";
  if (includesAny(text, ["engineer", "engineering", "software", "developer", "atlanta eng", "clinical systems"])) {
    return "engineering";
  }
  if (includesAny(text, ["sales fair", "sales hiring", "sales team", "quota", "revenue"])) return "sales";
  if (includesAny(text, ["erg", "earth day", "sustainability", "culture celebration", "dei", "pride"])) return "erg";
  if (includesAny(text, ["benefit", "total rewards", "wellbeing", "wellness", "perks"])) return "benefits";
  if (includesAny(text, ["milestone", "tenure", "onboarding", "anniversary", "new hire", "5 year", "five year"])) {
    return "milestone";
  }
  if (includesAny(text, ["event", "fair", "webinar", "open house", "rsvp", "networking"])) return "event";
  if (includesAny(text, ["hiring", "job", "role", "openings", "recruit"])) return "hiring";
  return "general";
};

const extractRoleFromBrief = (brief: string) => {
  const structured = brief.match(/Target role or roles:\s*([^.]*)\./i);
  if (structured?.[1]?.trim()) return structured[1].trim();
  const roleMatch = brief.match(/(?:for|hiring|openings? for|share)\s+([^,.]+?)(?:\s+in\s+|\.|,|$)/i);
  return roleMatch?.[1]?.trim() || "open roles";
};

const extractLocationFromBrief = (brief: string) => {
  const structured = brief.match(/Location or work model:\s*([^.]*)\./i);
  if (structured?.[1]?.trim()) return structured[1].trim();
  const locationMatch = brief.match(/\bin\s+([A-Z][A-Za-z\s]+,\s*[A-Z]{2}|[A-Z][A-Za-z\s]+)(?:\.|,|$)/);
  return locationMatch?.[1]?.trim() || "";
};

const makeSharePackTitle = (brief: string, theme: AmplifyBriefTheme, role: string) => {
  const location = extractLocationFromBrief(brief);
  if (theme === "nursing") return location ? `Nursing share pack · ${location}` : "Nursing share pack";
  if (theme === "engineering") return location ? `Engineering amplify · ${location}` : "Engineering hiring amplify";
  if (theme === "sales") return "Sales hiring amplify";
  if (theme === "erg") return "Culture & ERG amplify";
  if (theme === "benefits") return "Benefits showcase amplify";
  if (theme === "milestone") return "Milestone share pack";
  if (theme === "event") return "Event amplify pack";
  if (theme === "hiring") return `${role} share pack`;
  const firstLine = brief.trim().split(/\n/)[0]?.trim();
  if (firstLine && firstLine.length <= 64) return firstLine.replace(/\.$/, "");
  return "Employee share pack";
};

const buildAiCaptions = (brief: string, theme: AmplifyBriefTheme, role: string): ShareCaption[] => {
  const location = extractLocationFromBrief(brief);
  const place = location ? ` in ${location}` : "";
  const linesByTheme: Record<AmplifyBriefTheme, string[]> = {
    nursing: [
      `From first shift to charge nurse, growth stories like this are why I love ${BRAND}.`,
      `Thinking about a nursing career? Here's one teammate's journey at ${BRAND}.`,
      `Compassionate care + real career pathways. Proud to share this RN story.`,
      `If you know a nurse looking for the next step, send them this.`,
      `Our nurses grow here. This journey story says it better than I can.`,
      `Bedside excellence and leadership — that's the RN path at ${BRAND}.`,
    ],
    engineering: [
      `We're hiring engineers${place} who want to build tools that help caregivers. See open roles at ${BRAND}.`,
      `Proud of our engineering team and growing. Interested in impactful work?`,
      `Clinical systems + modern software. That's the mix our eng org is hiring for.`,
      `Know a great engineer? Share this ${BRAND} hiring pack.`,
      `Build products that support patients and care teams. Engineering roles are open.`,
      `From EHR integrations to patient apps, our eng team is expanding.`,
    ],
    sales: [
      `Come meet our recruiting team at the next ${BRAND} hiring fair.`,
      `Looking for your next sales role in healthcare? Start here.`,
      `Great culture, clear goals, and real impact. See sales openings at ${BRAND}.`,
      `Know a strong seller who cares about mission? Share this pack.`,
      `Our sales team helps connect talent to care. We're hiring — pass it on.`,
      `Career growth + purpose. Explore sales roles at ${BRAND}.`,
    ],
    erg: [
      `Proud of how our teams showed up for culture and community this week.`,
      `Earth Day (and every day) — sustainability is part of how we work at ${BRAND}.`,
      `ERG moments like these are why our culture feels real. Share if you're proud.`,
      `Celebrate with us — and invite someone who wants to belong here too.`,
      `Culture isn't a poster. It's moments like this across ${BRAND}.`,
      `Allies and ERG members: help amplify what makes us us.`,
    ],
    benefits: [
      `Total rewards that support real life — benefits worth sharing at ${BRAND}.`,
      `Curious what working here actually feels like day to day? Start with benefits.`,
      `From wellbeing to growth, our rewards story is ready to share.`,
      `Know someone weighing an offer? Send them our benefits pack.`,
      `Great care for patients starts with care for our people.`,
      `See how ${BRAND} invests in the whole employee — not just the shift.`,
    ],
    milestone: [
      `Celebrating another milestone on the team — grateful to grow at ${BRAND}.`,
      `New hires and mentors: stories like this are why onboarding matters.`,
      `Tenure moments remind me why I stay. Proud to share this one.`,
      `From day one to year five — growth is real here.`,
      `If you're mentoring someone new, this pack is an easy share.`,
      `Milestones like these deserve a wider audience. Pass it on.`,
    ],
    event: [
      `Join us at the next ${BRAND} careers event — details inside.`,
      `Hiring event alert: bring a friend who's curious about healthcare careers.`,
      `Open house energy, real conversations, open roles. See you there.`,
      `RSVP and share — seats go fast for our recruiting events.`,
      `Prefer to meet the team live? This event pack is for you.`,
      `Career fair season is here. Help us fill the room with great people.`,
    ],
    hiring: [
      `Proud to work at ${BRAND} and we're hiring ${role}${place}. Here's how to apply.`,
      `Know someone looking for meaningful work? Share these ${role} openings.`,
      `Great roles, real impact. See what's open for ${role} at ${BRAND}.`,
      `Join a team that puts people first. Explore ${role} careers at ${BRAND}.`,
      `I'm sharing this because I'd want someone to share it with me.`,
      `From clinic to community, build your career at ${BRAND}.`,
    ],
    general: [
      `Join a team that puts people first. Explore careers at ${BRAND}.`,
      `Proud to work at ${BRAND} and we're hiring. Here's how to apply.`,
      `Know someone looking for meaningful work in healthcare? Share this.`,
      `Great roles, real impact. See what's open at ${BRAND}.`,
      `Our culture shows up in every shift. Curious? Start here.`,
      `I'm sharing this because I'd want someone to share it with me.`,
    ],
  };

  return linesByTheme[theme].map((text, index) => ({
    id: `cap-ai-${theme}-${index + 1}`,
    text,
  }));
};

/** Mock AI: map an Amplify brief to template, captions, CTA, audience, and asset. */
export const createSharePackDraftFromBrief = (
  brief: string,
  preferredTemplateId?: string | null,
): AmplifySharePackDraft => {
  const trimmed = brief.trim();
  const theme = detectAmplifyBriefTheme(trimmed);
  const role = extractRoleFromBrief(trimmed);
  const text = trimmed.toLowerCase();

  const templateByTheme: Record<AmplifyBriefTheme, string> = {
    nursing: "tmpl-job-sourcing",
    engineering: "tmpl-job-sourcing",
    sales: "tmpl-job-sourcing",
    hiring: "tmpl-job-sourcing",
    erg: "tmpl-erg",
    benefits: "tmpl-benefits",
    milestone: "tmpl-milestone",
    event: "tmpl-erg",
    general: preferredTemplateId || "tmpl-job-sourcing",
  };

  const templateId =
    preferredTemplateId && dispatchTemplates.some((item) => item.id === preferredTemplateId)
      ? preferredTemplateId
      : templateByTheme[theme];

  const assetByTheme: Record<AmplifyBriefTheme, string> = {
    nursing: "asset-rn-journey",
    engineering: "asset-atl-engineering",
    sales: "asset-sales-fair",
    hiring: includesAny(text, ["nurse", "rn"]) ? "asset-rn-journey" : "asset-atl-engineering",
    erg: "asset-earth-day",
    benefits: "asset-earth-day",
    milestone: "asset-marcus",
    event: "asset-sales-fair",
    general: packAssetOptions[0].id,
  };

  const audienceByTheme: Record<AmplifyBriefTheme, string[]> = {
    nursing: ["nursing"],
    engineering: ["engineering-atl"],
    sales: ["sales"],
    hiring: includesAny(text, ["hiring manager", "recruiter"]) ? ["hiring-managers"] : ["all"],
    erg: ["erg"],
    benefits: ["all"],
    milestone: ["nursing"],
    event: includesAny(text, ["nurse", "nursing"]) ? ["nursing"] : ["all"],
    general: ["all"],
  };

  let ctaDestinationType: AmplifySharePackDraft["ctaDestinationType"] = "page";
  let ctaPageValue = cmsDestinationPages[1].value;
  let ctaJobValue = ctaJobOptions[0].value;
  let ctaEventValue = ctaEventOptions[0].value;
  let ctaPersona = ctaPersonaOptions[0].value;

  if (theme === "nursing" || includesAny(text, ["nurse", "rn", "picu"])) {
    ctaDestinationType = includesAny(text, ["job", "picu", "opening", "role"]) ? "job" : "page";
    ctaPageValue = cmsDestinationPages.find((page) => page.label === "Nursing careers")?.value || ctaPageValue;
    ctaJobValue = ctaJobOptions[0].value;
    ctaPersona = "nursing";
  } else if (theme === "engineering") {
    ctaDestinationType = "page";
    ctaPageValue =
      cmsDestinationPages.find((page) => page.label === "Engineering careers")?.value || ctaPageValue;
  } else if (theme === "event" || includesAny(text, ["hiring event", "open house", "webinar", "fair"])) {
    ctaDestinationType = "event";
    ctaEventValue =
      ctaEventOptions.find((option) => option.label.toLowerCase().includes("hiring event"))?.value ||
      ctaEventOptions[0].value;
  } else if (theme === "benefits") {
    ctaPageValue =
      cmsDestinationPages.find((page) => page.label === "Benefits and culture")?.value || ctaPageValue;
  } else if (theme === "sales" || theme === "hiring") {
    ctaPageValue = cmsDestinationPages.find((page) => page.label === "All open jobs")?.value || ctaPageValue;
  }

  const urlInBrief = trimmed.match(/https?:\/\/[^\s)]+/i)?.[0];
  if (urlInBrief) {
    const pageMatch = cmsDestinationPages.find((page) => page.value === urlInBrief);
    const jobMatch = ctaJobOptions.find((job) => job.value === urlInBrief);
    const eventMatch = ctaEventOptions.find((event) => event.value === urlInBrief);
    if (pageMatch) {
      ctaDestinationType = "page";
      ctaPageValue = pageMatch.value;
    } else if (jobMatch) {
      ctaDestinationType = "job";
      ctaJobValue = jobMatch.value;
    } else if (eventMatch) {
      ctaDestinationType = "event";
      ctaEventValue = eventMatch.value;
    }
  }

  const captions = buildAiCaptions(trimmed, theme, role);
  const selectedCaptionIds = captions.slice(0, 5).map((caption) => caption.id);
  const template = dispatchTemplates.find((item) => item.id === templateId) || dispatchTemplates[0];

  return {
    templateId: template.id,
    title: makeSharePackTitle(trimmed, theme, role),
    note: trimmed || template.description,
    audiences: audienceByTheme[theme],
    assetId: assetByTheme[theme],
    ctaDestinationType,
    ctaPageValue,
    ctaJobValue,
    ctaEventValue,
    ctaPersona,
    captions,
    selectedCaptionIds,
  };
};

export const audienceSegmentOptions = [
  { value: "all", label: "All employees", count: 1240 },
  { value: "nursing", label: "Nursing Mentors", count: 216 },
  { value: "engineering-atl", label: "Atlanta Engineering Senior+", count: 84 },
  { value: "sales", label: "Sales Management", count: 96 },
  { value: "hiring-managers", label: "Hiring managers", count: 120 },
  { value: "erg", label: "Sustainability ERG", count: 64 },
];

export const audienceEmployeeOptions = [
  { name: "Marcus Chen", email: "marcus.chen@dukehealth.org", department: "Nursing" },
  { name: "Aisha Rahman", email: "aisha.rahman@dukehealth.org", department: "Nursing" },
  { name: "Jordan Blake", email: "jordan.blake@dukehealth.org", department: "Nursing" },
  { name: "Priya Patel", email: "priya.patel@dukehealth.org", department: "Clinical Support" },
  { name: "Sam Okonkwo", email: "sam.okonkwo@dukehealth.org", department: "Clinical Support" },
  { name: "Elena Vasquez", email: "elena.vasquez@dukehealth.org", department: "Radiology" },
  { name: "Chris Nguyen", email: "chris.nguyen@dukehealth.org", department: "Radiology" },
  { name: "Taylor Brooks", email: "taylor.brooks@dukehealth.org", department: "Pharmacy" },
  { name: "Morgan Ellis", email: "morgan.ellis@dukehealth.org", department: "Pharmacy" },
  { name: "Riley Santos", email: "riley.santos@dukehealth.org", department: "IT & Digital" },
  { name: "Casey Kim", email: "casey.kim@dukehealth.org", department: "IT & Digital" },
  { name: "Harper Diaz", email: "harper.diaz@dukehealth.org", department: "HR & Talent" },
];

export const channelOptions: { value: AmplifyChannel; label: string }[] = [
  { value: "email", label: "Email" },
  { value: "slack", label: "Slack" },
  { value: "teams", label: "MS Teams" },
];

export const impactKpis: ImpactKpi[] = [
  { id: "shares", label: "Shares", value: "1,248", delta: "+12% WoW" },
  { id: "clicks", label: "Career site clicks", value: "6,420", delta: "+8% WoW" },
  { id: "apps", label: "Apps attributed", value: "94", delta: "+6% WoW" },
  { id: "emv", label: "EMV", value: "$48k", delta: "vs $62k paid" },
];

export const shareVelocity: ShareVelocityPoint[] = [
  {
    label: "Mon",
    value: 42,
    packs: [
      { packId: "pack-earth-day", name: "Earth Day culture", shares: 28 },
      { packId: "pack-hiring-fair-sales", name: "Hiring fair — Sales", shares: 14 },
    ],
  },
  {
    label: "Tue",
    value: 58,
    packs: [
      { packId: "pack-earth-day", name: "Earth Day culture", shares: 36 },
      { packId: "pack-hiring-fair-sales", name: "Hiring fair — Sales", shares: 22 },
    ],
  },
  {
    label: "Wed",
    value: 71,
    packs: [
      { packId: "pack-earth-day", name: "Earth Day culture", shares: 44 },
      { packId: "pack-hiring-fair-sales", name: "Hiring fair — Sales", shares: 18 },
      { packId: "pack-rn-journey", name: "RN journey story", shares: 9 },
    ],
  },
  {
    label: "Thu",
    value: 64,
    packs: [
      { packId: "pack-earth-day", name: "Earth Day culture", shares: 40 },
      { packId: "pack-hiring-fair-sales", name: "Hiring fair — Sales", shares: 24 },
    ],
  },
  {
    label: "Fri",
    value: 88,
    packs: [
      { packId: "pack-earth-day", name: "Earth Day culture", shares: 52 },
      { packId: "pack-hiring-fair-sales", name: "Hiring fair — Sales", shares: 26 },
      { packId: "pack-rn-journey", name: "RN journey story", shares: 10 },
    ],
  },
  {
    label: "Sat",
    value: 36,
    packs: [
      { packId: "pack-earth-day", name: "Earth Day culture", shares: 24 },
      { packId: "pack-hiring-fair-sales", name: "Hiring fair — Sales", shares: 12 },
    ],
  },
  {
    label: "Sun",
    value: 29,
    packs: [
      { packId: "pack-earth-day", name: "Earth Day culture", shares: 19 },
      { packId: "pack-hiring-fair-sales", name: "Hiring fair — Sales", shares: 10 },
    ],
  },
];

export const attributionRows: AttributionRow[] = [
  {
    id: "att-1",
    employee: "Aisha Rahman",
    pack: "Earth Day culture",
    channel: "slack",
    clicks: 48,
    applications: 2,
    lastShare: "Jul 21",
  },
  {
    id: "att-2",
    employee: "Marcus Chen",
    pack: "RN journey story",
    channel: "email",
    clicks: 36,
    applications: 3,
    lastShare: "Jul 20",
  },
  {
    id: "att-3",
    employee: "Priya Patel",
    pack: "Hiring fair — Sales",
    channel: "teams",
    clicks: 22,
    applications: 1,
    lastShare: "Jul 19",
  },
  {
    id: "att-4",
    employee: "Jordan Blake",
    pack: "Atlanta Engineering hiring",
    channel: "slack",
    clicks: 61,
    applications: 4,
    lastShare: "Jul 18",
  },
  {
    id: "att-5",
    employee: "Elena Vasquez",
    pack: "5 year story from campaign",
    channel: "email",
    clicks: 19,
    applications: 1,
    lastShare: "Jul 17",
  },
];

export const statusLabel: Record<SharePack["status"], string> = {
  draft: "Draft",
  needs_approval: "Needs approval",
  ready: "Ready",
  sent: "Sent",
  archived: "Archived",
};

export const channelLabel: Record<AmplifyChannel, string> = {
  email: "Email",
  slack: "Slack",
  teams: "MS Teams",
};
