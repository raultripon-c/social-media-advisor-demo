import atlEngineeringThumb from "../../../assets/campaign-studio/amplify/amp-pack-atl-engineering.jpg";
import earthDayThumb from "../../../assets/campaign-studio/amplify/amp-pack-earth-day.jpg";
import marcusThumb from "../../../assets/campaign-studio/amplify/amp-pack-marcus-5yr.jpg";
import rnJourneyThumb from "../../../assets/campaign-studio/amplify/amp-pack-rn-journey.jpg";
import salesFairThumb from "../../../assets/campaign-studio/amplify/amp-pack-sales-fair.jpg";
import {
  AmplifyChannel,
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
    id: "tmpl-hm-amplify",
    title: "Hiring manager amplify",
    description: "Give hiring managers a ready pack for their reqs.",
    audienceHint: "Hiring managers",
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

export const ctaDestinationOptions = [
  { value: "https://careers.dukehealth.org/search-jobs", label: "All open jobs" },
  { value: "https://careers.dukehealth.org/nursing", label: "Nursing department page" },
  { value: "https://careers.dukehealth.org/engineering", label: "Engineering department page" },
  { value: "https://careers.dukehealth.org/talent-community", label: "Talent community" },
  { value: "https://careers.dukehealth.org/req/RN-20418", label: "Job req RN-20418" },
];

export const audienceSegmentOptions = [
  { value: "all", label: "All employees", count: 1240 },
  { value: "nursing", label: "Nursing Mentors", count: 216 },
  { value: "engineering-atl", label: "Atlanta Engineering Senior+", count: 84 },
  { value: "sales", label: "Sales Management", count: 96 },
  { value: "hiring-managers", label: "Hiring managers", count: 120 },
  { value: "erg", label: "Sustainability ERG", count: 64 },
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
