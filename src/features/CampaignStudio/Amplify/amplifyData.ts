import atlEngineeringThumb from "../../../assets/campaign-studio/amplify/amp-pack-atl-engineering.jpg";
import earthDayThumb from "../../../assets/campaign-studio/amplify/amp-pack-earth-day.jpg";
import marcusThumb from "../../../assets/campaign-studio/amplify/amp-pack-marcus-5yr.jpg";
import rnJourneyThumb from "../../../assets/campaign-studio/amplify/amp-pack-rn-journey.jpg";
import salesFairThumb from "../../../assets/campaign-studio/amplify/amp-pack-sales-fair.jpg";
import aishaThumb from "../../../assets/campaign-studio/video-hub/vh-aisha-rahman.jpg";
import elenaThumb from "../../../assets/campaign-studio/video-hub/vh-elena-vasquez.jpg";
import jordanThumb from "../../../assets/campaign-studio/video-hub/vh-jordan-blake.jpg";
import marcusVhThumb from "../../../assets/campaign-studio/video-hub/vh-marcus-chen.jpg";
import priyaThumb from "../../../assets/campaign-studio/video-hub/vh-priya-patel.jpg";
import samThumb from "../../../assets/campaign-studio/video-hub/vh-sam-okonkwo.jpg";
import taylorThumb from "../../../assets/campaign-studio/video-hub/vh-taylor-brooks.jpg";
import {
  AmplifyChannel,
  AmplifySharePackDraft,
  AttributionRow,
  DispatchTemplate,
  ImpactKpi,
  ShareCaption,
  SharePack,
  ShareVelocityPoint,
  VideoSubmission,
  VideoSubmissionStatus,
} from "./amplifyTypes";

const BRAND = "Duke Health";

const captions = (lines: string[]): ShareCaption[] =>
  lines.map((text, index) => ({ id: `cap-${index + 1}`, text }));

const utm = (slug: string) =>
  `utm_source=employee_advocacy&utm_medium={channel}&utm_campaign=${slug}&utm_content={empId}`;

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
    createdByName: "Jordan Blake",
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
    metrics: { shares: 142, clicks: 680, applications: 18, emvUsd: 9600 },
    createdAt: "2026-07-20T09:30:00.000Z",
    createdByName: "Aisha Rahman",
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
    createdByName: "Harper Diaz",
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
    createdByName: "Chris Nguyen",
    sentAt: "2026-06-04T13:00:00.000Z",
  },
  {
    id: "pack-5yr-story",
    title: "5 year story from campaign",
    subtitle: "Marcus's milestone story packaged for employee shares",
    status: "draft",
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
    createdByName: "Marcus Chen",
  },
];

export const demoVideoSubmissionsByRequestId: Record<string, VideoSubmission[]> = {
  "video-req-demo-marketing": [
    {
      id: "vsub-marketing-1",
      name: "test",
      email: "testnew@example.com",
      jobTitle: "test",
      location: "",
      tags: ["test", "organise"],
      thumbnailUrl: taylorThumb,
      videoUrl: taylorThumb,
      durationLabel: "00:05 min",
      fileSizeLabel: "1.49 MB",
      status: "pending",
      uploadedAt: "2026-08-29T09:12:00.000Z",
    },
    {
      id: "vsub-marketing-2",
      name: "ram",
      email: "sairam.chitturi@phenom.com",
      jobTitle: "Product Manager",
      location: "Remote",
      tags: ["marketing"],
      thumbnailUrl: jordanThumb,
      videoUrl: jordanThumb,
      durationLabel: "00:12 min",
      fileSizeLabel: "2.84 MB",
      status: "pending",
      uploadedAt: "2026-08-29T11:40:00.000Z",
    },
    {
      id: "vsub-marketing-3",
      name: "Marcus Chen",
      email: "marcus.chen@dukehealth.org",
      jobTitle: "Marketing Coordinator",
      location: "Durham, NC",
      tags: ["Marketing", "Testimonials"],
      thumbnailUrl: marcusVhThumb,
      videoUrl: marcusVhThumb,
      durationLabel: "00:48 min",
      fileSizeLabel: "8.12 MB",
      status: "pending",
      uploadedAt: "2026-08-30T08:05:00.000Z",
    },
    {
      id: "vsub-marketing-4",
      name: "Aisha Rahman",
      email: "aisha.rahman@dukehealth.org",
      jobTitle: "Content Strategist",
      location: "Raleigh, NC",
      tags: ["Marketing"],
      thumbnailUrl: aishaThumb,
      videoUrl: aishaThumb,
      durationLabel: "00:36 min",
      fileSizeLabel: "5.67 MB",
      status: "pending",
      uploadedAt: "2026-08-30T14:22:00.000Z",
    },
    {
      id: "vsub-marketing-5",
      name: "Jordan Blake",
      email: "jordan.blake@dukehealth.org",
      jobTitle: "Employer Brand Lead",
      location: "Durham, NC",
      tags: ["Testimonials"],
      thumbnailUrl: jordanThumb,
      videoUrl: jordanThumb,
      durationLabel: "00:44 min",
      fileSizeLabel: "6.21 MB",
      status: "pending",
      uploadedAt: "2026-08-31T10:18:00.000Z",
    },
    {
      id: "vsub-marketing-6",
      name: "Priya Patel",
      email: "priya.patel@dukehealth.org",
      jobTitle: "Clinical Support Specialist",
      location: "Chapel Hill, NC",
      tags: ["Marketing", "Approved"],
      thumbnailUrl: priyaThumb,
      videoUrl: priyaThumb,
      durationLabel: "00:56 min",
      fileSizeLabel: "7.45 MB",
      status: "approved",
      uploadedAt: "2026-08-27T16:10:00.000Z",
    },
    {
      id: "vsub-marketing-7",
      name: "Elena Vasquez",
      email: "elena.vasquez@dukehealth.org",
      jobTitle: "Radiology Technologist",
      location: "Durham, NC",
      tags: ["Testimonials"],
      thumbnailUrl: elenaThumb,
      videoUrl: elenaThumb,
      durationLabel: "00:39 min",
      fileSizeLabel: "4.88 MB",
      status: "approved",
      uploadedAt: "2026-08-26T13:55:00.000Z",
    },
    {
      id: "vsub-marketing-8",
      name: "Sam Okonkwo",
      email: "sam.okonkwo@dukehealth.org",
      jobTitle: "Clinical Support",
      location: "Durham, NC",
      tags: [],
      thumbnailUrl: samThumb,
      videoUrl: samThumb,
      durationLabel: "00:22 min",
      fileSizeLabel: "3.02 MB",
      status: "rejected",
      uploadedAt: "2026-08-25T09:30:00.000Z",
    },
  ],
};

export const demoVideoRequests: SharePack[] = [
  {
    id: "video-req-demo-marketing",
    title: "Marketing Testimonials",
    subtitle: "1 minute · 16:9 (Landscape)",
    status: "sent",
    source: "Manual",
    sourceLabel: "Video request",
    audienceLabel: "Career Site",
    audienceCount: 48,
    channels: ["email"],
    thumbnailUrl: marcusThumb,
    mediaType: "video",
    ctaLabel: "Nursing careers",
    ctaDestination: "https://careers.dukehealth.org/nursing",
    utmPreview: utm("video-request-marketing-testimonials"),
    captions: [
      {
        id: "video-req-demo-marketing-prompt",
        text: "Tell us about a project you are proud of and how your team made an impact.",
      },
    ],
    createdAt: "2026-08-28T10:15:00.000Z",
    createdByName: "Jordan Blake",
    sentAt: "2026-08-28T10:16:00.000Z",
    videoRequest: {
      locale: "en-us",
      persona: "external",
      landingPageId: "nursing-careers",
      landingPageLabel: "Nursing careers",
      landingPageUrl: "https://careers.dukehealth.org/nursing",
      introTitle: "Welcome to your Video Capture request!",
      introDescription:
        "We are looking for an authentic video. Remember to smile and have fun! Follow the instructions below to complete your video.",
      videoPrompt: "Tell us about a project you are proud of and how your team made an impact.",
      maximumVideoLengthSeconds: 60,
      videoOrientation: "16:9",
      tags: ["Marketing", "Testimonials"],
      applyDefaultBranding: true,
    },
  },
  {
    id: "video-req-demo-nursing",
    title: "Nursing Career Stories",
    subtitle: "30 seconds · 9:16 (Portrait)",
    status: "draft",
    source: "Manual",
    sourceLabel: "Video request",
    audienceLabel: "Employee Experience",
    audienceCount: 0,
    channels: ["email"],
    thumbnailUrl: rnJourneyThumb,
    mediaType: "video",
    ctaLabel: "Explore nursing roles",
    ctaDestination: "https://careers.dukehealth.org/nursing",
    utmPreview: utm("video-request-nursing-stories"),
    captions: [
      {
        id: "video-req-demo-nursing-prompt",
        text: "Share what made you choose nursing and one moment that keeps you motivated.",
      },
    ],
    createdAt: "2026-09-02T14:40:00.000Z",
    createdByName: "Aisha Rahman",
    videoRequest: {
      locale: "en-us",
      persona: "internal",
      landingPageId: "nursing-roles",
      landingPageLabel: "Explore nursing roles",
      landingPageUrl: "https://careers.dukehealth.org/nursing",
      introTitle: "Welcome to your Video Capture request!",
      introDescription:
        "We are looking for an authentic video. Remember to smile and have fun! Follow the instructions below to complete your video.",
      videoPrompt: "Share what made you choose nursing and one moment that keeps you motivated.",
      maximumVideoLengthSeconds: 30,
      videoOrientation: "9:16",
      tags: ["Nursing", "Career Growth"],
      applyDefaultBranding: false,
    },
  },
];

export const dispatchTemplates: DispatchTemplate[] = [
  {
    id: "tmpl-job-sourcing",
    title: "Share Open Roles",
    description: "Ask employees to share open roles with their network.",
    audienceHint: "Hiring managers & recruiters",
    icon: "bolt",
    prompt:
      "Generate a share pack for hiring managers/recruiters promoting our [role name(s)] openings. Highlight [team culture, growth, tech stack]. Link: [job posting URL]. Tone: confident and genuine, first-person.",
  },
  {
    id: "tmpl-erg",
    title: "Share Culture Events",
    description: "Share ERG moments and culture celebrations with employees.",
    audienceHint: "ERG members & allies",
    icon: "sparkle",
    prompt:
      "Generate a share pack for ERG members/allies about [event name]. Highlight why it matters and who's involved. Link: [event/RSVP URL]. Tone: warm and community-driven.",
  },
  {
    id: "tmpl-benefits",
    title: "Showcase Benefits",
    description: "Highlight benefits and total rewards stories.",
    audienceHint: "All employees",
    icon: "award",
    prompt:
      "Generate a share pack for all employees about our benefits (e.g. PTO, learning stipend, parental leave). Link: [benefits page URL]. Tone: relatable, like a proud employee — not an ad.",
  },
  {
    id: "tmpl-milestone",
    title: "Share Team Milestones",
    description: "Share onboarding and tenure milestones.",
    audienceHint: "New hires & mentors",
    icon: "user",
    prompt:
      "Generate a share pack for a new hire's [milestone, e.g. '90 days']. Highlight the onboarding experience and team culture. Link: [careers/team page URL]. Tone: personal, first-person storytelling.",
  },
];

export const dispatchCaptionPool = captions([
  `Proud to work at ${BRAND} — and we're hiring.\n\nIf you know someone who'd thrive in healthcare, this is worth sharing.\n\nLink in the pack below.\n\n#DukeHealth #HealthcareCareers #Hiring #EmployeeAdvocacy`,
  `Real impact. Real teammates. Real growth.\n\nThat's why I share openings at ${BRAND} with my network.\n\nKnow someone looking? Pass this along.\n\n#DukeHealth #Careers #HealthcareJobs #WorkWithPurpose`,
  `Not every job post gets a personal recommendation — this one does.\n\n${BRAND} is growing, and employee referrals matter here.\n\nShare if someone in your network is exploring.\n\n#DukeHealth #Referrals #Healthcare #NowHiring`,
  `Culture isn't a slide deck. It's how people show up every day.\n\nGrateful to share what working at ${BRAND} actually feels like.\n\n#DukeHealth #CompanyCulture #Healthcare #TeamDuke`,
  `Great care starts with great people — and we're looking for more of both.\n\nExplore open roles at ${BRAND} and share with someone who'd be a fit.\n\n#DukeHealth #HealthcareHeroes #Careers #JoinOurTeam`,
  `I'd want someone to send me this if roles like these opened up.\n\nSharing ${BRAND} careers with my LinkedIn network today.\n\n#DukeHealth #OpenToWork #HealthcareCareers #EmployeeShare`,
  `Mission-driven work, supportive teams, room to grow.\n\nIf healthcare is calling for someone you know, start here.\n\n#DukeHealth #PurposeDriven #HealthcareJobs #CareerGrowth`,
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

export const ctaBlogOptions = [
  {
    label: "Life at Duke Health",
    value: "https://careers.dukehealth.org/blog/life-at-duke-health",
  },
  {
    label: "Nursing career stories",
    value: "https://careers.dukehealth.org/blog/nursing-career-stories",
  },
  {
    label: "Why I joined Duke Health",
    value: "https://careers.dukehealth.org/blog/why-i-joined-duke-health",
  },
  {
    label: "Employee wellbeing spotlight",
    value: "https://careers.dukehealth.org/blog/employee-wellbeing-spotlight",
  },
];

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
  | "testimonial"
  | "general";

const includesAny = (text: string, terms: string[]) => terms.some((term) => text.includes(term));

const detectAmplifyBriefTheme = (brief: string): AmplifyBriefTheme => {
  const text = brief.toLowerCase();
  if (includesAny(text, ["testimonial", "video request", "record a video", "employee video", "storyteller"])) {
    return "testimonial";
  }
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
  if (theme === "engineering") {
    return location ? `Engineering share pack · ${location}` : "Engineering hiring share pack";
  }
  if (theme === "sales") return "Sales hiring share pack";
  if (theme === "erg") return "Culture & ERG share pack";
  if (theme === "benefits") return "Benefits showcase share pack";
  if (theme === "milestone") return "Milestone share pack";
  if (theme === "event") return "Event share pack";
  if (theme === "testimonial") return "Testimonial & video request";
  if (theme === "hiring") return `${role} share pack`;
  const firstLine = brief.trim().split(/\n/)[0]?.trim();
  if (firstLine && firstLine.length <= 64) return firstLine.replace(/\.$/, "");
  return "Employee share pack";
};

const formatSocialCaption = (...parts: string[]) =>
  parts
    .map((part) => part.trim())
    .filter(Boolean)
    .join("\n\n");

/** Compact caption list display: one paragraph of body copy, then hashtags. */
export const formatCaptionForPicker = (text: string): string => {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;

  const segments = trimmed.split(/\n\n+/);
  if (segments.length <= 1) return trimmed;

  const lastSegment = segments[segments.length - 1].trim();
  const hasHashtagTail = /#\w/.test(lastSegment);

  if (!hasHashtagTail) {
    return segments.join(" ").replace(/\s+/g, " ").trim();
  }

  const body = segments
    .slice(0, -1)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  return body ? `${body}\n\n${lastSegment}` : lastSegment;
};

const hashtagSets: Record<AmplifyBriefTheme, string> = {
  nursing: "#DukeHealth #NursingCareers #RNJobs #HealthcareHeroes #NursingLife",
  engineering: "#DukeHealth #TechCareers #HealthcareIT #EngineeringJobs #HealthTech",
  sales: "#DukeHealth #SalesCareers #HealthcareSales #Hiring #CareerOpportunity",
  erg: "#DukeHealth #WorkCulture #EmployeeResourceGroup #BelongingAtWork #Healthcare",
  benefits: "#DukeHealth #EmployeeBenefits #WorkLifeBalance #HealthcareCareers #GreatPlaceToWork",
  milestone: "#DukeHealth #EmployeeStory #CareerGrowth #Healthcare #TeamCelebration",
  event: "#DukeHealth #HiringEvent #CareerFair #HealthcareJobs #Networking",
  testimonial: "#DukeHealth #EmployeeVoice #HealthcareCareers #WorkCulture #ShareYourStory",
  hiring: "#DukeHealth #NowHiring #HealthcareJobs #Careers #JoinOurTeam",
  general: "#DukeHealth #HealthcareCareers #Hiring #EmployeeAdvocacy #WorkWithPurpose",
};

const buildAiCaptions = (brief: string, theme: AmplifyBriefTheme, role: string): ShareCaption[] => {
  const location = extractLocationFromBrief(brief);
  const place = location ? ` in ${location}` : "";
  const tags = hashtagSets[theme];
  const linesByTheme: Record<AmplifyBriefTheme, string[]> = {
    nursing: [
      formatSocialCaption(
        "Proud to work somewhere nurses actually grow into leaders.",
        "From first shift to charge nurse — stories like this are why I stay at Duke Health.",
        "Know an RN looking for their next chapter? Worth sharing with your network.",
        tags,
      ),
      formatSocialCaption(
        "Bedside care + real career pathways. That's the nursing story at Duke Health.",
        "If you know a nurse who's ready for more than just another job posting, send this their way.",
        tags,
      ),
      formatSocialCaption(
        "Compassionate teams. Strong mentors. Room to lead.",
        "Our nurses don't just show up — they build careers here. Sharing a pack for anyone exploring nursing roles.",
        tags,
      ),
      formatSocialCaption(
        "The best referrals come from people who've lived the culture.",
        "I'm sharing Duke Health nursing openings because I'd want someone to share them with me.",
        tags,
      ),
      formatSocialCaption(
        "Healthcare needs great nurses. Duke Health is hiring.",
        "Short version: meaningful work, supportive teams, and paths into leadership.",
        "Pass this to someone in your network who's exploring RN roles.",
        tags,
      ),
      formatSocialCaption(
        "Not every hospital invests in nurse development like this.",
        "Proud to amplify nursing careers at Duke Health — link and captions in the pack.",
        tags,
      ),
      formatSocialCaption(
        "Thinking about nursing at Duke Health?",
        "Here's an easy share pack if you want to help someone in your network take the next step.",
        tags,
      ),
      formatSocialCaption(
        "Clinical excellence starts with the people behind the scrubs.",
        "Sharing nursing opportunities at Duke Health — tag someone who should see this.",
        tags,
      ),
    ],
    engineering: [
      formatSocialCaption(
        `We're hiring engineers${place} who want their code to matter.`,
        "At Duke Health, engineering work supports caregivers and patients — not just dashboards.",
        "Know a builder who'd thrive here? Share this pack.",
        tags,
      ),
      formatSocialCaption(
        "Health tech with a human purpose.",
        "Our engineering team is growing — from clinical systems to patient-facing tools.",
        "Worth a share if someone in your network is job searching.",
        tags,
      ),
      formatSocialCaption(
        "Great engineers want impact, not just uptime.",
        "Proud to share Duke Health engineering openings with my LinkedIn network.",
        tags,
      ),
      formatSocialCaption(
        "Modern stack. Mission-driven product. Real users on the front lines of care.",
        "Duke Health is hiring engineers — help us reach the right people.",
        tags,
      ),
      formatSocialCaption(
        "If you love solving hard problems that actually help people, this one's for you.",
        `Sharing ${role} engineering roles${place} at Duke Health.`,
        tags,
      ),
      formatSocialCaption(
        "Referrals beat job boards every time.",
        "Passing along Duke Health engineering careers to anyone exploring their next move.",
        tags,
      ),
      formatSocialCaption(
        "Building tools clinicians rely on is a different kind of product work.",
        "Open engineering roles at Duke Health — share with your network.",
        tags,
      ),
      formatSocialCaption(
        "From integrations to patient experience — our eng org is expanding.",
        "Know someone who'd be a great fit? This pack makes it easy to share.",
        tags,
      ),
    ],
    sales: [
      formatSocialCaption(
        "Mission-led sales is a different conversation — and we're hiring.",
        "Duke Health sales roles connect talent to care teams that need great people.",
        "Share if you know a strong seller exploring healthcare.",
        tags,
      ),
      formatSocialCaption(
        "Come meet the team at our next Duke Health hiring event.",
        "Real conversations, open roles, no cold-pitch energy.",
        "RSVP and share with someone who'd enjoy the room.",
        tags,
      ),
      formatSocialCaption(
        "Clear goals. Supportive leadership. Work that actually matters.",
        "Sharing sales openings at Duke Health — link in the pack below.",
        tags,
      ),
      formatSocialCaption(
        "The best sales hires often come from employee networks.",
        "If someone in your circle is looking, this is an easy share.",
        tags,
      ),
      formatSocialCaption(
        "Healthcare sales with purpose > generic quota chasing.",
        "Proud to amplify Duke Health sales careers today.",
        tags,
      ),
      formatSocialCaption(
        "Hiring fair season is here.",
        "Help us fill the room with great people — share this event pack.",
        tags,
      ),
      formatSocialCaption(
        "Growing team, strong culture, roles worth talking about.",
        "Duke Health sales is hiring — pass it on.",
        tags,
      ),
      formatSocialCaption(
        "Know a seller who cares about impact?",
        "Point them to Duke Health — captions and assets ready to post.",
        tags,
      ),
    ],
    erg: [
      formatSocialCaption(
        "Culture shows up in moments like this — not just on posters.",
        "Proud of how our ERG community showed up this week at Duke Health.",
        "Share if you're proud of where you work too.",
        tags,
      ),
      formatSocialCaption(
        "Belonging is built in public.",
        "Celebrating our ERG and the people who make Duke Health feel like a community.",
        tags,
      ),
      formatSocialCaption(
        "Sustainability, inclusion, allyship — this is part of how we work.",
        "Help us share what makes Duke Health culture real.",
        tags,
      ),
      formatSocialCaption(
        "Allies and ERG members: your voice helps candidates see the real us.",
        "Easy share pack — pick a caption and post.",
        tags,
      ),
      formatSocialCaption(
        "Earth Day every day? That's the energy on our team.",
        "Sharing a culture moment from Duke Health — tag a teammate.",
        tags,
      ),
      formatSocialCaption(
        "Moments like these are why referrals work.",
        "People want to join teams that celebrate together.",
        tags,
      ),
      formatSocialCaption(
        "Proud to work somewhere that invests in employee communities.",
        "Share this Duke Health culture pack with your network.",
        tags,
      ),
      formatSocialCaption(
        "When culture is authentic, employees become the best recruiters.",
        "Pass along this ERG story from Duke Health.",
        tags,
      ),
    ],
    benefits: [
      formatSocialCaption(
        "Benefits aren't a footnote — they're part of why people stay.",
        "Sharing what total rewards actually look like at Duke Health.",
        "Know someone comparing offers? This helps.",
        tags,
      ),
      formatSocialCaption(
        "Wellbeing, growth, flexibility — the full picture matters.",
        "Proud to share Duke Health's benefits story with my network.",
        tags,
      ),
      formatSocialCaption(
        "Candidates ask what day-to-day life is really like.",
        "Start with how Duke Health invests in employees — not just the shift.",
        tags,
      ),
      formatSocialCaption(
        "Great care for patients starts with care for our people.",
        "Easy share pack on benefits and culture at Duke Health.",
        tags,
      ),
      formatSocialCaption(
        "The perks slide never tells the whole story.",
        "Here's a more honest share about working at Duke Health.",
        tags,
      ),
      formatSocialCaption(
        "If someone you know is weighing a move into healthcare, send this.",
        "Benefits + culture pack from Duke Health.",
        tags,
      ),
      formatSocialCaption(
        "Work-life balance isn't a buzzword on our team.",
        "Sharing why Duke Health is worth a closer look.",
        tags,
      ),
      formatSocialCaption(
        "Referrals land better when you can speak to more than the job title.",
        "Benefits and culture captions ready to post.",
        tags,
      ),
    ],
    milestone: [
      formatSocialCaption(
        "Another milestone on the team — grateful to grow at Duke Health.",
        "From day one to year five, growth here is real.",
        "Share if you've had a similar journey.",
        tags,
      ),
      formatSocialCaption(
        "New hires deserve to see what the path can look like.",
        "Celebrating a teammate milestone and sharing our story.",
        tags,
      ),
      formatSocialCaption(
        "Tenure moments remind me why I stay.",
        "Proud to amplify Duke Health career stories today.",
        tags,
      ),
      formatSocialCaption(
        "Mentorship + opportunity = stories worth sharing.",
        "Pass this Duke Health pack to someone early in their career.",
        tags,
      ),
      formatSocialCaption(
        "This is what career growth looks like in healthcare.",
        "Sharing a milestone moment from Duke Health.",
        tags,
      ),
      formatSocialCaption(
        "Employee stories beat generic recruiting copy every time.",
        "Help us celebrate and share — captions in the pack.",
        tags,
      ),
      formatSocialCaption(
        "Onboarding matters. So does what happens after.",
        "Duke Health milestone story — worth a share.",
        tags,
      ),
      formatSocialCaption(
        "People join teams. They stay for moments like this.",
        "Tag someone who'd appreciate this career story.",
        tags,
      ),
    ],
    event: [
      formatSocialCaption(
        "Hiring event alert — Duke Health careers, live and in person.",
        "Bring a friend who's curious about healthcare roles.",
        "Details in the pack. Share to fill the room.",
        tags,
      ),
      formatSocialCaption(
        "Prefer meeting the team face-to-face?",
        "Our next Duke Health recruiting event is coming up — RSVP and share.",
        tags,
      ),
      formatSocialCaption(
        "Open roles + real conversations + no awkward sales pitch.",
        "Help us spread the word about this Duke Health event.",
        tags,
      ),
      formatSocialCaption(
        "Career fairs hit different when employees invite their network.",
        "Sharing our event pack — takes one minute to post.",
        tags,
      ),
      formatSocialCaption(
        "Seats go fast for these sessions.",
        "Pass this Duke Health hiring event to someone exploring options.",
        tags,
      ),
      formatSocialCaption(
        "Recruiting events work best when employees show up as advocates.",
        "Share this invite with your LinkedIn network.",
        tags,
      ),
      formatSocialCaption(
        "Meet recruiters, ask real questions, explore open roles.",
        "Duke Health event pack ready to share.",
        tags,
      ),
      formatSocialCaption(
        "Know someone job searching in healthcare?",
        "Point them to our upcoming Duke Health careers event.",
        tags,
      ),
    ],
    testimonial: [
      formatSocialCaption(
        "Got 60 seconds?",
        "Record a quick testimonial about life at Duke Health — your story helps candidates see the real us.",
        tags,
      ),
      formatSocialCaption(
        "Short video > long brochure.",
        "Share a day-in-the-life or culture clip when you can.",
        tags,
      ),
      formatSocialCaption(
        "Managers: invite a teammate to record this week.",
        "Employee voices are our best recruiting asset.",
        tags,
      ),
      formatSocialCaption(
        "Proud of your team? Capture it on camera.",
        "Duke Health is collecting talent stories — easy ask in the pack.",
        tags,
      ),
      formatSocialCaption(
        "Authentic beats polished every time.",
        "A quick testimonial from you goes further than you think.",
        tags,
      ),
      formatSocialCaption(
        "Help the next hire feel at home before day one.",
        "Record a short Duke Health story — link in the pack.",
        tags,
      ),
      formatSocialCaption(
        "Your perspective matters to candidates.",
        "Share a video testimonial about working at Duke Health.",
        tags,
      ),
      formatSocialCaption(
        "Employee advocacy isn't just sharing job links.",
        "Sometimes it's sharing why you stay.",
        tags,
      ),
    ],
    hiring: [
      formatSocialCaption(
        `Proud to work at Duke Health — and we're hiring ${role}${place}.`,
        "Know someone looking for meaningful work? This pack makes it easy to share.",
        tags,
      ),
      formatSocialCaption(
        `Open ${role} roles${place} worth talking about.`,
        "Employee referrals are how great teams get built. Pass this along.",
        tags,
      ),
      formatSocialCaption(
        "Great roles. Real impact. Strong teammates.",
        `Sharing Duke Health ${role} openings with my network today.`,
        tags,
      ),
      formatSocialCaption(
        "Not every opening gets a personal recommendation — this one does.",
        `Exploring ${role} careers at Duke Health? Start here.`,
        tags,
      ),
      formatSocialCaption(
        "Healthcare needs great people. We're hiring.",
        `Help us reach the right ${role} candidates — share the pack below.`,
        tags,
      ),
      formatSocialCaption(
        "I'd want someone to send me this if I were job searching.",
        `Duke Health ${role} roles${place} — captions ready to copy and post.`,
        tags,
      ),
      formatSocialCaption(
        "Join a team that puts people first.",
        `Sharing ${role} opportunities at Duke Health — link in the pack.`,
        tags,
      ),
      formatSocialCaption(
        "From clinic to community, careers here mean something.",
        "Tag someone who should see these openings.",
        tags,
      ),
    ],
    general: [
      formatSocialCaption(
        "Proud to work at Duke Health — and we're hiring.",
        "If you know someone who'd thrive in healthcare, this is worth sharing.",
        tags,
      ),
      formatSocialCaption(
        "Real impact. Real teammates. Real growth.",
        "Pass this careers pack to someone exploring their next move.",
        tags,
      ),
      formatSocialCaption(
        "Employee shares beat cold job posts every time.",
        "Pick a caption, grab the assets, post to your network.",
        tags,
      ),
      formatSocialCaption(
        "Culture shows up in how we talk about work.",
        "Sharing Duke Health careers with my LinkedIn network today.",
        tags,
      ),
      formatSocialCaption(
        "Know someone looking for meaningful work in healthcare?",
        "Easy share pack — takes a minute to post.",
        tags,
      ),
      formatSocialCaption(
        "Great roles, real impact.",
        "Explore what's open at Duke Health and share with your network.",
        tags,
      ),
      formatSocialCaption(
        "Referrals matter here.",
        "Help us reach great candidates — captions and assets in the pack.",
        tags,
      ),
      formatSocialCaption(
        "I'm sharing this because I'd want someone to share it with me.",
        "Duke Health careers — link below.",
        tags,
      ),
    ],
  };

  return linesByTheme[theme].map((text, index) => ({
    id: `cap-ai-${theme}-${index + 1}`,
    text,
  }));
};

/** Mock AI: map an employee advocacy brief to template, captions, CTA, audience, and asset. */
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
    testimonial: "tmpl-milestone",
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
    testimonial: "asset-marcus",
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
    testimonial: ["hiring-managers"],
    general: ["all"],
  };

  let ctaDestinationType: AmplifySharePackDraft["ctaDestinationType"] = "page";
  let ctaPageValue = cmsDestinationPages[1].value;
  let ctaJobValue = ctaJobOptions[0].value;
  let ctaEventValue = ctaEventOptions[0].value;
  let ctaBlogValue = ctaBlogOptions[0].value;
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
  } else if (includesAny(text, ["blog", "article", "blog post", "story post"])) {
    ctaDestinationType = "blog";
    ctaBlogValue = ctaBlogOptions[0].value;
  }

  const urlInBrief = trimmed.match(/https?:\/\/[^\s)]+/i)?.[0];
  if (urlInBrief) {
    const pageMatch = cmsDestinationPages.find((page) => page.value === urlInBrief);
    const jobMatch = ctaJobOptions.find((job) => job.value === urlInBrief);
    const eventMatch = ctaEventOptions.find((event) => event.value === urlInBrief);
    const blogMatch = ctaBlogOptions.find((blog) => blog.value === urlInBrief);
    if (pageMatch) {
      ctaDestinationType = "page";
      ctaPageValue = pageMatch.value;
    } else if (jobMatch) {
      ctaDestinationType = "job";
      ctaJobValue = jobMatch.value;
    } else if (eventMatch) {
      ctaDestinationType = "event";
      ctaEventValue = eventMatch.value;
    } else if (blogMatch) {
      ctaDestinationType = "blog";
      ctaBlogValue = blogMatch.value;
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
    ctaBlogValue,
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

export const isVideoRequest = (pack: SharePack) => Boolean(pack.videoRequest);

export const getVideoRequestTableStatus = (pack: SharePack) => {
  const classNameByStatus: Record<SharePack["status"], string> = {
    draft: "draft",
    needs_approval: "review",
    ready: "published",
    sent: "sent",
    archived: "completed",
  };
  return {
    label: statusLabel[pack.status],
    className: classNameByStatus[pack.status],
  };
};

export const getVideoSubmissions = (pack: SharePack): VideoSubmission[] => pack.submissions || [];

export const countVideoSubmissionsByStatus = (submissions: VideoSubmission[], status: VideoSubmissionStatus) =>
  submissions.filter((submission) => submission.status === status).length;

export const withDemoVideoSubmissions = (pack: SharePack): SharePack => {
  if (!pack.videoRequest || pack.submissions?.length) return pack;
  const demoSubmissions = demoVideoSubmissionsByRequestId[pack.id];
  if (!demoSubmissions?.length) return pack;
  return { ...pack, submissions: demoSubmissions };
};

export const channelLabel: Record<AmplifyChannel, string> = {
  email: "Email",
  slack: "Slack",
  teams: "MS Teams",
};
